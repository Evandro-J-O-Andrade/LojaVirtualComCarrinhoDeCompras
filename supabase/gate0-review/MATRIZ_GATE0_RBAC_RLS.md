# Matriz Gate 0 — RBAC e RLS

## Acesso por papel e operação (proposto)

| Tabela | anon | authenticated (leitura) | service_role | ROOT (is_admin) |
|---|---|---|---|---|
| people | Nenhum | Própria identidade | Total | Total |
| tenants | Nenhum | Tenants onde é membro | Total | Total |
| tenant_memberships | Nenhum | Próprios vínculos | Total | Total |
| roles | Nenhum | Roles dos tenants acessíveis | Total | Total |
| permissions | Nenhum | Catálogo (todos) | Total | Total |
| role_permissions | Nenhum | Via roles acessíveis | Total | Total |
| role_assignments | Nenhum | Próprias atribuições | Total | Total |
| customer_profiles | Nenhum | Próprio perfil | Total | Total |
| employee_profiles | Nenhum | Próprio perfil | Total | Total |
| audit_logs | Nenhum | Nenhuma (ROOT only) | Total | Total |

## Escrita
- `authenticated`: NENHUMA escrita direta. Escritas via service_role (backend).
- `anon`: NENHUMA.
- `service_role`: Total (backend confiável).

## Ressalvas
1. RLS policies para tabelas comerciais ainda não existem (Gate futuro).
2. `is_admin()` mantido como fallback durante transição.
3. `media_assets` não existe (avatar pendente).
4. `people.email` sem UNIQUE constraint (recomendado adicionar).