'use client'

import { Calendar } from 'lucide-react'
import { useId } from 'react'
import { usePreferences } from '@/components/providers/preferences-provider'
import type { HarvestCycle } from '@/lib/types'
import { cn } from '@/lib/utils'
import { SELECT_CLASS } from './form-field'

export function SeasonSelect({ cycles, className }: { cycles: HarvestCycle[]; className?: string }) {
  const { t, l, selectedCycleId, setSelectedCycleId } = usePreferences()
  const id = useId()
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
        <Calendar className="size-4" aria-hidden="true" />
        {t('common.season')}
      </label>
      <select
        id={id}
        value={selectedCycleId}
        onChange={(event) => setSelectedCycleId(event.target.value)}
        className={cn(SELECT_CLASS, 'min-w-64 bg-card font-semibold')}
      >
        {[...cycles].reverse().map((cycle) => (
          <option key={cycle.id} value={cycle.id}>
            {l(cycle.name)}
          </option>
        ))}
      </select>
    </div>
  )
}
