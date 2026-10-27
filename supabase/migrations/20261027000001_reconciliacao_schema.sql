-- ============================================================
-- 20261027000001_reconciliacao_schema.sql
-- Reconciliação do schema real com as migrations registradas.
-- Preserva contratos originais: campos, constraints, RLS, views.
-- Idempotente: CREATE TABLE IF NOT EXISTS, ADD COLUMN IF NOT EXISTS,
-- CREATE POLICY via DO $do$ ... EXCEPTION WHEN duplicate_object.
-- Nenhuma operação destrutiva.
-- ============================================================

-- ------------------------------------------------------------
-- SERVIÇOS E AGENDAMENTO (migration 003)
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS servico (
    id bigserial PRIMARY KEY,
    nome varchar(255) NOT NULL,
    slug varchar(255) NOT NULL,
    descricao text,
    duracao_minutos integer NOT NULL,
    preco decimal(10,2),
    ativo boolean NOT NULL DEFAULT true,
    imagem_capa text,
    video text,
    publico_alvo text,
    preparacao text,
    requer_agendamento boolean NOT NULL DEFAULT true,
    requer_confirmacao boolean NOT NULL DEFAULT true,
    buffer_minutos integer NOT NULL DEFAULT 15,
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT se_slug_unique UNIQUE (slug),
    CONSTRAINT se_duracao_check CHECK (duracao_minutos > 0),
    CONSTRAINT se_preco_check CHECK (preco IS NULL OR preco >= 0),
    CONSTRAINT se_buffer_check CHECK (buffer_minutos >= 0),
    CONSTRAINT se_ativo_check CHECK (ativo IN (true, false))
);

CREATE TABLE IF NOT EXISTS profissional (
    id bigserial PRIMARY KEY,
    user_id uuid NOT NULL,
    nome varchar(255) NOT NULL,
    telefone varchar(20),
    email varchar(255),
    ativo boolean NOT NULL DEFAULT true,
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT pr_user_unique UNIQUE (user_id),
    CONSTRAINT pr_ativo_check CHECK (ativo IN (true, false)),
    CONSTRAINT pr_user_fk FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE OR REPLACE VIEW profissional_publico (id, nome) WITH (security_invoker = true) AS
    SELECT id, nome FROM profissional WHERE ativo = true;

CREATE TABLE IF NOT EXISTS profissional_servico (
    profissional_id bigint NOT NULL,
    servico_id bigint NOT NULL,
    criado_em timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT ps_pk PRIMARY KEY (profissional_id, servico_id),
    CONSTRAINT ps_profissional_fk FOREIGN KEY (profissional_id) REFERENCES profissional(id) ON DELETE CASCADE,
    CONSTRAINT ps_servico_fk FOREIGN KEY (servico_id) REFERENCES servico(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS agenda (
    id bigserial PRIMARY KEY,
    profissional_id bigint NOT NULL,
    dia_semana integer NOT NULL,
    horario_inicio time NOT NULL,
    horario_fim time NOT NULL,
    ativo boolean NOT NULL DEFAULT true,
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT ag_dia_check CHECK (dia_semana BETWEEN 0 AND 6),
    CONSTRAINT ag_horario_check CHECK (horario_fim > horario_inicio),
    CONSTRAINT ag_ativo_check CHECK (ativo IN (true, false)),
    CONSTRAINT ag_unico UNIQUE (profissional_id, dia_semana, horario_inicio, horario_fim),
    CONSTRAINT ag_profissional_fk FOREIGN KEY (profissional_id) REFERENCES profissional(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS agenda_bloqueio (
    id bigserial PRIMARY KEY,
    profissional_id bigint,
    data date NOT NULL,
    tipo varchar(20) NOT NULL,
    motivo varchar(255),
    criado_em timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT ab_tipo_check CHECK (tipo IN ('bloqueio', 'feriado', 'indisponibilidade')),
    CONSTRAINT ab_profissional_fk FOREIGN KEY (profissional_id) REFERENCES profissional(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS agendamento (
    id bigserial PRIMARY KEY,
    cliente_id bigint,
    servico_id bigint NOT NULL,
    profissional_id bigint NOT NULL,
    data date NOT NULL,
    horario_inicio time NOT NULL,
    horario_fim time NOT NULL,
    inicio timestamptz NOT NULL,
    fim timestamptz NOT NULL,
    duracao_minutos integer NOT NULL,
    buffer_minutos integer NOT NULL DEFAULT 15,
    protocolo varchar(20) NOT NULL,
    status varchar(20) NOT NULL DEFAULT 'solicitado',
    origem varchar(10) NOT NULL DEFAULT 'site',
    observacao text,
    contato_nome varchar(255),
    contato_telefone varchar(20),
    contato_email varchar(255),
    agendamento_origem_id bigint,
    agendamento_substituto_id bigint,
    confirmado_em timestamptz,
    concluido_em timestamptz,
    cancelado_em timestamptz,
    motivo_cancelamento text,
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now(),
    periodo tstzrange GENERATED ALWAYS AS (tstzrange(inicio, fim, '[)')) STORED,
    CONSTRAINT agm_status_check CHECK (status IN ('solicitado', 'confirmado', 'concluido', 'cancelado', 'nao_compareceu', 'reagendado', 'expirado')),
    CONSTRAINT agm_origem_check CHECK (origem IN ('site', 'whatsapp', 'admin')),
    CONSTRAINT agm_duracao_check CHECK (duracao_minutos > 0),
    CONSTRAINT agm_buffer_check CHECK (buffer_minutos >= 0),
    CONSTRAINT agm_horario_check CHECK (fim > inicio),
    CONSTRAINT agm_horario_dia_check CHECK (horario_fim > horario_inicio),
    CONSTRAINT agm_protocolo_unique UNIQUE (protocolo),
    CONSTRAINT agm_protocolo_formato_check CHECK (protocolo ~ '^AG-[0-9]{8}-[0-9]{6}$'),
    CONSTRAINT agm_cliente_fk FOREIGN KEY (cliente_id) REFERENCES cliente(id) ON DELETE SET NULL,
    CONSTRAINT agm_servico_fk FOREIGN KEY (servico_id) REFERENCES servico(id),
    CONSTRAINT agm_profissional_fk FOREIGN KEY (profissional_id) REFERENCES profissional(id),
    CONSTRAINT agm_origem_fk FOREIGN KEY (agendamento_origem_id) REFERENCES agendamento(id),
    CONSTRAINT agm_substituto_fk FOREIGN KEY (agendamento_substituto_id) REFERENCES agendamento(id),
    CONSTRAINT agendamento_sem_sobreposicao
        EXCLUDE USING gist (profissional_id WITH =, periodo WITH &&)
        WHERE (status IN ('solicitado', 'confirmado'))
);

-- RLS para serviços
ALTER TABLE servico ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "servico_read_active" ON servico;
CREATE POLICY "servico_read_active" ON servico FOR SELECT TO anon USING (ativo = true);
DROP POLICY IF EXISTS "servico_write_admin" ON servico;
CREATE POLICY "servico_write_admin" ON servico FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

ALTER TABLE profissional ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profissional_read_active" ON profissional;
CREATE POLICY "profissional_read_active" ON profissional FOR SELECT TO anon, authenticated USING (ativo = true);
DROP POLICY IF EXISTS "profissional_write_admin" ON profissional;
CREATE POLICY "profissional_write_admin" ON profissional FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

ALTER TABLE profissional_servico ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profissional_servico_read" ON profissional_servico;
CREATE POLICY "profissional_servico_read" ON profissional_servico FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "profissional_servico_write_admin" ON profissional_servico;
CREATE POLICY "profissional_servico_write_admin" ON profissional_servico FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

ALTER TABLE agenda ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "agenda_read_active" ON agenda;
CREATE POLICY "agenda_read_active" ON agenda FOR SELECT TO anon USING (ativo = true);
DROP POLICY IF EXISTS "agenda_write_admin" ON agenda;
CREATE POLICY "agenda_write_admin" ON agenda FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

ALTER TABLE agenda_bloqueio ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "agenda_bloqueio_read" ON agenda_bloqueio;
CREATE POLICY "agenda_bloqueio_read" ON agenda_bloqueio FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "agenda_bloqueio_write_admin" ON agenda_bloqueio;
CREATE POLICY "agenda_bloqueio_write_admin" ON agenda_bloqueio FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

ALTER TABLE agendamento ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "agendamento_read_owner_admin" ON agendamento;
CREATE POLICY "agendamento_read_owner_admin" ON agendamento FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM cliente WHERE cliente.email = auth.jwt() ->> 'email' AND cliente.id = agendamento.cliente_id) OR is_admin());
DROP POLICY IF EXISTS "agendamento_insert_owner" ON agendamento;
CREATE POLICY "agendamento_insert_owner" ON agendamento FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM cliente WHERE cliente.email = auth.jwt() ->> 'email' AND cliente.id = agendamento.cliente_id));
DROP POLICY IF EXISTS "agendamento_update_owner" ON agendamento;
CREATE POLICY "agendamento_update_owner" ON agendamento FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM cliente WHERE cliente.email = auth.jwt() ->> 'email' AND cliente.id = agendamento.cliente_id)) WITH CHECK (EXISTS (SELECT 1 FROM cliente WHERE cliente.email = auth.jwt() ->> 'email' AND cliente.id = agendamento.cliente_id) AND (status = 'solicitado' OR (status = 'cancelado' AND inicio > now() + interval '24 hours')));
DROP POLICY IF EXISTS "agendamento_update_admin" ON agendamento;
CREATE POLICY "agendamento_update_admin" ON agendamento FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());

GRANT SELECT ON profissional_publico TO anon, authenticated;

-- ------------------------------------------------------------
-- MIMOS (migration 005)
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS mimo (
    id bigserial PRIMARY KEY,
    nome varchar(255) NOT NULL,
    slug varchar(255) NOT NULL,
    titulo varchar(255),
    descricao text,
    contexto varchar(50),
    imagem text,
    video text,
    kit_produto_id bigint REFERENCES produto(id) ON DELETE SET NULL,
    promocao_id bigint REFERENCES promocao(id) ON DELETE SET NULL,
    categoria_id bigint REFERENCES categoria(id) ON DELETE SET NULL,
    ativo boolean NOT NULL DEFAULT true,
    inicio date NOT NULL,
    fim date NOT NULL,
    ordem integer NOT NULL DEFAULT 0,
    seo_titulo varchar(255),
    seo_descricao text,
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT mi_slug_unique UNIQUE (slug)
);

CREATE TABLE IF NOT EXISTS mimo_produto (
    mimo_id bigint NOT NULL REFERENCES mimo(id) ON DELETE CASCADE,
    produto_id bigint NOT NULL REFERENCES produto(id) ON DELETE CASCADE,
    ordem integer NOT NULL DEFAULT 0,
    PRIMARY KEY (mimo_id, produto_id)
);

ALTER TABLE mimo ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "mimo_read_publicado" ON mimo;
CREATE POLICY "mimo_read_publicado" ON mimo FOR SELECT TO anon USING (ativo = true AND inicio <= CURRENT_DATE AND fim >= CURRENT_DATE);
DROP POLICY IF EXISTS "mimo_read_admin" ON mimo;
CREATE POLICY "mimo_read_admin" ON mimo FOR SELECT TO authenticated USING (is_admin());
DROP POLICY IF EXISTS "mimo_write_admin" ON mimo;
CREATE POLICY "mimo_write_admin" ON mimo FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

ALTER TABLE mimo_produto ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "mimo_produto_read" ON mimo_produto;
CREATE POLICY "mimo_produto_read" ON mimo_produto FOR SELECT TO anon USING (EXISTS (SELECT 1 FROM mimo m WHERE m.id = mimo_produto.mimo_id AND m.ativo = true AND m.inicio <= CURRENT_DATE AND m.fim >= CURRENT_DATE));
DROP POLICY IF EXISTS "mimo_produto_write_admin" ON mimo_produto;
CREATE POLICY "mimo_produto_write_admin" ON mimo_produto FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

CREATE INDEX IF NOT EXISTS idx_mimo_janela ON mimo (ativo, inicio, fim);
CREATE INDEX IF NOT EXISTS idx_mimo_produto_produto ON mimo_produto (produto_id);

-- ------------------------------------------------------------
-- ORÇAMENTOS (migration 002 + 006)
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS condicao_pagamento (
    id bigserial PRIMARY KEY,
    nome varchar(255) NOT NULL,
    descricao text,
    ativo boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS orcamento (
    id bigserial PRIMARY KEY,
    cliente_id bigint REFERENCES cliente(id),
    status varchar(50) NOT NULL DEFAULT 'rascunho',
    subtotal numeric(10,2) NOT NULL DEFAULT 0,
    desconto_total numeric(10,2) NOT NULL DEFAULT 0,
    frete numeric(10,2) NOT NULL DEFAULT 0,
    total numeric(10,2) NOT NULL DEFAULT 0,
    validade date,
    metodo_pagamento varchar(50),
    parcelas integer,
    observacoes text,
    pedido_id bigint,
    condicao_pagamento_id bigint REFERENCES condicao_pagamento(id),
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orcamento_item (
    id bigserial PRIMARY KEY,
    orcamento_id bigint NOT NULL REFERENCES orcamento(id) ON DELETE CASCADE,
    produto_id bigint NOT NULL REFERENCES produto(id),
    produto_variante_id bigint,
    quantidade integer NOT NULL DEFAULT 1,
    preco_unitario numeric(10,2) NOT NULL DEFAULT 0,
    atributos_texto text
);

CREATE TABLE IF NOT EXISTS orcamento_status_historico (
    id bigserial PRIMARY KEY,
    orcamento_id bigint NOT NULL REFERENCES orcamento(id) ON DELETE CASCADE,
    status_anterior varchar(50),
    status_novo varchar(50) NOT NULL,
    criado_em timestamptz NOT NULL DEFAULT now(),
    ator_auth_id uuid
);

CREATE TABLE IF NOT EXISTS desconto_comercial (
    id bigserial PRIMARY KEY,
    orcamento_id bigint REFERENCES orcamento(id) ON DELETE CASCADE,
    tipo varchar(50) NOT NULL,
    valor numeric(10,2) NOT NULL,
    teto_maximo numeric(10,2),
    justificativa text,
    criado_em timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE orcamento ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "orcamento_read_own" ON orcamento;
CREATE POLICY "orcamento_read_own" ON orcamento FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM cliente WHERE cliente.email = auth.jwt() ->> 'email' AND cliente.id = orcamento.cliente_id) OR is_admin());
DROP POLICY IF EXISTS "orcamento_write_admin" ON orcamento;
CREATE POLICY "orcamento_write_admin" ON orcamento FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

ALTER TABLE orcamento_item ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "orcamento_item_read" ON orcamento_item;
CREATE POLICY "orcamento_item_read" ON orcamento_item FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM orcamento o WHERE o.id = orcamento_item.orcamento_id AND (EXISTS (SELECT 1 FROM cliente WHERE cliente.email = auth.jwt() ->> 'email' AND cliente.id = o.cliente_id) OR is_admin())));

ALTER TABLE orcamento_status_historico ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "orcamento_historico_read" ON orcamento_status_historico;
CREATE POLICY "orcamento_historico_read" ON orcamento_status_historico FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM orcamento o WHERE o.id = orcamento_status_historico.orcamento_id AND (EXISTS (SELECT 1 FROM cliente WHERE cliente.email = auth.jwt() ->> 'email' AND cliente.id = o.cliente_id) OR is_admin())));

CREATE INDEX IF NOT EXISTS idx_orcamento_cliente ON orcamento (cliente_id);
CREATE INDEX IF NOT EXISTS idx_orcamento_status ON orcamento (status);

-- ------------------------------------------------------------
-- NOTIFICAÇÕES (migration 004)
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS notificacao_template (
    id bigserial PRIMARY KEY,
    nome varchar(255) NOT NULL,
    tipo varchar(50) NOT NULL,
    assunto varchar(255),
    corpo text,
    ativo boolean NOT NULL DEFAULT true,
    criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notificacao (
    id bigserial PRIMARY KEY,
    template_id bigint REFERENCES notificacao_template(id),
    destinatario_email varchar(255),
    status varchar(50) NOT NULL DEFAULT 'pendente',
    criado_em timestamptz NOT NULL DEFAULT now(),
    enviado_em timestamptz
);

CREATE TABLE IF NOT EXISTS notificacao_preferencia (
    id bigserial PRIMARY KEY,
    cliente_id bigint,
    canal varchar(50) NOT NULL DEFAULT 'email',
    ativo boolean NOT NULL DEFAULT true
);

ALTER TABLE notificacao ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notificacao_read_admin" ON notificacao;
CREATE POLICY "notificacao_read_admin" ON notificacao FOR SELECT TO authenticated USING (is_admin());
DROP POLICY IF EXISTS "notificacao_write_admin" ON notificacao;
CREATE POLICY "notificacao_write_admin" ON notificacao FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

ALTER TABLE notificacao_template ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notificacao_template_read" ON notificacao_template;
CREATE POLICY "notificacao_template_read" ON notificacao_template FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "notificacao_template_write_admin" ON notificacao_template;
CREATE POLICY "notificacao_template_write_admin" ON notificacao_template FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- ------------------------------------------------------------
-- KIT_COMPOSICAO: adicionar kit_produto_id se ausente
-- ------------------------------------------------------------

ALTER TABLE kit_composicao
    ADD COLUMN IF NOT EXISTS kit_produto_id bigint REFERENCES produto(id);

CREATE INDEX IF NOT EXISTS idx_mimo_janela ON mimo (ativo, inicio, fim);
CREATE INDEX IF NOT EXISTS idx_mimo_produto_produto ON mimo_produto (produto_id);
CREATE INDEX IF NOT EXISTS idx_servico_slug ON servico (slug);
CREATE INDEX IF NOT EXISTS idx_orcamento_cliente ON orcamento (cliente_id);
CREATE INDEX IF NOT EXISTS idx_orcamento_status ON orcamento (status);
CREATE INDEX IF NOT EXISTS idx_notificacao_status ON notificacao (status);
