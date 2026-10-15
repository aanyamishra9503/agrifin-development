'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { DEFAULT_CYCLE_ID } from '@/lib/data/sample-data'
import { translate, type Locale, type TranslationKey, type TranslationVars } from '@/lib/i18n'
import type { LocalizedText } from '@/lib/types'

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
