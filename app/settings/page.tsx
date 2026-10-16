
'use client'

import { useState } from 'react'
import { usePreferences } from '@/components/providers/preferences-provider'
import { PageHeader, SectionCard } from '@/components/shared/page-header'

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

  function handleSave() {
    if (!name.trim() || !village.trim()) {
      setMessage(t('errors.nameRequired'))
      return
    }

    setProfile({
      name: name.trim(),
      village: village.trim(),
    })

    setMessage(t('settings.profileSaved'))
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
            onClick={() => {
              setLocale('en')
              setMessage('')
            }}
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
            onClick={() => {
              setLocale('ta')
              setMessage('')
            }}
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
              className="min-h-12 rounded-xl bg-primary px-5 font-semibold text-primary-foreground"
            >
              {t('settings.saveProfile')}
            </button>
          </div>

          {message && (
            <p role="status" className="text-sm text-muted-foreground">
              {message}
            </p>
          )}
        </div>
      </SectionCard>

      <SectionCard
        title={t('settings.dataTitle')}
        description={t('settings.dataNotice')}
      >
        <p className="text-sm text-muted-foreground">
            Your entries are stored temporarily in memory.
        </p>
      </SectionCard>

      <SectionCard
        title={t('settings.offlineTitle')}
      >
        <p className="text-sm text-muted-foreground">
          {t('settings.offlineNotice')}
        </p>
      </SectionCard>
    </div>
  )
}
