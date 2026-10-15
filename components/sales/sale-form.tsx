'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { usePreferences } from '@/components/providers/preferences-provider'
import { useToast } from '@/components/providers/toast-provider'
import { CROP_ICONS } from '@/components/shared/domain-icons'
import {
  AmountInput,
  ChoiceGrid,
  FormField,
  FormSummary,
  INPUT_CLASS,
  SELECT_CLASS,
  describedBy,
  type Choice,
} from '@/components/shared/form-field'
import { FormActions, FormBanner, FormShell, FormStep } from '@/components/shared/form-layout'
import { SeasonSelect } from '@/components/shared/season-select'
import { useFormSubmit } from '@/components/shared/use-form-submit'
import { useFormat } from '@/components/shared/use-format'
import { useFarmActions } from '@/lib/data/use-farm-data'
import { todayISO } from '@/lib/dates'
import { defaultDateForCycle } from '@/lib/filters'
import { parseRupeesToPaise } from '@/lib/money'
import { SALE_UNITS, type FarmSnapshot, type SaleUnit } from '@/lib/types'
import { cn } from '@/lib/utils'
import { validateSale, type SaleField } from '@/lib/validation'

function QuickFillButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-h-11 rounded-full border-2 border-border bg-card px-4 text-sm font-semibold hover:border-primary hover:text-primary"
    >
      {label}
    </button>
  )
}

export function SaleForm({ data }: { data: FarmSnapshot }) {
  const { t, l, selectedCycleId } = usePreferences()
  const { money } = useFormat()
  const { showSuccess } = useToast()
  const { addSale } = useFarmActions()
  const router = useRouter()
  const cycle = data.cycles.find((c) => c.id === selectedCycleId)
  const crops = data.crops.filter((crop) => crop.cycleId === selectedCycleId)

  const [cropId, setCropId] = useState<string | null>(crops.length === 1 ? crops[0].id : null)
  const [quantityText, setQuantityText] = useState('')
  const [unit, setUnit] = useState<SaleUnit>('quintal')
  const [buyer, setBuyer] = useState('')
  const [amountText, setAmountText] = useState('')
  const [receivedText, setReceivedText] = useState('')
  const [date, setDate] = useState(() => defaultDateForCycle(cycle))
  const [requestId] = useState(() => crypto.randomUUID())
  const { submit, saving, fieldError, banner } = useFormSubmit<SaleField>()

  const knownBuyers = [...new Set(data.sales.map((s) => s.buyer))].sort()
  const cropChoices: Choice<string>[] = crops.map((crop) => ({
    value: crop.id,
    label: l(crop.name),
    icon: CROP_ICONS[crop.icon],
  }))

  const amount = parseRupeesToPaise(amountText)
  const received = receivedText.trim() === '' ? 0 : parseRupeesToPaise(receivedText)
  const balancePreview = amount !== null && received !== null ? Math.max(0, amount - received) : null

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const quantity = quantityText.trim() === '' ? null : Number(quantityText.replace(',', '.'))
    const input = {
      cycleId: selectedCycleId,
      cropId: cropId ?? '',
      quantity,
      unit,
      buyer: buyer.trim(),
      amount,
      amountReceived: received,
      date,
      requestId,
    }
    submit(validateSale(input, data), async () => {
      const { sale } = await addSale({
        ...input,
        quantity: quantity as number,
        amount: amount as number,
        amountReceived: received as number,
      })
      showSuccess(t('sales.saved', { amount: money(sale.amount), buyer: sale.buyer }))
      router.push('/sales')
    })
  }

  return (
    <FormShell title={t('sales.formTitle')} backHref="/sales" onSubmit={handleSubmit}>
      <FormBanner message={banner} />
      <SeasonSelect cycles={data.cycles} className="sm:max-w-sm" />
      <FormStep step={1} title={t('sales.stepCrop')}>
        <ChoiceGrid
          name="sale-crop"
          legend={t('common.crop')}
          choices={cropChoices}
          value={cropId}
          onChange={setCropId}
          error={fieldError('cropId')}
          columns="grid-cols-2 sm:grid-cols-3"
        />
      </FormStep>

      <FormStep step={2} title={t('sales.stepQuantity')}>
        <div className="grid grid-cols-[1fr_auto] gap-3">
          <FormField id="sale-quantity" label={t('sales.quantity')} error={fieldError('quantity')}>
            <input
              id="sale-quantity"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              placeholder="0"
              value={quantityText}
              onChange={(event) => setQuantityText(event.target.value)}
              className={cn(INPUT_CLASS, 'text-xl font-semibold tabular-nums')}
              {...describedBy('sale-quantity', { error: fieldError('quantity') })}
            />
          </FormField>
          <FormField id="sale-unit" label={t('sales.unit')}>
            <select
              id="sale-unit"
              value={unit}
              onChange={(event) => setUnit(event.target.value as SaleUnit)}
              className={cn(SELECT_CLASS, 'h-14 min-w-36')}
            >
              {SALE_UNITS.map((value) => (
                <option key={value} value={value}>
                  {t(`units.${value}`)}
                </option>
              ))}
            </select>
          </FormField>
        </div>
      </FormStep>

      <FormStep step={3} title={t('sales.stepBuyer')}>
        <FormField id="sale-buyer" label={t('sales.buyer')} error={fieldError('buyer')}>
          <input
            id="sale-buyer"
            type="text"
            list="known-buyers"
            maxLength={80}
            autoComplete="off"
            placeholder={t('sales.buyerPlaceholder')}
            value={buyer}
            onChange={(event) => setBuyer(event.target.value)}
            className={INPUT_CLASS}
            {...describedBy('sale-buyer', { error: fieldError('buyer') })}
          />
          <datalist id="known-buyers">
            {knownBuyers.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </FormField>
        {knownBuyers.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {knownBuyers.slice(0, 4).map((name) => (
              <QuickFillButton key={name} label={name} onClick={() => setBuyer(name)} />
            ))}
          </div>
        )}
      </FormStep>

      <FormStep step={4} title={t('sales.stepMoney')}>
        <FormField id="sale-amount" label={t('sales.saleAmount')} hint={t('common.rupeesHint')} error={fieldError('amount')}>
          <AmountInput id="sale-amount" value={amountText} onChange={setAmountText} error={fieldError('amount')} hint />
        </FormField>
        <FormField
          id="sale-received"
          label={t('sales.amountReceived')}
          hint={t('sales.amountReceivedHint')}
          error={fieldError('amountReceived')}
        >
          <AmountInput
            id="sale-received"
            value={receivedText}
            onChange={setReceivedText}
            error={fieldError('amountReceived')}
            hint
          />
        </FormField>
        <div className="flex flex-wrap gap-2">
          <QuickFillButton label={`${t('status.unpaid')} (₹0)`} onClick={() => setReceivedText('0')} />
          {amount !== null && amount > 0 && (
            <QuickFillButton label={t('status.paid')} onClick={() => setReceivedText(amountText)} />
          )}
        </div>
        <FormField id="sale-date" label={t('common.date')} error={fieldError('date')}>
          <input
            id="sale-date"
            type="date"
            value={date}
            min={cycle?.startDate}
            max={cycle && cycle.endDate < todayISO() ? cycle.endDate : todayISO()}
            onChange={(event) => setDate(event.target.value)}
            className={INPUT_CLASS}
            {...describedBy('sale-date', { error: fieldError('date') })}
          />
        </FormField>
        {balancePreview !== null && amount !== null && amount > 0 && (
          <div aria-live="polite">
            <FormSummary
              title={t('common.youAreSaving')}
              rows={[
                { label: t('sales.saleAmount'), value: money(amount) },
                { label: t('sales.amountReceived'), value: money(received ?? 0) },
                { label: t('sales.balanceDue'), value: money(balancePreview) },
              ]}
            />
          </div>
        )}
      </FormStep>

      <FormActions saving={saving} cancelHref="/sales" />
    </FormShell>
  )
}
