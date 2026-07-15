-- Bucket privado: acesso controlado por RLS via prefixo <condominio_id>/...
insert into storage.buckets (id, name, public)
values ('produtos', 'produtos', false)
on conflict (id) do nothing;

create policy "produtos_storage_select" on storage.objects
  for select using (
    bucket_id = 'produtos'
    and (storage.foldername(name))[1] = public.auth_condominio_id()::text
  );

create policy "produtos_storage_insert" on storage.objects
  for insert with check (
    bucket_id = 'produtos'
    and (storage.foldername(name))[1] = public.auth_condominio_id()::text
  );

create policy "produtos_storage_update" on storage.objects
  for update using (
    bucket_id = 'produtos'
    and (storage.foldername(name))[1] = public.auth_condominio_id()::text
  );

create policy "produtos_storage_delete" on storage.objects
  for delete using (
    bucket_id = 'produtos'
    and (storage.foldername(name))[1] = public.auth_condominio_id()::text
  );
