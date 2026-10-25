-- Migração (somente preparação, NÃO executar sem autorização explícita)
-- Objetivo: vincular cliente ao UUID do Supabase Auth sem quebrar cliente.id (bigint) existente.
-- Data: 2026-10-25
-- Status: DRAFT para revisão

BEGIN;

-- 1. Adicionar coluna auth_user_id (nullable) em cliente
ALTER TABLE public.cliente
  ADD COLUMN IF NOT EXISTS auth_user_id uuid;

-- 2. FK para auth.users(id) (ON DELETE SET NULL para não apagar cliente)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'cliente_auth_user_id_fkey'
  ) THEN
    ALTER TABLE public.cliente
      ADD CONSTRAINT cliente_auth_user_id_fkey
      FOREIGN KEY (auth_user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 3. Índice único parcial (permite NULL para clientes não vinculados)
CREATE UNIQUE INDEX IF NOT EXISTS cliente_auth_user_id_unique
  ON public.cliente (auth_user_id)
  WHERE auth_user_id IS NOT NULL;

-- 4. Índice auxiliar para lookups por auth_user_id
CREATE INDEX IF NOT EXISTS idx_cliente_auth_user_id
  ON public.cliente (auth_user_id);

-- 5. Vínculo de registros existentes (OPCIONAL, desabilitado por padrão)
-- Descomente somente após validação manual de correspondência e-mail/Auth:
-- UPDATE public.cliente c
-- SET auth_user_id = u.id
-- FROM auth.users u
-- WHERE c.email = u.email
--   AND c.auth_user_id IS NULL;

-- 6. Políticas RLS (novas, mantendo as antigas até validação)
-- cliente: leitura/escrita pelo próprio UUID autenticado
DROP POLICY IF EXISTS cliente_read_own_uuid ON public.cliente;
CREATE POLICY cliente_read_own_uuid ON public.cliente
  FOR SELECT TO authenticated
  USING (auth_user_id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS cliente_write_own_uuid ON public.cliente;
CREATE POLICY cliente_write_own_uuid ON public.cliente
  FOR ALL TO authenticated
  USING (auth_user_id = auth.uid() OR is_admin())
  WITH CHECK (auth_user_id = auth.uid() OR is_admin());

-- endereco: via cliente vinculado
DROP POLICY IF EXISTS endereco_read_own_uuid ON public.endereco;
CREATE POLICY endereco_read_own_uuid ON public.endereco
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.cliente c WHERE c.id = endereco.cliente_id AND c.auth_user_id = auth.uid())
    OR is_admin()
  );

DROP POLICY IF EXISTS endereco_write_own_uuid ON public.endereco;
CREATE POLICY endereco_write_own_uuid ON public.endereco
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.cliente c WHERE c.id = endereco.cliente_id AND c.auth_user_id = auth.uid())
    OR is_admin()
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.cliente c WHERE c.id = endereco.cliente_id AND c.auth_user_id = auth.uid())
    OR is_admin()
  );

-- carrinho: via cliente vinculado
DROP POLICY IF EXISTS carrinho_read_own_uuid ON public.carrinho;
CREATE POLICY carrinho_read_own_uuid ON public.carrinho
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.cliente c WHERE c.id = carrinho.cliente_id AND c.auth_user_id = auth.uid())
    OR is_admin()
  );

DROP POLICY IF EXISTS carrinho_write_own_uuid ON public.carrinho;
CREATE POLICY carrinho_write_own_uuid ON public.carrinho
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.cliente c WHERE c.id = carrinho.cliente_id AND c.auth_user_id = auth.uid())
    OR is_admin()
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.cliente c WHERE c.id = carrinho.cliente_id AND c.auth_user_id = auth.uid())
    OR is_admin()
  );

-- pedido: leitura própria ou admin
DROP POLICY IF EXISTS pedido_read_owner_admin_uuid ON public.pedido;
CREATE POLICY pedido_read_owner_admin_uuid ON public.pedido
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.cliente c WHERE c.id = pedido.cliente_id AND c.auth_user_id = auth.uid())
    OR is_admin()
  );

-- 7. is_admin() mantido (sem alteração) — SECURITY DEFINER, lê admin_user por auth.uid()

COMMIT;
