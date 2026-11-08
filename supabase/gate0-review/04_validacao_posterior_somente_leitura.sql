-- ============================================================================
-- 04_validacao_posterior_somente_leitura.sql
-- Gate 0 — Angel Cosméticos
-- Modo: SOMENTE LEITURA. Executar após aplicação (se aprovada).
-- ============================================================================

-- 1. RLS ativa nas 10 tabelas
SELECT tablename, rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('people','tenants','tenant_memberships','roles','permissions',
                     'role_permissions','role_assignments','customer_profiles',
                     'employee_profiles','audit_logs');

-- 2. Contagem de policies por tabela
SELECT tablename, count(*) AS policy_count
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('people','tenants','tenant_memberships','roles','permissions',
                     'role_permissions','role_assignments','customer_profiles',
                     'employee_profiles','audit_logs')
GROUP BY tablename;

-- 3. Tenant Angel existe
SELECT * FROM public.tenants WHERE slug = 'angel-cosmeticos';

-- 4. People do admin existe (via admin_user, não primeiro auth.users)
SELECT p.* FROM public.people p
WHERE p.auth_user_id = (SELECT user_id FROM public.admin_user LIMIT 1);

-- 5. Membership ativa (via admin_user)
SELECT tm.* FROM public.tenant_memberships tm
JOIN public.people p ON p.id = tm.person_id
WHERE p.auth_user_id = (SELECT user_id FROM public.admin_user LIMIT 1);

-- 6. Role assignment admin (via admin_user)
SELECT ra.* FROM public.role_assignments ra
JOIN public.people p ON p.id = ra.person_id
WHERE p.auth_user_id = (SELECT user_id FROM public.admin_user LIMIT 1);

-- 7. Registros comerciais com tenant_id preenchido
SELECT 'produto' AS tabela, count(*) FILTER (WHERE tenant_id IS NULL) AS sem_tenant FROM public.produto
UNION ALL SELECT 'categoria', count(*) FILTER (WHERE tenant_id IS NULL) FROM public.categoria
UNION ALL SELECT 'fornecedor', count(*) FILTER (WHERE tenant_id IS NULL) FROM public.fornecedor
UNION ALL SELECT 'produto_imagem', count(*) FILTER (WHERE tenant_id IS NULL) FROM public.produto_imagem
UNION ALL SELECT 'estoque', count(*) FILTER (WHERE tenant_id IS NULL) FROM public.estoque;

-- 9. Teste de isolamento: verificar que não há registros com tenant_id de outro tenant
SELECT 'produto' AS tabela, count(*) AS registros_outro_tenant
FROM public.produto
WHERE tenant_id IS NOT NULL
  AND tenant_id <> (SELECT id FROM public.tenants WHERE slug = 'angel-cosmeticos')
UNION ALL
SELECT 'categoria', count(*) FROM public.categoria
WHERE tenant_id IS NOT NULL AND tenant_id <> (SELECT id FROM public.tenants WHERE slug = 'angel-cosmeticos');