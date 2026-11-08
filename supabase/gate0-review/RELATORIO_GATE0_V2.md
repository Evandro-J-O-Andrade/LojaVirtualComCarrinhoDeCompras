# Relatório Gate 0 V2 — Angel Cosméticos

## Correções aplicadas (V2)
1. 01: Adicionado ROOT bypass via is_admin() em todas as 10 tabelas. Rollback não desabilita RLS.
2. 02: Admin UUID resolvido via admin_user (não mais placeholder). Pré-condições rigorosas adicionadas.
3. 03: Backfill mantido com WHERE tenant_id IS NULL (nunca sobrescreve).
4. 04: Validação usa admin_user em vez de primeiro auth.users.
5. 05 (novo): Correção de triggers updated_at vs atualizado_em.

## Documentos adicionais
- MATRIZ_RECONCILIACAO_MIGRATIONS.md
- AUDITORIA_TRIGGERS_ATUALIZACAO.md
- MATRIZ_RLS_COMERCIAL_TENANTS.md
- PLANO_TESTES_E_ROLLBACK_GATE0.md

## Bloqueios restantes
1. Testes em PostgreSQL isolado não executados.
2. RLS policies comerciais não criadas (Gate futuro).
3. media_assets não existe.
4. Aprovação humana explícita necessária.

## Status: PENDENTE DE APLICAÇÃO