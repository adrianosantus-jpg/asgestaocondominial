-- Seed de desenvolvimento: 1 condomínio + 1 usuário admin.
-- Executado automaticamente por `supabase db reset` (ambiente local).

insert into public.condominios (id, nome, cnpj, endereco)
values (
  '00000000-0000-0000-0000-000000000001',
  'Condomínio Residencial Exemplo',
  '00.000.000/0001-00',
  'Rua Exemplo, 123 - São Paulo/SP'
);

-- Login de desenvolvimento: admin@asgestao.com.br / admin123
-- Campos de token abaixo precisam ser '' (não NULL): o GoTrue falha com
-- "Database error querying schema" ao escanear NULL nessas colunas quando
-- o usuário é inserido manualmente via SQL em vez do fluxo normal de signup.
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data,
  confirmation_token, recovery_token, email_change,
  email_change_token_new, email_change_token_current,
  phone_change, phone_change_token, reauthentication_token
) values (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@asgestao.com.br',
  extensions.crypt('admin123', extensions.gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"nome":"Administrador","role":"admin"}',
  '', '', '', '', '', '', '', ''
);

-- GoTrue exige um registro em auth.identities para login por e-mail/senha
-- funcionar quando o usuário é inserido manualmente via SQL.
insert into auth.identities (
  id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
)
select
  gen_random_uuid(),
  u.id::text,
  u.id,
  jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
  'email',
  now(),
  now(),
  now()
from auth.users u
where u.email = 'admin@asgestao.com.br';
