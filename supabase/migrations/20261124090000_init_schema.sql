create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  email text not null,
  role text not null default 'user' check (role in ('admin', 'user')),
  is_active boolean not null default true,
  must_change_password boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  is_active boolean not null default true,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.request_number_counters (
  year integer primary key,
  last_number integer not null default 0
);

create or replace function public.generate_request_number()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  current_year integer := extract(year from now())::integer;
  next_number integer;
begin
  insert into public.request_number_counters (year, last_number)
  values (current_year, 1)
  on conflict (year)
  do update set last_number = public.request_number_counters.last_number + 1
  returning last_number into next_number;

  return 'PR-' || current_year::text || '-' || lpad(next_number::text, 4, '0');
end;
$$;

create table public.expense_requests (
  id uuid primary key default gen_random_uuid(),
  request_number text not null unique default public.generate_request_number(),
  title text not null,
  category_id uuid not null references public.categories (id),
  amount numeric(18, 2) not null check (amount > 0),
  submission_date date not null,
  disbursement_date date,
  status text not null default 'submitted' check (status in ('submitted', 'paid')),
  notes text,
  created_by uuid not null default auth.uid() references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint disbursement_after_submission
    check (disbursement_date is null or disbursement_date >= submission_date),
  constraint paid_requires_disbursement
    check (status <> 'paid' or disbursement_date is not null)
);

create table public.request_attachments (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.expense_requests (id) on delete cascade,
  file_name text not null,
  storage_path text not null,
  file_size bigint,
  mime_type text,
  uploaded_by uuid not null default auth.uid() references public.profiles (id),
  created_at timestamptz not null default now()
);

create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references public.expense_requests (id) on delete set null,
  actor_id uuid not null default auth.uid() references public.profiles (id),
  action text not null,
  description text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index expense_requests_status_idx
  on public.expense_requests (status)
  where deleted_at is null;
create index expense_requests_submission_date_idx
  on public.expense_requests (submission_date);
create index expense_requests_category_idx
  on public.expense_requests (category_id);
create index expense_requests_created_by_idx
  on public.expense_requests (created_by);
create index request_attachments_request_idx
  on public.request_attachments (request_id);
create index activity_logs_request_idx
  on public.activity_logs (request_id, created_at desc);
create index activity_logs_actor_idx
  on public.activity_logs (actor_id);
