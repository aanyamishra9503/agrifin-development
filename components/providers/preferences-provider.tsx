'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { DEFAULT_CYCLE_ID } from '@/lib/data/sample-data'
import { translate, type Locale, type TranslationKey, type TranslationVars } from '@/lib/i18n'
import type { LocalizedText } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'

export interface FarmerProfile {
  name: string
  village: string
}

interface PreferencesValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: TranslationKey, vars?: TranslationVars) => string
  /** Pick the current-language version of a localized data field */
  l: (text: LocalizedText) => string
  profile: FarmerProfile
  setProfile: (profile: FarmerProfile) => void
  selectedCycleId: string
  setSelectedCycleId: (id: string) => void
}

const PreferencesContext = createContext<PreferencesValue | null>(null)

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>('en')
  const [profile, setProfile] = useState<FarmerProfile>({ name: 'Selvam', village: 'Thiruvaiyaru' })
  const [selectedCycleId, setSelectedCycleId] = useState(DEFAULT_CYCLE_ID)

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])
  useEffect(() => {
  let cancelled = false
  const supabase = createClient()

  async function loadSavedProfile(
    userId: string,
    fallbackName: string,
  ) {
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, village, preferred_language')
      .eq('id', userId)
      .maybeSingle()

    if (error) throw error
    if (cancelled) return

    const savedName = data?.full_name || fallbackName
    const savedVillage = data?.village ?? ''

    setProfile({
      name: savedName,
      village: savedVillage,
    })

    if (
      data?.preferred_language === 'en' ||
      data?.preferred_language === 'ta'
    ) {
      setLocale(data.preferred_language)
    }
  }

  function reportError(error: unknown) {
    if (!cancelled) {
      console.error('Could not load saved farmer profile:', error)
    }
  }

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    if (!session?.user) return

    const userId = session.user.id
    const fallbackName = String(
      session.user.user_metadata?.full_name ?? '',
    )

    // Run after the auth callback completes.
    window.setTimeout(() => {
      void loadSavedProfile(userId, fallbackName).catch(reportError)
    }, 0)
  })

  void supabase.auth
    .getSession()
    .then(({ data, error }) => {
      if (error) throw error

      const user = data.session?.user
      if (user) {
        return loadSavedProfile(
          user.id,
          String(user.user_metadata?.full_name ?? ''),
        )
      }
    })
    .catch(reportError)

  return () => {
    cancelled = true
    subscription.unsubscribe()
  }
}, [setLocale, setProfile])
  const t = useCallback(
    (key: TranslationKey, vars?: TranslationVars) => translate(locale, key, vars),
    [locale],
  )
  const l = useCallback((text: LocalizedText) => text[locale], [locale])

  const value = useMemo(
    () => ({ locale, setLocale, t, l, profile, setProfile, selectedCycleId, setSelectedCycleId }),
    [locale, t, l, profile, selectedCycleId],
  )

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
}

export function usePreferences() {
  const context = useContext(PreferencesContext)
  if (!context) throw new Error('usePreferences must be used inside PreferencesProvider')
  return context
}
