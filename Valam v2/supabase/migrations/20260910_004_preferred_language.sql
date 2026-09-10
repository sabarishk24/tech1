-- Interface-language preference only. User-written content remains stored in
-- its original language and is never altered by the application.
alter table public.profiles
  add column if not exists preferred_language text not null default 'en'
  check (preferred_language in ('en', 'ta', 'hi', 'te', 'kn', 'ml'));

-- Migration 002 narrowed profile updates to safe personal fields. The user's
-- own interface preference is safe to update as well.
grant update (full_name, phone, avatar_path, preferred_language)
  on public.profiles to authenticated;
