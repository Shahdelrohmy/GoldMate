
// Pure gold formulas. No database, no HTTP. Money = integer piasters (1 EGP = 100 piasters).
// Source of the formulas: docs/GoldMate_Project_Brief.md, section 5.

export type Karat = 24 | 21 | 18
export const KARATS: readonly Karat[] = [24, 21, 18]

/** Grams in one troy ounce. */
export const OUNCE_GRAMS = 31.1035

function assertPositiveFinite(value: number, name: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${name} must be a positive finite number`)
  }
}

function assertKarat(karat: number): asserts karat is Karat {
  if (!isKarat(karat)) {
    throw new RangeError('karat must be 24, 21, or 18')
  }
}

export function isKarat(value: number): value is Karat {
  return value === 24 || value === 21 || value === 18
}

/** gram_24 = (ounce_price_USD x USD_to_EGP) / 31.1035, in piasters per gram. */
export function gramPrice24Piasters(ounceUsd: number, usdEgp: number): number {
  assertPositiveFinite(ounceUsd, 'ounceUsd')
  assertPositiveFinite(usdEgp, 'usdEgp')

  const result = Math.round((ounceUsd * usdEgp * 100) / OUNCE_GRAMS)

  if (!Number.isSafeInteger(result)) {
    throw new RangeError('calculated gram price is outside the safe integer range')
  }

  return result
}

/** Price per gram of a given karat, in piasters. */
export function gramPricePiasters(gram24Piasters: number, karat: Karat): number {
  assertPositiveFinite(gram24Piasters, 'gram24Piasters')
  assertKarat(karat)

  return Math.round((gram24Piasters * karat) / 24)
}

/** Pure (24K equivalent) weight in grams: weight x (karat / 24). */
export function pureWeightG(weightG: number, karat: Karat): number {
  assertPositiveFinite(weightG, 'weightG')
  assertKarat(karat)

  const result = (weightG * karat) / 24

  if (!Number.isFinite(result)) {
    throw new RangeError('calculated pure weight must be finite')
  }

  return result
}

/** gold_value = weight x (karat / 24) x gram_24, in piasters. */
export function goldValuePiasters(weightG: number, karat: Karat, gram24Piasters: number): number {
  assertPositiveFinite(gram24Piasters, 'gram24Piasters')

  const result = Math.round(pureWeightG(weightG, karat) * gram24Piasters)

  if (!Number.isSafeInteger(result)) {
    throw new RangeError('calculated gold value is outside the safe integer range')
  }

  return result
}
