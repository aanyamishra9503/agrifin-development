'use client'

import { Receipt, SearchX } from 'lucide-react'
import { useState } from 'react'
import { usePreferences } from '@/components/providers/preferences-provider'
import { AddButtonLink } from '@/components/shared/add-button-link'
import { CATEGORY_ICONS, IconBadge } from '@/components/shared/domain-icons'
import { FilterBar } from '@/components/shared/filter-bar'
import { PageHeader } from '@/components/shared/page-header'
import { SeasonSelect } from '@/components/shared/season-select'
import { EmptyState, FarmDataGate } from '@/components/shared/states'
import { useFormat } from '@/components/shared/use-format'
import { EMPTY_DATE_FILTER, matchesDateFilter, type DateFilter } from '@/lib/filters'
import { expensesForCycle } from '@/lib/finance'
import { EXPENSE_CATEGORIES, type FarmSnapshot } from '@/lib/types'

const ALL = 'all'
const GENERAL = 'general'

function ExpenseList({ data }: { data: FarmSnapshot }) {
  const { t, l, selectedCycleId } = usePreferences()
  const { money, date } = useFormat()
  const [cropFilter, setCropFilter] = useState(ALL)
  const [categoryFilter, setCategoryFilter] = useState(ALL)
  const [dateFilter, setDateFilter] = useState<DateFilter>(EMPTY_DATE_FILTER)

  const crops = data.crops.filter((crop) => crop.cycleId === selectedCycleId)
  const cropById = new Map(crops.map((crop) => [crop.id, crop]))
  const allExpenses = expensesForCycle(selectedCycleId, data.expenses)
  const expenses = allExpenses
    .filter((e) => cropFilter === ALL || (cropFilter === GENERAL ? e.cropId === null : e.cropId === cropFilter))
    .filter((e) => categoryFilter === ALL || e.category === categoryFilter)
    .filter((e) => matchesDateFilter(e.date, dateFilter))
    .sort((a, b) => b.date.localeCompare(a.date))
  const total = expenses.reduce((sum, e) => sum + e.amount, 0)
  const filtersActive = cropFilter !== ALL || categoryFilter !== ALL || dateFilter.preset !== 'all'

  const clearFilters = () => {
    setCropFilter(ALL)
    setCategoryFilter(ALL)
    setDateFilter(EMPTY_DATE_FILTER)
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={t('expenses.title')}
        subtitle={t('expenses.subtitle')}
        actions={<AddButtonLink href="/expenses/new" label={t('expenses.add')} />}
        className="mb-0"
      />
      <SeasonSelect cycles={data.cycles} className="sm:max-w-sm" />
      {allExpenses.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title={t('expenses.emptyTitle')}
          description={t('expenses.emptyDescription')}
          action={<AddButtonLink href="/expenses/new" label={t('expenses.add')} />}
        />
      ) : (
        <>
          <FilterBar
            selects={[
              {
                key: 'crop',
                label: t('common.crop'),
                value: cropFilter,
                onChange: setCropFilter,
                options: [
                  { value: ALL, label: t('common.allCrops') },
                  ...crops.map((crop) => ({ value: crop.id, label: l(crop.name) })),
                  { value: GENERAL, label: t('common.generalFarm') },
                ],
              },
              {
                key: 'category',
                label: t('filters.category'),
                value: categoryFilter,
                onChange: setCategoryFilter,
                options: [
                  { value: ALL, label: t('filters.allCategories') },
                  ...EXPENSE_CATEGORIES.map((c) => ({ value: c, label: t(`categories.${c}`) })),
                ],
              },
            ]}
            dateFilter={dateFilter}
            onDateFilterChange={setDateFilter}
            isActive={filtersActive}
            onClear={clearFilters}
          />
          {expenses.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title={t('expenses.noMatchTitle')}
              description={t('expenses.noMatchDescription')}
            />
          ) : (
            <section aria-labelledby="expense-total" className="rounded-2xl border border-border bg-card">
              <div className="flex items-center justify-between gap-3 border-b border-border p-4">
                <p id="expense-total" className="text-base text-muted-foreground" aria-live="polite">
                  {t('expenses.totalShown', { count: expenses.length })}
                </p>
                <p className="text-xl font-bold tabular-nums text-earth">{money(total)}</p>
              </div>
              <ul className="divide-y divide-border">
                {expenses.map((expense) => {
                  const crop = expense.cropId ? cropById.get(expense.cropId) : undefined
                  return (
                    <li key={expense.id} className="flex items-center gap-3 p-4">
                      <IconBadge icon={CATEGORY_ICONS[expense.category]} tone="earth" />
                      <div className="flex min-w-0 flex-1 flex-col">
                        <p className="text-base font-semibold">{t(`categories.${expense.category}`)}</p>
                        <p className="truncate text-sm text-muted-foreground">
                          {date(expense.date)} · {crop ? l(crop.name) : t('common.generalFarm')}
                        </p>
                        {expense.note && <p className="truncate text-sm text-muted-foreground">{expense.note}</p>}
                      </div>
                      <p className="shrink-0 text-base font-bold tabular-nums">{money(expense.amount)}</p>
                    </li>
                  )
                })}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  )
}

export function ExpenseListView() {
  return <FarmDataGate>{(data) => <ExpenseList data={data} />}</FarmDataGate>
}
