import { ChartColumn, HandCoins, LayoutDashboard, Receipt, Settings, Sprout, type LucideIcon } from 'lucide-react'
import type { TranslationKey } from '@/lib/i18n'

export interface NavItem {
  href: string
  label: TranslationKey
  shortLabel?: TranslationKey
  icon: LucideIcon
  /** Shown in the mobile bottom bar (max 5) */
  mobile: boolean
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'nav.dashboard', icon: LayoutDashboard, mobile: true },
  { href: '/crops', label: 'nav.crops', icon: Sprout, mobile: true },
  { href: '/expenses', label: 'nav.expenses', icon: Receipt, mobile: true },
  { href: '/sales', label: 'nav.sales', shortLabel: 'nav.salesShort', icon: HandCoins, mobile: true },
  { href: '/reports', label: 'nav.reports', icon: ChartColumn, mobile: true },
  { href: '/settings', label: 'nav.settings', icon: Settings, mobile: false },
]

export function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)
}
