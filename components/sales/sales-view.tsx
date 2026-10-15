'use client'

import { HandCoins, SearchX, Wallet } from 'lucide-react'
import { useState } from 'react'
import { usePreferences } from '@/components/providers/preferences-provider'
import { AddButtonLink } from '@/components/shared/add-button-link'
import { FilterBar } from '@/components/shared/filter-bar'
import { PageHeader } from '@/components/shared/page-header'
import { SeasonSelect } from '@/components/shared/season-select'
import { EmptyState, FarmDataGate } from '@/components/shared/states'
import { useFormat } from '@/components/shared/use-format'
import { EMPTY_DATE_FILTER, matchesDateFilter, type DateFilter } from '@/lib/filters'
import { cycleSummary, saleStatus, salesForCycle } from '@/lib/finance'
import type { FarmSnapshot } from '@/lib/types'
import { SaleCard } from './sale-card'

const ALL = 'all'

function Sales({ data }: { data: FarmSnapshot }) {
  const { t, l, selectedCycleId } = usePreferences()
  const { money } = useFormat()
  const [cropFilter, setCropFilter] = useState(ALL)
  const [statusFilter, setStatusFilter] = useState(ALL)
  const [dateFilter, setDateFilter] = useState<DateFilter>(EMPTY_DATE_FILTER)

  const crops = data.crops.filter((crop) => crop.cycleId === selectedCycleId)
  const cropById = new Map(crops.map((crop) => [crop.id, crop]))
  const allSales = salesForCycle(selectedCycleId, data.sales)
  const summary = cycleSummary(selectedCycleId, data)
  const sales = allSales
    .filter((s) => cropFilter === ALL || s.cropId === cropFilter)
    .filter((s) => statusFilter === ALL || saleStatus(s, data.payments) === statusFilter)
    .filter((s) => matchesDateFilter(s.date, dateFilter))
    .sort((a, b) => b.date.localeCompare(a.date))
  const filtersActive = cropFilter !== ALL || statusFilter !== ALL || dateFilter.preset !== 'all'

  const clearFilters = () => {
    setCropFilter(ALL)
    setStatusFilter(ALL)
    setDateFilter(EMPTY_DATE_FILTER)
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={t('sales.title')}
        subtitle={t('sales.subtitle')}
        actions={
          <div className="flex flex-col gap-3 sm:flex-row">
            <AddButtonLink href="/sales/payment" label={t('sales.receivePayment')} icon={Wallet} variant="outline" />
            <AddButtonLink href="/sales/new" label={t('sales.add')} />
          </div>
        }
        className="mb-0"
      />
      <SeasonSelect cycles={data.cycles} className="sm:max-w-sm" />
      {allSales.length === 0 ? (
        <EmptyState
          icon={HandCoins}
          title={t('sales.emptyTitle')}
          description={t('sales.emptyDescription')}
          action={<AddButtonLink href="/sales/new" label={t('sales.add')} />}
        />
      ) : (
        <>
          <dl className="grid grid-cols-3 gap-3">
            {[
              { label: t('sales.saleValue'), value: summary.revenue, tone: '' },
              { label: t('sales.received'), value: summary.received, tone: 'text-primary' },
              { label: t('sales.balanceDue'), value: summary.pending, tone: 'text-destructive' },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-border bg-card p-3 sm:p-4">
                <dt className="text-sm text-muted-foreground">{item.label}</dt>
                <dd className={`text-lg font-bold tabular-nums sm:text-2xl ${item.tone}`}>{money(item.value)}</dd>
              </div>
            ))}
          </dl>
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
                ],
              },
              {
                key: 'status',
                label: t('sales.paymentStatus'),
                value: statusFilter,
                onChange: setStatusFilter,
                options: [
                  { value: ALL, label: t('sales.allStatuses') },
                  { value: 'unpaid', label: t('status.unpaid') },
                  { value: 'partial', label: t('status.partial') },
                  { value: 'paid', label: t('status.paid') },
                ],
              },
            ]}
            dateFilter={dateFilter}
            onDateFilterChange={setDateFilter}
            isActive={filtersActive}
            onClear={clearFilters}
          />
          {sales.length === 0 ? (
            <EmptyState icon={SearchX} title={t('sales.noMatchTitle')} description={t('sales.noMatchDescription')} />
          ) : (
            <ul className="grid gap-4 lg:grid-cols-2">
              {sales.map((sale) => (
                <li key={sale.id}>
                  <SaleCard sale={sale} crop={cropById.get(sale.cropId)} payments={data.payments} />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}

export function SalesView() {
  return <FarmDataGate>{(data) => <Sales data={data} />}</FarmDataGate>
}
