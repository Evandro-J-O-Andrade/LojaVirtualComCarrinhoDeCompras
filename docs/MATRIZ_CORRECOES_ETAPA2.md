# MATRIZ DE CORREÇÕES — ANGEL COSMÉTICOS (Etapa 2)

**Branch:** `checkpoint/angel-shell-cinema-green` @ `58c548f`
**Data:** 2026-10-23
**Status:** Revisão read-only completa. Nenhuma escrita remota realizada.
**Governança:** Toda correção requer autorização explícita antes da execução.

---

## 1. Estado Git (preservado)

| Item | Valor |
|------|-------|
| Branch | `checkpoint/angel-shell-cinema-green` |
| HEAD | `58c548f71451dce4fafe7037f64b5bd51e824f26` |
| Modificados | 48 arquivos |
| Deletados (reorganização de assets) | 516 arquivos |
| Não rastreados | 44 arquivos |
| Staged | 1 (`supabase/.temp/pooler-url` — remoção do index) |
| Backup definitivo | `D:\Backups\LojaVirtualComCarrinhoDeCompras\backup-2026-10-23_01-18-25` |

**Verificação:** `git status --porcelain` confirma 609 alterações. Nenhuma foi descartada.

---

## 2. RBAC — Validação com Sessões Reais

### Função `is_admin()` (remota)
- **Definição:** `SECURITY DEFINER`, `search_path = public, pg_catalog`, verifica `auth.uid()` contra `admin_user`.
- **Owner:** `postgres`
- **Admin UUID:** `3bf1c769-f4ca-45fe-b52b-ded4de18abc9`

### Matriz de Testes RBAC

| # | Teste | Comando / Arquivo | Critério de Aceite | Status |
|---|-------|-------------------|-------------------|--------|
| RBAC-01 | `is_admin()` retorna `false` para anônimo | `POST /rest/v1/rpc/is_admin` (anon key) | Resultado `false` | **CONFIRMADO** — retornou `false` |
| RBAC-02 | `is_admin()` retorna `false` para usuário autenticado sem admin | REST com JWT de usuário não-admin | Resultado `false` | **Não executado** — requer sessão Auth real |
| RBAC-03 | `is_admin()` retorna `true` para admin autorizado | REST com JWT do admin (`3bf1c769...`) | Resultado `true` | **Não executado** — requer sessão Auth real |
| RBAC-04 | RLS bloqueia leitura de `admin_user` para anônimo | `GET /rest/v1/admin_user` (anon key) | HTTP 401/403 ou array vazio | **CONFIRMADO** — retornou `[]` (0 rows) |
| RBAC-05 | RLS bloqueia escrita em `produto` para não-admin | `POST /rest/v1/produto` (anon key) | HTTP 401/403 | **CONFIRMADO** — retornou HTTP 401 |
| RBAC-06 | RLS permite escrita em `produto` para admin | `POST /rest/v1/produto` (admin JWT) | HTTP 201 | **Não executado** |
| RBAC-07 | Storage: upload bloqueado para não-admin | Upload para `product-images` (anon key) | HTTP 403 | **Não executado** |
| RBAC-08 | Storage: upload permitido para admin | Upload para `product-images` (admin JWT) | HTTP 200 | **Não executado** |
| RBAC-09 | RPC `produto_imagem_definir_principal` bloqueada para não-admin | `POST /rest/v1/rpc/produto_imagem_definir_principal` (anon key) | HTTP 403 | **Não executado** |
| RBAC-10 | RPC permite troca principal para admin | `POST` com admin JWT, validar `ROLLBACK` | Troca confirmada, rollback efetivo | **Validado em staging** — requer revalidação com sessão real |
| RBAC-11 | `AdminPermissionContext` conectado a `is_admin()` | `web/src/domains/admin/context/AdminPermissionContext.tsx` | `pode()` reflete resultado real da RPC | **Pendente** — atualmente retorna `() => false` hardcoded |

**Arquivos envolvidos:**
- `web/src/domains/admin/context/AdminPermissionContext.tsx` — seam de autorização (atualmente `estado: 'pendente'`)
- `web/src/lib/supabase.ts` — cliente (anon key only, correto)
- Migrations: `20261011000002_rbac_admin_storage_revised.sql`, `20261011000003_rls_produto_imagem_anon_read_revised.sql`, `20261011000004_produto_imagem_unique_principal_revised.sql`

**Correção P0 (autorização pendente):** Conectar `AdminPermissionContext` ao resultado de `is_admin()` via chamada Supabase Auth. Atualizar `pode()` para refletir permissões reais por ação.

---

## 3. Reconciliação de Migrations

### Estado: 15 locais vs 13 remotas

| Migration Local | Registrada Remotamente? | Objetos Existem? | Ação Necessária |
|-----------------|------------------------|-------------------|-----------------|
| `202609190101_base_schema.sql` | Sim | Sim | Nenhuma |
| `202609190102_indexes.sql` | Sim | Sim | Nenhuma |
| `202609190103_rls_policies.sql` | Sim | Sim | Nenhuma |
| `202609190103b_rls_additional.sql` | **Não** | Sim (manual) | Registrar no histórico (idempotente) |
| `20261003000001_backfill_historico_migrations.sql` | Sim | Sim | Nenhuma |
| `20261003000002_orcamento_desconto_comercial.sql` | Sim | **Não** (5 tabelas ausentes) | Aplicar (idempotente) — autorização pendente |
| `20261003000003_servicos_agendamento.sql` | Sim | **Não** (7 tabelas + view ausentes) | Aplicar (idempotente) — autorização pendente |
| `20261003000004_notificacoes_eventos.sql` | Sim | **Não** (3 tabelas + ALTER ausentes) | Aplicar (idempotente) — autorização pendente |
| `20261003000005_mimos_diarios.sql` | Sim | **Não** (2 tabelas ausentes) | Aplicar (idempotente) — autorização pendente |
| `20261003000006_alteracoes_comerciais.sql` | Sim | **Não** (ALTERs + 1 tabela) | Aplicar (idempotente) — autorização pendente |
| `20261003000008_indexes.sql` | Sim | **Não** (30+ índices) | Aplicar (idempotente) — autorização pendente |
| `20261011000002_rbac_admin_storage_revised.sql` | Sim | Sim (aplicado) | Nenhuma |
| `20261011000003_rls_produto_imagem_anon_read_revised.sql` | Sim | Sim (aplicado) | Nenhuma |
| `20261011000004_produto_imagem_unique_principal_revised.sql` | Sim | Sim (aplicado) | Nenhuma |
| `20261011000005_produto_imagem_principal_testes.sql` | **Não** | **Não** | **NÃO aplicar em produção** — apenas testes |

### Tabelas confirmadas ausentes (18 — via REST, HTTP 404)
`orcamento`, `orcamento_item`, `desconto_comercial`, `condicao_pagamento`, `orcamento_status_historico`, `servico`, `profissional`, `profissional_servico`, `agenda`, `agenda_bloqueio`, `agendamento`, `notificacao`, `notificacao_template`, `notificacao_preferencia`, `mimo`, `mimo_produto`, `pagamento_estorno`, `kit`

### Tabelas existentes (9 — via REST, HTTP 200)
`produto` (13 rows), `categoria` (7 rows), `produto_imagem` (14 rows), `admin_user` (0 rows — RLS), `evento` (0 rows), `cliente` (0 rows), `pedido` (0 rows), `kit_composicao` (0 rows), `auditoria` (0 rows)

### Colunas confirmadas ausentes (4)
`produto.sku`, `kit_composicao.kit_produto_id`, `auditoria.ator_auth_id`, `auditoria.ator_tipo`

### Dados pendentes
- `categoria` id=1: "Esmalgue" → deve ser "Esmaltes" (correção de nome)
- `produto_imagem` id=1: VTEX URL (preservada como principal)
- `produto_imagem` id=2: VTEX URL (definida como não-principal via migration 004)

**Correção P1 (autorização pendente):** Aplicar migrations 002-008 em ordem de dependência, com validação idempotente. Registrar `202609190103b` no histórico. Corrigir nome da categoria id=1.

---

## 4. Catálogo — Estado Atual

### Produtos (13 registros)

| ID | Nome | Categoria | Preço | Fornecedor | Descrição | Imagem Principal | Status |
|----|------|-----------|-------|------------|-----------|-------------------|--------|
| 1 | Esmalte Cristal Vermelho | (null) | 29.90 | (null) | "Esmalte brilhante de alta qualidade" | VTEX (real) | Ativo |
| 14 | Batom Matte Vermelho | (null) | 89.90 | 11 | (vazio) | placehold.co | Ativo |
| 15 | Base Liquida Clara | (null) | 120.00 | 11 | (vazio) | placehold.co | Ativo |
| 16 | Mascara de Cabelos | (null) | 95.00 | 12 | (vazio) | placehold.co | Ativo |
| 17 | Sabonete Liquido | (null) | 45.00 | 10 | (vazio) | placehold.co | Ativo |
| 18 | Esmalte Vermelho | (null) | 25.00 | 11 | (vazio) | placehold.co | Ativo |
| 19 | Alcool Gel | (null) | 32.00 | 10 | (vazio) | placehold.co | Ativo |
| 20 | Protetor Solar | (null) | 89.00 | 12 | (vazio) | placehold.co | Ativo |
| 21 | Shampoo Antiresiduo | (null) | 65.00 | 12 | (vazio) | placehold.co | Ativo |
| 22 | Hidratante Labial | (null) | 28.00 | 11 | (vazio) | placehold.co | Ativo |
| 23 | Mascara Facial | (null) | 55.00 | 10 | (vazio) | placehold.co | Ativo |
| 24 | Oleo Capilar | (null) | 72.00 | 12 | (vazio) | placehold.co | Ativo |
| 25 | Desodorante Roll-on | (null) | 38.00 | 10 | (vazio) | placehold.co | Ativo |

**Problemas identificados:**
1. `categoria_id` é `null` em todos os 13 produtos — nenhum está vinculado a categoria.
2. 12 de 13 produtos têm descrição vazia.
3. 12 de 13 produtos usam `placehold.co` como imagem (placeholder, não real).
4. Apenas produto 1 tem imagem VTEX real e descrição.
5. Preços existem (25.00 a 120.00) mas não foram validados contra fonte confiável.
6. Storage `product-images` tem 0 objetos — todas as imagens são externas.

### Categorias (7 registros)

| ID | Nome | Slug | Status |
|----|------|------|--------|
| 1 | Esmalgue | esmalhe | Ativo (nome incorreto) |
| 20 | Maquiagem | maquiagem | Ativo |
| 21 | Cuidados com a Pele | cuidados-pele | Ativo |
| 22 | Cabelos | cabelos | Ativo |
| 23 | Corpo e Banho | corpo-banho | Ativo |
| 24 | Acessorios | acessorios | Ativo |
| 25 | Promocoes | promocoes | Ativo |

**Correção P1 (autorização pendente):**
- Corrigir `categoria` id=1: "Esmalgue" → "Esmaltes", slug "esmalhe" → "esmaltes"
- Vincular produtos às categorias corretas
- Substituir placeholders por imagens reais (upload para Storage `product-images`)
- Completar descrições e preços com fontes confiáveis

---

## 5. Módulos Comerciais — Estado e Arquivos

### 5.1 Catálogo / Categorias
- **Arquivos:** `web/src/domains/catalogo/`, `web/src/domains/categorias/`
- **Estado:** Produtos existem no DB, mas sem categoria, preços, descrições reais ou imagens válidas.
- **Critério de conclusão:** Cada produto tem categoria, preço, descrição e imagem válida (Storage ou VTEX confirmada). Nenhum placeholder tratado como dado oficial.

### 5.2 Orçamentos
- **Arquivos:** `web/src/domains/orcamentos/`
- **Estado:** Módulo completo no frontend, mas tabelas `orcamento`, `orcamento_item`, `desconto_comercial`, `condicao_pagamento`, `orcamento_status_historico` **não existem** no remoto.
- **Critério de conclusão:** Migrations 002-006 aplicadas, tabelas criadas, RLS validada, fluxo de criação/edição/testado com sessão admin real.

### 5.3 Serviços / Agendamentos
- **Arquivos:** `web/src/domains/servicos/`, `web/src/domains/agendamentos/`
- **Estado:** Módulo completo no frontend, mas tabelas `servico`, `profissional`, `profissional_servico`, `agenda`, `agenda_bloqueio`, `agendamento` **não existem** no remoto.
- **Critério de conclusão:** Migrations 003 aplicada, tabelas criadas, fluxo de agendamento testado end-to-end.

### 5.4 Mimos
- **Arquivos:** `web/src/domains/mimos/`
- **Estado:** Módulo frontend existe, mas tabelas `mimo`, `mimo_produto` **não existem** no remoto.
- **Critério de conclusão:** Migration 005 aplicada, estrutura comercial definida, persistência validada.

### 5.5 Notificações / Eventos
- **Arquivos:** `web/src/domains/notificacoes/`, `web/src/domains/eventos/`
- **Estado:** Tabelas `notificacao`, `notificacao_template`, `notificacao_preferencia` **não existem** no remoto. Eventos têm tabela `evento` mas sem dados.
- **Critério de conclusão:** Migration 004 aplicada, templates e preferências criados, fluxo de notificação testado.

### 5.6 Conta / Pedidos
- **Arquivos:** `web/src/domains/conta/`, `web/src/domains/pedidos/`
- **Estado:** Frontend existe, mas `cliente.auth_user_id` não existe (migration pendente). Sem integração real com pedidos/orçamentos.
- **Critério de conclusão:** Migration para `cliente.auth_user_id` criada e aplicada (autorização pendente), RLS atualizada, histórico de pedidos funcional.

---

## 6. Arquivos de Correção Prioritários

| Prioridade | Arquivo | Correção | Dependência |
|------------|---------|----------|-------------|
| P0 | `web/src/domains/admin/context/AdminPermissionContext.tsx` | Conectar a `is_admin()` via Supabase Auth | RBAC validado com sessão real |
| P0 | `supabase/migrations/202609190103b_rls_additional.sql` | Registrar no histórico remoto (idempotente) | Autorização |
| P1 | `supabase/migrations/20261003000002_orcamento_desconto_comercial.sql` | Aplicar (5 tabelas) | Autorização |
| P1 | `supabase/migrations/20261003000003_servicos_agendamento.sql` | Aplicar (7 tabelas + view) | Autorização |
| P1 | `supabase/migrations/20261003000004_notificacoes_eventos.sql` | Aplicar (3 tabelas + ALTER) | Autorização |
| P1 | `supabase/migrations/20261003000005_mimos_diarios.sql` | Aplicar (2 tabelas) | Autorização |
| P1 | `supabase/migrations/20261003000006_alteracoes_comerciais.sql` | Aplicar (ALTERs + 1 tabela) | Autorização |
| P1 | `supabase/migrations/20261003000008_indexes.sql` | Aplicar (30+ índices) | Autorização |
| P1 | Categoria id=1 no DB | Corrigir "Esmalgue" → "Esmaltes" | Autorização |
| P1 | Produtos 1-25 no DB | Vincular categorias, completar preços/descrições | Fontes confiáveis |
| P2 | `web/src/domains/orcamentos/` | Ativar apenas após migrations aplicadas | Migrations 002 |
| P2 | `web/src/domains/servicos/` | Ativar apenas após migrations aplicadas | Migrations 003 |
| P2 | `web/src/domains/mimos/` | Ativar apenas após migrations aplicadas | Migrations 005 |
| P2 | `web/src/domains/notificacoes/` | Ativar apenas após migrations aplicadas | Migrations 004 |

---

## 7. Critérios de Conclusão da Etapa 2

- [ ] Nenhuma página comercial apresentada como funcional quando seu backend está ausente.
- [ ] Nenhuma descrição, preço, imagem ou estoque fictício tratado como dado oficial.
- [ ] Nenhuma permissão administrativa validada apenas por testes estáticos.
- [ ] Nenhuma migration, seed, alteração remota ou publicação executada sem autorização.
- [ ] Cada correção ligada a arquivos, testes e evidências verificáveis.

---

## 8. Próximos Passos (ordem de execução)

1. **Autorizar validação RBAC** — Executar testes RBAC-01 a RBAC-10 com sessões Auth reais (admin e não-admin).
2. **Autorizar aplicação de migrations** — Aplicar 002-008 em ordem, com validação idempotente antes de cada uma.
3. **Autorizar correção de dados** — Corrigir categoria id=1, vincular produtos, completar campos pendentes.
4. **Autorizar upload de imagens** — Upload de imagens reais para Storage `product-images`, substituir placeholders.
5. **Conectar AdminPermissionContext** — Integrar com resultado de `is_admin()` após RBAC validado.
6. **Ativar módulos frontend** — Um por vez, com evidência de rota, consulta, persistência, autorização e erro.

---

**Fim da matriz. Nenhuma ação foi executada. Aguardando autorização para cada item.**