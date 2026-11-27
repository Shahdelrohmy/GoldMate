// DEMO DATA ONLY. B replaces this with the Mock API layer (src/api) and later the real backend.
import type { Language } from '../i18n'
import type { PricesData, VaultPiece, VaultSummary, ZakatStatus } from '../types'

export const demoPrices: PricesData = {
  karats: [
    { karat: 24, pricePerGram: 5331, changePct: 0.8 },
    { karat: 21, pricePerGram: 4665, changePct: 0.7 },
    { karat: 18, pricePerGram: 3999, changePct: -0.2 },
  ],
  ounceUsd: 2657.4,
  usdEgp: 50.68,
  history: [28, 37, 33, 57, 51, 66, 62, 86, 79, 98, 89, 114, 107],
  historyChangePct: 3.4,
  updatedAt: '10:42',
}

export const demoPieces: VaultPiece[] = [
  { id: '1', type: 'coin', weightG: 8, karat: 21, price: 37320, source: 'verified' },
  { id: '2', type: 'bar', weightG: 10, karat: 24, price: 53310, source: 'ai' },
  { id: '3', type: 'jewelry', weightG: 12.4, karat: 18, price: 49588, source: 'manual' },
]

export const demoSummary: VaultSummary = {
  totalWeightG: 30.4,
  pureWeightG: 26.1,
  totalInvested: 129100,
  averageCostPerGram: 4247,
  currentValue: 140218,
  sellingValue: 136011,
  profitLoss: 11118,
  breakEvenPerGram: 4947,
  returnPct: 8.6,
}

export function demoZakat(above: boolean, language: Language): ZakatStatus {
  return above
    ? {
        pureGoldG: 92.6,
        nisabG: 85,
        aboveNisab: true,
        ratePct: 2.5,
        periodLabel: language === 'ar' ? '١ رمضان ١٤٤٦ هـ — ١ مارس ٢٠٢٥' : '1 Ramadan 1446 — 1 Mar 2025',
        startLabel: language === 'ar' ? '١ رمضان' : '1 Ramadan',
        daysRemaining: 142,
        dueAmount: 12340,
      }
    : { pureGoldG: 26.1, nisabG: 85, aboveNisab: false }
}
