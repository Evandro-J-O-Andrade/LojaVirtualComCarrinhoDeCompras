# Fase 1 — Reconciliação do Administrador Principal

## Conta preservada
- **UUID Auth**: `3bf1c769-f4ca-45fe-b52b-ded4de18abc9`
- **E-mail**: `evandro_j.o.a@hotmail.com`
- **Vínculo**: `admin_user` (preservado, não alterado)

## Procedimento de reconciliação (NÃO executar sem aprovação)

### Passo 1: Criar people para o admin
```sql
-- Idempotente: só cria se não existir
INSERT INTO public.people (auth_user_id, username, display_name, email, status)
SELECT
  au.id,
  'evandro_admin',
  COALESCE(au.raw_user_meta_data->>'display_name', 'Evandro'),
  au.email,
  'active'
FROM auth.users au
WHERE au.id = '3bf1c769-f4ca-45fe-b52b-ded4de18abc9'
  AND NOT EXISTS (
    SELECT 1 FROM public.people p WHERE p.auth_user_id = au.id
  );
```

### Passo 2: Criar tenant Angel
```sql
INSERT INTO public.tenants (slug, nome, status)
VALUES ('angel-cosmeticos', 'Angel Cosméticos', 'active')
ON CONFLICT (slug) DO NOTHING;
```

### Passo 3: Criar membership
```sql
INSERT INTO public.tenant_memberships (person_id, tenant_id, status)
SELECT p.id, t.id, 'active'
FROM public.people p
CROSS JOIN public.tenants t
WHERE p.auth_user_id = '3bf1c769-f4ca-45fe-b52b-ded4de18abc9'
  AND t.slug = 'angel-cosmeticos'
ON CONFLICT (person_id, tenant_id) DO NOTHING;
```

### Passo 4: Atribuir papel admin
```sql
INSERT INTO public.role_assignments (person_id, tenant_id, role_id)
SELECT p.id, t.id, r.id
FROM public.people p
CROSS JOIN public.tenants t
CROSS JOIN public.roles r
WHERE p.auth_user_id = '3bf1c769-f4ca-45fe-b52b-ded4de18abc9'
  AND t.slug = 'angel-cosmeticos'
  AND r.slug = 'admin'
  AND r.tenant_id IS NULL
ON CONFLICT (person_id, tenant_id, role_id) DO NOTHING;
```

### Passo 5: Popular tenant_id nos dados existentes
```sql
-- Após criar o tenant Angel, atualizar todos os registros comerciais
UPDATE public.produto SET tenant_id = (SELECT id FROM public.tenants WHERE slug = 'angel-cosmeticos') WHERE tenant_id IS NULL;
UPDATE public.categoria SET tenant_id = (SELECT id FROM public.tenants WHERE slug = 'angel-cosmeticos') WHERE tenant_id IS NULL;
UPDATE public.fornecedor SET tenant_id = (SELECT id FROM public.tenants WHERE slug = 'angel-cosmeticos') WHERE tenant_id IS NULL;
UPDATE public.produto_imagem SET tenant_id = (SELECT id FROM public.tenants WHERE slug = 'angel-cosmeticos') WHERE tenant_id IS NULL;
UPDATE public.estoque SET tenant_id = (SELECT id FROM public.tenants WHERE slug = 'angel-cosmeticos') WHERE tenant_id IS NULL;
UPDATE public.estoque_movimentacao SET tenant_id = (SELECT id FROM public.tenants WHERE slug = 'angel-cosmeticos') WHERE tenant_id IS NULL;
-- (repetir para as demais tabelas)
```

## Preservação
- `admin_user` não será alterado.
- `is_admin()` continuará funcionando como fallback.
- Dados comerciais existentes (13 produtos, 7 categorias, 3 fornecedores, 17 imagens, 14 estoque) serão preservados e vinculados ao tenant Angel.