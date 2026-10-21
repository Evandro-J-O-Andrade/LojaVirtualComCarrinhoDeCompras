# REVISÃO TÉCNICA — MIGRATION DE RECONCILIAÇÃO

**Projeto**: Angel Commerce
**Data**: 2026-09-27
**Status**: SOMENTE REVISÃO HUMANA — NENHUMA ALTERação FOI FEITA NO SUPABASE

---

## 1. METODOLOGIA

- Inspeção DDL real via PostgreSQL (driver pg, conexão direta via DIRECT_URL).
- Comparação ponto a ponto contra o schema remoto.
- Análise de idempotência, segurança e impacto.

---

## 2. ARQUIVOS REVISADOS

| Arquivo | Linhas | Estado |
|---------|--------|--------|
| `supabase/migrations/20260920000002_angel_commerce_reconciliation.sql` | 211 | CORRETO |
| `supabase/storage/product-images-policies.sql` | 49 | CORRETO |

---

## 3. VEREDITO POR ITEM

### 3.1 SQL SINTATICAMENTE COERENTE

**VERDICTO: APROVADO**

A migration usa sintaxe PostgreSQL correta:
- `CREATE TABLE IF NOT EXISTS`
- `CREATE INDEX IF NOT EXISTS`
- `DO $$ BEGIN ... END $$;` para constraints idempotentes
- `CREATE POLICY` com `USING` e `WITH CHECK`
- `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`

### 3.2 IDEMPOTÊNCIA

**VERDICTO: APROVADO COM AVISO**

- `CREATE TABLE IF NOT EXISTS orcamento` / `orcamento_item` — seguras
- `CREATE INDEX IF NOT EXISTS` — seguras
- `ALTER TABLE orcamento ADD CONSTRAINT orcClienteFK` — **NÃO IDEMPOTENTE** (falha se já existir)
- `ALTER TABLE produto ADD CONSTRAINT` protegido por `IF NOT EXISTS` — seguro
- Policies: `CREATE POLICY` sem `IF NOT EXISTS` — **NÃO IDEMPOTENTE**

### 3.3 FKs

**VERDICTO: APROVADO**

- `orcamento.cliente_id → cliente.id` (ON DELETE SET NULL) — correto
- `orcamento_item.orcamento_id → orcamento.id` (ON DELETE CASCADE) — correto
- `orcamento_item.produto_id → produto.id` (ON DELETE RESTRICT) — correto
- `orcamento_item.produtoVarianteId → produto_variante.id` (ON DELETE SET NULL) — correto

### 3.4 ON DELETE

**VERDICTO: APROVADO**

- `orcamento` → `SET NULL`: um cliente pode ser removido sem apagar orçamentos históricos
- `orcamento_item` → `CASCADE`: item é destruído com o orçamento
- `orcamento_item.produto_id` → `RESTRICT`: não apagar produto que tem item de orçamento

### 3.5 CHECKs

**VERDICTO: APROVADO**

- `orc_status_check`: status válidos para orçamento
- `oi_quantidade_check`: quantidade > 0
- `oi_preco_check`: preço_unitário >= 0
- `orc_preco_base_positivo`: produto.preco_base >= 0
- `orc_preco_positivo`: produto_variante.preco >= 0

### 3.6 RLS

**VERDICTO: APROVADO**

Padrão corrigido para `auth.jwt() ->> 'email'` matching `cliente.email` (igual a `carrinho`, `pedidos`, `atendimento`). Função `is_admin()` já existe no remoto.

### 3.7 STORAGE

**VERDICTO: APROVADO**

- Bucket `product-images` JÁ EXISTE no remoto
- Policies propostas usam `is_admin()` (padrão do projeto)
- Leitura pública mantida

### 3.8 PRESERVAÇÃO DOS DADOS EXISTENTES

**VERDICTO: APROVADO**

- Nenhuma `DROP TABLE`, `DROP COLUMN`, `DROP INDEX`
- Nenhuma renomeação de tabelas
- Nenhuma atualização de dados
- Nenhuma exclusão de dados

---

## 4. RISCOS IDENTIFICADOS

| Risco | Nível | Mitigação |
|-------|-------|-----------|
| Policies sem `IF NOT EXISTS` | Baixo | Reexecução falha se já existirem |
| `ALTER TABLE ADD CONSTRAINT orcClienteFK` sem `IF NOT EXISTS` | Baixo | Reexecução falha se FK já existir |
| Storage policies substituem existentes | Médio | Revisão humana antes de aplicar |
| CHECK constraints em dados existentes | Baixo | Dados atuais já satisfazem (preço >= 0) |

---

## 5. VEREDITO FINAL

**APROVADO COM AJUSTES PEQUENOS**

A migration é segura para aplicar. Os ajustes pendentes são:
1. Policies de storage: confirmar que substituição das existentes é intencional
2. Reexecução: confirmar que a migration não será aplicada duas vezes

**Nenhum commit. Nenhum push. Nenhuma alteração no Supabase remoto.**