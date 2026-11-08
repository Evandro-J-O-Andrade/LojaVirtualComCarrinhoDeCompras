-- ============================================================================
-- 01_rls_privilegios_PROPOSTA_NAO_EXECUTAR.sql (V2)
-- Gate 0 — Angel Cosméticos
-- PROPOSTA — NÃO EXECUTAR NO REMOTO SEM APROVAÇÃO
-- V2: Adicionado acesso ROOT via is_admin(), rollback não desabilita RLS
-- ============================================================================

-- ============================================================================
-- PRÉ-CONDIÇÃO: Verificar que todas as 10 tabelas existem
-- ============================================================================
DO $$
BEGIN
  ASSERT (SELECT count(*) FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN ('people','tenants','tenant_memberships','roles','permissions',
                         'role_permissions','role_assignments','customer_profiles',
                         'employee_profiles','audit_logs')) = 10,
    'Nem todas as 10 tabelas existem. Abortar.';
END $$;

-- ============================================================================
-- 1. Habilitar RLS nas 10 tabelas
-- ============================================================================
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. Revogar privilégios amplos de anon e authenticated
-- ============================================================================
REVOKE ALL ON public.people FROM anon;
REVOKE ALL ON public.tenants FROM anon;
REVOKE ALL ON public.tenant_memberships FROM anon;
REVOKE ALL ON public.roles FROM anon;
REVOKE ALL ON public.permissions FROM anon;
REVOKE ALL ON public.role_permissions FROM anon;
REVOKE ALL ON public.role_assignments FROM anon;
REVOKE ALL ON public.customer_profiles FROM anon;
REVOKE ALL ON public.employee_profiles FROM anon;
REVOKE ALL ON public.audit_logs FROM anon;

REVOKE ALL ON public.people FROM authenticated;
REVOKE ALL ON public.tenants FROM authenticated;
REVOKE ALL ON public.tenant_memberships FROM authenticated;
REVOKE ALL ON public.roles FROM authenticated;
REVOKE ALL ON public.permissions FROM authenticated;
REVOKE ALL ON public.role_permissions FROM authenticated;
REVOKE ALL ON public.role_assignments FROM authenticated;
REVOKE ALL ON public.customer_profiles FROM authenticated;
REVOKE ALL ON public.employee_profiles FROM authenticated;
REVOKE ALL ON public.audit_logs FROM authenticated;

-- Conceder apenas SELECT para authenticated (policies filtrarão)
GRANT SELECT ON public.people TO authenticated;
GRANT SELECT ON public.tenants TO authenticated;
GRANT SELECT ON public.tenant_memberships TO authenticated;
GRANT SELECT ON public.roles TO authenticated;
GRANT SELECT ON public.permissions TO authenticated;
GRANT SELECT ON public.role_permissions TO authenticated;
GRANT SELECT ON public.role_assignments TO authenticated;
GRANT SELECT ON public.customer_profiles TO authenticated;
GRANT SELECT ON public.employee_profiles TO authenticated;
GRANT SELECT ON public.audit_logs TO authenticated;

-- service_role mantém acesso total (backend confiável)
-- (já possui por padrão, não alterar)

-- ============================================================================
-- 3. Policies RLS
-- ============================================================================

-- people: visualizar própria identidade
CREATE POLICY people_select_own ON public.people
  FOR SELECT TO authenticated
  USING (auth_user_id = auth.uid());

-- tenants: visualizar tenants onde é membro ativo
CREATE POLICY tenants_select_member ON public.tenants
  FOR SELECT TO authenticated
  USING (
    id IN (
      SELECT tm.tenant_id FROM public.tenant_memberships tm
      JOIN public.people p ON p.id = tm.person_id
      WHERE p.auth_user_id = auth.uid() AND tm.status = 'active'
    )
  );

-- tenant_memberships: visualizar próprios vínculos
CREATE POLICY memberships_select_own ON public.tenant_memberships
  FOR SELECT TO authenticated
  USING (
    person_id IN (SELECT id FROM public.people WHERE auth_user_id = auth.uid())
  );

-- roles: visualizar roles dos tenants onde é membro
CREATE POLICY roles_select_member ON public.roles
  FOR SELECT TO authenticated
  USING (
    tenant_id IS NULL OR tenant_id IN (
      SELECT tm.tenant_id FROM public.tenant_memberships tm
      JOIN public.people p ON p.id = tm.person_id
      WHERE p.auth_user_id = auth.uid() AND tm.status = 'active'
    )
  );

-- permissions: leitura para todos authenticated (catálogo)
CREATE POLICY permissions_select_all ON public.permissions
  FOR SELECT TO authenticated
  USING (true);

-- role_permissions: visualizar via roles acessíveis + ROOT bypass
CREATE POLICY role_permissions_select ON public.role_permissions
  FOR SELECT TO authenticated
  USING (
    public.is_admin() OR
    role_id IN (SELECT id FROM public.roles WHERE tenant_id IS NULL OR tenant_id IN (
      SELECT tm.tenant_id FROM public.tenant_memberships tm
      JOIN public.people p ON p.id = tm.person_id
      WHERE p.auth_user_id = auth.uid() AND tm.status = 'active'
    ))
  );

-- role_assignments: visualizar próprias atribuições
CREATE POLICY role_assignments_select_own ON public.role_assignments
  FOR SELECT TO authenticated
  USING (
    person_id IN (SELECT id FROM public.people WHERE auth_user_id = auth.uid())
  );

-- customer_profiles: visualizar próprio perfil
CREATE POLICY customer_profiles_select_own ON public.customer_profiles
  FOR SELECT TO authenticated
  USING (
    person_id IN (SELECT id FROM public.people WHERE auth_user_id = auth.uid())
  );

-- employee_profiles: visualizar próprio perfil
CREATE POLICY employee_profiles_select_own ON public.employee_profiles
  FOR SELECT TO authenticated
  USING (
    person_id IN (SELECT id FROM public.people WHERE auth_user_id = auth.uid())
  );

-- audit_logs: leitura restrita ao ROOT (is_admin) neste estágio
CREATE POLICY audit_logs_select_admin ON public.audit_logs
  FOR SELECT TO authenticated
  USING (public.is_admin());

-- ============================================================================
-- ROOT BYPASS: Administrador legado (is_admin) tem acesso total de leitura
-- a todas as 10 tabelas, garantindo continuidade do painel admin.
-- ============================================================================
CREATE POLICY people_select_root ON public.people
  FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY tenants_select_root ON public.tenants
  FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY memberships_select_root ON public.tenant_memberships
  FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY roles_select_root ON public.roles
  FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY role_assignments_select_root ON public.role_assignments
  FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY customer_profiles_select_root ON public.customer_profiles
  FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY employee_profiles_select_root ON public.employee_profiles
  FOR SELECT TO authenticated
  USING (public.is_admin());

-- ============================================================================
-- ROLLBACK (V2): Remove policies adicionadas, mas NÃO desabilita RLS.
-- RLS permanece ativa após rollback para não reabrir exposição.
-- ============================================================================
-- DROP POLICY IF EXISTS people_select_own ON public.people;
-- DROP POLICY IF EXISTS people_select_root ON public.people;
-- (repetir para todas as policies)
-- NOTA: RLS permanece ENABLED após rollback.