-- =========================================================
-- Fornecedores: CNPJ e pessoa de contato
-- =========================================================
alter table public.fornecedores
  add column if not exists cnpj text,
  add column if not exists pessoa_contato text;
