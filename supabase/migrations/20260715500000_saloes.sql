-- =========================================================
-- Salões (cadastro dos ambientes do Inventário Salões de
-- Festas, com foto de capa para os cards)
-- =========================================================
create table public.saloes (
  id uuid primary key default gen_random_uuid(),
  condominio_id uuid not null default public.auth_condominio_id() references public.condominios (id) on delete cascade,
  nome text not null,
  foto_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (condominio_id, nome)
);

create index saloes_condominio_id_idx on public.saloes (condominio_id);

create trigger set_updated_at
  before update on public.saloes
  for each row execute function public.set_updated_at();

-- =========================================================
-- RLS
-- =========================================================
alter table public.saloes enable row level security;

create policy "saloes_select" on public.saloes
  for select using (condominio_id = public.auth_condominio_id());

create policy "saloes_insert" on public.saloes
  for insert with check (condominio_id = public.auth_condominio_id());

create policy "saloes_update" on public.saloes
  for update using (condominio_id = public.auth_condominio_id())
  with check (condominio_id = public.auth_condominio_id());

create policy "saloes_delete" on public.saloes
  for delete using (condominio_id = public.auth_condominio_id() and public.is_admin());

-- =========================================================
-- Realtime
-- =========================================================
alter publication supabase_realtime add table public.saloes;

-- =========================================================
-- Cadastra os 6 salões existentes.
-- condominio_id é resolvido explicitamente aqui (não via
-- auth_condominio_id()) porque este script roda direto no
-- SQL Editor, sem sessão de usuário autenticado.
-- =========================================================
insert into public.saloes (condominio_id, nome)
select c.id, s.nome
from (select id from public.condominios order by created_at limit 1) c
cross join unnest(array[
  'Salão Gourmet', 'Wine Bar', 'Pub Jogos', 'Barbecue A', 'Barbecue B', 'Salão de Festas Kids'
]) as s(nome)
on conflict (condominio_id, nome) do nothing;

-- =========================================================
-- Storage: bucket privado para fotos de capa dos salões
-- =========================================================
insert into storage.buckets (id, name, public)
values ('saloes', 'saloes', false)
on conflict (id) do nothing;

create policy "saloes_storage_select" on storage.objects
  for select using (
    bucket_id = 'saloes'
    and (storage.foldername(name))[1] = public.auth_condominio_id()::text
  );

create policy "saloes_storage_insert" on storage.objects
  for insert with check (
    bucket_id = 'saloes'
    and (storage.foldername(name))[1] = public.auth_condominio_id()::text
  );

create policy "saloes_storage_update" on storage.objects
  for update using (
    bucket_id = 'saloes'
    and (storage.foldername(name))[1] = public.auth_condominio_id()::text
  );

create policy "saloes_storage_delete" on storage.objects
  for delete using (
    bucket_id = 'saloes'
    and (storage.foldername(name))[1] = public.auth_condominio_id()::text
  );
