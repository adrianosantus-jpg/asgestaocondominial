-- Habilita eventos em tempo real (INSERT/UPDATE/DELETE) para as tabelas
-- que precisam refletir mudanças entre usuários sem recarregar a página.
alter publication supabase_realtime add table public.produtos;
alter publication supabase_realtime add table public.movimentacoes_estoque;
alter publication supabase_realtime add table public.equipamentos;
alter publication supabase_realtime add table public.planos_preventivos;
alter publication supabase_realtime add table public.ordens_servico;
alter publication supabase_realtime add table public.execucoes_preventivas;
alter publication supabase_realtime add table public.agenda_eventos;
alter publication supabase_realtime add table public.notificacoes;
