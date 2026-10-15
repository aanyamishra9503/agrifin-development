'use client'

import Link from 'next/link'
import { ChevronRight, HandCoins, Receipt, Wallet, type LucideIcon } from 'lucide-react'
import { usePreferences } from '@/components/providers/preferences-provider'
import type { TranslationKey } from '@/lib/i18n'
import { cn } from '@/lib/utils'

const ACTIONS: { href: string; label: TranslationKey; hint: TranslationKey; icon: LucideIcon; tone: string }[] = [
  {
    href: '/expenses/new',
    label: 'dashboard.addExpense',
    hint: 'dashboard.addExpenseHint',
    icon: Receipt,
    tone: 'bg-earth-soft text-earth',
  },
  {
    href: '/sales/new',
    label: 'dashboard.recordSale',
    hint: 'dashboard.recordSaleHint',
    icon: HandCoins,
    tone: 'bg-secondary text-primary',
  },
  {
    href: '/sales/payment',
    label: 'dashboard.receivePayment',
    hint: 'dashboard.receivePaymentHint',
    icon: Wallet,
    tone: 'bg-warning-soft text-warning',
  },
]

export function QuickActions() {
  const { t } = usePreferences()
  return (
    <section aria-labelledby="quick-actions-heading">
      <h2 id="quick-actions-heading" className="mb-3 text-lg font-semibold">
        {t('dashboard.quickActions')}
      </h2>
      <ul className="grid gap-3 sm:grid-cols-3">
        {ACTIONS.map((action) => {
          const Icon = action.icon
          return (
            <li key={action.href}>
              <Link
                href={action.href}
                className="group flex min-h-20 items-center gap-4 rounded-2xl border-2 border-border bg-card p-4 transition-colors hover:border-primary focus-visible:border-primary"
              >
                <span className={cn('flex size-12 shrink-0 items-center justify-center rounded-xl', action.tone)}>
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-lg font-semibold leading-tight">{t(action.label)}</span>
                  <span className="text-sm text-muted-foreground">{t(action.hint)}</span>
                </span>
                <ChevronRight
                  className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
