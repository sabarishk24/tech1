-- Provider directory and atomic booking actions.

drop policy if exists "providers manage own profile" on public.provider_profiles;
create policy "verified-role providers manage own profile" on public.provider_profiles
  for all to authenticated
  using (user_id = auth.uid() and exists (select 1 from public.profiles where id = auth.uid() and role = 'provider'))
  with check (user_id = auth.uid() and exists (select 1 from public.profiles where id = auth.uid() and role = 'provider'));

drop policy if exists "providers manage own services" on public.services;
create policy "providers manage own services" on public.services
  for all to authenticated
  using (provider_id = auth.uid() and exists (select 1 from public.profiles where id = auth.uid() and role = 'provider'))
  with check (provider_id = auth.uid() and exists (select 1 from public.profiles where id = auth.uid() and role = 'provider'));

create or replace view public.provider_directory as
select
  pp.user_id,
  p.full_name,
  pp.business_name,
  pp.description,
  pp.district,
  pp.state,
  pp.is_verified,
  pp.is_accepting_bookings,
  pp.rating
from public.provider_profiles pp
join public.profiles p on p.id = pp.user_id
where pp.is_verified = true and pp.is_accepting_bookings = true;

grant select on public.provider_directory to authenticated;

create or replace function public.create_booking(
  requested_service_id uuid,
  requested_farm_id uuid,
  requested_quantity numeric,
  requested_for timestamptz,
  requested_notes text default null
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  current_user_id uuid := auth.uid();
  chosen_service public.services%rowtype;
  new_booking_id uuid;
begin
  if current_user_id is null then raise exception 'Authentication is required'; end if;
  select * into chosen_service from public.services
    where id = requested_service_id and is_available = true;
  if not found then raise exception 'This service is no longer available'; end if;
  if not exists (select 1 from public.provider_profiles where user_id = chosen_service.provider_id and is_verified and is_accepting_bookings) then
    raise exception 'This provider is not accepting bookings';
  end if;
  if requested_farm_id is not null and not exists (select 1 from public.farms where id = requested_farm_id and farmer_id = current_user_id) then
    raise exception 'The selected farm does not belong to you';
  end if;
  insert into public.bookings (farmer_id, provider_id, service_id, farm_id, scheduled_for, quantity, quoted_amount, notes)
  values (current_user_id, chosen_service.provider_id, chosen_service.id, requested_farm_id, requested_for, requested_quantity, chosen_service.price * requested_quantity, requested_notes)
  returning id into new_booking_id;
  insert into public.booking_status_history (booking_id, status, changed_by, note)
  values (new_booking_id, 'pending', current_user_id, 'Booking created');
  insert into public.notifications (user_id, type, title, body, resource_type, resource_id)
  values (chosen_service.provider_id, 'booking', 'New booking request', 'A farmer has requested ' || chosen_service.name, 'booking', new_booking_id);
  return new_booking_id;
end;
$$;

create or replace function public.respond_to_booking(
  target_booking_id uuid,
  next_status public.booking_status,
  response_note text default null
) returns void
language plpgsql security definer set search_path = public as $$
declare current_user_id uuid := auth.uid();
begin
  if next_status not in ('accepted', 'rejected', 'completed', 'cancelled') then raise exception 'Invalid booking status'; end if;
  update public.bookings set status = next_status
    where id = target_booking_id and provider_id = current_user_id and status in ('pending', 'accepted') ;
  if not found then raise exception 'Booking cannot be updated'; end if;
  insert into public.booking_status_history (booking_id, status, changed_by, note)
  values (target_booking_id, next_status, current_user_id, response_note);
  insert into public.notifications (user_id, type, title, body, resource_type, resource_id)
  select farmer_id, 'booking', 'Booking ' || next_status::text, 'Your booking has been ' || next_status::text, 'booking', id
  from public.bookings where id = target_booking_id;
end;
$$;

revoke insert, update on public.bookings from authenticated;
revoke insert on public.booking_status_history from authenticated;
grant execute on function public.create_booking(uuid, uuid, numeric, timestamptz, text) to authenticated;
grant execute on function public.respond_to_booking(uuid, public.booking_status, text) to authenticated;
