
import { z } from 'zod'

export type FetchFn = (
  input: string | URL | Request,
  init?: RequestInit,
) => Promise<Response>

export class PriceFetchError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PriceFetchError'
  }
}

type FetchOptions = {
  fetchFn?: FetchFn
  timeoutMs?: number
}

const GOLD_URL = 'https://api.gold-api.com/price/XAU'
const FX_URL = 'https://api.frankfurter.dev/v2/rate/USD/EGP'

const goldSchema = z.object({
  currency: z.literal('USD'),
  symbol: z.literal('XAU'),
  price: z.number().finite().positive(),
  updatedAt: z.string().refine(
    (value) => Number.isFinite(Date.parse(value)),
  ),
})

const fxSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(
    (value) => {
      const date = new Date(`${value}T00:00:00Z`)
      return Number.isFinite(date.getTime()) &&
        date.toISOString().slice(0, 10) === value
    },
  ),
  base: z.literal('USD'),
  quote: z.literal('EGP'),
  rate: z.number().finite().positive(),
})

async function requestJson(
  url: string,
  sourceName: string,
  fetchFn: FetchFn,
  timeoutMs: number,
): Promise<unknown> {
  // Two attempts: the original request and one retry.
  for (let attempt = 0; attempt < 2; attempt++) {
    const controller = new AbortController()
    let timedOut = false

    const timeout = setTimeout(() => {
      timedOut = true
      controller.abort()
    }, timeoutMs)

    try {
      const response = await fetchFn(url, {
        signal: controller.signal,
      })

      if (!response.ok) {
        // Retry only server errors (HTTP 5xx).
        if (response.status >= 500 && attempt === 0) {
          continue
        }

        throw new PriceFetchError(
          `${sourceName} request failed: HTTP ${response.status}`,
        )
      }

      try {
        return await response.json()
      } catch {
        throw new PriceFetchError(
          `${sourceName} response is not valid JSON`,
        )
      }
    } catch (error) {
      if (error instanceof PriceFetchError) {
        throw error
      }

      if (timedOut) {
        if (attempt === 1) {
          throw new PriceFetchError(
            `${sourceName} request timed out`,
          )
        }
      } else if (attempt === 1) {
        const message = error instanceof Error
          ? error.message
          : 'unknown network error'

        throw new PriceFetchError(
          `${sourceName} network request failed: ${message}`,
        )
      }
    } finally {
      clearTimeout(timeout)
    }
  }

  throw new PriceFetchError(`${sourceName} request failed`)
}

export async function fetchOuncePriceUsd(
  options: FetchOptions = {},
): Promise<{ ounceUsd: number; updatedAt: string }> {
  const fetchFn = options.fetchFn ?? fetch
  const timeoutMs = options.timeoutMs ?? 5000

  const body = await requestJson(
    GOLD_URL,
    'Gold price',
    fetchFn,
    timeoutMs,
  )

  const parsed = goldSchema.safeParse(body)

  if (!parsed.success) {
    throw new PriceFetchError(
      'Gold price source returned an unexpected response',
    )
  }

  return {
    ounceUsd: parsed.data.price,
    updatedAt: parsed.data.updatedAt,
  }
}

export async function fetchUsdEgp(
  options: FetchOptions = {},
): Promise<{ usdEgp: number; date: string }> {
  const fetchFn = options.fetchFn ?? fetch
  const timeoutMs = options.timeoutMs ?? 5000

  const body = await requestJson(
    FX_URL,
    'USD/EGP rate',
    fetchFn,
    timeoutMs,
  )

  const parsed = fxSchema.safeParse(body)

  if (!parsed.success) {
    throw new PriceFetchError(
      'USD/EGP source returned an unexpected response',
    )
  }

  return {
    usdEgp: parsed.data.rate,
    date: parsed.data.date,
  }
}

export async function fetchPrices(
  options: FetchOptions = {},
): Promise<{
  ounceUsd: number
  ounceUpdatedAt: string
  usdEgp: number
  usdEgpDate: string
}> {
  const [gold, fx] = await Promise.all([
    fetchOuncePriceUsd(options),
    fetchUsdEgp(options),
  ])

  return {
    ounceUsd: gold.ounceUsd,
    ounceUpdatedAt: gold.updatedAt,
    usdEgp: fx.usdEgp,
    usdEgpDate: fx.date,
  }
}
