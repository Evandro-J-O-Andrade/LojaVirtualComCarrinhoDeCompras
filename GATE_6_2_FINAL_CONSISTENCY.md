# GATE 6.2 — CONSISTÊNCIA FINAL

**Projeto:** Angel Cosméticos — E-commerce
**Data:** 2026-09-19
**Status:** CONSISTÊNCIA FINAL — Último gate antes de derivação de migrations
**Documento referência:** MODELO_DE_DADOS_GATE62.md

> ⚠️ **Nenhuma migration criada. Nenhum código alterado. Nenhum Supabase alterado. Nenhum push.**

---

## 1. Checklist de Consistência (20 verificações)

| # | Verificação | Resultado | Evidência |
|---|-------------|-----------|-----------|
| 1 | Todas as entidades citadas existem no modelo | ✅ | Seções 5-15 do MODELO_DE_DADOS_GATE62.md |
| 2 | Todas as FKs apontam para entidades existentes | ✅ | Todas as FK definitions verificadas |
| 3 | Nenhum campo obrigatório contradiz regra de negócio | ✅ | Constraints CK check verificadas |
| 4 | Nenhuma entidade PROPOSTA permaneceu sem classificação | ✅ | Todas fechadas: produto_opcao_compra, produto_opcao_valor, kit_composicao → FECHADO |
| 5 | Nenhuma regra ABERTA permaneceu | ✅ | Regras de preço, promoção, checkout resolvidas |
| 6 | `produto → variante → SKU` separado de `produto → opção → kit` | ✅ | Variação = atributo; Opção = forma de compra; Kit = composição |
| 7 | Preço da variante × preço próprio da opção inequívoco | ✅ | Regra: preco_proprio SE NOT NULL CASO CONTRÁRIO variante |
| 8 | Kit não possui estoque físico independente | ✅ | Estoque compartilhado com componentes (Regra Rodada 3) |
| 9 | Reserva de kit afeta componentes | ✅ | Kits_disponíveis = MIN(componentes/quantidade) |
| 10 | Pedido possui snapshots necessários | ✅ | preço, endereço, frete, produto, opção, kit |
| 11 | Carrinho é revalidado server-side | ✅ | Regra 1 — Revalidação no checkout |
| 12 | Eventos possuem idempotência | ✅ | idempotency_key UNIQUE parcial + status processado |
| 13 | RLS/IDOR definido por entidade | ✅ | Seção 17 (RLS deny-by-default, IDOR protection) |
| 14 | Service Role não aparece como dependência do frontend | ✅ | Regra: SERVICE_ROLE_KEY jamais no frontend |
| 15 | Storage está definido | ✅ | Bucket `product-images`, público, upload protegido |
| 16 | Auditoria está definida | ✅ | INSERT ONLY, imutabilidade, scope mínimo definido |
| 17 | Constraints e FKs críticas documentadas | ✅ | Seção 20 (Constraints), CK + FK para cada tabela |
| 18 | Migrations antigas NÃO são fonte de verdade | ✅ | Seção 22 — todas classificadas como REVISÁVEL/APROVEITÁVEL |
| 19 | Nenhuma tabela/campo herdado do legado sem justificativa | ✅ | Tabelas legadas mapeadas e substituídas |
| 20 | Modelo representa vestido+tamanho/cor, toalha+pacotes, kit+composição, cosmético+volume sem JSONB comercial | ✅ | D1 rejeita JSONB; atributos em tabelas tipadas |

---

## 2. Verificação de Entidades Fechadas

| Entidade | Classificação anterior | Classificação atual | Regras fechadas |
|----------|----------------------|--------------------|--------------------|
| `produto_opcao_compra` | PROPOSTA | FECHADO | Preço: preco_proprio → variante fallback |
| `produto_opcao_valor` | PROPOSTA | FECHADO | Valores definidos por opção, ativo, UNIQUE(opcao, valor) |
| `kit_composicao` | PROPOSTA | FECHADO | Sem estoque próprio, reserva consome componentes, variante → produto |
| Storage | PENDENTE | FECHADO | Bucket `product-images`, público, upload protegido |
| Auditoria | PROPOSTA | FECHADO | Scope mínimo definido, INSERT ONLY |

---

## 3. Verificação de Separação de Conceitos

```text
produto
├── variante (atributo: tamanho, cor, volume)
│     └── SKU (produto_variante.sku)
├── opção de compra (produto_opcao_compra: como comprar)
│     └── valor da opção (produto_opcao_valor: quantidade, kit)
├── composição (kit_composicao: componentes do kit)
├── imagem (produto_imagem)
└── categoria (produto_categoria N:N)

carrinho_item → configuração comercial:
├── produto_id
├── produto_variante_id (SKU)
├── produto_opcao_compra_id (opção)
├── kit_composicao_id (kit — referência auxiliar)
└── snapshots (nome, preço, opções, composição)

pedido_item → configuração comercial snapshot:
├── produto_id
├── produto_variante_id (SKU)
├── produto_opcao_compra_id (opção)
├── kit_composicao_id (kit — referência apenas)
├── opcao_texto (snapshot — IMUTÁVEL)
├── kit_composicao_texto (snapshot — IMUTÁVEL)
└── preço, desconto, total (snapshots)
```

---

## 4. Regras de Ouro Verificadas

| Regra | Origem | Status |
|-------|--------|--------|
| Carrinho NÃO é autoridade final — revalidação server-side | Rodada 3 Regra 1 | ✅ |
| Pedido comercialmente imutável | Rodada 3 Regra 2 | ✅ |
| Configuração comercial preservada em pedido_item | Rodada 3 Regra 3 | ✅ |
| RLS deny-by-default | Rodada 4 | ✅ |
| IDOR — nenhum id do cliente autoriza acesso | Rodada 4 | ✅ |
| Service Role nunca no frontend | Rodada 4 | ✅ |
| Idempotência de eventos | Rodada 4 | ✅ |
| Preço próprio da opção NÃO é soma dos componentes | Rodada 5 | ✅ |

---

## 5. Regra do Gate

```text
SE houver qualquer ABERTO
→ NÃO gerar migration.

SE houver qualquer contradição
→ NÃO gerar migration.

SE houver qualquer FK ambígua
→ NÃO gerar migration.

SE tudo estiver consistente
→ APROVADO PARA DERIVAÇÃO DE MIGRATIONS.
```

---

## 6. Resultado do Gate

| Critério | Resultado |
|----------|-----------|
| Todas as 20 verificações | ✅ PASS |
| Entidades PROPOSTA restantes | 0 |
| Regras ABERTA restantes | 0 |
| Contradições detectadas | 0 |
| FKs ambíguas | 0 |

**Resultado: GATE 6.2 — CONSISTÊNCIA FINAL: PASS**

**Condição:** APROVADO PARA DERIVAÇÃO DE MIGRATIONS

> ⚠️ **Derivação de migrations NÃO significa aplicar no Supabase.** Significa apenas que o modelo de dados está consistente o suficiente para gerar SQL migrations a partir dele. As migrations ainda precisam de revisão humana antes da aplicação.

---

> **FIM DO GATE — GATE_6_2_FINAL_CONSISTENCY.md**
> **Próximo passo:** Derivar migrations SQL do modelo (ainda sem aplicar no Supabase)
