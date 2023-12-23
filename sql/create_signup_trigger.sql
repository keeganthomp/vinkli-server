-----------------------------------------------------
-- CAN COPY THIS INTO THE SQL TAB IN SUPABASE FOR NOW
-- NOTE: THIS DOES NOT CREATE THE USER TABLE ATM.
-- MAKE SURE TO RUN MIGRATIONS FIRST
-----------------------------------------------------

-- Set up Row Level Security (RLS)
-- See https://supabase.com/docs/guides/auth/row-level-security for more details.
alter table users
  enable row level security;

create policy "Public users are viewable by everyone." on users
  for select using (true);

create policy "Users can insert their own profile." on users
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on users
  for update using (auth.uid() = id);

-- Function that will be called when a new user signs up
create function public.handle_new_user()
returns trigger as $$
begin
  -- Insert into public.users
  insert into public.users (id, email, name)
  values (new.id, new.raw_user_meta_data->>'email', new.raw_user_meta_data->>'name');

  return new;
end;
$$ language plpgsql security definer;

-- Create the trigger to call the function when a new user signs up (inserts into auth.users)
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Might want to create buckets automatically in the future.
-- can do that below

-- -- Set up Storage!
-- insert into storage.buckets (id, name)
--   values ('avatars', 'avatars');

-- -- Set up access controls for storage.
-- -- See https://supabase.com/docs/guides/storage#policy-examples for more details.
-- create policy "Avatar images are publicly accessible." on storage.objects
--   for select using (bucket_id = 'avatars');

-- create policy "Anyone can upload an avatar." on storage.objects
--   for insert with check (bucket_id = 'avatars');