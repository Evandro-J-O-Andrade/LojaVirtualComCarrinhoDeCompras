-- ============================================================================
-- 05_fix_triggers_updated_at_PROPOSTA_NAO_EXECUTAR.sql
-- Gate 0 V2 — Angel Cosméticos
-- PROPOSTA — NÃO EXECUTAR NO REMOTO SEM APROVAÇÃO
-- ============================================================================
-- Problema: update_atualizado_em() foi sobrescrita para usar NEW.updated_at,
-- mas 8 tabelas antigas usam a coluna atualizado_em.
-- Solução: função que detecta qual coluna existe e atualiza a correta.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
  -- Tabelas novas usam updated_at
  IF TG_TABLE_NAME IN ('people','tenants','tenant_memberships','roles','customer_profiles','employee_profiles','audit_logs') THEN
    NEW.updated_at = pg_catalog.now();
  -- Tabelas antigas usam atualizado_em
  ELSE
    NEW.atualizado_em = pg_catalog.now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- Verificar triggers afetados
-- SELECT tgname, tgrelid::regclass FROM pg_trigger WHERE tgname LIKE 'trg_%_atualizado%';

-- ROLLBACK:
-- Restaurar função original (somente atualizado_em):
-- CREATE OR REPLACE FUNCTION public.update_atualizado_em()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   NEW.atualizado_em = pg_catalog.now();
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql SET search_path = '';