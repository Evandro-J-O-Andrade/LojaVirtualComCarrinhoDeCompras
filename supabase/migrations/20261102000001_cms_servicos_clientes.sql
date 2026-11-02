-- Migration: CMS, Experiências, Serviços e Clientes
-- Fase 2-4 do plano AS-IS → TO-BE Angel Cosméticos
-- Cria estruturas ausentes sem duplicar tabelas existentes.
-- Reutiliza: servico, cliente, endereco, atendimento, mimo

-- ============================================================
-- CMS: Páginas dinâmicas
-- ============================================================
CREATE TABLE IF NOT EXISTS pagina (
  id bigserial PRIMARY KEY,
  titulo varchar(255) NOT NULL,
  slug varchar(255) NOT NULL,
  resumo text,
  conteudo text,
  status varchar(20) NOT NULL DEFAULT 'rascunho',
  publicado_em timestamptz,
  expira_em timestamptz,
  imagem_capa text,
  video_url text,
  ordem integer NOT NULL DEFAULT 0,
  criado_por uuid REFERENCES auth.users(id),
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pg_slug_unique UNIQUE (slug),
  CONSTRAINT pg_status_check CHECK (status IN ('rascunho', 'publicado', 'arquivado'))
);

CREATE TABLE IF NOT EXISTS pagina_secao (
  id bigserial PRIMARY KEY,
  pagina_id bigint NOT NULL REFERENCES pagina(id) ON DELETE CASCADE,
  tipo varchar(50) NOT NULL,
  titulo varchar(255),
  subtitulo text,
  conteudo text,
  ordem integer NOT NULL DEFAULT 0,
  ativo boolean NOT NULL DEFAULT true,
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pagina_midia (
  id bigserial PRIMARY KEY,
  pagina_id bigint REFERENCES pagina(id) ON DELETE CASCADE,
  secao_id bigint REFERENCES pagina_secao(id) ON DELETE CASCADE,
  url text NOT NULL,
  tipo varchar(20) NOT NULL DEFAULT 'imagem',
  legenda text,
  ordem integer NOT NULL DEFAULT 0,
  principal boolean NOT NULL DEFAULT false,
  criado_em timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pm_tipo_check CHECK (tipo IN ('imagem', 'video', 'banner'))
);

-- ============================================================
-- Experiências
-- ============================================================
CREATE TABLE IF NOT EXISTS experiencia (
  id bigserial PRIMARY KEY,
  titulo varchar(255) NOT NULL,
  slug varchar(255) NOT NULL,
  resumo text,
  conteudo text,
  status varchar(20) NOT NULL DEFAULT 'rascunho',
  publicado_em timestamptz,
  expira_em timestamptz,
  imagem_capa text,
  video_url text,
  ordem integer NOT NULL DEFAULT 0,
  criado_por uuid REFERENCES auth.users(id),
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ex_slug_unique UNIQUE (slug),
  CONSTRAINT ex_status_check CHECK (status IN ('rascunho', 'publicado', 'arquivado'))
);

CREATE TABLE IF NOT EXISTS experiencia_midia (
  id bigserial PRIMARY KEY,
  experiencia_id bigint NOT NULL REFERENCES experiencia(id) ON DELETE CASCADE,
  url text NOT NULL,
  tipo varchar(20) NOT NULL DEFAULT 'imagem',
  legenda text,
  ordem integer NOT NULL DEFAULT 0,
  principal boolean NOT NULL DEFAULT false,
  criado_em timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT em_tipo_check CHECK (tipo IN ('imagem', 'video', 'banner'))
);

-- ============================================================
-- Serviços: categorias e mídia multi-imagem
-- ============================================================
CREATE TABLE IF NOT EXISTS servico_categoria (
  id bigserial PRIMARY KEY,
  nome varchar(255) NOT NULL,
  slug varchar(255) NOT NULL,
  descricao text,
  ordem integer NOT NULL DEFAULT 0,
  ativo boolean NOT NULL DEFAULT true,
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT sc_slug_unique UNIQUE (slug)
);

-- Adicionar categoria_id ao servico se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'servico' AND column_name = 'categoria_id'
  ) THEN
    ALTER TABLE servico ADD COLUMN categoria_id bigint REFERENCES servico_categoria(id);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS servico_midia (
  id bigserial PRIMARY KEY,
  servico_id bigint NOT NULL REFERENCES servico(id) ON DELETE CASCADE,
  url text NOT NULL,
  tipo varchar(20) NOT NULL DEFAULT 'imagem',
  legenda text,
  ordem integer NOT NULL DEFAULT 0,
  principal boolean NOT NULL DEFAULT false,
  criado_em timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT sm_tipo_check CHECK (tipo IN ('imagem', 'video'))
);

-- ============================================================
-- Clientes: preferências
-- ============================================================
CREATE TABLE IF NOT EXISTS cliente_preferencia (
  id bigserial PRIMARY KEY,
  cliente_id bigint NOT NULL REFERENCES cliente(id) ON DELETE CASCADE,
  chave varchar(100) NOT NULL,
  valor text,
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT cp_cliente_chave_unique UNIQUE (cliente_id, chave)
);

-- ============================================================
-- Relacionamento: interações do cliente
-- ============================================================
CREATE TABLE IF NOT EXISTS cliente_interacao (
  id bigserial PRIMARY KEY,
  cliente_id bigint NOT NULL REFERENCES cliente(id) ON DELETE CASCADE,
  tipo varchar(50) NOT NULL,
  descricao text,
  origem varchar(50),
  responsavel uuid REFERENCES auth.users(id),
  criado_em timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- Atendimento: chamados
-- ============================================================
CREATE TABLE IF NOT EXISTS chamado (
  id bigserial PRIMARY KEY,
  cliente_id bigint REFERENCES cliente(id),
  titulo varchar(255) NOT NULL,
  descricao text,
  status varchar(20) NOT NULL DEFAULT 'aberto',
  prioridade varchar(20) NOT NULL DEFAULT 'normal',
  responsavel uuid REFERENCES auth.users(id),
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now(),
  resolvido_em timestamptz,
  CONSTRAINT ch_status_check CHECK (status IN ('aberto', 'em_andamento', 'resolvido', 'fechado')),
  CONSTRAINT ch_prioridade_check CHECK (prioridade IN ('baixa', 'normal', 'alta', 'urgente'))
);

CREATE TABLE IF NOT EXISTS chamado_interacao (
  id bigserial PRIMARY KEY,
  chamado_id bigint NOT NULL REFERENCES chamado(id) ON DELETE CASCADE,
  autor uuid REFERENCES auth.users(id),
  mensagem text NOT NULL,
  interno boolean NOT NULL DEFAULT false,
  criado_em timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- Integrações: eventos e automações
-- ============================================================
CREATE TABLE IF NOT EXISTS integracao_evento (
  id bigserial PRIMARY KEY,
  tipo varchar(100) NOT NULL,
  origem varchar(50) NOT NULL,
  payload jsonb,
  processado boolean NOT NULL DEFAULT false,
  criado_em timestamptz NOT NULL DEFAULT now(),
  processado_em timestamptz
);

CREATE TABLE IF NOT EXISTS automacao_execucao (
  id bigserial PRIMARY KEY,
  nome varchar(255) NOT NULL,
  status varchar(20) NOT NULL DEFAULT 'pendente',
  payload jsonb,
  resultado jsonb,
  criado_em timestamptz NOT NULL DEFAULT now(),
  concluido_em timestamptz,
  CONSTRAINT ae_status_check CHECK (status IN ('pendente', 'executando', 'concluido', 'erro'))
);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_pagina_slug ON pagina(slug);
CREATE INDEX IF NOT EXISTS idx_pagina_status ON pagina(status);
CREATE INDEX IF NOT EXISTS idx_pagina_secao_pagina ON pagina_secao(pagina_id);
CREATE INDEX IF NOT EXISTS idx_pagina_midia_pagina ON pagina_midia(pagina_id);
CREATE INDEX IF NOT EXISTS idx_experiencia_slug ON experiencia(slug);
CREATE INDEX IF NOT EXISTS idx_experiencia_status ON experiencia(status);
CREATE INDEX IF NOT EXISTS idx_experiencia_midia_exp ON experiencia_midia(experiencia_id);
CREATE INDEX IF NOT EXISTS idx_servico_categoria_slug ON servico_categoria(slug);
CREATE INDEX IF NOT EXISTS idx_servico_midia_servico ON servico_midia(servico_id);
CREATE INDEX IF NOT EXISTS idx_cliente_preferencia_cliente ON cliente_preferencia(cliente_id);
CREATE INDEX IF NOT EXISTS idx_cliente_interacao_cliente ON cliente_interacao(cliente_id);
CREATE INDEX IF NOT EXISTS idx_chamado_cliente ON chamado(cliente_id);
CREATE INDEX IF NOT EXISTS idx_chamado_status ON chamado(status);
CREATE INDEX IF NOT EXISTS idx_chamado_interacao_chamado ON chamado_interacao(chamado_id);
CREATE INDEX IF NOT EXISTS idx_integracao_evento_tipo ON integracao_evento(tipo);
CREATE INDEX IF NOT EXISTS idx_automacao_execucao_status ON automacao_execucao(status);
