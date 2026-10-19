'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { Info, LogOut, Settings, Tractor } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { usePreferences } from '@/components/providers/preferences-provider'
import { LanguageToggle } from '@/components/shared/language-toggle'
import { cn } from '@/lib/utils'
import { NAV_ITEMS, isActive } from './nav-items'

function Logo() {

  const { t } = usePreferences()
  return (
    <Link href="/" className="flex items-center gap-2.5 rounded-lg">
      <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <Tractor className="size-6" aria-hidden="true" />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-lg font-bold tracking-tight">{t('app.name')}</span>
        <span className="hidden text-xs text-muted-foreground sm:inline">{t('app.tagline')}</span>
      </span>
    </Link>
  )
}

function SignOutButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter()
  const { locale } = usePreferences()
  const [busy, setBusy] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const label = locale === 'ta' ? 'வெளியேறு' : 'Sign out'

  async function handleSignOut() {
  setBusy(true)
  setErrorMessage('')

  try {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()

    if (error) throw error

    router.replace('/login')
    router.refresh()
  } catch (error) {
    setErrorMessage(
      error instanceof Error ? error.message : 'Could not sign out.',
    )
  } finally {
    // Always reset the button, whether sign-out succeeds or fails.
    setBusy(false)
  }
}

  return (
    <div className={compact ? 'flex flex-col items-center' : 'w-full'}>
      <button
        type="button"
        onClick={handleSignOut}
        disabled={busy}
        aria-label={label}
        title={label}
        className={`flex min-h-11 items-center gap-3 rounded-xl border border-border px-3 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50 ${
          compact ? 'size-11 justify-center px-0' : 'w-full'
        }`}
      >
        <LogOut className="size-5 shrink-0" aria-hidden="true" />
        {!compact && (
          <span>
            {busy
              ? locale === 'ta'
                ? 'வெளியேறுகிறது...'
                : 'Signing out...'
              : label}
          </span>
        )}
      </button>

      {errorMessage && (
        <p role="alert" className="mt-2 text-xs text-destructive">
          {errorMessage}
        </p>
      )}
    </div>
  )
}


function SidebarNav() {
  const pathname = usePathname()
  const { t } = usePreferences()
  return (
    <aside className="no-print sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-border bg-card px-4 py-6 lg:flex">
      <div className="px-2">
        <Logo />
      </div>
      <nav aria-label={t('nav.mainNavigation')} className="mt-8 flex-1">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href)
            const Icon = item.icon
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex h-12 items-center gap-3 rounded-xl px-3 text-base font-medium transition-colors',
                    active ? 'bg-secondary text-secondary-foreground' : 'text-foreground hover:bg-muted',
                  )}
                >
                  <Icon className={cn('size-5', active && 'text-primary')} aria-hidden="true" />
                  {t(item.label)}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      <LanguageToggle className="px-2" />
      <div className="mt-3 px-2">
        <SignOutButton />
      </div>
    </aside>
  )
}

function MobileTopBar() {
  const { t } = usePreferences()
  const pathname = usePathname()
  return (
    <header className="no-print sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-border bg-card/95 px-4 py-2.5 backdrop-blur lg:hidden">
      <Logo />
      <div className="flex items-center gap-1">
        <LanguageToggle />
        <div className="flex items-center gap-1">
           <LanguageToggle />
           <SignOutButton compact />
        </div>
        <Link
          href="/settings"
          aria-current={isActive(pathname, '/settings') ? 'page' : undefined}
          className="flex size-11 items-center justify-center rounded-xl text-foreground hover:bg-muted aria-[current=page]:bg-secondary aria-[current=page]:text-primary"
        >
          <Settings className="size-6" aria-hidden="true" />
          <span className="sr-only">{t('nav.settings')}</span>
        </Link>
      </div>
    </header>
  )
}

function BottomNav() {
  const pathname = usePathname()
  const { t } = usePreferences()
  return (
    <nav
      aria-label={t('nav.mainNavigation')}
      className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="grid grid-cols-5">
        {NAV_ITEMS.filter((item) => item.mobile).map((item) => {
          const active = isActive(pathname, item.href)
          const Icon = item.icon
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex h-16 flex-col items-center justify-center gap-1 px-1 text-xs font-medium leading-tight',
                  active ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                <span
                  className={cn(
                    'flex h-8 w-12 items-center justify-center rounded-full transition-colors',
                    active && 'bg-secondary',
                  )}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="line-clamp-1 text-center">{t(item.shortLabel ?? item.label)}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { t } = usePreferences()
  return (
    <div className="flex min-h-dvh">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        {t('app.skipToContent')}
      </a>
      <SidebarNav />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileTopBar />
        <p className="no-print flex items-center gap-2 border-b border-border bg-warning-soft px-4 py-2 text-sm text-foreground lg:px-8">
          <Info className="size-4 shrink-0 text-warning" aria-hidden="true" />
          {t('app.prototypeNotice')}
        </p>
        <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-6 lg:px-8 lg:pb-12">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
