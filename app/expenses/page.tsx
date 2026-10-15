import type { Metadata } from 'next'
import { ExpenseListView } from '@/components/expenses/expense-list-view'

export const metadata: Metadata = { title: 'Expenses' }

export default function ExpensesPage() {
  return <ExpenseListView />
}
