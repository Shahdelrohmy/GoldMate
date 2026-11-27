-- Zakat tracking (F-14). Shape follows the ZakatStatus schema in contracts/openapi.yaml.
-- Nisab and rate are NOT here: they live in app_settings (zakat_nisab_g, zakat_rate).
-- The Hijri date is not stored: the API converts hawl_start_on with a library.
-- Not included yet (B2 adds it in Week 3 with the reminder job): stored reminder dates.
-- Like gold_records, the app can only READ these rows; the API (service role) does all writes.

-- One row per user: when the current hawl (holding year) started.
-- NULL = holdings are below the nisab, so no hawl is running (it resets when they fall below).
create table public.zakat_state (
  user_id       uuid primary key references public.profiles (id) on delete cascade,
  hawl_start_on date,
  updated_at    timestamptz not null default now()
);

create trigger zakat_state_set_updated_at
  before update on public.zakat_state
  for each row execute function public.set_updated_at();

alter table public.zakat_state enable row level security;

create policy "zakat_state: owner read" on public.zakat_state
  for select to authenticated using (user_id = auth.uid());

revoke insert, update, delete on public.zakat_state from authenticated;

-- The "I paid zakat" button writes one row here.
create table public.zakat_payments (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  paid_on    date not null default current_date,
  created_at timestamptz not null default now()
);

create index zakat_payments_user_idx on public.zakat_payments (user_id, paid_on desc);

alter table public.zakat_payments enable row level security;

create policy "zakat_payments: owner read" on public.zakat_payments
  for select to authenticated using (user_id = auth.uid());

revoke insert, update, delete on public.zakat_payments from authenticated;
