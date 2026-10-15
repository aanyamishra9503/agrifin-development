import type { ISODate } from './types'
import type { Locale } from './i18n'

export function todayISO(): ISODate {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60_000
  return new Date(now.getTime() - offset).toISOString().slice(0, 10)
}

/** ISO dates compare correctly as strings. */
export function isWithin(date: ISODate, start: ISODate, end: ISODate) {
  return date >= start && date <= end
}

export function monthKey(date: ISODate) {
  return date.slice(0, 7)
}

/** Every YYYY-MM key from start to end inclusive. */
export function monthsBetween(start: ISODate, end: ISODate): string[] {
  const months: string[] = []
  let [year, month] = start.slice(0, 7).split('-').map(Number)
  const [endYear, endMonth] = end.slice(0, 7).split('-').map(Number)
  while (year < endYear || (year === endYear && month <= endMonth)) {
    months.push(`${year}-${String(month).padStart(2, '0')}`)
    month += 1
    if (month > 12) {
      month = 1
      year += 1
    }
  }
  return months
}

function localeTag(locale: Locale) {
  return locale === 'ta' ? 'ta-IN' : 'en-IN'
}

export function formatDate(date: ISODate, locale: Locale) {
  return new Intl.DateTimeFormat(localeTag(locale), {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`))
}

export function formatMonth(key: string, locale: Locale) {
  return new Intl.DateTimeFormat(localeTag(locale), {
    month: 'short',
    timeZone: 'UTC',
  }).format(new Date(`${key}-01T00:00:00Z`))
}

export function addDays(date: ISODate, days: number): ISODate {
  const d = new Date(`${date}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}
