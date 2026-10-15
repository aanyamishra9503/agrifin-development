'use client'

import { useState } from 'react'
import { usePreferences } from '@/components/providers/preferences-provider'
import { ValidationError } from '@/lib/data/data-source'
import type { TranslationKey } from '@/lib/i18n'
import { hasErrors, type FieldErrors } from '@/lib/validation'

/**
 * Shared submit flow: client validation → save → server-side validation
 * errors mapped back onto fields. Field errors hold translation keys so they
 * re-render correctly when the language changes.
 */
export function useFormSubmit<F extends string>() {
  const { t } = usePreferences()
  const [errors, setErrors] = useState<FieldErrors<F>>({})
  const [bannerKey, setBannerKey] = useState<TranslationKey | null>(null)
  const [saving, setSaving] = useState(false)

  async function submit(clientErrors: FieldErrors<F>, save: () => Promise<void>) {
    if (saving) return
    setErrors(clientErrors)
    if (hasErrors(clientErrors)) {
      setBannerKey('errors.fixFields')
      return
    }
    setBannerKey(null)
    setSaving(true)
    try {
      await save()
    } catch (error) {
      if (error instanceof ValidationError) {
        setErrors(error.fieldErrors as FieldErrors<F>)
        setBannerKey('errors.fixFields')
      } else {
        setBannerKey('errors.generic')
      }
      setSaving(false)
    }
  }

  const fieldError = (field: F) => {
    const key = errors[field]
    return key ? t(key) : undefined
  }

  return {
    submit,
    saving,
    fieldError,
    banner: bannerKey ? t(bannerKey) : undefined,
  }
}
