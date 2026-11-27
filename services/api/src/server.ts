import 'dotenv/config'
import { createApp } from './app.js'
import { loadEnv } from './config/env.js'
import { createAdminClient } from './db/supabase.js'
import { createSupabaseVerifier } from './services/auth.js'

const env = loadEnv()
const supabase = createAdminClient(env.supabaseUrl, env.supabaseSecretKey)
const app = createApp({ verifyToken: createSupabaseVerifier(supabase) })

app.listen(env.port, () => {
  console.log(`GoldMate API listening on http://localhost:${env.port}`)
})
