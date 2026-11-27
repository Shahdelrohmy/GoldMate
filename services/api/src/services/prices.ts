
import type { SupabaseClient } from '@supabase/supabase-js'
import { gramPrice24Piasters, gramPricePiasters } from '../domain/gold.js'
import { getLatestGoldPrice } from '../db/goldPrices.js'
import { AppError } from '../middleware/error.js'

export async function getLatestPriceSnapshot(client: SupabaseClient) {
  const latestPrice = await getLatestGoldPrice(client)

  if (!latestPrice) {
    throw new AppError(
      404,
      'price_unavailable',
      'No price data available',
    )
  }

  const gram24 = gramPrice24Piasters(
    latestPrice.ounceUsd,
    latestPrice.usdEgp,
  )

  return {
    fetched_at: latestPrice.fetchedAt,
    ounce_usd: latestPrice.ounceUsd,
    usd_egp: latestPrice.usdEgp,
    gram_price_piasters: {
      '24': gram24,
      '21': gramPricePiasters(gram24, 21),
      '18': gramPricePiasters(gram24, 18),
    },
    source: latestPrice.source,
    is_estimate: true,
  }
}
