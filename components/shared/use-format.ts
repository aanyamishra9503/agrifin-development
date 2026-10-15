'use client'

import { useMemo } from 'react'
import { usePreferences } from '@/components/providers/preferences-provider'
import { formatDate, formatMonth } from '@/lib/dates'
import { formatINR, formatNumber } from '@/lib/money'
import type { ISODate, Paise } from '@/lib/types'

export function useFormat() {
  const { locale } = usePreferences()
  return useMemo(
    () => ({
      money: (paise: Paise) => formatINR(paise, locale),
      moneyCompact: (paise: Paise) => formatINR(paise, locale, { compact: true }),
      number: (value: number) => formatNumber(value, locale),
      date: (date: ISODate) => formatDate(date, locale),
      month: (key: string) => formatMonth(key, locale),
    }),
    [locale],
  )
}
