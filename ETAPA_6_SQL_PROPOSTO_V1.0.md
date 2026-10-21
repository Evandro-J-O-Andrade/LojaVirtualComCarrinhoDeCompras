# ETAPA 6 — SQL PROPOSTO (MIGRATIONS V1) — Angel Cosméticos

**Status:** PROPOSTA PARA REVISÃO HUMANA (etapa 7). **NADA FOI APLICADO.**
**Data:** 2026-10-03 · **Supabase ref:** `bmqxgibhuzekxpcgosap`
**Método:** escrita sobre o **estado real confirmado** por SQL read-only (driver `pg`, `DIRECT_URL`, transação `READ ONLY`, Postgres 17.6).
**Sequência:** etapas 1–5 (especificações fechadas) → **etapa 6 (este documento + 8 migrations)** → etapa 7 (revisão humana) → etapa 8 (aplicação autorizada).

---

## 0. Regra de ouro mantida

- Nenhuma migration, DDL, DML, seed, alteração de RLS ou Storage foi **executada** nesta etapa.
- Os 8 arquivos em `supabase/migrations/20261003*.sql` são **proposta local**.
- Aplicação (`supabase db push` ou SQL manual) **exige revisão humana + autorização explícita** (etapas 7–8).

---

## 1. Correções ao Gap Analysis v1.1 (descobertas desta etapa)

A v1.1 afirmou "apenas 4 tabelas têm linhas". A verificação complementar read-only provou que **8 tabelas** têm dados. Todas as conclusões de segurança se mantêm; o inventário de dados corrige-se:

| Tabela | v1.1 disse | Real (read-only) | Nota |
|---|---|---|---|
| `produto` | 13 ✅ | 13 ✅ | seed de desenvolvimento |
| `categoria` | 7 ✅ | 7 ✅ | id=1 defeituosa (`Esmalgue`/`esmalhe`) |
| `fornecedor` | 3 ✅ | 3 ✅ | CNPJs/telefones fictícios; "Mary Kay Cosmeticos" é **marca**, não fornecedor |
| `produto_variante` | 1 ✅ | 1 ✅ | `ESM-001`, R$ 29,90, produto 1 |
| `produto_imagem` | **0** ❌ | **14** | **13 URLs `placehold.co` falsas + 1 hotlink externo `kolicosmeticos.vtexassets.com`** (CDN de terceiro). Nenhuma imagem real. Produto 1 tem **duas linhas `principal=true`** (ids 1 e 2) |
| `produto_opcao_compra` | (não citada) | **1** | `Unidade`, `tipo='quantidade'`, produto 1 → restringir CHECK sem `'kit'` é **seguro** |
| `produto_categoria` | **0** ❌ | **1** | produto 1 ↔ categoria 1 |
| `estoque` | **0** ❌ | **14** | 100 unreserved cada; **produto 1 tem DUAS linhas** (ids 2 e 3) — duplicata |
| `storage.objects` | 0 ✅ | 0 ✅ | bucket `product-images` public=true, vazio |
| `supabase_migrations` | 0 ✅ | 0 ✅ | backfill necessário |

Detalhamento completo: `GAP_ANALYSIS_SUPABASE_V1.2.md`.

---

## 2. O conjunto de migrations (8 arquivos)

| # | Arquivo | O que faz | Base de domínio |
|---|---|---|---|
| 1 | `20261003000001_backfill_historico_migrations.sql` | Registra as 4 migrations efetivamente aplicadas em `schema_migrations` (vazio hoje) para `supabase db push` não reaplicá-las | Gap §7 governança |
| 2 | `20261003000002_orcamento_desconto_comercial.sql` | Cria `condicao_pagamento`, `orcamento` (reescrito), `orcamento_item`, `orcamento_status_historico`, `desconto_comercial` + RLS | Comercial §5, §8, §9.3 |
| 3 | `20261003000003_servicos_agendamento.sql` | Cria `servico`, `profissional`, `profissional_publico` (view), `profissional_servico`, `agenda`, `agenda_bloqueio`, `agendamento` + **EXCLUDE parcial anti-double-booking** + RLS | Serviços §1–§7 |
| 4 | `20261003000004_notificacoes_eventos.sql` | Cria `notificacao`, `notificacao_template`, `notificacao_preferencia` + **normaliza catálogo de `evento` para `dominio.acao` pt-BR** (29 eventos) + RLS | Notificações §1–§12 |
| 5 | `20261003000005_mimos_diarios.sql` | Cria `mimo`, `mimo_produto` + RLS (janela de publicação) | Mimos §7–§8 |
| 6 | `20261003000006_alteracoes_comerciais.sql` | `produto.sku` · kit=produto (reconciliação) · `pagamento` estorno + `pagamento_estorno` · `auditoria` ator profissional/admin · correção `categoria` id=1 | Comercial §3/§6/§9.7, Serviços §10 |
| 7 | `20261003000007_rbac_admin_storage.sql` | Cria `admin_user`, **reescreve `is_admin()` para server-side** (deixa de ler metadata gravável pelo cliente), **substitui 3 policies amplas de storage** por restritivas | Gap §2.3 riscos 1–2 |
| 8 | `20261003000008_indexes.sql` | Índices de FK e filas (convenção do projeto: índices em arquivo separado) | — |

**Draft `20260920000002_angel_commerce_reconciliation.sql`**: movido para `supabase/migrations_backup/` — **nunca foi aplicado** (`orcamento` 404 no remoto) e está **substituído** pela migration 2 (versão integrada: desconto comercial, histórico, conversão, snapshot de atributos).

---

## 3. Decisões de modelo fechadas nesta etapa

1. **Kit = produto** (`20261003000006`): `kit_composicao` aponta para `kit_produto_id → produto` (derruba `produto_opcao_id`). Kit tem `preco_base` próprio; disponibilidade derivada dos componentes. `produto_opcao_compra` fica com `('quantidade','custom')` — seguro: a única linha existente é `tipo='quantidade'`.
2. **Eventos em pt-BR** (`20261003000004`): decisão de convenção fechada na Etapa 4 §11. Os 11 eventos em inglês são normalizados (`order.created` → `pedido.criado` etc.) e o catálogo expande para 29. Tabela **vazia** → sem migração de dados.
3. **Anti-double-booking no banco** (`20261003000003`): coluna gerada `periodo tstzrange` + `EXCLUDE USING gist (profissional_id WITH =, periodo WITH &&) WHERE (status IN ('solicitado','confirmado'))`. `btree_gist 1.7` confirmado instalado. `solicitado` reserva atomicamente (§5.3); cancelado/reagendado/expirado liberam o horário (§7.5).
4. **Timestamps absolutos** (`agendamento`): `inicio`/`fim` são `timestamptz` (autoridade); `data`/`horario_*` são derivados de exibição em `America/Sao_Paulo` (§3). A coluna gerada usa só `tstzrange()` (imutável) — `AT TIME ZONE` é STABLE e **não** pode ir em coluna gerada.
5. **Auditoria multi-ator** (`20261003000006`): `usuario_id` (bigint, cliente) vira nullable; novo `ator_auth_id uuid → auth.users` + `ator_tipo ('cliente','profissional','admin')`. Tabela vazia → sem perda.
6. **RBAC server-side** (`20261003000007`): `is_admin()` deixa de ler `raw_user_meta_data` (gravável pelo cliente) e passa a ler `admin_user` (só service_role escreve). Estado atual: 0 admins, metadata sem role → **ninguém perde acesso**; a superfície admin continua inacessível até a atribuição autorizada (etapa 8).
7. **Storage restritivo** (`20261003000007`): `DROP` das 3 policies amplas (nomes confirmados: `Authenticated upload/update/delete`) e criação de policies `is_admin()`. Leitura pública do bucket mantida.
8. **Orçamento integrado** (`20261003000002`): ciclo `rascunho → enviado → aceito | recusado | expirado`, itens com preço snapshot, **um** desconto comercial autorizado (rastreável: quem, quando, tipo, valor, teto), histórico de transições com ator auth, conversão para pedido (`orcamento.pedido_id`), condição de pagamento (método + parcelas).
9. **Notificação idempotent** (`20261003000004`): `idempotency_key` único + `UNIQUE (evento_id, canal, destinatario_tipo, destinatario_cliente_id)`; retry incrementa `tentativas` na mesma linha; dead-letter `falhou_definitivamente`.
10. **Mimo como curadoria** (`20261003000005`): só `mimo` + `mimo_produto` (proposta mínima da Etapa 1 §8); mimo **não** tem preço/estoque próprio; oferta real via FK para `promocao`/kit.

---

## 4. O que **não** está nas migrations (deliberado)

- **Disparador de eventos / dispatcher Edge Function** — a camada de dispatch consome `evento`; pertence à construção (Etapa 4 §13), não ao schema.
- **Função de cálculo de slots** — disponibilidade derivada (agenda − bloqueios − agendamentos − buffer) é server-side; o EXCLUDE garante a integridade, o cálculo é aplicação.
- **Seeds de catálogo** — dados atuais são seed de desenvolvimento; catálogo real vem do patrimônio + estratégia aprovada (não inventado).
- **Limpeza de dados defeituosos** — itens §5 abaixo são **DML de limpeza**, separados da estrutura, para autorização explícita.
- **Atribuição do primeiro admin** — statement comentado dentro da migration 7, só executar na etapa 8 autorizada.

---

## 5. Itens de limpeza de dados (DML — **autorização explícita**, não estrutural)

Confirmados por read-only; **não estão nas migrations** porque são decisões de conteúdo, não de estrutura:

| # | Item | Evidência | Ação proposta (comentada, para etapa 8) |
|---|---|---|---|
| L1 | `produto_imagem` com URLs falsas | 13× `placehold.co/400x400/FF6B9D/...` + 1 hotlink `kolicosmeticos.vtexassets.com` (CDN de terceiro) | `DELETE FROM produto_imagem WHERE url LIKE 'https://placehold.co%' OR url LIKE '%vtexassets.com%';` — fotos reais vêm do patrimônio (Blueprint §8.1: até 5 imagens, WebP) |
| L2 | `principal=true` duplicado (produto 1) | ids 1 e 2 ambos `principal=true` | após L1, a tabela fica vazia; ao popular, garantir `principal` único via aplicação (trigger futuro) |
| L3 | `estoque` duplicado (produto 1) | ids 2 e 3, ambos `produto_id=1`, 100 unreserved | `DELETE FROM estoque WHERE id=3;` (ou fundir) — mantém uma linha por produto |
| L4 | `categoria` id=1 typo | `Esmalgue`/`esmalhe` | **já na migration 6** (UPDATE guardado) |
| L5 | `fornecedor` fictício / marca como fornecedor | CNPJs `11223344556677`, `01020304000109`, `98765432100109`; "Mary Kay Cosmeticos" | decisão de conteúdo: corrigir/remover quando o cadastro real de fornecedores existir; marcas ≠ fornecedores |

---

## 6. Checklist de revisão humana (etapa 7)

- [ ] **Ordem**: 000001 (backfill) → 000008 (índices); dependências respeitadas (tabelas antes de FKs; `orcamento` antes de `desconto_comercial`).
- [ ] **Idempotência**: `CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`, `DROP CONSTRAINT IF EXISTS`, `ADD COLUMN IF NOT EXISTS` onde aplicável; backfill com `ON CONFLICT DO NOTHING`.
- [ ] **Tabelas vazias confirmadas** para ALTERs: `evento`, `pagamento`, `auditoria`, `kit_composicao`, `produto_opcao_valor` (read-only, 2026-10-03).
- [ ] **RLS**: todas as tabelas novas com `ENABLE ROW LEVEL SECURITY`; padrão do projeto (`auth.jwt()->>'email' = cliente.email`; `is_admin()`); nenhuma política `TO service_role` (service_role tem BYPASSRLS — seria no-op).
- [ ] **EXCLUDE parcial**: sintaxe `EXCLUDE USING gist ... WHERE (...)` requer `btree_gist` (instalado, 1.7).
- [ ] **Coluna gerada**: `periodo tstzrange GENERATED ALWAYS AS (tstzrange(inicio, fim, '[)')) STORED` — expressão imutável ✅ (sem `AT TIME ZONE`).
- [ ] **Storage**: nomes das policies amplas confirmados via `pg_policies` (`Authenticated upload/update/delete`) — `DROP POLICY IF EXISTS` é seguro mesmo se já removidas.
- [ ] **`is_admin()`**: `CREATE OR REPLACE` preserva privilégios; substituição não revoga acesso (0 admins hoje).
- [ ] **Rollback**: todas as criações são `CREATE`/`ALTER` reversíveis (`DROP TABLE`/`DROP CONSTRAINT`); o backfill de `schema_migrations` é deletável; `is_admin()` é `CREATE OR REPLACE` (reversível re-escrevendo). Nenhum dado comercial é destruído.
- [ ] **Nenhum segredo** em arquivo algum; credenciais de provedores de WhatsApp/e-mail ficam só em Edge Function (Etapa 4 §7–§8).

---

## 7. Pendências conhecidas (não bloqueiam a etapa 6)

1. **Teste de escrita RLS** (Gap §2.4, 🔎) — read-only proíbe; humano autorizado valida que `anon` não escreve em tabelas sensíveis **após** aplicação autorizada.
2. **Unicidade cruzada SKU** (`produto.sku` × `produto_variante.sku`) — invariante de aplicação (não expressável em constraint relacional).
3. **Agendamento visitante (lazy, D8)** — INSERT via Edge Function com service_role (não há política de INSERT para `anon` — impede spam direto).
4. **Kit: disponibilidade derivada** — validação de estoque por componente é lógica de aplicação/transação (D4); o schema garante a composição.

---

> **Nenhuma destas migrations foi aplicada.** Próximo passo: etapa 7 (revisão humana deste documento + dos 8 arquivos) e, só então, etapa 8 (autorização explícita e aplicação).
