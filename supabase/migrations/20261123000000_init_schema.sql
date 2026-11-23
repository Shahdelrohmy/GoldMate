-- GoldMate init schema. DRAFT for the Team Lead to review before applying.
-- Conventions: money = integer piasters (bigint), weights = grams with 3 decimals,
-- every table has row-level security enabled.
-- Not included yet (later migrations): shops, catalog, orders, reviews, notifications, consent log.

create type public.user_role     as enum ('individual', 'shop', 'admin');
create type public.piece_type    as enum ('coin', 'bar', 'jewelry');
create type public.record_source as enum ('manual', 'ai_extracted_reviewed', 'shop_verified');

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- profiles ------------------------------------------------------------------
create table public.profiles (
  id                    uuid primary key references auth.users (id) on delete cascade,
  role                  public.user_role not null default 'individual',
  language              text not null default 'ar' check (language in ('ar', 'en')),
  jewelry_zakat_opinion text,
  created_at            timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- A profile row is created automatically for every new auth user.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create policy "profiles: read own" on public.profiles
  for select to authenticated using (id = auth.uid());
create policy "profiles: update own" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- Users may change only these columns. Role changes happen server-side
-- (for example when an Admin approves a shop), never from the app.
revoke update on public.profiles from authenticated;
grant update (language, jewelry_zakat_opinion) on public.profiles to authenticated;

-- gold_records (the Vault) -----------------------------------------------------
create table public.gold_records (
  id                    uuid primary key default gen_random_uuid(),
  owner_id              uuid not null references public.profiles (id) on delete cascade,
  piece_type            public.piece_type not null,
  karat                 smallint not null check (karat in (24, 21, 18)),
  weight_g              numeric(10, 3) not null check (weight_g > 0),
  price_piasters        bigint not null check (price_piasters >= 0),
  making_charge_piasters bigint check (making_charge_piasters >= 0),
  purchased_on          date not null,
  shop_name             text,
  source                public.record_source not null default 'manual',
  invoice_image_path    text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index gold_records_owner_idx on public.gold_records (owner_id, purchased_on desc);

create trigger gold_records_set_updated_at
  before update on public.gold_records
  for each row execute function public.set_updated_at();

alter table public.gold_records enable row level security;

create policy "gold_records: owner full access" on public.gold_records
  for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- gold_prices ---------------------------------------------------------------------
-- Raw inputs only. gram_24 and per-karat prices are computed by the Backend.
create table public.gold_prices (
  id         uuid primary key default gen_random_uuid(),
  fetched_at timestamptz not null default now(),
  ounce_usd  numeric(12, 4) not null check (ounce_usd > 0),
  usd_egp    numeric(10, 4) not null check (usd_egp > 0),
  source     text not null check (source in ('api', 'manual'))
);

create index gold_prices_fetched_idx on public.gold_prices (fetched_at desc);

alter table public.gold_prices enable row level security;

-- Readable by signed-in users. Writes come only from the API (service role bypasses RLS).
create policy "gold_prices: read" on public.gold_prices
  for select to authenticated using (true);

-- app_settings (edited by the Admin; never hard-code these in code) ---------------------
create table public.app_settings (
  key         text primary key,
  value       jsonb not null,
  description text,
  updated_at  timestamptz not null default now(),
  updated_by  uuid references public.profiles (id)
);

create trigger app_settings_set_updated_at
  before update on public.app_settings
  for each row execute function public.set_updated_at();

alter table public.app_settings enable row level security;

create policy "app_settings: read" on public.app_settings
  for select to authenticated using (true);
create policy "app_settings: admin write" on public.app_settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Only values given in the Brief. The default Spread has no agreed value yet:
-- the Admin sets it ('default_spread_pct') before the Vault selling value is shown.
insert into public.app_settings (key, value, description) values
  ('zakat_nisab_g', '85',    'Zakat threshold in grams of 24K gold'),
  ('zakat_rate',    '0.025', 'Zakat rate (2.5%)')
on conflict (key) do nothing;

-- price_ranges (Price Reasonableness Check) ---------------------------------------------
-- No seed rows on purpose: ranges must come from real shop data.
create table public.price_ranges (
  id           uuid primary key default gen_random_uuid(),
  piece_type   public.piece_type not null check (piece_type in ('coin', 'bar')),
  min_weight_g numeric(10, 3) not null check (min_weight_g >= 0),
  max_weight_g numeric(10, 3) not null,
  min_pct      numeric(6, 2) not null check (min_pct >= 0),
  max_pct      numeric(6, 2) not null,
  source_note  text,
  updated_at   timestamptz not null default now(),
  check (max_weight_g >= min_weight_g),
  check (max_pct >= min_pct)
);

create trigger price_ranges_set_updated_at
  before update on public.price_ranges
  for each row execute function public.set_updated_at();

alter table public.price_ranges enable row level security;

create policy "price_ranges: read" on public.price_ranges
  for select to authenticated using (true);
create policy "price_ranges: admin write" on public.price_ranges
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
