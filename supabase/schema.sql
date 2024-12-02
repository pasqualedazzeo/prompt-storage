-- Create prompts table
create table public.prompts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  tags text[] default '{}'::text[] not null,
  category text not null
);

-- Set up row level security
alter table public.prompts enable row level security;

-- Create policy to allow all operations for anonymous users
create policy "Enable all operations for anonymous users" on public.prompts
  for all
  to anon
  using (true)
  with check (true);

-- Note: The authenticated users policy is not needed since we're operating in anonymous mode,
-- but we'll keep it for future use
create policy "Enable all operations for authenticated users" on public.prompts
  for all
  to authenticated
  using (true)
  with check (true);