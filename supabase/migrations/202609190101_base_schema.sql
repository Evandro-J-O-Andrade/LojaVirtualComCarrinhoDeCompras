-- Gate 6.3A — Base Schema Derivation
-- Source: MODELO_DE_DADOS_GATE62.md
-- Project: Angel Cosméticos — E-commerce
-- Status: Derivation only — DO NOT APPLY to Supabase
-- Created: 2026-09-19

-- ============================================================
-- TIER 0: No FK dependencies
-- ============================================================

-- CATEGORIA
CREATE TABLE IF NOT EXISTS categoria (
    id bigserial PRIMARY KEY,
    nome varchar(255) NOT NULL,
    slug varchar(255) NOT NULL,
    ativo boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT categoria_slug_unique UNIQUE (slug),
    CONSTRAINT categoria_ativo_check CHECK (ativo IN (true, false))
);

-- FORNECEDOR
CREATE TABLE IF NOT EXISTS fornecedor (
    id bigserial PRIMARY KEY,
    nome varchar(255) NOT NULL,
    cnpj varchar(20) NOT NULL,
    telefone varchar(20),
    email varchar(255),
    ativo boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT fornecedor_cnpj_unique UNIQUE (cnpj),
    CONSTRAINT fornecedor_ativo_check CHECK (ativo IN (true, false))
);

-- PRODUTO
CREATE TABLE IF NOT EXISTS produto (
    id bigserial PRIMARY KEY,
    nome varchar(255) NOT NULL,
    slug varchar(255) NOT NULL,
    descricao text,
    preco_base decimal(10,2) NOT NULL,
    fornecedor_id bigint,
    ativo boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT produto_slug_unique UNIQUE (slug),
    CONSTRAINT produto_preco_base_positivo CHECK (preco_base >= 0),
    CONSTRAINT produto_ativo_check CHECK (ativo IN (true, false)),
    CONSTRAINT produto_fornecedor_fk FOREIGN KEY (fornecedor_id) REFERENCES fornecedor(id) ON DELETE SET NULL
);

-- PRODUTO_IMAGEM
CREATE TABLE IF NOT EXISTS produto_imagem (
    id bigserial PRIMARY KEY,
    produto_id bigint NOT NULL,
    url text NOT NULL,
    ordem integer NOT NULL DEFAULT 0,
    principal boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT pi_principal_check CHECK (principal IN (true, false)),
    CONSTRAINT pi_produto_fk FOREIGN KEY (produto_id) REFERENCES produto(id) ON DELETE CASCADE
);

-- PRODUTO_CATEGORIA
CREATE TABLE IF NOT EXISTS produto_categoria (
    produto_id bigint NOT NULL,
    categoria_id bigint NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (produto_id, categoria_id),
    CONSTRAINT pc_produto_fk FOREIGN KEY (produto_id) REFERENCES produto(id) ON DELETE CASCADE,
    CONSTRAINT pc_categoria_fk FOREIGN KEY (categoria_id) REFERENCES categoria(id) ON DELETE CASCADE
);

-- PRODUTO_OPCAO_COMPRA
CREATE TABLE IF NOT EXISTS produto_opcao_compra (
    id bigserial PRIMARY KEY,
    produto_id bigint NOT NULL,
    nome varchar(100) NOT NULL,
    tipo varchar(20) NOT NULL,
    preco_proprio decimal(10,2),
    ordem integer NOT NULL DEFAULT 0,
    ativo boolean NOT NULL DEFAULT true,
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT poc_tipo_check CHECK (tipo IN ('quantidade', 'kit', 'custom')),
    CONSTRAINT poc_ativo_check CHECK (ativo IN (true, false)),
    CONSTRAINT poc_produto_fk FOREIGN KEY (produto_id) REFERENCES produto(id) ON DELETE CASCADE
);

-- PRODUTO_OPCAO_VALOR
CREATE TABLE IF NOT EXISTS produto_opcao_valor (
    id bigserial PRIMARY KEY,
    produto_opcao_id bigint NOT NULL,
    valor varchar(100) NOT NULL,
    quantidade integer,
    ordem integer NOT NULL DEFAULT 0,
    ativo boolean NOT NULL DEFAULT true,
    criado_em timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT pov_opcao_valor_unique UNIQUE (produto_opcao_id, valor),
    CONSTRAINT pov_ativo_check CHECK (ativo IN (true, false)),
    CONSTRAINT pov_valor_check CHECK (LENGTH(valor) > 0),
    CONSTRAINT pov_opcao_fk FOREIGN KEY (produto_opcao_id) REFERENCES produto_opcao_compra(id) ON DELETE CASCADE
);

-- PROMOCAO
CREATE TABLE IF NOT EXISTS promocao (
    id bigserial PRIMARY KEY,
    produto_id bigint NOT NULL,
    tipo varchar(20) NOT NULL,
    valor decimal(10,2) NOT NULL,
    data_inicio date NOT NULL,
    data_fim date NOT NULL,
    ativo boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT prom_tipo_check CHECK (tipo IN ('percentual', 'fixo')),
    CONSTRAINT prom_valor_check CHECK (valor >= 0),
    CONSTRAINT prom_data_check CHECK (data_inicio < data_fim),
    CONSTRAINT prom_ativo_check CHECK (ativo IN (true, false)),
    CONSTRAINT prom_produto_fk FOREIGN KEY (produto_id) REFERENCES produto(id) ON DELETE CASCADE
);

-- PRODUTO_ATRIBUTO
CREATE TABLE IF NOT EXISTS produto_atributo (
    id bigserial PRIMARY KEY,
    produto_id bigint NOT NULL,
    nome varchar(50) NOT NULL,
    ordem integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT pa_produto_nome_unique UNIQUE (produto_id, nome),
    CONSTRAINT pa_produto_fk FOREIGN KEY (produto_id) REFERENCES produto(id) ON DELETE CASCADE,
    CONSTRAINT pa_nome_check CHECK (nome IN ('tamanho', 'cor', 'volume'))
);

-- PRODUTO_ATRIBUTO_VALOR
CREATE TABLE IF NOT EXISTS produto_atributo_valor (
    id bigserial PRIMARY KEY,
    produto_atributo_id bigint NOT NULL,
    valor varchar(100) NOT NULL,
    ordem integer NOT NULL DEFAULT 0,
    criado_em timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT pav_attr_valor_unique UNIQUE (produto_atributo_id, valor),
    CONSTRAINT pav_attr_fk FOREIGN KEY (produto_atributo_id) REFERENCES produto_atributo(id) ON DELETE CASCADE
);

-- ============================================================
-- TIER 1: Depends on Tier 0
-- ============================================================

-- PRODUTO_VARIANTE
CREATE TABLE IF NOT EXISTS produto_variante (
    id bigserial PRIMARY KEY,
    produto_id bigint NOT NULL,
    sku varchar(100) NOT NULL,
    preco decimal(10,2) NOT NULL,
    ativo boolean NOT NULL DEFAULT true,
    peso decimal(10,3),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT pv_sku_unique UNIQUE (sku),
    CONSTRAINT pv_preco_positivo CHECK (preco >= 0),
    CONSTRAINT pv_ativo_check CHECK (ativo IN (true, false)),
    CONSTRAINT pv_produto_fk FOREIGN KEY (produto_id) REFERENCES produto(id) ON DELETE CASCADE
);

-- PRODUTO_VARIANTE_ATRIBUTO
CREATE TABLE IF NOT EXISTS produto_variante_atributo (
    id bigserial PRIMARY KEY,
    produto_variante_id bigint NOT NULL,
    produto_atributo_valor_id bigint NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT pva_unique UNIQUE (produto_variante_id, produto_atributo_valor_id),
    CONSTRAINT pva_vvariante_fk FOREIGN KEY (produto_variante_id) REFERENCES produto_variante(id) ON DELETE CASCADE,
    CONSTRAINT pva_valor_fk FOREIGN KEY (produto_atributo_valor_id) REFERENCES produto_atributo_valor(id) ON DELETE CASCADE
);

-- KIT_COMPOSICAO
CREATE TABLE IF NOT EXISTS kit_composicao (
    id bigserial PRIMARY KEY,
    produto_opcao_id bigint NOT NULL,
    produto_id bigint NOT NULL,
    variante_id bigint,
    quantidade integer NOT NULL,
    ordem integer NOT NULL DEFAULT 0,
    ativo boolean NOT NULL DEFAULT true,
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT kc_quantidade_check CHECK (quantidade > 0),
    CONSTRAINT kc_ativo_check CHECK (ativo IN (true, false)),
    CONSTRAINT kc_opcao_fk FOREIGN KEY (produto_opcao_id) REFERENCES produto_opcao_compra(id) ON DELETE CASCADE,
    CONSTRAINT kc_produto_fk FOREIGN KEY (produto_id) REFERENCES produto(id) ON DELETE CASCADE,
    CONSTRAINT kc_variente_fk FOREIGN KEY (variante_id) REFERENCES produto_variante(id) ON DELETE SET NULL
);

-- ============================================================
-- TIER 2: Cliente and Endereco
-- ============================================================

-- CLIENTE
CREATE TABLE IF NOT EXISTS cliente (
    id bigserial PRIMARY KEY,
    nome varchar(255) NOT NULL,
    email varchar(255) NOT NULL,
    telefone varchar(20),
    cpf varchar(14),
    data_nascimento date,
    ativo boolean NOT NULL DEFAULT true,
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT cliente_email_unique UNIQUE (email),
    CONSTRAINT cliente_ativo_check CHECK (ativo IN (true, false))
);

-- ENDERECO
CREATE TABLE IF NOT EXISTS endereco (
    id bigserial PRIMARY KEY,
    cliente_id bigint,
    logradouro varchar(255) NOT NULL,
    numero varchar(10) NOT NULL,
    complemento varchar(100),
    bairro varchar(100) NOT NULL,
    cidade varchar(100) NOT NULL,
    uf char(2) NOT NULL,
    cep varchar(8) NOT NULL,
    principal boolean NOT NULL DEFAULT false,
    ativo boolean NOT NULL DEFAULT true,
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT end_cep_check CHECK (cep ~ '^[0-9]{8}$'),
    CONSTRAINT end_ativo_check CHECK (ativo IN (true, false)),
    CONSTRAINT end_cliente_fk FOREIGN KEY (cliente_id) REFERENCES cliente(id) ON DELETE CASCADE
);

-- CARRINHO
CREATE TABLE IF NOT EXISTS carrinho (
    id bigserial PRIMARY KEY,
    cliente_id bigint,
    session_id text,
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT car_cliente_fk FOREIGN KEY (cliente_id) REFERENCES cliente(id) ON DELETE SET NULL
);

-- CARRINHO_ITEM
CREATE TABLE IF NOT EXISTS carrinho_item (
    id bigserial PRIMARY KEY,
    carrinho_id bigint NOT NULL,
    produto_id bigint NOT NULL,
    produto_variante_id bigint,
    produto_opcao_compra_id bigint,
    kit_composicao_id bigint,
    nome_produto varchar(255) NOT NULL,
    atributos_texto text,
    opcao_texto text,
    kit_texto text,
    quantidade integer NOT NULL DEFAULT 1,
    quantidade_pacotes integer NOT NULL DEFAULT 1,
    preco_unitario decimal(10,2) NOT NULL,
    total decimal(10,2) NOT NULL,
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT ci_quantidade_check CHECK (quantidade > 0),
    CONSTRAINT ci_preco_check CHECK (preco_unitario >= 0),
    CONSTRAINT ci_total_check CHECK (total >= 0),
    CONSTRAINT ci_carrinho_fk FOREIGN KEY (carrinho_id) REFERENCES carrinho(id) ON DELETE CASCADE,
    CONSTRAINT ci_produto_fk FOREIGN KEY (produto_id) REFERENCES produto(id) ON DELETE CASCADE,
    CONSTRAINT ci_variente_fk FOREIGN KEY (produto_variante_id) REFERENCES produto_variante(id) ON DELETE SET NULL,
    CONSTRAINT ci_opcao_fk FOREIGN KEY (produto_opcao_compra_id) REFERENCES produto_opcao_compra(id) ON DELETE SET NULL,
    CONSTRAINT ci_kit_fk FOREIGN KEY (kit_composicao_id) REFERENCES kit_composicao(id) ON DELETE SET NULL
);

-- FRETE_REGRA
CREATE TABLE IF NOT EXISTS frete_regra (
    id bigserial PRIMARY KEY,
    cep_inicio varchar(8),
    cep_fim varchar(8),
    uf char(2),
    regiao varchar(50),
    tipo varchar(20) NOT NULL DEFAULT 'fixo',
    valor decimal(10,2) NOT NULL DEFAULT 0,
    subtotal_minimo decimal(10,2) NOT NULL DEFAULT 0,
    peso_maximo decimal(10,2),
    ativo boolean NOT NULL DEFAULT true,
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT fr_tipo_check CHECK (tipo IN ('fixo', 'por_kg', 'percentual_subtotal', 'gratis')),
    CONSTRAINT fr_valor_check CHECK (valor >= 0),
    CONSTRAINT fr_subtotal_check CHECK (subtotal_minimo >= 0),
    CONSTRAINT fr_ativo_check CHECK (ativo IN (true, false))
);

-- PEDIDO
CREATE TABLE IF NOT EXISTS pedido (
    id bigserial PRIMARY KEY,
    numero varchar(50) NOT NULL,
    cliente_id bigint NOT NULL,
    origem varchar(10) NOT NULL DEFAULT 'site',
    status varchar(20) NOT NULL DEFAULT 'rascunho',
    endereco_entrega_id bigint NOT NULL,
    endereco_nome varchar(255) NOT NULL,
    endereco_logradouro varchar(255) NOT NULL,
    endereco_numero varchar(10) NOT NULL,
    endereco_complemento varchar(100),
    endereco_bairro varchar(100) NOT NULL,
    endereco_cidade varchar(100) NOT NULL,
    endereco_uf char(2) NOT NULL,
    endereco_cep varchar(8) NOT NULL,
    frete_regra_id bigint,
    frete_valor decimal(10,2) NOT NULL DEFAULT 0,
    subtotal decimal(10,2) NOT NULL DEFAULT 0,
    desconto_total decimal(10,2) NOT NULL DEFAULT 0,
    total decimal(10,2) NOT NULL DEFAULT 0,
    observacoes text,
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now(),
    metodo_pagamento varchar(10) NOT NULL,
    status_pagamento varchar(15) NOT NULL DEFAULT 'pendente',
    pagamento_id bigint,
    pago_em timestamptz,
    CONSTRAINT pedido_numero_unique UNIQUE (numero),
    CONSTRAINT ped_origem_check CHECK (origem IN ('site', 'whatsapp')),
    CONSTRAINT ped_status_check CHECK (status IN ('rascunho', 'processando', 'enviado', 'entregue', 'cancelado')),
    CONSTRAINT ped_status_pagamento_check CHECK (status_pagamento IN ('pendente', 'aprovado', 'recusado')),
    CONSTRAINT ped_metodo_check CHECK (metodo_pagamento IN ('pix', 'cartao')),
    CONSTRAINT ped_valores_check CHECK (subtotal >= 0 AND frete_valor >= 0 AND desconto_total >= 0 AND total >= 0),
    CONSTRAINT ped_cliente_fk FOREIGN KEY (cliente_id) REFERENCES cliente(id),
    CONSTRAINT ped_endereco_fk FOREIGN KEY (endereco_entrega_id) REFERENCES endereco(id) ON DELETE RESTRICT,
    CONSTRAINT ped_frete_fk FOREIGN KEY (frete_regra_id) REFERENCES frete_regra(id) ON DELETE SET NULL
);

-- PAGAMENTO
CREATE TABLE IF NOT EXISTS pagamento (
    id bigserial PRIMARY KEY,
    pedido_id bigint NOT NULL,
    metodo varchar(10) NOT NULL,
    status varchar(15) NOT NULL DEFAULT 'pendente',
    valor decimal(10,2) NOT NULL,
    transaction_id varchar(100),
    provider varchar(50),
    dados_externos jsonb,
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now(),
    confirmado_em timestamptz,
    CONSTRAINT pag_metodo_check CHECK (metodo IN ('pix', 'cartao')),
    CONSTRAINT pag_status_check CHECK (status IN ('pendente', 'aprovado', 'recusado')),
    CONSTRAINT pag_valor_check CHECK (valor > 0),
    CONSTRAINT pag_pedido_unique UNIQUE (pedido_id),
    CONSTRAINT pag_pedido_fk FOREIGN KEY (pedido_id) REFERENCES pedido(id) ON DELETE RESTRICT
);

-- PEDIDO_STATUS_HISTORICO
CREATE TABLE IF NOT EXISTS pedido_status_historico (
    id bigserial PRIMARY KEY,
    pedido_id bigint NOT NULL,
    status_anterior varchar(20),
    status_novo varchar(20) NOT NULL,
    canal varchar(10),
    usuario_id bigint,
    criado_em timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT psh_novo_check CHECK (status_novo IN ('rascunho', 'processando', 'enviado', 'entregue', 'cancelado')),
    CONSTRAINT psh_pedido_fk FOREIGN KEY (pedido_id) REFERENCES pedido(id) ON DELETE CASCADE
);

-- PEDIDO_ITEM
CREATE TABLE IF NOT EXISTS pedido_item (
    id bigserial PRIMARY KEY,
    pedido_id bigint NOT NULL,
    produto_id bigint NOT NULL,
    produto_variante_id bigint,
    produto_opcao_compra_id bigint,
    kit_composicao_id bigint,
    nome_produto varchar(255) NOT NULL,
    sku varchar(100),
    atributos_texto text,
    opcao_texto text,
    kit_composicao_texto text,
    quantidade integer NOT NULL,
    preco_unitario decimal(10,2) NOT NULL,
    desconto_unitario decimal(10,2) NOT NULL DEFAULT 0,
    subtotal decimal(10,2) NOT NULL,
    total decimal(10,2) NOT NULL,
    criado_em timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT pi_quantidade_check CHECK (quantidade > 0),
    CONSTRAINT pi_preco_check CHECK (preco_unitario >= 0),
    CONSTRAINT pi_total_check CHECK (total >= 0),
    CONSTRAINT pi_pedido_fk FOREIGN KEY (pedido_id) REFERENCES pedido(id) ON DELETE CASCADE,
    CONSTRAINT pi_produto_fk FOREIGN KEY (produto_id) REFERENCES produto(id) ON DELETE RESTRICT,
    CONSTRAINT pi_variente_fk FOREIGN KEY (produto_variante_id) REFERENCES produto_variante(id) ON DELETE SET NULL,
    CONSTRAINT pi_opcao_fk FOREIGN KEY (produto_opcao_compra_id) REFERENCES produto_opcao_compra(id) ON DELETE SET NULL,
    CONSTRAINT pi_kit_fk FOREIGN KEY (kit_composicao_id) REFERENCES kit_composicao(id) ON DELETE SET NULL
);

-- ESTOQUE
CREATE TABLE IF NOT EXISTS estoque (
    id bigserial PRIMARY KEY,
    produto_id bigint,
    produto_variante_id bigint,
    quantidade_fisica integer NOT NULL DEFAULT 0,
    quantidade_reservada integer NOT NULL DEFAULT 0,
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT est_quantidade_fisica_check CHECK (quantidade_fisica >= 0),
    CONSTRAINT est_quantidade_reservada_check CHECK (quantidade_reservada >= 0 AND quantidade_reservada <= quantidade_fisica),
    CONSTRAINT est_produto_fk FOREIGN KEY (produto_id) REFERENCES produto(id) ON DELETE CASCADE,
    CONSTRAINT est_variente_fk FOREIGN KEY (produto_variante_id) REFERENCES produto_variante(id) ON DELETE CASCADE,
    CONSTRAINT est_unico_por_tipo CHECK (
        (produto_id IS NOT NULL) OR (produto_variante_id IS NOT NULL)
    ),
    CONSTRAINT est_no_maximo_um CHECK (
        (produto_id IS NULL) OR (produto_variante_id IS NULL)
    )
);

-- ESTOQUE_MOVIMENTACAO
CREATE TABLE IF NOT EXISTS estoque_movimentacao (
    id bigserial PRIMARY KEY,
    estoque_id bigint NOT NULL,
    produto_id bigint,
    produto_variante_id bigint,
    tipo varchar(20) NOT NULL,
    quantidade integer NOT NULL,
    quantidade_anterior integer NOT NULL,
    quantidade_nova integer NOT NULL,
    pedido_id bigint,
    canal varchar(10),
    observacao text,
    criado_em timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT em_tipo_check CHECK (tipo IN ('entrada', 'saida_venda', 'reserva', 'cancelamento_reserva', 'cancelamento_venda', 'devolucao', 'ajuste')),
    CONSTRAINT em_quantidade_check CHECK (quantidade != 0),
    CONSTRAINT em_quantidade_nova_check CHECK (quantidade_nova >= 0),
    CONSTRAINT em_estoque_fk FOREIGN KEY (estoque_id) REFERENCES estoque(id) ON DELETE RESTRICT,
    CONSTRAINT em_pedido_fk FOREIGN KEY (pedido_id) REFERENCES pedido(id) ON DELETE SET NULL,
    CONSTRAINT em_produto_fk FOREIGN KEY (produto_id) REFERENCES produto(id) ON DELETE SET NULL,
    CONSTRAINT em_variente_fk FOREIGN KEY (produto_variante_id) REFERENCES produto_variante(id) ON DELETE SET NULL
);

-- ATENDIMENTO
CREATE TABLE IF NOT EXISTS atendimento (
    id bigserial PRIMARY KEY,
    cliente_id bigint,
    pedido_id bigint,
    tipo varchar(20) NOT NULL,
    canal varchar(20) NOT NULL,
    status varchar(20) NOT NULL DEFAULT 'aberto',
    assunto varchar(255),
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now(),
    encerrado_em timestamptz,
    CONSTRAINT at_tipo_check CHECK (tipo IN ('chatbot', 'humano', 'handoff')),
    CONSTRAINT at_canal_check CHECK (canal IN ('site', 'whatsapp')),
    CONSTRAINT at_status_check CHECK (status IN ('aberto', 'em_andamento', 'encerrado')),
    CONSTRAINT at_cliente_fk FOREIGN KEY (cliente_id) REFERENCES cliente(id) ON DELETE SET NULL,
    CONSTRAINT at_pedido_fk FOREIGN KEY (pedido_id) REFERENCES pedido(id) ON DELETE SET NULL
);

-- ATENDIMENTO_MENSAGEM
CREATE TABLE IF NOT EXISTS atendimento_mensagem (
    id bigserial PRIMARY KEY,
    atendimento_id bigint NOT NULL,
    remetente varchar(20) NOT NULL,
    tipo varchar(20) NOT NULL,
    conteudo text NOT NULL,
    criado_em timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT am_remetente_check CHECK (remetente IN ('cliente', 'atendente', 'chatbot')),
    CONSTRAINT am_tipo_check CHECK (tipo IN ('texto', 'imagem', 'documento', 'sistema')),
    CONSTRAINT am_atendimento_fk FOREIGN KEY (atendimento_id) REFERENCES atendimento(id) ON DELETE CASCADE
);

-- EVENTO
CREATE TABLE IF NOT EXISTS evento (
    id bigserial PRIMARY KEY,
    idempotency_key varchar(255),
    nome varchar(50) NOT NULL,
    entidade_tipo varchar(30) NOT NULL,
    entidade_id bigint NOT NULL,
    dados jsonb,
    status varchar(20) NOT NULL DEFAULT 'pendente',
    processado_em timestamptz,
    tentativas integer NOT NULL DEFAULT 0,
    criado_em timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT evento_nome_check CHECK (nome IN ('order.created', 'order.confirmed', 'payment.paid', 'payment.refused', 'order.shipped', 'order.delivered', 'order.canceled', 'stock.reserved', 'stock.released', 'support.requested', 'support.handoff')),
    CONSTRAINT evento_status_check CHECK (status IN ('pendente', 'processado', 'falhou')),
    CONSTRAINT evento_tentativas_check CHECK (tentativas >= 0)
);

-- AUDITORIA
CREATE TABLE IF NOT EXISTS auditoria (
    id bigserial PRIMARY KEY,
    entidade_tipo varchar(30) NOT NULL,
    entidade_id bigint NOT NULL,
    campo varchar(100) NOT NULL,
    valor_anterior text,
    valor_novo text NOT NULL,
    usuario_id bigint NOT NULL,
    ip inet,
    acao varchar(20) NOT NULL,
    criado_em timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT aud_acao_check CHECK (acao IN ('create', 'update', 'delete', 'view'))
);

-- ============================================================
-- ALTER TABLE — FK pós-criação (resolução de referências circulares)
-- ============================================================

ALTER TABLE pedido ADD CONSTRAINT ped_pagamento_fk FOREIGN KEY (pagamento_id) REFERENCES pagamento(id) ON DELETE SET NULL;
