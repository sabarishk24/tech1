-- Follow-up security migration: users may update personal details but cannot
-- promote themselves from farmer to provider/admin through the browser.

drop trigger if exists profiles_prevent_role_change on public.profiles;
drop function if exists public.prevent_role_change();

revoke update on public.profiles from authenticated;
grant update (full_name, phone, avatar_path) on public.profiles to authenticated;

-- Administrators change roles from the Supabase SQL editor with this function.
-- It is intentionally not callable by browser clients.
create or replace function public.set_user_role(target_user_id uuid, new_role public.user_role)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles set role = new_role where id = target_user_id;
end;
$$;

revoke all on function public.set_user_role(uuid, public.user_role) from public, anon, authenticated;
