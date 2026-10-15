'use client'

import { CircleCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { usePreferences } from '@/components/providers/preferences-provider'
import { useToast } from '@/components/providers/toast-provider'
import { AddButtonLink } from '@/components/shared/add-button-link'
import { CROP_ICONS } from '@/components/shared/domain-icons'
import { AmountInput, FieldError, FormField, FormSummary, INPUT_CLASS, describedBy } from '@/components/shared/form-field'
import { FormActions, FormBanner, FormShell, FormStep } from '@/components/shared/form-layout'
import { SeasonSelect } from '@/components/shared/season-select'
import { EmptyState } from '@/components/shared/states'
import { useFormSubmit } from '@/components/shared/use-form-submit'
import { useFormat } from '@/components/shared/use-format'
import { useFarmActions } from '@/lib/data/use-farm-data'
import { todayISO } from '@/lib/dates'
import { balanceDueForSale, salesForCycle } from '@/lib/finance'
import { parseRupeesToPaise } from '@/lib/money'
import type { FarmSnapshot } from '@/lib/types'
import { cn } from '@/lib/utils'
import { validatePayment, type PaymentField } from '@/lib/validation'

export function PaymentForm({ data, initialSaleId }: { data: FarmSnapshot; initialSaleId?: string }) {
  const { t, l, selectedCycleId } = usePreferences()
  const { money, date: formatDate } = useFormat()
  const { showSuccess } = useToast()
  const { addPayment } = useFarmActions()
  const router = useRouter()

  const initialSale = data.sales.find((s) => s.id === initialSaleId)
  const cycleId = initialSale?.cycleId ?? selectedCycleId
  const pendingSales = salesForCycle(cycleId, data.sales)
    .map((sale) => ({ sale, balance: balanceDueForSale(sale, data.payments) }))
    .filter(({ balance }) => balance > 0)
    .sort((a, b) => a.sale.date.localeCompare(b.sale.date))

  const [saleId, setSaleId] = useState<string | null>(
    initialSale && balanceDueForSale(initialSale, data.payments) > 0
      ? initialSale.id
      : pendingSales.length === 1
        ? pendingSales[0].sale.id
        : null,
  )
  const [amountText, setAmountText] = useState('')
  const [date, setDate] = useState(todayISO)
  const [requestId] = useState(() => crypto.randomUUID())
  const { submit, saving, fieldError, banner } = useFormSubmit<PaymentField>()

  const selected = pendingSales.find((p) => p.sale.id === saleId)
  const amount = parseRupeesToPaise(amountText)

  if (pendingSales.length === 0) {
    return (
      <FormShell title={t('sales.paymentTitle')} backHref="/sales" onSubmit={(event) => event.preventDefault()}>
        <SeasonSelect cycles={data.cycles} className="sm:max-w-sm" />
        <EmptyState
          icon={CircleCheck}
          title={t('sales.noPendingTitle')}
          description={t('sales.noPendingDescription')}
          action={<AddButtonLink href="/sales" label={t('nav.sales')} variant="outline" />}
        />
      </FormShell>
    )
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const input = { saleId: saleId ?? '', amount, date, requestId }
    submit(validatePayment(input, data), async () => {
      const payment = await addPayment({ ...input, amount: amount as number })
      const buyer = data.sales.find((s) => s.id === payment.saleId)?.buyer ?? ''
      showSuccess(t('sales.paymentSaved', { amount: money(payment.amount), buyer }))
      router.push('/sales')
    })
  }

  const saleError = fieldError('saleId')

  return (
    <FormShell title={t('sales.paymentTitle')} backHref="/sales" onSubmit={handleSubmit}>
      <FormBanner message={banner} />
      {!initialSale && <SeasonSelect cycles={data.cycles} className="sm:max-w-sm" />}
      <FormStep step={1} title={t('sales.stepSale')}>
        <fieldset className="flex flex-col gap-3" aria-describedby={saleError ? 'payment-sale-error' : undefined}>
          <legend className="sr-only">{t('sales.stepSale')}</legend>
          {pendingSales.map(({ sale, balance }) => {
            const crop = data.crops.find((c) => c.id === sale.cropId)
            const Icon = crop ? CROP_ICONS[crop.icon] : CircleCheck
            const checked = saleId === sale.id
            return (
              <label
                key={sale.id}
                className={cn(
                  'flex min-h-20 cursor-pointer items-center gap-4 rounded-2xl border-2 bg-card p-4 transition-colors has-focus-visible:ring-3 has-focus-visible:ring-primary/30',
                  checked ? 'border-primary bg-secondary' : 'border-border hover:border-primary/50',
                )}
              >
                <input
                  type="radio"
                  name="payment-sale"
                  value={sale.id}
                  checked={checked}
                  onChange={() => {
                    setSaleId(sale.id)
                    setAmountText('')
                  }}
                  className="size-5 shrink-0 accent-primary"
                />
                <Icon className="size-7 shrink-0 text-earth" aria-hidden="true" />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-base font-semibold">{sale.buyer}</span>
                  <span className="truncate text-sm text-muted-foreground">
                    {crop ? l(crop.name) : ''} · {formatDate(sale.date)}
                  </span>
                </span>
                <span className="shrink-0 text-right text-base font-bold tabular-nums text-destructive">
                  {t('sales.dueFrom', { amount: money(balance) })}
                </span>
              </label>
            )
          })}
          <FieldError id="payment-sale-error" message={saleError} />
        </fieldset>
      </FormStep>

      <FormStep step={2} title={t('sales.paymentAmount')}>
        <FormField id="payment-amount" label={t('common.amount')} hint={t('common.rupeesHint')} error={fieldError('amount')}>
          <AmountInput id="payment-amount" value={amountText} onChange={setAmountText} error={fieldError('amount')} hint />
        </FormField>
        {selected && (
          <button
            type="button"
            onClick={() => setAmountText(String(selected.balance / 100))}
            className="min-h-11 w-fit rounded-full border-2 border-border bg-card px-4 text-sm font-semibold hover:border-primary hover:text-primary"
          >
            {t('sales.payFullBalance', { amount: money(selected.balance) })}
          </button>
        )}
        <FormField id="payment-date" label={t('common.date')} error={fieldError('date')}>
          <input
            id="payment-date"
            type="date"
            value={date}
            min={selected?.sale.date}
            max={todayISO()}
            onChange={(event) => setDate(event.target.value)}
            className={INPUT_CLASS}
            {...describedBy('payment-date', { error: fieldError('date') })}
          />
        </FormField>
        {selected && amount !== null && amount > 0 && amount <= selected.balance && (
          <div aria-live="polite">
            <FormSummary
              title={t('common.youAreSaving')}
              rows={[
                { label: t('sales.balanceDue'), value: money(selected.balance) },
                { label: t('sales.paymentAmount'), value: money(amount) },
                { label: t('sales.balanceAfter'), value: money(selected.balance - amount) },
              ]}
            />
          </div>
        )}
      </FormStep>

      <FormActions saving={saving} cancelHref="/sales" />
    </FormShell>
  )
}
