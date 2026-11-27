import { describe, it, expect, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { saveGoldPrice } from '../src/db/goldPrices.js'

describe('saveGoldPrice', () => {
  it('saves the gold price successfully', async () => {
    const insert = vi.fn(async () => ({ error: null }))
    const from = vi.fn(() => ({ insert }))

    const client = { from } as unknown as SupabaseClient

    await saveGoldPrice(client, {
      ounceUsd: 3618.1,
      usdEgp: 54.693,
    })

    expect(from).toHaveBeenCalledWith('gold_prices')
    expect(insert).toHaveBeenCalledWith({
      ounce_usd: 3618.1,
      usd_egp: 54.693,
      source: 'api',
    })
  })

  it('throws an error when Supabase insert fails', async () => {
    const insert = vi.fn(async () => ({
      error: { message: 'Database unavailable' },
    }))
    const from = vi.fn(() => ({ insert }))

    const client = { from } as unknown as SupabaseClient

    await expect(
      saveGoldPrice(client, {
        ounceUsd: 3618.1,
        usdEgp: 54.693,
      }),
    ).rejects.toThrow('Failed to save gold price: Database unavailable')
  })
})