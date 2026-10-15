'use client'

import { usePreferences } from '@/components/providers/preferences-provider'
import { useFormat } from '@/components/shared/use-format'
import type { MonthlyPoint } from '@/lib/finance'

/**
 * Lightweight CSS bar chart (no charting library) to keep the bundle small
 * on slow connections. A visually hidden table carries the exact values.
 */
export function MonthlyChart({ points }: { points: MonthlyPoint[] }) {
  const { t } = usePreferences()
  const { money, moneyCompact, month } = useFormat()
  const max = Math.max(1, ...points.flatMap((p) => [p.income, p.expense]))

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-4 text-sm" aria-hidden="true">
        <span className="flex items-center gap-2">
          <span className="size-3 rounded-sm bg-chart-1" />
          {t('dashboard.sales')}
        </span>
        <span className="flex items-center gap-2">
          <span className="size-3 rounded-sm bg-chart-2" />
          {t('dashboard.costs')}
        </span>
      </div>
      <div className="flex h-56 items-end gap-2 border-b border-border sm:gap-4" aria-hidden="true">
        {points.map((point) => (
          <div key={point.month} className="flex h-full flex-1 flex-col justify-end">
            <div className="flex h-full items-end justify-center gap-1">
              <div
                className="w-full max-w-7 rounded-t-md bg-chart-1"
                style={{ height: `${Math.max(point.income > 0 ? 2 : 0, (point.income / max) * 100)}%` }}
                title={money(point.income)}
              />
              <div
                className="w-full max-w-7 rounded-t-md bg-chart-2"
                style={{ height: `${Math.max(point.expense > 0 ? 2 : 0, (point.expense / max) * 100)}%` }}
                title={money(point.expense)}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-2 sm:gap-4" aria-hidden="true">
        {points.map((point) => (
          <div key={point.month} className="flex flex-1 flex-col items-center text-center">
            <span className="text-sm font-medium">{month(point.month)}</span>
            <span className="hidden text-xs tabular-nums text-muted-foreground sm:block">
              {moneyCompact(point.income - point.expense)}
            </span>
          </div>
        ))}
      </div>
      <table className="sr-only">
        <caption>{t('dashboard.monthlyChart')}</caption>
        <thead>
          <tr>
            <th scope="col">{t('common.date')}</th>
            <th scope="col">{t('dashboard.sales')}</th>
            <th scope="col">{t('dashboard.costs')}</th>
          </tr>
        </thead>
        <tbody>
          {points.map((point) => (
            <tr key={point.month}>
              <th scope="row">{month(point.month)}</th>
              <td>{money(point.income)}</td>
              <td>{money(point.expense)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
