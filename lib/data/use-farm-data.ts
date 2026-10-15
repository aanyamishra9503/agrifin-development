'use client'

import useSWR, { useSWRConfig } from 'swr'
import { useMemo } from 'react'
import { createInMemoryDataSource, type FarmDataSource } from './data-source'
import type { NewExpenseInput, NewPaymentInput, NewSaleInput } from '../types'

/**
 * Swap this single line for an HTTP (FastAPI) or offline-first implementation
 * of FarmDataSource later; components will not need to change.
 */
const dataSource: FarmDataSource = createInMemoryDataSource()

const SNAPSHOT_KEY = 'farm/snapshot'

export function useFarmData() {
  return useSWR(SNAPSHOT_KEY, () => dataSource.getSnapshot(), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })
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
