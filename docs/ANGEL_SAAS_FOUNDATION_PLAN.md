# Angel SaaS Foundation — Plano de Execução Consolidado

Referências: `docs/SAAS_IDENTITY_AND_TENANT_CONTEXT_STANDARD.md`, `docs/audit/CRUD_AUDIT_ANGEL.md`, `docs/audit/SCHEMA_RECONCILIATION_ANGEL.md`.

Modo: planejamento. Nenhuma migration, seed ou alteração remota será executada sem aprovação explícita.

## 1. Visão

Transformar a Angel Cosméticos de uma aplicação com páginas habilitadas em uma plataforma SaaS comercial operacional, com identidade central (`people`), multi-tenant (`tenants`), RBAC contextual, CRUDs persistindo no Supabase, mídia centralizada e isolamento entre tenants.

## 2. Arquitetura de camadas

| Camada | Decisão |
|---|---|
| Identidade | `people` (núcleo global) |
| Autenticação | Supabase Auth (`auth.uid()`) |
| Organização | `tenants` |
| Associação | `tenant_memberships` |
| Autorização | RBAC contextual (`roles`, `permissions`, `role_permissions`, `role_assignments`) |
| Perfis funcionais | `customer_profiles`, `employee_profiles` |
| Dados comerciais | `tenant_id UUID` em todas as tabelas de domínio |
| Integridade | FKs, constraints, índices |
| Segurança | RLS por contexto (tenant + permissão) |
| Auditoria | `audit_logs` |

## 3. Regra fundamental

Uma pessoa pode participar de vários tenants sem contas duplicadas. A pessoa é global; vínculos, funções e permissões são contextuais. Autorização consulta fonte confiável no backend/banco, nunca variáveis editáveis do frontend.

## 4. Ordem de execução (7 fases)

### Fase 1 — Fundação de identidade e RBAC
- Criar `people`, `tenants`, `tenant_memberships`.
- Criar `roles`, `permissions`, `role_permissions`, `role_assignments`.
- Reconciliar admin principal (preservar conta + `admin_user`).
- Criar `customer_profiles`, `employee_profiles`.
- Seed estrutural: catálogo de papéis e permissões.
- **Validação**: integridade referencial, preservação do admin, testes de isolamento.

### Fase 2 — Cadastro e experiência do cliente
- Cadastro pós-login, vínculo Auth → `people` → `cliente`.
- Endereços, preferências, favoritos.
- Welcome personalizado (cliente vs admin).
- **Validação**: fluxo completo de cadastro, perfil persistido.

### Fase 3 — CRUDs administrativos
- Produtos, categorias, fornecedores, serviços, CMS, mimos.
- Cada CRUD: Create/Read/Update/Delete persistindo no Supabase.
- Feedback unificado (loading 3 níveis, sucesso, erro, retry, rollback).
- **Validação**: operações reais, testes de sucesso/falha/permissão negada.

### Fase 4 — Mídia e identidade visual
- `MediaPicker` central (biblioteca + upload, sem duplicação).
- Exclusão segura (desvincular/arquivar/excluir).
- Loading nos 3 níveis, feedback com identidade Angel.
- **Validação**: upload, seleção, exclusão real, referências preservadas.

### Fase 5 — Operação comercial
- Estoque (entrada, saída, ajuste, reserva, histórico).
- Pedidos, pagamentos, PDV (caixa, operador, baixa transacional).
- Atendimento (chamados, mensagens, histórico).
- **Validação**: fluxos transacionais, integridade de estoque.

### Fase 6 — Experiência final e homologação
- Welcome, páginas personalizadas.
- Testes de autorização, isolamento entre tenants.
- TypeScript, lint, build.
- **Validação**: todos os critérios de conclusão atendidos.

### Fase 7 — Auditoria
- `audit_logs` (ou adaptar `auditoria` existente).
- Registrar operações CRUD críticas.
- **Validação**: rastreabilidade de ações.

## 5. Critérios de conclusão

- Conta administrativa principal preservada.
- Identidade única, sem duplicação por e-mail.
- Cliente vinculado à pessoa autenticada.
- Cadastro pós-login funcionando.
- Todos os CRUDs persistindo no banco.
- Relacionamentos entre módulos funcionando.
- Estoque integrado aos pedidos e PDV.
- Biblioteca de mídia centralizada.
- Welcome personalizado para clientes e administradores.
- Permissões verificadas no backend.
- Testes de isolamento entre tenants.

## 6. Governança

Nenhuma alteração no Supabase remoto, migration, seed de autorização, transferência de privilégio ou mudança de RLS sem aprovação específica. Migrations serão revisadas antes da aplicação remota. Rollback planejado para cada migration.

## 7. Próximo passo imediato

Consolidar o SQL de destino completo (todas as tabelas, FKs, índices, constraints) e produzir migrations incrementais com rollback planejado. Apresentar para revisão antes de qualquer aplicação.