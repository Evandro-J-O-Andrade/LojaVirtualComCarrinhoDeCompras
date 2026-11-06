-- Migration: 20261106000001_identity_foundation.sql
-- Fase 1: Fundação de identidade SaaS
-- Cria people, tenants, tenant_memberships
-- Preserva dados existentes. Nenhuma alteração em tabelas comerciais nesta migration.

-- 1. people (núcleo de identidade)
CREATE TABLE IF NOT EXISTS public.people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  username TEXT UNIQUE,
  display_name TEXT,
  email TEXT,
  avatar_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. tenants (organizações)
CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. tenant_memberships (vínculo pessoa-tenant)
CREATE TABLE IF NOT EXISTS public.tenant_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (person_id, tenant_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_people_auth_user_id ON public.people(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_people_username ON public.people(username);
CREATE INDEX IF NOT EXISTS idx_tenant_memberships_person ON public.tenant_memberships(person_id);
CREATE INDEX IF NOT EXISTS idx_tenant_memberships_tenant ON public.tenant_memberships(tenant_id);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.update_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- (trigger já existe em outras tabelas; criar para as novas)
DROP TRIGGER IF EXISTS trg_people_updated_at ON public.people;
CREATE TRIGGER trg_people_updated_at
  BEFORE UPDATE ON public.people
  FOR EACH ROW EXECUTE FUNCTION public.update_atualizado_em();

DROP TRIGGER IF EXISTS trg_tenants_updated_at ON public.tenants;
CREATE TRIGGER trg_tenants_updated_at
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.update_atualizado_em();

DROP TRIGGER IF EXISTS trg_tenant_memberships_updated_at ON public.tenant_memberships;
CREATE TRIGGER trg_tenant_memberships_updated_at
  BEFORE UPDATE ON public.tenant_memberships
  FOR EACH ROW EXECUTE FUNCTION public.update_atualizado_em();

-- ROLLBACK:
-- DROP TRIGGER IF EXISTS trg_tenant_memberships_updated_at ON public.tenant_memberships;
-- DROP TRIGGER IF EXISTS trg_tenants_updated_at ON public.tenants;
-- DROP TRIGGER IF EXISTS trg_people_updated_at ON public.people;
-- DROP TABLE IF EXISTS public.tenant_memberships;
-- DROP TABLE IF EXISTS public.tenants;
-- DROP TABLE IF EXISTS public.people;