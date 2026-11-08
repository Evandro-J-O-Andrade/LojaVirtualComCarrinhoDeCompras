# Plano de Testes e Rollback — Gate 0

## Testes positivos
1. Admin (ROOT) consegue SELECT em todas as 10 tabelas
2. Cliente autenticado vê apenas própria identidade
3. Membro ativo vê tenant ao qual pertence
4. Anon não tem acesso a nenhuma das 10 tabelas

## Testes negativos
1. Cliente não pode INSERT/UPDATE/DELETE em people, roles, role_assignments
2. Cliente de tenant A não vê dados de tenant B
3. Anon não pode SELECT em nenhuma tabela protegida
4. Usuário autenticado não-admin não vê audit_logs

## Rollback
- Remover policies adicionadas (DROP POLICY)
- NÃO desabilitar RLS (manter proteção)
- Restaurar privilégios se necessário (mas manter mínimo)
- Reverter tenant/admin via DELETE (documentado em 02)
- Reverter backfill: NÃO possível de forma simples (tenant_id sobrescrito). Mitigação: executar em transação.