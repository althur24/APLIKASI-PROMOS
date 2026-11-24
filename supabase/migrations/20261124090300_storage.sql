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
