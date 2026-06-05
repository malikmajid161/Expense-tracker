-- ════════════════════════════════════════════════════════════
--  Expense Tracker (Khata) — Supabase Setup
--  Run this whole file in: Supabase Dashboard > SQL Editor > New query
-- ════════════════════════════════════════════════════════════

-- ───────────── CATEGORIES (accounts) ─────────────
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  icon        text not null default 'wallet',
  created_at  timestamptz not null default now()
);

-- ───────────── EXPENSES (entries) ─────────────
create table if not exists public.expenses (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  category_id  uuid not null references public.categories(id) on delete cascade,
  amount       numeric(12,2) not null check (amount > 0),
  note         text,
  spent_at     timestamptz not null default now(),
  created_at   timestamptz not null default now()
);

-- Helpful indexes
create index if not exists idx_categories_user on public.categories(user_id);
create index if not exists idx_expenses_user     on public.expenses(user_id);
create index if not exists idx_expenses_category on public.expenses(category_id);

-- ════════════════════════════════════════════════════════════
--  ROW LEVEL SECURITY
--  Each user can only see and change THEIR OWN data.
-- ════════════════════════════════════════════════════════════

alter table public.categories enable row level security;
alter table public.expenses   enable row level security;

-- ── Categories policies ──
drop policy if exists "categories_select_own" on public.categories;
create policy "categories_select_own" on public.categories
  for select using (auth.uid() = user_id);

drop policy if exists "categories_insert_own" on public.categories;
create policy "categories_insert_own" on public.categories
  for insert with check (auth.uid() = user_id);

drop policy if exists "categories_update_own" on public.categories;
create policy "categories_update_own" on public.categories
  for update using (auth.uid() = user_id);

drop policy if exists "categories_delete_own" on public.categories;
create policy "categories_delete_own" on public.categories
  for delete using (auth.uid() = user_id);

-- ── Expenses policies ──
drop policy if exists "expenses_select_own" on public.expenses;
create policy "expenses_select_own" on public.expenses
  for select using (auth.uid() = user_id);

drop policy if exists "expenses_insert_own" on public.expenses;
create policy "expenses_insert_own" on public.expenses
  for insert with check (auth.uid() = user_id);

drop policy if exists "expenses_update_own" on public.expenses;
create policy "expenses_update_own" on public.expenses
  for update using (auth.uid() = user_id);

drop policy if exists "expenses_delete_own" on public.expenses;
create policy "expenses_delete_own" on public.expenses
  for delete using (auth.uid() = user_id);

-- ════════════════════════════════════════════════════════════
--  OPTIONAL: starter categories for every new user
--  This trigger gives new sign-ups a few ready-made accounts so
--  they never face an empty screen.
-- ════════════════════════════════════════════════════════════

create or replace function public.seed_starter_categories()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.categories (user_id, name, icon) values
    (new.id, 'Grocery', 'cart'),
    (new.id, 'Rent',    'home'),
    (new.id, 'Fuel',    'fuel'),
    (new.id, 'Food',    'food'),
    (new.id, 'Bills',   'bills');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.seed_starter_categories();
