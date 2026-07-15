-- =========================================================
-- fornecedores
-- =========================================================
create table public.fornecedores (
  id uuid primary key default gen_random_uuid(),
  condominio_id uuid not null default public.auth_condominio_id() references public.condominios (id) on delete cascade,
  nome text not null,
  telefone text,
  whatsapp text,
  email text,
  especialidade text,
  contrato_url text,
  data_vencimento_contrato date,
  avaliacao smallint check (avaliacao between 1 and 5),
  observacoes text,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index fornecedores_condominio_id_idx on public.fornecedores (condominio_id);

create trigger set_updated_at
  before update on public.fornecedores
  for each row execute function public.set_updated_at();

-- Mantém um evento de agenda sincronizado com o vencimento do contrato.
create or replace function public.fornecedor_sync_contrato_evento()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.agenda_eventos
    where referencia_tipo = 'fornecedor_contrato' and referencia_id = new.id;

  if new.data_vencimento_contrato is not null then
    insert into public.agenda_eventos (condominio_id, tipo, titulo, data_hora, referencia_tipo, referencia_id)
    values (
      new.condominio_id,
      'contrato',
      'Contrato vence: ' || new.nome,
      new.data_vencimento_contrato::timestamptz,
      'fornecedor_contrato',
      new.id
    );
  end if;

  return new;
end;
$$;

create trigger sync_contrato
  after insert or update of data_vencimento_contrato on public.fornecedores
  for each row execute function public.fornecedor_sync_contrato_evento();

-- =========================================================
-- ordens_servico
-- =========================================================
create table public.ordens_servico (
  id uuid primary key default gen_random_uuid(),
  condominio_id uuid not null default public.auth_condominio_id() references public.condominios (id) on delete cascade,
  numero text,
  equipamento_id uuid references public.equipamentos (id) on delete set null,
  plano_id uuid references public.planos_preventivos (id) on delete set null,
  fornecedor_id uuid references public.fornecedores (id) on delete set null,
  tipo text not null check (tipo in ('preventiva', 'corretiva')),
  titulo text not null,
  descricao text,
  status text not null default 'aberta' check (
    status in ('aberta', 'em_andamento', 'aguardando_fornecedor', 'aguardando_material', 'concluida', 'cancelada')
  ),
  prioridade text not null default 'media' check (prioridade in ('baixa', 'media', 'alta', 'urgente')),
  responsavel_id uuid references public.profiles (id),
  aberto_por uuid not null default auth.uid() references public.profiles (id),
  data_abertura timestamptz not null default now(),
  data_conclusao timestamptz,
  tempo_gasto_minutos integer,
  custo_mao_obra numeric(12,2) not null default 0,
  custo_materiais numeric(12,2) not null default 0,
  custo_total numeric(14,2) generated always as (custo_mao_obra + custo_materiais) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (condominio_id, numero)
);

create index ordens_servico_condominio_id_idx on public.ordens_servico (condominio_id);
create index ordens_servico_equipamento_id_idx on public.ordens_servico (equipamento_id);
create index ordens_servico_status_idx on public.ordens_servico (status);

create trigger set_updated_at
  before update on public.ordens_servico
  for each row execute function public.set_updated_at();

-- Número automático (ex: OS00001) quando não informado manualmente.
create or replace function public.os_set_numero()
returns trigger
language plpgsql
as $$
begin
  if new.numero is null or new.numero = '' then
    new.numero := 'OS' || lpad(public.next_sequence(new.condominio_id, 'os')::text, 5, '0');
  end if;
  return new;
end;
$$;

create trigger set_numero
  before insert on public.ordens_servico
  for each row execute function public.os_set_numero();

-- Marca data_conclusao automaticamente ao mudar status para concluída.
create or replace function public.os_set_conclusao()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'concluida' and old.status is distinct from 'concluida' and new.data_conclusao is null then
    new.data_conclusao := now();
  end if;
  return new;
end;
$$;

create trigger set_conclusao
  before update on public.ordens_servico
  for each row execute function public.os_set_conclusao();

-- Toda OS aparece na Agenda (preventiva ou corretiva).
create or replace function public.os_criar_evento_agenda()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.agenda_eventos (condominio_id, tipo, titulo, data_hora, referencia_tipo, referencia_id, descricao)
  values (new.condominio_id, new.tipo, new.numero || ' - ' || new.titulo, new.data_abertura, 'ordem_servico', new.id, new.descricao);
  return new;
end;
$$;

create trigger criar_evento_agenda
  after insert on public.ordens_servico
  for each row execute function public.os_criar_evento_agenda();

-- Conclui/cancela o evento de agenda junto com a OS.
create or replace function public.os_sync_evento_agenda()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status is distinct from old.status then
    update public.agenda_eventos
      set concluido = (new.status in ('concluida', 'cancelada'))
      where referencia_tipo = 'ordem_servico' and referencia_id = new.id;
  end if;
  return new;
end;
$$;

create trigger sync_evento_agenda
  after update on public.ordens_servico
  for each row execute function public.os_sync_evento_agenda();

-- =========================================================
-- os_materiais
-- Ao inserir, baixa o estoque automaticamente via
-- movimentacoes_estoque (dispara o trigger da Fase 1).
-- =========================================================
create table public.os_materiais (
  id uuid primary key default gen_random_uuid(),
  condominio_id uuid not null default public.auth_condominio_id() references public.condominios (id) on delete cascade,
  os_id uuid not null references public.ordens_servico (id) on delete cascade,
  produto_id uuid not null references public.produtos (id),
  quantidade numeric(12,2) not null check (quantidade > 0),
  custo_unitario numeric(12,2) not null default 0,
  custo numeric(14,2) generated always as (quantidade * custo_unitario) stored,
  created_at timestamptz not null default now()
);

create index os_materiais_os_id_idx on public.os_materiais (os_id);

create or replace function public.aplicar_material_os()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_os public.ordens_servico%rowtype;
begin
  select * into v_os from public.ordens_servico where id = new.os_id;

  insert into public.movimentacoes_estoque (condominio_id, produto_id, tipo, quantidade, motivo, usuario_id)
  values (v_os.condominio_id, new.produto_id, 'saida', new.quantidade, 'Material usado na ' || v_os.numero, auth.uid());

  update public.ordens_servico
    set custo_materiais = custo_materiais + new.custo
    where id = new.os_id;

  return new;
end;
$$;

create trigger aplicar_material
  after insert on public.os_materiais
  for each row execute function public.aplicar_material_os();

-- =========================================================
-- os_midias
-- =========================================================
create table public.os_midias (
  id uuid primary key default gen_random_uuid(),
  condominio_id uuid not null default public.auth_condominio_id() references public.condominios (id) on delete cascade,
  os_id uuid not null references public.ordens_servico (id) on delete cascade,
  tipo text not null check (tipo in ('foto', 'video', 'pdf')),
  url text not null,
  created_at timestamptz not null default now()
);

create index os_midias_os_id_idx on public.os_midias (os_id);

-- =========================================================
-- RLS
-- =========================================================
alter table public.fornecedores enable row level security;
alter table public.ordens_servico enable row level security;
alter table public.os_materiais enable row level security;
alter table public.os_midias enable row level security;

create policy "fornecedores_select" on public.fornecedores
  for select using (condominio_id = public.auth_condominio_id());
create policy "fornecedores_insert" on public.fornecedores
  for insert with check (condominio_id = public.auth_condominio_id());
create policy "fornecedores_update" on public.fornecedores
  for update using (condominio_id = public.auth_condominio_id())
  with check (condominio_id = public.auth_condominio_id());
create policy "fornecedores_delete" on public.fornecedores
  for delete using (condominio_id = public.auth_condominio_id() and public.is_admin());

create policy "ordens_servico_select" on public.ordens_servico
  for select using (condominio_id = public.auth_condominio_id());
create policy "ordens_servico_insert" on public.ordens_servico
  for insert with check (condominio_id = public.auth_condominio_id());
create policy "ordens_servico_update" on public.ordens_servico
  for update using (condominio_id = public.auth_condominio_id())
  with check (condominio_id = public.auth_condominio_id());
create policy "ordens_servico_delete" on public.ordens_servico
  for delete using (condominio_id = public.auth_condominio_id() and public.is_admin());

create policy "os_materiais_select" on public.os_materiais
  for select using (condominio_id = public.auth_condominio_id());
create policy "os_materiais_insert" on public.os_materiais
  for insert with check (condominio_id = public.auth_condominio_id());

create policy "os_midias_select" on public.os_midias
  for select using (condominio_id = public.auth_condominio_id());
create policy "os_midias_insert" on public.os_midias
  for insert with check (condominio_id = public.auth_condominio_id());
create policy "os_midias_delete" on public.os_midias
  for delete using (condominio_id = public.auth_condominio_id());
