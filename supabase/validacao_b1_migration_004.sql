-- ============================================================
-- VALIDACAO B1 - Migration 004 v2 (NOMES CORRIGIDOS)
-- Execute no SQL Editor do Supabase (projeto bmqxgibhuzekxpcgosap)
--
-- Nomes confirmados no staging:
--   RPC:   public.produto_imagem_definir_principal(bigint, bigint)
--   Tabela: public.produto_imagem
--   Indice: imagem_principal_unica
--
-- Observacao: SET ROLE postgres testa contexto privilegiado,
-- NAO comprova autorizacao de admin autenticado pela aplicacao.
-- Use a Parte F com sessao real do Supabase Auth.
-- ============================================================

-- ------------------------------------------------------------
-- PARTE A: Estado inicial (somente leitura)
-- ------------------------------------------------------------
SELECT '=== A: ESTADO INICIAL ===' AS info;

SELECT
    id,
    produto_id,
    principal,
    url,
    ordem
FROM public.produto_imagem
WHERE produto_id = 1
ORDER BY id;

-- ------------------------------------------------------------
-- PARTE B: B1 - RPC como postgres (service_role)
-- ------------------------------------------------------------
-- Define imagem id=1 como principal do produto 1.
-- A migration 004 desmarcou id=2. Este teste redefine:
-- id=1 vira principal, id=2 perde principal.
BEGIN;

SELECT '=== B: RPC como postgres ===' AS info;

SET ROLE postgres;
SELECT public.produto_imagem_definir_principal(1, 1);
RESET ROLE;

-- ------------------------------------------------------------
-- PARTE C: Verificar estado apos B1
-- ------------------------------------------------------------
SELECT '=== C: ESTADO APOS B1 ===' AS info;

SELECT
    id,
    produto_id,
    principal,
    url,
    ordem
FROM public.produto_imagem
WHERE produto_id = 1
ORDER BY id;

-- Esperado:
--   id=1: principal=true (VTEX, Cristal Vermelho)
--   id=2: principal=false

-- ------------------------------------------------------------
-- PARTE D: Verificar integridade (nenhuma duplicacao)
-- ------------------------------------------------------------
SELECT '=== D: INTEGRIDADE ===' AS info;

SELECT
    produto_id,
    COUNT(*) AS total_principais
FROM public.produto_imagem
WHERE principal = true
GROUP BY produto_id
HAVING COUNT(*) > 1;
-- Esperado: 0 rows

-- ------------------------------------------------------------
-- PARTE E: ROLLBACK - restaurar estado original
-- ------------------------------------------------------------
ROLLBACK;

SELECT '=== E: ESTADO APOS ROLLBACK ===' AS info;

SELECT
    id,
    produto_id,
    principal,
    url,
    ordem
FROM public.produto_imagem
WHERE produto_id = 1
ORDER BY id;
-- Esperado: estado original (id=1 principal=true, id=2 principal=false)

-- ============================================================
-- PARTE F: Validacao com sessao autenticada real
-- ============================================================
-- Execute em uma coneccao separada (client API, nao SQL Editor).
--
-- 1. Autenticar um administrador legitimo da aplicacao:
--    const { data: authData, error: authError } =
--      await supabase.auth.signInWithPassword({
--        email: 'admin@angelcosmeticos.com',
--        password: '<SENHA_DO_ADMIN>'
--      });
--    if (authError) throw authError;
--    if (!authData.user) throw new Error('Sem usuario autenticado');
--
-- 2. Executar a RPC:
--    const { data, error } = await supabase.rpc(
--      'imagem_definir_principal',
--      { p_produto_id: 1, p_imagem_id: 1 }
--    );
--    if (error) throw error;
--
-- 3. Verificar estado diretamente no banco:
--    const { data: rows } = await supabase
--      .from('imagem')
--      .select('id, produto_id, principal, url')
--      .eq('imagem_id', 1)
--      .order('id');
--    Esperado: id=1 principal=true, id=2 principal=false
--
-- 4. Restauracao do estado inicial (se necessario):
--    await supabase.rpc('imagem_definir_principal', {
--      p_produit_id: 1,
--      p_imagem_id: 1
--    });
-- ============================================================

