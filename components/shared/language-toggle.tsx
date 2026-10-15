'use client'

import { Languages } from 'lucide-react'
import { usePreferences } from '@/components/providers/preferences-provider'
import { LOCALE_LABELS, LOCALES } from '@/lib/i18n'
import { cn } from '@/lib/utils'

export function LanguageToggle({ className, size = 'md' }: { className?: string; size?: 'md' | 'lg' }) {
  const { locale, setLocale, t } = usePreferences()
  return (
    <div role="group" aria-label={t('common.language')} className={cn('flex items-center gap-1', className)}>
      <Languages className="hidden size-5 shrink-0 text-muted-foreground sm:block" aria-hidden="true" />
      <div className="flex rounded-xl border border-border bg-muted p-1">
        {LOCALES.map((code) => (
          <button
            key={code}
            type="button"
            lang={code}
            aria-pressed={locale === code}
            onClick={() => setLocale(code)}
            className={cn(
              'rounded-lg px-3 font-semibold transition-colors',
              size === 'lg' ? 'h-12 min-w-28 text-base' : 'h-9 text-sm',
              locale === code
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-foreground hover:bg-background',
            )}
          >
            {LOCALE_LABELS[code]}
          </button>
        ))}
      </div>
    </div>
  )
}
