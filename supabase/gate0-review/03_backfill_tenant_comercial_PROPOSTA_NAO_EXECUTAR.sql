-- ============================================================================
-- 03_backfill_tenant_comercial_PROPOSTA_NAO_EXECUTAR.sql (V3)
-- Gate 0 — Angel Cosméticos
-- PROPOSTA — NÃO EXECUTAR NO REMOTO SEM APROVAÇÃO
-- V3: Transacional com validações prévias e aborto em inconsistência
-- ============================================================================

BEGIN;

-- ============================================================================
-- PRÉ-VALIDAÇÃO: Tenant Angel deve existir
-- ============================================================================
DO $$
DECLARE
  v_tenant_count INT;
BEGIN
  SELECT count(*) INTO v_tenant_count FROM public.tenants WHERE slug = 'angel-cosmeticos';
  IF v_tenant_count <> 1 THEN
    RAISE EXCEPTION 'Tenant Angel não encontrado (encontrado: %). Abortar.', v_tenant_count;
  END IF;
END $$;

-- ============================================================================
-- PRÉ-VALIDAÇÃO: Contar registros sem tenant (snapshot)
-- ============================================================================
DO $$
DECLARE
  v_sem_tenant INT;
BEGIN
  SELECT count(*) INTO v_sem_tenant FROM public.produto WHERE tenant_id IS NULL;
  RAISE NOTICE 'Produtos sem tenant antes do backfill: %', v_sem_tenant;
  -- Abortar se não há registros para processar (possível re-execução)
  IF v_sem_tenant = 0 THEN
    RAISE NOTICE 'Nenhum produto sem tenant. Backfill já aplicado ou sem dados.';
  END IF;
END $$;

-- ============================================================================
-- Backfill: atualizar exclusivamente registros com tenant_id IS NULL
-- Nunca sobrescrever tenant já associado.
-- ============================================================================

UPDATE public.produto
SET tenant_id = (SELECT id FROM public.tenants WHERE slug = 'angel-cosmeticos')
WHERE tenant_id IS NULL;

UPDATE public.categoria
SET tenant_id = (SELECT id FROM public.tenants WHERE slug = 'angel-cosmeticos')
WHERE tenant_id IS NULL;

UPDATE public.fornecedor
SET tenant_id = (SELECT id FROM public.tenants WHERE slug = 'angel-cosmeticos')
WHERE tenant_id IS NULL;

UPDATE public.produto_imagem
SET tenant_id = (SELECT id FROM public.tenants WHERE slug = 'angel-cosmeticos')
WHERE tenant_id IS NULL;

UPDATE public.estoque
SET tenant_id = (SELECT id FROM public.tenants WHERE slug = 'angel-cosmeticos')
WHERE tenant_id IS NULL;

UPDATE public.estoque_movimentacao
SET tenant_id = (SELECT id FROM public.tenants WHERE slug = 'angel-cosmeticos')
WHERE tenant_id IS NULL;

UPDATE public.cliente
SET tenant_id = (SELECT id FROM public.tenants WHERE slug = 'angel-cosmeticos')
WHERE tenant_id IS NULL;

UPDATE public.pedido
SET tenant_id = (SELECT id FROM public.tenants WHERE slug = 'angel-cosmeticos')
WHERE tenant_id IS NULL;

UPDATE public.pagamento
SET tenant_id = (SELECT id FROM public.tenants WHERE slug = 'angel-cosmeticos')
WHERE tenant_id IS NULL;

UPDATE public.servico
SET tenant_id = (SELECT id FROM public.tenants WHERE slug = 'angel-cosmeticos')
WHERE tenant_id IS NULL;

UPDATE public.profissional
SET tenant_id = (SELECT id FROM public.tenants WHERE slug = 'angel-cosmeticos')
WHERE tenant_id IS NULL;

UPDATE public.agendamento
SET tenant_id = (SELECT id FROM public.tenants WHERE slug = 'angel-cosmeticos')
WHERE tenant_id IS NULL;

UPDATE public.pagina
SET tenant_id = (SELECT id FROM public.tenants WHERE slug = 'angel-cosmeticos')
WHERE tenant_id IS NULL;

UPDATE public.chamado
SET tenant_id = (SELECT id FROM public.tenants WHERE slug = 'angel-cosmeticos')
WHERE tenant_id IS NULL;

-- ============================================================================
-- PÓS-VALIDAÇÃO: Confirmar que não restam registros sem tenant
-- ============================================================================
DO $$
DECLARE
  v_remaining INT;
BEGIN
  SELECT count(*) INTO v_remaining FROM public.produto WHERE tenant_id IS NULL;
  IF v_remaining > 0 THEN
    RAISE EXCEPTION 'Backfill incompleto: % produtos sem tenant. ROLLBACK.', v_remaining;
  END IF;
END $$;

-- COMMIT; (descomentar após validação)
-- ROLLBACK; (usar se validação falhar)

-- ROLLBACK manual (se necessário):
-- UPDATE public.produto SET tenant_id = NULL WHERE tenant_id = (SELECT id FROM public.tenants WHERE slug = 'angel-cosmeticos');
-- (repetir para todas as tabelas — CUIDADO: isso desfaz o backfill)