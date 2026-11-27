import { gramPrice24Piasters, gramPricePiasters, KARATS } from '../src/domain/gold.js'
import { fetchPrices } from '../src/services/priceFetcher.js'

// Run: npm run fetch-prices
// Prints the ounce price, USD/EGP and the gram price per karat. All prices are indicative estimates.

function egp(piasters: number): string {
  return (piasters / 100).toFixed(2)
}

try {
  const prices = await fetchPrices()
  const gram24 = gramPrice24Piasters(prices.ounceUsd, prices.usdEgp)

  console.log('GoldMate price fetch (indicative / estimate)')
  console.log(`Gold ounce:  ${prices.ounceUsd.toFixed(2)} USD   (updated ${prices.ounceUpdatedAt})`)
  console.log(`USD to EGP:  ${prices.usdEgp}   (date ${prices.usdEgpDate}, mid-market rate)`)
  for (const karat of KARATS) {
  const gramPrice = gramPricePiasters(gram24, karat)
  console.log(`${karat}K gram:     ${egp(gramPrice)} EGP`)
}
} catch (err) {
  console.error(`Price fetch failed: ${err instanceof Error ? err.message : 'unknown error'}`)
  process.exit(1)
}