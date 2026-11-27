import { describe, expect, it, vi } from 'vitest'
import {
  fetchOuncePriceUsd,
  fetchPrices,
  fetchUsdEgp,
  PriceFetchError,
  type FetchFn,
} from '../src/services/priceFetcher.js'

// Real response shapes seen on 2026-11-27 (curl).
const goldBody = {
  currency: 'USD',
  currencySymbol: '$',
  exchangeRate: 1.0,
  name: 'Gold',
  price: 3618.100098,
  symbol: 'XAU',
  updatedAt: '2026-11-27T16:17:20Z',
  updatedAtReadable: 'a few seconds ago',
}
const fxBody = { date: '2026-11-27', base: 'USD', quote: 'EGP', rate: 54.693 }

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
}

function mockFetch(...responses: Array<Response | Error>): FetchFn {
  const queue = [...responses]
  return vi.fn(async () => {
    const next = queue.shift()
    if (next === undefined) throw new Error('mock fetch: no more responses')
    if (next instanceof Error) throw next
    return next
  }) as unknown as FetchFn
}

describe('fetchOuncePriceUsd', () => {
  it('returns the ounce price and update time', async () => {
    const result = await fetchOuncePriceUsd({ fetchFn: mockFetch(jsonResponse(goldBody)) })
    expect(result).toEqual({ ounceUsd: 3618.100098, updatedAt: '2026-11-27T16:17:20Z' })
  })

  it('throws on HTTP 500 after one retry', async () => {
    const fetchFn = mockFetch(new Response('x', { status: 500 }), new Response('x', { status: 500 }))
    await expect(fetchOuncePriceUsd({ fetchFn })).rejects.toThrow(PriceFetchError)
    expect(fetchFn).toHaveBeenCalledTimes(2)
  })

  it('succeeds when the first try is 500 and the retry is OK', async () => {
    const fetchFn = mockFetch(new Response('x', { status: 500 }), jsonResponse(goldBody))
    const result = await fetchOuncePriceUsd({ fetchFn })
    expect(result.ounceUsd).toBe(3618.100098)
    expect(fetchFn).toHaveBeenCalledTimes(2)
  })

  it('does not retry on HTTP 404', async () => {
    const fetchFn = mockFetch(new Response('x', { status: 404 }))
    await expect(fetchOuncePriceUsd({ fetchFn })).rejects.toThrow(/HTTP 404/)
    expect(fetchFn).toHaveBeenCalledTimes(1)
  })

  it('throws on invalid JSON', async () => {
    const fetchFn = mockFetch(new Response('not json', { status: 200 }))
    await expect(fetchOuncePriceUsd({ fetchFn })).rejects.toThrow(/not valid JSON/)
  })

  it('throws when price is 0', async () => {
    const fetchFn = mockFetch(jsonResponse({ ...goldBody, price: 0 }))
    await expect(fetchOuncePriceUsd({ fetchFn })).rejects.toThrow(/unexpected response/)
  })

  it('throws when updatedAt is not a valid date', async () => {
    const fetchFn = mockFetch(jsonResponse({ ...goldBody, updatedAt: 'yesterday' }))
    await expect(fetchOuncePriceUsd({ fetchFn })).rejects.toThrow(/unexpected response/)
  })

  it('throws on timeout after one retry', async () => {
    // A fetch that never answers until it is aborted.
    const hanging = vi.fn(
      (_url: unknown, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')))
        }),
    ) as unknown as FetchFn
    await expect(fetchOuncePriceUsd({ fetchFn: hanging, timeoutMs: 20 })).rejects.toThrow(/timed out/)
    expect(hanging).toHaveBeenCalledTimes(2)
  })
})

describe('fetchUsdEgp', () => {
  it('returns the rate and date', async () => {
    const result = await fetchUsdEgp({ fetchFn: mockFetch(jsonResponse(fxBody)) })
    expect(result).toEqual({ usdEgp: 54.693, date: '2026-11-27' })
  })

  it('throws when rate is 0', async () => {
    const fetchFn = mockFetch(jsonResponse({ ...fxBody, rate: 0 }))
    await expect(fetchUsdEgp({ fetchFn })).rejects.toThrow(/unexpected response/)
  })

  it('throws when the quote currency is not EGP', async () => {
    const fetchFn = mockFetch(jsonResponse({ ...fxBody, quote: 'EUR' }))
    await expect(fetchUsdEgp({ fetchFn })).rejects.toThrow(/unexpected response/)
  })
})

describe('fetchPrices', () => {
  it('returns both prices', async () => {
    const fetchFn = vi.fn(async (url: unknown) =>
      String(url).includes('gold-api') ? jsonResponse(goldBody) : jsonResponse(fxBody),
    ) as unknown as FetchFn
    const result = await fetchPrices({ fetchFn })
    expect(result).toEqual({
      ounceUsd: 3618.100098,
      ounceUpdatedAt: '2026-11-27T16:17:20Z',
      usdEgp: 54.693,
      usdEgpDate: '2026-11-27',
    })
  })

  it('throws if one source fails (no partial result)', async () => {
    const fetchFn = vi.fn(async (url: unknown) =>
      String(url).includes('gold-api') ? jsonResponse(goldBody) : new Response('x', { status: 400 }),
    ) as unknown as FetchFn
    await expect(fetchPrices({ fetchFn })).rejects.toThrow(PriceFetchError)
  })
})