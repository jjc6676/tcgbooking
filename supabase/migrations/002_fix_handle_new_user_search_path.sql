-- Fix "Database error saving new user"
-- SECURITY DEFINER functions require explicit SET search_path = public
-- so the function can resolve the profiles table and user_role enum.
create or replace function handle_new_user()
returns trigger language plpgsql security definer
set search_path = public
as $$
begin
  insert into profiles (id, role, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'client')::user_role,
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$;
