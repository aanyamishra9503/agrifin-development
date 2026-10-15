/**
 * Domain types for AgriFin.
 *
 * All money values are stored as integer paise (₹1 = 100 paise) to avoid
 * floating-point rounding errors. Dates are ISO calendar dates (YYYY-MM-DD).
 * These shapes are designed to map 1:1 onto future FastAPI / Postgres tables.
 */

export type ID = string
export type ISODate = string
export type Paise = number

export type LocalizedText = { en: string; ta: string }

export interface HarvestCycle {
  id: ID
  name: LocalizedText
  startDate: ISODate
  endDate: ISODate
}

export type CropIcon = 'wheat' | 'sprout' | 'banana' | 'nut' | 'leaf' | 'flower'

export interface Crop {
  id: ID
  cycleId: ID
  name: LocalizedText
  icon: CropIcon
  areaAcres: number
}

export const EXPENSE_CATEGORIES = [
  'seeds',
  'fertilizer',
  'pesticides',
  'labour',
  'irrigation',
  'transport',
  'other',
] as const
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number]

export interface Expense {
  id: ID
  cycleId: ID
  /** null means a general farm cost shared across crops */
  cropId: ID | null
  category: ExpenseCategory
  amount: Paise
  date: ISODate
  note?: string
}

export const SALE_UNITS = ['kg', 'quintal', 'tonne', 'bag', 'bunch'] as const
export type SaleUnit = (typeof SALE_UNITS)[number]

export interface Sale {
  id: ID
  cycleId: ID
  cropId: ID
  quantity: number
  unit: SaleUnit
  buyer: string
  /** Total agreed sale value */
  amount: Paise
  date: ISODate
}

/**
 * Money received against a sale. "Amount received" at the time of sale is
 * stored as a Payment too, so received totals have exactly one source.
 */
export interface Payment {
  id: ID
  saleId: ID
  amount: Paise
  date: ISODate
  /** Client-generated idempotency key so retries never create duplicates */
  requestId: string
}

export interface FarmSnapshot {
  cycles: HarvestCycle[]
  crops: Crop[]
  expenses: Expense[]
  sales: Sale[]
  payments: Payment[]
}

export interface NewExpenseInput {
  cycleId: ID
  cropId: ID | null
  category: ExpenseCategory
  amount: Paise
  date: ISODate
  note?: string
}

export interface NewSaleInput {
  cycleId: ID
  cropId: ID
  quantity: number
  unit: SaleUnit
  buyer: string
  amount: Paise
  amountReceived: Paise
  date: ISODate
  requestId: string
}

export interface NewPaymentInput {
  saleId: ID
  amount: Paise
  date: ISODate
  requestId: string
}
