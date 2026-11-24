-- Promotion Tracker - full setup (schema + functions + RLS + storage + grants + hardening + history + seed)
-- Jalankan seluruh file ini sekali di Supabase SQL Editor (project baru).

-- ===== supabase/migrations/20261124090000_init_schema.sql =====
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


-- ===== supabase/migrations/20261124090100_functions_triggers.sql =====
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger expense_requests_set_updated_at
  before update on public.expense_requests
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    full_name,
    email,
    role,
    is_active,
    must_change_password
  )
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      split_part(new.email, '@', 1)
    ),
    coalesce(new.email, ''),
    coalesce(nullif(new.raw_user_meta_data ->> 'role', ''), 'user'),
    true,
    coalesce((new.raw_user_meta_data ->> 'must_change_password')::boolean, false)
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_active_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and is_active = true
  );
$$;

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.profiles
  where id = auth.uid()
    and is_active = true;
$$;

create or replace function public.log_activity(
  p_request_id uuid,
  p_action text,
  p_description text,
  p_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  log_id uuid;
begin
  if not public.is_active_user() then
    raise exception 'Akses ditolak';
  end if;

  insert into public.activity_logs (request_id, actor_id, action, description, metadata)
  values (p_request_id, auth.uid(), p_action, p_description, coalesce(p_metadata, '{}'::jsonb))
  returning id into log_id;

  return log_id;
end;
$$;


-- ===== supabase/migrations/20261124090200_rls_policies.sql =====
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.expense_requests enable row level security;
alter table public.request_attachments enable row level security;
alter table public.activity_logs enable row level security;
alter table public.request_number_counters enable row level security;

create policy profiles_select_active
  on public.profiles
  for select
  to authenticated
  using (public.is_active_user());

create policy profiles_update_admin
  on public.profiles
  for update
  to authenticated
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

create policy categories_select_active
  on public.categories
  for select
  to authenticated
  using (public.is_active_user());

create policy categories_insert_active
  on public.categories
  for insert
  to authenticated
  with check (public.is_active_user());

create policy categories_update_active
  on public.categories
  for update
  to authenticated
  using (public.is_active_user())
  with check (public.is_active_user());

create policy expense_requests_select_active
  on public.expense_requests
  for select
  to authenticated
  using (public.is_active_user());

create policy expense_requests_insert_active
  on public.expense_requests
  for insert
  to authenticated
  with check (public.is_active_user() and created_by = auth.uid());

create policy expense_requests_update_active
  on public.expense_requests
  for update
  to authenticated
  using (public.is_active_user())
  with check (public.is_active_user());

create policy request_attachments_select_active
  on public.request_attachments
  for select
  to authenticated
  using (public.is_active_user());

create policy request_attachments_insert_active
  on public.request_attachments
  for insert
  to authenticated
  with check (public.is_active_user() and uploaded_by = auth.uid());

create policy request_attachments_update_active
  on public.request_attachments
  for update
  to authenticated
  using (public.is_active_user())
  with check (public.is_active_user());

create policy request_attachments_delete_active
  on public.request_attachments
  for delete
  to authenticated
  using (public.is_active_user());

create policy activity_logs_select_active
  on public.activity_logs
  for select
  to authenticated
  using (public.is_active_user());


-- ===== supabase/migrations/20261124090300_storage.sql =====
insert into storage.buckets (id, name, public)
values ('request-attachments', 'request-attachments', false)
on conflict (id) do nothing;

create policy attachments_storage_select
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'request-attachments'
    and public.is_active_user()
  );

create policy attachments_storage_insert
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'request-attachments'
    and public.is_active_user()
  );

create policy attachments_storage_update
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'request-attachments'
    and public.is_active_user()
  )
  with check (
    bucket_id = 'request-attachments'
    and public.is_active_user()
  );

create policy attachments_storage_delete
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'request-attachments'
    and public.is_active_user()
  );


-- ===== supabase/migrations/20261124090400_grants.sql =====
grant usage on schema public to anon, authenticated, service_role;

grant all privileges on all tables in schema public to anon, authenticated, service_role;
grant all privileges on all sequences in schema public to anon, authenticated, service_role;
grant all privileges on all functions in schema public to anon, authenticated, service_role;

alter default privileges in schema public
  grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public
  grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public
  grant all on functions to anon, authenticated, service_role;


-- ===== supabase/migrations/20261124090500_harden_signup.sql =====
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    full_name,
    email,
    role,
    is_active,
    must_change_password
  )
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      split_part(new.email, '@', 1)
    ),
    coalesce(new.email, ''),
    coalesce(nullif(new.raw_user_meta_data ->> 'role', ''), 'user'),
    coalesce((new.raw_user_meta_data ->> 'is_active')::boolean, false),
    coalesce((new.raw_user_meta_data ->> 'must_change_password')::boolean, false)
  )
  on conflict (id) do nothing;

  return new;
end;
$$;


-- ===== supabase/migrations/20261124090600_history.sql =====
create index if not exists activity_logs_created_at_idx
  on public.activity_logs (created_at desc);

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin
      alter publication supabase_realtime add table public.expense_requests;
    exception when duplicate_object then null;
    end;
    begin
      alter publication supabase_realtime add table public.categories;
    exception when duplicate_object then null;
    end;
    begin
      alter publication supabase_realtime add table public.activity_logs;
    exception when duplicate_object then null;
    end;
  end if;
end $$;


-- ===== supabase/seed.sql =====
insert into public.categories (name, is_active)
values
  ('Digital Ads', true),
  ('Event & Sponsorship', true),
  ('Produksi Konten', true),
  ('Operasional Marketing', true),
  ('Cetak & Merchandise', true),
  ('Transportasi', true),
  ('Lainnya', true)
on conflict (name) do nothing;


