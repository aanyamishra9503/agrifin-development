'use client'

import { SaleForm } from '@/components/sales/sale-form'
import { FarmDataGate } from '@/components/shared/states'

export default function NewSalePage() {
  return <FarmDataGate>{(data) => <SaleForm data={data} />}</FarmDataGate>
}
