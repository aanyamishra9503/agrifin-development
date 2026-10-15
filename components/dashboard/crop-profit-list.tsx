'use client'

import { Sprout } from 'lucide-react'
import { usePreferences } from '@/components/providers/preferences-provider'
import { CROP_ICONS, GENERAL_FARM_ICON, IconBadge } from '@/components/shared/domain-icons'
import { EmptyState } from '@/components/shared/states'
import { useFormat } from '@/components/shared/use-format'
import { cropProfitability } from '@/lib/finance'
import type { FarmSnapshot } from '@/lib/types'
import { cn } from '@/lib/utils'

export function CropProfitList({ data, cycleId }: { data: FarmSnapshot; cycleId: string }) {
  const { t, l } = usePreferences()
  const { money } = useFormat()
  const { crops, sharedCost } = cropProfitability(cycleId, data)

  if (crops.length === 0) {
    return <EmptyState icon={Sprout} title={t('crops.emptyTitle')} description={t('crops.emptyDescription')} />
  }

  const maxValue = Math.max(1, ...crops.flatMap((c) => [c.revenue, c.cost]))

  return (
    <ul className="flex flex-col gap-4">
      {crops.map(({ crop, revenue, cost, net }) => (
        <li key={crop.id} className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <IconBadge icon={CROP_ICONS[crop.icon]} />
            <p className="min-w-0 flex-1 truncate text-base font-semibold">{l(crop.name)}</p>
            <p className="flex flex-col items-end">
              <span className="text-xs font-medium text-muted-foreground">
                {net >= 0 ? t('dashboard.profit') : t('dashboard.loss')}
              </span>
              <span className={cn('text-base font-bold tabular-nums', net >= 0 ? 'text-primary' : 'text-destructive')}>
                {money(net)}
              </span>
            </p>
          </div>
          <dl className="flex flex-col gap-1.5 pl-14 text-sm">
            <div className="flex items-center gap-2">
              <dt className="w-14 shrink-0 text-muted-foreground">{t('dashboard.sales')}</dt>
              <dd className="flex flex-1 items-center gap-2">
                <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <span
                    className="block h-full rounded-full bg-chart-1"
                    style={{ width: `${(revenue / maxValue) * 100}%` }}
                  />
                </span>
                <span className="w-24 text-right font-semibold tabular-nums">{money(revenue)}</span>
              </dd>
            </div>
            <div className="flex items-center gap-2">
              <dt className="w-14 shrink-0 text-muted-foreground">{t('dashboard.costs')}</dt>
              <dd className="flex flex-1 items-center gap-2">
                <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <span
                    className="block h-full rounded-full bg-chart-2"
                    style={{ width: `${(cost / maxValue) * 100}%` }}
                  />
                </span>
                <span className="w-24 text-right font-semibold tabular-nums">{money(cost)}</span>
              </dd>
            </div>
          </dl>
        </li>
      ))}
      {sharedCost > 0 && (
        <li className="flex items-center gap-3 rounded-xl bg-muted px-3 py-2.5">
          <GENERAL_FARM_ICON className="size-5 shrink-0 text-earth" aria-hidden="true" />
          <p className="min-w-0 flex-1 text-sm text-muted-foreground">{t('dashboard.sharedCosts')}</p>
          <p className="text-sm font-bold tabular-nums text-earth">{money(sharedCost)}</p>
        </li>
      )}
    </ul>
  )
}
