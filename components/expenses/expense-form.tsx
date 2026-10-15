'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { usePreferences } from '@/components/providers/preferences-provider'
import { useToast } from '@/components/providers/toast-provider'
import { CATEGORY_ICONS, CROP_ICONS, GENERAL_FARM_ICON } from '@/components/shared/domain-icons'
import { AmountInput, ChoiceGrid, FormField, INPUT_CLASS, describedBy, type Choice } from '@/components/shared/form-field'
import { FormActions, FormBanner, FormShell, FormStep } from '@/components/shared/form-layout'
import { SeasonSelect } from '@/components/shared/season-select'
import { useFormSubmit } from '@/components/shared/use-form-submit'
import { useFormat } from '@/components/shared/use-format'
import { useFarmActions } from '@/lib/data/use-farm-data'
import { todayISO } from '@/lib/dates'
import { defaultDateForCycle } from '@/lib/filters'
import { parseRupeesToPaise } from '@/lib/money'
import { EXPENSE_CATEGORIES, type ExpenseCategory, type FarmSnapshot } from '@/lib/types'
import { validateExpense, type ExpenseField } from '@/lib/validation'

const GENERAL = 'general'

export function ExpenseForm({ data }: { data: FarmSnapshot }) {
  const { t, l, selectedCycleId } = usePreferences()
  const { money } = useFormat()
  const { showSuccess } = useToast()
  const { addExpense } = useFarmActions()
  const router = useRouter()
  const cycle = data.cycles.find((c) => c.id === selectedCycleId)

  const [category, setCategory] = useState<ExpenseCategory | null>(null)
  const [amountText, setAmountText] = useState('')
  const [cropChoice, setCropChoice] = useState<string>(GENERAL)
  const [date, setDate] = useState(() => defaultDateForCycle(cycle))
  const [note, setNote] = useState('')
  const { submit, saving, fieldError, banner } = useFormSubmit<ExpenseField>()

  const crops = data.crops.filter((crop) => crop.cycleId === selectedCycleId)
  const categoryChoices: Choice<ExpenseCategory>[] = EXPENSE_CATEGORIES.map((value) => ({
    value,
    label: t(`categories.${value}`),
    icon: CATEGORY_ICONS[value],
  }))
  const cropChoices: Choice<string>[] = [
    ...crops.map((crop) => ({ value: crop.id, label: l(crop.name), icon: CROP_ICONS[crop.icon] })),
    { value: GENERAL, label: t('common.generalFarm'), icon: GENERAL_FARM_ICON },
  ]

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const amount = parseRupeesToPaise(amountText)
    const cropId = crops.some((c) => c.id === cropChoice) ? cropChoice : null
    const input = {
      cycleId: selectedCycleId,
      cropId,
      category: category as ExpenseCategory,
      amount,
      date,
      note: note.trim() || undefined,
    }
    submit(validateExpense(input, data), async () => {
      const expense = await addExpense({ ...input, amount: amount as number })
      showSuccess(t('expenses.saved', { amount: money(expense.amount), category: t(`categories.${expense.category}`) }))
      router.push('/expenses')
    })
  }

  return (
    <FormShell title={t('expenses.formTitle')} backHref="/expenses" onSubmit={handleSubmit}>
      <FormBanner message={banner} />
      <SeasonSelect cycles={data.cycles} className="sm:max-w-sm" />
      <FormStep step={1} title={t('expenses.stepCategory')}>
        <ChoiceGrid
          name="category"
          legend={t('common.category')}
          choices={categoryChoices}
          value={category}
          onChange={setCategory}
          error={fieldError('category')}
        />
      </FormStep>
      <FormStep step={2} title={t('expenses.stepAmount')}>
        <FormField id="expense-amount" label={t('common.amount')} hint={t('common.rupeesHint')} error={fieldError('amount')}>
          <AmountInput id="expense-amount" value={amountText} onChange={setAmountText} error={fieldError('amount')} hint />
        </FormField>
      </FormStep>
      <FormStep step={3} title={t('expenses.stepCrop')}>
        <ChoiceGrid
          name="crop"
          legend={t('common.crop')}
          choices={cropChoices}
          value={cropChoice}
          onChange={setCropChoice}
          columns="grid-cols-2 sm:grid-cols-3"
        />
      </FormStep>
      <FormStep step={4} title={t('expenses.stepDate')}>
        <FormField id="expense-date" label={t('common.date')} error={fieldError('date')}>
          <input
            id="expense-date"
            type="date"
            value={date}
            min={cycle?.startDate}
            max={cycle && cycle.endDate < todayISO() ? cycle.endDate : todayISO()}
            onChange={(event) => setDate(event.target.value)}
            className={INPUT_CLASS}
            {...describedBy('expense-date', { error: fieldError('date') })}
          />
        </FormField>
        <FormField id="expense-note" label={t('common.note')} optionalLabel={t('common.optional')}>
          <input
            id="expense-note"
            type="text"
            maxLength={120}
            value={note}
            placeholder={t('expenses.notePlaceholder')}
            onChange={(event) => setNote(event.target.value)}
            className={INPUT_CLASS}
          />
        </FormField>
      </FormStep>
      <FormActions saving={saving} cancelHref="/expenses" />
    </FormShell>
  )
}
