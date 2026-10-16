
'use client'

import { usePreferences } from '@/components/providers/preferences-provider'
import { PageHeader, SectionCard } from '@/components/shared/page-header'
import { SeasonSelect } from '@/components/shared/season-select'
import { FarmDataGate } from '@/components/shared/states'
import { useFormat } from '@/components/shared/use-format'
import { CropProfitList } from '@/components/dashboard/crop-profit-list'
import { MonthlyChart } from '@/components/dashboard/monthly-chart'
import {
  costByCategory,
  cycleSummary,
  monthlySeries,
} from '@/lib/finance'
import type { FarmSnapshot } from '@/lib/types'

function ReportsContent({ data }: { data: FarmSnapshot }) {
  const { t, selectedCycleId } = usePreferences()
  const { money } = useFormat()

  const cycle =
    data.cycles.find((item) => item.id === selectedCycleId) ??
    data.cycles[data.cycles.length - 1]

  const summary = cycleSummary(cycle.id, data)
  const categories = costByCategory(cycle.id, data.expenses)

  const metrics = [
    { label: t('reports.totalSales'), value: summary.revenue },
    { label: t('reports.received'), value: summary.received },
    { label: t('reports.pending'), value: summary.pending },
    { label: t('reports.costs'), value: summary.operationalCost },
    { label: t('reports.net'), value: summary.netIncome },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t('reports.title')}
        subtitle={t('reports.subtitle')}
        actions={
          <SeasonSelect cycles={data.cycles} className="w-full md:w-auto" />
        }
        className="mb-0"
      />

      <SectionCard
        title={t('reports.summary')}
        description={t('reports.subtitle')}
      >
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {metrics.map((metric) => (
            <div key={metric.label} className="flex flex-col gap-1">
              <p className="text-sm text-muted-foreground">{metric.label}</p>
              <p className="text-xl font-bold tabular-nums">
                {money(metric.value)}
              </p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title={t('reports.costByCategory')}
        description={t('reports.costs')}
      >
        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t('reports.noCosts')}
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {categories.map(({ category, amount }) => {
              const percentage =
                summary.operationalCost > 0
                  ? (amount / summary.operationalCost) * 100
                  : 0

              return (
                <div key={category} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium">
                      {category.replace(/_/g, ' ')}
                    </span>
                    <span className="text-sm font-semibold tabular-nums">
                      {money(amount)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-chart-2"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </SectionCard>

      <SectionCard
        title={t('reports.byCrop')}
        description={t('crops.subtitle')}
      >
        <CropProfitList data={data} cycleId={cycle.id} />
      </SectionCard>

      <SectionCard
        title={t('dashboard.monthlyChart')}
        description={t('dashboard.monthlyChartDescription')}
      >
        <MonthlyChart points={monthlySeries(cycle, data)} />
      </SectionCard>
    </div>
  )
}

export default function ReportsPage() {
  return (
    <FarmDataGate>
      {(data) => <ReportsContent data={data} />}
    </FarmDataGate>
  )
}
