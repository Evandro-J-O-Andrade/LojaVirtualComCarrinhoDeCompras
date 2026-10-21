-- ============================================================
-- 20261011000005_produto_imagem_principal_testes.sql
-- Testes comportamentais para RPC produto_imagem_definir_principal
-- Execute em dados de teste isolados, NÃO em produção.
-- ============================================================

-- Setup: criar produto de teste e imagens
INSERT INTO public.produto (id, nome, slug, ativo)
VALUES (9999, 'Produto Teste Principal', 'teste-principal', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.produto_imagem (id, produto_id, url, principal, ordem)
VALUES
  (9001, 9999, 'https://test.com/img1.jpg', true, 1),
  (9002, 9999, 'https://test.com/img2.jpg', false, 2)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- TESTE 1: Administrador define imagem principal (sucesso)
-- ============================================================
SELECT public.produto_imagem_definir_principal(9999, 9002);
-- Esperado: id=9002 vira principal, id=9001 perde principal

-- Verificar
SELECT id, produto_id, principal FROM public.produto_imagem WHERE produto_id = 9999 ORDER BY id;
-- Esperado: 9001=false, 9002=true

-- ============================================================
-- TESTE 2: Usuário não administrador recebe acesso negado
-- ============================================================
-- Execute como role authenticated (não admin):
SET ROLE authenticated;
SELECT public.produto_imagem_definir_principal(9999, 9001);
-- Esperado: EXCEPTION 'Acesso negado: apenas administradores podem definir imagem principal'

RESET ROLE;

-- ============================================================
-- TESTE 3: Imagem inexistente ou de outro produto é rejeitada
-- ============================================================
SELECT public.produto_imagem_definir_principal(9999, 9999);
-- Esperado: EXCEPTION 'Imagem 9999 não pertence ao produto 9999'

SELECT public.produto_imagem_definir_principal(9998, 9001);
-- Esperado: EXCEPTION 'Imagem 9001 não pertence ao produto 9998'

-- ============================================================
-- TESTE 4: Índice bloqueia segunda imagem principal
-- ============================================================
-- Tentar marcar duas imagens como principal=true
UPDATE public.produto_imagem SET principal = true WHERE id = 9001 AND produto_id = 9999;
-- Esperado: ERROR: duplicate key value violates unique constraint "produto_imagem_principal_unica"

-- ============================================================
-- TESTE 5: Chamadas concorrentes são serializadas por FOR UPDATE
-- ============================================================
-- Execute em duas sessões simultâneas:
-- Sessão A: SELECT public.produto_imagem_definir_principal(9999, 9001);
-- Sessão B: SELECT public.produto_imagem_definir_principal(9999, 9002);
-- Esperado: Uma executa, outra espera (FOR UPDATE na linha do produto)
-- Resultado: apenas uma imagem principal no final

-- ============================================================
-- Cleanup
-- ============================================================
DELETE FROM public.produto_imagem WHERE produto_id = 9999;
DELETE FROM public.produto WHERE id = 9999;
