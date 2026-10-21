-- ============================================================
-- 20261003000004 — Notificações + catálogo de eventos (pt-BR)
-- Fonte: NOTIFICACOES_COMUNICACAO_ANGEL_V1.0 (fechado).
-- Regra fundamental: Evento ≠ Notificação. `evento` é o
-- outbox (o fato); `notificacao` é a tentativa de entrega
-- por um canal. Comunicação é efeito, nunca causa.
-- ============================================================

-- ------------------------------------------------------------
-- NOTIFICACAO (§5, §6, §9) — registro técnico de entrega
-- Idempotência: idempotency_key único (§6.2) + índice parcial
-- (evento_id, canal, destinatário) — mesmo evento+canal+
-- destinatário é entregue UMA vez.
-- Retry seguro: incrementa `tentativas` na MESMA notificacao
-- (nunca cria nova entrega). Após máximo → falhou_definitivamente
-- (dead-letter, revisão manual).
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notificacao (
    id bigserial PRIMARY KEY,
    -- Toda notificação nasce de um evento (outbox). NOT NULL
    -- preserva a causalidade (evento ≠ notificação) e a força
    -- da deduplicação por evento+canal+destinatário (§6).
    evento_id bigint NOT NULL,
    canal varchar(20) NOT NULL,
    destinatario_tipo varchar(20) NOT NULL,
    destinatario_cliente_id bigint,
    destinatario_email varchar(255),
    template_id bigint,
    variaveis jsonb,
    idempotency_key varchar(255) NOT NULL,
    status varchar(20) NOT NULL DEFAULT 'pendente',
    tentativas integer NOT NULL DEFAULT 0,
    proxima_tentativa timestamptz,
    enviado_em timestamptz,
    entregue_em timestamptz,
    lido_em timestamptz,
    erro text,
    criado_em timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT no_canal_check CHECK (canal IN ('interno', 'email', 'whatsapp')),
    CONSTRAINT no_destinatario_tipo_check CHECK (destinatario_tipo IN ('cliente', 'admin')),
    CONSTRAINT no_status_check CHECK (status IN ('pendente', 'processando', 'enviado', 'entregue', 'lido', 'falhou', 'falhou_definitivamente')),
    CONSTRAINT no_tentativas_check CHECK (tentativas >= 0),
    CONSTRAINT no_idempotency_unique UNIQUE (idempotency_key),
    CONSTRAINT no_destinatario_check CHECK (
        (destinatario_tipo = 'cliente' AND destinatario_cliente_id IS NOT NULL) OR
        (destinatario_tipo = 'admin')
    ),
    CONSTRAINT no_evento_fk FOREIGN KEY (evento_id) REFERENCES evento(id) ON DELETE RESTRICT,
    CONSTRAINT no_template_fk FOREIGN KEY (template_id) REFERENCES notificacao_template(id) ON DELETE SET NULL,
    CONSTRAINT no_cliente_fk FOREIGN KEY (destinatario_cliente_id) REFERENCES cliente(id) ON DELETE SET NULL,
    -- deduplicação por evento+canal+destinatário (§6.2)
    CONSTRAINT no_dedup_unique UNIQUE (evento_id, canal, destinatario_tipo, destinatario_cliente_id)
);

-- ------------------------------------------------------------
-- NOTIFICACAO_TEMPLATE (§3) — renderização server-side
-- Variáveis controladas: %nome% %protocolo% %servico% %data%
-- %hora% %pedido% %valor%. Variável ausente → campo vazio,
-- nunca inventado. Conteúdo = dados reais do evento.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notificacao_template (
    id bigserial PRIMARY KEY,
    evento_nome varchar(50) NOT NULL,
    canal varchar(20) NOT NULL,
    assunto varchar(255),
    corpo text NOT NULL,
    variaveis jsonb,
    ativo boolean NOT NULL DEFAULT true,
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT nt_canal_check CHECK (canal IN ('interno', 'email', 'whatsapp')),
    CONSTRAINT nt_ativo_check CHECK (ativo IN (true, false)),
    CONSTRAINT nt_unico UNIQUE (evento_nome, canal)
);

-- ------------------------------------------------------------
-- NOTIFICACAO_PREFERENCIA (§4) — LGPD
-- Operacional: essencial, NÃO bloqueável (§4.5).
-- Marketing: opt-in explícito com data; opt-out a qualquer
-- momento. Canal preferencial com fallback (§4.3).
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notificacao_preferencia (
    id bigserial PRIMARY KEY,
    cliente_id bigint NOT NULL,
    canal_preferencial varchar(20) NOT NULL DEFAULT 'email',
    opt_in_marketing boolean NOT NULL DEFAULT false,
    opt_in_marketing_em timestamptz,
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT np_canal_check CHECK (canal_preferencial IN ('email', 'whatsapp')),
    -- LGPD: opt-in marketing só é válido com timestamp
    -- de consentimento (§4.2).
    CONSTRAINT np_consentimento_check CHECK (
        opt_in_marketing = false OR opt_in_marketing_em IS NOT NULL
    ),
    CONSTRAINT np_cliente_unique UNIQUE (cliente_id),
    CONSTRAINT np_cliente_fk FOREIGN KEY (cliente_id) REFERENCES cliente(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- EVENTO — normalização do catálogo (§11, decisão fechada)
-- Convenção: `dominio.acao` em pt-BR. Os 11 eventos em
-- inglês são normalizados; catálogo expandido com eventos
-- operacionais novos (§1.2) e marketing opt-in (§1.3).
-- Tabela confirmada VAZIA (read-only) → troca de CHECK
-- sem migração de dados.
-- ------------------------------------------------------------
ALTER TABLE evento DROP CONSTRAINT IF EXISTS evento_nome_check;
ALTER TABLE evento ADD CONSTRAINT evento_nome_check CHECK (nome IN (
    -- pedido
    'pedido.criado', 'pedido.confirmado', 'pedido.enviado',
    'pedido.entregue', 'pedido.cancelado',
    -- pagamento
    'pagamento.confirmado', 'pagamento.recusado', 'pagamento.estornado',
    -- estoque
    'estoque.reservado', 'estoque.liberado', 'estoque.baixo',
    -- atendimento
    'atendimento.criado', 'atendimento.handoff', 'atendimento.mensagem',
    -- agendamento
    'agendamento.criado', 'agendamento.confirmado', 'agendamento.cancelado',
    'agendamento.reagendado', 'agendamento.concluido',
    'agendamento.naousou', 'agendamento.expirado',
    -- orçamento
    'orcamento.enviado', 'orcamento.aceito', 'orcamento.recusado', 'orcamento.expirado',
    -- marketing (opt-in — só com consentimento válido)
    'promocao.publicada', 'campanha.lancada', 'mimo.publicado', 'carrinho.abandonado'
));

-- ============================================================
-- RLS
-- service_role ignora RLS (BYASSRLS) — dispatcher e Edge
-- Functions atuam como service_role; por isso não há políticas
-- TO service_role (seriam no-op).
-- ============================================================

-- NOTIFICACAO (destinatário vê as suas; admin vê todas;
-- escrita/atualização de entrega é do dispatcher)
ALTER TABLE notificacao ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notificacao_read_owner_admin" ON notificacao FOR SELECT TO authenticated
    USING (
        is_admin()
        OR (
            destinatario_tipo = 'cliente' AND
            EXISTS (SELECT 1 FROM cliente WHERE cliente.email = auth.jwt() ->> 'email' AND cliente.id = notificacao.destinatario_cliente_id)
        )
    );
CREATE POLICY "notificacao_update_owner_lido" ON notificacao FOR UPDATE TO authenticated
    USING (
        destinatario_tipo = 'cliente' AND
        EXISTS (SELECT 1 FROM cliente WHERE cliente.email = auth.jwt() ->> 'email' AND cliente.id = notificacao.destinatario_cliente_id)
    )
    WITH CHECK (
        destinatario_tipo = 'cliente' AND lido_em IS NOT NULL AND
        EXISTS (SELECT 1 FROM cliente WHERE cliente.email = auth.jwt() ->> 'email' AND cliente.id = notificacao.destinatario_cliente_id)
    );
-- INSERT/UPDATE de entrega: sem política para authenticated
-- (só service_role, via dispatcher).

-- NOTIFICACAO_TEMPLATE (configuração server-side — admin)
ALTER TABLE notificacao_template ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notificacao_template_admin" ON notificacao_template FOR ALL TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

-- NOTIFICACAO_PREFERENCIA (dono das próprias preferências)
ALTER TABLE notificacao_preferencia ENABLE ROW LEVEL SECURITY;
CREATE POLICY "preferencia_read_own" ON notificacao_preferencia FOR SELECT TO authenticated
    USING (
        EXISTS (SELECT 1 FROM cliente WHERE cliente.email = auth.jwt() ->> 'email' AND cliente.id = notificacao_preferencia.cliente_id)
    );
CREATE POLICY "preferencia_write_own" ON notificacao_preferencia FOR ALL TO authenticated
    USING (
        EXISTS (SELECT 1 FROM cliente WHERE cliente.email = auth.jwt() ->> 'email' AND cliente.id = notificacao_preferencia.cliente_id)
    )
    WITH CHECK (
        EXISTS (SELECT 1 FROM cliente WHERE cliente.email = auth.jwt() ->> 'email' AND cliente.id = notificacao_preferencia.cliente_id)
    );
