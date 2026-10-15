'use client'

import { CircleAlert, Inbox, type LucideIcon } from 'lucide-react'
import { usePreferences } from '@/components/providers/preferences-provider'
import { useFarmData } from '@/lib/data/use-farm-data'
import type { FarmSnapshot } from '@/lib/types'
import { cn } from '@/lib/utils'

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
  className,
}: {
  title: string
  description?: string
  icon?: LucideIcon
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-muted/50 px-6 py-10 text-center',
        className,
      )}
    >
      <span className="flex size-14 items-center justify-center rounded-full bg-card text-muted-foreground">
        <Icon className="size-7" aria-hidden="true" />
      </span>
      <div className="flex max-w-sm flex-col gap-1">
        <p className="text-base font-semibold">{title}</p>
        {description && <p className="text-pretty text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export function ErrorMessage({ message, className }: { message: string; className?: string }) {
  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive-soft px-4 py-3 text-destructive',
        className,
      )}
    >
      <CircleAlert className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <p className="text-base font-medium">{message}</p>
    </div>
  )
}

function LoadingSkeleton() {
  const { t } = usePreferences()
  return (
    <div aria-busy="true" className="flex flex-col gap-4">
      <span className="sr-only">{t('common.loading')}</span>
      <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-2xl bg-muted" />
    </div>
  )
}

/** Handles loading and error states once, then renders children with data. */
export function FarmDataGate({ children }: { children: (data: FarmSnapshot) => React.ReactNode }) {
  const { data, error, isLoading } = useFarmData()
  const { t } = usePreferences()
  if (error) return <ErrorMessage message={t('errors.loadFailed')} />
  if (isLoading || !data) return <LoadingSkeleton />
  return <>{children(data)}</>
}
