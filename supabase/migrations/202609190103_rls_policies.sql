-- Gate 6.3A — RLS Policies
-- Source: MODELO_DE_DADOS_GATE62.md §19.1, §19.2
-- Project: Angel Cosméticos — E-commerce
-- Status: Derivation only — DO NOT APPLY to Supabase
-- Created: 2026-09-19

-- ============================================================
-- HELPER FUNCTION
-- NOTE: cliente.id is bigserial in schema; auth.uid() is uuid.
-- RLS uses email matching for owner-based policies.
-- ============================================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_user au
    WHERE au.user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE
SET search_path TO 'public', 'pg_catalog';

-- ============================================================
-- RLS — Tabelas Públicas (Leitura anônima, escrita admin)
-- ============================================================

-- PRODUTO
ALTER TABLE produto ENABLE ROW LEVEL SECURITY;
CREATE POLICY "produto_read_active" ON produto FOR SELECT TO anon
    USING (ativo = true);
CREATE POLICY "produto_write_admin" ON produto FOR ALL TO authenticated
    USING (is_admin());

-- PRODUTO_VARIANTE
ALTER TABLE produto_variante ENABLE ROW LEVEL SECURITY;
CREATE POLICY "variante_read_active" ON produto_variante FOR SELECT TO anon
    USING (ativo = true);
CREATE POLICY "variante_write_admin" ON produto_variante FOR ALL TO authenticated
    USING (is_admin());

-- CATEGORIA
ALTER TABLE categoria ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categoria_read_active" ON categoria FOR SELECT TO anon
    USING (ativo = true);
CREATE POLICY "categoria_write_admin" ON categoria FOR ALL TO authenticated
    USING (is_admin());

-- FORNECEDOR
ALTER TABLE fornecedor ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fornecedor_read" ON fornecedor FOR SELECT TO anon
    USING (true);
CREATE POLICY "fornecedor_write_admin" ON fornecedor FOR ALL TO authenticated
    USING (is_admin());

-- PROMOCAO
ALTER TABLE promocao ENABLE ROW LEVEL SECURITY;
CREATE POLICY "promocao_read_active" ON promocao FOR SELECT TO anon
    USING (ativo = true);
CREATE POLICY "promocao_write_admin" ON promocao FOR ALL TO authenticated
    USING (is_admin());

-- PRODUTO_OPCAO_COMPRA
ALTER TABLE produto_opcao_compra ENABLE ROW LEVEL SECURITY;
CREATE POLICY "opcao_compra_read_admin" ON produto_opcao_compra FOR SELECT TO authenticated
    USING (is_admin());
CREATE POLICY "opcao_compra_write_admin" ON produto_opcao_compra FOR ALL TO authenticated
    USING (is_admin());

-- PRODUTO_OPCAO_VALOR
ALTER TABLE produto_opcao_valor ENABLE ROW LEVEL SECURITY;
CREATE POLICY "opcao_valor_read_admin" ON produto_opcao_valor FOR SELECT TO authenticated
    USING (is_admin());
CREATE POLICY "opcao_valor_write_admin" ON produto_opcao_valor FOR ALL TO authenticated
    USING (is_admin());

-- KIT_COMPOSICAO
ALTER TABLE kit_composicao ENABLE ROW LEVEL SECURITY;
CREATE POLICY "kit_read_admin" ON kit_composicao FOR SELECT TO authenticated
    USING (is_admin());
CREATE POLICY "kit_write_admin" ON kit_composicao FOR ALL TO authenticated
    USING (is_admin());

-- PRODUTO_ATRIBUTO
ALTER TABLE produto_atributo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "produto_atributo_read_admin" ON produto_atributo FOR SELECT TO authenticated
    USING (is_admin());
CREATE POLICY "produto_atributo_write_admin" ON produto_atributo FOR ALL TO authenticated
    USING (is_admin());

-- PRODUTO_ATRIBUTO_VALOR
ALTER TABLE produto_atributo_valor ENABLE ROW LEVEL SECURITY;
CREATE POLICY "produto_atributo_valor_read_admin" ON produto_atributo_valor FOR SELECT TO authenticated
    USING (is_admin());
CREATE POLICY "produto_atributo_valor_write_admin" ON produto_atributo_valor FOR ALL TO authenticated
    USING (is_admin());

-- PRODUTO_CATEGORIA
ALTER TABLE produto_categoria ENABLE ROW LEVEL SECURITY;
CREATE POLICY "produto_categoria_read_admin" ON produto_categoria FOR SELECT TO authenticated
    USING (is_admin());
CREATE POLICY "produto_categoria_write_admin" ON produto_categoria FOR ALL TO authenticated
    USING (is_admin());

-- PRODUTO_IMAGEM
ALTER TABLE produto_imagem ENABLE ROW LEVEL SECURITY;
CREATE POLICY "produto_imagem_read_admin" ON produto_imagem FOR SELECT TO authenticated
    USING (is_admin());
CREATE POLICY "produto_imagem_write_admin" ON produto_imagem FOR ALL TO authenticated
    USING (is_admin());

-- PRODUTO_VARIANTE_ATRIBUTO
ALTER TABLE produto_variante_atributo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "produto_variante_atributo_read_admin" ON produto_variante_atributo FOR SELECT TO authenticated
    USING (is_admin());
CREATE POLICY "produto_variante_atributo_write_admin" ON produto_variante_atributo FOR ALL TO authenticated
    USING (is_admin());

-- ============================================================
-- RLS — Tabelas do Cliente (Dono)
-- ============================================================

-- CLIENTE
ALTER TABLE cliente ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cliente_read_own" ON cliente FOR SELECT TO authenticated
    USING (auth.jwt() ->> 'email' = email);
CREATE POLICY "cliente_write_own" ON cliente FOR ALL TO authenticated
    USING (auth.jwt() ->> 'email' = email);

-- ENDERECO
ALTER TABLE endereco ENABLE ROW LEVEL SECURITY;
CREATE POLICY "endereco_read_own" ON endereco FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM cliente WHERE cliente.email = auth.jwt() ->> 'email' AND cliente.id = endereco.cliente_id));
CREATE POLICY "endereco_write_own" ON endereco FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM cliente WHERE cliente.email = auth.jwt() ->> 'email' AND cliente.id = endereco.cliente_id));

-- CARRINHO
ALTER TABLE carrinho ENABLE ROW LEVEL SECURITY;
CREATE POLICY "carrinho_read_own" ON carrinho FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM cliente WHERE cliente.email = auth.jwt() ->> 'email' AND cliente.id = carrinho.cliente_id));
CREATE POLICY "carrinho_write_own" ON carrinho FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM cliente WHERE cliente.email = auth.jwt() ->> 'email' AND cliente.id = carrinho.cliente_id));

-- CARRINHO_ITEM
ALTER TABLE carrinho_item ENABLE ROW LEVEL SECURITY;
CREATE POLICY "carrinho_item_read_own" ON carrinho_item FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM carrinho c JOIN cliente cl ON cl.id = c.cliente_id WHERE c.id = carrinho_item.carrinho_id AND cl.email = auth.jwt() ->> 'email'));
CREATE POLICY "carrinho_item_write_own" ON carrinho_item FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM carrinho c JOIN cliente cl ON cl.id = c.cliente_id WHERE c.id = carrinho_item.carrinho_id AND cl.email = auth.jwt() ->> 'email'));

-- ============================================================
-- RLS — Pedido, Pagamento, Pedido Status Historico
-- ============================================================

-- PEDIDO
ALTER TABLE pedido ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pedido_read_owner_admin" ON pedido FOR SELECT TO authenticated
    USING (auth.jwt() ->> 'email' = (SELECT email FROM cliente WHERE id = pedido.cliente_id) OR is_admin());
CREATE POLICY "pedido_insert_owner" ON pedido FOR INSERT TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM cliente WHERE cliente.email = auth.jwt() ->> 'email' AND cliente.id = pedido.cliente_id));
CREATE POLICY "pedido_update_owner" ON pedido FOR UPDATE TO authenticated
    USING (auth.jwt() ->> 'email' = (SELECT email FROM cliente WHERE id = pedido.cliente_id));
CREATE POLICY "pedido_update_admin_status" ON pedido FOR UPDATE TO authenticated
    USING (is_admin());
CREATE POLICY "pedido_delete_owner" ON pedido FOR DELETE TO authenticated
    USING (auth.jwt() ->> 'email' = (SELECT email FROM cliente WHERE id = pedido.cliente_id));

-- PEDIDO_ITEM
ALTER TABLE pedido_item ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pedido_item_read_owner" ON pedido_item FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM pedido p JOIN cliente c ON c.id = p.cliente_id WHERE p.id = pedido_item.pedido_id AND c.email = auth.jwt() ->> 'email'));

-- PAGAMENTO
ALTER TABLE pagamento ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pagamento_read_owner" ON pagamento FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM pedido p JOIN cliente c ON c.id = p.cliente_id WHERE p.id = pagamento.pedido_id AND c.email = auth.jwt() ->> 'email'));

-- PEDIDO_STATUS_HISTORICO
ALTER TABLE pedido_status_historico ENABLE ROW LEVEL SECURITY;
CREATE POLICY psh_read_owner_admin ON pedido_status_historico FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM pedido p JOIN cliente c ON c.id = p.cliente_id WHERE p.id = pedido_status_historico.pedido_id AND c.email = auth.jwt() ->> 'email') OR is_admin());

-- ============================================================
-- RLS — Admin / Configuracao
-- ============================================================

-- FRETE_REGRA
ALTER TABLE frete_regra ENABLE ROW LEVEL SECURITY;
CREATE POLICY "frete_read" ON frete_regra FOR SELECT TO authenticated
    USING (true);
CREATE POLICY "frete_write_admin" ON frete_regra FOR ALL TO authenticated
    USING (is_admin());

-- ESTOQUE
ALTER TABLE estoque ENABLE ROW LEVEL SECURITY;
CREATE POLICY "estoque_read_admin" ON estoque FOR SELECT TO authenticated
    USING (is_admin());
CREATE POLICY "estoque_write_admin" ON estoque FOR ALL TO authenticated
    USING (is_admin());

-- ESTOQUE_MOVIMENTACAO
ALTER TABLE estoque_movimentacao ENABLE ROW LEVEL SECURITY;
CREATE POLICY "movimentacao_read_admin" ON estoque_movimentacao FOR SELECT TO authenticated
    USING (is_admin());
CREATE POLICY "movimentacao_write_admin" ON estoque_movimentacao FOR ALL TO authenticated
    USING (is_admin());

-- ============================================================
-- RLS — Suporte
-- ============================================================

-- ATENDIMENTO
ALTER TABLE atendimento ENABLE ROW LEVEL SECURITY;
CREATE POLICY "atendimento_read_owner_admin" ON atendimento FOR SELECT TO authenticated
    USING (auth.jwt() ->> 'email' = (SELECT email FROM cliente WHERE id = atendimento.cliente_id) OR is_admin());
CREATE POLICY "atendimento_insert_owner" ON atendimento FOR INSERT TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM cliente WHERE cliente.email = auth.jwt() ->> 'email' AND cliente.id = atendimento.cliente_id) OR is_admin());
CREATE POLICY "atendimento_update_owner" ON atendimento FOR UPDATE TO authenticated
    USING (auth.jwt() ->> 'email' = (SELECT email FROM cliente WHERE id = atendimento.cliente_id));
CREATE POLICY "atendimento_update_admin_status" ON atendimento FOR UPDATE TO authenticated
    USING (is_admin());
CREATE POLICY "atendimento_delete_admin" ON atendimento FOR DELETE TO authenticated
    USING (is_admin());

-- ATENDIMENTO_MENSAGEM
ALTER TABLE atendimento_mensagem ENABLE ROW LEVEL SECURITY;
CREATE POLICY "msg_read_owner_admin" ON atendimento_mensagem FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM atendimento a JOIN cliente c ON c.id = a.cliente_id WHERE a.id = atendimento_mensagem.atendimento_id AND c.email = auth.jwt() ->> 'email') OR is_admin());
CREATE POLICY "msg_write_owner" ON atendimento_mensagem FOR INSERT TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM atendimento a JOIN cliente c ON c.id = a.cliente_id WHERE a.id = atendimento_mensagem.atendimento_id AND c.email = auth.jwt() ->> 'email') OR is_admin());

-- ============================================================
-- RLS — Automacao (System)
-- ============================================================

-- EVENTO
ALTER TABLE evento ENABLE ROW LEVEL SECURITY;
CREATE POLICY "evento_read_admin" ON evento FOR SELECT TO authenticated
    USING (is_admin());
CREATE POLICY "evento_insert_service_role" ON evento FOR INSERT TO service_role
    WITH CHECK (true);

-- AUDITORIA (INSERT ONLY — Imutabilidade do log)
ALTER TABLE auditoria ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auditoria_insert_service_role" ON auditoria FOR INSERT TO service_role
    WITH CHECK (true);
CREATE POLICY "auditoria_no_select" ON auditoria FOR SELECT TO anon, authenticated
    USING (false);
CREATE POLICY "auditoria_no_update" ON auditoria FOR UPDATE TO anon, authenticated
    USING (false);
CREATE POLICY "auditoria_no_delete" ON auditoria FOR DELETE TO anon, authenticated
    USING (false);
