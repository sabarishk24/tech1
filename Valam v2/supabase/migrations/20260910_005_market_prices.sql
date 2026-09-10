-- Public market data collected by the scheduled server job. It is never
-- written by a browser, and it remains available when AGMARKNET only exposes
-- the most recent few days through its API.
create table public.market_prices (
  id uuid primary key default gen_random_uuid(),
  state text not null,
  district text not null,
  market text not null,
  commodity text not null,
  variety text not null default '',
  grade text not null default '',
  arrival_date date not null,
  min_price numeric(12,2),
  max_price numeric(12,2),
  modal_price numeric(12,2) not null check (modal_price >= 0),
  source text not null default 'agmarknet',
  source_payload jsonb,
  fetched_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (state, district, market, commodity, variety, grade, arrival_date)
);

create index market_prices_lookup_idx
  on public.market_prices (state, district, commodity, arrival_date desc);

alter table public.market_prices enable row level security;
create policy "authenticated users read market prices" on public.market_prices
  for select to authenticated using (true);

create table public.market_price_sync_runs (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  requested_pairs integer not null default 0,
  records_saved integer not null default 0,
  status text not null check (status in ('running', 'success', 'partial_failure', 'failed')),
  error_summary text
);

alter table public.market_price_sync_runs enable row level security;
