import { PaymentPageClient } from '@/components/sales/payment-page-client'

export default async function PaymentPage({ searchParams }: { searchParams: Promise<{ saleId?: string }> }) {
  const { saleId } = await searchParams
  return <PaymentPageClient saleId={typeof saleId === 'string' ? saleId : undefined} />
}
