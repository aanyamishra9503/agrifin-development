
'use client'

import { useEffect, useState } from 'react'
import { usePreferences } from '@/components/providers/preferences-provider'
import { PageHeader, SectionCard } from '@/components/shared/page-header'
import { createClient } from '@/lib/supabase/client'

export default function SettingsPage() {
  const {
    t,
    locale,
    setLocale,
    profile,
    setProfile,
  } = usePreferences()

  const [name, setName] = useState(profile.name)
  const [village, setVillage] = useState(profile.village)
  const [message, setMessage] = useState('')
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadProfile() {
      try {
        const supabase = createClient()
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError) throw authError

        if (!user) {
          if (!cancelled) {
            setMessage('Please sign in to load and save your farmer details.')
          }
          return
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, village, preferred_language')
          .eq('id', user.id)
          .maybeSingle()

        if (error) throw error
        if (cancelled) return

        const savedName =
          data?.full_name || String(user.user_metadata?.full_name ?? '')
        const savedVillage = data?.village ?? ''

        setName(savedName)
        setVillage(savedVillage)
        setProfile({ name: savedName, village: savedVillage })

        if (
          data?.preferred_language === 'en' ||
          data?.preferred_language === 'ta'
        ) {
          setLocale(data.preferred_language)
        }
      } catch (error) {
        if (!cancelled) {
          setMessage(
            error instanceof Error
              ? `Could not load profile: ${error.message}`
              : 'Could not load your profile.',
          )
        }
      } finally {
        if (!cancelled) setLoadingProfile(false)
      }
    }

    void loadProfile()

    return () => {
      cancelled = true
    }
  }, [setLocale, setProfile])

  async function handleLanguageChange(nextLocale: typeof locale) {
    setLocale(nextLocale)
    setMessage('')

    try {
      const supabase = createClient()
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError) throw authError
      if (!user) return

      const { error } = await supabase
        .from('profiles')
        .update({ preferred_language: nextLocale })
        .eq('id', user.id)

      if (error) throw error
    } catch (error) {
      setMessage(
        error instanceof Error
          ? `Language changed for this session, but could not be saved: ${error.message}`
          : 'Language changed for this session, but could not be saved.',
      )
    }
  }

  async function handleSave() {
    if (!name.trim() || !village.trim()) {
      setMessage(t('errors.nameRequired'))
      return
    }

    setSaving(true)
    setMessage('')

    try {
      const supabase = createClient()
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError) throw authError
      if (!user) {
        throw new Error('Please sign in before saving your profile.')
      }

      const savedName = name.trim()
      const savedVillage = village.trim()

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(
          {
            id: user.id,
            full_name: savedName,
            village: savedVillage,
            preferred_language: locale,
          },
          { onConflict: 'id' },
        )

      if (profileError) throw profileError

      const { error: farmError } = await supabase
        .from('farms')
        .update({ village: savedVillage })
        .eq('owner_id', user.id)

      if (farmError) throw farmError

      setProfile({ name: savedName, village: savedVillage })
      setMessage(t('settings.profileSaved'))
    } catch (error) {
      setMessage(
        error instanceof Error
          ? `Could not save your details: ${error.message}`
          : 'Could not save your details.',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t('settings.title')}
        subtitle={t('settings.subtitle')}
      />

      <SectionCard
        title={t('settings.language')}
        description={t('settings.languageHint')}
      >
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void handleLanguageChange('en')}
            aria-pressed={locale === 'en'}
            className={`min-h-12 rounded-xl border px-5 py-3 font-medium ${
              locale === 'en'
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background'
            }`}
          >
            English
          </button>

          <button
            type="button"
            onClick={() => void handleLanguageChange('ta')}
            aria-pressed={locale === 'ta'}
            className={`min-h-12 rounded-xl border px-5 py-3 font-medium ${
              locale === 'ta'
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background'
            }`}
          >
            தமிழ்
          </button>
        </div>
      </SectionCard>

      <SectionCard
        title={t('settings.profile')}
        description={t('settings.subtitle')}
      >
        <div className="flex flex-col gap-4">
          {loadingProfile && (
            <p className="text-sm text-muted-foreground">
              Loading your saved details...
            </p>
          )}

          <label className="flex flex-col gap-2 text-sm font-medium">
            {t('settings.farmerName')}
            <input
              value={name}
              onChange={(event) => {
                setName(event.target.value)
                setMessage('')
              }}
              className="min-h-12 rounded-xl border border-border bg-background px-3 text-base"
              autoComplete="name"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium">
            {t('settings.village')}
            <input
              value={village}
              onChange={(event) => {
                setVillage(event.target.value)
                setMessage('')
              }}
              className="min-h-12 rounded-xl border border-border bg-background px-3 text-base"
              autoComplete="address-level2"
            />
          </label>

          <div>
            <button
              type="button"
              onClick={handleSave}
              disabled={loadingProfile || saving}
              className="min-h-12 rounded-xl bg-primary px-5 font-semibold text-primary-foreground disabled:opacity-50"
            >
              {saving ? 'Saving...' : t('settings.saveProfile')}
            </button>
          </div>
        </div>
      </SectionCard>

      <SectionCard title={t('settings.dataTitle')}>
        <p className="text-sm text-muted-foreground">
          {t('settings.dataNotice')}
        </p>
      </SectionCard>

      <SectionCard title={t('settings.offlineTitle')}>
        <p className="text-sm text-muted-foreground">
          {t('settings.offlineNotice')}
        </p>
      </SectionCard>

      {message && (
        <p role="status" className="text-sm text-muted-foreground">
          {message}
        </p>
      )}
    </div>
  )
}
