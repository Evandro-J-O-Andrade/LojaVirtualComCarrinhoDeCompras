# GAP ANALYSIS FINAL — SUPABASE REAL v1.1

**Status:** Auditoria objetiva **read-only**. Nenhuma migration, INSERT, UPDATE, DELETE, seed, commit ou push.
**Data:** 2026-10-03 (v1.1 — §7 verificação SQL concluída)
**Método:** REST (PostgREST + Storage API, chave anon) **+ SQL read-only** (driver `pg`, `DIRECT_URL`, transação `READ ONLY`, Postgres 17.6).
**Escopo:** confrontar os 6 documentos fechados contra o banco **real** (não contra as migrations locais).

### Legenda
- ✅ **CONFIRMADO** — verificado no remoto (REST e/ou SQL read-only).
- ⚠️ **RISCO/GAP** — existe mas não atende ao contrato ou é inseguro.
- ❌ **AUSENTE** — confirmada ausência no remoto.
- 🔎 **PENDENTE** — não verificável read-only; exige humano autorizado.

> **Correção v1.1:** a v1.0 concluiu (via REST anon) que o bucket `product-images` não existia (`NoSuchBucket`). A verificação SQL provou que o bucket **existe e é público** (criado 2026-09-21). O `NoSuchBucket` foi artefato do método HTTP (GET em vez de POST no endpoint de listagem). §3 corrigido.

---

## §7 — Estado efetivamente aplicado no PostgreSQL remoto (verificação concluída)

| Verificação | Declarado nas migrations | Remoto (SQL read-only) | Evidência | Status |
|---|---|---|---|---|
| 28 tabelas canônicas | ✅ | ✅ 28/28 existem | `information_schema.tables` | ✅ CONFIRMADO |
| `orcamento`/`orcamento_item` | draft (não aplicar) | ❌ não existem | `information_schema.tables` | ✅ CONFIRMADO (ausência) |
| RLS habilitado (todas as tabelas) | ✅ | ✅ 28/28 `relrowsecurity=true` | `pg_class` | ✅ CONFIRMADO |
| Policies RLS (públicas/dono/admin/imutável) | ✅ | ✅ aplicadas com `USING`/`WITH CHECK` reais | `pg_policies` | ✅ CONFIRMADO |
| Índices (FK, trgm, unique parciais) | ✅ | ✅ todos aplicados | `pg_indexes` | ✅ CONFIRMADO |
| Constraints (PK/FK/CHECK/UNIQUE/EXCLUDE) | ✅ | ✅ presentes | `pg_constraint` | ✅ CONFIRMADO |
| Triggers | (não declarados) | ❌ **nenhum** trigger | `information_schema.triggers` | ✅ CONFIRMADO (ausência) |
| Funções definidas pelo usuário | `is_admin()` | ✅ `is_admin` (SECURITY DEFINER, STABLE) | `pg_proc` | ✅ CONFIRMADO |
| Extensões `pg_trgm`/`btree_gist` | ✅ | ✅ instaladas (1.6 / 1.7) | `pg_extension` | ✅ CONFIRMADO |
| `evento` outbox (`idempotency_key`,`tentativas`,`status`) | ✅ | ✅ colunas presentes | `information_schema.columns` | ✅ CONFIRMADO |
| Bucket `product-images` | "já existe, público" | ✅ **EXISTE, `public=true`, 0 objetos** (criado 2026-09-21) | `storage.buckets` | ✅ CONFIRMADO (corrige v1.0) |
| Policies Storage | draft restritivo (is_admin) **não aplicado** | ⚠️ policies **originais e amplas** aplicadas | `pg_policies` (storage) | ⚠️ RISCO |
| `is_admin()` — onde está o role | ✅ | ⚠️ role em `raw_user_meta_data` (metadata **gravável pelo cliente**) | `pg_proc` + `auth.users` | ⚠️ RISCO |
| Admin atribuído a algum usuário | — | ❌ **0 usuários com `role='admin'`** (1 user total, 0 admin, 0 profissional) | `auth.users` | ❌ BLOQUEIO OPERACIONAL |
| Migration history | 5 migrations | ❌ `supabase_migrations.schema_migrations` **VAZIO** (0 linhas) | `supabase_migrations` | ⚠️ GOVERNANÇA |
| `produto.sku` | não tem | ❌ `produto` sem `sku` (variante **tem** `sku` NOT NULL) | `information_schema.columns` | ✅ CONFIRMADO (gap) |
| `pagamento` estorno | não tem | ❌ sem campos/evento de estorno | `information_schema.columns` | ✅ CONFIRMADO (gap) |
| `auditoria.usuario_id` | bigint (cliente) | ✅ `bigint NOT NULL` — mapeia só `cliente` | `information_schema.columns` | ⚠️ GAP (ator profissional/admin) |
| Kit via `produto_opcao_compra` | ✅ | ✅ `kit_composicao.produto_opcao_id` NOT NULL; preço em `preco_proprio` | `information_schema.columns` | ⚠️ DIVERGÊNCIA vs kit=produto |
| RLS de escrita efetiva (anon não escreve) | — | 🔎 **não testado** (read-only proíbe escrita) | — | 🔎 PENDENTE (humano autorizado) |

**Conclusão §7:** estrutura, RLS, índices, constraints, funções e extensões **estão aplicados no remoto** — a v1.0 estava certa ao dizer "tabelas existem", e agora confirmado que **RLS/índices/policies também estão aplicados** (não apenas declarados). Os riscos reais são outros: **storage policies amplas**, **role em metadata gravável**, **zero admins** e **histórico de migrations vazio**.

---

## 1. Camada 1 — SCHEMA (✅ CONFIRMADO via SQL)

### 1.1 Tabelas
**28/28 canônicas existem.** `orcamento`/`orcamento_item` **não existem** (reconciliação é DRAFT não aplicada).

### 1.2 Dados (✅ CONFIRMADO)
`produto`=13, `categoria`=7 (id=1 defeituosa `Esmalgue`/`esmalhe`), `fornecedor`=3 (CNPJ/telefone fictícios), `produto_variante`=1; **outras 24 vazias**. Tudo **seed de desenvolvimento, não patrimônio**.

### 1.3 Colunas-alvo (✅ CONFIRMADO)
- `evento`: `idempotency_key` (nullable), `tentativas`, `status`, `dados jsonb` → outbox real.
- `produto`: **sem `sku`/`codigo`** (gap: produto simples sem SKU). `produto_variante.sku` NOT NULL (ok).
- `pagamento`: `transaction_id`, `provider`, `dados_externos jsonb`, `confirmado_em` — **sem estorno** (gap).
- `auditoria`: `usuario_id bigint NOT NULL` — só `cliente`, sem ator profissional/admin (gap).
- `produto_opcao_compra.preco_proprio` (nullable) + `kit_composicao.produto_opcao_id` (NOT NULL) → kit é modelado como **opção de compra**, não como produto (divergência do Contrato Comercial §6).
- `produto_imagem`: estrutura completa (`url`,`ordem`,`principal`), **0 linhas**.

### 1.4 Divergências schema-vs-contrato (não é "falta tabela" — é "existe mas não atende")
1. **Kit:** via `produto_opcao_compra` ≠ kit=produto+`preco_base` (Comercial §6). → reconciliar (etapa 6), não duplicar.
2. **Eventos:** `evento.nome` CHECK em inglês (`order.created`…) ≠ `dominio.acao` pt-BR (Notificações §11). → normalizar (etapa 6).
3. **Auditoria:** `usuario_id` só cliente ≠ ator profissional/admin (Serviços §10). → ALTERAR.
4. **SKU:** `produto` sem SKU. → ALTERAR.
5. **Estorno:** `pagamento` sem estorno (Comercial §9.7). → ALTERAR/CRIAR.
6. **Desconto comercial:** `pedido.desconto_total` existe, mas **não** há entidade `desconto_comercial` (Comercial §5). → CRIAR.
7. **`produto_opcao_compra`/`produto_opcao_valor`:** mecanismo não previsto no contrato. → avaliar ALTERAR/DEPRECAR (etapa 6).

---

## 2. Camada 2 — SEGURANÇA (✅ policies confirmadas; ⚠️ riscos reais)

### 2.1 RLS/policies aplicadas (✅ CONFIRMADO via `pg_policies`)
- **Pública (anon, SELECT):** `produto`, `produto_variante`, `categoria`, `fornecedor`, `promocao` — todas com `USING (ativo = true)`.
- **Dono (`auth.jwt()->>'email' = cliente.email`):** `cliente`, `endereco`, `carrinho`, `carrinho_item`.
- **Dono ou admin:** `pedido`, `pedido_item`, `pagamento`, `pedido_status_historico`, `atendimento`, `atendimento_mensagem`.
- **Admin apenas (`is_admin()`):** escrita de catálogo, `estoque`, `estoque_movimentacao`, `frete_regra`, leitura de `evento`.
- **Imutável:** `auditoria` — INSERT só `service_role`; SELECT/UPDATE/DELETE `USING(false)` para anon+authenticated.
- **`evento`:** leitura admin, INSERT `service_role` (outbox protegido).

### 2.2 `is_admin()` (✅ CONFIRMADO via `pg_proc`)
`SECURITY DEFINER STABLE`: `SELECT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = auth.uid() AND u.raw_user_meta_data->>'role' = 'admin')`.

### 2.3 Riscos confirmados (⚠️)
1. **Storage policies amplas (RISCO REAL):** as 4 policies aplicadas em `storage.objects` permitem que **qualquer usuário autenticado** faça upload/update/delete de **qualquer objeto** de `product-images` (`Authenticated upload/update/delete`: `bucket_id='product-images' AND auth.uid() IS NOT NULL`). O draft restritivo (só `is_admin()`) **não foi aplicado**. → aplicar policies restritivas após revisão humana.
2. **Role em metadata gravável (RISCO REAL):** `is_admin()` lê `raw_user_meta_data->>'role'`, que é metadata **que o próprio cliente pode editar** (via Auth API), não um claim server-side. Um usuário poderia auto-atribuir `role='admin'` se o fluxo de cadastro não impedir. → migrar role para claim server-side (service-role apenas) ou validar server-side.
3. **Zero admins (BLOQUEIO OPERACIONAL):** `auth.users` tem 1 usuário, **0 com `role='admin'`** e 0 profissional. Logo `is_admin()` retorna **falso para todos** → toda a superfície admin (escrita de produto, estoque, frete, evento) está **inacessível hoje**. → atribuir role admin ao dono (via serviço/server-side, não autoatendimento).
4. **Histórico de migrations vazio (GOVERNANÇA):** `supabase_migrations.schema_migrations` tem **0 linhas** — as tabelas/RLS/índices foram aplicados **fora do sistema de migrations** (SQL manual ou outra ferramenta). `supabase db push` não sabe que já foram aplicados. → etapa 6: backfill do histórico ou aplicar novas migrations com consciência do estado real.
5. **Sem triggers/funções transacionais:** não há triggers nem funções de estoque/pagamento/agendamento no banco → autoridade transacional é **aplicativo**. Anti-double-booking (Serviços §5) precisará de constraint/trigger ou transação application-level.

### 2.4 Pendente (🔎)
- **Teste de escrita read-only não foi feito** (proibido por mandato). Confirmar via humano autorizado que `anon` **não** consegue INSERT/UPDATE em tabelas sensíveis (RLS de escrita efetiva).

---

## 3. Camada 3 — STORAGE (✅ CORRIGIDO: bucket existe e é público)

### 3.1 Estado real (✅ CONFIRMADO via `storage.buckets`)
- Bucket **`product-images` EXISTE**, **`public=true`**, criado **2026-09-21**, com **0 objetos**.
- Policies aplicadas (originais/amplas): `Public bucket read` (public, SELECT); `Authenticated upload/update/delete` (authenticated, `bucket_id='product-images'`).

### 3.2 Correção da v1.0
A v1.0 relatou `NoSuchBucket` via REST anon. Isso foi **artefato do método HTTP** (GET no endpoint de listagem, cujo método correto é POST). A listagem por POST retornou 200 com 0 objetos, e o SQL confirmou o bucket. **O bucket existe e é público**, como o repo afirmava.

### 3.3 Gap de imagens
`product-images` vazio + `produto_imagem` vazia (0 linhas) → **contrato de até 5 imagens por produto sem fonte**. Policies restritivas (draft) **não aplicadas** (ver §2.3.1).

---

## 4. Camada 4 — DADOS E INFRAESTRUTURA

### 4.1 Dados = seed de desenvolvimento (✅ CONFIRMADO)
Não interpretar como patrimônio (Regra de Design §9: mocks/preços fake = descartar).

### 4.2 Infraestrutura aproveitável (✅ CONFIRMADO)
- **`evento`** — outbox com `idempotency_key` + `tentativas` + `status` + índice único parcial `idx_evento_idempotency` → **REUTILIZAR**.
- **`viaCEP`** — Edge Function (TypeScript) para autofill de endereço (D9) → reutilizar.
- **`atendimento`/`atendimento_mensagem`** — threads de suporte → reutilizar.
- **Extensões** `pg_trgm` (busca) e `btree_gist` (exclude constraint de estoque) instaladas.

### 4.3 Migrations
| Migration | Estado no remoto |
|---|---|
| `202609190101_base_schema.sql` | ✅ aplicado (28 tabelas existem) |
| `202609190102_indexes.sql` | ✅ aplicado (índices existem) |
| `202609190103_rls_policies.sql` | ✅ aplicado (policies existem) |
| `202609190103b_rls_additional.sql` | ✅ aplicado (policies das tabelas adicionais existem) |
| `20260920000002_angel_commerce_reconciliation.sql` | ❌ **não aplicado** (`orcamento` 404) — DRAFT |
| `storage/product-images-policies.sql` | ❌ **não aplicado** (policies amplas vigentes) — DRAFT |
| **histórico** | ❌ `schema_migrations` **vazio** (aplicação fora do tracking) |

---

## 5. MATRIZ PRINCIPAL

| Domínio | Status | Ação | Destino |
|---|---|---|---|
| Identidade/Auth | ✅ | reutilizar `auth.users` | SEM ALTERAÇÃO |
| Cliente | ✅ (vazio) | reutilizar | REUTILIZAR |
| Produtos | ✅ (13 seed) | reutilizar + limpar seed + adicionar `sku` | REUTILIZAR + ALTERAR |
| Variantes | ✅ (1 seed, tem `sku`) | reutilizar | REUTILIZAR |
| Imagens | ⚠️ bucket vazio + tabela vazia | popular + aplicar policies restritivas | CONFIGURAR |
| Categorias | ⚠️ id=1 defeituosa | corrigir dados | ALTERAR (dados) |
| Promoções | ✅ (vazia, schema p/ D3) | reutilizar | REUTILIZAR |
| Desconto comercial | ❌ | criar tabela + link | CRIAR |
| Kits | ⚠️ via opção ≠ kit=produto | reconciliar modelo | ALTERAR |
| Carrinho | ✅ (vazio, schema ok) | reutilizar | REUTILIZAR |
| Orçamento | ❌ (404) | criar (reescrito, integrado) | CRIAR |
| Pagamento | ⚠️ sem estorno | reutilizar + adicionar estorno | ALTERAR |
| Pedido | ✅ (snapshot ok) | reutilizar | REUTILIZAR |
| Estoque | ✅ (vazio, D4 ok, exclude constraint) | reutilizar | REUTILIZAR |
| Serviços | ❌ | criar `servico` | CRIAR |
| Profissionais | ❌ | criar `profissional` (link auth.users) | CRIAR |
| Agenda | ❌ | criar `agenda` + `agenda_bloqueio` | CRIAR |
| Agendamento | ❌ | criar `agendamento` + anti-double-booking (trigger/constraint) | CRIAR |
| Eventos | ⚠️ nomes em inglês | reutilizar outbox + normalizar catálogo (pt-BR) | REUTILIZAR + ALTERAR |
| Notificações | ❌ | criar `notificacao` | CRIAR |
| Templates | ❌ | criar `notificacao_template` | CRIAR |
| Preferências | ❌ | criar `notificacao_preferencia` | CRIAR |
| Auditoria | ⚠️ ator só cliente | reutilizar + corrigir ator (profissional/admin) | ALTERAR |
| Storage | ⚠️ policies amplas | aplicar policies restritivas (draft) | CONFIGURAR |
| RLS | ✅ aplicada | manter; testar escrita (humano) | SEM ALTERAÇÃO |
| Auth/RBAC | ⚠️ role em metadata + 0 admins | migrar role p/ claim server-side + atribuir admin | ALTERAR |

---

## 6. MATRIZ DE SEGURANÇA

| Área | Verificação | Status | Ação |
|---|---|---|---|
| Auth | identidade real (`auth.users`) | ✅ | reutilizar |
| Cliente | isolamento por email | ✅ policies | ok |
| Admin | autorização (`is_admin`) | ⚠️ role em metadata + 0 admins | migrar role + atribuir admin |
| Produto | leitura pública | ✅ anon lê ativos | ok |
| Carrinho | somente proprietário | ✅ policies | ok |
| Pedido | proprietário + staff | ✅ policies | ok |
| Orçamento | cliente + vendedor | ❌ não existe | criar com RLS |
| Desconto | somente perfil autorizado | ❌ não existe | criar com RLS (vendedor/admin) |
| Estoque | operações transacionais | ⚠️ sem trigger/função | validar reserva atômica (aplicativo ou trigger) |
| Agenda | conflito transacional | ❌ não existe | criar com constraint/trigger anti-overlap |
| Agendamento | proprietário/staff | ❌ não existe | criar com RLS |
| Notificações | destinatário correto | ❌ não existe | criar com RLS por destinatário |
| Auditoria | ator real | ⚠️ só cliente | corrigir `usuario_id` |
| Storage | acesso por objeto | ⚠️ policies amplas | aplicar restritivas (is_admin) |
| RPC | `SECURITY DEFINER` auditado | ✅ `is_admin` SDEF | revisar role em metadata |
| RLS | nenhuma sensível sem proteção | ✅ 28/28 RLS on | testar escrita (humano) |
| IDOR | IDs não permitem acesso indevido | ✅ policies por dono | ok |

---

## 7. AÇÕES DE VERIFICAÇÃO — STATUS

| # | Verificação | Status |
|---|---|---|
| 1 | `pg_tables` / `information_schema.tables` | ✅ feito (28 tabelas) |
| 2 | `information_schema.columns` | ✅ feito (colunas-alvo) |
| 3 | `pg_constraint` | ✅ feito (PK/FK/CHECK/UNIQUE/EXCLUDE) |
| 4 | `pg_indexes` | ✅ feito (todos aplicados) |
| 5 | `pg_policies` | ✅ feito (USING/WITH CHECK reais) |
| 6 | `pg_class.relrowsecurity` | ✅ feito (28/28 RLS on) |
| 7 | `pg_trigger` | ✅ feito (nenhum trigger) |
| 8 | `pg_proc` | ✅ feito (`is_admin` SDEF/STABLE) |
| 9 | `storage.buckets` | ✅ feito (product-images público, 0 objetos) |
| 10 | `storage.objects` | ✅ feito (vazio) |
| 11 | funções transacionais | ✅ feito (nenhuma — autoridade é aplicativo) |
| 12 | migration history | ✅ feito (`schema_migrations` vazio) |
| — | **teste de escrita RLS** | 🔎 **pendente** (read-only proíbe; humano autorizado) |

---

## 8. FLUXO PARA O MODELO FINAL

```text
SUPABASE ATUAL (auditado e confirmado via SQL)
       │
       ├── REUTILIZAR ── auth.users, cliente, produto(+sku), produto_variante, categoria,
       │                    fornecedor, promocao, carrinho(_item), pedido(_item), pagamento(+estorno),
       │                    estoque(_movimentacao), frete_regra, evento (outbox), atendimento(_mensagem),
       │                    pedido_status_historico, auditoria(+ator), viaCEP, pg_trgm/btree_gist
       ├── ALTERAR ───── kit (reconciliar modelo), evento (catálogo pt-BR), auditoria (ator),
       │                    produto (sku), pagamento (estorno), categoria id=1 (dados),
       │                    RBAC (role p/ claim server-side + atribuir admin)
       ├── CRIAR ─────── desconto_comercial, orcamento(_item), servico, profissional,
       │                    profissional_servico, agenda, agenda_bloqueio, agendamento,
       │                    notificacao, notificacao_template, notificacao_preferencia
       ├── DEPRECAR/AVALIAR─ produto_opcao_compra / produto_opcao_valor (decisão etapa 6)
       └── CONFIGURAR ── storage policies (restritivas), frete_regra (dados), imagens de produto
                              ↓
                     MODELO SUPABASE FINAL
                              ↓
                         MIGRATIONS V1   (com backfill do histórico de migrations)
                              ↓
                      REVISÃO HUMANA
                              ↓
                    AUTORIZAÇÃO EXPLÍCITA
                              ↓
                          APLICAR
```

---

## 9. Resumo executivo

- **Estrutura:** 28/28 tabelas, RLS 28/28, índices, constraints, `is_admin()`, extensões — **tudo confirmado aplicado no remoto** (SQL read-only, Postgres 17.6).
- **Dados:** apenas 4 tabelas têm linhas — **todas seed de desenvolvimento, não patrimônio**.
- **Storage:** `product-images` **existe e é público** (vazio); policies **amplas demais** (risco real) — draft restritivo não aplicado.
- **Riscos críticos de segurança:** (1) storage policies permitem qualquer autenticado alterar imagens; (2) `is_admin()` lê role de metadata gravável pelo cliente; (3) **zero admins** → superfície admin inacessível hoje.
- **Governança:** `schema_migrations` vazio → schema aplicado fora do tracking de migrations.
- **Ausências confirmadas:** `orcamento`/`orcamento_item`, `desconto_comercial`, serviços/agenda/agendamento, notificações/templates/preferências; `produto.sku`, `pagamento.estorno`, ator profissional/admin na auditoria.
- **Aproveitável (não recriar):** `evento` (outbox+idempotência), `viaCEP`, `atendimento`, `auditoria`, núcleo comercial.
- **Pendente:** apenas o **teste de escrita RLS** (read-only proíbe) — humano autorizado.
- **Nenhuma migration foi escrita ou aplicada.** Próximo passo: etapa 6 (MODELO SQL/MIGRATIONS), escrita sobre o **estado real confirmado**, com backfill do histórico.

> **Nenhuma alteração no Supabase foi realizada para produz este documento.** Auditoria read-only (REST + SQL `READ ONLY`).
