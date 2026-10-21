-- ============================================================
-- 20261003000002 — Orçamento (reescrito e integrado) +
-- Desconto Comercial + Condição de Pagamento
-- Fonte: MODELO_COMERCIAL_COMPLETO_V1.0 §5 (desconto), §8 (orcamento),
-- §9.3 (condição de pagamento); CONTRATO_FUNCIONAL V1.0 §10.
-- Substitui o draft 20260920000002 (nunca aplicado; movido para
-- migrations_backup). Diferenças do draft: desconto comercial
-- rastreado, histórico de status, conversão para pedido, snapshot
-- de atributos, condição de pagamento.
-- Estado confirmado (read-only): orcamento/orcamento_item NÃO existem.
-- ============================================================

-- ------------------------------------------------------------
-- CONDIÇÃO DE PAGAMENTO — configuração de parcelamento (§9.3)
-- Regra comercial configurável: método × parcelas × sem-juros.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS condicao_pagamento (
    id bigserial PRIMARY KEY,
    metodo varchar(10) NOT NULL,
    parcelas integer NOT NULL DEFAULT 1,
    sem_juros boolean NOT NULL DEFAULT false,
    ativo boolean NOT NULL DEFAULT true,
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT cp_metodo_check CHECK (metodo IN ('pix', 'cartao')),
    CONSTRAINT cp_parcelas_check CHECK (parcelas >= 1),
    CONSTRAINT cp_unico_metodo_parcelas UNIQUE (metodo, parcelas)
);

-- ------------------------------------------------------------
-- ORÇAMENTO — proposta comercial negociada (§8)
-- Ciclo: rascunho → enviado → aceito | recusado | expirado
-- Preços congelados (snapshot): catalogo futuro nunca reescreve um
-- orçamento registrado. Veículo do desconto comercial (§5).
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orcamento (
    id bigserial PRIMARY KEY,
    cliente_id bigint,
    status varchar(20) NOT NULL DEFAULT 'rascunho',
    subtotal decimal(10,2) NOT NULL DEFAULT 0,
    desconto_total decimal(10,2) NOT NULL DEFAULT 0,
    frete decimal(10,2) NOT NULL DEFAULT 0,
    total decimal(10,2) NOT NULL DEFAULT 0,
    validade date,
    metodo_pagamento varchar(10),
    parcelas integer,
    observacoes text,
    pedido_id bigint,
    enviado_em timestamptz,
    respondido_em timestamptz,
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT orc_status_check CHECK (status IN ('rascunho', 'enviado', 'aceito', 'recusado', 'expirado')),
    CONSTRAINT orc_valores_check CHECK (subtotal >= 0 AND desconto_total >= 0 AND frete >= 0 AND total >= 0),
    CONSTRAINT orc_parcelas_check CHECK (parcelas IS NULL OR parcelas >= 1),
    CONSTRAINT orc_metodo_check CHECK (metodo_pagamento IS NULL OR metodo_pagamento IN ('pix', 'cartao')),
    CONSTRAINT orc_cliente_fk FOREIGN KEY (cliente_id) REFERENCES cliente(id) ON DELETE SET NULL,
    CONSTRAINT orc_pedido_fk FOREIGN KEY (pedido_id) REFERENCES pedido(id) ON DELETE SET NULL
);

-- ------------------------------------------------------------
-- ORÇAMENTO_ITEM — itens com preço snapshot (§8.2)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orcamento_item (
    id bigserial PRIMARY KEY,
    orcamento_id bigint NOT NULL,
    produto_id bigint NOT NULL,
    produto_variante_id bigint,
    quantidade integer NOT NULL DEFAULT 1,
    preco_unitario decimal(10,2) NOT NULL,
    desconto_unitario decimal(10,2) NOT NULL DEFAULT 0,
    total decimal(10,2) NOT NULL,
    atributos_texto text,
    observacoes text,
    criado_em timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT oi_quantidade_check CHECK (quantidade > 0),
    CONSTRAINT oi_preco_check CHECK (preco_unitario >= 0),
    CONSTRAINT oi_desconto_check CHECK (desconto_unitario >= 0),
    CONSTRAINT oi_total_check CHECK (total >= 0),
    CONSTRAINT oi_orcamento_fk FOREIGN KEY (orcamento_id) REFERENCES orcamento(id) ON DELETE CASCADE,
    CONSTRAINT oi_produto_fk FOREIGN KEY (produto_id) REFERENCES produto(id) ON DELETE RESTRICT,
    CONSTRAINT oi_variante_fk FOREIGN KEY (produto_variante_id) REFERENCES produto_variante(id) ON DELETE SET NULL
);

-- ------------------------------------------------------------
-- ORÇAMENTO_STATUS_HISTORICO — transições auditadas (§8.11)
-- Ator é identidade auth (cliente, vendedor ou admin).
-- NULL = transição automática do sistema (ex.: expiração
-- por validade) — mesmo padrão de pedido_status_historico.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orcamento_status_historico (
    id bigserial PRIMARY KEY,
    orcamento_id bigint NOT NULL,
    status_anterior varchar(20),
    status_novo varchar(20) NOT NULL,
    ator_auth_id uuid,
    criado_em timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT osh_status_check CHECK (status_novo IN ('rascunho', 'enviado', 'aceito', 'recusado', 'expirado')),
    CONSTRAINT osh_orcamento_fk FOREIGN KEY (orcamento_id) REFERENCES orcamento(id) ON DELETE CASCADE,
    CONSTRAINT osh_ator_fk FOREIGN KEY (ator_auth_id) REFERENCES auth.users(id)
);

-- ------------------------------------------------------------
-- DESCONTO COMERCIAL — ato de negociação autorizado (§5)
-- Distinto de promoção (oferta pública) e de cupom (código do
-- cliente). Concedido por vendedor/admin autenticado; nunca
-- autoatendimento; no máximo UM por orçamento/pedido; aplicado
-- APÓS a promoção; respeita teto de margem.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS desconto_comercial (
    id bigserial PRIMARY KEY,
    tipo varchar(20) NOT NULL,
    valor decimal(10,2) NOT NULL,
    teto_maximo decimal(10,2),
    justificativa text,
    concedido_por uuid NOT NULL,
    orcamento_id bigint,
    pedido_id bigint,
    criado_em timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT dc_tipo_check CHECK (tipo IN ('percentual', 'fixo')),
    -- percentual é fração (0–100); fixo é valor em R$.
    -- Impede desconto percentual > 100% (preço final negativo).
    CONSTRAINT dc_valor_check CHECK (
        (tipo = 'fixo' AND valor > 0) OR
        (tipo = 'percentual' AND valor > 0 AND valor <= 100)
    ),
    CONSTRAINT dc_teto_check CHECK (teto_maximo IS NULL OR teto_maximo >= 0),
    CONSTRAINT dc_vinculo_check CHECK (
        (orcamento_id IS NOT NULL AND pedido_id IS NULL) OR
        (orcamento_id IS NULL AND pedido_id IS NOT NULL)
    ),
    CONSTRAINT dc_concedido_por_fk FOREIGN KEY (concedido_por) REFERENCES auth.users(id),
    CONSTRAINT dc_orcamento_fk FOREIGN KEY (orcamento_id) REFERENCES orcamento(id) ON DELETE CASCADE,
    CONSTRAINT dc_pedido_fk FOREIGN KEY (pedido_id) REFERENCES pedido(id) ON DELETE SET NULL
);

-- ============================================================
-- RLS — padrão do projeto: dono via auth.jwt()->>'email' =
-- cliente.email; admin via is_admin().
-- ============================================================

-- CONDICAO_PAGAMENTO (config comercial — leitura autenticada, escrita admin)
ALTER TABLE condicao_pagamento ENABLE ROW LEVEL SECURITY;
CREATE POLICY "condicao_read" ON condicao_pagamento FOR SELECT TO authenticated
    USING (ativo = true);
CREATE POLICY "condicao_write_admin" ON condicao_pagamento FOR ALL TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

-- ORCAMENTO (dono ou admin)
ALTER TABLE orcamento ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orcamento_read_owner_admin" ON orcamento FOR SELECT TO authenticated
    USING (
        EXISTS (SELECT 1 FROM cliente WHERE cliente.email = auth.jwt() ->> 'email' AND cliente.id = orcamento.cliente_id)
        OR is_admin()
    );
CREATE POLICY "orcamento_insert_owner_admin" ON orcamento FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (SELECT 1 FROM cliente WHERE cliente.email = auth.jwt() ->> 'email' AND cliente.id = orcamento.cliente_id)
        OR is_admin()
    );
-- Dono só edita enquanto rascunho (após enviado, o ciclo
-- é conduzido por vendedor/admin — §8.10/§8.12).
CREATE POLICY "orcamento_update_owner_draft" ON orcamento FOR UPDATE TO authenticated
    USING (
        status = 'rascunho' AND
        EXISTS (SELECT 1 FROM cliente WHERE cliente.email = auth.jwt() ->> 'email' AND cliente.id = orcamento.cliente_id)
    )
    WITH CHECK (
        status = 'rascunho' AND
        EXISTS (SELECT 1 FROM cliente WHERE cliente.email = auth.jwt() ->> 'email' AND cliente.id = orcamento.cliente_id)
    );
CREATE POLICY "orcamento_update_admin" ON orcamento FOR UPDATE TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());
CREATE POLICY "orcamento_delete_owner_draft" ON orcamento FOR DELETE TO authenticated
    USING (
        status = 'rascunho' AND
        EXISTS (SELECT 1 FROM cliente WHERE cliente.email = auth.jwt() ->> 'email' AND cliente.id = orcamento.cliente_id)
    );
CREATE POLICY "orcamento_delete_admin" ON orcamento FOR DELETE TO authenticated
    USING (is_admin());

-- ORCAMENTO_ITEM (dono do orçamento; edição de item só em rascunho; admin sempre)
ALTER TABLE orcamento_item ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orcamento_item_read_owner_admin" ON orcamento_item FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM orcamento o
            JOIN cliente c ON c.id = o.cliente_id
            WHERE o.id = orcamento_item.orcamento_id AND c.email = auth.jwt() ->> 'email'
        )
        OR is_admin()
    );
CREATE POLICY "orcamento_item_insert_owner_admin" ON orcamento_item FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM orcamento o
            JOIN cliente c ON c.id = o.cliente_id
            WHERE o.id = orcamento_item.orcamento_id AND c.email = auth.jwt() ->> 'email'
        )
        OR is_admin()
    );
CREATE POLICY "orcamento_item_update_owner_draft" ON orcamento_item FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM orcamento o
            JOIN cliente c ON c.id = o.cliente_id
            WHERE o.id = orcamento_item.orcamento_id AND c.email = auth.jwt() ->> 'email' AND o.status = 'rascunho'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM orcamento o
            JOIN cliente c ON c.id = o.cliente_id
            WHERE o.id = orcamento_item.orcamento_id AND c.email = auth.jwt() ->> 'email' AND o.status = 'rascunho'
        )
    );
CREATE POLICY "orcamento_item_update_admin" ON orcamento_item FOR UPDATE TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

-- ORCAMENTO_STATUS_HISTORICO (leitura dono/admin; escrita dono/admin)
ALTER TABLE orcamento_status_historico ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orcamento_historico_read_owner_admin" ON orcamento_status_historico FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM orcamento o
            JOIN cliente c ON c.id = o.cliente_id
            WHERE o.id = orcamento_status_historico.orcamento_id AND c.email = auth.jwt() ->> 'email'
        )
        OR is_admin()
    );
-- INSERT: sem política para authenticated — o histórico
-- é escrito server-side (service_role/Edge Function) nas
-- transições, mesmo padrão de pedido_status_historico
-- (que só tem política de leitura). Impede que um cliente
-- fabrique linhas de "aceito" no log de auditoria.

-- DESCONTO_COMERCIAL (escrita exclusivamente admin/vendedor; dono lê o seu)
ALTER TABLE desconto_comercial ENABLE ROW LEVEL SECURITY;
CREATE POLICY "desconto_read_owner_admin" ON desconto_comercial FOR SELECT TO authenticated
    USING (
        is_admin()
        OR EXISTS (
            SELECT 1 FROM orcamento o
            JOIN cliente c ON c.id = o.cliente_id
            WHERE o.id = desconto_comercial.orcamento_id AND c.email = auth.jwt() ->> 'email'
        )
        OR EXISTS (
            SELECT 1 FROM pedido p
            JOIN cliente c ON c.id = p.cliente_id
            WHERE p.id = desconto_comercial.pedido_id AND c.email = auth.jwt() ->> 'email'
        )
    );
CREATE POLICY "desconto_write_admin" ON desconto_comercial FOR ALL TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());
