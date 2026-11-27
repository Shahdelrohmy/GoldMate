import { describe, expect, it } from 'vitest'
import { goldValuePiasters, gramPrice24Piasters, gramPricePiasters, isKarat, pureWeightG } from '../src/domain/gold.js'

describe('gold formulas', () => {
  it('gram_24 = ounce x usd_egp / 31.1035 (in piasters)', () => {
    // 2000 USD x 50 EGP = 100,000 EGP per ounce -> 3215.0723 EGP per gram -> 321507 piasters
    expect(gramPrice24Piasters(2000, 50)).toBe(321507)
  })

  it('rejects non-positive inputs', () => {
    expect(() => gramPrice24Piasters(0, 50)).toThrow(RangeError)
    expect(() => gramPrice24Piasters(2000, -1)).toThrow(RangeError)
  })

  it('price per gram scales by karat / 24', () => {
    expect(gramPricePiasters(600000, 24)).toBe(600000)
    expect(gramPricePiasters(600000, 21)).toBe(525000)
    expect(gramPricePiasters(600000, 18)).toBe(450000)
  })

  it('pure weight and gold value', () => {
    expect(pureWeightG(8, 21)).toBe(7)
    expect(goldValuePiasters(8, 21, 600000)).toBe(4200000) // 7 g x 6000 EGP = 42,000 EGP
  })

  it('knows the valid karats', () => {
    expect(isKarat(21)).toBe(true)
    expect(isKarat(22)).toBe(false)
  })
    it('rejects NaN and Infinity in price inputs', () => {
    expect(() => gramPrice24Piasters(NaN, 50)).toThrow(RangeError)
    expect(() => gramPrice24Piasters(Infinity, 50)).toThrow(RangeError)
    expect(() => gramPrice24Piasters(2000, Infinity)).toThrow(RangeError)
  })

  it('rejects invalid karats at runtime', () => {
    expect(() => gramPricePiasters(600000, 22 as 24)).toThrow(RangeError)
    expect(() => pureWeightG(8, 22 as 24)).toThrow(RangeError)
  })

  it('rejects invalid weight and gold price', () => {
    expect(() => pureWeightG(NaN, 21)).toThrow(RangeError)
    expect(() => pureWeightG(Infinity, 21)).toThrow(RangeError)
    expect(() => goldValuePiasters(8, 21, Infinity)).toThrow(RangeError)
  })

  it('rejects calculated values outside the safe integer range', () => {
    expect(() => gramPrice24Piasters(Number.MAX_VALUE, 50)).toThrow(RangeError)
    expect(() => goldValuePiasters(8, 21, Number.MAX_VALUE)).toThrow(RangeError)
  })
})
