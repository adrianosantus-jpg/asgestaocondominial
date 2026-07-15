-- =========================================================
-- Inventário dos Salões de Festas
-- Módulo próprio (independente do Estoque) para controlar
-- louças, talheres, copos e utensílios de cada salão de festas.
-- =========================================================
create table public.salao_itens (
  id uuid primary key default gen_random_uuid(),
  condominio_id uuid not null default public.auth_condominio_id() references public.condominios (id) on delete cascade,
  salao text not null,
  nome text not null,
  categoria text,
  quantidade numeric(12,2) not null default 0 check (quantidade >= 0),
  valor_unitario numeric(12,2) not null default 0,
  valor_total numeric(14,2) generated always as (quantidade * valor_unitario) stored,
  observacoes text,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index salao_itens_condominio_id_idx on public.salao_itens (condominio_id);
create index salao_itens_salao_idx on public.salao_itens (salao);

create trigger set_updated_at
  before update on public.salao_itens
  for each row execute function public.set_updated_at();

-- =========================================================
-- RLS
-- =========================================================
alter table public.salao_itens enable row level security;

create policy "salao_itens_select" on public.salao_itens
  for select using (condominio_id = public.auth_condominio_id());

create policy "salao_itens_insert" on public.salao_itens
  for insert with check (condominio_id = public.auth_condominio_id());

create policy "salao_itens_update" on public.salao_itens
  for update using (condominio_id = public.auth_condominio_id())
  with check (condominio_id = public.auth_condominio_id());

create policy "salao_itens_delete" on public.salao_itens
  for delete using (condominio_id = public.auth_condominio_id() and public.is_admin());

-- =========================================================
-- Realtime
-- =========================================================
alter publication supabase_realtime add table public.salao_itens;
