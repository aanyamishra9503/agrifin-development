import type { Paise } from './types'
import type { Locale } from './i18n'

/** Parse a user-typed rupee amount ("1,250.50") into integer paise. Returns null if invalid. */
export function parseRupeesToPaise(input: string): Paise | null {
  const cleaned = input.replace(/[,\s₹]/g, '')
  if (cleaned === '' || !/^\d+(\.\d{0,2})?$/.test(cleaned)) return null
  const [whole, fraction = ''] = cleaned.split('.')
  const paise = Number(whole) * 100 + Number(fraction.padEnd(2, '0'))
  return Number.isSafeInteger(paise) ? paise : null
}

const formatters = new Map<string, Intl.NumberFormat>()

function getFormatter(locale: Locale, compact: boolean) {
  const key = `${locale}-${compact}`
  let formatter = formatters.get(key)
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale === 'ta' ? 'ta-IN' : 'en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: compact ? 1 : 0,
      notation: compact ? 'compact' : 'standard',
      numberingSystem: 'latn',
    })
    formatters.set(key, formatter)
  }
  return formatter
}

export function formatINR(paise: Paise, locale: Locale, options: { compact?: boolean } = {}) {
  return getFormatter(locale, options.compact ?? false).format(paise / 100)
}

export function formatNumber(value: number, locale: Locale) {
  return new Intl.NumberFormat(locale === 'ta' ? 'ta-IN' : 'en-IN', {
    maximumFractionDigits: 2,
    numberingSystem: 'latn',
  }).format(value)
}
