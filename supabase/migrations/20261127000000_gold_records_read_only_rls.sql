-- Vault writes go through the API only (it uses the service role, which bypasses RLS).
-- Before this migration an owner could insert or update their own rows straight from the app with their JWT,
-- including `source`, so a user could fake the 'shop_verified' or 'ai_extracted_reviewed' badge.
-- After it, the app can only READ its own gold_records; the API decides `source`.

drop policy if exists "gold_records: owner full access" on public.gold_records;

create policy "gold_records: owner read" on public.gold_records
  for select to authenticated
  using (owner_id = auth.uid());

-- Defense in depth: the signed-in role has no write privileges on the table at all.
revoke insert, update, delete on public.gold_records from authenticated;
