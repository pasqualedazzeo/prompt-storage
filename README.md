# Prompt Storage App

A modern web application for storing and managing prompts, built with React, TypeScript, and Supabase.

## Setup Instructions

### 1. Supabase Setup

1. Create a new project on [Supabase](https://supabase.com)
2. Once your project is ready, go to Project Settings > API to find your:
   - Project URL (VITE_SUPABASE_URL)
   - Project API Key - `anon public` (VITE_SUPABASE_ANON_KEY)

3. Set up the database schema:
   - Go to the SQL Editor in your Supabase dashboard
   - Click "New Query"
   - Copy and paste the following SQL:

```sql
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

-- Create policy to allow all operations for authenticated users
create policy "Enable all operations for authenticated users" on public.prompts
  for all
  to authenticated
  using (true)
  with check (true);
```

4. Click "Run" to execute the SQL commands

### 2. Environment Setup

1. Create a `.env.local` file in the root directory with your Supabase credentials:

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Application

```bash
npm run dev
```

## Troubleshooting

If you encounter a database error:
1. Verify that you've executed the SQL commands in the Supabase SQL Editor
2. Check that your environment variables match those in your Supabase project settings
3. Ensure that RLS (Row Level Security) policies are properly set up by re-running the SQL commands

## Features

- Create, read, update, and delete prompts
- Categorize prompts
- Add tags to prompts
- Filter prompts by category and tags
- Dark mode support
- Responsive design

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Supabase
- React Router