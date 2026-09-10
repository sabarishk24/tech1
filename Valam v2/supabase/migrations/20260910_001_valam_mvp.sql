-- VALAM MVP schema. Run through the Supabase SQL editor or `supabase db push`.
-- Authentication identities live in auth.users; application data lives here.

create type public.user_role as enum ('farmer', 'provider', 'admin');
create type public.service_category as enum ('machinery', 'labour', 'inputs');
create type public.booking_status as enum ('pending', 'accepted', 'rejected', 'cancelled', 'completed');
create type public.enquiry_status as enum ('open', 'responded', 'closed', 'cancelled');
create type public.ledger_entry_type as enum ('income', 'expense');
create type public.notification_type as enum ('booking', 'enquiry', 'scheme', 'system');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'farmer',
  full_name text not null default '',
  phone text,
  avatar_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.farms (
  id uuid primary key default gen_random_uuid(),
  farmer_id uuid not null references public.profiles(id) on delete cascade,
  name text not null default 'My Farm',
  district text not null,
  state text not null,
  land_size_acres numeric(10,2) not null check (land_size_acres > 0),
  soil_type text,
  irrigation_type text,
  latitude numeric(9,6),
  longitude numeric(9,6),
  is_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.farm_crops (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms(id) on delete cascade,
  crop_name text not null,
  season text,
  created_at timestamptz not null default now(),
  unique (farm_id, crop_name, season)
);

create table public.farm_activities (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms(id) on delete cascade,
  title text not null,
  notes text,
  activity_date date not null default current_date,
  created_at timestamptz not null default now()
);

create table public.soil_records (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms(id) on delete cascade,
  tested_on date,
  ph numeric(4,2),
  nitrogen numeric(10,2),
  phosphorus numeric(10,2),
  potassium numeric(10,2),
  report_path text,
  notes text,
  created_at timestamptz not null default now()
);

create table public.provider_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  business_name text not null,
  description text,
  district text not null,
  state text not null,
  is_verified boolean not null default false,
  is_accepting_bookings boolean not null default true,
  rating numeric(2,1) not null default 0 check (rating between 0 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.provider_profiles(user_id) on delete cascade,
  category public.service_category not null,
  name text not null,
  description text,
  unit text not null,
  price numeric(12,2) not null check (price >= 0),
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  farmer_id uuid not null references public.profiles(id) on delete cascade,
  provider_id uuid not null references public.provider_profiles(user_id) on delete restrict,
  service_id uuid not null references public.services(id) on delete restrict,
  farm_id uuid references public.farms(id) on delete set null,
  scheduled_for timestamptz not null,
  quantity numeric(10,2) not null default 1 check (quantity > 0),
  quoted_amount numeric(12,2) not null check (quoted_amount >= 0),
  notes text,
  status public.booking_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.booking_status_history (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  status public.booking_status not null,
  changed_by uuid not null references public.profiles(id),
  note text,
  created_at timestamptz not null default now()
);

create table public.market_enquiries (
  id uuid primary key default gen_random_uuid(),
  farmer_id uuid not null references public.profiles(id) on delete cascade,
  crop_name text not null,
  quantity numeric(12,2) not null check (quantity > 0),
  unit text not null default 'qtl',
  quality_grade text,
  market_name text not null,
  district text not null,
  status public.enquiry_status not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.enquiry_responses (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid not null references public.market_enquiries(id) on delete cascade,
  provider_id uuid not null references public.provider_profiles(user_id) on delete cascade,
  message text not null,
  offered_price numeric(12,2),
  created_at timestamptz not null default now(),
  unique (enquiry_id, provider_id)
);

create table public.schemes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  benefit text,
  deadline date,
  official_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.scheme_applications (
  id uuid primary key default gen_random_uuid(),
  scheme_id uuid not null references public.schemes(id) on delete cascade,
  farmer_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'draft' check (status in ('draft', 'submitted', 'under_review', 'approved', 'rejected')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (scheme_id, farmer_id)
);

create table public.ledger_entries (
  id uuid primary key default gen_random_uuid(),
  farmer_id uuid not null references public.profiles(id) on delete cascade,
  farm_id uuid references public.farms(id) on delete set null,
  entry_type public.ledger_entry_type not null,
  category text not null,
  amount numeric(12,2) not null check (amount > 0),
  description text,
  entry_date date not null default current_date,
  receipt_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type public.notification_type not null,
  title text not null,
  body text not null,
  resource_type text,
  resource_id uuid,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index farms_farmer_id_idx on public.farms(farmer_id);
create index services_provider_id_idx on public.services(provider_id);
create index bookings_farmer_id_idx on public.bookings(farmer_id);
create index bookings_provider_id_idx on public.bookings(provider_id);
create index ledger_entries_farmer_id_idx on public.ledger_entries(farmer_id);
create index notifications_user_id_idx on public.notifications(user_id, created_at desc);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'farmer')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;

-- Role changes are an administrative action, never a browser-side profile edit.
create or replace function public.prevent_role_change()
returns trigger language plpgsql as $$
begin
  if new.role is distinct from old.role then
    raise exception 'Role changes are not allowed through this endpoint';
  end if;
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles for each row execute procedure public.set_updated_at();
create trigger profiles_prevent_role_change before update on public.profiles for each row execute procedure public.prevent_role_change();
create trigger farms_updated_at before update on public.farms for each row execute procedure public.set_updated_at();
create trigger provider_profiles_updated_at before update on public.provider_profiles for each row execute procedure public.set_updated_at();
create trigger services_updated_at before update on public.services for each row execute procedure public.set_updated_at();
create trigger bookings_updated_at before update on public.bookings for each row execute procedure public.set_updated_at();
create trigger enquiries_updated_at before update on public.market_enquiries for each row execute procedure public.set_updated_at();
create trigger applications_updated_at before update on public.scheme_applications for each row execute procedure public.set_updated_at();
create trigger ledger_updated_at before update on public.ledger_entries for each row execute procedure public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.farms enable row level security;
alter table public.farm_crops enable row level security;
alter table public.farm_activities enable row level security;
alter table public.soil_records enable row level security;
alter table public.provider_profiles enable row level security;
alter table public.services enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_status_history enable row level security;
alter table public.market_enquiries enable row level security;
alter table public.enquiry_responses enable row level security;
alter table public.schemes enable row level security;
alter table public.scheme_applications enable row level security;
alter table public.ledger_entries enable row level security;
alter table public.notifications enable row level security;

create policy "users read own profile" on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy "users update own profile" on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy "farmers manage own farms" on public.farms for all to authenticated using (farmer_id = (select auth.uid())) with check (farmer_id = (select auth.uid()));
create policy "farmers manage own crops" on public.farm_crops for all to authenticated using (farm_id in (select id from public.farms where farmer_id = auth.uid())) with check (farm_id in (select id from public.farms where farmer_id = auth.uid()));
create policy "farmers manage own activities" on public.farm_activities for all to authenticated using (farm_id in (select id from public.farms where farmer_id = auth.uid())) with check (farm_id in (select id from public.farms where farmer_id = auth.uid()));
create policy "farmers manage own soil records" on public.soil_records for all to authenticated using (farm_id in (select id from public.farms where farmer_id = auth.uid())) with check (farm_id in (select id from public.farms where farmer_id = auth.uid()));
create policy "providers are publicly visible" on public.provider_profiles for select to authenticated using (true);
create policy "providers manage own profile" on public.provider_profiles for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "services are visible" on public.services for select to authenticated using (true);
create policy "providers manage own services" on public.services for all to authenticated using (provider_id = (select auth.uid())) with check (provider_id = (select auth.uid()));
create policy "booking participants can read" on public.bookings for select to authenticated using (farmer_id = auth.uid() or provider_id = auth.uid());
create policy "farmers create bookings" on public.bookings for insert to authenticated with check (farmer_id = auth.uid());
create policy "booking participants update" on public.bookings for update to authenticated using (farmer_id = auth.uid() or provider_id = auth.uid()) with check (farmer_id = auth.uid() or provider_id = auth.uid());
create policy "booking participants see history" on public.booking_status_history for select to authenticated using (booking_id in (select id from public.bookings where farmer_id = auth.uid() or provider_id = auth.uid()));
create policy "participants add booking history" on public.booking_status_history for insert to authenticated with check (changed_by = auth.uid() and booking_id in (select id from public.bookings where farmer_id = auth.uid() or provider_id = auth.uid()));
create policy "farmers manage own enquiries" on public.market_enquiries for all to authenticated using (farmer_id = auth.uid()) with check (farmer_id = auth.uid());
create policy "providers read open enquiries" on public.market_enquiries for select to authenticated using (status = 'open' and exists (select 1 from public.provider_profiles where user_id = auth.uid()));
create policy "participants access enquiry responses" on public.enquiry_responses for select to authenticated using (provider_id = auth.uid() or enquiry_id in (select id from public.market_enquiries where farmer_id = auth.uid()));
create policy "providers respond to enquiries" on public.enquiry_responses for insert to authenticated with check (provider_id = auth.uid());
create policy "schemes are readable" on public.schemes for select to authenticated using (is_active = true);
create policy "farmers manage own scheme applications" on public.scheme_applications for all to authenticated using (farmer_id = auth.uid()) with check (farmer_id = auth.uid());
create policy "farmers manage own ledger" on public.ledger_entries for all to authenticated using (farmer_id = auth.uid()) with check (farmer_id = auth.uid());
create policy "users manage own notifications" on public.notifications for select to authenticated using (user_id = auth.uid());
create policy "users mark own notifications" on public.notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Storage buckets are created in the Supabase Dashboard: `receipts` and `farm-files`.
