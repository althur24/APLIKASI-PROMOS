create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  is_active boolean not null default true,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.expense_requests
  drop constraint if exists expense_requests_amount_check;
alter table public.expense_requests
  drop constraint if exists expense_requests_status_check;
alter table public.expense_requests
  drop constraint if exists paid_requires_disbursement;
alter table public.expense_requests
  drop constraint if exists disbursement_after_submission;

alter table public.expense_requests alter column category_id drop not null;
alter table public.expense_requests alter column amount set default 0;

alter table public.expense_requests
  add column if not exists type text not null default 'pengajuan',
  add column if not exists project_id uuid references public.projects (id) on delete set null,
  add column if not exists item_count integer not null default 0;

alter table public.expense_requests
  drop constraint if exists expense_requests_type_check;
alter table public.expense_requests
  add constraint expense_requests_type_check
    check (type in ('pengajuan', 'reimbursement'));
alter table public.expense_requests
  add constraint expense_requests_status_check
    check (status in ('submitted', 'partial', 'paid', 'realized'));

create table if not exists public.expense_request_items (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.expense_requests (id) on delete cascade,
  name text not null,
  category_id uuid references public.categories (id) on delete set null,
  amount numeric(18, 2) not null check (amount > 0),
  status text not null default 'submitted'
    check (status in ('submitted', 'paid', 'realized')),
  disbursement_date date,
  realized_date date,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint item_paid_requires_disbursement
    check (status <> 'paid' or disbursement_date is not null),
  constraint item_realized_requires_date
    check (status <> 'realized' or realized_date is not null)
);

alter table public.request_attachments
  add column if not exists item_id uuid
    references public.expense_request_items (id) on delete cascade,
  add column if not exists purpose text not null default 'general';

alter table public.request_attachments
  drop constraint if exists request_attachments_purpose_check;
alter table public.request_attachments
  add constraint request_attachments_purpose_check
    check (purpose in ('general', 'receipt', 'realization'));

alter table public.activity_logs
  add column if not exists item_id uuid
    references public.expense_request_items (id) on delete set null;

create trigger expense_request_items_set_updated_at
  before update on public.expense_request_items
  for each row execute function public.set_updated_at();

insert into public.expense_request_items (
  request_id,
  name,
  category_id,
  amount,
  status,
  disbursement_date,
  sort_order,
  created_at
)
select
  er.id,
  er.title,
  er.category_id,
  er.amount,
  case when er.status = 'paid' then 'paid' else 'submitted' end,
  er.disbursement_date,
  0,
  er.created_at
from public.expense_requests er
where not exists (
  select 1 from public.expense_request_items i where i.request_id = er.id
);

create or replace function public.recompute_request_totals(p_request_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_amount numeric(18, 2);
  v_count integer;
  v_status text;
  v_all_realized boolean;
  v_all_paid boolean;
  v_any_progress boolean;
begin
  select coalesce(sum(amount), 0), count(*)
    into v_amount, v_count
  from public.expense_request_items
  where request_id = p_request_id;

  if v_count = 0 then
    v_status := 'submitted';
  else
    select
      bool_and(status = 'realized'),
      bool_and(status in ('paid', 'realized')),
      bool_or(status in ('paid', 'realized'))
    into v_all_realized, v_all_paid, v_any_progress
    from public.expense_request_items
    where request_id = p_request_id;

    if v_all_realized then
      v_status := 'realized';
    elsif v_all_paid then
      v_status := 'paid';
    elsif v_any_progress then
      v_status := 'partial';
    else
      v_status := 'submitted';
    end if;
  end if;

  update public.expense_requests
  set amount = v_amount,
      item_count = v_count,
      status = v_status
  where id = p_request_id;
end;
$$;

create or replace function public.expense_items_after_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.recompute_request_totals(coalesce(new.request_id, old.request_id));
  return null;
end;
$$;

create trigger expense_request_items_totals
  after insert or update or delete on public.expense_request_items
  for each row execute function public.expense_items_after_change();

do $$
declare
  r record;
begin
  for r in select id from public.expense_requests loop
    perform public.recompute_request_totals(r.id);
  end loop;
end $$;

create index if not exists expense_request_items_request_idx
  on public.expense_request_items (request_id);
create index if not exists expense_request_items_status_idx
  on public.expense_request_items (status);
create index if not exists request_attachments_item_idx
  on public.request_attachments (item_id);
create index if not exists expense_requests_project_idx
  on public.expense_requests (project_id);
create index if not exists expense_requests_type_idx
  on public.expense_requests (type);

alter table public.projects enable row level security;
alter table public.expense_request_items enable row level security;

create policy projects_select_active
  on public.projects for select to authenticated
  using (public.is_active_user());
create policy projects_insert_active
  on public.projects for insert to authenticated
  with check (public.is_active_user());
create policy projects_update_active
  on public.projects for update to authenticated
  using (public.is_active_user())
  with check (public.is_active_user());

create policy items_select_active
  on public.expense_request_items for select to authenticated
  using (public.is_active_user());
create policy items_insert_active
  on public.expense_request_items for insert to authenticated
  with check (public.is_active_user());
create policy items_update_active
  on public.expense_request_items for update to authenticated
  using (public.is_active_user())
  with check (public.is_active_user());
create policy items_delete_active
  on public.expense_request_items for delete to authenticated
  using (public.is_active_user());

grant all privileges on public.projects to anon, authenticated, service_role;
grant all privileges on public.expense_request_items to anon, authenticated, service_role;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin
      alter publication supabase_realtime add table public.projects;
    exception when duplicate_object then null;
    end;
    begin
      alter publication supabase_realtime add table public.expense_request_items;
    exception when duplicate_object then null;
    end;
  end if;
end $$;
