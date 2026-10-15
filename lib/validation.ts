/**
 * Input validation shared by the forms and the data layer. Returns
 * translation keys (not English strings) so errors render in any language.
 * The future FastAPI backend must enforce the same rules server-side.
 */

import { isWithin, todayISO } from './dates'
import { balanceDueForSale } from './finance'
import type { TranslationKey } from './i18n'
import type {
  FarmSnapshot,
  NewExpenseInput,
  NewPaymentInput,
  NewSaleInput,
  Paise,
} from './types'

export type FieldErrors<T extends string> = Partial<Record<T, TranslationKey>>

const MAX_AMOUNT: Paise = 100_00_00_000 * 100 // ₹100 crore sanity cap

function checkAmount(amount: Paise | null): TranslationKey | undefined {
  if (amount === null || Number.isNaN(amount)) return 'errors.amountInvalid'
  if (amount <= 0) return 'errors.amountPositive'
  if (amount > MAX_AMOUNT) return 'errors.amountTooLarge'
  return undefined
}

function checkDateInCycle(
  date: string,
  cycleId: string,
  data: FarmSnapshot,
): TranslationKey | undefined {
  if (!date) return 'errors.dateRequired'
  if (date > todayISO()) return 'errors.dateFuture'
  const cycle = data.cycles.find((c) => c.id === cycleId)
  if (cycle && !isWithin(date, cycle.startDate, cycle.endDate)) return 'errors.dateOutsideSeason'
  return undefined
}

export type ExpenseField = 'category' | 'amount' | 'date' | 'cycleId'

export function validateExpense(
  input: Omit<NewExpenseInput, 'amount'> & { amount: Paise | null },
  data: FarmSnapshot,
): FieldErrors<ExpenseField> {
  const errors: FieldErrors<ExpenseField> = {}
  if (!data.cycles.some((c) => c.id === input.cycleId)) errors.cycleId = 'errors.seasonRequired'
  if (!input.category) errors.category = 'errors.categoryRequired'
  const amountError = checkAmount(input.amount)
  if (amountError) errors.amount = amountError
  const dateError = checkDateInCycle(input.date, input.cycleId, data)
  if (dateError) errors.date = dateError
  return errors
}

export type SaleField = 'cropId' | 'quantity' | 'buyer' | 'amount' | 'amountReceived' | 'date'

export function validateSale(
  input: Omit<NewSaleInput, 'amount' | 'amountReceived' | 'quantity'> & {
    amount: Paise | null
    amountReceived: Paise | null
    quantity: number | null
  },
  data: FarmSnapshot,
): FieldErrors<SaleField> {
  const errors: FieldErrors<SaleField> = {}
  if (!input.cropId || !data.crops.some((c) => c.id === input.cropId))
    errors.cropId = 'errors.cropRequired'
  if (input.quantity === null || !Number.isFinite(input.quantity) || input.quantity <= 0)
    errors.quantity = 'errors.quantityPositive'
  if (!input.buyer.trim()) errors.buyer = 'errors.buyerRequired'
  else if (input.buyer.trim().length > 80) errors.buyer = 'errors.buyerTooLong'
  const amountError = checkAmount(input.amount)
  if (amountError) errors.amount = amountError
  if (input.amountReceived === null || input.amountReceived < 0)
    errors.amountReceived = 'errors.amountInvalid'
  else if (input.amount !== null && input.amountReceived > input.amount)
    errors.amountReceived = 'errors.receivedMoreThanSale'
  const dateError = checkDateInCycle(input.date, input.cycleId, data)
  if (dateError) errors.date = dateError
  return errors
}

export type PaymentField = 'saleId' | 'amount' | 'date'

export function validatePayment(
  input: Omit<NewPaymentInput, 'amount'> & { amount: Paise | null },
  data: FarmSnapshot,
): FieldErrors<PaymentField> {
  const errors: FieldErrors<PaymentField> = {}
  const sale = data.sales.find((s) => s.id === input.saleId)
  if (!sale) {
    errors.saleId = 'errors.saleRequired'
    return errors
  }
  const balance = balanceDueForSale(sale, data.payments)
  const amountError = checkAmount(input.amount)
  if (balance === 0) errors.amount = 'errors.alreadyPaid'
  else if (amountError) errors.amount = amountError
  else if (input.amount !== null && input.amount > balance) errors.amount = 'errors.overpayment'
  if (!input.date) errors.date = 'errors.dateRequired'
  else if (input.date > todayISO()) errors.date = 'errors.dateFuture'
  else if (input.date < sale.date) errors.date = 'errors.paymentBeforeSale'
  return errors
}

export function hasErrors(errors: Record<string, unknown>) {
  return Object.values(errors).some(Boolean)
}
