-- ============================================================================
-- 02_tenant_angel_admin_PROPOSTA_NAO_EXECUTAR.sql (V3)
-- Gate 0 — Angel Cosméticos
-- PROPOSTA — NÃO EXECUTAR NO REMOTO SEM APROVAÇÃO
-- V3: Idempotente — aceita estado parcial, aborta apenas em conflito real
-- ============================================================================

-- ============================================================================
-- PRÉ-CONDIÇÕES RIGOROSAS
-- ============================================================================

-- Verificar que existe exatamente 1 admin_user
DO $$
DECLARE
  v_admin_count INT;
BEGIN
  SELECT count(*) INTO v_admin_count FROM public.admin_user;
  ASSERT v_admin_count = 1, 'Esperado exatamente 1 admin_user. Encontrado: ' || v_admin_count;
END $$;

-- Verificar que o admin_user tem vínculo válido com auth.users
DO $$
DECLARE
  v_auth_count INT;
BEGIN
  SELECT count(*) INTO v_auth_count
  FROM public.admin_user au
  JOIN auth.users u ON u.id = au.user_id;
  ASSERT v_auth_count = 1, 'admin_user não possui vínculo válido com auth.users.';
END $$;

-- ============================================================================
-- 1. Criar tenant Angel (idempotente)
-- ============================================================================
INSERT INTO public.tenants (slug, nome, status)
VALUES ('angel-cosmeticos', 'Angel Cosméticos', 'active')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- 2. Criar people para o admin (idempotente via admin_user)
-- ============================================================================
INSERT INTO public.people (auth_user_id, username, display_name, email, status)
SELECT
  u.id,
  'admin_angel',
  COALESCE(u.raw_user_meta_data->>'display_name', 'Administrador'),
  u.email,
  'active'
FROM public.admin_user au
JOIN auth.users u ON u.id = au.user_id
WHERE NOT EXISTS (SELECT 1 FROM public.people p WHERE p.auth_user_id = u.id);

-- ============================================================================
-- 3. Criar membership ativa (idempotente)
-- ============================================================================
INSERT INTO public.tenant_memberships (person_id, tenant_id, status)
SELECT p.id, t.id, 'active'
FROM public.people p
CROSS JOIN public.tenants t
WHERE p.auth_user_id = (SELECT user_id FROM public.admin_user LIMIT 1)
  AND t.slug = 'angel-cosmeticos'
ON CONFLICT (person_id, tenant_id) DO NOTHING;

-- ============================================================================
-- 4. Atribuir papel admin (idempotente)
-- ============================================================================
INSERT INTO public.role_assignments (person_id, tenant_id, role_id)
SELECT p.id, t.id, r.id
FROM public.people p
CROSS JOIN public.tenants t
CROSS JOIN public.roles r
WHERE p.auth_user_id = (SELECT user_id FROM public.admin_user LIMIT 1)
  AND t.slug = 'angel-cosmeticos'
  AND r.slug = 'admin'
  AND r.tenant_id IS NULL
ON CONFLICT (person_id, tenant_id, role_id) DO NOTHING;

-- ============================================================================
-- 5. Índice parcial para papéis globais (tenant_id NULL)
-- ============================================================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_roles_global_slug
  ON public.roles (slug) WHERE tenant_id IS NULL;

-- ROLLBACK:
-- DELETE FROM public.role_assignments WHERE person_id IN (SELECT id FROM public.people WHERE auth_user_id = (SELECT user_id FROM public.admin_user LIMIT 1));
-- DELETE FROM public.tenant_memberships WHERE person_id IN (SELECT id FROM public.people WHERE auth_user_id = (SELECT user_id FROM public.admin_user LIMIT 1));
-- DELETE FROM public.people WHERE auth_user_id = (SELECT user_id FROM public.admin_user LIMIT 1);
-- DELETE FROM public.tenants WHERE slug = 'angel-cosmeticos';
-- DROP INDEX IF EXISTS idx_roles_global_slug;