insert into public.projects (name)
select 'Umum'
where not exists (select 1 from public.projects);
