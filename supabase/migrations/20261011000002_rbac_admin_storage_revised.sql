-- ============================================================
-- 20261011000002_rbac_admin_storage_revised.sql
-- RBAC server-side + Storage policies restritas
--
-- Ordem de aplicação: 2 (depois de todos os migrations de 20260919 e 20261003)
--
-- Dependências: nenhuma — cria tabela admin_user e redefine is_admin()
--
-- Status: PROPOSTA REVISADA — NÃO APLICAR sem autorização
-- ============================================================

-- ------------------------------------------------------------
-- ADMIN_USER — registro server-side de administradores
--
-- INSERT só via service_role (atribuição autorizada, etapa 8;
-- nunca autoatendimento). DELETE por admin existente (revogação).
--
-- Regras de segurança:
--   - table tem RLS habilitado
--   - SELECT: apenas admins (is_admin())
--   - DELETE: apenas admins (is_admin())
--   - INSERT/UPDATE: SEM policy para authenticated → apenas
--     service_role (owner) pode inserir/atualizar
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_user (
    user_id uuid PRIMARY KEY,
    concedido_em timestamptz NOT NULL DEFAULT now(),
    concedido_por uuid,
    CONSTRAINT au_concedido_por_fk
        FOREIGN KEY (concedido_por)
        REFERENCES auth.users(id)
        ON DELETE SET NULL
);

ALTER TABLE admin_user ENABLE ROW LEVEL SECURITY;

-- Política: apenas administradores leem a lista de admins.
-- INSERT não tem política para authenticated — apenas service_role.
CREATE POLICY "admin_user_read_admin" ON admin_user
    FOR SELECT TO authenticated
    USING (is_admin());

CREATE POLICY "admin_user_delete_admin" ON admin_user
    FOR DELETE TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

-- ------------------------------------------------------------
-- Proteção: impedir remoção do último administrador
-- ------------------------------------------------------------
-- Garante que a tabela admin_user nunca fique vazia.
-- Se houver apenas 1 admin, DELETE é bloqueado.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION admin_user_prevent_last_delete()
RETURNS trigger AS $$
DECLARE
    count_admins int;
BEGIN
    SELECT COUNT(*) INTO count_admins FROM admin_user
    WHERE user_id IS NOT NULL;

    IF count_admins <= 1 THEN
        RAISE EXCEPTION 'Não é possível remover o último administrador'
            USING ERRCODE = '08006';
    END IF;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql
    SECURITY DEFINER
    VOLATILE
    SET search_path = 'public', 'pg_catalog';

ALTER FUNCTION admin_user_prevent_last_delete() OWNER TO postgres;
REVOKE ALL ON FUNCTION admin_user_prevent_last_delete() FROM PUBLIC;

CREATE TRIGGER admin_user_no_last_admin
    BEFORE DELETE ON admin_user
    FOR EACH ROW
    EXECUTE FUNCTION admin_user_prevent_last_delete();

-- REVOKE padrão: remover privileges do grupo public
REVOKE ALL ON TABLE admin_user FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, DELETE ON admin_user TO authenticated;

-- ------------------------------------------------------------
-- is_admin() — REESCRITA (server-side, seguro)
--
-- Antes: raw_user_meta_data->>'role' (gravável pelo cliente).
-- Depois: tabela admin_user (só service_role escreve).
-- Todas as policies que usam is_admin() herdam a correção.
--
-- SECURITY:
--   1. SECURITY DEFINER: executa com privilégios de seu owner.
--   2. Owner = postgres (superuser): query interna bypassa RLS,
--      evitando recursão na tabela admin_user.
--   3. search_path fixo: impede injeção de schema.
--   4. STABLE: não lê dados que mudam no mesmo request.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_user au WHERE au.user_id = auth.uid()
  );
$$ LANGUAGE sql
    SECURITY DEFINER
    STABLE
    SET search_path = 'public', 'pg_catalog';

-- Definir explicitamente o owner como postgres (superuser).
-- Em Supabase, migrations correm como postgres, mas este
-- ASSERT garante a propriedade mesmo em ambientes customizados.
ALTER FUNCTION public.is_admin() OWNER TO postgres;

-- Revogar execute do grupo public (padrão do Supabase).
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;

-- is_admin() é uma função booleana chamada dentro de policies.
-- Policies são SYSTEM-DEFINED — roles aplicadas via policy.
-- Conceder execute para authenticated (policies precisam chamar).
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- ------------------------------------------------------------
-- STORAGE — policies restritas (substitui as amplas)
--
-- Estado atual (CONFIRMADO via pg_policies):
--   - "Authenticated upload"  (INSERT  TO authenticated)
--   - "Authenticated update"  (UPDATE  TO authenticated)
--   - "Authenticated delete"  (DELETE  TO authenticated)
--   - "Public bucket read"    (SELECT  TO public)
--
-- TODAS as policies de escrita permitem QUALQUER usuário
-- autenticado — risco de substituição/apagamento de imagens
-- alheias. Correção: policies restritas a admin + product-images.
-- ------------------------------------------------------------

-- Remove policies amplas (nomes confirmados via pg_policies)
DROP POLICY IF EXISTS "Authenticated upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete" ON storage.objects;

-- Nova política: upload exclusivo de admin, restrito ao bucket
CREATE POLICY "product_images_insert_admin" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'product-images'
        AND public.is_admin()
    );

-- Nova política: update exclusivo de admin, restrito ao bucket
CREATE POLICY "product_images_update_admin" ON storage.objects
    FOR UPDATE TO authenticated
    USING (
        bucket_id = 'product-images'
        AND public.is_admin()
    )
    WITH CHECK (
        bucket_id = 'product-images'
        AND public.is_admin()
    );

-- Nova política: delete exclusivo de admin, restrito ao bucket
CREATE POLICY "product_images_delete_admin" ON storage.objects
    FOR DELETE TO authenticated
    USING (
        bucket_id = 'product-images'
        AND public.is_admin()
    );

-- "Public bucket read" (SELECT TO public) é MANTIDA — leitura
-- do catálogo de imagens continua aberta para visitantes.
-- Nenhuma outra política de storage é afetada.
-- ------------------------------------------------------------

-- ============================================================
-- ETAPA 8 (APÓS autorização explícita) — Bootstrap do admin
-- ============================================================
-- UUID confirmado: 3bf1c769-f4ca-45fe-b52b-ded4de18abc9
-- (1 usuário em auth.users; 0 admins atualmente)
--
-- Executar APENAS via service_role (Edge Function ou psql
-- autenticado como postgres), NUNCA do cliente:
--
--   INSERT INTO admin_user (user_id, concedido_por)
--   VALUES ('3bf1c769-f4ca-45fe-b52b-ded4de18abc9', NULL);
--
-- Após este INSERT:
--   - is_admin() retorna true para este usuário
--   - Todas as policies USING (is_admin()) liberam acesso
--   - produto_imagem INSERT/UPDATE/DELETE são permitidos
--   - Storage upload/delete são permitidos no bucket product-images
--
-- Estado atual (zero admins) NÃO sofre regressão — ninguém
-- tinha is_admin() antes (raw_user_meta_data não tinha role).
-- ============================================================

-- ============================================================
-- VERIFICAÇÕES PÓS-APLICAÇÃO
-- ============================================================
-- 1. SELECT is_admin() como postgres → false (sem admin_user)
-- 2. SELECT is_admin() como authenticated qualquer → false
-- 3. Após bootstrap: SELECT is_admin() como admin → true
-- 4. SELECT * FROM storage.objects WHERE bucket_id='product-images' → 0 rows
-- 5. SELECT * FROM admin_user → 1 row (após bootstrap)
-- 6. SELECT pg_get_userbyid((SELECT proowner FROM pg_proc WHERE proname='is_admin'))
--   → deve retornar 'postgres'
-- ============================================================