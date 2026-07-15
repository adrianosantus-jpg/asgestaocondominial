-- =========================================================
-- equipamentos
-- =========================================================
create table public.equipamentos (
  id uuid primary key default gen_random_uuid(),
  condominio_id uuid not null default public.auth_condominio_id() references public.condominios (id) on delete cascade,
  nome text not null,
  categoria text not null,
  foto_url text,
  manual_pdf_url text,
  empresa_responsavel text,
  garantia_fim date,
  data_instalacao date,
  numero_patrimonio text,
  localizacao text,
  fabricante text,
  modelo text,
  numero_serie text,
  observacoes text,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index equipamentos_condominio_id_idx on public.equipamentos (condominio_id);

create trigger set_updated_at
  before update on public.equipamentos
  for each row execute function public.set_updated_at();

-- =========================================================
-- planos_preventivos
-- =========================================================
create table public.planos_preventivos (
  id uuid primary key default gen_random_uuid(),
  condominio_id uuid not null default public.auth_condominio_id() references public.condominios (id) on delete cascade,
  equipamento_id uuid not null references public.equipamentos (id) on delete cascade,
  titulo text not null,
  periodicidade text not null check (
    periodicidade in ('diaria', 'semanal', 'quinzenal', 'mensal', 'bimestral', 'trimestral', 'semestral', 'anual')
  ),
  checklist jsonb not null default '[]'::jsonb,
  proxima_execucao date not null default current_date,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index planos_preventivos_equipamento_id_idx on public.planos_preventivos (equipamento_id);

create trigger set_updated_at
  before update on public.planos_preventivos
  for each row execute function public.set_updated_at();

-- =========================================================
-- execucoes_preventivas
-- Ledger imutável: sem policy de update/delete.
-- =========================================================
create table public.execucoes_preventivas (
  id uuid primary key default gen_random_uuid(),
  condominio_id uuid not null default public.auth_condominio_id() references public.condominios (id) on delete cascade,
  plano_id uuid not null references public.planos_preventivos (id) on delete cascade,
  data_execucao date not null default current_date,
  checklist_resultado jsonb not null default '[]'::jsonb,
  fotos_antes text[] not null default '{}',
  fotos_depois text[] not null default '{}',
  assinatura_url text,
  observacoes text,
  executado_por uuid not null default auth.uid() references public.profiles (id),
  created_at timestamptz not null default now()
);

create index execucoes_preventivas_plano_id_idx on public.execucoes_preventivas (plano_id);

-- =========================================================
-- agenda_eventos
-- =========================================================
create table public.agenda_eventos (
  id uuid primary key default gen_random_uuid(),
  condominio_id uuid not null default public.auth_condominio_id() references public.condominios (id) on delete cascade,
  tipo text not null check (
    tipo in ('preventiva', 'corretiva', 'reuniao', 'assembleia', 'garantia', 'contrato', 'laudo', 'vistoria')
  ),
  titulo text not null,
  data_hora timestamptz not null,
  referencia_tipo text,
  referencia_id uuid,
  descricao text,
  concluido boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index agenda_eventos_condominio_id_idx on public.agenda_eventos (condominio_id);
create index agenda_eventos_data_hora_idx on public.agenda_eventos (data_hora);
create index agenda_eventos_referencia_idx on public.agenda_eventos (referencia_tipo, referencia_id);

create trigger set_updated_at
  before update on public.agenda_eventos
  for each row execute function public.set_updated_at();

-- =========================================================
-- Periodicidade -> próxima data
-- =========================================================
create or replace function public.calcular_proxima_execucao(p_data date, p_periodicidade text)
returns date
language sql
immutable
as $$
  select (case p_periodicidade
    when 'diaria' then p_data + interval '1 day'
    when 'semanal' then p_data + interval '7 days'
    when 'quinzenal' then p_data + interval '14 days'
    when 'mensal' then p_data + interval '1 month'
    when 'bimestral' then p_data + interval '2 months'
    when 'trimestral' then p_data + interval '3 months'
    when 'semestral' then p_data + interval '6 months'
    when 'anual' then p_data + interval '1 year'
  end)::date;
$$;

-- Ao criar um plano, já agenda a primeira ocorrência.
create or replace function public.plano_preventivo_criar_evento()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.agenda_eventos (condominio_id, tipo, titulo, data_hora, referencia_tipo, referencia_id)
  values (new.condominio_id, 'preventiva', new.titulo, new.proxima_execucao::timestamptz, 'plano_preventivo', new.id);
  return new;
end;
$$;

create trigger criar_evento_agenda
  after insert on public.planos_preventivos
  for each row execute function public.plano_preventivo_criar_evento();

-- Ao registrar uma execução: conclui o evento aberto, recalcula a próxima
-- data no plano e agenda a próxima ocorrência.
create or replace function public.aplicar_execucao_preventiva()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_plano public.planos_preventivos%rowtype;
  v_proxima date;
begin
  select * into v_plano from public.planos_preventivos where id = new.plano_id;

  update public.agenda_eventos
    set concluido = true
    where referencia_tipo = 'plano_preventivo'
      and referencia_id = new.plano_id
      and concluido = false;

  v_proxima := public.calcular_proxima_execucao(new.data_execucao, v_plano.periodicidade);

  update public.planos_preventivos
    set proxima_execucao = v_proxima
    where id = new.plano_id;

  insert into public.agenda_eventos (condominio_id, tipo, titulo, data_hora, referencia_tipo, referencia_id)
  values (new.condominio_id, 'preventiva', v_plano.titulo, v_proxima::timestamptz, 'plano_preventivo', new.plano_id);

  return new;
end;
$$;

create trigger aplicar_execucao
  after insert on public.execucoes_preventivas
  for each row execute function public.aplicar_execucao_preventiva();

-- Mantém um evento de agenda sincronizado com a data de garantia do equipamento.
create or replace function public.equipamento_sync_garantia_evento()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.agenda_eventos
    where referencia_tipo = 'equipamento_garantia' and referencia_id = new.id;

  if new.garantia_fim is not null then
    insert into public.agenda_eventos (condominio_id, tipo, titulo, data_hora, referencia_tipo, referencia_id)
    values (
      new.condominio_id,
      'garantia',
      'Garantia vence: ' || new.nome,
      new.garantia_fim::timestamptz,
      'equipamento_garantia',
      new.id
    );
  end if;

  return new;
end;
$$;

create trigger sync_garantia
  after insert or update of garantia_fim on public.equipamentos
  for each row execute function public.equipamento_sync_garantia_evento();

-- =========================================================
-- RLS
-- =========================================================
alter table public.equipamentos enable row level security;
alter table public.planos_preventivos enable row level security;
alter table public.execucoes_preventivas enable row level security;
alter table public.agenda_eventos enable row level security;

create policy "equipamentos_select" on public.equipamentos
  for select using (condominio_id = public.auth_condominio_id());
create policy "equipamentos_insert" on public.equipamentos
  for insert with check (condominio_id = public.auth_condominio_id());
create policy "equipamentos_update" on public.equipamentos
  for update using (condominio_id = public.auth_condominio_id())
  with check (condominio_id = public.auth_condominio_id());
create policy "equipamentos_delete" on public.equipamentos
  for delete using (condominio_id = public.auth_condominio_id() and public.is_admin());

create policy "planos_preventivos_select" on public.planos_preventivos
  for select using (condominio_id = public.auth_condominio_id());
create policy "planos_preventivos_insert" on public.planos_preventivos
  for insert with check (condominio_id = public.auth_condominio_id());
create policy "planos_preventivos_update" on public.planos_preventivos
  for update using (condominio_id = public.auth_condominio_id())
  with check (condominio_id = public.auth_condominio_id());
create policy "planos_preventivos_delete" on public.planos_preventivos
  for delete using (condominio_id = public.auth_condominio_id() and public.is_admin());

create policy "execucoes_preventivas_select" on public.execucoes_preventivas
  for select using (condominio_id = public.auth_condominio_id());
create policy "execucoes_preventivas_insert" on public.execucoes_preventivas
  for insert with check (condominio_id = public.auth_condominio_id() and executado_por = auth.uid());

create policy "agenda_eventos_select" on public.agenda_eventos
  for select using (condominio_id = public.auth_condominio_id());
create policy "agenda_eventos_insert" on public.agenda_eventos
  for insert with check (condominio_id = public.auth_condominio_id());
create policy "agenda_eventos_update" on public.agenda_eventos
  for update using (condominio_id = public.auth_condominio_id())
  with check (condominio_id = public.auth_condominio_id());
create policy "agenda_eventos_delete" on public.agenda_eventos
  for delete using (condominio_id = public.auth_condominio_id());
