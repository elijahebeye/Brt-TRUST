-- iTRuST schema for Supabase

create table if not exists public.profiles (
  id uuid primary key,
  display_name text,
  avatar_url text,
  reputation integer default 0,
  trust_balance numeric(12,2) default 0,
  created_at timestamptz default now(),
  signup_order integer
);

create table if not exists public.vouches (
  id bigserial primary key,
  voucher_id uuid references public.profiles(id),
  vouchee_id uuid references public.profiles(id),
  amount numeric(8,2) not null,
  created_at timestamptz default now()
);

create index if not exists profiles_reputation_idx on public.profiles(reputation desc);
create index if not exists vouches_created_idx on public.vouches(created_at desc);
