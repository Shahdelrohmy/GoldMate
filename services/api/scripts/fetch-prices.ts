
import 'dotenv/config'
import { gramPrice24Piasters, gramPricePiasters, KARATS } from '../src/domain/gold.js'
import { fetchPrices } from '../src/services/priceFetcher.js'
import { loadEnv } from '../src/config/env.js'
import { createAdminClient } from '../src/db/supabase.js'
import { saveGoldPrice } from '../src/db/goldPrices.js'

// Run: npm run fetch-prices
// Fetches prices, saves the raw values to Supabase, then prints estimates.

function egp(piasters: number): string {
  return (piasters / 100).toFixed(2)
}

try {
  const env = loadEnv()
  const supabase = createAdminClient(env.supabaseUrl, env.supabaseSecretKey)

  const prices = await fetchPrices()

  await saveGoldPrice(supabase, prices)

  const gram24 = gramPrice24Piasters(prices.ounceUsd, prices.usdEgp)

  console.log('GoldMate price fetch (indicative / estimate)')
  console.log(`Gold ounce:  ${prices.ounceUsd.toFixed(2)} USD   (updated ${prices.ounceUpdatedAt})`)
  console.log(`USD to EGP:  ${prices.usdEgp}   (date ${prices.usdEgpDate}, mid-market rate)`)

  for (const karat of KARATS) {
    const gramPrice = gramPricePiasters(gram24, karat)
    console.log(`${karat}K gram:     ${egp(gramPrice)} EGP`)
  }

  console.log('Prices saved successfully to Supabase.')
} catch (err) {
  console.error(`Price fetch/save failed: ${err instanceof Error ? err.message : 'unknown error'}`)
  process.exit(1)
}
