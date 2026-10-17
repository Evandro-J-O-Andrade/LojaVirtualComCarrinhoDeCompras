-- ============================================================
-- 20261011000004_produto_imagem_unique_principal_revised.sql
-- Garante que cada produto tenha no máximo uma imagem principal.
-- Preserva a imagem VTEX (id=1) como principal do produto 1.
-- Adiciona RPC seguro com controle de concorrência.
--
-- Ordem: 4 (depende de 002 e 003 já aplicados)
-- Status: PROPOSTA REVISADA v2 — NÃO APLICAR sem autorização
-- ============================================================

-- ------------------------------------------------------------
-- STEP 0: Data cleanup — remover duplicidade de principal=true
-- apenas nos produtos identificados com duplicidade confirmada.
--
-- Estratégia: para cada produto com duplicidade, preservar a
-- imagem comercialmente escolhida (confirmada via pré-verificação),
-- desmarcar as demais. NÃO exclui registros, URLs ou arquivos.
--
-- LOCK TABLE garante que nenhuma outra transação escreva
-- produto_imagem entre o cleanup e a criação do índice.
-- ------------------------------------------------------------
BEGIN;

LOCK TABLE public.produto_imagem IN SHARE ROW EXCLUSIVE MODE;

-- Produto 1 (Esmalte Cristal Vermelho): preservar id=1 (VTEX), desmarcar id=2
UPDATE public.produto_imagem
SET principal = false
WHERE id = 2
  AND produto_id = 1
  AND principal = true;

-- Se outros produtos tiverem duplicidade, devem ser tratados
-- caso a caso via pré-verificação. Exemplo:
-- UPDATE public.produto_imagem
-- SET principal = false
-- WHERE id IN (<ids a desmarcar>)
--   AND produto_id = <produto_id>
--   AND principal = true;

-- ------------------------------------------------------------
-- STEP 1: Índice único parcial
-- Apenas uma imagem com principal=true por produto_id.
-- Verificar se já existe com definição correta antes de criar.
-- ------------------------------------------------------------
DO $migration$
DECLARE
    v_indexdef text;
BEGIN
    SELECT indexdef INTO v_indexdef
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'produto_imagem'
      AND indexname = 'produto_imagem_principal_unica';

    IF v_indexdef IS NULL THEN
        EXECUTE $create_index$
            CREATE UNIQUE INDEX produto_imagem_principal_unica
            ON public.produto_imagem (produto_id)
            WHERE principal = true
        $create_index$;
    ELSIF v_indexdef <> $create_index$CREATE UNIQUE INDEX produto_imagem_principal_unica ON public.produto_imagem USING btree (produto_id) WHERE (principal = true)$create_index$ THEN
        RAISE EXCEPTION 'Índice produto_imagem_principal_unica já existe com definição diferente: %', v_indexdef
            USING ERRCODE = 'P0804';
    END IF;
END $migration$;

COMMIT;

-- ------------------------------------------------------------
-- STEP 2: Função RPC para definir imagem principal
--
-- SECURITY FIX: função usa SECURITY DEFINER + owner
-- postgres (superuser). Os UPDATE dentro BYPASSAM RLS.
-- A autorização MUST ser validada dentro da própria
-- função — NÃO confiar apenas em policies ou frontend.
--
-- CONCORRÊNCIA:
--   1. Lock na linha do produto (SELECT ... FOR UPDATE)
--      serializa chamadas concorrentes para o mesmo produto.
--   2. Índice único parcial fornece segunda camada.
--
-- SEGURANÇA:
--   1. SECURITY DEFINER: owner postgres → UPDATE bypassa RLS.
--   2. search_path fixo: impede injeção de schema.
--   3. is_admin() check EXPLÍCITO: RAISE EXCEPTION se não admin.
--   4. Validação: imagem deve pertencer ao produto (após lock).
--   5. VOLATILE: função modifica dados — marcador correto.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.produto_imagem_definir_principal(
    p_produto_id bigint,
    p_imagem_id bigint
) RETURNS void AS $function$
BEGIN
    -- AUTHORIZATION CHECK — crítico com SECURITY DEFINER
    -- bypassa RLS. A autorização MUST ser validada explicitamente.
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Acesso negado: apenas administradores podem definir imagem principal'
            USING ERRCODE = 'P0804';
    END IF;

    -- SERIALIZE FIRST: lock the product row to prevent race conditions.
    -- This also validates product existence implicitly.
    PERFORM 1 FROM public.produto
    WHERE id = p_produto_id
    FOR UPDATE;

    -- VALIDATION: imagem must belong to product (checked under lock)
    IF NOT EXISTS (
        SELECT 1 FROM public.produto_imagem
        WHERE id = p_imagem_id
          AND produto_id = p_produto_id
    ) THEN
        RAISE EXCEPTION 'Imagem % não pertence ao produto %'
            USING ERRCODE = 'P0804',
            HINT = 'p_imagem_id does not exist or does not belong to p_produto_id';
    END IF;

    -- 1. Desmarcar todas as imagens principais deste produto
    UPDATE public.produto_imagem
    SET principal = false
    WHERE produto_id = p_produto_id
      AND principal = true;

    -- 2. Marcar apenas a imagem alvo como principal
    UPDATE public.produto_imagem
    SET principal = true
    WHERE id = p_imagem_id
      AND produto_id = p_produto_id;

    -- Unique index produto_imagem_principal_unica prevents
    -- duplicates even if race condition slips through the lock.
END;
$function$ LANGUAGE plpgsql
    SECURITY DEFINER
    VOLATILE
    SET search_path = 'public', 'pg_catalog';

-- Garantir owner = postgres (superuser)
ALTER FUNCTION public.produto_imagem_definir_principal(bigint, bigint)
    OWNER TO postgres;

-- Revogar execute do grupo public e anon
REVOKE ALL ON FUNCTION public.produto_imagem_definir_principal(bigint, bigint)
    FROM PUBLIC;
REVOKE ALL ON FUNCTION public.produto_imagem_definir_principal(bigint, bigint)
    FROM anon;

-- Concessão de execução apenas para authenticated.
-- A autorização administrativa é validada dentro da função
-- (is_admin() check + SECURITY DEFINER + explicit RAISE).
GRANT EXECUTE ON FUNCTION public.produto_imagem_definir_principal(bigint, bigint)
    TO authenticated;

-- ------------------------------------------------------------
-- Comentário: VOLATILE vs STABLE
-- Funções STABLE não devem modificar dados. Como esta função
-- faz UPDATE, VOLATILE é o marcador correto.
-- ------------------------------------------------------------

-- ============================================================
-- VALIDAÇÕES PÓS-APLICAÇÃO (somente leitura)
-- ============================================================
-- 1. Verificar que produto 1 tem apenas uma imagem principal:
--    SELECT produto_id, COUNT(*) FROM public.produto_imagem
--    WHERE principal = true GROUP BY produto_id HAVING COUNT(*) > 1;
--    → deve retornar 0 rows
--
-- 2. Verificar que a imagem principal do produto 1 é id=1 (VTEX):
--    SELECT id, url FROM public.produto_imagem
--    WHERE produto_id = 1 AND principal = true;
--    → deve retornar id=1 com URL vtexassets.com
--
-- 3. Testar RPC como admin:
--    SELECT public.produto_imagem_definir_principal(1, 2);
--    → deve definir id=2 como principal e desmarcar id=1
--
-- 4. Testar RPC como non-admin:
--    SELECT public.produto_imagem_definir_principal(1, 2);
--    → deve levantar EXCEPTION 'Acesso negado'
--
-- 5. Testar RPC com imagem inexistente:
--    SELECT public.produto_imagem_definir_principal(1, 999);
--    → deve levantar EXCEPTION 'imagem não pertence ao produto'
--
-- 6. Tentar inserir duplicidade (deve falhar no índice único):
--    INSERT INTO public.produto_imagem (produto_id, url, principal)
--    VALUES (1, 'https://test.com/img.jpg', true);
--    → deve falhar com "duplicate key value violates unique
--      constraint produto_imagem_principal_unica"
-- ============================================================