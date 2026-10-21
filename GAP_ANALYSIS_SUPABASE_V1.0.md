# GAP ANALYSIS FINAL — SUPABASE REAL v1.0

**Status:** Auditoria objetiva **read-only**. Nenhuma migration, INSERT, UPDATE, DELETE, seed, commit ou push.
**Data:** 2026-10-03
**Método:** REST (PostgREST + Storage API) com chave **anon** + leitura das migrations locais.
**Escopo:** confrontar os 6 documentos fechados (Funcional, Design, Mimos, Comercial, Serviços/Agendamento, Notificações) contra o banco real.

### Legenda de verificação
- ✅ **VERIFICADO (REST)** — confirmado via leitura read-only.
- 📄 **DEFINIDO (migration local)** — definido em migration local; **aplicação real não confirmada**.
- 🔍 **VERIFICAR (SQL)** — exige inspeção SQL/service_role; **não é verificável via REST read-only**.
- ❌ **NÃO EXISTE (REST 404)** — ausência confirmada via REST.

> **Regra aplicada:** "tabela existe" ≠ "domínio correto/seguro". Existência e correção são reportadas separadamente.

---

## 0. Limitação metodológica (crítica)

A chave **anon** permite apenas **leitura**. Consequências:
1. **RLS aplicada?** Não é possível confirmar via REST se as policies/indexes/triggers/funções estão aplicados no remoto (só o comportamento de leitura anon).
2. **Escrita:** testes de INSERT/UPDATE/DELETE são proibidos (read-only) → RLS de escrita **não verificável** aqui.
3. **Storage:** anon só vê buckets **públicos**; um bucket privado seria invisível.
4. **Dados sensíveis:** tabelas protegidas e vazias não revelam se RLS está ativo.

**Tudo que depende desses pontos está marcado 🔍 VERIFICAR (SQL)** e consolidado em §9 (ações obrigatórias antes de qualquer migration).

---

## 1. Camada 1 — SCHEMA

### 1.1 Tabelas (✅ VERIFICADO via REST)
As **28 tabelas canônicas existem**. `orcamento` e `orcamento_item` **não existem** (❌ 404 PGRST205 — reconciliação é DRAFT não aplicada).

### 1.2 Dados (✅ VERIFICADO)
| Tabela | Linhas | Classificação |
|---|---:|---|
| `produto` | **13** | seed de desenvolvimento (não é patrimônio) |
| `categoria` | **7** | seed; **id=1 defeituosa** (`Esmalgue`/`esmalhe`) |
| `fornecedor` | **3** | seed com CNPJ/telefone **fictícios** |
| `produto_variante` | **1** | seed |
| outras 24 | **0** | vazias |

### 1.3 Colunas/constraints (📄 DEFINIDO local; aplicação de índices/triggers 🔍 VERIFICAR)
Estrutura completa em `202609190101_base_schema.sql` (PK/FK/CHECK por tabela) e `202609190102_indexes.sql` (índices + unique parciais + exclude constraint de estoque).

### 1.4 Divergências schema-vs-contrato (não é "falta tabela" — é "existe mas não atende")
1. **Kit:** schema modela kit como `produto_opcao_compra(tipo='kit')` + `kit_composicao` (preço em `preco_proprio`). Contrato (Comercial §6) decidiu **kit = `produto` com `preco_base` próprio + composição**. → **reconciliar modelo** (etapa 6), não criar tabela paralela.
2. **Eventos:** `evento.nome` CHECK usa nomes em inglês (`order.created`…). Contrato (Notificações §11) decidiu `dominio.acao` em pt-BR. → **normalizar catálogo** (etapa 6).
3. **Auditoria:** `auditoria.usuario_id bigint` mapeia só `cliente.id`; **não** suporta profissional/admin como ator (Serviços §10). → **ALTERAR**.
4. **SKU:** `produto_variante.sku` existe; `produto` **não** tem `sku`/`codigo` (produto simples sem SKU). → **ALTERAR** (adicionar).
5. **Estorno:** `pagamento` não tem campos/evento de estorno (Comercial §9.7). → **ALTERAR/CRIAR**.
6. **Desconto comercial:** `pedido.desconto_total` existe, mas **não** há entidade `desconto_comercial` nem link (Comercial §5). → **CRIAR**.
7. **Orçamento:** `pedido` tem snapshot completo, mas `orcamento`/`orcamento_item` **não existem** (Comercial §8). → **CRIAR** (reescrito, com desconto comercial, condição de pagamento, histórico, conversão).
8. **`produto_opcao_compra`/`produto_opcao_valor`:** mecanismo de "opção de compra" (quantidade/kit/custom) não previsto no contrato Comercial. → **avaliar ALTERAR ou DEPRECAR** (etapa 6), não duplicar.

---

## 2. Camada 2 — SEGURANÇA

### 2.1 Policies definidas (📄 DEFINIDO local; aplicação 🔍 VERIFICAR)
- **`is_admin()`** — `SECURITY DEFINER STABLE`, verifica `auth.users.raw_user_meta_data->>'role'='admin'`.
- **Leitura pública (anon):** `produto`, `produto_variante`, `categoria`, `fornecedor`, `promocao` (somente `ativo=true`).
- **Dono (via `auth.jwt()->>'email' = cliente.email`):** `cliente`, `endereco`, `carrinho`, `carrinho_item`.
- **Dono ou admin:** `pedido`, `pagamento`, `pedido_status_historico`, `atendimento`, `atendimento_mensagem`.
- **Admin apenas:** catálogo (escrita), `estoque`, `estoque_movimentacao`, `frete_regra`, `evento` (leitura).
- **Imutável:** `auditoria` — INSERT só por `service_role`; SELECT/UPDATE/DELETE negados (`USING(false)`) para anon+authenticated.
- **RLS adicional (0103b):** `produto_atributo(_valor)`, `produto_categoria`, `produto_imagem`, `produto_variante_atributo` — com guards `IF NOT EXISTS`.

### 2.2 Comportamento observado (✅ VERIFICADO via REST)
- **anon consegue ler `produto` (13 linhas)** → consistente com política pública **OU** RLS desligado — **indistinguível via REST**. 🔍
- Tabelas sensíveis (`cliente`, `pedido`, `carrinho`, `auditoria`, `evento`) retornam vazio para anon — mas estão vazias, então **não prova** que RLS as protege. 🔍

### 2.3 Riscos identificados
1. **🔍 Aplicação de RLS não confirmada:** as migrations carregam o cabeçalho *"Status: Derivation only — DO NOT APPLY to Supabase"*, mas as tabelas **existem** no remoto. Não é possível confirmar via REST se as policies/índices/triggers foram de fato aplicados. **Risco:** se RLS não estiver ativa, tabelas sensíveis poderiam estar expostas.
2. **Storage policies (📄 DRAFT, NÃO APLICADAS):** o próprio arquivo flagra que as policies atuais de upload/update/delete são **"excessivamente amplas"** (qualquer autenticado pode upload/update/delete). Proposta restringe a `is_admin()`.
3. **IDOR:** policies usam `email`/`cliente.id` (não `auth.uid()` direto) — correto para o modelo bigint, mas exige verificação SQL de que nenhum acesso cruza dono.
4. **`is_admin()` via `raw_user_meta_data`:** role em metadata (não claim dedicado) — revisar robustez.

---

## 3. Camada 3 — STORAGE

### 3.1 Observado (✅ VERIFICADO via REST, chave anon)
- `GET /storage/v1/bucket` → **200 com `[]`** (zero buckets públicos visíveis ao anon).
- `GET /object/list/product-images` → **400 `NoSuchBucket`** (resposta **idêntica** a um bucket inexistente de controle).
- Download direto `product-images/*` → 404 `NoSuchKey`.

### 3.2 Contradição com o repo
`supabase/storage/product-images-policies.sql` afirma: *"Bucket JÁ EXISTE no remoto (criado 2026-09-21, público)"* com 4 policies "inspecionadas via pg_policy". **A evidência via anon contradiz isso** — nenhum bucket público é visível.

### 3.3 Limitação
Anon só vê buckets **públicos**. Se `product-images` existir como **privado**, seria invisível ao anon. → **🔍 VERIFICAR (SQL `storage.buckets`)** se o bucket existe e seu `public` flag. **Não concluir ausência absoluta sem SQL.**

### 3.4 Gap de imagens
`produto_imagem` existe mas está **vazia (0 linhas)** e nenhum objeto está acessível → **contrato de até 5 imagens por produto não tem fonte**. Aplicação das storage policies = **DRAFT não aplicada**.

---

## 4. Camada 4 — DADOS E INFRAESTRUTURA

### 4.1 Dados atuais = seed de desenvolvimento (✅ VERIFICADO)
Fornecedores com CNPJ/telefone fictícios, categoria id=1 defeituosa, 13 produtos de teste, 1 variante. **Não interpretar como patrimônio real da Angel** (Regra de Design §9: mocks/precos fake = descartar). Estrutura × dados classificados separadamente.

### 4.2 Infraestrutura aproveitável (✅/📄)
- **`evento`** já é outbox com `idempotency_key` + `tentativas` + `status` + índice único parcial `idx_evento_idempotency` → **REUTILIZAR** (não recriar sistema de eventos).
- **Edge Function `viaCEP`** existe (`supabase/functions/viaCEP/index.ts`) → atende D9 (autofill de endereço).
- **`atendimento`/`atendimento_mensagem`** existem → reutilizados por Notificações (threads de suporte).

### 4.3 Migrations aplicadas vs draft
| Migration | Estado |
|---|---|
| `202609190101_base_schema.sql` | tabelas **existem** (aplicadas por algum mecanismo, apesar do cabeçalho "DO NOT APPLY") |
| `202609190102_indexes.sql` | aplicação 🔍 **não verificada** |
| `202609190103_rls_policies.sql` | aplicação 🔍 **não verificada** |
| `202609190103b_rls_additional.sql` | aplicação 🔍 **não verificada** (usa guards `IF NOT EXISTS`) |
| `20260920000002_angel_commerce_reconciliation.sql` | ❌ **NÃO aplicada** (orcamento 404) — DRAFT |
| `storage/product-images-policies.sql` | 📄 **NÃO aplicada** — DRAFT |

---

## 5. MATRIZ PRINCIPAL

`Existe`/`Parcial`/`Falta` marcados em uma única coluna. `Destino`: REUTILIZAR | ALTERAR | CRIAR | DEPRECAR | CONFIGURAR | SEM ALTERAÇÃO.

| Domínio | Status | Ação | Destino |
|---|---|---|---|
| Identidade/Auth | ✅ existe | reutilizar `auth.users` | SEM ALTERAÇÃO |
| Cliente | ✅ existe (vazio) | reutilizar | REUTILIZAR |
| Produtos | ✅ existe (13 seed) | reutilizar + limpar seed | REUTILIZAR + ALTERAR |
| Variantes | ✅ existe (1 seed) | reutilizar | REUTILIZAR |
| Imagens | ❌ falta fonte | `produto_imagem` vazia + bucket 🔍 | CRIAR/CONFIGURAR |
| Categorias | ⚠️ parcial | corrigir id=1 defeituosa | ALTERAR (dados) |
| Promoções | ✅ existe (vazia, schema p/ D3) | reutilizar | REUTILIZAR |
| Desconto comercial | ❌ falta | criar tabela + link pedido/orçamento | CRIAR |
| Kits | ⚠️ parcial | reconciliar modelo (via opção ≠ kit=produto) | ALTERAR |
| Carrinho | ✅ existe (vazio, schema ok) | reutilizar | REUTILIZAR |
| Orçamento | ❌ falta (404) | criar (reescrito, integrado) | CRIAR |
| Pagamento | ⚠️ parcial | reutilizar + adicionar estorno | ALTERAR |
| Pedido | ✅ existe (snapshot ok) | reutilizar | REUTILIZAR |
| Estoque | ✅ existe (vazio, D4 ok) | reutilizar | REUTILIZAR |
| Serviços | ❌ falta | criar `servico` | CRIAR |
| Profissionais | ❌ falta | criar `profissional` (link auth.users) | CRIAR |
| Agenda | ❌ falta | criar `agenda` + `agenda_bloqueio` | CRIAR |
| Agendamento | ❌ falta | criar `agendamento` + anti-double-booking | CRIAR |
| Eventos | ⚠️ parcial | reutilizar outbox + expandir catálogo (pt-BR) | REUTILIZAR + ALTERAR |
| Notificações | ❌ falta | criar `notificacao` | CRIAR |
| Templates | ❌ falta | criar `notificacao_template` | CRIAR |
| Preferências | ❌ falta | criar `notificacao_preferencia` | CRIAR |
| Auditoria | ⚠️ parcial | reutilizar + corrigir ator (profissional/admin) | ALTERAR |
| Storage | ⚠️ parcial 🔍 | verificar bucket + aplicar policies (draft) | CONFIGURAR |
| RLS | ⚠️ parcial 🔍 | verificar aplicação real (SQL) | VERIFICAR (SQL) |
| Auth/RBAC | ⚠️ parcial | `is_admin` ok; papel profissional inexistente | ALTERAR |

---

## 6. MATRIZ DE SEGURANÇA

| Área | Verificação | Status | Ação |
|---|---|---|---|
| Auth | identidade real (`auth.users`) | ✅ | reutilizar |
| Cliente | isolamento por usuário (email) | 📄/🔍 | verificar aplicação RLS |
| Admin | autorização real (`is_admin`) | 📄/🔍 | verificar função + role |
| Produto | leitura pública | ✅ anon lê | confirmar se é policy ou RLS-off |
| Carrinho | somente proprietário | 📄/🔍 | verificar RLS |
| Pedido | proprietário + staff | 📄/🔍 | verificar RLS |
| Orçamento | cliente + vendedor autorizado | ❌ não existe | criar com RLS |
| Desconto | somente perfil autorizado | ❌ não existe | criar com RLS (vendedor/admin) |
| Estoque | operações transacionais | 📄/🔍 | verificar + testar reserva atômica |
| Agenda | conflito transacional | ❌ não existe | criar com regra anti-overlap |
| Agendamento | proprietário/staff | ❌ não existe | criar com RLS |
| Notificações | destinatário correto | ❌ não existe | criar com RLS por destinatário |
| Auditoria | ator real | ⚠️ | corrigir `usuario_id` p/ profissional/admin |
| Storage | acesso por objeto | ⚠️/🔍 | aplicar policies restritas (draft) |
| RPC | `SECURITY DEFINER` auditado | 🔍 | auditar `is_admin` + `viaCEP` |
| RLS | nenhuma sensível sem proteção | 🔍 | **verificação obrigatória (SQL)** |
| IDOR | IDs não permitem acesso indevido | 🔍 | verificar policies por dono |

---

## 7. AÇÕES DE VERIFICAÇÃO OBRIGATÓRIAS (SQL/service_role) — ANTES DE QUALQUER MIGRATION

Estas **não foram executadas** (read-only REST não permite). São **pré-requisitos** para a etapa 6:

1. **🔍 RLS real:** `SELECT * FROM pg_policies` + `pg_class.relrowsecurity` — confirmar se as 28 tabelas têm RLS **habilitada** e policies aplicadas.
2. **🔍 Índices/triggers:** `pg_indexes` + `pg_trigger` — confirmar `202609190102` aplicado.
3. **🔍 Funções:** `pg_proc` — confirmar `is_admin()` e `viaCEP` existem e estão `SECURITY DEFINER`.
4. **🔍 Storage:** `SELECT * FROM storage.buckets` — existência e flag `public` de `product-images`.
5. **🔍 Teste de escrita supervisionado** (por humano autorizado, **não** read-only): confirmar que anon **não** consegue INSERT/UPDATE em tabelas sensíveis.
6. **🔍 Auditoria de `raw_user_meta_data.role`:** robustez do `is_admin()`.

---

## 8. FLUXO PARA O MODELO FINAL

```text
SUPABASE ATUAL (auditado)
       │
       ├── REUTILIZAR ────── auth.users, cliente, produto, produto_variante,
       │                     categoria, fornecedor, promocao, carrinho(_item),
       │                     pedido(_item), pagamento, estoque(_movimentacao),
       │                     frete_regra, evento (outbox), atendimento(_mensagem),
       │                     pedido_status_historico, auditoria, viaCEP
       ├── ALTERAR ───────── kit (reconciliar modelo), evento (catálogo pt-BR),
       │                     auditoria (ator), produto (sku), pagamento (estorno),
       │                     categoria id=1 (dados), RBAC (papel profissional)
       ├── CRIAR ─────────── desconto_comercial, orcamento(_item), servico,
       │                     profissional, profissional_servico, agenda,
       │                     agenda_bloqueio, agendamento, notificacao,
       │                     notificacao_template, notificacao_preferencia
       ├── DEPRECAR/AVALIAR─ produto_opcao_compra / produto_opcao_valor (se
       │                     superseded por variantes + kit=produto) — decisão etapa 6
       └── CONFIGURAR ────── storage bucket + policies, frete_regra (dados),
                             imagens de produto
                              ↓
                     MODELO SUPABASE FINAL
                              ↓
                         MIGRATIONS V1
                              ↓
                      REVISÃO HUMANA (§7 concluída)
                              ↓
                    AUTORIZAÇÃO EXPLÍCITA
                              ↓
                          APLICAR
```

---

## 9. Resumo executivo

- **Estrutura:** 28/28 tabelas canônicas existem; `orcamento`/`orcamento_item` não existem (draft não aplicado).
- **Dados:** apenas 4 tabelas têm linhas — **todas seed de desenvolvimento, não patrimônio**.
- **Aproveitável:** `evento` (outbox+idempotência), `viaCEP`, `atendimento`, `auditoria`, e o núcleo comercial (produto/variante/pedido/pagamento/estoque) — **reutilizar, não recriar**.
- **Divergências reais:** kit (modelo via opção ≠ kit=produto), evento (nomes em inglês), auditoria (ator só cliente), produto (sem SKU), pagamento (sem estorno), desconto comercial (inexistente).
- **Bloqueio crítico:** aplicação real de **RLS/índices/triggers/funções** e **existência do bucket** **não são verificáveis via REST read-only** → §7 é pré-requisito obrigatório antes de qualquer migration.
- **Nenhuma migration foi escrita ou aplicada.** O próximo passo é a etapa 6 (MODELO SQL/MIGRATIONS), somente após as verificações §7.

> **Nenhuma alteração no Supabase foi realizada para produz este documento.** Ele é o resultado objetivo da auditoria read-only (etapa 5).
