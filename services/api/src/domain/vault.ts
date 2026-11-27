
import { isKarat, type Karat } from './gold.js'

// The 8 Vault calculations (F-13).
// Money = integer piasters. Spread is a percentage of the current gold value.
// Weights are summed as integer milligrams to avoid 3-decimal gram drift.

export type VaultRecord = {
  weightG: number
  karat: Karat
  /** Total paid, including the making charge. */
  pricePiasters: number
}

export type VaultSummary = {
  /** 1. Total Gold Weight, grams */
  totalWeightG: number
  /** 2. Pure Gold Weight (24K equivalent), grams */
  pureWeightG: number
  /** 3. Total Invested Amount */
  totalInvestedPiasters: number
  /** 4. Average Cost per Gram of pure gold. null when the vault is empty. */
  averageCostPerGramPiasters: number | null
  /** 5. Current Estimated Value, before the spread */
  currentValuePiasters: number
  /** 6. Estimated Selling Value, after the spread */
  sellingValuePiasters: number
  /** 7. Profit/Loss = selling value - invested */
  profitLossPiasters: number
  /** 8. Break-even: the 24K gram price at which the selling value equals the invested amount. null when empty. */
  breakEvenPricePerGramPiasters: number | null
  /** Extra for the UI badge: profit/loss as % of invested. null when nothing is invested. */
  returnPct: number | null
}

function assertFinite(value: number, name: string): void {
  if (!Number.isFinite(value)) {
    throw new RangeError(`${name} must be finite`)
  }
}

export function computeVaultSummary(
  records: readonly VaultRecord[],
  gram24Piasters: number,
  spreadPct: number,
): VaultSummary {
  assertFinite(gram24Piasters, 'gram24Piasters')
  if (gram24Piasters <= 0) {
    throw new RangeError('gram24Piasters must be positive')
  }

  assertFinite(spreadPct, 'spreadPct')
  if (spreadPct < 0 || spreadPct >= 100) {
    throw new RangeError('spreadPct must be >= 0 and < 100')
  }

  let totalMg = 0
  let pureMg = 0
  let invested = 0

  for (const r of records) {
    assertFinite(r.weightG, 'weightG')
    if (r.weightG <= 0) {
      throw new RangeError('weightG must be positive')
    }

    if (!isKarat(r.karat)) {
      throw new RangeError('karat must be 24, 21, or 18')
    }

    if (!Number.isSafeInteger(r.pricePiasters) || r.pricePiasters < 0) {
      throw new RangeError('pricePiasters must be a non-negative safe integer')
    }

    const mg = Math.round(r.weightG * 1000)
    if (!Number.isSafeInteger(mg) || mg <= 0) {
      throw new RangeError('weightG is outside the supported precision range')
    }

    totalMg += mg
    pureMg += (mg * r.karat) / 24
    invested += r.pricePiasters

    if (!Number.isSafeInteger(totalMg) || !Number.isSafeInteger(invested)) {
      throw new RangeError('vault totals exceed the safe integer range')
    }
  }

  const keep = 1 - spreadPct / 100
  const current = Math.round((pureMg * gram24Piasters) / 1000)
  const selling = Math.round(((pureMg * gram24Piasters) / 1000) * keep)
  const hasGold = pureMg > 0

  const averageCost = hasGold ? Math.round((invested * 1000) / pureMg) : null
  const breakEven = hasGold ? Math.round(invested / (pureMg / 1000 * keep)) : null
  const profitLoss = selling - invested
  const returnPct = invested > 0
    ? Math.round((profitLoss / invested) * 10000) / 100
    : null

  const results = [pureMg, current, selling, profitLoss, averageCost, breakEven, returnPct]
  if (results.some((value) => value !== null && !Number.isFinite(value))) {
    throw new RangeError('vault calculation produced a non-finite result')
  }

  return {
    totalWeightG: totalMg / 1000,
    pureWeightG: Math.round(pureMg) / 1000,
    totalInvestedPiasters: invested,
    averageCostPerGramPiasters: averageCost,
    currentValuePiasters: current,
    sellingValuePiasters: selling,
    profitLossPiasters: profitLoss,
    breakEvenPricePerGramPiasters: breakEven,
    returnPct,
  }
}
