-- ============================================================
-- 20261027000001_reconciliacao_schema.sql
-- Reconciliação do schema real com as migrations registradas.
-- Somente CREATE TABLE IF NOT EXISTS e ALTER TABLE ADD COLUMN
-- IF NOT EXISTS. Nenhuma operação destrutiva.
-- ============================================================

-- ------------------------------------------------------------
-- SERVIÇOS E AGENDAMENTO (migration 003)
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS servico (
    id bigserial PRIMARY KEY,
    nome varchar(255) NOT NULL,
    slug varchar(255) NOT NULL UNIQUE,
    descricao text,
    duracao_minutos integer NOT NULL DEFAULT 60,
    preco numeric(10,2) NOT NULL DEFAULT 0,
    ativo boolean NOT NULL DEFAULT true,
    imagem_capa text,
    video text,
    publico_alvo text,
    preparacao text,
    requer_agendamento boolean NOT NULL DEFAULT true,
    requer_confirmacao boolean NOT NULL DEFAULT false,
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS profissional (
    id bigserial PRIMARY KEY,
    nome varchar(255) NOT NULL,
    email varchar(255),
    telefone varchar(50),
    bio text,
    ativo boolean NOT NULL DEFAULT true,
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS profissional_servico (
    profissional_id bigint NOT NULL REFERENCES profissional(id) ON DELETE CASCADE,
    servico_id bigint NOT NULL REFERENCES servico(id) ON DELETE CASCADE,
    PRIMARY KEY (profissional_id, servico_id)
);

CREATE TABLE IF NOT EXISTS agenda (
    id bigserial PRIMARY KEY,
    profissional_id bigint NOT NULL REFERENCES profissional(id) ON DELETE CASCADE,
    dia_semana integer NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
    hora_inicio time NOT NULL,
    hora_fim time NOT NULL,
    ativo boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS agenda_bloqueio (
    id bigserial PRIMARY KEY,
    profissional_id bigint NOT NULL REFERENCES profissional(id) ON DELETE CASCADE,
    data_inicio timestamptz NOT NULL,
    data_fim timestamptz NOT NULL,
    motivo text
);

CREATE TABLE IF NOT EXISTS agendamento (
    id bigserial PRIMARY KEY,
    servico_id bigint NOT NULL REFERENCES servico(id),
    profissional_id bigint REFERENCES profissional(id),
    cliente_id bigint,
    data_hora timestamptz NOT NULL,
    status varchar(50) NOT NULL DEFAULT 'pendente',
    observacoes text,
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE servico ENABLE ROW LEVEL SECURITY;
ALTER TABLE profissional ENABLE ROW LEVEL SECURITY;
ALTER TABLE profissional_servico ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda_bloqueio ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamento ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- MIMOS (migration 005)
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS mimo (
    id bigserial PRIMARY KEY,
    nome varchar(255) NOT NULL,
    slug varchar(255) NOT NULL UNIQUE,
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
    atualizado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mimo_produto (
    mimo_id bigint NOT NULL REFERENCES mimo(id) ON DELETE CASCADE,
    produto_id bigint NOT NULL REFERENCES produto(id) ON DELETE CASCADE,
    PRIMARY KEY (mimo_id, produto_id)
);

ALTER TABLE mimo ENABLE ROW LEVEL SECURITY;
ALTER TABLE mimo_produto ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- ORÇAMENTOS (migration 002 + 006)
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS condicao_pagamento (
    id bigserial PRIMARY KEY,
    nome varchar(255) NOT NULL,
    descricao text,
    ativo boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS desconto_comercial (
    id bigserial PRIMARY KEY,
    orcamento_id bigint,
    tipo varchar(50) NOT NULL,
    valor numeric(10,2) NOT NULL,
    teto_maximo numeric(10,2),
    justificativa text,
    criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orcamento (
    id bigserial PRIMARY KEY,
    cliente_id bigint,
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

ALTER TABLE orcamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE orcamento_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE orcamento_status_historico ENABLE ROW LEVEL SECURITY;
ALTER TABLE condicao_pagamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE desconto_comercial ENABLE ROW LEVEL SECURITY;

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
ALTER TABLE notificacao_template ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificacao_preferencia ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- KIT_COMPOSICAO: adicionar kit_produto_id se ausente
-- ------------------------------------------------------------

ALTER TABLE kit_composicao
    ADD COLUMN IF NOT EXISTS kit_produto_id bigint REFERENCES produto(id);

-- ------------------------------------------------------------
-- ÍNDICES
-- ------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_mimo_janela ON mimo (ativo, inicio, fim);
CREATE INDEX IF NOT EXISTS idx_mimo_produto_produto ON mimo_produto (produto_id);
CREATE INDEX IF NOT EXISTS idx_servico_slug ON servico (slug);
CREATE INDEX IF NOT EXISTS idx_orcamento_cliente ON orcamento (cliente_id);
CREATE INDEX IF NOT EXISTS idx_orcamento_status ON orcamento (status);
CREATE INDEX IF NOT EXISTS idx_notificacao_status ON notificacao (status);
