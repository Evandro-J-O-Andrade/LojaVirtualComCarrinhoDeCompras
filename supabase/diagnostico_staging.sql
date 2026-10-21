-- ============================================================
-- DIAGNOSTICO - Objetos reais do staging bmqxgibhuzekxpcgosap
-- Consultas somente leitura. Nenhuma alteracao e executada.
-- Nomes confirmados no staging:
--   RPC:   public.imagem_definir_principal(bigint, bigint)
--   Tabela: public.produto_imagem
--   Indice: imagem_principal_unica
-- ============================================================

-- ------------------------------------------------------------
-- 1. Assinatura real da RPC
-- ------------------------------------------------------------
SELECT '=== 1. ASSINATURA DA RPC ===' AS info;

SELECT
    p.proname AS function_name,
    p.proargtypes::regtype[] AS parameter_types,
    p.prorettype::regtype AS return_type,
    p.prosrc LIKE '%is_admin()%' AS has_admin_check,
    p.prosrc LIKE '%FOR UPDATE%' AS has_row_lock,
    p.prosrc LIKE '%search_path%' AS has_search_path,
    p.prosrc LIKE '%RAISE EXCEPTION%' AS has_explicit_exception
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname = 'imagem_definir_principal';

-- ------------------------------------------------------------
-- 1b. Configuracao detalhada da RPC
-- ------------------------------------------------------------
SELECT '=== 1b. CONFIGURACAO DETALHADA ===' AS info;

SELECT
    p.oid::regprocedure AS assinatura,
    p.prosecdef AS security_definer,
    p.proconfig AS configuracao
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname = 'imagem_definir_principal';

-- ------------------------------------------------------------
-- 2. Tabela real e suas colunas
-- ------------------------------------------------------------
SELECT '=== 2. TABELA E COLUNAS ===' AS info;

SELECT
    c.column_name,
    c.data_type,
    c.is_nullable,
    c.column_default
FROM information_schema.columns c
WHERE c.table_schema = 'public'
  AND c.table_name = 'produto_imagem'
ORDER BY c.ordinal_position;

-- ------------------------------------------------------------
-- 3. Indices e restricoes da tabela
-- ------------------------------------------------------------
SELECT '=== 3. INDICES E RESTRICOES ===' AS info;

SELECT
    indexname,
    indexdef,
    CASE
        WHEN indexdef ILIKE '%UNIQUE%WHERE (principal = true)%'
        THEN 'OK'
        ELSE 'CHECK'
    END AS status
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'produto_imagem';

-- ------------------------------------------------------------
-- 4. Estado atual do produto 1
-- ------------------------------------------------------------
SELECT '=== 4. ESTADO ATUAL DO PRODUTO 1 ===' AS info;

SELECT
    id,
    produto_id,
    principal,
    url,
    ordem
FROM public.produto_imagem
WHERE produto_id = 1
ORDER BY id;

