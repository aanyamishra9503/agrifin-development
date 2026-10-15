/**
 * Data-access boundary. UI code only talks to `FarmDataSource`, never to the
 * storage directly. Today it is backed by in-memory sample data; later an
 * HTTP implementation (FastAPI + Supabase Postgres) or an offline-first local
 * store can implement the same interface without touching components.
 *
 * NOTE: The in-memory source resets on a full page reload. Nothing is
 * persisted on the device yet, and this prototype does NOT work offline.
 */

import { hasErrors, validateExpense, validatePayment, validateSale } from '../validation'
import type {
  Expense,
  FarmSnapshot,
  NewExpenseInput,
  NewPaymentInput,
  NewSaleInput,
  Payment,
  Sale,
} from '../types'
import { createSampleSnapshot } from './sample-data'

export class ValidationError extends Error {
  constructor(public fieldErrors: Record<string, string | undefined>) {
    super('Validation failed')
  }
}

export interface FarmDataSource {
  getSnapshot(): Promise<FarmSnapshot>
  createExpense(input: NewExpenseInput): Promise<Expense>
  /** Creates the sale and, if amountReceived > 0, its first payment. */
  createSale(input: NewSaleInput): Promise<{ sale: Sale; payment: Payment | null }>
  /** Idempotent on `requestId`: retrying returns the original payment. */
  createPayment(input: NewPaymentInput): Promise<Payment>
}

function newId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`
}

export function createInMemoryDataSource(seed: FarmSnapshot = createSampleSnapshot()): FarmDataSource {
  const state = seed
  const saleRequests = new Map<string, { sale: Sale; payment: Payment | null }>()

  const findByRequestId = (requestId: string) =>
    state.payments.find((payment) => payment.requestId === requestId)

  return {
    async getSnapshot() {
      return structuredClone(state)
    },

    async createExpense(input) {
      const errors = validateExpense(input, state)
      if (hasErrors(errors)) throw new ValidationError(errors)
      const expense: Expense = { ...input, id: newId('exp'), note: input.note?.trim() || undefined }
      state.expenses.push(expense)
      return expense
    },

    async createSale(input) {
      const previous = saleRequests.get(input.requestId)
      if (previous) return previous
      const errors = validateSale(input, state)
      if (hasErrors(errors)) throw new ValidationError(errors)
      const { amountReceived, requestId, ...saleFields } = input
      const sale: Sale = { ...saleFields, buyer: saleFields.buyer.trim(), id: newId('sale') }
      state.sales.push(sale)
      let payment: Payment | null = null
      if (amountReceived > 0) {
        payment = { id: newId('pay'), saleId: sale.id, amount: amountReceived, date: sale.date, requestId }
        state.payments.push(payment)
      }
      const result = { sale, payment }
      saleRequests.set(requestId, result)
      return result
    },

    async createPayment(input) {
      const existing = findByRequestId(input.requestId)
      if (existing) return existing
      const errors = validatePayment(input, state)
      if (hasErrors(errors)) throw new ValidationError(errors)
      const payment: Payment = { ...input, id: newId('pay') }
      state.payments.push(payment)
      return payment
    },
  }
}
