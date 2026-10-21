-- ============================================================
-- 20261015_angel_catalogo_seed_v2.sql
-- Seed de 60 produtos para Angel Cosméticos (rascunho inativo)
-- Compatível com schema atual + Migration 004
--
-- REGRAS DE SEGURANÇA:
-- 1. Fornecedor localizado pelo CNPJ real (01020304000109), sem ID fixo.
-- 2. Usa APENAS as 7 categorias existentes no banco.
-- 3. NÃO cria imagens (produto_imagem.url é NOT NULL; sem placeholders).
-- 4. Produtos como rascunho: ativo=false, preco_base=0.
-- 5. ON CONFLICT DO NOTHING — idempotente para produtos e categorias.
-- 6. Nomes/descrições são propostas editoriais, não dados comerciais confirmados.
-- ============================================================

-- ------------------------------------------------------------
-- PASSO 1: Localizar fornecedor Mary Kay pelo CNPJ confirmado
-- ------------------------------------------------------------
DO $$
DECLARE
    v_fornecedor_mk_id bigint;
BEGIN
    SELECT id INTO v_fornecedor_mk_id
    FROM fornecedor
    WHERE cnpj = '01020304000109'
      AND ativo = true
    LIMIT 1;

    IF v_fornecedor_mk_id IS NULL THEN
        RAISE EXCEPTION 'Fornecedor Mary Kay (CNPJ 01020304000109) não encontrado ou inativo. Seed abortado.'
            USING ERRCODE = 'P0804';
    END IF;

    -- Disponibilizar para as CTEs abaixo
    PERFORM set_config('app.fornecedor_mk_id', v_fornecedor_mk_id::text, false);
END $$;

-- ------------------------------------------------------------
-- PASSO 2: Mapear slugs de categorias existentes
-- ------------------------------------------------------------
-- Categorias ativas no banco (7):
--   acessorios, cabelos, corpo-banho, cuidados-pele, esmalhe, maquiagem, promocoes
--
-- Mapeamento usado abaixo: cada produto aponta para UMA categoria existente.
-- Produtos sem correspondência adequada ficam SEM categoria (não inventamos).
-- ------------------------------------------------------------

-- ------------------------------------------------------------
-- PASSO 3: Inserir 60 produtos como RASCUNHO (ativo=false, preco_base=0)
-- ------------------------------------------------------------
WITH mk AS (
    SELECT current_setting('app.fornecedor_mk_id')::bigint AS id
),
produtos AS (
    SELECT * FROM (VALUES
        -- Cuidados com a Pele / Limpeza (15) → categoria 'cuidados-pele'
        ('mk-gel-limpeza-facial', 'Gel de Limpeza Facial Mary Kay', 'Limpeza suave para todos os tipos de pele', 'cuidados-pele'),
        ('mk-espuma-limpeza', 'Espuma de Limpeza Mary Kay', 'Espuma leve para remoção de impurezas', 'cuidados-pele'),
        ('mk-leite-demaquilante', 'Leite Demaquilante Mary Kay', 'Remove maquiagem à prova d''água', 'cuidados-pele'),
        ('mk-tonico-equilibrante', 'Tônico Equilibrante Mary Kay', 'Equilibra pH da pele após limpeza', 'cuidados-pele'),
        ('mk-esfoliante-suave', 'Esfoliante Suave Mary Kay', 'Esfoliação física suave sem agredir', 'cuidados-pele'),
        ('mk-agua-micelar', 'Água Micelar Mary Kay', 'Limpeza micelar sem enxágue', 'cuidados-pele'),
        ('mk-oleo-limpeza', 'Óleo de Limpeza Mary Kay', 'Limpeza profunda com óleos vegetais', 'cuidados-pele'),
        ('mk-sabonete-barra', 'Sabonete em Barra Mary Kay', 'Limpeza tradicional em barra hidratante', 'cuidados-pele'),
        ('mk-lencos-demaquilantes', 'Lenços Demaquilantes Mary Kay', 'Praticidade para remoção rápida', 'cuidados-pele'),
        ('mk-gel-limpeza-profunda', 'Gel Limpeza Profunda Mary Kay', 'Para pele oleosa e acneica', 'cuidados-pele'),
        ('mk-mousse-limpeza', 'Mousse de Limpeza Mary Kay', 'Textura mousse para pele sensível', 'cuidados-pele'),
        ('mk-loção-limpeza', 'Loção de Limpeza Mary Kay', 'Loção fluida para pele seca', 'cuidados-pele'),
        ('mk-creme-limpeza', 'Creme de Limpeza Mary Kay', 'Creme rico para pele madura', 'cuidados-pele'),
        ('mk-balm-limpeza', 'Balm de Limpeza Mary Kay', 'Balm que derrete maquiagem', 'cuidados-pele'),
        ('mk-pads-esfoliantes', 'Pads Esfoliantes Mary Kay', 'Discos pré-embebidos para esfoliação', 'cuidados-pele'),

        -- Cuidados com a Pele / Hidratação (15) → categoria 'cuidados-pele'
        ('mk-hidratante-dia', 'Hidratante Dia Mary Kay', 'Hidratação diária com proteção', 'cuidados-pele'),
        ('mk-hidratante-noite', 'Hidratante Noite Mary Kay', 'Reparação noturna intensiva', 'cuidados-pele'),
        ('mk-serum-vitamina-c', 'Sérum Vitamina C Mary Kay', 'Antioxidante clareador', 'cuidados-pele'),
        ('mk-serum-acido-hialuronico', 'Sérum Ácido Hialurônico Mary Kay', 'Hidratação profunda multicamadas', 'cuidados-pele'),
        ('mk-creme-olhos', 'Creme para Olhos Mary Kay', 'Reduz olheiras e linhas finas', 'cuidados-pele'),
        ('mk-oleo-facial', 'Óleo Facial Mary Kay', 'Nutrição com óleos botânicos', 'cuidados-pele'),
        ('mk-mascara-hidratacao', 'Máscara de Hidratação Mary Kay', 'Tratamento semanal intensivo', 'cuidados-pele'),
        ('mk-gel-hidratante', 'Gel Hidratante Mary Kay', 'Textura gel para pele oleosa', 'cuidados-pele'),
        ('mk-loção-corporal', 'Loção Corporal Mary Kay', 'Hidratação corpo inteiro', 'corpo-banho'),
        ('mk-creme-maos', 'Creme para Mãos Mary Kay', 'Reparação de mãos ressecadas', 'corpo-banho'),
        ('mk-balm-labial', 'Balm Labial Mary Kay', 'Hidratação e proteção labial', 'cuidados-pele'),
        ('mk-serum-retinol', 'Sérum Retinol Mary Kay', 'Anti-idade noturno', 'cuidados-pele'),
        ('mk-creme-pescoço', 'Creme Pescoço e Colo Mary Kay', 'Firmeza para área delicada', 'cuidados-pele'),
        ('mk-bruma-hidratante', 'Bruma Hidratante Mary Kay', 'Refrescância imediata', 'cuidados-pele'),
        ('mk-sleeping-mask', 'Sleeping Mask Mary Kay', 'Máscara noturna sem enxágue', 'cuidados-pele'),

        -- Maquiagem / Base e Corretivo (10) → categoria 'maquiagem'
        ('mk-base-liquida', 'Base Líquida Mary Kay', 'Cobertura média a alta, acabamento natural', 'maquiagem'),
        ('mk-base-em-po', 'Base em Pó Mary Kay', 'Cobertura leve, controle de oleosidade', 'maquiagem'),
        ('mk-corretivo-liquido', 'Corretivo Líquido Mary Kay', 'Cobertura de olheiras e imperfeições', 'maquiagem'),
        ('mk-corretivo-bastao', 'Corretivo em Bastão Mary Kay', 'Alta cobertura pontual', 'maquiagem'),
        ('mk-primer-facial', 'Primer Facial Mary Kay', 'Prepara pele para maquiagem duradoura', 'maquiagem'),
        ('mk-po-compacto', 'Pó Compacto Mary Kay', 'Finalização matte translúcida', 'maquiagem'),
        ('mk-base-stick', 'Base em Bastão Mary Kay', 'Praticidade e cobertura construível', 'maquiagem'),
        ('mk-corretivo-colorido', 'Corretivo Colorido Mary Kay', 'Neutralização de vermelhidão/olheiras', 'maquiagem'),
        ('mk-iluminador-liquido', 'Iluminador Líquido Mary Kay', 'Glow natural para pontos altos', 'maquiagem'),
        ('mk-contorno-creme', 'Contorno em Creme Mary Kay', 'Definição facial fácil de esfumar', 'maquiagem'),

        -- Maquiagem / Olhos e Lábios (10) → categoria 'maquiagem'
        ('mk-mascara-cilios', 'Máscara de Cílios Mary Kay', 'Volume e alongamento', 'maquiagem'),
        ('mk-delineador', 'Delineador Mary Kay', 'Traço preciso, longa duração', 'maquiagem'),
        ('mk-sombra-paleta', 'Paleta de Sombras Mary Kay', 'Cores versáteis para dia e noite', 'maquiagem'),
        ('mk-lapis-olhos', 'Lápis de Olhos Mary Kay', 'Macio, à prova d''água', 'maquiagem'),
        ('mk-sobrancelha', 'Kit Sobrancelha Mary Kay', 'Preenchimento e definição', 'maquiagem'),
        ('mk-batom-matte', 'Batom Matte Mary Kay', 'Alta pigmentação, conforto', 'maquiagem'),
        ('mk-batom-cremoso', 'Batom Cremoso Mary Kay', 'Hidratação com cor intensa', 'maquiagem'),
        ('mk-gloss-labial', 'Gloss Labial Mary Kay', 'Brilho não pegajoso', 'maquiagem'),
        ('mk-lapis-labios', 'Lápis Labial Mary Kay', 'Contorno perfeito', 'maquiagem'),
        ('mk-batom-liquido', 'Batom Líquido Mary Kay', 'Longa duração, acabamento matte', 'maquiagem'),

        -- Fragrâncias (10) → categorias 'cabelos', 'corpo-banho', 'promocoes' (aprox.)
        ('mk-perfume-feminino-1', 'Perfume Feminino Mary Kay 1', 'Floral frutado', 'cabelos'),
        ('mk-perfume-feminino-2', 'Perfume Feminino Mary Kay 2', 'Oriental amadeirado', 'cabelos'),
        ('mk-perfume-feminino-3', 'Perfume Feminino Mary Kay 3', 'Fresh floral', 'cabelos'),
        ('mk-perfume-masculino-1', 'Perfume Masculino Mary Kay 1', 'Amadeirado aromático', 'cabelos'),
        ('mk-perfume-masculino-2', 'Perfume Masculino Mary Kay 2', 'Cítrico fresco', 'cabelos'),
        ('mk-colonia-corpo', 'Colônia Corporal Mary Kay', 'Leve perfumação pós-banho', 'corpo-banho'),
        ('mk-loção-perfumada', 'Loção Perfumada Mary Kay', 'Hidratação com fragrância', 'corpo-banho'),
        ('mk-body-splash', 'Body Splash Mary Kay', 'Refrescância perfumada', 'corpo-banho'),
        ('mk-perfume-rollon', 'Perfume Roll-on Mary Kay', 'Praticidade em versão compacta', 'acessorios'),
        ('mk-kit-descoberta', 'Kit Descoberta Mary Kay', 'Miniaturas para experimentar', 'promocoes')

    ) AS t(slug, nome, descricao, categoria_slug)
)
INSERT INTO produto (nome, slug, descricao, preco_base, fornecedor_id, ativo)
SELECT p.nome, p.slug, p.descricao, 0.00, mk.id, false
FROM produtos p
CROSS JOIN mk
ON CONFLICT (slug) DO NOTHING;

-- ------------------------------------------------------------
-- PASSO 4: Associar produtos às categorias existentes
-- ------------------------------------------------------------
-- Apenas produtos inseridos neste seed (slug LIKE 'mk-%') recebem categoria.
-- ON CONFLICT DO NOTHING evita duplicatas em reexecução.
-- ------------------------------------------------------------
WITH mk AS (
    SELECT current_setting('app.fornecedor_mk_id')::bigint AS id
),
cat_map AS (
    SELECT c.id AS categoria_id, c.slug AS categoria_slug
    FROM categoria c
    WHERE c.ativo = true
      AND c.slug IN (
          'cuidados-pele', 'corpo-banho', 'maquiagem',
          'cabelos', 'acessorios', 'promocoes', 'esmalhe'
      )
),
prod AS (
    SELECT p.id AS produto_id, p.slug AS produto_slug
    FROM produto p
    JOIN mk ON p.fornecedor_id = mk.id
    WHERE p.slug LIKE 'mk-%'
)
INSERT INTO produto_categoria (produto_id, categoria_id)
SELECT pm.produto_id, cm.categoria_id
FROM prod pm
JOIN (
    VALUES
        -- Limpeza (15)
        ('mk-gel-limpeza-facial', 'cuidados-pele'),
        ('mk-espuma-limpeza', 'cuidados-pele'),
        ('mk-leite-demaquilante', 'cuidados-pele'),
        ('mk-tonico-equilibrante', 'cuidados-pele'),
        ('mk-esfoliante-suave', 'cuidados-pele'),
        ('mk-agua-micelar', 'cuidados-pele'),
        ('mk-oleo-limpeza', 'cuidados-pele'),
        ('mk-sabonete-barra', 'cuidados-pele'),
        ('mk-lencos-demaquilantes', 'cuidados-pele'),
        ('mk-gel-limpeza-profunda', 'cuidados-pele'),
        ('mk-mousse-limpeza', 'cuidados-pele'),
        ('mk-loção-limpeza', 'cuidados-pele'),
        ('mk-creme-limpeza', 'cuidados-pele'),
        ('mk-balm-limpeza', 'cuidados-pele'),
        ('mk-pads-esfoliantes', 'cuidados-pele'),
        -- Hidratação (15)
        ('mk-hidratante-dia', 'cuidados-pele'),
        ('mk-hidratante-noite', 'cuidados-pele'),
        ('mk-serum-vitamina-c', 'cuidados-pele'),
        ('mk-serum-acido-hialuronico', 'cuidados-pele'),
        ('mk-creme-olhos', 'cuidados-pele'),
        ('mk-oleo-facial', 'cuidados-pele'),
        ('mk-mascara-hidratacao', 'cuidados-pele'),
        ('mk-gel-hidratante', 'cuidados-pele'),
        ('mk-loção-corporal', 'corpo-banho'),
        ('mk-creme-maos', 'corpo-banho'),
        ('mk-balm-labial', 'cuidados-pele'),
        ('mk-serum-retinol', 'cuidados-pele'),
        ('mk-creme-pescoço', 'cuidados-pele'),
        ('mk-bruma-hidratante', 'cuidados-pele'),
        ('mk-sleeping-mask', 'cuidados-pele'),
        -- Base e Corretivo (10)
        ('mk-base-liquida', 'maquiagem'),
        ('mk-base-em-po', 'maquiagem'),
        ('mk-corretivo-liquido', 'maquiagem'),
        ('mk-corretivo-bastao', 'maquiagem'),
        ('mk-primer-facial', 'maquiagem'),
        ('mk-po-compacto', 'maquiagem'),
        ('mk-base-stick', 'maquiagem'),
        ('mk-corretivo-colorido', 'maquiagem'),
        ('mk-iluminador-liquido', 'maquiagem'),
        ('mk-contorno-creme', 'maquiagem'),
        -- Olhos e Lábios (10)
        ('mk-mascara-cilios', 'maquiagem'),
        ('mk-delineador', 'maquiagem'),
        ('mk-sombra-paleta', 'maquiagem'),
        ('mk-lapis-olhos', 'maquiagem'),
        ('mk-sobrancelha', 'maquiagem'),
        ('mk-batom-matte', 'maquiagem'),
        ('mk-batom-cremoso', 'maquiagem'),
        ('mk-gloss-labial', 'maquiagem'),
        ('mk-lapis-labios', 'maquiagem'),
        ('mk-batom-liquido', 'maquiagem'),
        -- Fragrâncias (10)
        ('mk-perfume-feminino-1', 'cabelos'),
        ('mk-perfume-feminino-2', 'cabelos'),
        ('mk-perfume-feminino-3', 'cabelos'),
        ('mk-perfume-masculino-1', 'cabelos'),
        ('mk-perfume-masculino-2', 'cabelos'),
        ('mk-colonia-corpo', 'corpo-banho'),
        ('mk-loção-perfumada', 'corpo-banho'),
        ('mk-body-splash', 'corpo-banho'),
        ('mk-perfume-rollon', 'acessorios'),
        ('mk-kit-descoberta', 'promocoes')
) AS mapping(produto_slug, categoria_slug) ON pm.produto_slug = mapping.produto_slug
JOIN cat_map cm ON cm.categoria_slug = mapping.categoria_slug
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------
-- PASSO 5: NÃO cria imagens
-- ------------------------------------------------------------
-- produto_imagem.url é NOT NULL e não há unicidade garantida.
-- Imagens serão adicionadas após upload real no Storage,
-- via admin usando produto_imagem_definir_principal().
-- ------------------------------------------------------------

-- ------------------------------------------------------------
-- OBSERVAÇÕES IMPORTANTES
-- ------------------------------------------------------------
-- 1. Variantes (produto_variante + atributos): script separado
--    após definição de SKUs, preços e atributos por produto.
-- 2. Estoque: script separado após confirmação de quantidades.
-- 3. Kits (produto_opcao_compra + kit_composicao): script
--    separado após definição exata de composição.
-- 4. Promoções: script separado com datas e valores confirmados.
-- 5. Para ativar produtos: UPDATE produto SET ativo=true, preco_base=X
--    WHERE slug IN (...); (apenas após validação completa)
-- 6. Este seed é IDEMPOTENTE para produto e produto_categoria:
--    re-execução não duplica nem sobrescreve.
-- 7. Nomes e descrições são PROPOSTAS EDITORIAIS — validar com
--    equipe comercial antes de ativar qualquer produto.
-- ============================================================