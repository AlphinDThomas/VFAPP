-- ══════════════════════════════════════════════════════════════
-- Fam FINANCE — Supabase Schema
-- Run this entire file in the Supabase SQL Editor (one shot)
-- ══════════════════════════════════════════════════════════════

-- ── 1. Profiles ───────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text not null default 'User',
  email text,
  currency text not null default 'USD',
  currency_symbol text not null default '$',
  notifications jsonb not null default '{"email":true,"push":true,"weekly":true,"budget":true}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- ── 2. Transactions ───────────────────────────────────────────
create table if not exists public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  type text not null check (type in ('income', 'expense')),
  category text not null,
  description text not null,
  amount numeric(12,2) not null check (amount > 0),
  date date not null default current_date,
  recurring boolean not null default false,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.transactions enable row level security;

create policy "Users can view own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "Users can insert own transactions"
  on public.transactions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own transactions"
  on public.transactions for update
  using (auth.uid() = user_id);

create policy "Users can delete own transactions"
  on public.transactions for delete
  using (auth.uid() = user_id);

-- Index for common queries
create index if not exists idx_transactions_user_date
  on public.transactions (user_id, date desc);

-- ── 3. Budgets ────────────────────────────────────────────────
create table if not exists public.budgets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  category text not null,
  limit_amount numeric(12,2) not null check (limit_amount > 0),
  period text not null default 'monthly',
  created_at timestamptz not null default now(),
  unique (user_id, category)
);

alter table public.budgets enable row level security;

create policy "Users can view own budgets"
  on public.budgets for select
  using (auth.uid() = user_id);

create policy "Users can insert own budgets"
  on public.budgets for insert
  with check (auth.uid() = user_id);

create policy "Users can update own budgets"
  on public.budgets for update
  using (auth.uid() = user_id);

create policy "Users can delete own budgets"
  on public.budgets for delete
  using (auth.uid() = user_id);

-- ── 4. Savings Goals ──────────────────────────────────────────
create table if not exists public.savings_goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  target numeric(12,2) not null check (target > 0),
  current numeric(12,2) not null default 0 check (current >= 0),
  deadline date,
  icon text default 'flag',
  created_at timestamptz not null default now()
);

alter table public.savings_goals enable row level security;

create policy "Users can view own savings"
  on public.savings_goals for select
  using (auth.uid() = user_id);

create policy "Users can insert own savings"
  on public.savings_goals for insert
  with check (auth.uid() = user_id);

create policy "Users can update own savings"
  on public.savings_goals for update
  using (auth.uid() = user_id);

create policy "Users can delete own savings"
  on public.savings_goals for delete
  using (auth.uid() = user_id);

-- ── 5. Auto-create profile on sign-up ─────────────────────────
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if it already exists, then create
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
