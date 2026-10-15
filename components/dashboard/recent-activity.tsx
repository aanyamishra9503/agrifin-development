'use client'

import Link from 'next/link'
import { HandCoins, History, Wallet } from 'lucide-react'
import { usePreferences } from '@/components/providers/preferences-provider'
import { CATEGORY_ICONS, IconBadge } from '@/components/shared/domain-icons'
import { SectionCard } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/states'
import { useFormat } from '@/components/shared/use-format'
import { cycleActivity } from '@/lib/activity'
import type { FarmSnapshot } from '@/lib/types'
import { cn } from '@/lib/utils'

export function RecentActivity({ data, cycleId }: { data: FarmSnapshot; cycleId: string }) {
  const { t, l } = usePreferences()
  const { money, date } = useFormat()
  const items = cycleActivity(cycleId, data)
  const cropName = (cropId: string | null) => {
    const crop = cropId ? data.crops.find((c) => c.id === cropId) : undefined
    return crop ? l(crop.name) : t('common.generalFarm')
  }

  return (
    <SectionCard
      id="recent-activity"
      title={t('dashboard.recentActivity')}
      action={
        <Link href="/expenses" className="text-sm font-semibold text-primary underline-offset-4 hover:underline">
          {t('common.viewAll')}
        </Link>
      }
    >
      {items.length === 0 ? (
        <EmptyState icon={History} title={t('dashboard.noActivity')} />
      ) : (
        <ul className="-mx-2 flex flex-col">
          {items.map((item) => {
            const isIn = item.kind === 'payment'
            const isOut = item.kind === 'expense'
            let title: string
            let subtitle: string
            let badge: React.ReactNode
            if (item.kind === 'expense') {
              title = t(`categories.${item.expense.category}`)
              subtitle = cropName(item.expense.cropId)
              badge = <IconBadge icon={CATEGORY_ICONS[item.expense.category]} tone="earth" />
            } else if (item.kind === 'sale') {
              title = t('activity.sale', { crop: cropName(item.sale.cropId), buyer: item.sale.buyer })
              subtitle = t('sales.saleValue')
              badge = <IconBadge icon={HandCoins} />
            } else {
              title = t('activity.payment', { buyer: item.sale.buyer })
              subtitle = cropName(item.sale.cropId)
              badge = <IconBadge icon={Wallet} tone="warning" />
            }
            return (
              <li key={`${item.kind}-${item.id}`} className="flex items-center gap-3 rounded-xl px-2 py-3">
                {badge}
                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="truncate text-base font-semibold">{title}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {date(item.date)} · {subtitle}
                  </p>
                </div>
                <p
                  className={cn(
                    'shrink-0 text-base font-bold tabular-nums',
                    isIn && 'text-primary',
                    isOut && 'text-earth',
                  )}
                >
                  {isIn ? '+ ' : isOut ? '− ' : ''}
                  {money(item.amount)}
                </p>
              </li>
            )
          })}
        </ul>
      )}
    </SectionCard>
  )
}
