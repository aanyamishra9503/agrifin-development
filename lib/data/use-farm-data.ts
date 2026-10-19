'use client'

import useSWR, { useSWRConfig } from 'swr'
import { useEffect, useMemo } from 'react'
import { usePreferences } from '@/components/providers/preferences-provider'
import { todayISO } from '../dates'
import { type FarmDataSource } from './data-source'
import { createSupabaseDataSource } from './supabase-data-source'
import type { NewExpenseInput, NewPaymentInput, NewSaleInput } from '../types'

/**
 * Swap this single line for an HTTP (FastAPI) or offline-first implementation
 * of FarmDataSource later; components will not need to change.
 */
const dataSource: FarmDataSource = createSupabaseDataSource()

const SNAPSHOT_KEY = 'farm/snapshot'

export function useFarmData() {
  const result = useSWR(SNAPSHOT_KEY, () => dataSource.getSnapshot(), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  const { selectedCycleId, setSelectedCycleId } = usePreferences()

  useEffect(() => {
    const cycles = result.data?.cycles

    if (!cycles?.length) return

    // Keep the selected season if it exists in the database.
    const selectionIsValid = cycles.some(
      (cycle) => cycle.id === selectedCycleId,
    )

    if (selectionIsValid) return

    // Otherwise, select the season containing today's date.
    const today = todayISO()

    const currentCycle = cycles.find(
      (cycle) => cycle.startDate <= today && today <= cycle.endDate,
    )

    // If no season contains today's date, fall back to the latest season.
    const fallbackCycle = currentCycle ?? cycles[cycles.length - 1]

    if (fallbackCycle && fallbackCycle.id !== selectedCycleId) {
      setSelectedCycleId(fallbackCycle.id)
    }
  }, [result.data, selectedCycleId, setSelectedCycleId])

  return result
}

export function useFarmActions() {
  const { mutate } = useSWRConfig()
  return useMemo(
    () => ({
      async addExpense(input: NewExpenseInput) {
        const expense = await dataSource.createExpense(input)
        await mutate(SNAPSHOT_KEY)
        return expense
      },
      async addSale(input: NewSaleInput) {
        const result = await dataSource.createSale(input)
        await mutate(SNAPSHOT_KEY)
        return result
      },
      async addPayment(input: NewPaymentInput) {
        const payment = await dataSource.createPayment(input)
        await mutate(SNAPSHOT_KEY)
        return payment
      },
    }),
    [mutate],
  )
}
