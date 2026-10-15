'use client'

import { Clock, Receipt, TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react'
import { usePreferences } from '@/components/providers/preferences-provider'
import { useFormat } from '@/components/shared/use-format'
import { balanceDueForSale, expensesForCycle, salesForCycle, type CycleSummary } from '@/lib/finance'
import type { FarmSnapshot } from '@/lib/types'
import { cn } from '@/lib/utils'

function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
  variant,
}: {
  label: string
  value: string
  hint: string
  icon: LucideIcon
  variant: 'primary' | 'warning' | 'earth'
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-2xl border p-5',
        variant === 'primary' && 'border-primary bg-primary text-primary-foreground',
        variant === 'warning' && 'border-border bg-card',
        variant === 'earth' && 'border-border bg-card',
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className={cn('text-base font-semibold', variant !== 'primary' && 'text-muted-foreground')}>
          {label}
        </h2>
        <span
          className={cn(
            'flex size-10 items-center justify-center rounded-xl',
            variant === 'primary' && 'bg-primary-foreground/15',
            variant === 'warning' && 'bg-warning-soft text-warning',
            variant === 'earth' && 'bg-earth-soft text-earth',
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </div>
      <p className="text-3xl font-bold tabular-nums tracking-tight md:text-4xl">{value}</p>
      <p className={cn('text-sm', variant === 'primary' ? 'text-primary-foreground/85' : 'text-muted-foreground')}>
        {hint}
      </p>
    </div>
  )
}

export function MetricCards({
  summary,
  data,
  cycleId,
}: {
  summary: CycleSummary
  data: FarmSnapshot
  cycleId: string
}) {
  const { t } = usePreferences()
  const { money } = useFormat()
  const unpaidCount = salesForCycle(cycleId, data.sales).filter(
    (sale) => balanceDueForSale(sale, data.payments) > 0,
  ).length
  const expenseCount = expensesForCycle(cycleId, data.expenses).length
  const isLoss = summary.netIncome < 0

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <MetricCard
        label={t('dashboard.netIncome')}
        value={money(summary.netIncome)}
        hint={t('dashboard.netIncomeHint')}
        icon={isLoss ? TrendingDown : TrendingUp}
        variant="primary"
      />
      <MetricCard
        label={t('dashboard.pending')}
        value={money(summary.pending)}
        hint={unpaidCount > 0 ? t('dashboard.pendingHint', { count: unpaidCount }) : t('dashboard.pendingNone')}
        icon={Clock}
        variant="warning"
      />
      <MetricCard
        label={t('dashboard.operationalCosts')}
        value={money(summary.operationalCost)}
        hint={t('dashboard.costsHint', { count: expenseCount })}
        icon={Receipt}
        variant="earth"
      />
    </div>
  )
}
