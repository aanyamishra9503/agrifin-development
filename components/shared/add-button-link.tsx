import Link from 'next/link'
import { Plus, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export function AddButtonLink({
  href,
  label,
  icon: Icon = Plus,
  variant = 'primary',
}: {
  href: string
  label: string
  icon?: LucideIcon
  variant?: 'primary' | 'outline'
}) {
  return (
    <Link
      href={href}
      className={cn(
        'flex h-14 items-center justify-center gap-2 rounded-xl px-6 text-lg font-semibold transition-colors',
        variant === 'primary'
          ? 'bg-primary text-primary-foreground hover:bg-primary/90'
          : 'border-2 border-primary bg-card text-primary hover:bg-secondary',
      )}
    >
      <Icon className="size-5" aria-hidden="true" />
      {label}
    </Link>
  )
}
