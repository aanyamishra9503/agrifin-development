import { expensesForCycle, salesForCycle, uniquePayments } from './finance'
import type { Expense, FarmSnapshot, ID, ISODate, Paise, Payment, Sale } from './types'

export type ActivityItem =
  | { kind: 'expense'; id: ID; date: ISODate; amount: Paise; expense: Expense }
  | { kind: 'sale'; id: ID; date: ISODate; amount: Paise; sale: Sale }
  | { kind: 'payment'; id: ID; date: ISODate; amount: Paise; payment: Payment; sale: Sale }

/** Newest-first feed of everything recorded in a cycle. */
export function cycleActivity(cycleId: ID, data: FarmSnapshot, limit = 8): ActivityItem[] {
  const sales = salesForCycle(cycleId, data.sales)
  const saleById = new Map(sales.map((sale) => [sale.id, sale]))
  const items: ActivityItem[] = [
    ...expensesForCycle(cycleId, data.expenses).map(
      (expense): ActivityItem => ({ kind: 'expense', id: expense.id, date: expense.date, amount: expense.amount, expense }),
    ),
    ...sales.map((sale): ActivityItem => ({ kind: 'sale', id: sale.id, date: sale.date, amount: sale.amount, sale })),
    ...uniquePayments(data.payments).flatMap((payment): ActivityItem[] => {
      const sale = saleById.get(payment.saleId)
      return sale ? [{ kind: 'payment', id: payment.id, date: payment.date, amount: payment.amount, payment, sale }] : []
    }),
  ]
  return items.sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit)
}
