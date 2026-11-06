-- Migration: 20261106000002_rbac_saas.sql
-- Fase 1: RBAC contextual SaaS
-- Cria roles, permissions, role_permissions, role_assignments
-- Escopo por tenant. Preserva admin_user existente.

-- 1. roles (catálogo de papéis)
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, slug)
);

-- 2. permissions (catálogo de permissões)
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  modulo TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. role_permissions (associação papel-permissão)
CREATE TABLE IF NOT EXISTS public.role_permissions (
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- 4. role_assignments (atribuição de papel a pessoa em tenant)
CREATE TABLE IF NOT EXISTS public.role_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES public.people(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (person_id, tenant_id, role_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_roles_tenant ON public.roles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_role_assignments_person ON public.role_assignments(person_id);
CREATE INDEX IF NOT EXISTS idx_role_assignments_tenant ON public.role_assignments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_role_assignments_role ON public.role_assignments(role_id);

-- Triggers updated_at
DROP TRIGGER IF EXISTS trg_roles_updated_at ON public.roles;
CREATE TRIGGER trg_roles_updated_at
  BEFORE UPDATE ON public.roles
  FOR EACH ROW EXECUTE FUNCTION public.update_atualizado_em();

-- ROLLBACK:
-- DROP TRIGGER IF EXISTS trg_roles_updated_at ON public.roles;
-- DROP TABLE IF EXISTS public.role_assignments;
-- DROP TABLE IF EXISTS public.role_permissions;
-- DROP TABLE IF EXISTS public.permissions;
-- DROP TABLE IF EXISTS public.roles;