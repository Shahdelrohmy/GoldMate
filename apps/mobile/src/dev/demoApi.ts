// DEMO ONLY: stand-ins for backend calls so the screens can be tried on a phone.
// The numbers below are the ones the Figma design used. They are NOT real gold math:
// AGENTS.md says calculations live in services/api/src/domain. B replaces these with the Mock API / real endpoints.
import type { MakingChargeInput, MakingChargeResult, PriceCheckInput, PriceCheckResult } from '../types'

const demoRatePerGram = { 24: 5331, 21: 4665, 18: 3999 } as const

export async function demoCalculateMaking(input: MakingChargeInput): Promise<MakingChargeResult> {
  const goldValue = input.weightG * demoRatePerGram[input.karat]
  const totalMaking = Math.max(input.totalPrice - goldValue, 0)
  return { goldValue, totalMaking, makingPerGram: totalMaking / input.weightG }
}

export async function demoCheckPrice(input: PriceCheckInput): Promise<PriceCheckResult> {
  const gold = input.weightG * demoRatePerGram[input.karat]
  const premiumPct = (input.totalPrice / gold - 1) * 100
  const makingPct = (input.makingCharge / gold) * 100
  const rangeMaxPct = input.type === 'coin' ? 5 : 3
  const status = premiumPct < -2 ? 'low' : premiumPct > rangeMaxPct || makingPct > rangeMaxPct ? 'high' : 'ok'
  return { status, makingPct, rangeMaxPct }
}
