-- Extensão para geração de UUIDs
create extension if not exists pgcrypto with schema extensions;

-- Perfis de acesso disponíveis no sistema
create type public.user_role as enum ('admin', 'gestor', 'sindico', 'zelador', 'auxiliar');

-- Trigger genérico para manter updated_at em dia
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =========================================================
-- condominios
-- Tabela raiz do multi-tenant: toda tabela de negócio referencia
-- condominio_id. A v1 opera com um único condomínio cadastrado,
-- mas o schema já nasce pronto para múltiplos.
-- =========================================================
create table public.condominios (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  cnpj text,
  endereco text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at
  before update on public.condominios
  for each row execute function public.set_updated_at();

-- =========================================================
-- profiles
-- Espelha auth.users (1:1) com metadados de aplicação.
-- =========================================================
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  condominio_id uuid not null references public.condominios (id) on delete cascade,
  nome text not null,
  email text not null,
  role public.user_role not null default 'auxiliar',
  avatar_url text,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_condominio_id_idx on public.profiles (condominio_id);

create trigger set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- =========================================================
-- Helper de RLS: condomínio do usuário autenticado
-- security definer para poder ler profiles mesmo com RLS ativa
-- =========================================================
create or replace function public.auth_condominio_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select condominio_id from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- =========================================================
-- Trigger: cria o profile automaticamente ao criar um usuário no Auth.
-- Assume um único condomínio (v1 single-tenant); quando o produto virar
-- multi-tenant, este trigger precisa de um fluxo de convite/seleção de
-- condomínio em vez de pegar o primeiro registro.
-- =========================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_condominio_id uuid;
begin
  select id into v_condominio_id from public.condominios order by created_at limit 1;

  insert into public.profiles (id, condominio_id, nome, email, role)
  values (
    new.id,
    v_condominio_id,
    coalesce(new.raw_user_meta_data ->> 'nome', split_part(new.email, '@', 1)),
    new.email,
    coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'auxiliar')
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================================
-- RLS
-- =========================================================
alter table public.condominios enable row level security;
alter table public.profiles enable row level security;

create policy "condominios_select_own" on public.condominios
  for select using (id = public.auth_condominio_id());

create policy "profiles_select_same_condominio" on public.profiles
  for select using (condominio_id = public.auth_condominio_id());

create policy "profiles_update_self" on public.profiles
  for update using (id = auth.uid())
  with check (id = auth.uid());

create policy "profiles_admin_manage" on public.profiles
  for all using (condominio_id = public.auth_condominio_id() and public.is_admin())
  with check (condominio_id = public.auth_condominio_id() and public.is_admin());
