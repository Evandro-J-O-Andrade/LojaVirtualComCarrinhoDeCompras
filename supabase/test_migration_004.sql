-- ============================================================
-- TESTES COMPORTAMENTAIS — Migration 004 v2
-- Projeto: bmqxgibhuzekxpcgosap (staging)
-- Modo: LEITURA + EXECUÇÃO CONTROLADA (RPC + INSERT de teste)
-- ============================================================

-- ------------------------------------------------------------
-- PRÉ-CONDIÇÕES (verificar estado atual)
-- ------------------------------------------------------------
-- 1. Duplicidade de principal deve ser 0
SELECT 'PRÉ-1: Duplicidades de principal' AS teste,
       COUNT(*) AS qtd_duplicadas
FROM (
    SELECT produto_id, COUNT(*) AS qtd_principal
    FROM produto_imagem
    WHERE principal = true
    GROUP BY produto_id
    HAVING COUNT(*) > 1
) sub;

-- 2. Produto 1 deve ter imagem principal id=1 (VTEX)
SELECT 'PRÉ-2: Principal do produto 1' AS teste,
       pi.id,
       pi.url,
       pi.principal
FROM produto_imagem pi
WHERE pi.produto_id = 1 AND pi.principal = true;

-- 3. RPC deve existir
SELECT 'PRÉ-3: RPC existe' AS teste,
       proname,
       proowner::regrole AS owner,
       prosecdef AS security_definer,
       provolatile AS volatile
FROM pg_proc
WHERE proname = 'produto_imagem_definir_principal';

-- 4. Índice único deve existir
SELECT 'PRÉ-4: Índice único existe' AS teste,
       indexname,
       indexdef
FROM pg_indexes
WHERE tablename = 'produto_imagem'
  AND indexname = 'produto_imagem_principal_unica';

-- ------------------------------------------------------------
-- TESTE 1: Administrador autenticado consegue definir imagem principal
-- ------------------------------------------------------------
-- Execute como usuário admin (3bf1c769-f4ca-45fe-b52b-ded4de18abc9)
-- ou via service_role para simular.
SELECT 'TESTE-1: Admin define imagem principal' AS teste;

-- Marcar imagem 2 como principal do produto 1 (deve ter sucesso)
SELECT public.produto_imagem_definir_principal(1, 2);

-- Verificar: imagem 2 é principal, imagem 1 não é mais
SELECT 'TESTE-1-VERIFY: Estado após definição' AS teste,
       pi.id,
       pi.url,
       pi.principal
FROM produto_imagem pi
WHERE pi.produit_id = 1
ORDER BY pi.id;

-- ------------------------------------------------------------
-- TESTE 2: Usuário autenticado não-admin recebe "Acesso negado"
-- ------------------------------------------------------------
-- Execute como usuário comum (não admin)
SELECT 'TESTE-2: Non-admin é bloqueado' AS teste;

-- Tentar definir imagem principal como não-admin
-- Esperado: EXCEPTION 'Acesso negado: apenas administradores...'
SELECT public.produto_imagem_definir_principal(1, 1);

-- ------------------------------------------------------------
-- TESTE 3: Imagem inexistente ou pertencente a outro produto é rejeitada
-- ------------------------------------------------------------
-- Execute como admin (service_role)
SELECT 'TESTE-3: Imagem inexistente é rejeitada' AS teste;

-- Tentar definir imagem 999 como principal do produto 1
-- Esperado: EXCEPTION 'Imagem 999 não pertence ao produto 1'
SELECT public.produto_imagem_definir_principal(1, 999);

-- ------------------------------------------------------------
-- TESTE 4: Índice único impede duas imagens principais para o mesmo produto
-- ------------------------------------------------------------
SELECT 'TESTE-4: Índice único impede duplicidade' AS teste;

-- Tentar inserir uma segunda imagem principal para o produto 1
-- Esperado: EXCEPTION "duplicate key value violates unique constraint
--   produto_imagem_principal_unica"
INSERT INTO produto_imagem (produto_id, url, ordem, principal)
VALUES (1, 'https://test.com/duplicada.jpg', 99, true);

-- ------------------------------------------------------------
-- TESTE 5: Operações concorrentes são serializadas pelo FOR UPDATE
-- ------------------------------------------------------------
-- Este teste requer duas sessões simultâneas.
-- Execute em dois terminais ao mesmo tempo:
--
-- Sessão A (admin):
--   SELECT public.produto_imagem_definir_principal(1, 1);
--
-- Sessão B (admin):
--   SELECT public.produto_imagem_definir_principal(1, 2);
--
-- Esperado: Uma opera em tempo recorde, a outra aguarda (FOR UPDATE)
-- e ambas terminam com apenas uma imagem principal.

SELECT 'TESTE-5: Concorrência serializada' AS teste,
       'Execute em duas sessões simultâneas' AS instrucao;

-- ------------------------------------------------------------
-- PÓS-TESTES: Estado final
-- ------------------------------------------------------------
-- Restaurar imagem 1 como principal (para estado original)
SELECT public.produto_imagem_definir_principal(1, 1);

SELECT 'PÓS: Estado final do produto 1' AS teste,
       pi.id,
       pi.url,
       pi.principal
FROM produto_imagem pi
WHERE pi.produit_id = 1
ORDER BY pi.id;

-- ------------------------------------------------------------
-- RESUMO FINAL
-- ------------------------------------------------------------
SELECT 'RESUMO' AS secao,
       (SELECT COUNT(*) FROM produto_imagem WHERE principal = true) AS total_principais,
       (SELECT COUNT(*) FROM (
           SELECT produto_id FROM produto_imagem
           WHERE principal = true
           GROUP BY produto_id HAVING COUNT(*) > 1
       ) sub) AS produtos_com_duplicidade;