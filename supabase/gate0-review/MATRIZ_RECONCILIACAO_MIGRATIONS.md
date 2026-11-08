# Matriz de Reconciliação de Migrations — Angel Cosméticos

## Resumo
- 24 arquivos SQL em `supabase/migrations/`
- 23 migrations registradas no Supabase remoto
- Diferença: `202609190103b_rls_additional.sql` existe no GitHub mas não aparece no histórico remoto

## Migrations registradas vs arquivos

| Arquivo | Registrado remoto | Observação |
|---|---|---|
| 202609190101_base_schema.sql | Sim | Schema base |
| 202609190102_indexes.sql | Sim | Índices |
| 202609190103_rls_policies.sql | Sim | RLS policies |
| 202609190103b_rls_additional.sql | Não | Existe no GitHub, não registrado. Policies podem ter sido aplicadas manualmente |
| 20261003000001_backfill_historico_migrations.sql | Sim | Backfill |
| 20261003000002_orcamento_desconto_comercial.sql | Sim | Orçamento |
| 20261003000003_servicos_agendamento.sql | Sim | Serviços/agendamento |
| 20261003000004_notificacoes_eventos.sql | Sim | Notificações |
| 20261003000005_mimos_diarios.sql | Sim | Mimos |
| 20261003000006_alteracoes_comerciais.sql | Sim | Alterações comerciais |
| 20261003000008_indexes.sql | Sim | Índices |
| 20261011000002_rbac_admin_storage_revised.sql | Sim | RBAC admin storage |
| 20261011000003_rls_produto_imagem_anon_read_revised.sql | Sim | RLS produto_imagem |
| 20261011000004_produto_imagem_unique_principal_revised.sql | Sim | Unique principal |
| 20261025000001_cliente_auth_user_id.sql | Sim | cliente.auth_user_id |
| 20261027000001_reconciliacao_schema.sql | Sim | Reconciliação |
| 20261027095005_frontend_schema_hardening.sql | Sim | Hardening |
| 20261102000001_cms_servicos_clientes.sql | Sim | CMS/serviços/clientes |
| 20261106000001_identity_foundation.sql | Sim | people/tenants/memberships |
| 20261106000002_rbac_saas.sql | Sim | RBAC SaaS |
| 20261106000003_profiles_saas.sql | Sim | Perfis |
| 20261106000004_audit_logs_saas.sql | Sim | Auditoria |
| 20261106000005_seed_rbac_saas.sql | Sim | Seed RBAC |
| 20261106000006_tenant_id_commercial.sql | Sim | tenant_id comercial |

## Conclusão
Não reaplicar migrations. A diferença (0103b) pode ter sido aplicada manualmente. Comparar schema real com arquivos para confirmar.