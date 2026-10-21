-- ============================================================
-- BACKUP PRÉ-MIGRATIONS P1.7
-- Projeto: bmqxgibhuzekxpcgosap (Angel Cosméticos)
-- Data: 2026-10-11
-- Scope: schemas public, storage
-- Método: supabase db query --linked (leitura, sem escrita)
-- IMPORTANTE: Nenhuma ALTERAÇÃO foi feita nestes dados
-- ============================================================

-- ============================================================
-- 1. CONFIGURAÇÃO DO PROJETO
-- ============================================================
-- Project Ref: bmqxgibhuzekxpcgosap
-- Database Host: aws-0-sa-east-1.pooler.supabase.com
-- Database: postgres
-- PostgreSQL version: (verificado via pg_proc/pg_policies)

-- ============================================================
-- 2. MIGRATION HISTORY (metadata)
-- ============================================================
-- supabase_migrations.schema_migrations:
--   apenas: 20261008000000 / remocao_enums
-- Objeto remotos existem mas não são rastreados pelo CLI.
-- Isso indica aplicação manual (SQL editor), não via db push.

-- ============================================================
-- 3. TABELAS LOCais (key tables)
-- ============================================================

-- produto_imagem (id, produto_id, url, ordem, principal, created_at, updated_at)
--   PK: id (bigserial)
--   FK: produto_id → produto(id) ON DELETE CASCADE
--   Default: ordem=0, principal=false, created_at=now(), updated_at=now()
--   RLS: ENABLED (owner: postgres)

-- produto (id, nome, slug, descricao, preco_base, fornecedor_id, ativo, created_at, updated_at)
--   PK: id (bigserial)
--   Default: ativo=true, created_at=now(), updated_at=now()
--   RLS: ENABLED (owner: postgres)

-- ============================================================
-- 4. DADOS: produto_imagem
-- ============================================================
-- Total: 14 registros
-- Todos com principal=true
-- 13 produtos distintos
-- Produto 1: 2 imagens (DUPLICIDADE de principal)

-- Duplicate principal check:
-- produto_id=1: 2 imagens com principal=true (ids 1, 2)
-- Todas outras: 1 imagem cada com principal=true

-- Dados de produto_imagem:
-- id=1, produto_id=1, url='https://kolicosmeticos.vtexassets.com/assets/vtex/assets/products/esmalte-cristal-vermelho.jpg', ordem=1, principal=true
-- id=2, produto_id=1, url='https://placehold.co/400x400/FF6B9D/white?text=esmalte-cristal-vermelho', ordem=0, principal=true  ← DUPLICADO
-- id=3, produto_id=14, url='https://placehold.co/400x400/FF6B9D/white?text=batom-matte-vermelho', ordem=0, principal=true
-- id=4, produto_id=15, url='https://placehold.co/400x400/FF6B9D/white?text=base-liquida-clara', ordem=0, principal=true
-- id=5, produto_id=16, url='https://placehold.co/400x400/FF6B9D/white?text=mascara-cabelos', ordem=0, principal=true
-- id=6, produto_id=17, url='https://placehold.co/400x400/FF6B9D/white?text=sabonete-liquido', ordem=0, principal=true
-- id=7, produto_id=18, url='https://placehold.co/400x400/FF6B9D/white?text=esmalte-vermelho', ordem=0, principal=true
-- id=8, produto_id=19, url='https://placehold.co/400x400/FF6B9D/white?text=alcool-gel', ordem=0, principal=true
-- id=9, produto_id=20, url='https://placehold.co/400x400/FF6B9D/white?text=protetor-solar', ordem=0, principal=true
-- id=10, produto_id=21, url='https://placehold.co/400x400/FF6B9D/white?text=shampoo-antiresiduo', ordem=0, principal=true
-- id=11, produto_id=22, url='https://placehold.co/400x400/FF6B9D/white?text=hidratante-labial', ordem=0, principal=true
-- id=12, produto_id=23, url='https://placehold.co/400x400/FF6B9D/white?text=mascara-facial', ordem=0, principal=true
-- id=13, produto_id=24, url='https://placehold.co/400x400/FF6B9D/white?text=oleo-capilar', ordem=0, principal=true
-- id=14, produto_id=25, url='https://placehold.co/400x400/FF6B9D/white?text=desodorante-rollon', ordem=0, principal=true

-- ============================================================
-- 5. DADOS: produto
-- ============================================================
-- Total: 13 produtos
-- Todos ativos (ativo=true)
-- Nenhum produto inativo

-- ============================================================
-- 6. DADOS: auth.users
-- ============================================================
-- Total: 1 usuário
-- id: 3bf1c769-f4ca-45fe-b52b-ded4de18abc9
-- email: evandro_j.o.a@hotmail.com
-- raw_user_meta_data->>'role': NULL (sem role definido — is_admin() atual retorna false)

-- ============================================================
-- 7. admin_user tabela
-- ============================================================
-- STATUS: NÃO EXISTE
-- A migration 20261011000002 cria esta tabela.

-- ============================================================
-- 8. STORAGE
-- ============================================================
-- bucket product-images: existe, público, 0 objetos
-- storage.objects políticas (4 total, todas em product-images):
--   Authenticated delete  (DELETE, bucket_id='product-images', auth.uid() IS NOT NULL)
--   Authenticated update  (UPDATE, bucket_id='product-images', auth.uid() IS NOT NULL)
--   Authenticated upload  (INSERT, bucket_id='product-images')
--   Public bucket read    (SELECT, bucket_id='product-images', public)
-- RLS em storage.objects: ENABLED

-- ============================================================
-- 9. POLICIES ATUAIS
-- ============================================================

-- produto policies:
-- produto_read_active: SELECT TO anon, USING (ativo = true)
-- produto_write_admin: ALL TO authenticated, USING (is_admin())

-- produto_imagem policies:
-- produto_imagem_read_admin: SELECT TO authenticated, USING (is_admin())
-- produto_imagem_write_admin: ALL TO authenticated, USING (is_admin())

-- storage.objects policies: (ver seção 8)

-- ============================================================
-- 10. FUNÇÕES
-- ============================================================

-- is_admin() (VERSÃO VULNERÁVEL - será substituída):
-- CREATE OR REPLACE FUNCTION public.is_admin()
-- RETURNS boolean AS $$
--   SELECT EXISTS (
--     SELECT 1 FROM auth.users u
--     WHERE u.id = auth.uid() AND u.raw_user_meta_data->>'role' = 'admin'
--   );
-- $$ LANGUAGE sql STABLE SECURITY DEFINER;
-- Owner: postgres, prosecdef=true, NO search_path set

-- produto_imagem_definir_principal: NÃO EXISTE (criada pela migration 20261011000004)

-- ============================================================
-- 11. RLS STATUS (todas as tabelas key)
-- ============================================================
-- produto: RLS enabled
-- produto_imagem: RLS enabled
-- storage.objects: RLS enabled
-- Todas as tabelas public: RLS enabled (exceto remocao_*)

-- ============================================================
-- 12. ROLES EXISTENTES
-- ============================================================
-- anon, authenticated, service_role, postgres, authenticator,
-- supabase_admin, supabase_auth_admin, supabase_storage_admin, etc.
-- (29 roles totais)

-- ============================================================
-- 13. PRODUTOS SEM migration tracking
-- ============================================================
-- Apenas 20261008000000 remocao_enums em metadata.
-- As tabelas/políticas/funções existem mas não são rastreadas.
-- Migration 20261011000002 (RBAC) NÃO pode CONFLICTAR:
--   - CREATE TABLE IF NOT EXISTS admin_user (idempotente)
--   - CREATE OR REPLACE FUNCTION is_admin() (substitui)
--   - DROP POLICY IF EXISTS (safe)
--   - CREATE POLICY (safe — nomes únicos)
-- Migration 20261011000003 (RLS) NÃO pode CONFLICTAR:
--   - ALTER TABLE ... ENABLE RLS (idempotente)
--   - DROP POLICY IF EXISTS (necessário para as 2 policies antigas)
--   - CREATE POLICY (nomes únicos)
--   - produto_read_active_authenticated (nova — não conflita)
-- Migration 20261011000004 (principal) NÃO pode CONFLICTAR:
--   - UPDATE normaliza dados (idempotente após primeira execução)
--   - CREATE UNIQUE INDEX IF NOT EXISTS (idempotente)
--   - CREATE OR REPLACE FUNCTION (substitui)
