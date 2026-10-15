'use client'

import Link from 'next/link'
import { Wallet } from 'lucide-react'
import { usePreferences } from '@/components/providers/preferences-provider'
import { CROP_ICONS, IconBadge } from '@/components/shared/domain-icons'
import { StatusBadge } from '@/components/shared/status-badge'
import { useFormat } from '@/components/shared/use-format'
import { amountReceivedForSale, balanceDueForSale, paymentsForSale, saleStatus } from '@/lib/finance'
import type { Crop, Payment, Sale } from '@/lib/types'

export function SaleCard({ sale, crop, payments }: { sale: Sale; crop?: Crop; payments: Payment[] }) {
  const { t, l } = usePreferences()
  const { money, number, date } = useFormat()
  const received = amountReceivedForSale(sale, payments)
  const balance = balanceDueForSale(sale, payments)
  const status = saleStatus(sale, payments)
  const history = paymentsForSale(sale.id, payments).sort((a, b) => a.date.localeCompare(b.date))
  const paidPercent = sale.amount > 0 ? Math.round((received / sale.amount) * 100) : 0

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:p-5">
      <header className="flex items-start gap-3">
        {crop && <IconBadge icon={CROP_ICONS[crop.icon]} />}
        <div className="flex min-w-0 flex-1 flex-col">
          <h3 className="truncate text-lg font-semibold">{sale.buyer}</h3>
          <p className="text-sm text-muted-foreground">
            {crop ? l(crop.name) : ''} · {number(sale.quantity)} {t(`unitsShort.${sale.unit}`)} · {date(sale.date)}
          </p>
        </div>
        <StatusBadge status={status} />
      </header>

      <dl className="grid grid-cols-3 gap-2 rounded-xl bg-muted p-3 text-center">
        <div>
          <dt className="text-xs font-medium text-muted-foreground">{t('sales.saleValue')}</dt>
          <dd className="text-base font-bold tabular-nums">{money(sale.amount)}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-muted-foreground">{t('sales.received')}</dt>
          <dd className="text-base font-bold tabular-nums text-primary">{money(received)}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-muted-foreground">{t('sales.balanceDue')}</dt>
          <dd className={balance > 0 ? 'text-base font-bold tabular-nums text-destructive' : 'text-base font-bold tabular-nums'}>
            {money(balance)}
          </dd>
        </div>
      </dl>

      <div
        className="h-2 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-label={t('sales.received')}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={paidPercent}
      >
        <div className="h-full rounded-full bg-primary" style={{ width: `${paidPercent}%` }} />
      </div>

      <details className="group">
        <summary className="flex min-h-11 cursor-pointer list-none items-center text-sm font-semibold text-primary">
          {t('sales.paymentHistory')} ({history.length})
        </summary>
        {history.length === 0 ? (
          <p className="pt-1 text-sm text-muted-foreground">{t('sales.noPayments')}</p>
        ) : (
          <ul className="flex flex-col gap-1 pt-1">
            {history.map((payment) => (
              <li key={payment.id} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{date(payment.date)}</span>
                <span className="font-semibold tabular-nums">{money(payment.amount)}</span>
              </li>
            ))}
          </ul>
        )}
      </details>

      {balance > 0 && (
        <Link
          href={`/sales/payment?saleId=${encodeURIComponent(sale.id)}`}
          className="no-print flex h-12 items-center justify-center gap-2 rounded-xl border-2 border-primary text-base font-semibold text-primary hover:bg-secondary"
        >
          <Wallet className="size-5" aria-hidden="true" />
          {t('sales.receivePayment')}
        </Link>
      )}
    </article>
  )
}
