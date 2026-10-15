import type { Crop, Expense, FarmSnapshot, HarvestCycle, Payment, Sale } from '../types'

/** Fictional sample data for the prototype. Amounts are in paise. */

const rupees = (value: number) => Math.round(value * 100)

const cycles: HarvestCycle[] = [
  {
    id: 'cycle-navarai-2026',
    name: { en: 'Navarai 2026 (Jan–May)', ta: 'நவரை 2026 (ஜன–மே)' },
    startDate: '2026-01-01',
    endDate: '2026-05-31',
  },
  {
    id: 'cycle-kuruvai-2026',
    name: { en: 'Kuruvai 2026 (Jun–Sep)', ta: 'குறுவை 2026 (ஜூன்–செப்)' },
    startDate: '2026-06-01',
    endDate: '2026-09-30',
  },
  {
    id: 'cycle-samba-2026',
    name: { en: 'Samba 2026–27 (Oct–Feb)', ta: 'சம்பா 2026–27 (அக்–பிப்)' },
    startDate: '2026-10-01',
    endDate: '2027-02-28',
  },
]

const crops: Crop[] = [
  { id: 'crop-nav-cotton', cycleId: 'cycle-navarai-2026', name: { en: 'Cotton', ta: 'பருத்தி' }, icon: 'flower', areaAcres: 2 },
  { id: 'crop-nav-groundnut', cycleId: 'cycle-navarai-2026', name: { en: 'Groundnut', ta: 'நிலக்கடலை' }, icon: 'nut', areaAcres: 1 },
  { id: 'crop-kur-paddy', cycleId: 'cycle-kuruvai-2026', name: { en: 'Paddy', ta: 'நெல்' }, icon: 'wheat', areaAcres: 3 },
  { id: 'crop-kur-groundnut', cycleId: 'cycle-kuruvai-2026', name: { en: 'Groundnut', ta: 'நிலக்கடலை' }, icon: 'nut', areaAcres: 1.5 },
  { id: 'crop-sam-paddy', cycleId: 'cycle-samba-2026', name: { en: 'Paddy', ta: 'நெல்' }, icon: 'wheat', areaAcres: 3 },
  { id: 'crop-sam-banana', cycleId: 'cycle-samba-2026', name: { en: 'Banana', ta: 'வாழை' }, icon: 'banana', areaAcres: 1 },
]

const expenses: Expense[] = [
  // Navarai 2026
  { id: 'exp-n1', cycleId: 'cycle-navarai-2026', cropId: 'crop-nav-cotton', category: 'seeds', amount: rupees(7200), date: '2026-01-08' },
  { id: 'exp-n2', cycleId: 'cycle-navarai-2026', cropId: 'crop-nav-groundnut', category: 'seeds', amount: rupees(6000), date: '2026-01-10' },
  { id: 'exp-n3', cycleId: 'cycle-navarai-2026', cropId: 'crop-nav-cotton', category: 'fertilizer', amount: rupees(9800), date: '2026-02-02' },
  { id: 'exp-n4', cycleId: 'cycle-navarai-2026', cropId: null, category: 'irrigation', amount: rupees(6500), date: '2026-02-20', note: 'Motor repair' },
  { id: 'exp-n5', cycleId: 'cycle-navarai-2026', cropId: 'crop-nav-cotton', category: 'pesticides', amount: rupees(5400), date: '2026-03-05' },
  { id: 'exp-n6', cycleId: 'cycle-navarai-2026', cropId: 'crop-nav-cotton', category: 'labour', amount: rupees(14000), date: '2026-04-18', note: 'Cotton picking' },
  { id: 'exp-n7', cycleId: 'cycle-navarai-2026', cropId: 'crop-nav-groundnut', category: 'labour', amount: rupees(6500), date: '2026-04-25' },
  { id: 'exp-n8', cycleId: 'cycle-navarai-2026', cropId: null, category: 'transport', amount: rupees(3800), date: '2026-05-06' },
  // Kuruvai 2026
  { id: 'exp-k1', cycleId: 'cycle-kuruvai-2026', cropId: 'crop-kur-paddy', category: 'seeds', amount: rupees(4800), date: '2026-06-04' },
  { id: 'exp-k2', cycleId: 'cycle-kuruvai-2026', cropId: 'crop-kur-groundnut', category: 'seeds', amount: rupees(9000), date: '2026-06-06' },
  { id: 'exp-k3', cycleId: 'cycle-kuruvai-2026', cropId: 'crop-kur-paddy', category: 'labour', amount: rupees(18000), date: '2026-06-22', note: 'Transplanting' },
  { id: 'exp-k4', cycleId: 'cycle-kuruvai-2026', cropId: 'crop-kur-paddy', category: 'fertilizer', amount: rupees(12500), date: '2026-07-03', note: 'Urea and DAP' },
  { id: 'exp-k5', cycleId: 'cycle-kuruvai-2026', cropId: 'crop-kur-groundnut', category: 'fertilizer', amount: rupees(5500), date: '2026-07-05' },
  { id: 'exp-k6', cycleId: 'cycle-kuruvai-2026', cropId: null, category: 'irrigation', amount: rupees(7500), date: '2026-07-15', note: 'Diesel for pump' },
  { id: 'exp-k7', cycleId: 'cycle-kuruvai-2026', cropId: 'crop-kur-paddy', category: 'pesticides', amount: rupees(6200), date: '2026-08-01' },
  { id: 'exp-k8', cycleId: 'cycle-kuruvai-2026', cropId: 'crop-kur-groundnut', category: 'pesticides', amount: rupees(3100), date: '2026-08-04' },
  { id: 'exp-k9', cycleId: 'cycle-kuruvai-2026', cropId: 'crop-kur-groundnut', category: 'labour', amount: rupees(8000), date: '2026-08-28', note: 'Harvest' },
  { id: 'exp-k10', cycleId: 'cycle-kuruvai-2026', cropId: 'crop-kur-paddy', category: 'labour', amount: rupees(15000), date: '2026-09-08', note: 'Harvest' },
  { id: 'exp-k11', cycleId: 'cycle-kuruvai-2026', cropId: null, category: 'transport', amount: rupees(4200), date: '2026-09-12', note: 'Tractor to mill' },
  // Samba 2026–27 (in progress)
  { id: 'exp-s1', cycleId: 'cycle-samba-2026', cropId: 'crop-sam-banana', category: 'seeds', amount: rupees(11000), date: '2026-10-03', note: 'Banana suckers' },
  { id: 'exp-s2', cycleId: 'cycle-samba-2026', cropId: 'crop-sam-paddy', category: 'seeds', amount: rupees(5200), date: '2026-10-06' },
  { id: 'exp-s3', cycleId: 'cycle-samba-2026', cropId: null, category: 'labour', amount: rupees(6000), date: '2026-10-10', note: 'Field preparation' },
]

const sales: Sale[] = [
  { id: 'sale-n1', cycleId: 'cycle-navarai-2026', cropId: 'crop-nav-cotton', quantity: 12, unit: 'quintal', buyer: 'Kaveri Cotton Ginning', amount: rupees(84000), date: '2026-04-28' },
  { id: 'sale-n2', cycleId: 'cycle-navarai-2026', cropId: 'crop-nav-groundnut', quantity: 5, unit: 'quintal', buyer: 'Lakshmi Traders', amount: rupees(31500), date: '2026-05-10' },
  { id: 'sale-k1', cycleId: 'cycle-kuruvai-2026', cropId: 'crop-kur-groundnut', quantity: 9, unit: 'quintal', buyer: 'Lakshmi Traders', amount: rupees(58500), date: '2026-09-02' },
  { id: 'sale-k2', cycleId: 'cycle-kuruvai-2026', cropId: 'crop-kur-groundnut', quantity: 2, unit: 'quintal', buyer: 'Village shop (Ravi)', amount: rupees(13000), date: '2026-09-05' },
  { id: 'sale-k3', cycleId: 'cycle-kuruvai-2026', cropId: 'crop-kur-paddy', quantity: 42, unit: 'quintal', buyer: 'Sri Murugan Rice Mill', amount: rupees(96600), date: '2026-09-14' },
  { id: 'sale-k4', cycleId: 'cycle-kuruvai-2026', cropId: 'crop-kur-paddy', quantity: 18, unit: 'quintal', buyer: 'Regulated Market, Thanjavur', amount: rupees(41400), date: '2026-09-20' },
]

const payments: Payment[] = [
  { id: 'pay-n1', saleId: 'sale-n1', amount: rupees(84000), date: '2026-04-28', requestId: 'seed-pay-n1' },
  { id: 'pay-n2', saleId: 'sale-n2', amount: rupees(20000), date: '2026-05-10', requestId: 'seed-pay-n2' },
  { id: 'pay-n3', saleId: 'sale-n2', amount: rupees(11500), date: '2026-06-02', requestId: 'seed-pay-n3' },
  { id: 'pay-k1', saleId: 'sale-k1', amount: rupees(30000), date: '2026-09-02', requestId: 'seed-pay-k1' },
  { id: 'pay-k3', saleId: 'sale-k3', amount: rupees(60000), date: '2026-09-14', requestId: 'seed-pay-k3' },
  { id: 'pay-k4', saleId: 'sale-k3', amount: rupees(20000), date: '2026-10-05', requestId: 'seed-pay-k4' },
  { id: 'pay-k5', saleId: 'sale-k4', amount: rupees(41400), date: '2026-09-20', requestId: 'seed-pay-k5' },
]

export const DEFAULT_CYCLE_ID = 'cycle-kuruvai-2026'

export function createSampleSnapshot(): FarmSnapshot {
  return structuredClone({ cycles, crops, expenses, sales, payments })
}
