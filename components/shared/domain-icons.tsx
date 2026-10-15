import {
  Banana,
  Bug,
  Droplets,
  Ellipsis,
  FlaskConical,
  Flower2,
  Leaf,
  Nut,
  Sprout,
  Tractor,
  Truck,
  Users,
  Wheat,
  type LucideIcon,
} from 'lucide-react'
import type { CropIcon, ExpenseCategory } from '@/lib/types'
import { cn } from '@/lib/utils'

export const CATEGORY_ICONS: Record<ExpenseCategory, LucideIcon> = {
  seeds: Sprout,
  fertilizer: FlaskConical,
  pesticides: Bug,
  labour: Users,
  irrigation: Droplets,
  transport: Truck,
  other: Ellipsis,
}

export const CROP_ICONS: Record<CropIcon, LucideIcon> = {
  wheat: Wheat,
  sprout: Sprout,
  banana: Banana,
  nut: Nut,
  leaf: Leaf,
  flower: Flower2,
}

export const GENERAL_FARM_ICON = Tractor

export function IconBadge({
  icon: Icon,
  tone = 'green',
  className,
}: {
  icon: LucideIcon
  tone?: 'green' | 'earth' | 'warning'
  className?: string
}) {
  return (
    <span
      className={cn(
        'flex size-11 shrink-0 items-center justify-center rounded-xl',
        tone === 'green' && 'bg-secondary text-primary',
        tone === 'earth' && 'bg-earth-soft text-earth',
        tone === 'warning' && 'bg-warning-soft text-warning',
        className,
      )}
    >
      <Icon className="size-5" aria-hidden="true" />
    </span>
  )
}
