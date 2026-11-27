import 'dotenv/config'
import type { SupabaseClient } from '@supabase/supabase-js'
import { loadEnv } from '../src/config/env.js'
import { createAdminClient } from '../src/db/supabase.js'
import {
  buildPriceRows,
  buildRecordRows,
  DEMO_ADMIN_EMAIL,
  DEMO_INDIVIDUAL_EMAIL,
  DEMO_SPREAD_PIASTERS_PER_GRAM,
  SPREAD_SETTING_KEY,
} from './seed-data.js'

// Fills a DEVELOPMENT Supabase project with fake data so the apps have numbers from day one.
//   npm run seed        (needs SUPABASE_URL, SUPABASE_SECRET_KEY and SEED_DEMO_PASSWORD in .env)
// Safe to run again: users are reused, the demo user's records are replaced, prices are added only if the table is empty,
// and an Admin-set Spread is never overwritten. Never run it against a real project.

function fail(what: string, error: { message: string } | null): never {
  throw new Error(`${what}: ${error?.message ?? 'unknown error'}`)
}

async function ensureUser(client: SupabaseClient, email: string, password: string): Promise<string> {
  const created = await client.auth.admin.createUser({ email, password, email_confirm: true })
  if (created.data.user) return created.data.user.id

  // Most likely the user already exists from a previous run: look it up.
  const list = await client.auth.admin.listUsers({ page: 1, perPage: 1000 })
  const existing = list.data.users.find((u) => u.email === email)
  if (existing) return existing.id
  return fail(`create user ${email}`, created.error)
}

async function main(): Promise<void> {
  const password = process.env['SEED_DEMO_PASSWORD'] ?? ''
  if (password.length < 8) {
    throw new Error('Set SEED_DEMO_PASSWORD (at least 8 characters) in .env. Do not commit it.')
  }

  const env = loadEnv()
  const client = createAdminClient(env.supabaseUrl, env.supabaseSecretKey)
  console.log(`Seeding ${new URL(env.supabaseUrl).host} with FAKE demo data...`)

  const now = new Date()

  // 1. Users. The database trigger creates their profile rows (role = individual).
  const userId = await ensureUser(client, DEMO_INDIVIDUAL_EMAIL, password)
  const adminId = await ensureUser(client, DEMO_ADMIN_EMAIL, password)

  const promoted = await client.from('profiles').update({ role: 'admin' }).eq('id', adminId)
  if (promoted.error) fail('set admin role', promoted.error)

  // 2. Default Spread: a DEMO value, never overwriting what the Admin already set.
  const spread = await client.from('app_settings').upsert(
    {
      key: SPREAD_SETTING_KEY,
      value: DEMO_SPREAD_PIASTERS_PER_GRAM,
      description: 'Spread in piasters per gram (DEMO value from the seed script; the Admin sets the real one)',
    },
    { onConflict: 'key', ignoreDuplicates: true },
  )
  if (spread.error) fail('seed default spread', spread.error)

  // 3. Prices, only when there are none yet.
  const existingPrices = await client.from('gold_prices').select('id', { count: 'exact', head: true })
  if (existingPrices.error) fail('count prices', existingPrices.error)
  let priceCount = 0
  if ((existingPrices.count ?? 0) === 0) {
    const rows = buildPriceRows(now)
    const inserted = await client.from('gold_prices').insert(rows)
    if (inserted.error) fail('insert prices', inserted.error)
    priceCount = rows.length
  }

  // 4. The demo user's Vault: replace, so running twice never duplicates.
  const cleared = await client.from('gold_records').delete().eq('owner_id', userId)
  if (cleared.error) fail('clear old records', cleared.error)
  const records = buildRecordRows(now).map((r) => ({ ...r, owner_id: userId }))
  const insertedRecords = await client.from('gold_records').insert(records)
  if (insertedRecords.error) fail('insert records', insertedRecords.error)

  console.log(`Done. users: ${DEMO_INDIVIDUAL_EMAIL}, ${DEMO_ADMIN_EMAIL} | records: ${records.length} | new price rows: ${priceCount}`)
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : 'Seed failed')
  process.exit(1)
})
