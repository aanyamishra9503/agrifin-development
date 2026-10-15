'use client'

import { SlidersHorizontal, X } from 'lucide-react'
import { useId } from 'react'
import { usePreferences } from '@/components/providers/preferences-provider'
import type { DateFilter, DatePreset } from '@/lib/filters'
import { cn } from '@/lib/utils'
import { INPUT_CLASS, SELECT_CLASS } from './form-field'

export interface SelectFilter {
  key: string
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
}

export function FilterBar({
  selects,
  dateFilter,
  onDateFilterChange,
  isActive,
  onClear,
}: {
  selects: SelectFilter[]
  dateFilter: DateFilter
  onDateFilterChange: (filter: DateFilter) => void
  isActive: boolean
  onClear: () => void
}) {
  const { t } = usePreferences()
  const baseId = useId()
  const presets: { value: DatePreset; label: string }[] = [
    { value: 'all', label: t('filters.allDates') },
    { value: 'last30', label: t('filters.last30') },
    { value: 'custom', label: t('filters.custom') },
  ]

  return (
    <section
      aria-label={t('filters.title')}
      className="no-print flex flex-col gap-4 rounded-2xl border border-border bg-card p-4"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <SlidersHorizontal className="size-5 text-primary" aria-hidden="true" />
          {t('filters.title')}
        </h2>
        {isActive && (
          <button
            type="button"
            onClick={onClear}
            className="flex min-h-11 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-primary hover:bg-secondary"
          >
            <X className="size-4" aria-hidden="true" />
            {t('common.clearFilters')}
          </button>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {selects.map((select) => {
          const id = `${baseId}-${select.key}`
          return (
            <div key={select.key} className="flex flex-col gap-1.5">
              <label htmlFor={id} className="text-sm font-medium text-muted-foreground">
                {select.label}
              </label>
              <select
                id={id}
                value={select.value}
                onChange={(event) => select.onChange(event.target.value)}
                className={SELECT_CLASS}
              >
                {select.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )
        })}
        <fieldset className="flex flex-col gap-1.5">
          <legend className="mb-1.5 text-sm font-medium text-muted-foreground">{t('filters.dateRange')}</legend>
          <div className="grid grid-cols-3 gap-1 rounded-xl bg-muted p-1">
            {presets.map((preset) => (
              <label
                key={preset.value}
                className={cn(
                  'flex min-h-10 cursor-pointer items-center justify-center rounded-lg px-2 text-center text-sm font-semibold leading-tight transition-colors has-focus-visible:ring-3 has-focus-visible:ring-primary/30',
                  dateFilter.preset === preset.value
                    ? 'bg-card text-primary shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <input
                  type="radio"
                  name={`${baseId}-date`}
                  value={preset.value}
                  checked={dateFilter.preset === preset.value}
                  onChange={() => onDateFilterChange({ ...dateFilter, preset: preset.value })}
                  className="sr-only"
                />
                {preset.label}
              </label>
            ))}
          </div>
        </fieldset>
      </div>
      {dateFilter.preset === 'custom' && (
        <div className="grid grid-cols-2 gap-3 sm:max-w-md">
          <div className="flex flex-col gap-1.5">
            <label htmlFor={`${baseId}-from`} className="text-sm font-medium text-muted-foreground">
              {t('filters.from')}
            </label>
            <input
              id={`${baseId}-from`}
              type="date"
              value={dateFilter.from}
              max={dateFilter.to || undefined}
              onChange={(event) => onDateFilterChange({ ...dateFilter, from: event.target.value })}
              className={cn(INPUT_CLASS, 'h-12 text-base')}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor={`${baseId}-to`} className="text-sm font-medium text-muted-foreground">
              {t('filters.to')}
            </label>
            <input
              id={`${baseId}-to`}
              type="date"
              value={dateFilter.to}
              min={dateFilter.from || undefined}
              onChange={(event) => onDateFilterChange({ ...dateFilter, to: event.target.value })}
              className={cn(INPUT_CLASS, 'h-12 text-base')}
            />
          </div>
        </div>
      )}
    </section>
  )
}
