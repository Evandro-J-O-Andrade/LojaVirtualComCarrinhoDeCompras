-- Migration: 20261106000006_tenant_id_commercial.sql
-- Fase 1: Adicionar tenant_id nas tabelas comerciais existentes
-- Preserva dados existentes (popular com tenant Angel).
-- Requer que o tenant Angel já exista (criado na reconciliação).

-- NOTA: Este SQL assume que o tenant Angel foi criado com um UUID fixo.
-- Substituir '00000000-0000-0000-0000-000000000001' pelo UUID real após criação.

-- Adicionar tenant_id em tabelas comerciais
ALTER TABLE public.produto ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);
ALTER TABLE public.categoria ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);
ALTER TABLE public.fornecedor ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);
ALTER TABLE public.produto_imagem ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);
ALTER TABLE public.estoque ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);
ALTER TABLE public.estoque_movimentacao ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);
ALTER TABLE public.cliente ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);
ALTER TABLE public.cliente ADD COLUMN IF NOT EXISTS person_id UUID REFERENCES public.people(id);
ALTER TABLE public.pedido ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);
ALTER TABLE public.pagamento ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);
ALTER TABLE public.servico ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);
ALTER TABLE public.profissional ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);
ALTER TABLE public.agendamento ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);
ALTER TABLE public.pagina ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);
ALTER TABLE public.chamado ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);

-- Índices
CREATE INDEX IF NOT EXISTS idx_produto_tenant ON public.produto(tenant_id);
CREATE INDEX IF NOT EXISTS idx_categoria_tenant ON public.categoria(tenant_id);
CREATE INDEX IF NOT EXISTS idx_fornecedor_tenant ON public.fornecedor(tenant_id);
CREATE INDEX IF NOT EXISTS idx_produto_imagem_tenant ON public.produto_imagem(tenant_id);
CREATE INDEX IF NOT EXISTS idx_estoque_tenant ON public.estoque(tenant_id);
CREATE INDEX IF NOT EXISTS idx_estoque_movimentacao_tenant ON public.estoque_movimentacao(tenant_id);
CREATE INDEX IF NOT EXISTS idx_cliente_tenant ON public.cliente(tenant_id);
CREATE INDEX IF NOT EXISTS idx_cliente_person ON public.cliente(person_id);
CREATE INDEX IF NOT EXISTS idx_pedido_tenant ON public.pedido(tenant_id);
CREATE INDEX IF NOT EXISTS idx_pagamento_tenant ON public.pagamento(tenant_id);
CREATE INDEX IF NOT EXISTS idx_servico_tenant ON public.servico(tenant_id);
CREATE INDEX IF NOT EXISTS idx_profissional_tenant ON public.profissional(tenant_id);
CREATE INDEX IF NOT EXISTS idx_agendamento_tenant ON public.agendamento(tenant_id);
CREATE INDEX IF NOT EXISTS idx_pagina_tenant ON public.pagina(tenant_id);
CREATE INDEX IF NOT EXISTS idx_chamado_tenant ON public.chamado(tenant_id);

-- ROLLBACK:
-- ALTER TABLE public.chamado DROP COLUMN IF EXISTS tenant_id;
-- ALTER TABLE public.pagina DROP COLUMN IF EXISTS tenant_id;
-- ALTER TABLE public.agendamento DROP COLUMN IF EXISTS tenant_id;
-- ALTER TABLE public.profissional DROP COLUMN IF EXISTS tenant_id;
-- ALTER TABLE public.servico DROP COLUMN IF EXISTS tenant_id;
-- ALTER TABLE public.pagamento DROP COLUMN IF EXISTS tenant_id;
-- ALTER TABLE public.pedido DROP COLUMN IF EXISTS tenant_id;
-- ALTER TABLE public.cliente DROP COLUMN IF EXISTS person_id;
-- ALTER TABLE public.cliente DROP COLUMN IF EXISTS tenant_id;
-- ALTER TABLE public.estoque_movimentacao DROP COLUMN IF EXISTS tenant_id;
-- ALTER TABLE public.estoque DROP COLUMN IF EXISTS tenant_id;
-- ALTER TABLE public.produto_imagem DROP COLUMN IF EXISTS tenant_id;
-- ALTER TABLE public.fornecedor DROP COLUMN IF EXISTS tenant_id;
-- ALTER TABLE public.categoria DROP COLUMN IF EXISTS tenant_id;
-- ALTER TABLE public.produto DROP COLUMN IF EXISTS tenant_id;