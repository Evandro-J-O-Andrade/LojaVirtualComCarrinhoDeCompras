-- Angel Commerce — Reconciliation Migration (FINAL)
-- Generated: 2026-09-27
-- Status: DRAFT FOR HUMAN REVIEW - NOT APPLIED
-- Source: Supabase project bmqxgibhuzekxpcgosap
-- NOT based on 202609190101_base_schema.sql (marked DO NOT APPLY)
--
-- BASEADO EM INSPEÇÃO DDL REAL (driver pg, conexão direta via DIRECT_URL).
-- Nomes de tabelas corrigidos para o schema remoto real (português):
--   fornecedOR (não fornecdor), frete_regra, produto, produto_imagem,
--   produto_opcao_compra, produto_opcao_valor, produto_atributo,
--   produto_atributo_valor, produto_variante, produto_variante_atributo,
--   kit_composicao, produtoCategoria, promocao, pedido, pedido_item,
--   pedido_status_historico, estoque, estoque_movimentacao,
--   atendimento, atendimento_mensagem, evento, auditoria, cliente,
--   address, carrinho, carrinho_item, pagamento, categoria
--
-- ESTADO DO REMOTO (inspecionado 2026-09-27):
--   - 27 tabelas canônicas existentes (todas em português)
--   - 27 sequências bigserial
--   - Bucket 'product-images' JÁ EXISTE (criado 2026-09-21, público)
--   - Função is_admin() JÁ EXISTE (security definer, stable)
--   - RLS policies existem em todas as tabelas (nomes em português)
--   - NENHUMA CHECK constraint existe no remoto
--   - NENHUM trigger existe no remoto
--   - 0 dados comerciais (apenas 4 linhas de seed: categoria, fornecedOR, produto, produto_variante)
--   - orcamento e orcamento_item NÃO existem (única criação necessária)
--
-- PADRÃO DE IDENTIDADE DO PROJETO (inspecionado via pg_policy):
--   cliente.id é bigint, auth.users.id é uuid — NÃO há FK entre eles.
--   O projeto identifica o dono via auth.jwt() ->> 'email' = cliente.email.
--   Função is_admin() verifica auth.users.raw_user_meta_data->>'role' = 'admin'.
--   Role authenticated = {16485} (Postgres ACL numeric).

-- ============================================================
-- PHASE 1: ORÇAMENTO (decisão fechada: SIM)
-- ============================================================

CREATE TABLE IF NOT EXISTS orcamento (
    id bigserial PRIMARY KEY,
    cliente_id bigint,
    status varchar(20) NOT NULL DEFAULT 'rascunho',
    subtotal decimal(10,2) NOT NULL DEFAULT 0,
    desconto decimal(10,2) NOT NULL DEFAULT 0,
    acrescimo decimal(10,2) NOT NULL DEFAULT 0,
    frete decimal(10,2) NOT NULL DEFAULT 0,
    total decimal(10,2) NOT NULL DEFAULT 0,
    condicoes_pagamento text,
    validade date,
    observacoes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT orc_status_check CHECK (status IN ('rascunho', 'enviado', 'aceito', 'recusado', 'expirado'))
);

-- FK: orcamento.cliente_id → cliente.id (mesmo padrão de pedido/carrinho/endereco)
ALTER TABLE orcamento ADD CONSTRAINT orc_cliente_fk
    FOREIGN KEY (cliente_id) REFERENCES cliente(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS orcamento_item (
    id bigserial PRIMARY KEY,
    orcamento_id bigint NOT NULL,
    produto_id bigint NOT NULL,
    produto_variante_id bigint,
    quantidade integer NOT NULL DEFAULT 1,
    preco_unitario decimal(10,2) NOT NULL DEFAULT 0,
    desconto decimal(10,2) NOT NULL DEFAULT 0,
    acrescimo decimal(10,2) NOT NULL DEFAULT 0,
    total decimal(10,2) NOT NULL DEFAULT 0,
    observacoes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT oi_quantidade_check CHECK (quantidade > 0),
    CONSTRAINT oi_preco_check CHECK (preco_unitario >= 0),
    CONSTRAINT oi_orcamento_fk FOREIGN KEY (orcamento_id) REFERENCES orcamento(id) ON DELETE CASCADE,
    CONSTRAINT oi_produto_fk FOREIGN KEY (produto_id) REFERENCES produto(id) ON DELETE RESTRICT,
    CONSTRAINT oi_variante_fk FOREIGN KEY (produto_variante_id) REFERENCES produto_variante(id) ON DELETE SET NULL
);

-- ============================================================
-- PHASE 2: FKs e índices para tabelas existentes
-- ============================================================

-- FKs já existentes no remoto (não recriar):
--   fornecedOR → produto (fornecedOR_id)
--   produto → produto_imagem (produto_id)
--   produto → produto_variante ( produto_id)
--   produto → produtoCategoria ( produto_id, categoria_id)
--   produto → produto_opcao_compra ( produto_id)
--   produto → kit_composicao (product_id)
--   produto_variante → produto_variante_atributo (variant_id, attribute_value_id)

-- Índices para orçamento
CREATE INDEX IF NOT EXISTS idx_orcamentoCliente ON orcamento (cliente_id);
CREATE INDEX IF NOT EXISTS idx_orcamentoStatus ON orcamento (status);
CREATE INDEX IF NOT EXISTS idx_orcamento_item_orcamento ON orcamento_item (orcamento_id);
CREATE INDEX IF NOT EXISTS idx_orcamento_item_produto ON orcamento_item (produto_id);

-- ============================================================
-- PHASE 3: CHECK constraints (idempotentes)
-- ============================================================

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orc_preco_base_positivo') THEN
        ALTER TABLE produto ADD CONSTRAINT orc_preco_base_positivo CHECK (preco_base >= 0);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orc_preco_positivo') THEN
        ALTER TABLE produto_variante ADD CONSTRAINT orc_preco_positivo CHECK (preco >= 0);
    END IF;
END $$;

-- ============================================================
-- PHASE 4: RLS para orçamento
-- ============================================================
-- PADRÃO DE RLS DO PROJETO (inspecionado no remoto):
--   O projeto identifica o dono via auth.jwt() ->> 'email' matching cliente.email,
--   NÃO via auth.uid() ( cliente.id é bigint, auth.users.id é uuid ).
--   Exemplos confirmados:
--     carrinho_read_own:  cliente.email = auth.jwt()->>'email' AND cliente.id = carrinho.cliente_id
--     atendimento_read_owner_admin: auth.jwt()->>'email' = (SELECT cliente.email FROM cliente WHERE cliente.id = atendimento.cliente_id) OR is_admin()
--   Função is_admin() já existe (security definer, stable).
--   Roles: {16485} = authenticated (Postgres ACL numeric).

ALTER TABLE orcamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE orcamento_item ENABLE ROW LEVEL SECURITY;

-- Policies: cliente vê próprio orçamento (mesmo padrão de carrinho/pedidos)
CREATE POLICY orcamento_read_own ON orcamento FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM cliente
            WHERE cliente.email = (auth.jwt() ->> 'email')
              AND cliente.id = orcamento.cliente_id
        )
        OR is_admin()
    );

CREATE POLICY orcamento_insert_own ON orcamento FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM cliente
            WHERE cliente.email = (auth.jwt() ->> 'email')
              AND cliente.id = orcamento.cliente_id
        )
        OR is_admin()
    );

CREATE POLICY orcamento_update_own ON orcamento FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM cliente
            WHERE cliente.email = (auth.jwt() ->> 'email')
              AND cliente.id = orcamento.cliente_id
        )
        OR is_admin()
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM cliente
            WHERE cliente.email = (auth.jwt() ->> 'email')
              AND cliente.id = orcamento.cliente_id
        )
        OR is_admin()
    );

CREATE POLICY orcamento_delete_own ON orcamento FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM cliente
            WHERE cliente.email = (auth.jwt() ->> 'email')
              AND cliente.id = orcamento.cliente_id
        )
        OR is_admin()
    );

CREATE POLICY orcamento_item_insert_own ON orcamento_item FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM orcamento o
            JOIN cliente c ON c.id = o.cliente_id
            WHERE o.id = orcamento_item.orcamento_id
              AND c.email = (auth.jwt() ->> 'email')
        )
        OR is_admin()
    );

CREATE POLICY orcamento_item_read_own ON orcamento_item FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM orcamento o
            JOIN cliente c ON c.id = o.cliente_id
            WHERE o.id = orcamento_item.orcamento_id
              AND c.email = (auth.jwt() ->> 'email')
        )
        OR is_admin()
    );

-- ============================================================
-- PHASE 5: Storage (JÁ EXISTE — não recriar)
-- ============================================================
-- Bucket 'product-images' já existe no remoto (criado 2026-09-21, público).
-- Policies de storage existentes:
--   "Public bucket read"        (r, public)
--   "Authenticated upload"      (a, authenticated)
--   "Authenticated update"      (w, authenticated)
--   "Authenticated delete"      (d, authenticated)
-- Arquivo separado: supabase/storage/product-images-policies.sql
-- Função is_admin() já existe (security definer, stable).
-- Nenhuma ação necessária nesta migration.