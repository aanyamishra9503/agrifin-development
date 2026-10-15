'use client'

import { CircleCheck, CircleDashed, CircleDot } from 'lucide-react'
import { usePreferences } from '@/components/providers/preferences-provider'
import type { SaleStatus } from '@/lib/finance'
import { cn } from '@/lib/utils'

const STYLES: Record<SaleStatus, { className: string; icon: typeof CircleCheck }> = {
  paid: { className: 'bg-success-soft text-secondary-foreground', icon: CircleCheck },
  partial: { className: 'bg-warning-soft text-warning', icon: CircleDot },
  unpaid: { className: 'bg-destructive-soft text-destructive', icon: CircleDashed },
}

export function StatusBadge({ status, className }: { status: SaleStatus; className?: string }) {
  const { t } = usePreferences()
  const { className: tone, icon: Icon } = STYLES[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-semibold whitespace-nowrap',
        tone,
        className,
      )}
    >
      <Icon className="size-4" aria-hidden="true" />
      {t(`status.${status}`)}
    </span>
  )
}
