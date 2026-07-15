insert into storage.buckets (id, name, public)
values
  ('equipamentos', 'equipamentos', false),
  ('manutencao', 'manutencao', false)
on conflict (id) do nothing;

create policy "equipamentos_storage_select" on storage.objects
  for select using (
    bucket_id = 'equipamentos'
    and (storage.foldername(name))[1] = public.auth_condominio_id()::text
  );
create policy "equipamentos_storage_insert" on storage.objects
  for insert with check (
    bucket_id = 'equipamentos'
    and (storage.foldername(name))[1] = public.auth_condominio_id()::text
  );
create policy "equipamentos_storage_update" on storage.objects
  for update using (
    bucket_id = 'equipamentos'
    and (storage.foldername(name))[1] = public.auth_condominio_id()::text
  );
create policy "equipamentos_storage_delete" on storage.objects
  for delete using (
    bucket_id = 'equipamentos'
    and (storage.foldername(name))[1] = public.auth_condominio_id()::text
  );

create policy "manutencao_storage_select" on storage.objects
  for select using (
    bucket_id = 'manutencao'
    and (storage.foldername(name))[1] = public.auth_condominio_id()::text
  );
create policy "manutencao_storage_insert" on storage.objects
  for insert with check (
    bucket_id = 'manutencao'
    and (storage.foldername(name))[1] = public.auth_condominio_id()::text
  );
create policy "manutencao_storage_update" on storage.objects
  for update using (
    bucket_id = 'manutencao'
    and (storage.foldername(name))[1] = public.auth_condominio_id()::text
  );
create policy "manutencao_storage_delete" on storage.objects
  for delete using (
    bucket_id = 'manutencao'
    and (storage.foldername(name))[1] = public.auth_condominio_id()::text
  );
