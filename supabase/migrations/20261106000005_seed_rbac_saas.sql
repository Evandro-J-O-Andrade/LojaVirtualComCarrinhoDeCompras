-- Seed: 20261106000005_seed_rbac_saas.sql
-- Fase 1: Seed idempotente de papéis e permissões
-- Usa INSERT ... ON CONFLICT DO NOTHING para ser idempotente.
-- NÃO executa remotamente sem aprovação.

-- Permissões (catálogo global)
INSERT INTO public.permissions (slug, nome, descricao, modulo) VALUES
  ('produto.criar', 'Criar produto', 'Criar novos produtos', 'produtos'),
  ('produto.editar', 'Editar produto', 'Editar produtos existentes', 'produtos'),
  ('produto.excluir', 'Excluir produto', 'Excluir produtos', 'produtos'),
  ('produto.visualizar', 'Visualizar produto', 'Visualizar produtos', 'produtos'),
  ('categoria.criar', 'Criar categoria', 'Criar categorias', 'categorias'),
  ('categoria.editar', 'Editar categoria', 'Editar categorias', 'categorias'),
  ('categoria.excluir', 'Excluir categoria', 'Excluir categorias', 'categorias'),
  ('midia.upload', 'Upload de mídia', 'Enviar arquivos para a biblioteca', 'midia'),
  ('midia.excluir', 'Excluir mídia', 'Excluir arquivos da biblioteca', 'midia'),
  ('midia.visualizar', 'Visualizar mídia', 'Visualizar biblioteca de mídia', 'midia'),
  ('cliente.gerenciar', 'Gerenciar clientes', 'CRUD de clientes', 'clientes'),
  ('pedido.gerenciar', 'Gerenciar pedidos', 'CRUD de pedidos', 'pedidos'),
  ('estoque.gerenciar', 'Gerenciar estoque', 'Operações de estoque', 'estoque'),
  ('cms.gerenciar', 'Gerenciar CMS', 'Gerenciar páginas e blocos', 'cms'),
  ('servico.gerenciar', 'Gerenciar serviços', 'CRUD de serviços', 'servicos'),
  ('admin.acessar', 'Acessar admin', 'Acessar painel administrativo', 'admin')
ON CONFLICT (slug) DO NOTHING;

-- Papéis de sistema (tenant_id NULL = global)
INSERT INTO public.roles (tenant_id, slug, nome, descricao, is_system) VALUES
  (NULL, 'admin', 'Administrador', 'Acesso total ao tenant', true),
  (NULL, 'operador', 'Operador', 'Operações de vendas e estoque', true),
  (NULL, 'cliente', 'Cliente', 'Acesso à área do cliente', true)
ON CONFLICT (tenant_id, slug) DO NOTHING;

-- Associação role-permission: admin recebe todas
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.slug = 'admin' AND r.tenant_id IS NULL
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Operador: permissões operacionais
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
JOIN public.permissions p ON p.slug IN (
  'produto.visualizar', 'midia.visualizar', 'midia.upload',
  'pedido.gerenciar', 'estoque.gerenciar', 'admin.acessar'
)
WHERE r.slug = 'operador' AND r.tenant_id IS NULL
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Cliente: permissões de cliente
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
JOIN public.permissions p ON p.slug IN (
  'produto.visualizar', 'midia.visualizar'
)
WHERE r.slug = 'cliente' AND r.tenant_id IS NULL
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ROLLBACK:
-- DELETE FROM public.role_permissions WHERE role_id IN (SELECT id FROM public.roles WHERE is_system = true);
-- DELETE FROM public.roles WHERE is_system = true;
-- DELETE FROM public.permissions WHERE slug IN ('produto.criar','produto.editar','produto.excluir','produto.visualizar','categoria.criar','categoria.editar','categoria.excluir','midia.upload','midia.excluir','midia.visualizar','cliente.gerenciar','pedido.gerenciar','estoque.gerenciar','cms.gerenciar','servico.gerenciar','admin.acessar');