'use client'

import { FarmDataGate } from '@/components/shared/states'
import { PaymentForm } from './payment-form'

export function PaymentPageClient({ saleId }: { saleId?: string }) {
  return <FarmDataGate>{(data) => <PaymentForm data={data} initialSaleId={saleId} />}</FarmDataGate>
}
