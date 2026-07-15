-- =========================================================
-- Sequências por condomínio (uso genérico: código de produto,
-- futuramente número de OS, etc.)
-- =========================================================
create table public.condominio_sequences (
  condominio_id uuid not null references public.condominios (id) on delete cascade,
  chave text not null,
  valor bigint not null default 0,
  primary key (condominio_id, chave)
);

create or replace function public.next_sequence(p_condominio_id uuid, p_chave text)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_valor bigint;
begin
  insert into public.condominio_sequences (condominio_id, chave, valor)
  values (p_condominio_id, p_chave, 1)
  on conflict (condominio_id, chave)
  do update set valor = public.condominio_sequences.valor + 1
  returning valor into v_valor;

  return v_valor;
end;
$$;

-- =========================================================
-- categorias_produto
-- =========================================================
create table public.categorias_produto (
  id uuid primary key default gen_random_uuid(),
  condominio_id uuid not null default public.auth_condominio_id() references public.condominios (id) on delete cascade,
  nome text not null,
  created_at timestamptz not null default now(),
  unique (condominio_id, nome)
);

-- =========================================================
-- produtos
-- =========================================================
create table public.produtos (
  id uuid primary key default gen_random_uuid(),
  condominio_id uuid not null default public.auth_condominio_id() references public.condominios (id) on delete cascade,
  codigo text,
  nome text not null,
  categoria_id uuid references public.categorias_produto (id) on delete set null,
  marca text,
  unidade text not null default 'un',
  local text,
  quantidade numeric(12,2) not null default 0 check (quantidade >= 0),
  estoque_minimo numeric(12,2) not null default 0,
  estoque_maximo numeric(12,2),
  valor_unitario numeric(12,2) not null default 0,
  valor_total numeric(14,2) generated always as (quantidade * valor_unitario) stored,
  foto_url text,
  codigo_barras text,
  observacoes text,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (condominio_id, codigo)
);

create index produtos_condominio_id_idx on public.produtos (condominio_id);
create index produtos_categoria_id_idx on public.produtos (categoria_id);

create trigger set_updated_at
  before update on public.produtos
  for each row execute function public.set_updated_at();

-- Código automático (ex: PR00001) quando não informado manualmente.
create or replace function public.produtos_set_codigo()
returns trigger
language plpgsql
as $$
begin
  if new.codigo is null or new.codigo = '' then
    new.codigo := 'PR' || lpad(public.next_sequence(new.condominio_id, 'produto')::text, 5, '0');
  end if;
  return new;
end;
$$;

create trigger set_codigo
  before insert on public.produtos
  for each row execute function public.produtos_set_codigo();

-- =========================================================
-- movimentacoes_estoque
-- Ledger imutável: sem policy de update/delete.
-- =========================================================
create table public.movimentacoes_estoque (
  id uuid primary key default gen_random_uuid(),
  condominio_id uuid not null default public.auth_condominio_id() references public.condominios (id) on delete cascade,
  produto_id uuid not null references public.produtos (id) on delete restrict,
  tipo text not null check (tipo in ('entrada', 'saida', 'ajuste', 'inventario')),
  quantidade numeric(12,2) not null,
  motivo text,
  usuario_id uuid not null default auth.uid() references public.profiles (id),
  created_at timestamptz not null default now(),
  constraint movimentacoes_quantidade_check check (
    (tipo in ('entrada', 'saida') and quantidade > 0) or tipo in ('ajuste', 'inventario')
  )
);

create index movimentacoes_produto_id_idx on public.movimentacoes_estoque (produto_id);
create index movimentacoes_condominio_id_idx on public.movimentacoes_estoque (condominio_id);

-- =========================================================
-- notificacoes
-- =========================================================
create table public.notificacoes (
  id uuid primary key default gen_random_uuid(),
  condominio_id uuid not null default public.auth_condominio_id() references public.condominios (id) on delete cascade,
  tipo text not null,
  titulo text not null,
  mensagem text,
  link text,
  lida boolean not null default false,
  created_at timestamptz not null default now()
);

create index notificacoes_condominio_id_idx on public.notificacoes (condominio_id);

-- =========================================================
-- Trigger: aplica a movimentação ao estoque e notifica quando
-- o resultado fica na/abaixo da quantidade mínima.
-- =========================================================
create or replace function public.aplicar_movimentacao_estoque()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_produto public.produtos%rowtype;
begin
  if new.tipo = 'entrada' then
    update public.produtos set quantidade = quantidade + new.quantidade
      where id = new.produto_id returning * into v_produto;
  elsif new.tipo = 'saida' then
    update public.produtos set quantidade = quantidade - new.quantidade
      where id = new.produto_id returning * into v_produto;
  elsif new.tipo = 'ajuste' then
    update public.produtos set quantidade = quantidade + new.quantidade
      where id = new.produto_id returning * into v_produto;
  elsif new.tipo = 'inventario' then
    update public.produtos set quantidade = new.quantidade
      where id = new.produto_id returning * into v_produto;
  end if;

  if v_produto.quantidade <= v_produto.estoque_minimo then
    insert into public.notificacoes (condominio_id, tipo, titulo, mensagem, link)
    values (
      new.condominio_id,
      'estoque_minimo',
      'Estoque baixo: ' || v_produto.nome,
      'Quantidade atual: ' || v_produto.quantidade || ' ' || v_produto.unidade,
      '/estoque'
    );
  end if;

  return new;
end;
$$;

create trigger aplicar_movimentacao
  after insert on public.movimentacoes_estoque
  for each row execute function public.aplicar_movimentacao_estoque();

-- =========================================================
-- RLS
-- =========================================================
alter table public.categorias_produto enable row level security;
alter table public.produtos enable row level security;
alter table public.movimentacoes_estoque enable row level security;
alter table public.notificacoes enable row level security;

create policy "categorias_produto_select" on public.categorias_produto
  for select using (condominio_id = public.auth_condominio_id());

create policy "categorias_produto_insert" on public.categorias_produto
  for insert with check (condominio_id = public.auth_condominio_id());

create policy "categorias_produto_update" on public.categorias_produto
  for update using (condominio_id = public.auth_condominio_id())
  with check (condominio_id = public.auth_condominio_id());

create policy "categorias_produto_delete" on public.categorias_produto
  for delete using (condominio_id = public.auth_condominio_id());

create policy "produtos_select" on public.produtos
  for select using (condominio_id = public.auth_condominio_id());

create policy "produtos_insert" on public.produtos
  for insert with check (condominio_id = public.auth_condominio_id());

create policy "produtos_update" on public.produtos
  for update using (condominio_id = public.auth_condominio_id())
  with check (condominio_id = public.auth_condominio_id());

create policy "produtos_delete" on public.produtos
  for delete using (condominio_id = public.auth_condominio_id() and public.is_admin());

create policy "movimentacoes_select" on public.movimentacoes_estoque
  for select using (condominio_id = public.auth_condominio_id());

create policy "movimentacoes_insert" on public.movimentacoes_estoque
  for insert with check (condominio_id = public.auth_condominio_id() and usuario_id = auth.uid());

create policy "notificacoes_select" on public.notificacoes
  for select using (condominio_id = public.auth_condominio_id());

create policy "notificacoes_update" on public.notificacoes
  for update using (condominio_id = public.auth_condominio_id())
  with check (condominio_id = public.auth_condominio_id());
