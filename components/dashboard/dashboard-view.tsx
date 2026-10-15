'use client'

import { usePreferences } from '@/components/providers/preferences-provider'
import { PageHeader, SectionCard } from '@/components/shared/page-header'
import { SeasonSelect } from '@/components/shared/season-select'
import { FarmDataGate } from '@/components/shared/states'
import { cycleSummary, monthlySeries } from '@/lib/finance'
import type { FarmSnapshot } from '@/lib/types'
import { CropProfitList } from './crop-profit-list'
import { MetricCards } from './metric-cards'
import { MonthlyChart } from './monthly-chart'
import { QuickActions } from './quick-actions'
import { RecentActivity } from './recent-activity'

function Dashboard({ data }: { data: FarmSnapshot }) {
  const { t, profile, selectedCycleId } = usePreferences()
  const cycle = data.cycles.find((c) => c.id === selectedCycleId) ?? data.cycles[data.cycles.length - 1]
  const summary = cycleSummary(cycle.id, data)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t('dashboard.greeting', { name: profile.name })}
        subtitle={t('dashboard.subtitle')}
        actions={<SeasonSelect cycles={data.cycles} className="w-full md:w-auto" />}
        className="mb-0"
      />
      <MetricCards summary={summary} data={data} cycleId={cycle.id} />
      <QuickActions />
      <div className="grid gap-6 lg:grid-cols-5">
        <SectionCard
          id="monthly-chart"
          title={t('dashboard.monthlyChart')}
          description={t('dashboard.monthlyChartDescription')}
          className="lg:col-span-3"
        >
          <MonthlyChart points={monthlySeries(cycle, data)} />
        </SectionCard>
        <SectionCard id="crop-profit" title={t('dashboard.cropProfit')} className="lg:col-span-2">
          <CropProfitList data={data} cycleId={cycle.id} />
        </SectionCard>
      </div>
      <RecentActivity data={data} cycleId={cycle.id} />
    </div>
  )
}

export function DashboardView() {
  return <FarmDataGate>{(data) => <Dashboard data={data} />}</FarmDataGate>
}
