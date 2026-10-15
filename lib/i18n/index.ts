import { en, type Dictionary } from './en'
import { ta } from './ta'

export const LOCALES = ['en', 'ta'] as const
export type Locale = (typeof LOCALES)[number]

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  ta: 'தமிழ்',
}

export const dictionaries: Record<Locale, Dictionary> = { en, ta }

type Paths<T> = {
  [K in keyof T & string]: T[K] extends string ? K : `${K}.${Paths<T[K]>}`
}[keyof T & string]

export type TranslationKey = Paths<Dictionary>
export type TranslationVars = Record<string, string | number>

export function translate(locale: Locale, key: TranslationKey, vars?: TranslationVars): string {
  const value = key
    .split('.')
    .reduce<unknown>((node, part) => (node as Record<string, unknown> | undefined)?.[part], dictionaries[locale])
  const template = typeof value === 'string' ? value : key
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  )
}
