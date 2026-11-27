import { goldValuePiasters, gramPrice24Piasters, type Karat } from '../src/domain/gold.js'

// Builds the synthetic demo data used by scripts/seed.ts. Pure: no database, no clock (the caller passes `now`).
// EVERYTHING here is fake and only for development. None of these numbers is a real price or a real purchase.

export const DEMO_INDIVIDUAL_EMAIL = 'demo.user@goldmate.test'
export const DEMO_ADMIN_EMAIL = 'demo.admin@goldmate.test'

/** app_settings key for the default Spread: a fixed amount per gram, in piasters (Month1_Detailed_Tasks.md, calculations 6 and 8). */
export const SPREAD_SETTING_KEY = 'default_spread_piasters_per_gram'
/** DEMO value only. The Admin must set the real Spread. */
export const DEMO_SPREAD_PIASTERS_PER_GRAM = 3000

export const PRICE_SNAPSHOT_COUNT = 30

export type SeedPriceRow = {
  fetched_at: string
  ounce_usd: number
  usd_egp: number
  source: 'api' | 'manual'
}

export type SeedRecordRow = {
  piece_type: 'coin' | 'bar' | 'jewelry'
  karat: Karat
  weight_g: number
  price_piasters: number
  making_charge_piasters: number
  purchased_on: string
  shop_name: string
  source: 'manual'
}

type RecordSpec = {
  pieceType: SeedRecordRow['piece_type']
  karat: Karat
  weightG: number
  /** Making charge as basis points of the gold value (600 = 6%). */
  makingBp: number
  daysAgo: number
  shop: string
}

// 10 pieces: coins, bars and jewelry, in all three karats.
const RECORD_SPECS: readonly RecordSpec[] = [
  { pieceType: 'coin', karat: 21, weightG: 8, makingBp: 600, daysAgo: 200, shop: 'Demo Shop A' },
  { pieceType: 'coin', karat: 21, weightG: 8, makingBp: 550, daysAgo: 150, shop: 'Demo Shop A' },
  { pieceType: 'bar', karat: 24, weightG: 10, makingBp: 300, daysAgo: 120, shop: 'Demo Shop B' },
  { pieceType: 'bar', karat: 24, weightG: 20, makingBp: 250, daysAgo: 90, shop: 'Demo Shop B' },
  { pieceType: 'bar', karat: 24, weightG: 5, makingBp: 400, daysAgo: 75, shop: 'Demo Shop C' },
  { pieceType: 'jewelry', karat: 21, weightG: 15.5, makingBp: 1500, daysAgo: 60, shop: 'Demo Shop C' },
  { pieceType: 'jewelry', karat: 18, weightG: 12.25, makingBp: 1800, daysAgo: 45, shop: 'Demo Shop A' },
  { pieceType: 'coin', karat: 21, weightG: 4, makingBp: 650, daysAgo: 30, shop: 'Demo Shop B' },
  { pieceType: 'jewelry', karat: 21, weightG: 9.75, makingBp: 1400, daysAgo: 14, shop: 'Demo Shop C' },
  { pieceType: 'bar', karat: 24, weightG: 1, makingBp: 700, daysAgo: 3, shop: 'Demo Shop A' },
]

const DAY_MS = 24 * 60 * 60 * 1000

function round4(value: number): number {
  return Math.round(value * 10_000) / 10_000
}

/** One fake price snapshot per day, oldest first, ending at `now`. Small deterministic wobble so the chart is not flat. */
export function buildPriceRows(now: Date): SeedPriceRow[] {
  return Array.from({ length: PRICE_SNAPSHOT_COUNT }, (_, i) => ({
    fetched_at: new Date(now.getTime() - (PRICE_SNAPSHOT_COUNT - 1 - i) * DAY_MS).toISOString(),
    ounce_usd: round4(3000 + (((i * 37) % 11) - 5) * 8),
    usd_egp: round4(50 + (((i * 13) % 7) - 3) * 0.05),
    source: 'api' as const,
  }))
}

/** 10 fake Gold Records. The price paid = gold value on the purchase day + a making charge, so the numbers hang together. */
export function buildRecordRows(now: Date): SeedRecordRow[] {
  const prices = buildPriceRows(now)

  return RECORD_SPECS.map((spec) => {
    // History is only 30 days long: older purchases use the oldest fake price.
    const snapshot = prices[Math.max(0, PRICE_SNAPSHOT_COUNT - 1 - spec.daysAgo)]
    if (!snapshot) throw new Error('seed price history is empty')

    const gram24 = gramPrice24Piasters(snapshot.ounce_usd, snapshot.usd_egp)
    const goldValue = goldValuePiasters(spec.weightG, spec.karat, gram24)
    const making = Math.round((goldValue * spec.makingBp) / 10_000)

    return {
      piece_type: spec.pieceType,
      karat: spec.karat,
      weight_g: spec.weightG,
      price_piasters: goldValue + making,
      making_charge_piasters: making,
      purchased_on: new Date(now.getTime() - spec.daysAgo * DAY_MS).toISOString().slice(0, 10),
      shop_name: spec.shop,
      source: 'manual' as const,
    }
  })
}
