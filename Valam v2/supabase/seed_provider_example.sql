-- Create a real test provider after that person has registered and confirmed
-- their email in VALAM. Replace only the values in ALL CAPS below.

do $$
declare
  provider_user_id uuid;
begin
  select id into provider_user_id from auth.users where email = 'PROVIDER_EMAIL@example.com';
  if provider_user_id is null then
    raise exception 'No confirmed VALAM account was found for that email';
  end if;

  perform public.set_user_role(provider_user_id, 'provider');

  insert into public.provider_profiles (
    user_id, business_name, description, district, state, is_verified, is_accepting_bookings, rating
  ) values (
    provider_user_id,
    'DEMO TRACTORS',
    'Machinery services for local farmers',
    'Chengalpattu',
    'Tamil Nadu',
    true,
    true,
    4.5
  ) on conflict (user_id) do update set
    business_name = excluded.business_name,
    description = excluded.description,
    district = excluded.district,
    state = excluded.state,
    is_verified = excluded.is_verified,
    is_accepting_bookings = excluded.is_accepting_bookings,
    rating = excluded.rating;

  insert into public.services (provider_id, category, name, description, unit, price) values
    (provider_user_id, 'machinery', 'Tractor with driver', '8-hour tractor service', 'day', 2200),
    (provider_user_id, 'machinery', 'Power tiller', '4-hour power tiller service', '4 hours', 900);
end;
$$;
