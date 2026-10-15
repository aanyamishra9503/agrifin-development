import { cn } from '@/lib/utils'

export function PageHeader({
  title,
  subtitle,
  actions,
  className,
}: {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between', className)}>
      <div className="flex flex-col gap-1">
        <h1 className="text-pretty text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
        {subtitle && <p className="text-pretty text-base text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </div>
  )
}

export function SectionCard({
  title,
  description,
  action,
  children,
  className,
  id,
}: {
  title?: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
  id?: string
}) {
  const headingId = id ? `${id}-heading` : undefined
  return (
    <section
      aria-labelledby={headingId}
      className={cn('rounded-2xl border border-border bg-card p-4 md:p-6', className)}
    >
      {(title || action) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            {title && (
              <h2 id={headingId} className="text-lg font-semibold">
                {title}
              </h2>
            )}
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}
