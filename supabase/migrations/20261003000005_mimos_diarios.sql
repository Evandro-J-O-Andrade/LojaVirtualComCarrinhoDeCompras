-- ============================================================
-- 20261003000005 — Mimos Diários (curadoria editorial)
-- Fonte: ESPECIFICACAO_MIMOS_DIARIOS_V1.0 §8 (proposta mínima
-- de tabelas: mimo, mimo_produto).
-- Mimo NÃO é brinde gratuito por padrão (MODELO_COMERCIAL §12):
-- é curadoria narrativa que conduz a produtos, kits e promoções
-- REAIS. O Mimo nunca carrega preço, desconto ou estoque próprio.
-- ============================================================

-- ------------------------------------------------------------
-- MIMO — identidade + contexto + publicação + SEO
-- Janela de publicação obrigatória (ativo + inicio + fim).
-- Oferta real: promocao_id ou kit_produto_id REAIS do banco;
-- sem oferta real → o Mimo apresenta produtos sem inventar
-- desconto (REGRA_DE_DESIGN §7/§8).
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
    kit_produto_id bigint,
    promocao_id bigint,
    categoria_id bigint,
    ativo boolean NOT NULL DEFAULT true,
    inicio date NOT NULL,
    fim date NOT NULL,
    ordem integer NOT NULL DEFAULT 0,
    seo_titulo varchar(255),
    seo_descricao text,
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT mi_slug_unique UNIQUE (slug),
    CONSTRAINT mi_contexto_check CHECK (contexto IN ('cuidar', 'ritual', 'presentear')),
    CONSTRAINT mi_ativo_check CHECK (ativo IN (true, false)),
    CONSTRAINT mi_janela_check CHECK (inicio < fim),
    CONSTRAINT mi_ordem_check CHECK (ordem >= 0),
    CONSTRAINT mi_kit_fk FOREIGN KEY (kit_produto_id) REFERENCES produto(id) ON DELETE SET NULL,
    CONSTRAINT mi_promocao_fk FOREIGN KEY (promocao_id) REFERENCES promocao(id) ON DELETE SET NULL,
    CONSTRAINT mi_categoria_fk FOREIGN KEY (categoria_id) REFERENCES categoria(id) ON DELETE SET NULL
);

-- ------------------------------------------------------------
-- MIMO_PRODUTO — vínculo N:N com ordem (§7)
-- Não reutiliza produto_categoria (vinculação distinta).
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mimo_produto (
    mimo_id bigint NOT NULL,
    produto_id bigint NOT NULL,
    ordem integer NOT NULL DEFAULT 0,
    criado_em timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT mp_pk PRIMARY KEY (mimo_id, produto_id),
    CONSTRAINT mp_ordem_check CHECK (ordem >= 0),
    CONSTRAINT mp_mimo_fk FOREIGN KEY (mimo_id) REFERENCES mimo(id) ON DELETE CASCADE,
    CONSTRAINT mp_produto_fk FOREIGN KEY (produto_id) REFERENCES produto(id) ON DELETE CASCADE
);

-- ============================================================
-- RLS
-- ============================================================

-- MIMO (público só dentro da janela de publicação; admin vê
-- tudo, inclusive rascunho/expirado)
ALTER TABLE mimo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mimo_read_publicado" ON mimo FOR SELECT TO anon
    USING (ativo = true AND inicio <= CURRENT_DATE AND fim >= CURRENT_DATE);
CREATE POLICY "mimo_read_admin" ON mimo FOR SELECT TO authenticated
    USING (is_admin());
CREATE POLICY "mimo_write_admin" ON mimo FOR ALL TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

-- MIMO_PRODUTO (vinculo — leitura pública; a visibilidade do
-- Mimo é garantida pela política de mimo na consulta)
ALTER TABLE mimo_produto ENABLE ROW LEVEL SECURITY;
-- Só expõe vínculos de Mimos PUBLICADOS (janela ativa) —
-- não vaza agrupamentos futuros ou expirados.
CREATE POLICY "mimo_produto_read" ON mimo_produto FOR SELECT TO anon
    USING (
        EXISTS (
            SELECT 1 FROM mimo m
            WHERE m.id = mimo_produto.mimo_id
              AND m.ativo = true
              AND m.inicio <= CURRENT_DATE
              AND m.fim >= CURRENT_DATE
        )
    );
CREATE POLICY "mimo_produto_write_admin" ON mimo_produto FOR ALL TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());
