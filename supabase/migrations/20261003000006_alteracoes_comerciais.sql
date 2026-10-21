-- ============================================================
-- 20261003000006 — Alterações comerciais (ALTER + reconciliação)
-- Fonte: GAP_ANALYSIS_V1.1 §1.4/§5 + MODELO_COMERCIAL_COMPLETO
-- §3 (SKU), §6 (kit), §9.7 (estorno), SERVICOS §10 (ator).
--
-- Estado confirmado via SQL read-only (2026-10-03):
--   evento=0, pagamento=0, auditoria=0, kit_composicao=0,
--   produto_opcao_valor=0 → ALTERs sem migração de dados.
--   produto_opcao_compra=1 (tipo='quantidade') → restrição
--   do CHECK sem 'kit' é segura.
--   Constraints confirmadas: evento_nome_check, pag_status_check,
--   kc_opcao_fk, poc_tipo_check, aud_acao_check.
-- ============================================================

-- ------------------------------------------------------------
-- 1. PRODUTO.SKU (§3.2 — toda unidade vendável tem SKU)
-- Produto simples: SKU = identificador comercial do produto.
-- Variante já tem sku NOT NULL. Unicidade cruzada
-- produto↔variante é invariante de aplicação (não é
-- expressável como constraint relacional).
-- ------------------------------------------------------------
ALTER TABLE produto ADD COLUMN IF NOT EXISTS sku varchar(100);
ALTER TABLE produto ADD CONSTRAINT produto_sku_unique UNIQUE (sku);

-- ------------------------------------------------------------
-- 2. KIT = PRODUTO (MODELO_COMERCIAL §6 — decisão fechada)
-- Reconciliação: kit_composicao deixa de apontar para
-- produto_opcao_compra (mecanismo paralelo) e aponta
-- diretamente para o produto-kit. Kit tem preco_base próprio
-- (em produto); disponibilidade é DERIVADA dos componentes.
-- produto_opcao_compra mantém apenas 'quantidade' e 'custom'.
-- Tabelas confirmadas VAZIAS → reestruturação sem perda.
-- ------------------------------------------------------------
ALTER TABLE kit_composicao
    ADD COLUMN kit_produto_id bigint;

ALTER TABLE kit_composicao
    ADD CONSTRAINT kc_kit_produto_fk
    FOREIGN KEY (kit_produto_id) REFERENCES produto(id) ON DELETE CASCADE;

-- Componente não se repete no mesmo kit. Um UNIQUE de tabela
-- NÃO serve: o Postgres trata NULLs como distintos, e
-- variante_id é NULL para componente avulso — a unicidade
-- falharia silenciosamente. A unicidade é enforceada por
-- ÍNDICE ÚNICO DE EXPRESSÃO (COALESCE(variante_id, 0))
-- em 20261003000008_indexes.sql.

ALTER TABLE kit_composicao DROP CONSTRAINT IF EXISTS kc_opcao_fk;
ALTER TABLE kit_composicao DROP COLUMN IF EXISTS produto_opcao_id;

ALTER TABLE kit_composicao ALTER COLUMN kit_produto_id SET NOT NULL;

-- produto_opcao_compra: remove 'kit' do catálogo de tipos
-- (o kit agora é produto, não opção de compra).
ALTER TABLE produto_opcao_compra DROP CONSTRAINT IF EXISTS poc_tipo_check;
ALTER TABLE produto_opcao_compra
    ADD CONSTRAINT poc_tipo_check CHECK (tipo IN ('quantidade', 'custom'));

-- PROMOCAO: mesmo limite de desconto percentual (0–100) —
-- impede preço promocional final negativo. Tabela confirmada
-- VAZIA (read-only) → alteração sem perda de dados.
ALTER TABLE promocao DROP CONSTRAINT IF EXISTS prom_valor_check;
ALTER TABLE promocao
    ADD CONSTRAINT prom_valor_check CHECK (
        (tipo = 'fixo' AND valor >= 0) OR
        (tipo = 'percentual' AND valor >= 0 AND valor <= 100)
    );

-- ------------------------------------------------------------
-- 3. PAGAMENTO — estorno (MODELO_COMERCIAL §9.7)
-- Estorno é evento de pagamento separado, rastreável; gera
-- movimentação de retorno ao estoque (D4-M), não retorno cego.
-- pagamento.status ganha estado terminal 'estornado'.
-- ------------------------------------------------------------
ALTER TABLE pagamento DROP CONSTRAINT IF EXISTS pag_status_check;
ALTER TABLE pagamento
    ADD CONSTRAINT pag_status_check
    CHECK (status IN ('pendente', 'aprovado', 'recusado', 'estornado'));

CREATE TABLE IF NOT EXISTS pagamento_estorno (
    id bigserial PRIMARY KEY,
    pagamento_id bigint NOT NULL,
    pedido_id bigint NOT NULL,
    valor decimal(10,2) NOT NULL,
    motivo text,
    status varchar(20) NOT NULL DEFAULT 'solicitado',
    transaction_id varchar(100),
    provider varchar(50),
    criado_em timestamptz NOT NULL DEFAULT now(),
    confirmado_em timestamptz,
    CONSTRAINT pe_valor_check CHECK (valor > 0),
    CONSTRAINT pe_status_check CHECK (status IN ('solicitado', 'processado', 'falhou')),
    CONSTRAINT pe_pagamento_fk FOREIGN KEY (pagamento_id) REFERENCES pagamento(id) ON DELETE RESTRICT,
    CONSTRAINT pe_pedido_fk FOREIGN KEY (pedido_id) REFERENCES pedido(id) ON DELETE RESTRICT
);

ALTER TABLE pagamento_estorno ENABLE ROW LEVEL SECURITY;
CREATE POLICY "estorno_read_owner_admin" ON pagamento_estorno FOR SELECT TO authenticated
    USING (
        is_admin()
        OR EXISTS (
            SELECT 1 FROM pedido p
            JOIN cliente c ON c.id = p.cliente_id
            WHERE p.id = pagamento_estorno.pedido_id AND c.email = auth.jwt() ->> 'email'
        )
    );
CREATE POLICY "estorno_write_admin" ON pagamento_estorno FOR ALL TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

-- ------------------------------------------------------------
-- 4. AUDITORIA — ator profissional/admin (SERVICOS §10,
-- NOTIFICACOES §12)
-- usuario_id (bigint) mapeava só cliente. Atores operacionais
-- (profissional, admin) são identidades auth (uuid).
-- usuario_id vira nullable; ator_auth_id+ator_tipo cobrem
-- profissional/admin. Sem perda: tabela confirmada VAZIA.
-- ------------------------------------------------------------
ALTER TABLE auditoria ALTER COLUMN usuario_id DROP NOT NULL;
ALTER TABLE auditoria ADD COLUMN IF NOT EXISTS ator_auth_id uuid;
ALTER TABLE auditoria ADD COLUMN IF NOT EXISTS ator_tipo varchar(20) NOT NULL DEFAULT 'cliente';
ALTER TABLE auditoria
    ADD CONSTRAINT aud_ator_tipo_check CHECK (ator_tipo IN ('cliente', 'profissional', 'admin'));
ALTER TABLE auditoria
    ADD CONSTRAINT aud_ator_auth_fk FOREIGN KEY (ator_auth_id) REFERENCES auth.users(id);

-- ------------------------------------------------------------
-- 5. CATEGORIA id=1 — correção de dados defeituosos
-- Confirmado (read-only): id=1 = {"nome":"Esmalgue","slug":"esmalhe"}
-- (typo de seed). Correção tipográfica guardada: só executa
-- se o defeito estiver presente.
-- ------------------------------------------------------------
UPDATE categoria
    SET nome = 'Esmalte', slug = 'esmalte'
    WHERE id = 1 AND nome = 'Esmalgue' AND slug = 'esmalhe';
