# Fase 1 — Revisão Técnica das Migrations

Modo: somente leitura. Nenhuma migration aplicada.

## 1. Matriz de aprovação

| Migration | SQL/Sintaxe | Dependências | Integridade | RBAC/RLS | Seed | Rollback | Resultado |
|---|---|---|---|---|---|---|---|
| 000001 identity_foundation | OK | OK (sem deps externas) | OK | N/A (sem RLS nesta migration) | N/A | OK | Aprovado |
| 000002 rbac_saas | OK | OK (depende de 000001) | OK | Parcial (RLS não definida aqui) | Parcial | OK | Aprovado com ressalvas |
| 000003 profiles_saas | OK | OK (depende de 000001) | OK | N/A | N/A | OK | Aprovado |
| 000004 audit_logs_saas | OK | OK (depende de 000001) | OK | N/A | N/A | OK | Aprovado |
| 000005 seed_rbac_saas | OK | OK (depende de 000001, 000002) | OK | N/A | OK (idempotente) | OK | Aprovado |
| 000006 tenant_id_commercial | OK | OK (depende de 000001) | OK | N/A | N/A (populate manual) | OK | Aprovado com ressalvas |

## 2. Achados por migration

### 000001 — identity_foundation
- **PKs**: UUID com `gen_random_uuid()` — OK.
- **FKs**: `people.auth_user_id → auth.users(id)` ON DELETE SET NULL — preserva pessoa se conta Auth for deletada.
- **tenant_memberships**: FKs para people e tenants com CASCADE — OK.
- **UNIQUE**: `(person_id, tenant_id)` em memberships; `username` e `auth_user_id` em people — OK.
- **CHECK**: status em ('active','inactive','suspended') — OK.
- **Índices**: criados para auth_user_id, username, person_id, tenant_id — OK.
- **Triggers**: `update_atualizado_em()` recriada com `SET search_path = ''` — OK.
- **Ressalva**: `people.email` não tem constraint UNIQUE. Pode permitir duplicação de e-mail. Recomendação: adicionar UNIQUE ou índice parcial.

### 000002 — rbac_saas
- **roles**: `tenant_id` nullable (permite papéis globais/system). UNIQUE (tenant_id, slug) — OK.
- **permissions**: slug UNIQUE global — OK.
- **role_permissions**: PK composta — OK.
- **role_assignments**: UNIQUE (person_id, tenant_id, role_id) — OK.
- **Ressalva**: RLS não está definida nesta migration. As políticas de acesso a roles/permissions/assignments precisam ser criadas em migration separada. Isso é aceitável para Fase 1, mas deve ser documentado como pendência.

### 000003 — profiles_saas
- **FKs**: person_id → people, tenant_id → tenants, ambos CASCADE — OK.
- **UNIQUE**: (person_id, tenant_id) — OK.
- **Ressalva**: `customer_profiles` e `employee_profiles` podem coexistir para a mesma pessoa/tenant. Isso é intencional (pessoa pode ser cliente e funcionário). OK.

### 000004 — audit_logs_saas
- **FKs**: tenant_id e person_id com ON DELETE SET NULL — preserva logs mesmo se tenant/pessoa for deletada — OK.
- **Índices**: tenant, person, entity, created_at — OK.
- **Ressalva**: Sem particionamento por data. Para alto volume, considerar particionamento futuro. Não bloqueante.

### 000005 — seed_rbac_saas
- **Idempotência**: Todos os INSERTs usam ON CONFLICT DO NOTHING — OK.
- **Roles de sistema**: tenant_id IS NULL (globais) — OK.
- **Admin recebe todas as permissions** via CROSS JOIN — OK.
- **Ressalva**: O seed de role_assignments para o admin principal NÃO está neste arquivo. Está documentado em `RECONCILIACAO_ADMIN_PRINCIPAL.md` como procedimento manual. Isso é correto (não queremos auto-atribuir privilégios sem aprovação).

### 000006 — tenant_id_commercial
- **Aditivo**: Usa ADD COLUMN IF NOT EXISTS — não destrói dados — OK.
- **FKs**: REFERENCES tenants(id) sem ON DELETE (default NO ACTION) — OK para preservação.
- **Índices**: criados para todas as tabelas — OK.
- **Ressalvas**:
  1. `tenant_id` não é NOT NULL nesta migration. Deve ser preenchido manualmente (Passo 5 da reconciliação) antes de tornar NOT NULL.
  2. `cliente.person_id` adicionado mas sem NOT NULL — correto para transição.
  3. A tabela `variante` / `opcao_compra` não recebeu tenant_id. Avaliar se herda do produto.
  4. `status_agendamento` (catálogo) não recebeu tenant_id — correto se for global.

## 3. Ordem de execução

```
000001 (identity) → 000002 (RBAC) → 000003 (profiles) → 000004 (audit) → 000005 (seed) → 000006 (tenant_id)
```

Dependências respeitadas:
- 000002 depende de 000001 (people, tenants) ✓
- 000003 depende de 000001 ✓
- 000004 depende de 000001 ✓
- 000005 depende de 000001 + 000002 ✓
- 000006 depende de 000001 ✓

## 4. Pendências antes da aplicação

1. **RLS policies**: Nenhuma migration cria RLS para as novas tabelas. Precisa de migration adicional (000007) com policies de isolamento por tenant.
2. **tenant_id NOT NULL**: Após popular, alterar para NOT NULL nas tabelas comerciais.
3. **people.email UNIQUE**: Adicionar constraint.
4. **variante/opcao_compra**: Avaliar tenant_id.
5. **is_admin() fallback**: Manter durante transição.
6. **Admin principal**: Executar procedimento manual de reconciliação (documentado).
7. **Testes de isolamento**: Criar testes de integração para validar RLS entre tenants.

## 5. Resultado

**Aprovação técnica com ressalvas.** As 6 migrations são estruturalmente sound e preservam dados existentes. As ressalvas são não-bloqueantes e podem ser endereçadas em migrations adicionais. Nenhuma migration deve ser aplicada remotamente sem aprovação explícita.