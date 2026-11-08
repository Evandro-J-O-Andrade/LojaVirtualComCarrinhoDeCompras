# Matriz RLS Comercial — Tenants

## Policies existentes (pré-SaaS)
| Tabela | Policy | Condição | Tenant-aware? |
|---|---|---|---|
| produto | produto_read_active | ativo = true | Não |
| produto | produto_write_admin | is_admin() | Não (global admin) |
| produto_imagem | (anon read) | bucket public | Não |
| cliente | cliente_select_own | email = jwt email OU auth_user_id = uid | Parcial |
| pedido | (várias) | auth.uid() ou is_admin() | Não |
| servico | (várias) | ativo/visivel | Não |

## Gap identificado
Nenhuma policy comercial filtra por tenant_id. Após backfill, os dados terão tenant_id mas as policies não usarão essa informação.

## Recomendação
Criar policies tenant-aware em Gate futuro (pós-Gate 0), após validação da fundação. Não implementar agora sem matriz de impacto.