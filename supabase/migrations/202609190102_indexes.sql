-- Gate 6.3A — Indexes & Unique Constraints
-- Source: MODELO_DE_DADOS_GATE62.md
-- Project: Angel Cosméticos — E-commerce
-- Status: Derivation only — DO NOT APPLY to Supabase
-- Created: 2026-09-19

-- Extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- ============================================================
-- UNIQUE CONSTRAINTS NOT ENFORCED IN TABLE DEFINITION
-- ============================================================

-- Endereço principal: apenas um endereço principal por cliente (D9)
CREATE UNIQUE INDEX IF NOT EXISTS idx_endereco_principal
    ON endereco (cliente_id)
    WHERE principal = true;

-- Evento idempotency: evitar processamento duplicado (eventos mínimos)
CREATE UNIQUE INDEX IF NOT EXISTS idx_evento_idempotency
    ON evento (idempotency_key)
    WHERE idempotency_key IS NOT NULL;

-- ============================================================
-- FOREIGN KEY INDEXES (performance)
-- ============================================================

-- Carrinho — session unique when no cliente (visitor)
CREATE UNIQUE INDEX IF NOT EXISTS idx_carrinho_session_unique
    ON carrinho (session_id)
    WHERE cliente_id IS NULL;

-- ============================================================
-- FORNECEDOR → Produto
CREATE INDEX IF NOT EXISTS idx_produto_fornecedor ON produto (fornecedor_id);

-- Produto → Categoria (N:N junction)
CREATE INDEX IF NOT EXISTS idx_produto_categoria_produto ON produto_categoria (produto_id);
CREATE INDEX IF NOT EXISTS idx_produto_categoria_categoria ON produto_categoria (categoria_id);

-- Produto → Atributo
CREATE INDEX IF NOT EXISTS idx_atributo_produto ON produto_atributo (produto_id);
CREATE INDEX IF NOT EXISTS idx_atributo_valor_atributo ON produto_atributo_valor (produto_atributo_id);

-- Produto → Imagem
CREATE INDEX IF NOT EXISTS idx_imagem_produto ON produto_imagem (produto_id);

-- Produto → Variante
CREATE INDEX IF NOT EXISTS idx_variante_produto ON produto_variante (produto_id);

-- Variante → Atributo (N:N)
CREATE INDEX IF NOT EXISTS idx_variante_atributo_variante ON produto_variante_atributo (produto_variante_id);
CREATE INDEX IF NOT EXISTS idx_variante_atributo_valor ON produto_variante_atributo (produto_atributo_valor_id);

-- Produto → Promoção
CREATE INDEX IF NOT EXISTS idx_promocao_produto ON promocao (produto_id);

-- Cliente → Endereco
CREATE INDEX IF NOT EXISTS idx_endereco_cliente ON endereco (cliente_id);

-- Cliente → Carrinho
CREATE INDEX IF NOT EXISTS idx_carrinho_cliente ON carrinho (cliente_id);
CREATE INDEX IF NOT EXISTS idx_carrinho_session ON carrinho (session_id);

-- Carrinho → Carrinho Item
CREATE INDEX IF NOT EXISTS idx_carrinho_item_carrinho ON carrinho_item (carrinho_id);
CREATE INDEX IF NOT EXISTS idx_carrinho_item_produto ON carrinho_item (produto_id);
CREATE INDEX IF NOT EXISTS idx_carrinho_item_variente ON carrinho_item (produto_variante_id);
CREATE INDEX IF NOT EXISTS idx_carrinho_item_opcao ON carrinho_item (produto_opcao_compra_id);
CREATE INDEX IF NOT EXISTS idx_carrinho_item_kit ON carrinho_item (kit_composicao_id);

-- Pedido → Itens
CREATE INDEX IF NOT EXISTS idx_pedido_item_pedido ON pedido_item (pedido_id);
CREATE INDEX IF NOT EXISTS idx_pedido_item_produto ON pedido_item (produto_id);
CREATE INDEX IF NOT EXISTS idx_pedido_item_variente ON pedido_item (produto_variante_id);
CREATE INDEX IF NOT EXISTS idx_pedido_item_opcao ON pedido_item (produto_opcao_compra_id);
CREATE INDEX IF NOT EXISTS idx_pedido_item_kit ON pedido_item (kit_composicao_id);

-- Pedido → Status Histórico
CREATE INDEX IF NOT EXISTS idx_psh_pedido ON pedido_status_historico (pedido_id);

-- Pedido → Pagamento
CREATE INDEX IF NOT EXISTS idx_pagamento_pedido ON pagamento (pedido_id);
CREATE INDEX IF NOT EXISTS idx_pedido_pagamento ON pedido (pagamento_id);

-- Pedido → Cliente / Frete / Endereço
CREATE INDEX IF NOT EXISTS idx_pedido_cliente ON pedido (cliente_id);
CREATE INDEX IF NOT EXISTS idx_pedido_frete ON pedido (frete_regra_id);
CREATE INDEX IF NOT EXISTS idx_pedido_endereco ON pedido (endereco_entrega_id);

-- Estoque
CREATE INDEX IF NOT EXISTS idx_estoque_produto ON estoque (produto_id);
CREATE INDEX IF NOT EXISTS idx_estoque_variente ON estoque (produto_variante_id);

-- Estoque → Movimentação
CREATE INDEX IF NOT EXISTS idx_movimentacao_estoque ON estoque_movimentacao (estoque_id);
CREATE INDEX IF NOT EXISTS idx_movimentacao_pedido ON estoque_movimentacao (pedido_id);
CREATE INDEX IF NOT EXISTS idx_movimentacao_produto ON estoque_movimentacao (produto_id);
CREATE INDEX IF NOT EXISTS idx_movimentacao_variente ON estoque_movimentacao (produto_variante_id);

-- Atendimento
CREATE INDEX IF NOT EXISTS idx_atendimento_cliente ON atendimento (cliente_id);
CREATE INDEX IF NOT EXISTS idx_atendimento_pedido ON atendimento (pedido_id);
CREATE INDEX IF NOT EXISTS idx_atendimento_mensagem_atendimento ON atendimento_mensagem (atendimento_id);

-- Auditoria
CREATE INDEX IF NOT EXISTS idx_auditoria_entidade ON auditoria (entidade_tipo, entidade_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_usuario ON auditoria (usuario_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_criado ON auditoria (criado_em);

-- Evento
CREATE INDEX IF NOT EXISTS idx_evento_entidade ON evento (entidade_tipo, entidade_id);
CREATE INDEX IF NOT EXISTS idx_evento_status ON evento (status);
CREATE INDEX IF NOT EXISTS idx_evento_criado ON evento (criado_em);

-- Frete Regra — consultas por região/UF
CREATE INDEX IF NOT EXISTS idx_frete_regiao ON frete_regra (regiao);
CREATE INDEX IF NOT EXISTS idx_frete_uf ON frete_regra (uf);
CREATE INDEX IF NOT EXISTS idx_frete_cep_inicio ON frete_regra (cep_inicio);
CREATE INDEX IF NOT EXISTS idx_frete_cep_fim ON frete_regra (cep_fim);

-- Produto — buscas
CREATE INDEX IF NOT EXISTS idx_produto_ativo ON produto (ativo);
CREATE INDEX IF NOT EXISTS idx_produto_nome_trgm ON produto USING gin (nome gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_produto_slug_trgm ON produto USING gin (slug gin_trgm_ops);

-- Categoria — buscas
CREATE INDEX IF NOT EXISTS idx_categoria_ativo ON categoria (ativo);
CREATE INDEX IF NOT EXISTS idx_categoria_slug_trgm ON categoria USING gin (slug gin_trgm_ops);

-- Promoção — por data
CREATE INDEX IF NOT EXISTS idx_promocao_data ON promocao (data_inicio, data_fim);
CREATE INDEX IF NOT EXISTS idx_promocao_ativa ON promocao (ativo);

-- Fornecedor
CREATE INDEX IF NOT EXISTS idx_fornecedor_ativo ON fornecedor (ativo);

-- ============================================================
-- EXCLUDE CONSTRAINT — Estoque único por tipo (D4)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS btree_gist;
ALTER TABLE IF EXISTS estoque ADD CONSTRAINT estoque_unico_por_tipo
    EXCLUDE USING gist (produto_id WITH =, produto_variante_id WITH =);
