export type PieceType = 'coin' | 'bar' | 'jewelry'
export type Karat = 24 | 21 | 18
export type PieceSource = 'verified' | 'ai' | 'manual'
export type ViewStatus = 'ready' | 'loading' | 'error' | 'empty'

export type KaratPrice = { karat: Karat; pricePerGram: number; changePct: number }

export type PricesData = {
  karats: KaratPrice[]
  ounceUsd: number
  usdEgp: number
  history: number[]
  historyChangePct: number
  /** Already formatted by the caller, e.g. "today, 10:42 AM". */
  updatedAt: string
}

export type VaultPiece = {
  id: string
  type: PieceType
  weightG: number
  karat: Karat
  price: number
  source: PieceSource
}

export type VaultSummary = {
  totalWeightG: number
  pureWeightG: number
  totalInvested: number
  averageCostPerGram: number
  currentValue: number
  sellingValue: number
  profitLoss: number
  breakEvenPerGram: number
  returnPct: number
}

export type NewPieceInput = {
  type: PieceType
  karat: Karat
  weightG: number
  price: number
  makingCharge?: number
  date: string
  shopName?: string
}

export type ZakatStatus = {
  pureGoldG: number
  nisabG: number
  aboveNisab: boolean
  ratePct?: number
  /** Texts below are already formatted by the caller. */
  periodLabel?: string
  startLabel?: string
  daysRemaining?: number
  dueAmount?: number
}

export type MakingChargeInput = { weightG: number; karat: Karat; totalPrice: number }
export type MakingChargeResult = { goldValue: number; totalMaking: number; makingPerGram: number }

export type PriceCheckInput = {
  type: 'coin' | 'bar'
  karat: Karat
  weightG: number
  totalPrice: number
  makingCharge: number
}
export type PriceCheckResult = {
  status: 'ok' | 'high' | 'low'
  makingPct: number
  rangeMaxPct: number
}

export type Preferences = {
  jewelryOpinion: 'include' | 'exclude'
  priceAlerts: boolean
  zakatReminders: boolean
  analyticsConsent: boolean
}
