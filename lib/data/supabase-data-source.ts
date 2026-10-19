
import { createClient } from '@/lib/supabase/client'
import { hasErrors, validateExpense, validatePayment, validateSale } from '../validation'
import type {
  Crop,
  CropIcon,
  Expense,
  ExpenseCategory,
  FarmSnapshot,
  HarvestCycle,
  NewExpenseInput,
  NewPaymentInput,
  NewSaleInput,
  Payment,
  Sale,
  SaleUnit,
} from '../types'
import { ValidationError, type FarmDataSource } from './data-source'

type SupabaseClientType = ReturnType<typeof createClient>

type DbCycle = {
  id: string
  name: string
  start_date: string
  end_date: string
  status: string
}

type DbCatalogCrop = {
  id: string
  name_en: string
  name_ta: string
}

type DbCycleCrop = {
  id: string
  harvest_cycle_id: string
  crop_id: string
  area_acres: number | string | null
  crops: DbCatalogCrop | DbCatalogCrop[] | null
}

type DbExpense = {
  id: string
  harvest_cycle_id: string
  cycle_crop_id: string | null
  category: string
  amount_paise: number | string
  expense_date: string
  description: string
}

type DbSale = {
  id: string
  harvest_cycle_id: string
  cycle_crop_id: string
  quantity: number | string
  unit: string
  buyer_name: string
  total_amount_paise: number | string
  sale_date: string
  request_id: string
}

type DbPayment = {
  id: string
  sale_id: string
  amount_paise: number | string
  payment_date: string
  request_id: string
}

function throwIfError(error: { message: string } | null) {
  if (error) throw new Error(error.message)
}

function cycleName(name: string): { en: string; ta: string } {
  if (name.startsWith('Navarai')) {
    return { en: name, ta: 'நவரை 2026 (ஜன–மே)' }
  }
  if (name.startsWith('Kuruvai')) {
    return { en: name, ta: 'குறுவை 2026 (ஜூன்–செப்)' }
  }
  if (name.startsWith('Samba')) {
    return { en: name, ta: 'சம்பா 2026–27 (அக்–பிப்)' }
  }
  return { en: name, ta: name }
}

function iconForCrop(name: string): CropIcon {
  const value = name.toLowerCase()
  if (value.includes('groundnut')) return 'nut'
  if (value.includes('cotton')) return 'flower'
  if (value.includes('banana')) return 'banana'
  if (value.includes('paddy') || value.includes('rice')) return 'wheat'
  if (value.includes('sugarcane') || value.includes('maize')) return 'sprout'
  return 'leaf'
}

function mapCycle(row: DbCycle): HarvestCycle {
  return {
    id: row.id,
    name: cycleName(row.name),
    startDate: row.start_date,
    endDate: row.end_date,
  }
}

function mapCrop(row: DbCycleCrop): Crop {
  const joinedCrop = Array.isArray(row.crops) ? row.crops[0] : row.crops
  const nameEn = joinedCrop?.name_en ?? 'Crop'
  const nameTa = joinedCrop?.name_ta ?? nameEn

  return {
    // The app uses the season-specific crop ID for expenses and sales.
    id: row.id,
    cycleId: row.harvest_cycle_id,
    name: { en: nameEn, ta: nameTa },
    icon: iconForCrop(nameEn),
    areaAcres: Number(row.area_acres ?? 0),
  }
}

function mapExpense(row: DbExpense): Expense {
  return {
    id: row.id,
    cycleId: row.harvest_cycle_id,
    cropId: row.cycle_crop_id,
    category: row.category as ExpenseCategory,
    amount: Number(row.amount_paise),
    date: row.expense_date,
    note: row.description || undefined,
  }
}

function mapSale(row: DbSale): Sale {
  return {
    id: row.id,
    cycleId: row.harvest_cycle_id,
    cropId: row.cycle_crop_id,
    quantity: Number(row.quantity),
    unit: row.unit as SaleUnit,
    buyer: row.buyer_name,
    amount: Number(row.total_amount_paise),
    date: row.sale_date,
  }
}

function mapPayment(row: DbPayment): Payment {
  return {
    id: row.id,
    saleId: row.sale_id,
    amount: Number(row.amount_paise),
    date: row.payment_date,
    requestId: row.request_id,
  }
}

const DEFAULT_CYCLES = [
  {
    name: 'Navarai 2026 (Jan–May)',
    start_date: '2026-01-01',
    end_date: '2026-05-31',
    status: 'completed',
  },
  {
    name: 'Kuruvai 2026 (Jun–Sep)',
    start_date: '2026-06-01',
    end_date: '2026-09-30',
    status: 'completed',
  },
  {
    name: 'Samba 2026–27 (Oct–Feb)',
    start_date: '2026-10-01',
    end_date: '2027-02-28',
    status: 'active',
  },
]

const DEFAULT_CYCLE_CROPS = [
  { cyclePrefix: 'Navarai', cropName: 'Cotton', areaAcres: 2 },
  { cyclePrefix: 'Navarai', cropName: 'Groundnut', areaAcres: 1 },
  { cyclePrefix: 'Kuruvai', cropName: 'Paddy', areaAcres: 3 },
  { cyclePrefix: 'Kuruvai', cropName: 'Groundnut', areaAcres: 1.5 },
  { cyclePrefix: 'Samba', cropName: 'Paddy', areaAcres: 3 },
  { cyclePrefix: 'Samba', cropName: 'Banana', areaAcres: 1 },
]

async function ensureInitialFarmData(
  supabase: SupabaseClientType,
  farmId: string,
) {
  // Create the three default harvest seasons if they are missing.
  const { data: existingCyclesData, error: cyclesError } = await supabase
    .from('harvest_cycles')
    .select('id, name, start_date, end_date, status')
    .eq('farm_id', farmId)

  throwIfError(cyclesError)

  let cycles = (existingCyclesData ?? []) as DbCycle[]
  const existingNames = new Set(cycles.map((cycle) => cycle.name))
  const missingCycles = DEFAULT_CYCLES.filter(
    (cycle) => !existingNames.has(cycle.name),
  )

  if (missingCycles.length > 0) {
    const { data: insertedCycles, error } = await supabase
      .from('harvest_cycles')
      .insert(
        missingCycles.map((cycle) => ({ ...cycle, farm_id: farmId })),
      )
      .select('id, name, start_date, end_date, status')

    throwIfError(error)
    cycles = [...cycles, ...((insertedCycles ?? []) as DbCycle[])]
  }

  // Load the active shared crop catalogue.
  const { data: catalogueData, error: catalogueError } = await supabase
    .from('crops')
    .select('id, name_en, name_ta')
    .eq('is_active', true)

  throwIfError(catalogueError)
  const catalogue = (catalogueData ?? []) as DbCatalogCrop[]

  // Add the default season-to-crop assignments where they are missing.
  const { data: existingLinksData, error: linksError } = await supabase
    .from('cycle_crops')
    .select('harvest_cycle_id, crop_id')
    .eq('farm_id', farmId)

  throwIfError(linksError)

  const existingLinks = new Set(
    (existingLinksData ?? []).map(
      (link: { harvest_cycle_id: string; crop_id: string }) =>
        `${link.harvest_cycle_id}:${link.crop_id}`,
    ),
  )

  const linksToInsert = DEFAULT_CYCLE_CROPS.flatMap((target) => {
    const cycle = cycles.find((item) =>
      item.name.startsWith(target.cyclePrefix),
    )
    const crop = catalogue.find(
      (item) => item.name_en.toLowerCase() === target.cropName.toLowerCase(),
    )

    if (!cycle || !crop) return []

    const key = `${cycle.id}:${crop.id}`
    if (existingLinks.has(key)) return []

    return [{
      farm_id: farmId,
      harvest_cycle_id: cycle.id,
      crop_id: crop.id,
      area_acres: target.areaAcres,
    }]
  })

  if (linksToInsert.length > 0) {
    const { error } = await supabase
      .from('cycle_crops')
      .insert(linksToInsert)

    throwIfError(error)
  }
}

async function getFarmContext() {
  const supabase = createClient()

  const { data: authData, error: authError } = await supabase.auth.getUser()
  throwIfError(authError)

  const user = authData.user
  if (!user) {
    throw new Error('Please sign in at /login before opening your farm records.')
  }

  // Ensure the signed-in user has a profile.
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()

  throwIfError(profileError)

  if (!profile) {
    const { error } = await supabase.from('profiles').insert({
      id: user.id,
      full_name: String(user.user_metadata?.full_name ?? ''),
      village: '',
      preferred_language: 'en',
    })
    throwIfError(error)
  }

  // Load the user's farm, creating one if this account doesn't have one.
  const { data: existingFarm, error: farmQueryError } = await supabase
    .from('farms')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle()

  throwIfError(farmQueryError)

  let farmId = existingFarm?.id as string | undefined

  if (!farmId) {
    const { data: createdFarm, error } = await supabase
      .from('farms')
      .insert({
        owner_id: user.id,
        farm_name: 'My Farm',
        village: '',
      })
      .select('id')
      .single()

    throwIfError(error)
    if (!createdFarm) {
      throw new Error('Farm creation did not return a record.')
    }

    farmId = createdFarm.id as string
  }

  await ensureInitialFarmData(supabase, farmId)
  return { supabase, user, farmId }
}

async function loadSnapshot(
  supabase: SupabaseClientType,
  farmId: string,
): Promise<FarmSnapshot> {
  const [
    cyclesResult,
    cropsResult,
    expensesResult,
    salesResult,
    paymentsResult,
  ] = await Promise.all([
    supabase
      .from('harvest_cycles')
      .select('id, name, start_date, end_date, status')
      .eq('farm_id', farmId)
      .order('start_date'),
    supabase
      .from('cycle_crops')
      .select('id, harvest_cycle_id, crop_id, area_acres, crops(name_en, name_ta)')
      .eq('farm_id', farmId),
    supabase
      .from('expenses')
      .select('id, harvest_cycle_id, cycle_crop_id, category, amount_paise, expense_date, description')
      .eq('farm_id', farmId)
      .order('expense_date'),
    supabase
      .from('sales')
      .select('id, harvest_cycle_id, cycle_crop_id, quantity, unit, buyer_name, total_amount_paise, sale_date, request_id')
      .eq('farm_id', farmId)
      .order('sale_date'),
    supabase
      .from('payments')
      .select('id, sale_id, amount_paise, payment_date, request_id')
      .eq('farm_id', farmId)
      .order('payment_date'),
  ])

  throwIfError(cyclesResult.error)
  throwIfError(cropsResult.error)
  throwIfError(expensesResult.error)
  throwIfError(salesResult.error)
  throwIfError(paymentsResult.error)

  return {
    cycles: ((cyclesResult.data ?? []) as DbCycle[]).map(mapCycle),
    crops: ((cropsResult.data ?? []) as DbCycleCrop[]).map(mapCrop),
    expenses: ((expensesResult.data ?? []) as DbExpense[]).map(mapExpense),
    sales: ((salesResult.data ?? []) as DbSale[]).map(mapSale),
    payments: ((paymentsResult.data ?? []) as DbPayment[]).map(mapPayment),
  }
}

export function createSupabaseDataSource(): FarmDataSource {
  return {
    async getSnapshot() {
      const { supabase, farmId } = await getFarmContext()
      return loadSnapshot(supabase, farmId)
    },

    async createExpense(input: NewExpenseInput) {
      const { supabase, user, farmId } = await getFarmContext()
      const snapshot = await loadSnapshot(supabase, farmId)

      const errors: Record<string, string | undefined> = {
        ...validateExpense(input, snapshot),
      }

      if (
        input.cropId &&
        !snapshot.crops.some(
          (crop) =>
            crop.id === input.cropId && crop.cycleId === input.cycleId,
        )
      ) {
        errors.cropId = 'errors.cropRequired'
      }

      if (hasErrors(errors)) throw new ValidationError(errors)

      const { data, error } = await supabase
        .from('expenses')
        .insert({
          farm_id: farmId,
          harvest_cycle_id: input.cycleId,
          cycle_crop_id: input.cropId,
          category: input.category,
          description: input.note?.trim() ?? '',
          amount_paise: input.amount,
          expense_date: input.date,
          created_by: user.id,
        })
        .select('id, harvest_cycle_id, cycle_crop_id, category, amount_paise, expense_date, description')
        .single()

      throwIfError(error)
      return mapExpense(data as DbExpense)
    },

    async createSale(input: NewSaleInput) {
      const { supabase, user, farmId } = await getFarmContext()

      // If the same sale request is retried, return its existing result.
      const { data: previousSale, error: previousSaleError } = await supabase
        .from('sales')
        .select('id, harvest_cycle_id, cycle_crop_id, quantity, unit, buyer_name, total_amount_paise, sale_date, request_id')
        .eq('farm_id', farmId)
        .eq('request_id', input.requestId)
        .maybeSingle()

      throwIfError(previousSaleError)

      if (previousSale) {
        const { data: previousPayment, error: previousPaymentError } =
          await supabase
            .from('payments')
            .select('id, sale_id, amount_paise, payment_date, request_id')
            .eq('farm_id', farmId)
            .eq('request_id', input.requestId)
            .maybeSingle()

        throwIfError(previousPaymentError)

        return {
          sale: mapSale(previousSale as DbSale),
          payment: previousPayment
            ? mapPayment(previousPayment as DbPayment)
            : null,
        }
      }

      const snapshot = await loadSnapshot(supabase, farmId)
      const errors: Record<string, string | undefined> = {
        ...validateSale(input, snapshot),
      }

      if (
        !snapshot.crops.some(
          (crop) =>
            crop.id === input.cropId && crop.cycleId === input.cycleId,
        )
      ) {
        errors.cropId = 'errors.cropRequired'
      }

      if (hasErrors(errors)) throw new ValidationError(errors)

      const { data: insertedSale, error: saleError } = await supabase
        .from('sales')
        .insert({
          farm_id: farmId,
          harvest_cycle_id: input.cycleId,
          cycle_crop_id: input.cropId,
          quantity: input.quantity,
          unit: input.unit,
          buyer_name: input.buyer.trim(),
          total_amount_paise: input.amount,
          sale_date: input.date,
          request_id: input.requestId,
          created_by: user.id,
        })
        .select('id, harvest_cycle_id, cycle_crop_id, quantity, unit, buyer_name, total_amount_paise, sale_date, request_id')
        .single()

      throwIfError(saleError)

      if (!insertedSale) {
        throw new Error('Sale creation did not return a record.')
}

      let payment: Payment | null = null
      
      if (input.amountReceived > 0) {
        const { data: insertedPayment, error: paymentError } = await supabase
          .from('payments')
          .insert({
            farm_id: farmId,
            sale_id: insertedSale.id,
            amount_paise: input.amountReceived,
            payment_date: input.date,
            request_id: input.requestId,
            created_by: user.id,
          })
          .select('id, sale_id, amount_paise, payment_date, request_id')
          .single()

        if (paymentError) {
          // Avoid leaving a sale behind if its first payment failed.
          await supabase
            .from('sales')
            .delete()
            .eq('id', insertedSale.id)
            .eq('farm_id', farmId)

          throw new Error(paymentError.message)
        }

        payment = mapPayment(insertedPayment as DbPayment)
      }

      return {
        sale: mapSale(insertedSale as DbSale),
        payment,
      }
    },

    async createPayment(input: NewPaymentInput) {
      const { supabase, user, farmId } = await getFarmContext()

      // Repeated requests with the same key must not create duplicate payments.
      const { data: previousPayment, error: previousPaymentError } =
        await supabase
          .from('payments')
          .select('id, sale_id, amount_paise, payment_date, request_id')
          .eq('farm_id', farmId)
          .eq('request_id', input.requestId)
          .maybeSingle()

      throwIfError(previousPaymentError)

      if (previousPayment) return mapPayment(previousPayment as DbPayment)

      const snapshot = await loadSnapshot(supabase, farmId)
      const errors: Record<string, string | undefined> = {
        ...validatePayment(input, snapshot),
      }

      if (hasErrors(errors)) throw new ValidationError(errors)

      const { data, error } = await supabase
        .from('payments')
        .insert({
          farm_id: farmId,
          sale_id: input.saleId,
          amount_paise: input.amount,
          payment_date: input.date,
          request_id: input.requestId,
          created_by: user.id,
        })
        .select('id, sale_id, amount_paise, payment_date, request_id')
        .single()

      throwIfError(error)
      return mapPayment(data as DbPayment)
    },
  }
}
