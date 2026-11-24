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
