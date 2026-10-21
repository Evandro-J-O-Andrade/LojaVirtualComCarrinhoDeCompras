# Gate 6.3 — Derivação de Migrations SQL

## Status

| Etapa | Status |
|-------|--------|
| 6.3A — Derivação Estrutural | ✅ `concluído` |
| 6.3B — Auditoria de Migrations | ✅ `concluído` |

## Resultado da Auditoria 6.3B (Verificado no Supabase)

| Categoria | Status | Contagem Real |
|-----------|--------|--------------|
| Completude (28 tabelas) | ✅ PASS | 28/28 |
| FKs | ✅ PASS | 42/42 |
| CHECK constraints | ✅ PASS | 56 |
| UNIQUE constraints | ✅ PASS | 11 |
| PK constraints | ✅ PASS | 28/28 |
| RLS policies | ✅ PASS | 28/28 tabelas + 61 policies |
| Segurança (0 destructive ops) | ✅ PASS | |
| Indexes | ✅ PASS | 99 |
| Sequences | ✅ PASS | 27 (1 junction table sem seq) |
| Ordem execução | ✅ PASS | |

**Conclusão: AUDITORIA APROVADA** — 2 issues críticos corrigidos (preco_base e preco CHECKs), 2 warnings resolvidos (fornecedor_read precisão, pagamento FK).

**Policies detalhamento:**
- `202609190103_rls_policies.sql` — 51 policies iniciais (23 tabelas)
- `202609190103b_rls_additional.sql` — 10 policies adicionais (5 tabelas admin: produto_atributo, produto_atributo_valor, produto_categoria, produto_imagem, produto_variante_atributo)

## Fonte

- **Modelo definitivo:** `MODELO_DE_DADOS_GATE62.md` (Gate 6.2 — APROVADO PARA DERIVAÇÃO)
- **Escopo:** 27 entidades, 0 regras abertas, 0 contradições, 0 FKs ambíguas

## Arquivos Gerados (6.3A)

| Arquivo | Conteúdo |
|---------|----------|
| `supabase/migrations/202609190101_base_schema.sql` | CREATE TABLE para todas as 28 entidades, FKs, CHECKs, UNIQUEs |
| `supabase/migrations/202609190102_indexes.sql` | Índices FK, UNIQUE parciais, EXCLUDE extension |
| `supabase/migrations/202609190103_rls_policies.sql` | RLS policies + função helper `is_admin()` (51 policies, 23 tabelas) |
| `supabase/migrations/202609190103b_rls_additional.sql` | 10 RLS policies adicionais para 5 tabelas admin |
| `supabase/GATE_6_3_DERIVACAO.md` | Este documento |
| `supabase/GATE_6_3B_AUDITORIA.md` | Auditoria completa das migrations geradas |

## Ordem de Execução

```
0101_base_schema.sql    → Todas as tabelas em ordem de dependência (Tier 0→10)
0102_indexes.sql        → Índices, UNIQUE parcial, EXCLUDE extension
0103_rls_policies.sql   → Função helper + RLS por tabela (51 policies)
0103b_rls_additional.sql → RLS adicional para 5 tabelas admin (10 policies)
```
0101_base_schema.sql    → Todas as tabelas em ordem de dependência (Tier 0→10)
0102_indexes.sql        → Índices, UNIQUE parcial, EXCLUDE extension
0103_rls_policies.sql   → Função helper + RLS por tabela
```

## Organização por Tiers (base schema)

| Tier | Tabelas | Justificativa |
|------|---------|---------------|
| 0 | `categoria`, `fornecedor`, `produto_atributo`, `produto_atributo_valor` | Sem FK externo ao modelo |
| 1 | `produto`, `produto_imagem`, `produto_categoria`, `produto_opcao_compra`, `produto_opcao_valor`, `kit_composicao`, `promocao` | Dependem de Tier 0 |
| 2 | `produto_variante`, `produto_variante_atributo` | Dependem de Tier 1 (variante pertence a produto) |
| 3 | `cliente`, `endereco` | Entidades de domínio independentes de produtos |
| 4 | `carrinho`, `carrinho_item` | Dependem de cliente e produto |
| 5 | `frete_regra` | Sem FK para entidades comerciais |
| 6 | `pedido`, `pagamento`, `pedido_status_historico`, `pedido_item` | Dependem de cliente, endereço, frete, produto |
| 7 | `estoque`, `estoque_movimentacao` | Dependem de produto/variante |
| 8 | `atendimento`, `atendimento_mensagem` | Dependem de cliente e pedido |
| 9 | `evento` | Automação — sem FK comercial |
| 10 | `auditoria` | Audit — sem FK comercial |

## Decisões de Derivação

### Convenções de nomenclatura
- Timestamps duplos: `created_at` + `updated_at` (exceto onde o modelo especificou `criado_em`/`atualizado_em`)
- Tabelas no singular, snake_case
- PKs: `id bigserial` para todas (condizente com projeto em inicialização, < 10^7 linhas/tabela)

### Tabelas com nomes específicos do modelo
- `produto_opcao_compra` — opção de compra (não "opcao_produto" — manter nome do modelo)
- `produto_opcao_valor` — valor da opção de compra
- `kit_composicao` — composição de kit
- `produto_variante` — variante de produto (NÃO é SKU)
- `produto_variante_atributo` — junction variant ↔ atributo valor
- `frete_regra` — regras de frete configuráveis
- `pedido_status_historico` — histórico de alterações de status
- `estoque_movimentacao` — log de movimentações de estoque

### Constraints aplicadas
- CHECKs de domínio: todos (status válidos, tipos válidos, valores ≥ 0, CEP formato)
- UNIQUE: SKU, slug, CNPJ, email, número pedido, (produto_id, nome) atributo
- UNIQUE parcial: endereço principal por cliente, carrinho session sem cliente, evento idempotency
- EXCLUDE: estoque único por produto/variante (D4)
- ON DELETE: CASCADE onde a entidade é dona; RESTRICT onde dados históricos importam (pagamento→pedido, endereço→pedido, estoque→movimentacao)

### RLS aplicado
- Tabelas públicas (catálogo): leitura anônima, escrita admin
- Tabelas de dono: autenticado, apenas dono
- Pedido: dono (leitura/criação/cancelamento) + admin (status)
- Auditoria: INSERT ONLY via service_role, SELECT/UPDATE/DELETE proibidos
- Evento: leitura admin, INSERT service_role

### Diferenças propositais vs. modelo textual
- `produto_variante.peso` nullable — modelo não especificou obrigatoriedade
- `produto.peso` não incluído — não estava no modelo para produto base
- `pedido.metodo_pagamento` + `status_pagamento` no próprio pedido — snapshot para histórico
- `pagamento.dados_externos jsonb` — flexibilidade para providers Pix/Cartão
- `evento.tentativas` integer — suporte a retry com backoff

## Próximos Passos

1. **[DONE]** Revisar arquivos gerados (auto-review 6.3A)
2. **[DONE]** Registrar decisões de auditoria no `auditoria_tabelas` (Q1)
3. **[DONE]** Executar Gate 6.3B — auditoria das migrations geradas — APROVADO
4. **[PENDENTE]** Registrar 8.17 no plano rework quando testes concluídos
