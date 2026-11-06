-- Migration: 20261106000003_profiles_saas.sql
-- Fase 1: Perfis funcionais SaaS
-- Cria customer_profiles e employee_profiles vinculados a people.
-- Preserva dados existentes em cliente (não altera tabela).

-- 1. customer_profiles
CREATE TABLE IF NOT EXISTS public.customer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  preferencias JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (person_id, tenant_id)
);

-- 2. employee_profiles
CREATE TABLE IF NOT EXISTS public.employee_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  cargo TEXT,
  departamento TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (person_id, tenant_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_customer_profiles_person ON public.customer_profiles(person_id);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_tenant ON public.customer_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_employee_profiles_person ON public.employee_profiles(person_id);
CREATE INDEX IF NOT EXISTS idx_employee_profiles_tenant ON public.employee_profiles(tenant_id);

-- Triggers
DROP TRIGGER IF EXISTS trg_customer_profiles_updated_at ON public.customer_profiles;
CREATE TRIGGER trg_customer_profiles_updated_at
  BEFORE UPDATE ON public.customer_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_atualizado_em();

DROP TRIGGER IF EXISTS trg_employee_profiles_updated_at ON public.employee_profiles;
CREATE TRIGGER trg_employee_profiles_updated_at
  BEFORE UPDATE ON public.employee_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_atualizado_em();

-- ROLLBACK:
-- DROP TRIGGER IF EXISTS trg_employee_profiles_updated_at ON public.employee_profiles;
-- DROP TRIGGER IF EXISTS trg_customer_profiles_updated_at ON public.customer_profiles;
-- DROP TABLE IF EXISTS public.employee_profiles;
-- DROP TABLE IF EXISTS public.customer_profiles;