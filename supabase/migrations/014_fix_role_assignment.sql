-- Fix account role assignment
--
-- Problem: handle_new_user() trusted raw_user_meta_data->>'role', which is
-- supplied client-side at signup. That allowed accounts (e.g.
-- jasonchoplin@gmail.com) to end up with role 'stylist' and be redirected
-- into the admin app instead of the booking app.
--
-- The only stylist for this studio is Keri Choplin
-- (kerichoplin@gmail.com). Every other signup must be a 'client'.

-- 1. Rewrite the trigger so it ignores client-supplied role and only grants
--    'stylist' to the studio owner's email.
create or replace function handle_new_user()
returns trigger language plpgsql security definer
set search_path = public
as $$
declare
  assigned_role user_role;
begin
  if lower(new.email) = 'kerichoplin@gmail.com' then
    assigned_role := 'stylist';
  else
    assigned_role := 'client';
  end if;

  insert into profiles (id, role, full_name)
  values (
    new.id,
    assigned_role,
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$;

-- 2. Repair any existing profiles that were incorrectly marked as stylists.
--    Anyone who is not Keri gets demoted back to 'client'.
update profiles
set role = 'client'
where role = 'stylist'
  and id not in (
    select id from auth.users where lower(email) = 'kerichoplin@gmail.com'
  );

-- 3. Remove any stray rows from the stylists table that don't belong to Keri.
delete from stylists
where user_id not in (
  select id from auth.users where lower(email) = 'kerichoplin@gmail.com'
);
