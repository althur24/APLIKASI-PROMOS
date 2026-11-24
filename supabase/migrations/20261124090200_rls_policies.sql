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
