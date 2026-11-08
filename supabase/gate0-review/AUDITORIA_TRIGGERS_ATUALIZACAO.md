# Auditoria de Triggers de Atualização — Angel Cosméticos

## Problema identificado
A função `public.update_atualizado_em()` foi sobrescrita pela migration `20261106000001_identity_foundation.sql` para atualizar `NEW.updated_at`, mas 8 tabelas antigas usam a coluna `atualizado_em`.

## Tabelas afetadas (coluna atualizado_em)
- chamado
- cliente_preferencia
- experiencia
- pagina
- pagina_bloco
- pagina_secao
- servico
- servico_categoria

## Tabelas novas (coluna updated_at)
- people
- tenants
- tenant_memberships
- roles
- customer_profiles
- employee_profiles
- audit_logs

## Causa raiz
Migration `20261102000001` criou a função para `atualizado_em`.
Migration `20261106000001` fez `CREATE OR REPLACE FUNCTION` mudando para `updated_at`.
Resultado: triggers nas tabelas antigas agora tentam atualizar `NEW.updated_at` que não existe → erro em UPDATE.

## Correção proposta
Arquivo `05_fix_triggers_PROPOSTA_NAO_EXECUTAR.sql` — função que detecta TG_TABLE_NAME e atualiza a coluna correta.

## Validação necessária
- Testar UPDATE em cada uma das 8 tabelas antigas
- Testar UPDATE em cada uma das 7 tabelas novas
- Confirmar que nenhum trigger falha