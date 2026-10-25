## DECISOES_ARQUITETURA_v1.0.md — A1 Fechada

**Gerado por:** Auditoria read-only do schema Supabase + revisão da arquitetura de domínio (Gate 7)
**Data:** 2026-10-21
**Base:** DECISOES_NEGOCIO_v1.3.md (D1–D10) + introspecção read-only do projeto `bmqxgibhuzekxpcgosap` (2026-10-21) + `docs/PLANO_MESTRE_ANGEL_COSMETICOS_AS_IS_TO_BE.md`
**Motivo:** Registro das decisões de arquitetura do redesenho do banco a partir do domínio real. Complementa `DECISOES_NEGOCIO_*` (regras comerciais) — não substitui nem reinterpreta D1–D10.

**Regra de escopo deste documento:** nenhuma decisão aqui autoriza alteração de schema, criação ou aplicação de migration, escrita no banco, alteração de contrato funcional ou alteração do histórico Git. Cada decisão só se torna implementável no gate correspondente, após confirmação do estado real do schema e aprovação humana.

---

## Status

| ID | Decisão | Status | Data |
|---|---|---|---|
| A1 | Estratégia de identificação (PK/FK + chave pública) | ✅ **FECHADA** (condicional ao Gate 9) | 2026-10-21 |
| A2 | Descrição estruturada do produto | ⏳ PENDENTE | — |
| A3 | Reconciliação ledger `schema_migrations` × schema real | ⏳ PENDENTE | — |

---

## DECISÃO A1 — Estratégia de identificação

**FECHADA:** 2026-10-21

### Escolha

Manter `bigint` nas PKs existentes e preservar `slug` único para a resolução pública de produtos.

### Regras

- **PKs e FKs existentes:** manter `bigint`, preservando os relacionamentos e as policies atuais.
- **Rotas públicas:** continuar usando `/produtos/:slug`, sem expor o ID interno como identificador da URL.
- **Autenticação:** manter `auth_user_id` conforme o tipo compatível com o Supabase Auth (`uuid`).
- **Tabelas novas:** escolher `bigint` ou `uuid` conforme a necessidade real de cada entidade, sem impor conversão global.
- **Segurança:** continuar dependendo de RLS, autorização e validações no servidor — não do formato do identificador.

### Justificativa

É a estratégia mais segura para o estado atual do Angel Cosméticos e evita uma migração estrutural de alto risco sem benefício de segurança demonstrado. A segurança do catálogo não depende de opacidade de id: a leitura pública é controlada por RLS sobre `ativo = true`, a mutação por `is_admin()`, e o acesso a dados de cliente por escopo `cliente_id` verificado no servidor. O identificador público já é o `slug`, e é ele que deve permanecer nas URLs.

### Condicionante

FECHADA de forma **condicional**: sujeita à confirmação do estado real do schema e das dependências no Gate 9. A evidência de suporte já foi colhida na auditoria read-only de 2026-10-21 (Anexo A); o Gate 9 deve reconfirmá-la antes de qualquer migration.

### Impacto técnico (resumo — detalhes no Gate 9)

- Nenhuma reescrita de PK/FK existente: 11 FKs apontam para `produto(id)` (`carrinho_item`, `estoque`, `estoque_movimentacao`, `kit_composicao`, `pedido_item`, `produto_atributo`, `produto_categoria`, `produto_imagem`, `produto_opcao_compra`, `produto_variante`, `promocao`) e permanecem válidas.
- `produto.slug` (`NOT NULL`, índice `produto_slug_unique`) permanece como chave pública de resolução; a geração automática (slugify + resolução de colisão) é especificada no Gate 9, não nesta decisão.
- As 68 policies existentes (29 tabelas com RLS ativa) seguem válidas sem reescrita.
- Tabelas criadas no Gate 9 devem declarar o tipo de id explicitamente, com justificativa por entidade; tabelas que espelham entidades do Supabase Auth usam `uuid` por compatibilidade natural.
- IDOR permanece coberto por RLS + escopo por `cliente_id`; opacidade de id não é requisito de segurança.

### Decisor

Dono do negócio (arquitetura), com validação da auditoria técnica read-only.

### Evidência anterior

- 29 tabelas em `public` com RLS ativa e 68 policies (auditoria read-only 2026-10-21).
- 17 tabelas com PK `bigint`; **0 colunas `uuid`** em todo o schema.
- `produto_slug_unique` (índice único) + `idx_produto_slug_trgm` (GIN trgm) já suportam resolução pública por slug.
- Única FK do schema para `auth.users` é `admin_user.concedido_por` — `cliente` ainda não possui vínculo com `auth.users` (decisão de modelagem a tomar no Gate 9, fora do escopo de A1).

### Status

PENDENTE → **FECHADO (condicional ao Gate 9)**

---

## DECISÃO A2 — Descrição estruturada do produto

**PENDENTE** — aguardando decisão humana.

### Contexto

O modelo de produto prevê descrição estruturada (Descrição, Material, Composição, Cuidados, Características) em vez de um único campo de texto. O schema já contém o EAV de produto `produto_atributo` + `produto_atributo_valor` (nível produto) e `produto_variante_atributo` + `produto_opcao_valor` (nível variante). Hoje `produto.descricao` é `text` único.

### Opções

- **A — EAV existente + `descricao_resumida`:** blocos nomeados no EAV de produto já existente + uma coluna curta para card/SEO. Nenhuma coluna nova em `produto` além de `descricao_resumida`.
- **B — 5 colunas em `produto`:** `descricao_curta`, `descricao_completa`, `material`, `composicao`, `cuidados`. Mais simples de consultar; menos flexível; mais colunas em `produto`.
- **C — EAV sem coluna resumida:** a descrição curta vira um atributo nomeado; nenhuma coluna nova em `produto`.

### Recomendação da auditoria

**Opção A** — o EAV de produto já está aplicado e o `produto_atributo` tem `nome` + `ordem`, o que casa exatamente com blocos ordenados. A coluna `descricao_resumida` cobre o caso de uso de card/SEO que o EAV tornaria caro de consultar.

### Conflito a reconciliar no Gate 7

D1 (`DECISOES_NEGOCIO_v1.3.md`) proíbe atributos livres/EAV/JSONB **para atributos de variante**, limitando a tamanho/cor/volume. As tabelas `produto_atributo_valor`, `produto_opcao_valor` e `produto_variante_atributo` existem no schema aplicado, o que tensiona a leitura literal de D1. A2 deve delimitar explicitamente: EAV **no nível produto** (blocos de descrição) é compatível com D1; EAV **no nível variante** exige nova decisão de negócio. Este texto não substitui D1.

### Decisor

Dono do negócio, com o contrato funcional (Gate 8) como meio de formalização.

### Status

PENDENTE

---

## DECISÃO A3 — Reconciliação do ledger `schema_migrations` × schema real

**PENDENTE** — bloqueia qualquer migration real.

### Contexto

`supabase_migrations.schema_migrations` registra 12 linhas. Sete delas (`20261003000002`–`20261003000008`) declaram `statements` gravados mas **nunca foram executadas**: as tabelas `orcamento`, `orcamento_item`, `orcamento_status_historico`, `desconto_comercial`, `condicao_pagamento`, `servico`, `profissional`, `agenda`, `agendamento`, `notificacao*`, `mimo*`, `pagamento_estorno` e os `ALTER` de `auditoria.ator_auth_id`/`ator_tipo`, `kit_composicao.kit_produto_id`, `produto.sku`/`produto_sku_unique`, `promocao.prom_valor_check`, `pagamento.pag_status_check`, `produto_opcao_compra.poc_tipo_check` e `categoria` id=1 não existem no schema real. Consequência: `supabase db push` nunca criará esses objetos.

### Opções

- **A — Reverter as 7 linhas falsas:** backup do `schema_migrations`, `DELETE` das 7 entradas `20261003000002`–`20261003000008` e reaplicar o que falta a partir de `000002` real, com id de execução real.
- **B — Renomear os arquivos locais:** reverter no ledger e renomear `2026100300000X` para datas novas, evitando reaplicar o que era apenas `ALTER`/`CREATE` já existente.
- **C — Snapshot + reconstrução:** `pg_dump` completo, dropar e recriar o schema `public` do zero com o modelo novo (opção mais limpa; exige janela de manutenção e reimportação de dados).

### Recomendação da auditoria

**Opção A** — preserva o schema aplicado (que já contém `is_admin()` seguro, `admin_user` com 1 admin, `produto_imagem_principal_unica` e `produto_imagem_read_anon`), mantém o histórico de migrations auditável e deixa o `push` coerente com o banco. Exige `pg_dump` antes de qualquer escrita.

### Dependências

A3 é pré-requisito de qualquer migration do Gate 10 e, portanto, de A2 e de qualquer decisão que dependa de `notificacao*` (preferências do cliente), `desconto_comercial`/`condicao_pagamento` (checkout) e `pagamento_estorno` (estorno).

### Decisor

Dono do negócio, com execução técnica assistida e backup obrigatório.

### Status

PENDENTE

---

## Anexo A — Evidência (auditoria read-only, 2026-10-21)

Conexão: `aws-0-sa-east-1.pooler.supabase.com:5432/postgres`, usuário `postgres.bmqxgibhuzekxpcgosap`. Somente `SELECT`; nenhuma escrita, nenhuma DDL, nenhuma alteração de dados.

| Item | Resultado |
|---|---|
| Tabelas em `public` | 29, todas com RLS ativa (`rowsecurity = true`), 68 policies |
| Tipos de id | 17 tabelas com PK `bigint`; 0 colunas `uuid` |
| `produto` | `id bigint`, `slug` NOT NULL (`produto_slug_unique`), `descricao text`, `preco_base numeric` |
| FKs → `produto(id)` | 11 |
| `produto_atributo` / `produto_atributo_valor` | existem (EAV de produto) |
| `cliente` | sem FK para `auth.users`; `email` com índice único; 0 linhas |
| `carrinho` | `cliente_id` + `session_id`; `idx_carrinho_session_unique` (único parcial onde `cliente_id IS NULL`) → modelo visitante→conta já suportado |
| `evento` | `nome`, `entidade_tipo`, `entidade_id`, `dados jsonb`, `status (pendente/processado/falhou)`, `tentativas`, `idempotency_key` (único parcial); CHECK de `nome` whitelist-a 11 eventos de domínio |
| `estoque` | `quantidade_fisica` / `quantidade_reservada` com CHECK `reservada ≤ física` e XOR produto/variante |
| `pagamento` | `metodo`, `status`, `valor`, `transaction_id`, `provider`, `dados_externos jsonb`, `confirmado_em`; CHECKs atuais restritos a `pix|cartao` e `pendente|aprovado|recusado` |
| `pedido` | 26 colunas com snapshot de endereço, `frete_regra_id`, valores e `status`/`status_pagamento`/`metodo_pagamento` com CHECKs de 5/3/2 valores |
| `frete_regra` | 11 colunas; `tipo` ∈ {fixo, por_kg, percentual_subtotal, gratis}; 0 linhas — método e regra na mesma tabela |
| Extensões | `supabase_vault` ✅ (guarda de segredos), `pg_net`/`pgmq` ❌ ausentes |
| Enums fora de domínio | 13 enums `remocao_*` (ambulância/SAMU) sem tabela correspondente — herança de outro produto |

## Anexo B — Itens em aberto (não são decisões, são pendências de execução)

1. **Credenciais expostas** no histórico Git e em arquivos versionados (`supabase/inspect-ddl.cjs:9`, `test-direct.cjs:3`, `supabase-backup-20261015-pre-migrations.dump`, `supabase-backup-pre-migrations-p17.sql`): rotação de senha do Postgres e da conta Auth necessária **antes** de qualquer push.
2. **Ledger**: A3.
3. **Favoritos**: não existe tabela; `web/src/contexts/FavoritesContext.tsx` é `localStorage` (`angel-favorites`).
4. **Vínculo cliente ↔ auth**: `cliente.auth_user_id` ausente; `cliente` e `auth.users` são hoje independentes.
5. **Configurações da loja**: não existe tabela de parâmetros (WhatsApp, chave PIX, gateway, frete padrão).
6. **Fila de automação**: falta o leitor de `evento` (Edge Function) e o segredo do n8n (via `supabase_vault`).
7. **Legado fora do catálogo**: `chat/` (Express, porta 10000, `openai` + `openrouter-sdk`, `/api/chat`), `prisma/schema.prisma` (165 B) e `assets/php/` (25 arquivos, `db_config.php` com `root/root`).
8. **Enums `remocao_*`**: candidatos a drop (13 enums sem tabela).

---

**Fim do documento. Decisão A1 fechada; A2 e A3 aguardando decisão humana. Nenhuma alteração de schema, banco, contrato ou histórico Git autorizada por este documento.**
