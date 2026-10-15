import { addDays, isWithin, todayISO } from './dates'
import type { HarvestCycle, ISODate } from './types'

export type DatePreset = 'all' | 'last30' | 'custom'

export interface DateFilter {
  preset: DatePreset
  from: ISODate
  to: ISODate
}

export const EMPTY_DATE_FILTER: DateFilter = { preset: 'all', from: '', to: '' }

export function matchesDateFilter(date: ISODate, filter: DateFilter): boolean {
  if (filter.preset === 'all') return true
  if (filter.preset === 'last30') return isWithin(date, addDays(todayISO(), -30), todayISO())
  if (filter.from && date < filter.from) return false
  if (filter.to && date > filter.to) return false
  return true
}

/** Today if it falls in the cycle, otherwise the nearest cycle boundary. */
export function defaultDateForCycle(cycle: HarvestCycle | undefined): ISODate {
  const today = todayISO()
  if (!cycle) return today
  if (today > cycle.endDate) return cycle.endDate
  if (today < cycle.startDate) return cycle.startDate
  return today
}
