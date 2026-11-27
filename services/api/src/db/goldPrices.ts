
import type { SupabaseClient } from '@supabase/supabase-js'

export type GoldPriceInput = {
  ounceUsd: number
  usdEgp: number
}

export type LatestGoldPrice = {
  fetchedAt: string
  ounceUsd: number
  usdEgp: number
  source: 'api' | 'manual'
}

export async function saveGoldPrice(
  client: SupabaseClient,
  prices: GoldPriceInput,
): Promise<void> {
  const { error } = await client.from('gold_prices').insert({
    ounce_usd: prices.ounceUsd,
    usd_egp: prices.usdEgp,
    source: 'api',
  })

  if (error) {
    throw new Error(`Failed to save gold price: ${error.message}`)
  }
}

export async function getLatestGoldPrice(
  client: SupabaseClient,
): Promise<LatestGoldPrice | null> {
  const { data, error } = await client
    .from('gold_prices')
    .select('fetched_at, ounce_usd, usd_egp, source')
    .order('fetched_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to get latest gold price: ${error.message}`)
  }

  if (!data) {
    return null
  }

  return {
    fetchedAt: data.fetched_at,
    ounceUsd: Number(data.ounce_usd),
    usdEgp: Number(data.usd_egp),
    source: data.source as 'api' | 'manual',
  }
}
