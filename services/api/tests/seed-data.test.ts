import { describe, expect, it } from 'vitest'
import { goldValuePiasters, gramPrice24Piasters, isKarat } from '../src/domain/gold.js'
import { buildPriceRows, buildRecordRows, PRICE_SNAPSHOT_COUNT } from '../scripts/seed-data.js'

const now = new Date('2026-11-27T00:00:00.000Z')

describe('seed price rows', () => {
  const rows = buildPriceRows(now)

  it('one snapshot per day, oldest first, ending now', () => {
    expect(rows).toHaveLength(PRICE_SNAPSHOT_COUNT)
    expect(rows.at(-1)?.fetched_at).toBe(now.toISOString())
    const times = rows.map((r) => Date.parse(r.fetched_at))
    expect([...times].sort((a, b) => a - b)).toEqual(times)
  })

  it('all values are positive and respect the table checks', () => {
    for (const r of rows) {
      expect(r.ounce_usd).toBeGreaterThan(0)
      expect(r.usd_egp).toBeGreaterThan(0)
      expect(['api', 'manual']).toContain(r.source)
    }
  })

  it('is not flat, so the chart has something to draw', () => {
    expect(new Set(rows.map((r) => r.ounce_usd)).size).toBeGreaterThan(3)
  })

  it('is deterministic for the same clock', () => {
    expect(buildPriceRows(now)).toEqual(rows)
  })
})

describe('seed gold records', () => {
  const rows = buildRecordRows(now)

  it('has 10 records covering coins, bars and jewelry', () => {
    expect(rows).toHaveLength(10)
    expect(new Set(rows.map((r) => r.piece_type))).toEqual(new Set(['coin', 'bar', 'jewelry']))
    expect(new Set(rows.map((r) => r.karat))).toEqual(new Set([24, 21, 18]))
  })

  it('every record satisfies the gold_records table rules', () => {
    for (const r of rows) {
      expect(isKarat(r.karat)).toBe(true)
      expect(r.weight_g).toBeGreaterThan(0)
      expect(Number.isInteger(r.price_piasters)).toBe(true)
      expect(Number.isInteger(r.making_charge_piasters)).toBe(true)
      expect(r.making_charge_piasters).toBeGreaterThanOrEqual(0)
      expect(r.price_piasters).toBeGreaterThanOrEqual(r.making_charge_piasters)
      expect(r.purchased_on).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(Date.parse(r.purchased_on)).toBeLessThanOrEqual(now.getTime())
      expect(r.source).toBe('manual')
    }
  })

  it('price paid = gold value on the purchase day + making charge', () => {
    // The newest record (3 days ago) uses the snapshot 3 days before `now`.
    const prices = buildPriceRows(now)
    const snapshot = prices[PRICE_SNAPSHOT_COUNT - 1 - 3]
    expect(snapshot).toBeDefined()
    const gram24 = gramPrice24Piasters(snapshot?.ounce_usd ?? 0, snapshot?.usd_egp ?? 0)
    const last = rows.at(-1)
    expect(last?.price_piasters).toBe(goldValuePiasters(last?.weight_g ?? 0, last?.karat ?? 24, gram24) + (last?.making_charge_piasters ?? 0))
  })
})
