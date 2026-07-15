insert into storage.buckets (id, name, public)
values
  ('fornecedores', 'fornecedores', false),
  ('os', 'os', false)
on conflict (id) do nothing;

create policy "fornecedores_storage_select" on storage.objects
  for select using (
    bucket_id = 'fornecedores'
    and (storage.foldername(name))[1] = public.auth_condominio_id()::text
  );
create policy "fornecedores_storage_insert" on storage.objects
  for insert with check (
    bucket_id = 'fornecedores'
    and (storage.foldername(name))[1] = public.auth_condominio_id()::text
  );
create policy "fornecedores_storage_update" on storage.objects
  for update using (
    bucket_id = 'fornecedores'
    and (storage.foldername(name))[1] = public.auth_condominio_id()::text
  );
create policy "fornecedores_storage_delete" on storage.objects
  for delete using (
    bucket_id = 'fornecedores'
    and (storage.foldername(name))[1] = public.auth_condominio_id()::text
  );

create policy "os_storage_select" on storage.objects
  for select using (
    bucket_id = 'os'
    and (storage.foldername(name))[1] = public.auth_condominio_id()::text
  );
create policy "os_storage_insert" on storage.objects
  for insert with check (
    bucket_id = 'os'
    and (storage.foldername(name))[1] = public.auth_condominio_id()::text
  );
create policy "os_storage_update" on storage.objects
  for update using (
    bucket_id = 'os'
    and (storage.foldername(name))[1] = public.auth_condominio_id()::text
  );
create policy "os_storage_delete" on storage.objects
  for delete using (
    bucket_id = 'os'
    and (storage.foldername(name))[1] = public.auth_condominio_id()::text
  );
