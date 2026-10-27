-- Reconcile columns consumed by the frontend and close RLS gaps identified by advisors.
-- SKU is nullable to preserve existing product rows; unique only when provided.
ALTER TABLE public.produto ADD COLUMN IF NOT EXISTS sku text;
CREATE UNIQUE INDEX IF NOT EXISTS produto_sku_unique_not_null
  ON public.produto (sku) WHERE sku IS NOT NULL;

ALTER TABLE public.condicao_pagamento ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS condicao_pagamento_read_active ON public.condicao_pagamento;
CREATE POLICY condicao_pagamento_read_active
  ON public.condicao_pagamento FOR SELECT TO authenticated
  USING (ativo = true OR public.is_admin());
DROP POLICY IF EXISTS condicao_pagamento_admin_write ON public.condicao_pagamento;
CREATE POLICY condicao_pagamento_admin_write
  ON public.condicao_pagamento FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

ALTER TABLE public.desconto_comercial ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS desconto_comercial_admin_only ON public.desconto_comercial;
CREATE POLICY desconto_comercial_admin_only
  ON public.desconto_comercial FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

ALTER TABLE public.notificacao_preferencia ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS notificacao_preferencia_owner_read ON public.notificacao_preferencia;
CREATE POLICY notificacao_preferencia_owner_read
  ON public.notificacao_preferencia FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.cliente c
      WHERE c.id = notificacao_preferencia.cliente_id
        AND c.email = (auth.jwt() ->> 'email')
    )
  );
DROP POLICY IF EXISTS notificacao_preferencia_owner_insert ON public.notificacao_preferencia;
CREATE POLICY notificacao_preferencia_owner_insert
  ON public.notificacao_preferencia FOR INSERT TO authenticated
  WITH CHECK (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.cliente c
      WHERE c.id = notificacao_preferencia.cliente_id
        AND c.email = (auth.jwt() ->> 'email')
    )
  );
DROP POLICY IF EXISTS notificacao_preferencia_owner_update ON public.notificacao_preferencia;
CREATE POLICY notificacao_preferencia_owner_update
  ON public.notificacao_preferencia FOR UPDATE TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.cliente c
      WHERE c.id = notificacao_preferencia.cliente_id
        AND c.email = (auth.jwt() ->> 'email')
    )
  )
  WITH CHECK (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.cliente c
      WHERE c.id = notificacao_preferencia.cliente_id
        AND c.email = (auth.jwt() ->> 'email')
    )
  );
