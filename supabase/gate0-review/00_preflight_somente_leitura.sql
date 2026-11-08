-- ============================================================================
-- 00_preflight_somente_leitura.sql
-- Gate 0 — Angel Cosméticos
-- Modo: SOMENTE LEITURA. Nenhuma alteração de dados.
-- Projeto: bmqxgibhuzekxpcgosap
-- ============================================================================

-- 1. Confirmar identidade do projeto
SELECT current_database() AS db, current_user AS user, version() AS pg_version;

-- 2. Verificar as 10 tabelas protegidas e seus privilégios
SELECT
  grantee,
  table_name,
  privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name IN (
    'people','tenants','tenant_memberships','roles','permissions',
    'role_permissions','role_assignments','customer_profiles',
    'employee_profiles','audit_logs'
  )
  AND grantee IN ('anon','authenticated','service_role')
ORDER BY table_name, grantee, privilege_type;

-- 3. Inspecionar RLS nas 10 tabelas
SELECT
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'people','tenants','tenant_memberships','roles','permissions',
    'role_permissions','role_assignments','customer_profiles',
    'employee_profiles','audit_logs'
  );

-- 4. Listar policies existentes nas 10 tabelas
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'people','tenants','tenant_memberships','roles','permissions',
    'role_permissions','role_assignments','customer_profiles',
    'employee_profiles','audit_logs'
  );

-- 5. Conferir constraints e FKs das 10 tabelas
SELECT
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table,
  ccu.column_name AS foreign_column
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage ccu
  ON tc.constraint_name = ccu.constraint_name
WHERE tc.table_schema = 'public'
  AND tc.table_name IN (
    'people','tenants','tenant_memberships','roles','permissions',
    'role_permissions','role_assignments','customer_profiles',
    'employee_profiles','audit_logs'
  )
ORDER BY tc.table_name, tc.constraint_type;

-- 6. Identificar o administrador existente
SELECT id, email, created_at FROM auth.users ORDER BY created_at;

SELECT * FROM public.admin_user;

-- 7. Conferir vínculo com Supabase Auth
SELECT
  p.id AS person_id,
  p.auth_user_id,
  p.username,
  p.display_name,
  p.email
FROM public.people p;

-- 8. Papéis, permissões e atribuições
SELECT * FROM public.roles;
SELECT * FROM public.permissions;
SELECT * FROM public.role_permissions;
SELECT * FROM public.role_assignments;

-- 9. Quantidades dos registros comerciais
SELECT 'produto' AS tabela, count(*) FROM public.produto
UNION ALL SELECT 'categoria', count(*) FROM public.categoria
UNION ALL SELECT 'fornecedor', count(*) FROM public.fornecedor
UNION ALL SELECT 'produto_imagem', count(*) FROM public.produto_imagem
UNION ALL SELECT 'estoque', count(*) FROM public.estoque
UNION ALL SELECT 'estoque_movimentacao', count(*) FROM public.estoque_movimentacao
UNION ALL SELECT 'cliente', count(*) FROM public.cliente
UNION ALL SELECT 'pedido', count(*) FROM public.pedido
UNION ALL SELECT 'pagamento', count(*) FROM public.pagamento
UNION ALL SELECT 'servico', count(*) FROM public.servico
UNION ALL SELECT 'profissional', count(*) FROM public.profissional
UNION ALL SELECT 'agendamento', count(*) FROM public.agendamento
UNION ALL SELECT 'pagina', count(*) FROM public.pagina
UNION ALL SELECT 'chamado', count(*) FROM public.chamado;

-- 10. Verificar tenant_id NULL nos registros comerciais
SELECT 'produto' AS tabela, count(*) FILTER (WHERE tenant_id IS NULL) AS sem_tenant FROM public.produto
UNION ALL SELECT 'categoria', count(*) FILTER (WHERE tenant_id IS NULL) FROM public.categoria
UNION ALL SELECT 'fornecedor', count(*) FILTER (WHERE tenant_id IS NULL) FROM public.fornecedor
UNION ALL SELECT 'produto_imagem', count(*) FILTER (WHERE tenant_id IS NULL) FROM public.produto_imagem
UNION ALL SELECT 'estoque', count(*) FILTER (WHERE tenant_id IS NULL) FROM public.estoque
UNION ALL SELECT 'estoque_movimentacao', count(*) FILTER (WHERE tenant_id IS NULL) FROM public.estoque_movimentacao
UNION ALL SELECT 'cliente', count(*) FILTER (WHERE tenant_id IS NULL) FROM public.cliente
UNION ALL SELECT 'pedido', count(*) FILTER (WHERE tenant_id IS NULL) FROM public.pedido
UNION ALL SELECT 'pagamento', count(*) FILTER (WHERE tenant_id IS NULL) FROM public.pagamento
UNION ALL SELECT 'servico', count(*) FILTER (WHERE tenant_id IS NULL) FROM public.servico
UNION ALL SELECT 'profissional', count(*) FILTER (WHERE tenant_id IS NULL) FROM public.profissional
UNION ALL SELECT 'agendamento', count(*) FILTER (WHERE tenant_id IS NULL) FROM public.agendamento
UNION ALL SELECT 'pagina', count(*) FILTER (WHERE tenant_id IS NULL) FROM public.pagina
UNION ALL SELECT 'chamado', count(*) FILTER (WHERE tenant_id IS NULL) FROM public.chamado;

-- 11. Inspecionar funções SECURITY DEFINER
SELECT
  n.nspname AS schema,
  p.proname AS function_name,
  pg_get_function_identity_arguments(p.oid) AS args,
  p.prosecdef AS security_definer,
  pg_get_functiondef(p.oid) AS definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.prosecdef = true;

-- 12. Detectar tenants existentes
SELECT * FROM public.tenants;

-- 13. Verificar dependências do frontend (is_admin usage)
-- (Manual: grep -r "is_admin" web/src/)