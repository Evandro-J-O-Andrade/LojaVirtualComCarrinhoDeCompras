-- ============================================================
-- 20261011000003_rls_produto_imagem_anon_read_revised.sql
-- Policies RLS para produto_imagem: leitura pública (produtos ativos) +
-- escrita/admin (todos produtos)
--
-- Ordem de aplicação: 3 (depois de 20261011000002_rbac_admin_storage_revised.sql)
-- Dependency: is_admin() já foi redefinido como SECURITY DEFINER
--             lendo admin_user (etapa 2)
--
-- Status: PROPOSTA REVISADA — NÃO APLICAR sem autorização
-- ============================================================

-- ------------------------------------------------------------
-- STEP 1: Garantir RLS habilitado em produto_imagem
-- ------------------------------------------------------------
ALTER TABLE produto_imagem ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- STEP 1b: Adicionar política de leitura para authenticated em produto
--
-- PROBLEMA: authenticated non-admin não pode SELECT produto
-- (política produto_write_admin requer is_admin()).
-- A subquery EXISTS(SELECT 1 FROM produto ...) nas policies
-- abaixo FALHARIA para authenticated non-admin.
--
-- SOLUÇÃO: adicionar produto_read_active_authenticated para que
-- o subselect retorne linhas para usuários não-admin autenticados.
-- ------------------------------------------------------------
CREATE POLICY "produto_read_active_authenticated" ON produto
    FOR SELECT TO authenticated
    USING (ativo = true);

-- ------------------------------------------------------------
-- STEP 2: Drop existing produto_imagem policies
-- (confirmed via pg_policies on remote bmqxgibhuzekxpcgosap)
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "produto_imagem_write_admin" ON produto_imagem;
DROP POLICY IF EXISTS "produto_imagem_read_admin" ON produto_imagem;

-- ------------------------------------------------------------
-- STEP 3: Anon read — only active products' images
--
-- Anon (visitantes não autenticados) podem SELECT imagens
-- de produtos ativos apenas. Subqueries em produto.ativo
-- garantem consistência referencial.
-- ------------------------------------------------------------
CREATE POLICY "produto_imagem_read_anon" ON produto_imagem
    FOR SELECT TO anon
    USING (
        EXISTS (
            SELECT 1 FROM produto p
            WHERE p.id = produto_imagem.produto_id
              AND p.ativo = true
        )
    );

-- ------------------------------------------------------------
-- STEP 4: Authenticated read — active products only
-- (authenticated non-admin users browsing the storefront)
-- ------------------------------------------------------------
CREATE POLICY "produto_imagem_read_authenticated" ON produto_imagem
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM produto p
            WHERE p.id = produto_imagem.produto_id
              AND p.ativo = true
        )
    );

-- ------------------------------------------------------------
-- STEP 5: Split FOR ALL into separate INSERT/UPDATE/DELETE
--
-- The original "FOR ALL ... USING (is_admin())" had a
-- semantic gap: INSERT has no WITH CHECK restriction
-- (defaults to true). Split resolves this.
-- ------------------------------------------------------------

-- INSERT: only admins
CREATE POLICY "produto_imagem_insert_admin" ON produto_imagem
    FOR INSERT TO authenticated
    WITH CHECK (is_admin());

-- UPDATE: only admins
CREATE POLICY "produto_imagem_update_admin" ON produto_imagem
    FOR UPDATE TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

-- DELETE: only admins
CREATE POLICY "produto_imagem_delete_admin" ON produto_imagem
    FOR DELETE TO authenticated
    USING (is_admin());

-- ------------------------------------------------------------
-- STEP 6: Admin read-all — see images of inactive products
--
-- AdminProdutosPage.tsx filters to "Inativos" and needs
-- to see images of inactive products for review/reactivation.
--
-- PostgreSQL OR's SELECT policies together:
--   authenticated admin → read_authenticated (active)
--     OR read_admin_all (any produto) → sees everything
-- ------------------------------------------------------------
CREATE POLICY "produto_imagem_read_admin_all" ON produto_imagem
    FOR SELECT TO authenticated
    USING (is_admin());

-- ------------------------------------------------------------
-- SECURITY ANALYSIS
-- ------------------------------------------------------------
-- 1. anon: SELECT only, active products. Cannot INSERT/UPDATE/DELETE.
-- 2. authenticated non-admin: SELECT active products only.
--    Cannot write (INSERT/UPDATE/DELETE all require is_admin()).
-- 3. authenticated admin: SELECT all (via OR of policies 4+6),
--    INSERT/UPDATE/DELETE via policies 5+7.
-- 4. is_admin() depends on admin_user table (server-side, step 2).
-- 5. produto_imagem has NO "ativo" column — subquery uses produto.ativo.
-- 6. produto_imagem.produto_id REFERENCES produto(id) ON DELETE CASCADE.
-- 7. Multiple SELECT policies OR together — safe to add read_anon alongside.
-- 8. No INSERT policy for anon — cannot be created even if active.
-- 9. produto_read_active_authenticated added (STEP 1b) so subquery
--    EXISTS(SELECT 1 FROM produto) returns rows for authenticated non-admins.
-- ------------------------------------------------------------

-- ============================================================
-- VERIFICAÇÕES PÓS-APLICAÇÃO
-- ============================================================
-- 1. Como anon: SELECT FROM produto_imagem onde produto.ativo=true → OK
-- 2. Como anon: SELECT FROM produto_imagem onde produto.ativo=false → 0 rows
-- 3. Como anon: INSERT INTO produto_imagem → bloqueado (SEM policy)
-- 4. Como authenticated não-admin: SELECT FROM produto onde ativo=true → OK
-- 5. Como authenticated não-admin: SELECT FROM produto_imagem where produto.ativo → OK
-- 6. Como authenticated não-admin: INSERT/UPDATE/DELETE em produto_imagem → bloqueado
-- 7. Como admin: SELECT → todos os produtos (ativos + inativos)
-- 8. Como admin: INSERT/UPDATE/DELETE → permitido
-- ============================================================