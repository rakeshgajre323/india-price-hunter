
-- Recreate with search_path + fall back to metadata email for phone-OTP signups
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, email, phone, pincode)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    coalesce(new.email, new.raw_user_meta_data->>'email'),
    new.phone,
    new.raw_user_meta_data->>'pincode'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin new.updated_at = now(); return new; end; $$;

-- These are trigger-only helpers; nobody should be able to call them via the API.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.touch_updated_at() from public, anon, authenticated;
