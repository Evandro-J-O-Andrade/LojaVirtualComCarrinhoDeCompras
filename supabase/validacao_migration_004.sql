-- ============================================================
-- VALIDACAO COMPORTAMENTAL - Migration 004 v2
-- Execute no SQL Editor do Supabase (projeto bmqxgibhuzekxpcgosap)
--
-- Assinatura real (conforme migration 004):
--   public.produto_imagem_definir_principal(bigint, bigint)
-- Tabela: public.produto_imagem
-- Indice: produto_imagem_principal_unica
--
-- Observacoes:
-- - Testes 1,2,3,4 executam como postgres (service_role) e sao
--   protegidos por ROLLBACK.
-- - Teste 5 (nao-admin) NAO pode ser executado via SET ROLE:
--   is_admin() depende de sessao autenticada real. Use o
--   client API com uma conta nao-admin para validate.
-- - Teste 6 (concorrencia) requer sessoes independentes.
--   Use duas conexoes separadas.
-- ============================================================

-- ------------------------------------------------------------
-- PARTE A: VERIFICACOES DE ESQUEMA (somente leitura)
-- ------------------------------------------------------------
BEGIN;

-- A1. Migration registrada?
SELECT
    version,
    applied_at,
    CASE WHEN version LIKE '%20261011000004%' THEN 'OK' ELSE 'MISSING' END AS status
FROM supabase_migrations.schema_migrations
WHERE version LIKE '%20261011%'
ORDER BY version;

-- A2. Indice unico parcial existe com definicao correta?
SELECT
    indexname,
    indexdef,
    CASE
        WHEN indexdef ILIKE '%UNIQUE%WHERE (principal = true)%' THEN 'OK'
        ELSE 'WRONG_DEF'
    END AS status
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'produto_imagem'
  AND indexname = 'imagem_principal_unica';

-- A3. RPC existe com configuracao correta?
SELECT
    p.proname AS function_name,
    p.proissecurity AS is_security_definer,
    p.provolatile AS volatile,
    p.proowner::regrole AS owner,
    p.prosrc LIKE '%is_admin()%' AS has_admin_check,
    p.prosrc LIKE '%FOR UPDATE%' AS has_row_lock,
    p.prosrc LIKE '%search_path%' AS has_search_path,
    p.prosrc LIKE '%RAISE EXCEPTION%' AS has_explicit_exception
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname = 'produto_imagem_definir_principal';

-- A4. Grants/Revokes na RPC?
SELECT
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants
WHERE table_name = 'produto_imagem_definir_principal'
  AND table_schema = 'public';

-- ------------------------------------------------------------
-- PARTE B: TESTES COMPORTAMENTAIS (como postgres / service_role)
-- ------------------------------------------------------------
-- B1. Administrador define imagem principal (sucesso)
--     Produto 1 tem id=1 (VTEX) e id=2.
--     Migration 004 desmarcou id=2. Testar redefinicao:
SET ROLE postgres;
SELECT public.produto_imagem_definir_principal(1, 1);
RESET ROLE;

-- Verificar: id=1 principal=true, id=2 principal=false
SELECT id, produto_id, principal, url
FROM public.produto_imagem
WHERE produto_id = 1
ORDER BY id;

-- B2. Imagem inexistente → rejeitada
SET ROLE postgres;
SELECT public.produto_imagem_definir_principal(1, 99999);
-- Esperado: ERROR: Imagem 99999 não pertence ao produto 1
RESET ROLE;

-- B3. Imagem de outro produto → rejeitada
SET ROLE postgres;
SELECT public.produto_imagem_definir_principal(2, 1);
-- Esperado: ERROR: Imagem 1 não pertence ao produto 2
RESET ROLE;

-- B4. Duplicacao de principal → indice unico bloqueia
SET ROLE postgres;
UPDATE public.produto_imagem SET principal = true WHERE id = 2 AND produto_id = 1;
UPDATE public.produto_imagem SET principal = true WHERE id = 1 AND produto_id = 1;
-- Esperado: ERROR: duplicate key value violates unique constraint "imagem_principal_unica"
RESET ROLE;

ROLLBACK;

-- ------------------------------------------------------------
-- PARTE C: VERIFICACAO FINAL (apos ROLLBACK, estado original)
-- ------------------------------------------------------------
SELECT
    produto_id,
    COUNT(*) AS total_principais
FROM public.produto_imagem
WHERE principal = true
GROUP BY produto_id
HAVING COUNT(*) > 1;
-- Esperado: 0 rows

-- ------------------------------------------------------------
-- PARTE D: TESTES QUE REQUEREM SESSAO AUTENTICADA REAL
-- ------------------------------------------------------------
-- D1. NAO-ADMIN: use o client API com uma conta nao-administradora.
--     A funcao is_admin() deve retornar false e a RPC deve
--     levantar 'Acesso negado: apenas administradores podem
--     definir imagem principal'.
--
-- D2. CONCORRENCIA: use duas conexoes separadas.
--     Conxesao A: SELECT public.produto_imagem_definir_principal(1, 1);
--     Conxesao B: SELECT public.produto_imagem_definir_principal(1, 2);
--     Esperado: uma executa, outra espera (FOR UPDATE).
-- ============================================================

