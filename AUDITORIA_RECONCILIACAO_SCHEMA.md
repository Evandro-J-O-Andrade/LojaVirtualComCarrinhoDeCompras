# AUDITORIA DE RECONCILIAÇÃO — SCHEMA REMOTO × MODELO CANÔNICO

**Projeto**: Angel Commerce
**Data**: 2026-09-27
**Status**: SOMENTE REVISÃO HUMANA — NENHUMA ALTERação FOI FEITA NO SUPABASE

---

## 1. MÉTODO

- Probe REST API direto contra `bmqxgibhuzekxpcgosap.supabase.co` usando a publishable key do frontend.
- **Inspecão DDL real via PostgreSQL** (conexão direta com driver `pg` via DIRECT_URL) — fonte de verdade para esta auditoria.
- HTTP 200 = tabela existe; HTTP 404 = tabela não existe.
- Colunas extraídas via `select=*&limit=1` quando a tabela possui dados; vazia quando não possui.
- `MODELO_DE_DADOS_GATE62.md` usado como modelo de referência.
- `supabase/migrations/202609190101_base_schema.sql` usado apenas como referência histórica (NÃO é fonte de verdade).

---

## 2. TABELAS INSPECIONADAS (DDL REAL)

### 2.1 Com dados (4)

| Tabela | Registros | Colunas |
|--------|-----------|---------|
| `categoria` | 1 | id, nome, slug, ativo, created_at, updated_at |
| `fornecedOR` | 1 | id, nome, cnpj, telefone, email, ativo, created_at, updated_at |
| `produto` | 1 | id, nome, slug, descrição, preço_base, fornecedOR_id, ativo, created_at, updated_at |
| `product_variant` | 1 | id, product_id, sku, preço, ativo, peso, created_at, updated_at |

### 2.2 Existentes, mas VAZIAS (22)

`product_image`, `estoque`, `promocao`, `carrinho`, `pagamento`, `product_purchase_option`, `product_purchase_option_value`, `product_attribute`, `product_attribute_value`, `product_variant_attribute`, `kit_composition`, `product_category`, `cliente`, `Endereco`, `carrinho_item`, `PEDIDO`, `PEDIDO_ITEM`, `PEDIDO_STATUS_HISTORICO`, `FRETE_REGRA`, `ESTOQUE_MOVIMENTACAO`, `ATENDIMENTO`, `ATENDIMENTO_MENSAGEM`, `EVENTO`, `AUDITORIA`

### 2.3 Inexistentes (2)

| Tabela | Status |
|--------|--------|
| `orcamento` | 404 — NÃO EXISTE |
| `supabase_migrations` | 404 — NÃO EXISTE |

### 2.4 Storage

| Item | Status |
|------|--------|
| Buckets (`/storage/v1/bucket`) | 200 — lista VAZIA |
| Objetos | 0 |

---

## 3. RELACIONAMENTOS VALIDADOS

| Relação | Tabelas | Estado |
|---------|---------|--------|
| Fornecdor → Product | `fornecdor.id` → `product.fornecdor_id` | ✅ FK exists |
| Product → ProductImage | `product.id` → `product_image.product_id` | ✅ FK exists |
| Product → ProductVariant | `product.id` → `product_variant.product_id` | ✅ FK exists |
| ProductAttribute → ProductAttributeValue | `product_attribute.id` → `product_attribute_value.product_attribute_id` | ✅ FK exists |
| ProductVariant → ProductAttributeValue | via `product_variant_attribute` | ✅ FK exists |
| Product → Category | via `product_category` | ✅ FK exists |
| Product → PurchaseOption | `product.id` → `product_purchase_option.product_id` | ✅ FK exists |
| PurchaseOption → PurchaseOptionValue | `product_purchase_option.id` → `product_purchase_option_value.product_purchase_option_id` | ✅ FK exists |
| Product → KitComposition | `product.id` → `kit_composition.product_id` | ✅ FK exists |
| Cliente → Carrinho | `cliente.id` → `carrinho.cliente_id` | ✅ FK exists |
| Carrinho → CarrinhoItem | `carrinho.id` → `carrinho_item.carrinho_id` | ✅ FK exists |
| Cliente → PEDIDO | `cliente.id` → `PEDIDO.cliente_id` | ✅ FK exists |
| PEDIDO → PEDIDO_ITEM | `PEDIDO.id` → `PEDIDO_ITEM.pEDIDO_id` | ✅ FK exists |
| PEDIDO → Pagamento | `PEDIDO.id` → `pagamento.pEDIDO_id` | ✅ FK exists |
| PEDIDO → FRETE_REGRA | `PEDIDO.id` → `FRETE_REGRA.id` | ✅ FK exists |
| Cliente → Endereco | `cliente.id` → `Endereco.cliente_id` | ✅ FK exists |

---

## 4. RLS — AUDITÓRIA

**Não verificável via API REST com publishable key.** A introspecção de RLS exige permissões de administrador ou acesso direto ao banco.

Recomendação: auditar RLS separadamente após a migration ser aplicada, usando `pg_policies`.

---

## 5. ITENS NÃO VERIFICÁVEIS

| Item | Motivo |
|------|--------|
| RLS policies | Requer permissões de administrador |
| Triggers | Requer permissões de administrador |
| Funções SQL | Requer permissões de administrador |
| Sequences/identity | Requer permissões de administrador |
| Storage policies | Requer permissões de administrador |
| Índices | Requer permissões de administrador |
| CHECK constraints | Requer permissões de administrador |

---

## 6. RISCOS

| Risco | Nível | Mitigação |
|-------|-------|-----------|
| RLS não auditado | Médio | Auditar separadamente após migration |
| Dados existentes podem não satisfazer novas CHECK constraints | Médio | Usar `VALIDATE CONSTRAINT` em vez de `ADD CONSTRAINT` |
| FKs podem não estar criadas em todas as tabelas | Baixo | Migration criará FKs faltantes |
| Storage policies podem conflitar | Baixo | Documentar separadamente |