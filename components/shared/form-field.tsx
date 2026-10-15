'use client'

import { CircleAlert, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const CONTROL_BASE =
  'h-14 w-full rounded-xl border-2 border-input bg-card px-4 text-lg text-foreground outline-none transition-colors placeholder:text-muted-foreground/80 focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/25 aria-invalid:border-destructive aria-invalid:ring-destructive/20'

export const INPUT_CLASS = CONTROL_BASE
export const SELECT_CLASS = cn(
  CONTROL_BASE,
  'h-12 appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%23555%27 stroke-width=%272%27%3E%3Cpath d=%27m6 9 6 6 6-6%27/%3E%3C/svg%3E")] bg-[length:1.25rem] bg-[right_0.75rem_center] bg-no-repeat pr-10 text-base',
)

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} className="flex items-center gap-1.5 text-base font-medium text-destructive">
      <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
      {message}
    </p>
  )
}

export function FormField({
  id,
  label,
  hint,
  error,
  optionalLabel,
  children,
}: {
  id: string
  label: string
  hint?: string
  error?: string
  optionalLabel?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-base font-semibold">
        {label}
        {optionalLabel && <span className="ml-1.5 font-normal text-muted-foreground">({optionalLabel})</span>}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="-mt-1 text-sm text-muted-foreground">
          {hint}
        </p>
      )}
      {children}
      <FieldError id={`${id}-error`} message={error} />
    </div>
  )
}

/** aria props connecting an input to its hint and error text */
export function describedBy(id: string, { hint, error }: { hint?: boolean; error?: string }) {
  const ids = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ')
  return { 'aria-describedby': ids || undefined, 'aria-invalid': error ? true : undefined }
}

export function AmountInput({
  id,
  value,
  onChange,
  error,
  hint,
}: {
  id: string
  value: string
  onChange: (value: string) => void
  error?: string
  hint?: boolean
}) {
  return (
    <div className="relative">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-xl font-semibold text-muted-foreground"
      >
        ₹
      </span>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        placeholder="0"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(INPUT_CLASS, 'pl-10 text-xl font-semibold tabular-nums')}
        {...describedBy(id, { hint, error })}
      />
    </div>
  )
}

export interface Choice<T extends string> {
  value: T
  label: string
  icon: LucideIcon
  sublabel?: string
}

/** Large icon tiles backed by native radio inputs (keyboard + screen-reader friendly). */
export function ChoiceGrid<T extends string>({
  name,
  legend,
  choices,
  value,
  onChange,
  error,
  columns = 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
}: {
  name: string
  legend: string
  choices: Choice<T>[]
  value: T | null
  onChange: (value: T) => void
  error?: string
  columns?: string
}) {
  const errorId = `${name}-error`
  return (
    <fieldset className="flex flex-col gap-3" aria-describedby={error ? errorId : undefined}>
      <legend className="mb-3 text-base font-semibold">{legend}</legend>
      <div className={cn('grid gap-3', columns)}>
        {choices.map((choice) => {
          const Icon = choice.icon
          const checked = value === choice.value
          return (
            <label
              key={choice.value}
              className={cn(
                'relative flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 bg-card p-3 text-center transition-colors has-focus-visible:ring-3 has-focus-visible:ring-primary/30',
                checked ? 'border-primary bg-secondary' : 'border-border hover:border-primary/50',
                error && !value && 'border-destructive/60',
              )}
            >
              <input
                type="radio"
                name={name}
                value={choice.value}
                checked={checked}
                onChange={() => onChange(choice.value)}
                className="sr-only"
              />
              <Icon className={cn('size-8', checked ? 'text-primary' : 'text-earth')} aria-hidden="true" />
              <span className="text-base font-semibold leading-tight">{choice.label}</span>
              {choice.sublabel && <span className="text-xs text-muted-foreground">{choice.sublabel}</span>}
            </label>
          )
        })}
      </div>
      <FieldError id={errorId} message={error} />
    </fieldset>
  )
}

export function FormSummary({ title, rows }: { title: string; rows: { label: string; value: string }[] }) {
  return (
    <div className="rounded-2xl border border-primary/25 bg-success-soft p-4">
      <p className="mb-2 text-sm font-semibold text-secondary-foreground">{title}</p>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-base">
        {rows.map((row) => (
          <div key={row.label} className="contents">
            <dt className="text-muted-foreground">{row.label}</dt>
            <dd className="text-right font-semibold tabular-nums">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
