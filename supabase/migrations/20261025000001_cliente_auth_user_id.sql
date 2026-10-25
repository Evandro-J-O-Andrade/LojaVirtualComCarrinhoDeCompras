-- Migração (DRAFT revisado v8) — NÃO executar sem autorização explícita
-- Objetivo: vincular cliente ao UUID do Supabase Auth, preservando cliente.id (bigint).
-- Revisão estática aplicada (v7): trigger BEFORE INSERT OR UPDATE, autorização de backend/service_role.
-- Data: 2026-10-25

BEGIN;

-- 1. Adicionar coluna auth_user_id (nullable) em cliente
ALTER TABLE public.cliente
  ADD COLUMN IF NOT EXISTS auth_user_id uuid;

-- 2. FK para auth.users(id) — validação completa
DO $$
DECLARE
  v_contype char;
  v_src_schema text;
  v_src_tbl text;
  v_src_col text;
  v_ref_schema text;
  v_ref_tbl text;
  v_ref_col text;
  v_del_action text;
  v_nkeys_src int;
  v_nkeys_ref int;
BEGIN
  SELECT c.contype,
    (SELECT n.nspname FROM pg_namespace n WHERE n.oid = t.relnamespace),
    t.relname,
    (SELECT a.attname FROM pg_attribute a WHERE a.attrelid = c.conrelid AND a.attnum = c.conkey[1]),
    (SELECT n2.nspname FROM pg_namespace n2 WHERE n2.oid = t2.relnamespace),
    t2.relname,
    (SELECT a2.attname FROM pg_attribute a2 WHERE a2.attrelid = c.confrelid AND a2.attnum = c.confkey[1]),
    CASE c.confdeltype WHEN 'a' THEN 'NO ACTION' WHEN 'r' THEN 'RESTRICT' WHEN 'c' THEN 'CASCADE' WHEN 'n' THEN 'SET NULL' WHEN 'd' THEN 'SET DEFAULT' END,
    array_length(c.conkey, 1),
    array_length(c.confkey, 1)
  INTO v_contype, v_src_schema, v_src_tbl, v_src_col, v_ref_schema, v_ref_tbl, v_ref_col, v_del_action, v_nkeys_src, v_nkeys_ref
  FROM pg_constraint c
  JOIN pg_class t ON t.oid = c.conrelid
  JOIN pg_namespace n ON n.oid = t.relnamespace
  JOIN pg_class t2 ON t2.oid = c.confrelid
  WHERE c.conname = 'cliente_auth_user_id_fkey'
    AND n.nspname = 'public'
    AND t.relname = 'cliente';

  IF v_contype IS NULL THEN
    ALTER TABLE public.cliente
      ADD CONSTRAINT cliente_auth_user_id_fkey
      FOREIGN KEY (auth_user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
  ELSIF v_contype <> 'f'
     OR v_src_schema <> 'public' OR v_src_tbl <> 'cliente' OR v_src_col <> 'auth_user_id'
     OR v_ref_schema <> 'auth' OR v_ref_tbl <> 'users' OR v_ref_col <> 'id'
     OR v_del_action <> 'SET NULL'
     OR v_nkeys_src <> 1 OR v_nkeys_ref <> 1 THEN
    RAISE EXCEPTION 'FK incompatível: contype=%, src=%.%(%), ref=%.%(%), on_delete=%, nkeys=%/%',
      v_contype, v_src_schema, v_src_tbl, v_src_col, v_ref_schema, v_ref_tbl, v_ref_col, v_del_action, v_nkeys_src, v_nkeys_ref;
  END IF;
END $$;

-- 3. Índice único parcial
CREATE UNIQUE INDEX IF NOT EXISTS cliente_auth_user_id_unique
  ON public.cliente (auth_user_id)
  WHERE auth_user_id IS NOT NULL;

-- 4. Vínculo de registros existentes — DESATIVADO
-- UPDATE public.cliente c
-- SET auth_user_id = u.id
-- FROM auth.users u
-- WHERE c.email = u.email AND c.auth_user_id IS NULL;

-- 5. Proteção de colunas sensíveis de pedido (trigger BEFORE INSERT OR UPDATE)
-- Backend (auth.role()='service_role') e admin (is_admin()) são autorizados; clientes não podem definir status/total.
CREATE OR REPLACE FUNCTION public.pedido_proteger_colunas_sensiveis()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  -- Backend (service_role) autorizado via claim confiável
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- Administrador autenticado autorizado
  IF is_admin() THEN
    RETURN NEW;
  END IF;

  -- Cliente não pode definir status ou total não-padrão em INSERT
  IF TG_OP = 'INSERT' THEN
    IF NEW.status IS DISTINCT FROM 'rascunho' OR NEW.total IS DISTINCT FROM 0 THEN
      RAISE EXCEPTION 'Definição de status/total de pedido não permitida para este usuário';
    END IF;
  END IF;

  -- Cliente não pode alterar status ou total em UPDATE
  IF TG_OP = 'UPDATE' THEN
    IF (NEW.status IS DISTINCT FROM OLD.status OR NEW.total IS DISTINCT FROM OLD.total) THEN
      RAISE EXCEPTION 'Alteração de status/total de pedido não permitida para este usuário';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS pedido_proteger_colunas_sensiveis_trg ON public.pedido;
CREATE TRIGGER pedido_proteger_colunas_sensiveis_trg
  BEFORE INSERT OR UPDATE ON public.pedido
  FOR EACH ROW
  EXECUTE FUNCTION public.pedido_proteger_colunas_sensiveis();

-- 6. Políticas RLS por UUID — por operação (sem FOR ALL)
-- cliente
DROP POLICY IF EXISTS cliente_read_own_uuid ON public.cliente;
CREATE POLICY cliente_read_own_uuid ON public.cliente
  FOR SELECT TO authenticated
  USING (auth_user_id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS cliente_update_own_uuid ON public.cliente;
CREATE POLICY cliente_update_own_uuid ON public.cliente
  FOR UPDATE TO authenticated
  USING (auth_user_id = auth.uid() OR is_admin())
  WITH CHECK (auth_user_id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS cliente_insert_own_uuid ON public.cliente;
CREATE POLICY cliente_insert_own_uuid ON public.cliente
  FOR INSERT TO authenticated
  WITH CHECK (auth_user_id = auth.uid() OR is_admin());

-- endereco (por operação)
DROP POLICY IF EXISTS endereco_read_own_uuid ON public.endereco;
CREATE POLICY endereco_read_own_uuid ON public.endereco
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.cliente c WHERE c.id = endereco.cliente_id AND c.auth_user_id = auth.uid()) OR is_admin());

DROP POLICY IF EXISTS endereco_insert_own_uuid ON public.endereco;
CREATE POLICY endereco_insert_own_uuid ON public.endereco
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.cliente c WHERE c.id = endereco.cliente_id AND c.auth_user_id = auth.uid()) OR is_admin());

DROP POLICY IF EXISTS endereco_update_own_uuid ON public.endereco;
CREATE POLICY endereco_update_own_uuid ON public.endereco
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.cliente c WHERE c.id = endereco.cliente_id AND c.auth_user_id = auth.uid()) OR is_admin())
  WITH CHECK (EXISTS (SELECT 1 FROM public.cliente c WHERE c.id = endereco.cliente_id AND c.auth_user_id = auth.uid()) OR is_admin());

DROP POLICY IF EXISTS endereco_delete_own_uuid ON public.endereco;
CREATE POLICY endereco_delete_own_uuid ON public.endereco
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.cliente c WHERE c.id = endereco.cliente_id AND c.auth_user_id = auth.uid()) OR is_admin());

-- carrinho (por operação)
DROP POLICY IF EXISTS carrinho_read_own_uuid ON public.carrinho;
CREATE POLICY carrinho_read_own_uuid ON public.carrinho
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.cliente c WHERE c.id = carrinho.cliente_id AND c.auth_user_id = auth.uid()) OR is_admin());

DROP POLICY IF EXISTS carrinho_insert_own_uuid ON public.carrinho;
CREATE POLICY carrinho_insert_own_uuid ON public.carrinho
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.cliente c WHERE c.id = carrinho.cliente_id AND c.auth_user_id = auth.uid()) OR is_admin());

DROP POLICY IF EXISTS carrinho_update_own_uuid ON public.carrinho;
CREATE POLICY carrinho_update_own_uuid ON public.carrinho
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.cliente c WHERE c.id = carrinho.cliente_id AND c.auth_user_id = auth.uid()) OR is_admin())
  WITH CHECK (EXISTS (SELECT 1 FROM public.cliente c WHERE c.id = carrinho.cliente_id AND c.auth_user_id = auth.uid()) OR is_admin());

DROP POLICY IF EXISTS carrinho_delete_own_uuid ON public.carrinho;
CREATE POLICY carrinho_delete_own_uuid ON public.carrinho
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.cliente c WHERE c.id = carrinho.cliente_id AND c.auth_user_id = auth.uid()) OR is_admin());

-- carrinho_item (via carrinho, por operação)
DROP POLICY IF EXISTS carrinho_item_read_own_uuid ON public.carrinho_item;
CREATE POLICY carrinho_item_read_own_uuid ON public.carrinho_item
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.carrinho cr JOIN public.cliente c ON c.id = cr.cliente_id WHERE cr.id = carrinho_item.carrinho_id AND c.auth_user_id = auth.uid()) OR is_admin());

DROP POLICY IF EXISTS carrinho_item_insert_own_uuid ON public.carrinho_item;
CREATE POLICY carrinho_item_insert_own_uuid ON public.carrinho_item
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.carrinho cr JOIN public.cliente c ON c.id = cr.cliente_id WHERE cr.id = carrinho_item.carrinho_id AND c.auth_user_id = auth.uid()) OR is_admin());

DROP POLICY IF EXISTS carrinho_item_update_own_uuid ON public.carrinho_item;
CREATE POLICY carrinho_item_update_own_uuid ON public.carrinho_item
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.carrinho cr JOIN public.cliente c ON c.id = cr.cliente_id WHERE cr.id = carrinho_item.carrinho_id AND c.auth_user_id = auth.uid()) OR is_admin())
  WITH CHECK (EXISTS (SELECT 1 FROM public.carrinho cr JOIN public.cliente c ON c.id = cr.cliente_id WHERE cr.id = carrinho_item.carrinho_id AND c.auth_user_id = auth.uid()) OR is_admin());

DROP POLICY IF EXISTS carrinho_item_delete_own_uuid ON public.carrinho_item;
CREATE POLICY carrinho_item_delete_own_uuid ON public.carrinho_item
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.carrinho cr JOIN public.cliente c ON c.id = cr.cliente_id WHERE cr.id = carrinho_item.carrinho_id AND c.auth_user_id = auth.uid()) OR is_admin());

-- pedido (leitura, inserção, atualização — sem DELETE pelo cliente)
DROP POLICY IF EXISTS pedido_read_owner_admin_uuid ON public.pedido;
CREATE POLICY pedido_read_owner_admin_uuid ON public.pedido
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.cliente c WHERE c.id = pedido.cliente_id AND c.auth_user_id = auth.uid()) OR is_admin());

DROP POLICY IF EXISTS pedido_insert_own_uuid ON public.pedido;
CREATE POLICY pedido_insert_own_uuid ON public.pedido
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.cliente c WHERE c.id = pedido.cliente_id AND c.auth_user_id = auth.uid()) OR is_admin());

DROP POLICY IF EXISTS pedido_update_own_uuid ON public.pedido;
CREATE POLICY pedido_update_own_uuid ON public.pedido
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.cliente c WHERE c.id = pedido.cliente_id AND c.auth_user_id = auth.uid()) OR is_admin())
  WITH CHECK (EXISTS (SELECT 1 FROM public.cliente c WHERE c.id = pedido.cliente_id AND c.auth_user_id = auth.uid()) OR is_admin());

-- pedido_item (via pedido, leitura)
DROP POLICY IF EXISTS pedido_item_read_own_uuid ON public.pedido_item;
CREATE POLICY pedido_item_read_own_uuid ON public.pedido_item
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.pedido p JOIN public.cliente c ON c.id = p.cliente_id WHERE p.id = pedido_item.pedido_id AND c.auth_user_id = auth.uid()) OR is_admin());

-- atendimento
DROP POLICY IF EXISTS atendimento_read_own_uuid ON public.atendimento;
CREATE POLICY atendimento_read_own_uuid ON public.atendimento
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.cliente c WHERE c.id = atendimento.cliente_id AND c.auth_user_id = auth.uid()) OR is_admin());

DROP POLICY IF EXISTS atendimento_insert_own_uuid ON public.atendimento;
CREATE POLICY atendimento_insert_own_uuid ON public.atendimento
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.cliente c WHERE c.id = atendimento.cliente_id AND c.auth_user_id = auth.uid()) OR is_admin());

-- 7. Inventário de políticas antigas (executar ANTES da aplicação)
-- SELECT schemaname, tablename, policyname, cmd, roles,
--        qual AS using_expr,
--        with_check AS with_check_expr
-- FROM pg_policies
-- WHERE schemaname = 'public'
--   AND (COALESCE(qual, '') ILIKE '%email%'
--        OR COALESCE(qual, '') ILIKE '%auth.jwt()%'
--        OR COALESCE(with_check, '') ILIKE '%email%'
--        OR COALESCE(with_check, '') ILIKE '%auth.jwt()%')
-- ORDER BY tablename, policyname;

-- NOTA: políticas antigas baseadas em e-mail permanecem ativas durante a transição.
-- Remoção planejada em migração posterior, após vinculação e validação.
-- is_admin() mantido sem alteração (SECURITY DEFINER, lê admin_user por auth.uid()).

COMMIT;
