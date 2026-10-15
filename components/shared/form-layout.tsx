'use client'

import Link from 'next/link'
import { ArrowLeft, Check, CircleAlert, LoaderCircle } from 'lucide-react'
import { usePreferences } from '@/components/providers/preferences-provider'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/** Numbered step wrapper so long forms read as a short sequence of questions. */
export function FormStep({
  step,
  title,
  children,
}: {
  step: number
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="flex gap-3 sm:gap-4">
      <span
        aria-hidden="true"
        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-base font-bold text-primary-foreground"
      >
        {step}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-4 pb-2">
        <h2 className="pt-0.5 text-lg font-semibold">{title}</h2>
        {children}
      </div>
    </section>
  )
}

export function FormShell({
  title,
  backHref,
  onSubmit,
  children,
}: {
  title: string
  backHref: string
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  children: React.ReactNode
}) {
  const { t } = usePreferences()
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      <Link
        href={backHref}
        className="flex min-h-11 w-fit items-center gap-2 rounded-lg pr-3 text-base font-semibold text-primary hover:underline"
      >
        <ArrowLeft className="size-5" aria-hidden="true" />
        {t('common.back')}
      </Link>
      <h1 className="text-2xl font-bold text-balance md:text-3xl">{title}</h1>
      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-8 rounded-2xl border border-border bg-card p-4 sm:p-6">
        {children}
      </form>
    </div>
  )
}

export function FormBanner({ message }: { message?: string }) {
  if (!message) return null
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive-soft p-4 text-base font-medium text-destructive"
    >
      <CircleAlert className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      {message}
    </div>
  )
}

export function FormActions({ saving, cancelHref }: { saving: boolean; cancelHref: string }) {
  const { t } = usePreferences()
  return (
    <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
      <Link
        href={cancelHref}
        className={cn(
          'flex h-14 items-center justify-center rounded-xl border-2 border-border px-6 text-lg font-semibold hover:bg-muted',
        )}
      >
        {t('common.cancel')}
      </Link>
      <Button type="submit" size="xl" disabled={saving} className="h-14 px-8 text-lg">
        {saving ? (
          <LoaderCircle className="animate-spin" aria-hidden="true" />
        ) : (
          <Check aria-hidden="true" />
        )}
        {saving ? t('common.saving') : t('common.save')}
      </Button>
    </div>
  )
}
