# MATRIZ DE VALIDAÇÃO RBAC — ANGEL COSMÉTICOS

**Data:** 2026-10-23
**Status:** Validação read-only (anon). Testes com sessão real pendentes de credenciais.

---

## 1. Função `is_admin()` (remota)

- **Definição:** `SECURITY DEFINER`, `search_path = public, pg_catalog`
- **Owner:** `postgres`
- **Lógica:** Verifica se `auth.uid()` existe em `admin_user`
- **Admin UUID:** `3bf1c769-f4ca-45fe-b52b-ded4de18abc9` (evandro_j.o.a@hotmail.com)

## 2. Políticas RLS relevantes

| Tabela | Policy | Tipo | Condição |
|--------|--------|------|----------|
| `admin_user` | `admin_user_read_admin` | SELECT | `is_admin()` |
| `admin_user` | `admin_user_write_admin` | ALL | `is_admin()` |
| `produto` | `produto_read_anon` | SELECT | true (anon) |
| `produto` | `produto_write_admin` | ALL | `is_admin()` |
| `produto_imagem` | `produto_imagem_read_anon` | SELECT | true (anon) |
| `produto_imagem` | `produto_imagem_write_admin` | ALL | `is_admin()` |
| `produto_categoria` | `produto_categoria_read_admin` | SELECT | `is_admin()` |
| `produto_categoria` | `produto_categoria_write_admin` | ALL | `is_admin()` |
| `profissional_publico` | View (ignora RLS) | SELECT | id, nome de profissionais ativos |

## 3. Matriz de testes RBAC

### 3.1 Testes executados (anon — sem autenticação)

| # | Teste | Comando | Resultado | Status |
|---|-------|---------|-----------|--------|
| RBAC-01 | `is_admin()` retorna `false` para anônimo | `POST /rest/v1/rpc/is_admin` (anon key, body `{}`) | `false` | **CONFIRMADO** |
| RBAC-04 | RLS bloqueia leitura de `admin_user` para anônimo | `GET /rest/v1/admin_user?select=*` (anon key) | `[]` (0 rows) | **CONFIRMADO** |
| RBAC-05 | RLS bloqueia escrita em `produto` para anônimo | `POST /rest/v1/produto` (anon key) | HTTP 401 Unauthorized | **CONFIRMADO** |
| RBAC-09 | RPC `produto_imagem_definir_principal` bloqueada para anônimo | `POST /rest/v1/rpc/produto_imagem_definir_principal` (anon key) | HTTP 401 Unauthorized | **CONFIRMADO** |

### 3.2 Testes pendentes (requerem sessão Auth real)

| # | Teste | Pré-requisito | Critério de aceite |
|---|-------|---------------|-------------------|
| RBAC-02 | `is_admin()` retorna `false` para usuário autenticado não-admin | Conta não-admin no Supabase Auth | Resultado `false` |
| RBAC-03 | `is_admin()` retorna `true` para admin autorizado | JWT do admin (`3bf1c769...`) | Resultado `true` |
| RBAC-06 | RLS permite escrita em `produto` para admin | JWT do admin | HTTP 201 Created |
| RBAC-07 | Storage: upload bloqueado para não-admin | JWT de usuário não-admin | HTTP 403 Forbidden |
| RBAC-08 | Storage: upload permitido para admin | JWT do admin | HTTP 200 OK |
| RBAC-10 | RPC permite troca principal para admin | JWT do admin + ROLLBACK | Troca confirmada, rollback efetivo |
| RBAC-11 | `AdminPermissionContext` conectado a `is_admin()` | RBAC-03 confirmado | `pode()` reflete resultado real |

### 3.3 Testes adicionais necessários

| # | Teste | Descrição |
|---|-------|-----------|
| RBAC-12 | Expiração de sessão | Token expirado → `is_admin()` retorna `false`, redirect para login |
| RBAC-13 | Acesso sem autenticação a rota `/admin` | Redirect para `/entrar` |
| RBAC-14 | Acesso com conta não-admin a rota `/admin` | Redirect ou 403 |
| RBAC-15 | `admin_user` INSERT bloqueado para não-admin | HTTP 403 |
| RBAC-16 | `admin_user` INSERT permitido para admin | HTTP 201 |

---

## 4. Limitações da validação atual

1. **Sem credenciais de admin:** Não é possível obter JWT do admin sem a senha (rotacionada, não compartilhada).
2. **Sem conta não-admin:** Não há usuário de teste não-admin no Supabase Auth.
3. **Sem Storage test:** Upload real requer sessão autenticada.
4. **Sem Edge Function test:** Booking functions não existem (404).

## 5. O que pode ser feito sem credenciais (já feito)

- ✅ Confirmar que `is_admin()` retorna `false` para anon
- ✅ Confirmar que `admin_user` é inacessível para anon
- ✅ Confirmar que INSERT em `produto` é bloqueado para anon
- ✅ Confirmar que RPC `produto_imagem_definir_principal` é bloqueada para anon
- ✅ Verificar que RLS está habilitado em todas as tabelas
- ✅ Verificar que `is_admin()` é `SECURITY DEFINER` com `search_path` fixo
- ✅ Verificar que Storage policies existem (4 policies)

## 6. O que requer credenciais (pendente)

| Credencial necessária | Para qual teste | Como obter |
|----------------------|-----------------|------------|
| Senha do admin (evandro_j.o.a@hotmail.com) | RBAC-03, RBAC-06, RBAC-08, RBAC-10 | Usuário fornece ou executa localmente |
| Conta não-admin no Supabase Auth | RBAC-02, RBAC-07, RBAC-14, RBAC-15 | Criar via Supabase Dashboard ou Auth API |

## 7. Plano de execução quando credenciais estiverem disponíveis

### Fase 1: Autenticar como admin
```
POST /auth/v1/token?grant_type=password
Body: { "email": "evandro_j.o.a@hotmail.com", "password": "<senha>" }
→ Obter access_token (JWT)
```

### Fase 2: Executar testes admin
1. `POST /rest/v1/rpc/is_admin` com JWT admin → esperar `true`
2. `POST /rest/v1/produto` com JWT admin → esperar 201
3. `POST /rest/v1/rpc/produto_imagem_definir_principal` com JWT admin → esperar sucesso
4. Upload para `product-images` com JWT admin → esperar 200

### Fase 3: Autenticar como não-admin
1. Criar conta não-admin via Supabase Dashboard
2. `POST /auth/v1/token?grant_type=password` → obter JWT não-admin
3. `POST /rest/v1/rpc/is_admin` com JWT não-admin → esperar `false`
4. `POST /rest/v1/produto` com JWT não-admin → esperar 403
5. Upload para `product-images` com JWT não-admin → esperar 403

### Fase 4: Conectar AdminPermissionContext
1. Após RBAC-03 confirmado, atualizar `AdminPermissionContext.tsx`
2. Substituir `pode: () => false` por chamada real a `is_admin()` via Supabase
3. Implementar cache de permissão com invalidação em expiração de sessão

---

## 8. Estado atual do AdminPermissionContext

**Arquivo:** `web/src/domains/admin/context/AdminPermissionContext.tsx`

```typescript
// Atual (provisório):
estado: 'pendente'
pode: () => false
motivo: 'Permissões reais chegam com o RBAC na integração do backend'
```

**Não deve ser alterado até que RBAC-03 seja confirmado com sessão real.**

---

## 9. Critérios para liberar a próxima fase

- [ ] RBAC-03 confirmado: `is_admin()` retorna `true` com JWT admin
- [ ] RBAC-06 confirmado: INSERT em `produto` permitido com JWT admin
- [ ] RBAC-02 confirmado: `is_admin()` retorna `false` com JWT não-admin
- [ ] RBAC-05 confirmado (já): INSERT em `produto` bloqueado para anon
- [ ] AdminPermissionContext conectado a `is_admin()` (RBAC-11)
- [ ] Testes automatizados para RBAC (se possível)

---

**4 testes confirmados (anon). 7 testes pendentes (requerem credenciais). Nenhuma alteração foi realizada.**