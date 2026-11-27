import { describe, expect, it } from 'vitest'
import { computeVaultSummary, type VaultRecord } from '../src/domain/vault.js'

// Hand-checked example. 24K gram price = 6,000 EGP = 600,000 piasters. Spread = 120 EGP per gram = 12,000 piasters.
//   coin  : 8 g,  21K, paid 40,000 EGP -> pure 7 g
//   bar   : 10 g, 24K, paid 60,000 EGP -> pure 10 g
const records: VaultRecord[] = [
  { weightG: 8, karat: 21, pricePiasters: 4_000_000 },
  { weightG: 10, karat: 24, pricePiasters: 6_000_000 },
]

describe('computeVaultSummary (the 8 numbers)', () => {
  const s = computeVaultSummary(records, 600_000, 12_000)

  it('1. total weight', () => expect(s.totalWeightG).toBe(18))
  it('2. pure weight (24K equivalent)', () => expect(s.pureWeightG).toBe(17))
  it('3. total invested', () => expect(s.totalInvestedPiasters).toBe(10_000_000))
  it('4. average cost per gram of pure gold', () => expect(s.averageCostPerGramPiasters).toBe(588_235)) // 100,000 / 17 g
  it('5. current estimated value', () => expect(s.currentValuePiasters).toBe(10_200_000)) // 17 g x 6,000
  it('6. estimated selling value after spread', () => expect(s.sellingValuePiasters).toBe(9_996_000)) // 17 g x (6,000 - 120) EGP
  it('7. profit / loss', () => expect(s.profitLossPiasters).toBe(-4_000)) // -40 EGP
  it('8. break-even 24K price per gram', () => expect(s.breakEvenPricePerGramPiasters).toBe(600_235)) // 100,000 / 17 g + 120 EGP
  it('return % for the badge', () => expect(s.returnPct).toBe(-0.04))

  it('at the break-even price the selling value is about the invested amount', () => {
    const atBreakEven = computeVaultSummary(records, s.breakEvenPricePerGramPiasters ?? 0, 12_000)
    expect(Math.abs(atBreakEven.profitLossPiasters)).toBeLessThanOrEqual(10)
  })
})

describe('computeVaultSummary edge cases', () => {
  it('empty vault: zeros and nulls, no divide-by-zero', () => {
    const s = computeVaultSummary([], 600_000, 12_000)
    expect(s.totalWeightG).toBe(0)
    expect(s.pureWeightG).toBe(0)
    expect(s.totalInvestedPiasters).toBe(0)
    expect(s.averageCostPerGramPiasters).toBeNull()
    expect(s.breakEvenPricePerGramPiasters).toBeNull()
    expect(s.returnPct).toBeNull()
    expect(s.profitLossPiasters).toBe(0)
  })

  it('18K jewelry counts only its pure gold', () => {
    const s = computeVaultSummary([{ weightG: 12, karat: 18, pricePiasters: 5_000_000 }], 600_000, 0)
    expect(s.pureWeightG).toBe(9)
    expect(s.currentValuePiasters).toBe(5_400_000)
    expect(s.profitLossPiasters).toBe(400_000)
  })

  it('3-decimal weights do not drift', () => {
    const many = Array.from({ length: 10 }, () => ({ weightG: 0.1, karat: 24 as const, pricePiasters: 1 }))
    expect(computeVaultSummary(many, 600_000, 0).totalWeightG).toBe(1)
  })

  it('spread is a fixed amount per gram: selling value drops by pure grams x spread', () => {
    const noSpread = computeVaultSummary(records, 600_000, 0)
    const withSpread = computeVaultSummary(records, 600_000, 12_000)
    expect(noSpread.sellingValuePiasters - withSpread.sellingValuePiasters).toBe(17 * 12_000)
  })

  it('zero spread: break-even equals the average cost per gram', () => {
    const s = computeVaultSummary(records, 600_000, 0)
    expect(s.breakEvenPricePerGramPiasters).toBe(s.averageCostPerGramPiasters)
  })

  it('rejects bad input', () => {
    expect(() => computeVaultSummary(records, 0, 2)).toThrow(RangeError)
    expect(() => computeVaultSummary(records, 600_000, 600_000)).toThrow(RangeError) // spread must be below the gram price
    expect(() => computeVaultSummary(records, 600_000, -1)).toThrow(RangeError)
    expect(() => computeVaultSummary(records, 600_000, 1.5)).toThrow(RangeError) // piasters are integers
    expect(() => computeVaultSummary([{ weightG: 0, karat: 24, pricePiasters: 1 }], 600_000, 12_000)).toThrow(RangeError)
    expect(() => computeVaultSummary([{ weightG: 1, karat: 24, pricePiasters: 1.5 }], 600_000, 12_000)).toThrow(RangeError)
  })
    it('rejects NaN and Infinity in inputs', () => {
    expect(() => computeVaultSummary(records, NaN, 2)).toThrow(RangeError)
    expect(() => computeVaultSummary(records, Infinity, 2)).toThrow(RangeError)
    expect(() => computeVaultSummary(records, 600_000, Infinity)).toThrow(RangeError)
    expect(() => computeVaultSummary([{ weightG: Infinity, karat: 24, pricePiasters: 100 }], 600_000, 12_000)).toThrow(RangeError)
    expect(() => computeVaultSummary([{ weightG: NaN, karat: 24, pricePiasters: 100 }], 600_000, 12_000)).toThrow(RangeError)
  })

  it('rejects invalid karats and unsafe amounts', () => {
    expect(() => computeVaultSummary([{ weightG: 1, karat: 22 as 24, pricePiasters: 100 }], 600_000, 12_000)).toThrow(RangeError)
    expect(() => computeVaultSummary([{ weightG: 1, karat: 24, pricePiasters: Number.MAX_SAFE_INTEGER + 1 }], 600_000, 12_000)).toThrow(RangeError)
    expect(() => computeVaultSummary([{ weightG: Number.MAX_VALUE, karat: 24, pricePiasters: 100 }], 600_000, 12_000)).toThrow(RangeError)
  })
})
