# Gate 0 — Revisão Técnica

## Objetivo
Preparar a correção da fundação SaaS da Angel Cosméticos: RLS, privilégios, tenant Angel, vínculo do administrador e backfill comercial.

## Arquivos
| Arquivo | Descrição |
|---|---|
| `00_preflight_somente_leitura.sql` | Diagnóstico somente leitura |
| `01_rls_privilegios_PROPOSTA_NAO_EXECUTAR.sql` | RLS + revogação de privilégios |
| `02_tenant_angel_admin_PROPOSTA_NAO_EXECUTAR.sql` | Tenant + admin + índice parcial |
| `03_backfill_tenant_comercial_PROPOSTA_NAO_EXECUTAR.sql` | Backfill tenant_id |
| `04_validacao_posterior_somente_leitura.sql` | Validação pós-aplicação |

## Ordem de execução
1. `00` (somente leitura — diagnóstico)
2. `01` (segurança — RLS + privilégios)
3. `02` (tenant + admin)
4. `03` (backfill comercial)
5. `04` (validação)

## Regras
- Nenhum SQL executado remotamente sem aprovação.
- Administrador principal preservado.
- Dados comerciais preservados.
- Rollback documentado em cada arquivo.

## Pendências
- RLS policies para tabelas comerciais (Gate futuro)
- media_assets table (não existe ainda)
- IdentityProvider frontend (Gate futuro)
- is_admin() fallback (manter durante transição)