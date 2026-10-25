# LOTE A — INTEGRIDADE DO CATÁLOGO (somente leitura)

**Data:** 2026-10-23
**Status:** Diagnóstico completo. Nenhuma gravação realizada.
**Governança:** Nenhuma escrita remota sem autorização explícita.

---

## 1. Esquema de Relacionamento Produto↔Categoria

- Tabela `produto`: **não** possui coluna `categoria_id`. Relacionamento é N:N via `produto_categoria` (junction table).
- `produto_categoria`: PK composta `(produto_id, categoria_id)`, FKs com `ON DELETE CASCADE`.
- **Estado atual:** 0 registros em `produto_categoria` — nenhum produto está vinculado a nenhuma categoria.

## 2. Categorias Existentes (7)

| ID | Nome Atual | Slug Atual | Correção Necessária |
|----|-----------|-----------|---------------------|
| 1 | Esmalgue | esmalhe | Nome → "Esmaltes", Slug → "esmaltes" |
| 20 | Maquiagem | maquiagem | Nenhuma |
| 21 | Cuidados com a Pele | cuidados-pele | Nenhuma |
| 22 | Cabelos | cabelos | Nenhuma |
| 23 | Corpo e Banho | corpo-banho | Nenhuma |
| 24 | Acessorios | acessorios | Nenhuma |
| 25 | Promocoes | promocoes | Nenhuma |

## 3. Fornecedores (3)

| ID | Nome |
|----|------|
| 10 | Puro Cosmeticos |
| 11 | Mary Kay Cosmeticos |
| 12 | Bela Cosmeticos LTDA |

## 4. Mapeamento Proposto: Produto → Categoria

Baseado exclusivamente no nome do produto e na categoria existente. Nenhuma associação inventada.

| Produto ID | Nome | Categoria Proposta (ID) | Categoria Proposta (Nome) | Justificativa | Ambiguidade |
|------------|------|------------------------|--------------------------|---------------|-------------|
| 1 | Esmalte Cristal Vermelho | 1 | Esmaltes | Nome contém "Esmalte" | Não |
| 14 | Batom Matte Vermelho | 20 | Maquiagem | Batom é produto de maquiagem | Não |
| 15 | Base Liquida Clara | 20 | Maquiagem | Base é produto de maquiagem | Não |
| 16 | Mascara de Cabelos | 22 | Cabelos | "Mascara de Cabelos" = tratamento capilar | Não |
| 17 | Sabonete Liquido | 23 | Corpo e Banho | Sabonete é produto de corpo/banho | Não |
| 18 | Esmalte Vermelho | 1 | Esmaltes | Nome contém "Esmalte" | Não |
| 19 | Alcool Gel | 23 | Corpo e Banho | Álcool gel é produto de higiene corporal | **Sim** — poderia ser "Cuidados com a Pele" |
| 20 | Protetor Solar | 21 | Cuidados com a Pele | Protetor solar é cuidado com a pele | Não |
| 21 | Shampoo Antiresiduo | 22 | Cabelos | Shampoo é produto capilar | Não |
| 22 | Hidratante Labial | 21 | Cuidados com a Pele | Hidratante labial é cuidado com a pele | **Sim** — poderia ser "Maquiagem" (lip balm) |
| 23 | Mascara Facial | 21 | Cuidados com a Pele | Máscara facial é cuidado com a pele | Não |
| 24 | Oleo Capilar | 22 | Cabelos | Óleo capilar é produto capilar | Não |
| 25 | Desodorante Roll-on | 23 | Corpo e Banho | Desodorante é produto de corpo/banho | Não |

### Resumo do mapeamento

| Categoria | Produtos | Quantidade |
|-----------|----------|------------|
| Esmaltes (1) | 1, 18 | 2 |
| Maquiagem (20) | 14, 15 | 2 |
| Cuidados com a Pele (21) | 20, 22, 23 | 3 |
| Cabelos (22) | 16, 21, 24 | 3 |
| Corpo e Banho (23) | 17, 19, 25 | 3 |
| Acessorios (24) | — | 0 |
| Promocoes (25) | — | 0 |
| **Total** | | **13** |

### Ambiguidades (2 produtos)

1. **Produto 19 — Alcool Gel:** Mapeado para "Corpo e Banho" (higiene). Alternativa: "Cuidados com a Pele" (produto de cuidado). Decisão pendente do usuário.
2. **Produto 22 — Hidratante Labial:** Mapeado para "Cuidados com a Pele" (hidratação). Alternativa: "Maquiagem" (lip balm como cosmético). Decisão pendente do usuário.

## 5. SQL de Correção Proposto (NÃO EXECUTADO)

```sql
-- Passo 1: Corrigir nome e slug da categoria 1
UPDATE categoria
SET nome = 'Esmaltes', slug = 'esmaltes', updated_at = now()
WHERE id = 1;

-- Passo 2: Inserir associações produto↔categoria (idempotente via ON CONFLICT)
INSERT INTO produto_categoria (produto_id, categoria_id) VALUES
  (1, 1),   -- Esmalte Cristal Vermelho → Esmaltes
  (18, 1),  -- Esmalte Vermelho → Esmaltes
  (14, 20), -- Batom Matte Vermelho → Maquiagem
  (15, 20), -- Base Liquida Clara → Maquiagem
  (20, 21), -- Protetor Solar → Cuidados com a Pele
  (22, 21), -- Hidratante Labial → Cuidados com a Pele
  (23, 21), -- Mascara Facial → Cuidados com a Pele
  (16, 22), -- Mascara de Cabelos → Cabelos
  (21, 22), -- Shampoo Antiresiduo → Cabelos
  (24, 22), -- Oleo Capilar → Cabelos
  (17, 23), -- Sabonete Liquido → Corpo e Banho
  (19, 23), -- Alcool Gel → Corpo e Banho
  (25, 23)  -- Desodorante Roll-on → Corpo e Banho
ON CONFLICT (produto_id, categoria_id) DO NOTHING;
```

### Verificações pré-execução
- [ ] Confirmar que `produto_categoria` está vazia (0 rows) — **CONFIRMADO**
- [ ] Confirmar que todos os 13 produto_ids existem em `produto` — **CONFIRMADO** (13 produtos)
- [ ] Confirmar que todos os categoria_ids existem em `categoria` — **CONFIRMADO** (7 categorias)
- [ ] Confirmar que não há duplicatas no mapeamento — **CONFIRMADO** (PK composta impede)
- [ ] Resolver ambiguidades (produtos 19 e 22) — **PENDENTE**

### Verificações pós-execução (se autorizado)
- [ ] `SELECT count(*) FROM produto_categoria` → deve retornar 13
- [ ] `SELECT count(DISTINCT produto_id) FROM produto_categoria` → deve retornar 13 (todos vinculados)
- [ ] `SELECT count(*) FROM produto p LEFT JOIN produto_categoria pc ON p.id = pc.produto_id WHERE pc.produto_id IS NULL` → deve retornar 0
- [ ] Verificar que categoria id=1 agora se chama "Esmaltes"

## 6. Critérios de Aceite do Lote A

- [ ] Todos os 13 produtos têm exatamente uma categoria coerente.
- [ ] Nenhuma associação inventada ou duplicada.
- [ ] Categoria id=1 corrigida ("Esmalgue" → "Esmaltes").
- [ ] 2 ambiguidades resolvidas pelo usuário.
- [ ] SQL proposto revisado e autorizado antes da execução.
- [ ] Nenhuma gravação remota realizada sem autorização.

---

**Nenhuma gravação foi realizada. Aguardando autorização para executar o SQL proposto após resolução das ambiguidades.**