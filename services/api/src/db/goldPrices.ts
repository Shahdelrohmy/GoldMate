import type { SupabaseClient } from '@supabase/supabase-js'

type GoldPriceInput = {
  ounceUsd: number
  usdEgp: number
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