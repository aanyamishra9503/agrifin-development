/**
 * Centralized financial calculations. Every number shown in the UI comes from
 * here so the rules are defined (and later tested) in exactly one place.
 *
 * Rules:
 * - Net income = revenue (sale amounts) − operational expenses, both scoped to
 *   the same harvest cycle.
 * - Pending balance = Σ (sale amount − payments received for that sale).
 * - A sale's balance is never negative; payments are de-duplicated by id.
 */

import { monthKey, monthsBetween } from './dates'
import type {
  Crop,
  Expense,
  ExpenseCategory,
  FarmSnapshot,
  HarvestCycle,
  ID,
  Paise,
  Payment,
  Sale,
} from './types'

function sum(values: Paise[]): Paise {
  return values.reduce((total, value) => total + value, 0)
}

/** Guards against the same payment being counted twice (e.g. duplicate sync). */
export function uniquePayments(payments: Payment[]): Payment[] {
  const seen = new Set<ID>()
  return payments.filter((payment) => {
    if (seen.has(payment.id)) return false
    seen.add(payment.id)
    return true
  })
}

export function paymentsForSale(saleId: ID, payments: Payment[]): Payment[] {
  return uniquePayments(payments).filter((payment) => payment.saleId === saleId)
}

export function amountReceivedForSale(sale: Sale, payments: Payment[]): Paise {
  const received = sum(paymentsForSale(sale.id, payments).map((p) => p.amount))
  return Math.min(received, sale.amount)
}

export function balanceDueForSale(sale: Sale, payments: Payment[]): Paise {
  return Math.max(0, sale.amount - amountReceivedForSale(sale, payments))
}

export type SaleStatus = 'paid' | 'partial' | 'unpaid'

export function saleStatus(sale: Sale, payments: Payment[]): SaleStatus {
  const received = amountReceivedForSale(sale, payments)
  if (received >= sale.amount) return 'paid'
  if (received > 0) return 'partial'
  return 'unpaid'
}

export function expensesForCycle(cycleId: ID, expenses: Expense[]) {
  return expenses.filter((expense) => expense.cycleId === cycleId)
}

export function salesForCycle(cycleId: ID, sales: Sale[]) {
  return sales.filter((sale) => sale.cycleId === cycleId)
}

export function totalOperationalCost(cycleId: ID, expenses: Expense[]): Paise {
  return sum(expensesForCycle(cycleId, expenses).map((e) => e.amount))
}

export function totalRevenue(cycleId: ID, sales: Sale[]): Paise {
  return sum(salesForCycle(cycleId, sales).map((s) => s.amount))
}

export function totalReceived(cycleId: ID, sales: Sale[], payments: Payment[]): Paise {
  return sum(salesForCycle(cycleId, sales).map((s) => amountReceivedForSale(s, payments)))
}

export function pendingBalance(cycleId: ID, sales: Sale[], payments: Payment[]): Paise {
  return sum(salesForCycle(cycleId, sales).map((s) => balanceDueForSale(s, payments)))
}

export interface CycleSummary {
  revenue: Paise
  operationalCost: Paise
  netIncome: Paise
  received: Paise
  pending: Paise
}

export function cycleSummary(cycleId: ID, data: FarmSnapshot): CycleSummary {
  const revenue = totalRevenue(cycleId, data.sales)
  const operationalCost = totalOperationalCost(cycleId, data.expenses)
  return {
    revenue,
    operationalCost,
    netIncome: revenue - operationalCost,
    received: totalReceived(cycleId, data.sales, data.payments),
    pending: pendingBalance(cycleId, data.sales, data.payments),
  }
}

export interface CropProfit {
  crop: Crop
  revenue: Paise
  cost: Paise
  net: Paise
}

/** Per-crop profit. Shared (general) costs are returned separately, not split. */
export function cropProfitability(
  cycleId: ID,
  data: FarmSnapshot,
): { crops: CropProfit[]; sharedCost: Paise } {
  const expenses = expensesForCycle(cycleId, data.expenses)
  const sales = salesForCycle(cycleId, data.sales)
  const crops = data.crops
    .filter((crop) => crop.cycleId === cycleId)
    .map((crop) => {
      const revenue = sum(sales.filter((s) => s.cropId === crop.id).map((s) => s.amount))
      const cost = sum(expenses.filter((e) => e.cropId === crop.id).map((e) => e.amount))
      return { crop, revenue, cost, net: revenue - cost }
    })
  const sharedCost = sum(expenses.filter((e) => e.cropId === null).map((e) => e.amount))
  return { crops, sharedCost }
}

export function costByCategory(cycleId: ID, expenses: Expense[]) {
  const totals = new Map<ExpenseCategory, Paise>()
  for (const expense of expensesForCycle(cycleId, expenses)) {
    totals.set(expense.category, (totals.get(expense.category) ?? 0) + expense.amount)
  }
  return [...totals.entries()]
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)
}

export interface MonthlyPoint {
  month: string
  income: Paise
  expense: Paise
}

/** Month-by-month sale value and expenses within a cycle's date range. */
export function monthlySeries(cycle: HarvestCycle, data: FarmSnapshot): MonthlyPoint[] {
  const points = new Map<string, MonthlyPoint>(
    monthsBetween(cycle.startDate, cycle.endDate).map((month) => [
      month,
      { month, income: 0, expense: 0 },
    ]),
  )
  for (const sale of salesForCycle(cycle.id, data.sales)) {
    const point = points.get(monthKey(sale.date))
    if (point) point.income += sale.amount
  }
  for (const expense of expensesForCycle(cycle.id, data.expenses)) {
    const point = points.get(monthKey(expense.date))
    if (point) point.expense += expense.amount
  }
  return [...points.values()]
}
