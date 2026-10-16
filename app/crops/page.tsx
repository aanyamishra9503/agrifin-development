
'use client'

import { usePreferences } from '@/components/providers/preferences-provider'
import { PageHeader, SectionCard } from '@/components/shared/page-header'
import { SeasonSelect } from '@/components/shared/season-select'
import { FarmDataGate } from '@/components/shared/states'
import { CropProfitList } from '@/components/dashboard/crop-profit-list'
import { useFormat } from '@/components/shared/use-format'
import { cropProfitability } from '@/lib/finance'
import type { FarmSnapshot } from '@/lib/types'

function CropsContent({ data }: { data: FarmSnapshot }) {
  const { t, selectedCycleId } = usePreferences()
  const { money } = useFormat()

  const cycle =
    data.cycles.find((item) => item.id === selectedCycleId) ??
    data.cycles[data.cycles.length - 1]

  const { crops, sharedCost } = cropProfitability(cycle.id, data)

  const totalRevenue = crops.reduce((total, crop) => total + crop.revenue, 0)
  const totalCropCost = crops.reduce((total, crop) => total + crop.cost, 0)
  const totalCost = totalCropCost + sharedCost
  const netIncome = totalRevenue - totalCost

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t('crops.title')}
        subtitle={t('crops.subtitle')}
        actions={
          <SeasonSelect cycles={data.cycles} className="w-full md:w-auto" />
        }
        className="mb-0"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <SectionCard title={t('reports.totalSales')}>
          <p className="text-2xl font-bold tabular-nums">
            {money(totalRevenue)}
          </p>
        </SectionCard>

        <SectionCard title={t('reports.costs')}>
          <p className="text-2xl font-bold tabular-nums">
            {money(totalCost)}
          </p>
        </SectionCard>

        <SectionCard title={t('reports.net')}>
          <p
            className={`text-2xl font-bold tabular-nums ${
              netIncome < 0 ? 'text-destructive' : 'text-primary'
            }`}
          >
            {money(netIncome)}
          </p>
        </SectionCard>
      </div>

      <SectionCard
        title={t('crops.title')}
        description={t('crops.subtitle')}
      >
        <CropProfitList data={data} cycleId={cycle.id} />
      </SectionCard>
    </div>
  )
}

export default function CropsPage() {
  return <FarmDataGate>{(data) => <CropsContent data={data} />}</FarmDataGate>
}
