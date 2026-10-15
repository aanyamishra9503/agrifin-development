'use client'

import { ExpenseForm } from '@/components/expenses/expense-form'
import { FarmDataGate } from '@/components/shared/states'

export default function NewExpensePage() {
  return <FarmDataGate>{(data) => <ExpenseForm data={data} />}</FarmDataGate>
}
