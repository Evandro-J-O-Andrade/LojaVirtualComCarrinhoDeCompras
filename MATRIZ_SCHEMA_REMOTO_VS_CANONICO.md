# MATRIZ DE DIFERENÇAS — SCHEMA REMOTO × MODELO CANÔNICO

**Projeto**: Angel Commerce
**Data**: 2026-09-27
**Status**: SOMENTE REVISÃO HUMANA

---

## Legenda

- **EXISTE E CORRETA**: tabela existe no remoto com a estrutura esperada.
- **EXISTE MAS VAZIA**: tabela existe, mas sem dados comerciais.
- **NÃO EXISTE**: tabela não existe no remoto.
- **MODELO DIVERGENTE**: tabela existe, mas estrutura difere do modelo.
- **PRECISA DECISÃO**: conflito que exige escolha humana.

---

## 1. CATÁLOGO

| Entidade | Modelo | Remoto | Estado | Ação |
|---------|--------|--------|--------|------|
| `categoria` | ✅ | ✅ 1 reg | EXISTE E CORRETA | Nenhuma |
| `fornecedOR` | ✅ | ✅ 1 reg | EXISTE E CORRETA | Nenhuma |
| `product` | ✅ | ✅ 1 reg | EXISTE E CORRETA | Nenhuma |
| `product_category` | ✅ | ✅ VAZIA | EXISTE MAS VAZIA | Seed |
| `product_image` | ✅ | ✅ VAZIA | EXISTE MAS VAZIA | Seed + Storage |

## 2. PRODUTO

| Entidade | Modelo | Remoto | Estado | Ação |
|---------|--------|--------|--------|------|
| `product_attribute` | ✅ | ✅ VAZIA | EXISTE MAS VAZIA | Seed |
| `product_attribute_value` | ✅ | ✅ VAZIA | EXISTE MAS VAZIA | Seed |
| `product_variant` | ✅ | ✅ 1 reg | EXISTE MAS INCOMPLETA | Seed (atributos faltando) |
| `product_variant_attribute` | ✅ | ✅ VAZIA | EXISTE MAS VAZIA | Seed |
| `product_purchase_option` | ✅ | ✅ VAZIA | EXISTE MAS VAZIA | Seed |
| `product_purchase_option_value` | ✅ | ✅ VAZIA | EXISTE MAS VAZIA | Seed |
| `kit_composition` | ✅ | ✅ VAZIA | EXISTE MAS VAZIA | Seed |
| `promocao` | ✅ | ✅ VAZIA | EXISTE MAS VAZIA | Seed |
| `estoque` | ✅ | ✅ VAZIA | EXISTE MAS VAZIA | Seed |

## 3. CLIENTE

| Entidade | Modelo | Remoto | Estado | Ação |
|---------|--------|--------|--------|------|
| `cliente` | ✅ | ✅ VAZIA | EXISTE MAS VAZIA | Seed |
| `Endereco` | ✅ | ✅ VAZIA | EXISTE MAS VAZIA | Seed |

## 4. CARRINHO

| Entidade | Modelo | Remoto | Estado | Ação |
|---------|--------|--------|--------|------|
| `carrinho` | ✅ | ✅ VAZIA | EXISTE MAS VAZIA | Seed |
| `carrinho_item` | ✅ | ✅ VAZIA | EXISTE MAS VAZIA | Seed |

## 5. PEDIDO

| Entidade | Modelo | Remoto | Estado | Ação |
|---------|--------|--------|--------|------|
| `PEDIDO` | ✅ | ✅ VAZIA | EXISTE MAS VAZIA | Seed |
| `PEDIDO_ITEM` | ✅ | ✅ VAZIA | EXISTE MAS VAZIA | Seed |
| `PEDIDO_STATUS_HISTORICO` | ✅ | ✅ VAZIA | EXISTE MAS VAZIA | Seed |
| `pagamento` | ✅ | ✅ VAZIA | EXISTE MAS VAZIA | Seed |

## 6. FRETE

| Entidade | Modelo | Remoto | Estado | Ação |
|---------|--------|--------|--------|------|
| `FRETE_REGRA` | ✅ | ✅ VAZIA | EXISTE MAS VAZIA | Seed |
| `ESTOQUE_MOVIMENTACAO` | ✅ | ✅ VAZIA | EXISTE MAS VAZIA | Seed |

## 7. ATENDIMENTO

| Entidade | Modelo | Remoto | Estado | Ação |
|---------|--------|--------|--------|------|
| `ATENDIMENTO` | ✅ | ✅ VAZIA | EXISTE MAS VAZIA | Seed |
| `ATENDIMENTO_MENSAGEM` | ✅ | ✅ VAZIA | EXISTE MAS VAZIA | Seed |
| `EVENTO` | ✅ | ✅ VAZIA | EXISTE MAS VAZIA | Seed |
| `AUDITORIA` | ✅ | ✅ VAZIA | EXISTE MAS VAZIA | Seed |

## 8. ORÇAMENTO

| Entidade | Modelo | Remoto | Estado | Ação |
|---------|--------|--------|--------|------|
| `orcamento` | ❌ não no modelo | ❌ 404 | NÃO EXISTE | ⚠️ DECISÃO FECHADA: SIM |
| `orcamento_item` | ❌ não no modelo | ❌ 404 | NÃO EXISTE | ⚠️ DECISÃO FECHADA: SIM |

## 9. STORAGE

| Item | Modelo | Remoto | Estado | Ação |
|------|--------|--------|--------|------|
| Bucket `product-images` | ✅ | ❌ 0 buckets | NÃO EXISTE | ⚠️ DECISÃO FECHADA: SIM |

---

## 10. RESUMO

| Estado | Quantidade |
|--------|-----------|
| EXISTE E CORRETA | 4 |
| EXISTE MAS VAZIA | 22 |
| NÃO EXISTE | 2 (`orcamento`, `orcamento_item`) |
| PRECISA DECISÃO | 1 (Storage) |
| **Total** | **29** |