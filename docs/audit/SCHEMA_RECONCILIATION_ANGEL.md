# Reconciliação de Schema — Angel × SaaS Core

Modo: somente leitura. Nenhuma migration, seed ou alteração remota.

## 1. Estado atual do schema Angel (remote)

Tabelas públicas existentes (60 total). Relevantes para identidade/RBAC/tenant:

| Tabela | Existe | Observação |
|---|---|---|
| `auth.users` (Supabase) | Sim | 2 usuários; 1 com vínculo admin |
| `admin_user` | Sim | 1 registro (admin principal `evandro_j.o.a@hotmail.com`) |
| `people` | Não | Ausente — núcleo de identidade não existe |
| `tenants` | Não | Ausente |
| `tenant_memberships` | Não | Ausente |
| `customer_profiles` | Não | Ausente |
| `employee_profiles` | Não | Ausente |
| `roles` | Não | Ausente |
| `permissions` | Não | Ausente |
| `role_permissions` | Não | Ausente |
| `role_assignments` | Não | Ausente |
| `audit_logs` | Não | Ausente (existe `auditoria` com schema diferente) |

## 2. Tabelas comerciais existentes (preservar)

| Tabela | Registros | tenant_id? | Ação |
|---|---|---|---|
| `produto` | 13 | Não | Adicionar `tenant_id` FK |
| `categoria` | 7 | Não | Adicionar `tenant_id` FK |
| `fornecedor` | 3 | Não | Adicionar `tenant_id` FK |
| `produto_imagem` | 17 | Não | Adicionar `tenant_id` FK |
| `estoque` | 14 | Não | Adicionar `tenant_id` FK |
| `estoque_movimentacao` | 0 | Não | Adicionar `tenant_id` FK |
| `variante` / `opcao_compra` | 1 / 1 | Não | Avaliar escopo (produto → tenant) |
| `cliente` | 0 | Não | Adicionar `tenant_id` + `person_id` FK |
| `pedido` / `pagamento` | 0 | Não | Adicionar `tenant_id` FK |
| `servico` / `profissional` | 0 | Não | Adicionar `tenant_id` FK |
| `agendamento` / `status_agendamento` | 0 / 7 | Não | Adicionar `tenant_id` FK |
| `pagina` / blocos | 0 | Não | Adicionar `tenant_id` FK |
| `chamado` / `chamado_interacao` | 0 | Não | Adicionar `tenant_id` FK |

## 3. RLS existente

- 152 políticas públicas.
- Estratégias mistas: `cliente.email = auth.jwt() ->> 'email'` (legado) e `cliente.auth_user_id = auth.uid()` (novo).
- `is_admin()` é `SECURITY DEFINER`, binária (verifica `admin_user`).
- Políticas de Storage no bucket `product-images` a verificar.

## 4. O que falta (gaps)

1. **Identidade central**: `people` não existe; `auth_user_id` não está vinculado a uma entidade pessoa.
2. **Organização/tenant**: `tenants` e `tenant_memberships` ausentes.
3. **RBAC granular**: `roles`, `permissions`, `role_permissions`, `role_assignments` ausentes.
4. **Perfis funcionais**: `customer_profiles`, `employee_profiles` ausentes.
5. **Auditoria estruturada**: `audit_logs` ausente (existe `auditoria` com schema diferente).
6. **tenant_id** em todas as tabelas comerciais.
7. **FKs compostas** para isolamento cross-tenant.
8. **Consistência RLS**: unificar estratégia de autorização por `auth.uid()` → `people` → `tenant_memberships` → RBAC.

## 5. O que já existe e deve ser reutilizado

- `admin_user` (preservar vínculo do admin principal).
- `is_admin()` (manter durante transição, não remover até RBAC estar ativo).
- Estrutura comercial (produtos, categorias, fornecedores, estoque, imagens).
- `status_agendamento` (7 registros — catálogo de status).
- Funções de trigger (`update_atualizado_em()` já hardened).

## 6. Plano de migração (não executar sem aprovação)

### Fase 1 — Fundação de identidade (sem alterar dados existentes)
1. Criar `people` com FK para `auth.users` (1:1 opcional).
2. Criar `tenants` (Angel como primeiro tenant).
3. Criar `tenant_memberships` (vínculo pessoa–tenant).
4. Reconciliar admin principal: identificar/criar `people` para a conta `evandro_j.o.a@hotmail.com`, criar membership no tenant Angel.
5. Preservar `admin_user` intacto.

### Fase 2 — RBAC
1. Criar `roles`, `permissions`, `role_permissions`, `role_assignments`.
2. Seed estrutural: catálogo de papéis (admin, cliente, operador) e permissões por módulo.
3. Seed de relacionamento: vínculos role→permission, assignment→role.
4. Manter `is_admin()` como fallback durante transição.

### Fase 3 — Perfis funcionais
1. Criar `customer_profiles`, `employee_profiles`.
2. Migrar dados de `cliente` para `people` + `customer_profiles`.
3. Vincular por `auth_user_id` (não por e-mail).

### Fase 4 — tenant_id nas tabelas comerciais
1. Adicionar `tenant_id UUID` em todas as tabelas listadas na seção 2.
2. Popular com o tenant Angel (UUID fixo).
3. Adicionar FK para `tenants.id`.
4. Adicionar FKs compostas onde aplicável (ex: `produto.tenant_id` + `categoria.tenant_id`).
5. Criar índices em `tenant_id`.

### Fase 5 — RLS e autorização
1. Unificar estratégia: `auth.uid()` → `people` → `tenant_memberships` → RBAC.
2. Substituir políticas baseadas em e-mail por políticas baseadas em `auth.uid()` + tenant + permissão.
3. Preservar `is_admin()` como fallback até validação completa.

### Fase 6 — Auditoria
1. Criar `audit_logs` (ou adaptar `auditoria` existente).
2. Registrar operações CRUD críticas.

## 7. Riscos e dependências

| Risco | Mitigação |
|---|---|
| Duplicação de identidade | Reconciliar por `auth_user_id`, nunca por e-mail |
| Perda de dados comerciais | Migrations aditivas, sem drop de tabelas |
| Quebra de RLS | Manter `is_admin()` como fallback durante transição |
| Tenant incorreto | Popular `tenant_id` com UUID fixo do tenant Angel |
| FKs quebradas | Validar com queries de integridade antes e depois |

## 8. O que NÃO será feito sem aprovação

- Criar ou aplicar migrations remotas.
- Alterar políticas RLS.
- Modificar funções de autorização.
- Criar triggers.
- Executar seeds remotos.
- Transferir privilégios administrativos.
- Alterar o vínculo `admin_user`.