-- ============================================================
-- Consultas de Validação — Migration 004 + Seed v2
-- Executar ANTES e DEPOIS para confirmar integridade.
-- Todas são SELECT (somente leitura).
-- ============================================================

-- ------------------------------------------------------------
-- 1. FORNECEDOR MARY KAY
-- ------------------------------------------------------------
SELECT id, nome, cnpj, ativo
FROM fornecedor
WHERE cnpj = '01020304000109';

-- ------------------------------------------------------------
-- 2. CATEGORIAS ATIVAS (referência para mapeamento)
-- ------------------------------------------------------------
SELECT id, nome, slug, ativo
FROM categoria
WHERE ativo = true
ORDER BY slug;

-- ------------------------------------------------------------
-- 3. PRODUTOS ATUAIS (antes do seed)
-- ------------------------------------------------------------
SELECT id, nome, slug, preco_base, fornecedor_id, ativo
FROM produto
ORDER BY id;

-- ------------------------------------------------------------
-- 4. CONTAGEM DE PRODUTOS POR FORNECEDOR
-- ------------------------------------------------------------
SELECT f.nome as fornecedor, COUNT(p.id) as qtd_produtos
FROM produto p
LEFT JOIN fornecedor f ON f.id = p.fornecedor_id
GROUP BY f.nome
ORDER BY qtd_produtos DESC;

-- ------------------------------------------------------------
-- 5. PRODUTOS DO SEED (após seed) — apenas rascunhos Mary Kay
-- ------------------------------------------------------------
SELECT id, nome, slug, preco_base, fornecedor_id, ativo
FROM produto
WHERE slug LIKE 'mk-%'
ORDER BY slug;

-- ------------------------------------------------------------
-- 6. CONTAGEM ESPERADA: 60 produtos mk-*
-- ------------------------------------------------------------
SELECT COUNT(*) as total_mk_produtos
FROM produto
WHERE slug LIKE 'mk-%';

-- ------------------------------------------------------------
-- 7. PRODUTO_CATEGORIA — associações do seed
-- ------------------------------------------------------------
SELECT pc.produto_id, p.slug as produto_slug, c.slug as categoria_slug
FROM produto_categoria pc
JOIN produto p ON p.id = pc.produto_id
JOIN categoria c ON c.id = pc.categoria_id
WHERE p.slug LIKE 'mk-%'
ORDER BY p.slug;

-- ------------------------------------------------------------
-- 8. PRODUTOS SEM CATEGORIA (seed)
-- ------------------------------------------------------------
SELECT p.id, p.slug, p.nome
FROM produto p
LEFT JOIN produto_categoria pc ON pc.produto_id = p.id
WHERE p.slug LIKE 'mk-%'
  AND pc.produto_id IS NULL;

-- ------------------------------------------------------------
-- 9. PRODUTO_IMAGEM — estado atual (duplicidade produto 1)
-- ------------------------------------------------------------
SELECT pi.id, pi.produto_id, p.nome as produto_nome, pi.url, pi.ordem, pi.principal
FROM produto_imagem pi
JOIN produto p ON p.id = pi.produto_id
ORDER BY pi.produto_id, pi.principal DESC, pi.id;

-- ------------------------------------------------------------
-- 10. VERIFICAR DUPLICIDADE DE PRINCIPAL (deve ser 0 após 004)
-- ------------------------------------------------------------
SELECT produto_id, COUNT(*) as qtd_principal
FROM produto_imagem
WHERE principal = true
GROUP BY produto_id
HAVING COUNT(*) > 1;

-- ------------------------------------------------------------
-- 11. ÍNDICE ÚNICO PARCIAL (após 004)
-- ------------------------------------------------------------
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'produto_imagem'
  AND indexname = 'produto_imagem_principal_unica';

-- ------------------------------------------------------------
-- 12. FUNÇÃO RPC (após 004)
-- ------------------------------------------------------------
SELECT proname, proowner::regrole, prosecdef, provolatile, proconfig
FROM pg_proc
WHERE proname = 'produto_imagem_definir_principal';

-- ------------------------------------------------------------
-- 13. PERMISSÕES DA FUNÇÃO RPC
-- ------------------------------------------------------------
SELECT grantee, privilege_type
FROM information_schema.routine_privileges
WHERE routine_name = 'produto_imagem_definir_principal'
  AND routine_schema = 'public';

-- ------------------------------------------------------------
-- 14. IMAGEM PRINCIPAL DO PRODUTO 1 (deve ser id=1 VTEX após 004)
-- ------------------------------------------------------------
SELECT pi.id, pi.url, pi.principal
FROM produto_imagem pi
WHERE pi.produto_id = 1
  AND pi.principal = true;

-- ------------------------------------------------------------
-- 15. ADMIN_USER (bootstrap confirmado)
-- ------------------------------------------------------------
SELECT user_id, concedido_em, concedido_por
FROM admin_user;

-- ------------------------------------------------------------
-- 16. IS_ADMIN() CONFIGURAÇÃO
-- ------------------------------------------------------------
SELECT proname, proowner::regrole, prosecdef, provolatile, proconfig
FROM pg_proc
WHERE proname = 'is_admin';

-- ------------------------------------------------------------
-- 17. STORAGE POLICIES — product-images
-- ------------------------------------------------------------
SELECT policyname, cmd, roles, qual, with_check
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage'
  AND policyname LIKE '%product%';

-- ------------------------------------------------------------
-- 18. RLS POLICIES — produto
-- ------------------------------------------------------------
SELECT policyname, cmd, roles, qual, with_check
FROM pg_policies
WHERE tablename = 'produto'
  AND schemaname = 'public';

-- ------------------------------------------------------------
-- 19. RLS POLICIES — produto_imagem
-- ------------------------------------------------------------
SELECT policyname, cmd, roles, qual, with_check
FROM pg_policies
WHERE tablename = 'produto_imagem'
  AND schemaname = 'public';

-- ------------------------------------------------------------
-- 20. TESTE RPC — admin (executar como admin após 004)
-- ------------------------------------------------------------
-- SELECT produto_imagem_definir_principal(1, 2);
-- Verificar: imagem 2 vira principal, imagem 1 desmarca

-- ------------------------------------------------------------
-- 21. TESTE RPC — non-admin (deve falhar)
-- ------------------------------------------------------------
-- SELECT produto_imagem_definir_principal(1, 2);
-- Erro esperado: "Acesso negado: apenas administradores..."

-- ------------------------------------------------------------
-- 22. TESTE RPC — imagem inexistente (deve falhar)
-- ------------------------------------------------------------
-- SELECT produto_imagem_definir_principal(1, 999);
-- Erro esperado: "Imagem 999 não pertence ao produto 1"

-- ------------------------------------------------------------
-- 23. TESTE ÍNDICE ÚNICO — inserir duplicidade (deve falhar)
-- ------------------------------------------------------------
-- INSERT INTO produto_imagem (produto_id, url, principal)
-- VALUES (1, 'https://test.com/dup.jpg', true);
-- Erro esperado: "duplicate key value violates unique constraint
--   produto_imagem_principal_unica"

-- ------------------------------------------------------------
-- 24. RESUMO GERAL PÓS-EXECUÇÃO
-- ------------------------------------------------------------
SELECT
    (SELECT COUNT(*) FROM produto WHERE slug LIKE 'mk-%') as mk_produtos,
    (SELECT COUNT(*) FROM produto_categoria pc
     JOIN produto p ON p.id = pc.produto_id
     WHERE p.slug LIKE 'mk-%') as mk_com_categoria,
    (SELECT COUNT(*) FROM produto_imagem pi
     JOIN produto p ON p.id = pi.produto_id
     WHERE p.slug LIKE 'mk-%') as mk_com_imagem,
    (SELECT COUNT(*) FROM produto_imagem WHERE principal = true) as total_principais,
    (SELECT COUNT(*) FROM produto_imagem pi1
     WHERE pi1.principal = true
       AND EXISTS (
         SELECT 1 FROM produto_imagem pi2
         WHERE pi2.produto_id = pi1.produto_id
           AND pi2.principal = true
           AND pi2.id <> pi1.id
       )) as produtos_com_duplicidade_principal;