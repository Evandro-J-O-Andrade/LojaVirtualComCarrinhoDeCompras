-- ============================================================================
-- 03_backfill_tenant_comercial_PROPOSTA_NAO_EXECUTAR.sql
-- Gate 0 — Angel Cosméticos
-- PROPOSTA — NÃO EXECUTAR NO REMOTO SEM APROVAÇÃO
-- ============================================================================

-- ============================================================================
-- PRÉ-CONDIÇÃO: Tenant Angel deve existir
-- ============================================================================
DO $$
DECLARE
  v_tenant_count INT;
BEGIN
  SELECT count(*) INTO v_tenant_count FROM public.tenants WHERE slug = 'angel-cosmeticos';
  ASSERT v_tenant_count = 1, 'Tenant Angel não encontrado. Executar 02 primeiro.';
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
-- ROLLBACK: Não aplicável de forma simples (dados sobrescritos).
-- Mitigação: executar em transação com ROLLBACK se validação falhar.
-- ============================================================================