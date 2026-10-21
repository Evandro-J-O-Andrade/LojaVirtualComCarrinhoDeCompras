# ETAPA 7 — REVISÃO HUMANA DAS MIGRATIONS V1 — Angel Cosméticos

**Status:** REVISÃO CONCLUÍDA. **NADA FOI APLICADO NO SUPABASE.**
**Data:** 2026-10-03 · **Revisor:** humano (com apoio de análise) · **Objeto:** 8 migrations `20261003*.sql`
**Método:** re-leitura linha a linha contra o estado real confirmado (read-only) e os 6 documentos de domínio fechados. Cada defeito encontrado foi **REPROVADO E CORRIGIDO in-place** no arquivo de proposta (nenhuma migration nova criada; nenhuma execução).
**Regra de ouro registrada (fechada):** nenhuma migration nova é criada "no meio da aplicação". Se surgir problema durante a aplicação autorizada (etapa 8), **para → documenta → volta para revisão**.

---

## 0. Veredito

> **REPROVADO COM CORREÇÕES → APÓS CORREÇÕES: APROVADO PARA APLICAÇÃO** (condicionado à autorização explícita da etapa 8).

A proposta original (Etapa 6) continha **4 defeitos bloqueantes** e **7 defeitos recomendados**. Todos foram corrigidos nos arquivos de proposta. A integridade do patrimônio existente foi preservada: nenhuma migration destrói ou falsifica dados; a única DML é o UPDATE guardado de `categoria` id=1.

| Classificação | Quantidade | Destino |
|---|---|---|
| BLOQUEANTE (reprova a aplicação) | 4 | corrigidos in-place |
| RECOMENDADO (falha de integridade real) | 7 | corrigidos in-place |
| OBSERVAÇÃO (invariante de aplicação, documentado) | 12 | registrados §4 |

---

## 1. Revisão por bloco (14 blocos)

### Bloco 1 — Baseline / histórico (`20261003000001`) ✅
- Backfill das 4 migrations efetivamente aplicadas (`202609190101/02/03/03b`) com `ON CONFLICT (version) DO NOTHING`. `version` é PK de `schema_migrations` → idempotente.
- O draft `20260920000002` **não** entra no backfill (nunca aplicado; movido para `migrations_backup/`).
- **O9 (observação):** o DOWN deste arquivo deve ser o **último** a executar num rollback — reverter antes faria `supabase db push` tentar reaplicar 000002–000008 (criaria conflito de policies/tabelas).

### Bloco 2 — RBAC / `is_admin()` (`20261003000007`) ✅
- `admin_user` só aceita INSERT via **service_role** (nenhuma política INSERT para `authenticated`) → **caminho de autoelevação inexistente**. DELETE apenas por admin existente (revogação auditável).
- `is_admin()` reescrita: lê `admin_user` (server-side) em vez de `raw_user_meta_data` (gravável pelo cliente). **`SECURITY DEFINER` é obrigatório e está presente** — sem ele, a chamada bateria na RLS de `admin_user` (circular → falso para todos).
- `auth.uid()` dentro de função SECURITY DEFINER lê o contexto da requisição (identidade do **chamador**), padrão Supabase correto.
- Estado confirmado: 1 usuário, 0 admins, metadata sem `role` → a substituição **não revoga acesso de ninguém**; superfície admin continua inacessível até o bootstrap autorizado (statement comentado no arquivo).

### Bloco 3 — Storage (`20261003000007`) ✅
- `DROP POLICY IF EXISTS` das 3 policies amplas (nomes confirmados via `pg_policies`: `Authenticated upload/update/delete`) + criação de policies `is_admin()` para INSERT/UPDATE/DELETE. Anatomia correta (INSERT = só WITH CHECK; UPDATE/DELETE = USING + WITH CHECK / USING).
- `Public bucket read` mantida (catálogo público).
- Efeito: autenticado comum **não** pode mais subir/alterar/excluir imagens de produto — era o RISCO REAL da v1.1 §2.3.1, agora fechado.

### Bloco 4 — Produtos / SKU / imagens (`20261003000006`) ✅ com observação crítica
- `produto.sku` nullable + UNIQUE (NULLs múltiplos permitidos → os 13 produtos existentes sem SKU não quebram).
- **O10 (observação crítica — contrato de imagens):** as 14 linhas de `produto_imagem` são **URLs falsas** (13× `placehold.co`, 1× hotlink `kolicosmeticos.vtexassets.com`). A migration **não as legitima**: não toca na tabela. Registro do contrato fechado:
  ```text
  imagem real disponível (arquivo próprio no bucket)?
      SIM → Storage próprio (product-images/produtos/{id}/…)
      NÃO → fallback visual elegante (REGRA_DE_DESIGN §7)
            → feedback/log
            → NUNCA inventar URL comercial
  ```
  As linhas falsas só saem via **limpeza L1 (DML autorizado, etapa 8)**. O **frontend** deve tratar URL fora do bucket `product-images` como **ausente** (fallback), não como imagem. Mock preserva a experiência visual, **nunca falsifica estado comercial**.
- **O6:** unicidade cruzada `produto.sku` × `produto_variante.sku` é invariante de aplicação (não expressável como constraint relacional).

### Bloco 5 — Preço / promoção / desconto (`20261003000002` + `20261003000006`) ✅ corrigido
- **F5 (corrigido):** `desconto_comercial` permitia percentual > 100% (preço final negativo). CHECK agora: `fixo → valor > 0` / `percentual → 0 < valor ≤ 100`. Mesmo limite aplicado a `promocao` (tabela vazia, safe).
- Snapshots históricos preservados: `orcamento_item.preco_unitario` NOT NULL (congelado), `desconto_unitario`, `total`; `orcamento.desconto_total` é o snapshot do desconto aplicado. Alterar catálogo/promoção **nunca** reescreve orçamento/pedido registrado.
- **O2:** `teto_maximo` (proteção de margem) é enforced pela aplicação — CHECK não pode comparar `valor` com `teto` semanticamente (percentual vs. R$).

### Bloco 6 — Kits (`20261003000006` + `20261003000008`) ✅ corrigido
- **F1 (BLOQUEANTE, corrigido):** o UNIQUE de tabela `(kit_produto_id, produto_id, variante_id)` **não funciona** — Postgres trata NULL como distinto, e `variante_id` é NULL para componente avulso → duplicata silenciosa. Substituído por **índice único de expressão** `COALESCE(variante_id, 0)` em 000008.
- Reconciliação kit=produto preservada: `kit_composicao.kit_produto_id → produto` (derrubada de `produto_opcao_id`), `produto_opcao_compra.tipo` restrito a `('quantidade','custom')` — seguro, única linha existente é `quantidade`.
- `carrinho_item.kit_composicao_id` e `pedido_item.kit_composicao_id` (snapshots) inalterados.
- **O5:** disponibilidade derivada dos componentes e o fan-out de estoque são transação de aplicação (D4), não schema.

### Bloco 7 — Orçamentos (`20261003000002`) ✅ corrigido
- **F3 (BLOQUEANTE, corrigido):** dono podia atualizar o próprio orçamento em **qualquer** status (mutar um orçamento enviado/aceito). Política de UPDATE do dono agora restrita a `status='rascunho'`; admin atualiza sempre.
- **F4 (BLOQUEANTE, corrigido):** `orcamento_status_historico` aceitava INSERT do dono → cliente poderia fabricar linha de "aceito" no log. INSERT removido para `authenticated`; histórico é escrito **server-side** (mesmo padrão de `pedido_status_historico`, que só tem política de leitura).
- **F10 (corrigido):** `ator_auth_id` era NOT NULL — bloquearia transições automáticas (expiração por validade). Agora nullable (NULL = sistema), padrão de `pedido_status_historico.usuario_id`.
- **F2 (BLOQUEANTE, corrigido):** "no máximo UM desconto comercial" (§5.5) não era enforceado → índices únicos parciais `WHERE orcamento_id IS NOT NULL` / `WHERE pedido_id IS NOT NULL`.
- **F11 (corrigido):** conversão orçamento→pedido agora 1:1 (índice único parcial em `orcamento.pedido_id`).
- Ciclo, validade, condição de pagamento (método+parcelas snapshot) e itens com preço congelado: conforme §8.
- **O3:** `expirado` é varredura de aplicação (sem trigger no projeto); índice parcial `idx_agendamento_expirar` análogo não existe aqui — a aplicação varre `validade < CURRENT_DATE AND status='enviado'`.

### Bloco 8 — Pedidos / pagamentos (`20261003000006`) ✅
- `pagamento.status` ganha `estornado`; `pagamento_estorno` separado (evento de pagamento, rastreável: quem/quando/valor/motivo/transaction_id do gateway).
- **O1:** estorno parcial (múltiplas linhas por pagamento) — Σ estornos ≤ `pagamento.valor` é invariante de aplicação (CHECK não pode subconsultar). Estorno consolidado gera movimentação de retorno ao estoque (`estoque_movimentacao.tipo='devolucao'` já existe no CHECK — D4-M, não retorno cego).
- FK `ON DELETE RESTRICT` em pagamento/pedido: histórico financeiro nunca é apagado em cascata.

### Bloco 9 — Serviços / agenda (`20261003000003`) ✅ corrigido
- **F9 (corrigido):** protocolo agora tem CHECK de formato `^AG-[0-9]{8}-[0-9]{6}$` (§6.1).
- **Anti-double-booking transacional (§5):** coluna gerada `periodo tstzrange` (expressão **imutável** — só `tstzrange()`, sem `AT TIME ZONE` que é STABLE e falharia em coluna gerada) + `EXCLUDE USING gist (profissional_id WITH =, periodo WITH &&) WHERE (status IN ('solicitado','confirmado'))`. `btree_gist 1.7` confirmado instalado. Duas reservas simultâneas serializam no índice gist; a segunda é rejeitada. `solicitado` ocupa o horário atomicamente (§5.3); cancelado/reagendado/expirado liberam (§7.5).
- Timestamps absolutos (`inicio`/`fim` timestamptz) são a autoridade; `data`/`horario_*` derivados de exibição em `America/Sao_Paulo` (§3).
- **F10-relacionado:** expiração de `solicitado` (15 min, §5.3) é varredura de aplicação; índice parcial `idx_agendamento_expirar` a suporta.
- UPDATE do dono: edição enquanto `solicitado`; cancelamento só até 24h antes (`inicio > now() + interval '24 hours'`); **nenhuma política DELETE** (cancelamento é transição, histórico em cadeia §7.4).
- Visitante (D8): INSERT só via **service_role** (Edge Function) — não há INSERT para `anon`, impedindo spam direto.
- `profissional_publico` (view): projeta só `id, nome` dos ativos; view criada pelo dono do schema (ignora RLS de `profissional`) → contato interno não vaza.
- **O7/O8:** `contexto` do mimo em CHECK (estrutura fechada — adicionar contexto é migration revisável); `agenda_bloqueio` legível por autenticados (revela indisponibilidade — aceito; cálculo de slots é server-side).

### Bloco 10 — Notificações (`20261003000004`) ✅ corrigido
- **F6 (corrigido):** `notificacao.evento_id` era nullable — enfraquecia a causalidade (evento ≠ notificação) e a deduplicação. Agora **NOT NULL** + `ON DELETE RESTRICT` (outbox é append-only; deletar evento com entregas é erro).
- Idempotência dupla: `idempotency_key` UNIQUE + `UNIQUE (evento_id, canal, destinatario_tipo, destinatario_cliente_id)` — mesmo evento+canal+destinatário entregue **uma vez** (§6.2). Retry incrementa `tentativas` na mesma linha (nunca nova entrega).
- **F8 (corrigido):** LGPD — `opt_in_marketing` só válido com `opt_in_marketing_em` (CHECK de consentimento, §4.2).
- Templates: UNIQUE `(evento_nome, canal)`, variáveis declaradas, renderização **server-side** (nunca no frontend).
- Catálogo de eventos: 29 eventos conferidos contra Notificações §1.1/§1.2/§1.3 — 11 normalizados + 14 novos + 4 marketing. Completo.
- RLS: INSERT/UPDATE de entrega **sem política para authenticated** (dispatcher = service_role, que tem BYPASSRLS — políticas TO service_role seriam no-op e não foram usadas). Dono marca `lido_em` (WITH CHECK força `lido_em IS NOT NULL`).
- **O12:** tentativas máximas → `falhou_definitivamente` (dead-letter) é regra do dispatcher.

### Bloco 11 — Mimos Diários (`20261003000005`) ✅ corrigido
- **F7 (corrigido):** `mimo_produto` era leitura pública irrestrita — vazava vínculos de mimos futuros/expirados. Política agora filtra por EXISTS na janela de publicação ativa.
- Mimo **não** é financeiro: sem preço, sem estoque, sem desconto próprio — só referencia `promocao`/kit/categoria reais (§12 do Modelo Comercial). Sem oferta real → apresenta produtos sem inventar desconto.
- Janela obrigatória (`inicio < fim`); leitura pública só dentro da janela; admin vê tudo (rascunho/expirado).

### Bloco 12 — RLS / FKs / CHECK / UNIQUE / EXCLUDE / índices (`todos` + `20261003000008`) ✅
- **18/18 tabelas novas com RLS habilitado** (verificação item por item: condicao_pagamento, orcamento, orcamento_item, orcamento_status_historico, desconto_comercial, servico, profissional, profissional_servico, agenda, agenda_bloqueio, agendamento, notificacao, notificacao_template, notificacao_preferencia, mimo, mimo_produto, pagamento_estorno, admin_user). `profissional_publico` é view (RLS N/A).
- FKs: todas nomeadas, com ações explícitas; ordem de criação respeita dependências (tabelas antes de quem as referencia; `orcamento` antes de `desconto_comercial`; FKs circulares inexistentes).
- CHECK: todos os catálogos de status fechados; `UNIQUE` parciais onde o negócio exige (desconto, conversão).
- **O11:** nenhum trigger adicionado — consistente com o remoto (autoridade transacional é aplicação; o EXCLUDE é a exceção deliberada, por ser regra de integridade crítica).
- Índices: toda FK de consulta frequente indexada (o Postgres não indexa FKs automaticamente); `idx_evento_idempotency` já existe no remoto (não recriado).
- **SECURITY DEFINER:** único uso é `is_admin()` (revisto no Bloco 2) — mínimo e necessário.
- Concorrência: EXCLUDE serializa reservas concorrentes; demais integridades (estoque, estorno, teto) permanecem transacionais de aplicação.

### Bloco 13 — Dados existentes ✅
- `categoria` id=1: UPDATE **guardado** (`WHERE id=1 AND nome='Esmalgue' AND slug='esmalhe'`) — só executa se o defeito estiver presente; idempotente.
- Preservados sem toque: 13 produtos, 7 categorias, 3 fornecedores, 1 variante, 1 opção de compra (`Unidade` — ainda válida com o novo CHECK), 1 link produto↔categoria, 14 linhas de estoque (incluindo a duplicata do produto 1 — limpeza L3 separada).
- **Nada é destruído ou falsificado.** Limpezas (L1 imagens falsas, L3 estoque duplicado, L5 fornecedores fictícios) são **DML de autorização explícita** (ETAPA_6_SQL_PROPOSTO §5), separadas da estrutura.

### Bloco 14 — Rollback ✅ documentado (§3)
- Toda criação é reversível (`DROP` de tabela/policy/constraint/índice/coluna); `is_admin()` é `CREATE OR REPLACE` (reversível re-escrevendo); backfill é DELETE.
- **Nenhum dado comercial é destruído** (só a correção de `categoria` id=1 é DML, reversível trocando-se os valores).
- Ordem de rollback: **inversa** (000008 → 000001), com 000001 **por último** (O9).

---

## 2. Defeitos encontrados e corrigidos (trilha de auditoria)

| # | Severidade | Migration | Defeito | Correção aplicada |
|---|---|---|---|---|
| F1 | BLOQUEANTE | 000006/000008 | UNIQUE de kit ineficaz com `variante_id` NULL (NULL ≠ NULL no Postgres) | índice único de expressão `COALESCE(variante_id, 0)` |
| F2 | BLOQUEANTE | 000008 | "no máximo UM desconto comercial" (§5.5) não era enforceado | índices únicos parciais por `orcamento_id`/`pedido_id` |
| F3 | BLOQUEANTE | 000002 | dono podia editar orçamento em qualquer status | UPDATE do dono restrito a `rascunho`; admin sempre |
| F4 | BLOQUEANTE | 000002 | dono podia inserir linhas de histórico (fabricar "aceito") | INSERT de histórico só service_role (padrão `pedido_status_historico`) |
| F5 | RECOMENDADO | 000002/000006 | desconto/promoção percentual > 100% (preço negativo) | CHECK `0 < valor ≤ 100` para percentual |
| F6 | RECOMENDADO | 000004 | `notificacao.evento_id` nullable quebrava causalidade e dedup | NOT NULL + `ON DELETE RESTRICT` |
| F7 | RECOMENDADO | 000005 | `mimo_produto` público vazava vínculos não publicados | política com EXISTS na janela ativa |
| F8 | RECOMENDADO | 000004 | opt-in marketing sem timestamp (LGPD §4.2) | CHECK de consentimento |
| F9 | RECOMENDADO | 000003 | protocolo sem formato (§6.1) | CHECK regex `^AG-[0-9]{8}-[0-9]{6}$` |
| F10 | RECOMENDADO | 000002 | `ator_auth_id` NOT NULL bloqueava transições automáticas | nullable (NULL = sistema) |
| F11 | RECOMENDADO | 000008 | conversão orçamento→pedido não era 1:1 | índice único parcial em `orcamento.pedido_id` |

---

## 3. DOWN / rollback por migration (para aplicação autorizada)

| Migration | DOWN (ordem inversa) |
|---|---|
| 000008 | `DROP INDEX` dos 27 índices (incluindo os 4 únicos: `idx_kit_componente_unique`, `idx_desconto_unico_orcamento`, `idx_desconto_unico_pedido`, `idx_orcamento_conversao`) |
| 000007 | recriar 3 policies amplas de storage → dropar as restritivas; `CREATE OR REPLACE FUNCTION is_admin()` com corpo original (metadata); `DROP TABLE admin_user` |
| 000006 | `produto`: dropar `sku`; `promocao`/`produto_opcao_compra`: restaurar CHECKs originais; `kit_composicao`: dropar índice único, FK e coluna `kit_produto_id`, recriar `produto_opcao_id` + `kc_opcao_fk`; `pagamento`: restaurar CHECK sem `estornado`, `DROP TABLE pagamento_estorno`; `auditoria`: dropar `ator_*`, restaurar `usuario_id NOT NULL`; `categoria` id=1: restaurar `Esmalgue`/`esmalhe` **somente se** for o valor corrigido |
| 000005 | `DROP TABLE mimo_produto, mimo` |
| 000004 | `DROP TABLE notificacao, notificacao_template, notificacao_preferencia`; restaurar `evento_nome_check` original (11 eventos em inglês) — ou manter o catálogo expandido (superconjunto, decisão de revisão) |
| 000003 | `DROP VIEW profissional_publico`; `DROP TABLE agendamento, agenda_bloqueio, agenda, profissional_servico, profissional, servico` |
| 000002 | dropar 15 policies; `DROP TABLE desconto_comercial, orcamento_status_historico, orcamento_item, orcamento, condicao_pagamento` |
| 000001 | `DELETE FROM supabase_migrations.schema_migrations WHERE version IN ('202609190101','202609190102','202609190103','202609190103b')` — **só depois** de reverter 000002–000008 (O9) |

---

## 4. Observações registradas (invariantes de aplicação — sem mudança de schema)

O1 Σ estornos ≤ valor do pagamento · O2 teto de margem · O3 varredura de expiração de orçamento · O4 geração de protocolo (Edge Function) · O5 reserva de estoque e fan-out de kit · O6 SKU cruzado · O7 rigidez de `contexto` do mimo · O8 `agenda_bloqueio` legível por autenticados · O9 rollback do backfill por último · O10 contrato de imagens (fallback→rollback→feedback; frontend trata URL fora do bucket como ausente; limpeza L1 autorizada) · O11 sem triggers (autoridade de aplicação) · O12 tentativas máximas do dispatcher.

---

## 5. Contexto estratégico registrado

O conjunto deixa de ser "um site" e passa a sustentar o **SaaS vertical de beleza**: catálogo + clientes + orçamento + desconto negociado + kits + pedidos + estoque + serviços/agenda + atendimento + comunicação (WhatsApp/e-mail/interno), com a visitante vendo a experiência de marca. O schema agora separa **experiência** (frontend) de **operação** (Supabase + Edge Functions), com eventos como espinha dorsal — o que permite amadurecer multi-tenant depois sem reescrita.

---

## 6. Condições para a etapa 8 (aplicação autorizada)

1. **Autorização explícita do dono do projeto** (nenhuma execução automática).
2. Aplicação na ordem **000001 → 000008**, com verificação read-only após **cada** arquivo (tabelas/policies/constraints existem).
3. **Bootstrap do primeiro admin** (`evandro` — `3bf1c769-f4ca-45fe-b52b-ded4de18abc9`) só após confirmar 000001–000008 aplicados; statement comentado em 000007.
4. Limpezas de dados (L1, L3, L5) são passos **separados e autorizados**, após a estrutura.
5. Teste de escrita RLS (pendente da v1.1 §2.4) com humano autorizado: confirmar que `anon` não escreve em tabelas sensíveis.
6. Se surgir qualquer problema **durante** a aplicação: **parar, documentar, voltar para revisão** — nenhuma migration nova criada no meio da aplicação.

> **Nenhuma migration foi aplicada. O Supabase remoto permanece no estado auditado.**
