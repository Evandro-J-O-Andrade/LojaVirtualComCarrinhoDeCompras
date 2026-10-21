-- ============================================================
-- Etapa 6 — V1 Migration Set
-- Angel Cosméticos · Supabase ref: bmqxgibhuzekxpcgosap
-- Status: PROPOSTO PARA REVISÃO HUMANA — NÃO APLICADO
-- Base: GAP_ANALYSIS_SUPABASE_V1.1 + V1.2 (estado real confirmado via SQL read-only)
-- Fontes de domínio: CONTRATO_FUNCIONAL V1.0 · MODELO_COMERCIAL_COMPLETO V1.0 ·
--   SERVICOS_AGENDAMENTO V1.0 · NOTIFICACOES_COMUNICACAO V1.0 ·
--   ESPECIFICACAO_MIMOS_DIARIOS V1.0
-- Regra: nenhuma destas migrations foi executada. Aplicação exige
--   REVISÃO HUMANA (etapa 7) + AUTORIZAÇÃO EXPLÍCITA (etapa 8).
-- ============================================================

-- ============================================================
-- 20261003000001 — Backfill do histórico de migrations
-- O schema canônico foi aplicado FORA do tracking (Gap Analysis §7:
-- supabase_migrations.schema_migrations = 0 linhas). Este migration
-- registra as 4 migrations efetivamente aplicadas para que
-- `supabase db push` não tente reaplicá-las.
-- O draft 20260920000002 NUNCA foi aplicado (orcamento 404 no remoto)
-- e NÃO entra no backfill — está substituído por 20261003000002.
-- ============================================================

INSERT INTO supabase_migrations.schema_migrations (version, name) VALUES
  ('202609190101', 'base_schema'),
  ('202609190102', 'indexes'),
  ('202609190103', 'rls_policies'),
  ('202609190103b', 'rls_additional')
ON CONFLICT (version) DO NOTHING;
