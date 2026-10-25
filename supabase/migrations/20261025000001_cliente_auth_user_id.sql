-- Migração (DRAFT revisado v4) — NÃO executar sem autorização explícita
-- Objetivo: vincular cliente ao UUID do Supabase Auth, preservando cliente.id (bigint).
-- Revisão estática aplicada (v4): FK validada por coluna de origem, políticas por operação,
-- tabelas dependentes, inventário de políticas antigas documentado.
-- Data: 2026-10-25

BEGIN;

-- 1. Adicionar coluna auth_user_id (nullable) em cliente
ALTER TABLE public.cliente
  ADD COLUMN IF NOT EXISTS auth_user_id uuid;

-- 2. FK para auth.users(id) — validação completa (schema, tabela, coluna de origem, coluna referenciada, ON DELETE)
DO $$
DECLARE
  src_col text;
  ref_tbl text;
  ref_col text;
  del_action text;
BEGIN
  SELECT
    (SELECT a.attname FROM pg_attribute a WHERE a.attrelid = c.conrelid AND a.attnum = c.conkey[1]),
    (SELECT t2.relname FROM pg_class t2 WHERE t2.oid = c.confrelid),
    (SELECT a2.attname FROM pg_attribute a2 WHERE a2.attrelid = c.confrelid AND a2.attnum = c.confkey[1]),
    CASE c.confdeltype WHEN 'a' THEN 'NO ACTION' WHEN 'r' THEN 'RESTRICT' WHEN 'c' THEN 'CASCADE' WHEN 'n' THEN 'SET NULL' WHEN 'd' THEN 'SET DEFAULT' END
  INTO src_col, ref_tbl, ref_col, del_action
  FROM pg_constraint c
  JOIN pg_class t ON t.oid = c.conrelid
  JOIN pg_namespace n ON n.oid = t.relnamespace
  WHERE c.conname = 'cliente_auth_user_id_fkey'
    AND n.nspname = 'public'
    AND t.relname = 'cliente';

  IF src_col IS NULL THEN
    ALTER TABLE public.cliente
      ADD CONSTRAINT cliente_auth_user_id_fkey
      FOREIGN KEY (auth_user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
  ELSIF src_col <> 'auth_user_id' OR ref_tbl <> 'users' OR ref_col <> 'id' OR del_action <> 'SET NULL' THEN
    RAISE EXCEPTION 'FK existente incompatível: src=%, ref=%(%), on_delete=%', src_col, ref_tbl, ref_col, del_action;
  END IF;
END $$;

-- 3. Índice único parcial
CREATE UNIQUE INDEX IF NOT EXISTS cliente_auth_user_id_unique
  ON public.cliente (auth_user_id)
  WHERE auth_user_id IS NOT NULL;

-- 4. Vínculo de registros existentes — DESATIVADO (requer validação explícita de identidade)
-- UPDATE public.cliente c
-- SET auth_user_id = u.id
-- FROM auth.users u
-- WHERE c.email = u.email AND c.auth_user_id IS NULL;

-- 5. Políticas RLS por UUID — por operação (sem FOR ALL)
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
-- NOTA: cliente_delete não criado — exclusão de cadastro não permitida ao cliente (retenção de histórico).

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
-- NOTA: atualização de colunas sensíveis (status, total) deve ser restrita na camada de aplicação/serviço, não apenas RLS.

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

-- NOTA: políticas antigas baseadas em e-mail permanecem ativas durante a transição.
-- Inventário (executar antes da aplicação para confirmar escopo):
-- SELECT tablename, policyname, cmd, roles FROM pg_policies
-- WHERE schemaname='public' AND (qual LIKE '%auth.jwt()%' OR qual LIKE '%email%');
-- Remoção planejada em migração posterior, após todos os clientes vinculados.
-- is_admin() mantido sem alteração (SECURITY DEFINER, lê admin_user por auth.uid()).

COMMIT;
