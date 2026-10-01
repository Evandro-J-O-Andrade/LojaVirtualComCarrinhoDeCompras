-- Storage policies for bucket product-images
-- Generated: 2026-09-27
-- Status: DRAFT FOR HUMAN REVIEW - NOT APPLIED
-- Bucket JÁ EXISTE no remoto (criado 2026-09-21, público)
-- Policies existentes no remoto (inspecionadas via pg_policy):
--   "Public bucket read"        (r, public,   bucket_id = 'product-images')
--   "Authenticated upload"      (a, auth,     bucket_id = 'product-images')
--   "Authenticated update"      (w, auth,     bucket_id AND auth.uid() IS NOT NULL)
--   "Authenticated delete"      (d, auth,     bucket_id AND auth.uid() IS NOT NULL)
--
-- ⚠️ RISCO: as policies atuais de upload/update/delete são excessivamente amplas
--   (qualquer usuário autenticado pode fazer upload/update/delete).
--   Este arquivo propõe policies mais restritas usando is_admin().
--   A aplicação destas policies SUBSTITUI as existentes — revisão humana obrigatória.

-- Bucket: product-images
-- Paths: produtos/{product_id}/{arquivo}

-- Leitura pública (catálogo) — mantém o padrão existente
CREATE POLICY "product_images_read_public"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- Upload: apenas administradores (substitui "Authenticated upload")
CREATE POLICY "product_images_insert_admin"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'product-images'
    AND is_admin()
);

-- Update: apenas administradores (substitui "Authenticated update")
CREATE POLICY "product_images_update_admin"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
    bucket_id = 'product-images'
    AND is_admin()
)
WITH CHECK (
    bucket_id = 'product-images'
    AND is_admin()
);

-- Delete: apenas administradores (substitui "Authenticated delete")
CREATE POLICY "product_images_delete_admin"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'product-images'
    AND is_admin()
);