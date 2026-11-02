-- Migration: CMS, Experiências, Serviços e Clientes
-- Fase 2-4 do plano AS-IS → TO-BE Angel Cosméticos
-- Cria estruturas ausentes sem duplicar tabelas existentes.
-- Reutiliza: servico, cliente, endereco, atendimento, mimo
-- RLS: público lê apenas conteúdo publicado no período; admin escreve via is_admin()

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
  CONSTRAINT pm_tipo_check CHECK (tipo IN ('imagem', 'video', 'banner')),
  CONSTRAINT pm_owner_check CHECK (pagina_id IS NOT NULL OR secao_id IS NOT NULL)
);

-- ============================================================
-- CMS: Blocos de conteúdo por seção
-- ============================================================
CREATE TABLE IF NOT EXISTS pagina_bloco (
  id bigserial PRIMARY KEY,
  secao_id bigint NOT NULL REFERENCES pagina_secao(id) ON DELETE CASCADE,
  tipo varchar(50) NOT NULL,
  titulo varchar(255),
  subtitulo text,
  conteudo text,
  url text,
  ordem integer NOT NULL DEFAULT 0,
  visivel boolean NOT NULL DEFAULT true,
  metadata jsonb,
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pb_tipo_check CHECK (tipo IN ('banner', 'texto', 'imagem', 'video', 'produtos_destaque', 'categorias', 'promocoes', 'beneficios', 'servicos', 'cta', 'galeria', 'html'))
);

CREATE TABLE IF NOT EXISTS pagina_revisao (
  id bigserial PRIMARY KEY,
  pagina_id bigint NOT NULL REFERENCES pagina(id) ON DELETE CASCADE,
  titulo varchar(255) NOT NULL,
  slug varchar(255) NOT NULL,
  conteudo jsonb,
  status varchar(20) NOT NULL,
  criado_por uuid REFERENCES auth.users(id),
  criado_em timestamptz NOT NULL DEFAULT now()
);

-- Indexes adicionais para blocos e revisões
CREATE INDEX IF NOT EXISTS idx_pagina_bloco_secao ON pagina_bloco(secao_id);
CREATE INDEX IF NOT EXISTS idx_pagina_revisao_pagina ON pagina_revisao(pagina_id);

-- RLS: blocos seguem a página pai
ALTER TABLE pagina_bloco ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagina_revisao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pagina_bloco_public_read" ON pagina_bloco FOR SELECT TO public
  USING (EXISTS (SELECT 1 FROM pagina_secao ps JOIN pagina p ON p.id = ps.pagina_id WHERE ps.id = pagina_bloco.secao_id AND p.status = 'publicado' AND (p.publicado_em IS NULL OR p.publicado_em <= now()) AND (p.expira_em IS NULL OR p.expira_em > now())));

CREATE POLICY "pagina_bloco_admin_all" ON pagina_bloco FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "pagina_revisao_admin_all" ON pagina_revisao FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- Trigger para pagina_bloco
DROP TRIGGER IF EXISTS trg_pagina_bloco_atualizado ON pagina_bloco;
CREATE TRIGGER trg_pagina_bloco_atualizado BEFORE UPDATE ON pagina_bloco FOR EACH ROW EXECUTE FUNCTION update_atualizado_em();
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
-- Clientes: preferências e interações
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
CREATE INDEX IF NOT EXISTS idx_pagina_midia_secao ON pagina_midia(secao_id);
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

-- ============================================================
-- RLS: habilitar em todas as tabelas novas
-- ============================================================
ALTER TABLE pagina ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagina_secao ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagina_midia ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiencia ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiencia_midia ENABLE ROW LEVEL SECURITY;
ALTER TABLE servico_categoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE servico_midia ENABLE ROW LEVEL SECURITY;
ALTER TABLE cliente_preferencia ENABLE ROW LEVEL SECURITY;
ALTER TABLE cliente_interacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE chamado ENABLE ROW LEVEL SECURITY;
ALTER TABLE chamado_interacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE integracao_evento ENABLE ROW LEVEL SECURITY;
ALTER TABLE automacao_execucao ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS: Conteúdo público (pagina, pagina_secao, pagina_midia)
-- Leitura pública apenas de conteúdo publicado e no período
-- ============================================================
CREATE POLICY "pagina_public_read" ON pagina FOR SELECT TO public
  USING (status = 'publicado' AND (publicado_em IS NULL OR publicado_em <= now()) AND (expira_em IS NULL OR expira_em > now()));

CREATE POLICY "pagina_admin_all" ON pagina FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "pagina_secao_public_read" ON pagina_secao FOR SELECT TO public
  USING (EXISTS (SELECT 1 FROM pagina p WHERE p.id = pagina_secao.pagina_id AND p.status = 'publicado' AND (p.publicado_em IS NULL OR p.publicado_em <= now()) AND (p.expira_em IS NULL OR p.expira_em > now())));

CREATE POLICY "pagina_secao_admin_all" ON pagina_secao FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "pagina_midia_public_read" ON pagina_midia FOR SELECT TO public
  USING (EXISTS (SELECT 1 FROM pagina p WHERE p.id = pagina_midia.pagina_id AND p.status = 'publicado' AND (p.publicado_em IS NULL OR p.publicado_em <= now()) AND (p.expira_em IS NULL OR p.expira_em > now())));

CREATE POLICY "pagina_midia_admin_all" ON pagina_midia FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- ============================================================
-- RLS: Experiências (mesmo padrão)
-- ============================================================
CREATE POLICY "experiencia_public_read" ON experiencia FOR SELECT TO public
  USING (status = 'publicado' AND (publicado_em IS NULL OR publicado_em <= now()) AND (expira_em IS NULL OR expira_em > now()));

CREATE POLICY "experiencia_admin_all" ON experiencia FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "experiencia_midia_public_read" ON experiencia_midia FOR SELECT TO public
  USING (EXISTS (SELECT 1 FROM experiencia e WHERE e.id = experiencia_midia.experiencia_id AND e.status = 'publicado' AND (e.publicado_em IS NULL OR e.publicado_em <= now()) AND (e.expira_em IS NULL OR e.expira_em > now())));

CREATE POLICY "experiencia_midia_admin_all" ON experiencia_midia FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- ============================================================
-- RLS: Serviços (público lê categorias ativas e mídia de serviços)
-- ============================================================
CREATE POLICY "servico_categoria_public_read" ON servico_categoria FOR SELECT TO public
  USING (ativo = true);

CREATE POLICY "servico_categoria_admin_all" ON servico_categoria FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "servico_midia_public_read" ON servico_midia FOR SELECT TO public
  USING (EXISTS (SELECT 1 FROM servico s WHERE s.id = servico_midia.servico_id AND s.ativo = true));

CREATE POLICY "servico_midia_admin_all" ON servico_midia FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- ============================================================
-- RLS: Clientes (isolamento por usuário autenticado)
-- ============================================================
CREATE POLICY "cliente_preferencia_own_read" ON cliente_preferencia FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM cliente c WHERE c.id = cliente_preferencia.cliente_id AND c.auth_user_id = auth.uid()));

CREATE POLICY "cliente_preferencia_admin_all" ON cliente_preferencia FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "cliente_interacao_own_read" ON cliente_interacao FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM cliente c WHERE c.id = cliente_interacao.cliente_id AND c.auth_user_id = auth.uid()));

CREATE POLICY "cliente_interacao_admin_all" ON cliente_interacao FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- ============================================================
-- RLS: Chamados (admin gerencia; cliente lê os seus)
-- ============================================================
CREATE POLICY "chamado_own_read" ON chamado FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM cliente c WHERE c.id = chamado.cliente_id AND c.auth_user_id = auth.uid()));

CREATE POLICY "chamado_admin_all" ON chamado FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "chamado_interacao_own_read" ON chamado_interacao FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM chamado ch JOIN cliente c ON c.id = ch.cliente_id WHERE ch.id = chamado_interacao.chamado_id AND c.auth_user_id = auth.uid()));

CREATE POLICY "chamado_interacao_admin_all" ON chamado_interacao FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- ============================================================
-- RLS: Integrações (apenas admin / service role)
-- ============================================================
CREATE POLICY "integracao_evento_admin_all" ON integracao_evento FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "automacao_execucao_admin_all" ON automacao_execucao FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- ============================================================
-- Triggers: atualizado_em automático
-- ============================================================
CREATE OR REPLACE FUNCTION update_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY['pagina', 'pagina_secao', 'experiencia', 'servico_categoria', 'cliente_preferencia', 'chamado'])
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_%s_atualizado ON %s; CREATE TRIGGER trg_%s_atualizado BEFORE UPDATE ON %s FOR EACH ROW EXECUTE FUNCTION update_atualizado_em()',
      t, t, t, t
    );
  END LOOP;
END $$;

