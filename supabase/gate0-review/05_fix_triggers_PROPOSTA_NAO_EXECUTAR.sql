-- ============================================================================
-- 05_fix_triggers_PROPOSTA_NAO_EXECUTAR.sql (V3)
-- Gate 0 — Angel Cosméticos
-- PROPOSTA — NÃO EXECUTAR NO REMOTO SEM APROVAÇÃO
-- V3: Duas funções separadas em vez de uma com TG_TABLE_NAME
-- ============================================================================
-- Abordagem: função para tabelas com updated_at, função para tabelas com
-- atualizado_em. Cada trigger aponta para a função correta.
-- ============================================================================

-- 1. Função para tabelas novas (updated_at)
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = pg_catalog.now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- 2. Função para tabelas antigas (atualizado_em)
CREATE OR REPLACE FUNCTION public.update_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = pg_catalog.now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- 3. Recriar triggers das tabelas novas (updated_at)
-- (executar apenas se as tabelas existirem)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'people') THEN
    DROP TRIGGER IF EXISTS trg_people_updated_at ON public.people;
    CREATE TRIGGER trg_people_updated_at
      BEFORE UPDATE ON public.people
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tenants') THEN
    DROP TRIGGER IF EXISTS trg_tenants_updated_at ON public.tenants;
    CREATE TRIGGER trg_tenants_updated_at
      BEFORE UPDATE ON public.tenants
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tenant_memberships') THEN
    DROP TRIGGER IF EXISTS trg_tenant_memberships_updated_at ON public.tenant_memberships;
    CREATE TRIGGER trg_tenant_memberships_updated_at
      BEFORE UPDATE ON public.tenant_memberships
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'roles') THEN
    DROP TRIGGER IF EXISTS trg_roles_updated_at ON public.roles;
    CREATE TRIGGER trg_roles_updated_at
      BEFORE UPDATE ON public.roles
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customer_profiles') THEN
    DROP TRIGGER IF EXISTS trg_customer_profiles_updated_at ON public.customer_profiles;
    CREATE TRIGGER trg_customer_profiles_updated_at
      BEFORE UPDATE ON public.customer_profiles
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'employee_profiles') THEN
    DROP TRIGGER IF EXISTS trg_employee_profiles_updated_at ON public.employee_profiles;
    CREATE TRIGGER trg_employee_profiles_updated_at
      BEFORE UPDATE ON public.employee_profiles
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
  END IF;
END $$;

-- 4. Triggers das tabelas antigas (atualizado_em) já existem e apontam para update_atualizado_em()
-- (não precisam ser recriados, a função foi restaurada)

-- ROLLBACK:
-- DROP FUNCTION IF EXISTS public.update_updated_at();
-- (restaurar update_atualizado_em para versão original se necessário)