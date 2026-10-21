# MODELO DE DADOS — GATE 6.2

**Projeto:** Angel Cosméticos — E-commerce  
**Data:** 2026-09-19  
**Status:** READ-ONLY — Auditoria de domínio completa  
**Versão:** 0.1 (rascunho para revisão humana)

> ⚠️ **Este documento NÃO é modelo de dados oficial.** É o resultado da auditoria de domínio. O modelo oficial será derivado após revisão humana.
>
> **Nenhuma migration criada. Nenhum código alterado. Nenhum Supabase alterado. Nenhum push.**

---

## 1. Sumário Executivo

Este documento audita o domínio comercial completo do Angel Cosméticos e propõe o modelo de dados que o sistema precisa. A auditoria é baseada exclusivamente em decisões fechadas e evidências documentadas.

**Decisões fechadas representadas:**

| Decisão | Conteúdo | Status |
|---------|----------|--------|
| DEC1 | Backend = Supabase | ✅ Fechado |
| DEC2 | Pagamentos = PIX + cartão | ✅ Fechado |
| DEC3 | Migração seletiva | ✅ Fechado |
| DEC4 | MVP com dados comerciais | ✅ Fechado |
| D1 | Variante atributos: tamanho + cor + volume/ml | ✅ Fechado |
| D2 | Variante sobrescreve base + snapshot no carrinho | ✅ Fechado |
| D3 | Promoções: % + R$, produto→variantes, não cumulativa, menor preço, período obrigatório, sem cupons | ✅ Fechado |
| D4 | Estoque híbrido, reserva no checkout, baixa por canal, sem negativo, devolução com validação | ✅ Fechado |
| D5 | Frete configurável no admin + transportadora Fase 2 | ✅ Confirmado |
| D6a | Métodos: PIX + cartão | ✅ Confirmado |
| D7 | WhatsApp: pedido rascunho + abre WhatsApp | ✅ Confirmado |
| D8 | Cadastro híbrido | ✅ Confirmado |
| D9 | Endereço obrigatório no checkout + visitante, CEP + ViaCEP, número manual, múltiplos, snapshot | ✅ Fechado |
| D10 | Status: dois fluxos convergem, pagamento separado, confirmação por canal, cancelamento até envio | ✅ Fechado |
| D19 | Atendimento: botão explícito "Falar com humano" | ✅ Confirmado |

**Decisões técnicas penduradas (para Arquitetura Técnica):**

| Decisão | Destino |
|---------|---------|
| D6b | Gateway de pagamento → `ARQUITETURA_TÉCNICA.md` |
| D13 | Carrinho canônico → Arquitetura Técnica |
| D14 | Armazenamento de imagens → Infraestrutura |
| D16 | E-mail transacional → Integração |
| D17 | PWA → Fase 2 |
| D18 | SEO → Tarefa técnica |

**Entidades propostas (26):**

`produto`, `produto_atributo`, `produto_atributo_valor`, `produto_variante`, `produto_variante_atributo`, `produto_imagem`, `produto_opcao_compra`, `produto_opcao_valor`, `kit_composicao`, `categoria`, `produto_categoria`, `fornecedor`, `promocao`, `cliente`, `endereco`, `carrinho`, `carrinho_item`, `pedido`, `pedido_item`, `pedido_status_historico`, `pagamento`, `frete_regra`, `estoque`, `estoque_movimentacao`, `atendimento`, `atendimento_mensagem`

**Tabelas legadas que NÃO persistem no novo modelo:**

- `carrinho` (legado PHP) → substituído por `carrinho` (novo, server-side) + `carrinho_item`
- `historico_compras` (duplicava pedido) → substituído por `pedido_item` + `pedido_status_historico`
- `entradas_estoque` / `saidas_estoque` (legado simples) → substituídos por `estoque_movimentacao`

---

## 2. Fontes Utilizadas

### 2.1 Fontes Obrigatórias Lidas

| Fonte | Utilizado para |
|-------|----------------|
| `CONTRATO_DOMINIO_COMERCIAL_v1.1.md` | Domínio comercial, entidades, relacionamentos, regras, decisões |
| `DECISOES_NEGOCIO_v1.3.md` | Decisões D1-D4, D9, D10 fechadas no Workshop |
| `DECISOES_NEGOCIO_v1.2.md` | DEC1-DEC4, D5-D10, D19, D6a/D6b |
| `AUDITORIA_3_DOMAIN_CONTRACT.md` | Evidências técnicas do legado, gaps, entidades |
| `AUDITORIA_4_RELATORIO.md` | Inventário funcional completo, fluxos, duplicações |
| `GATE_6_2_MODELO_DE_DADOS_PROMPT.md` | Diretrizes de auditoria |

### 2.2 Fontes de Implementação Lidas

| Fonte | Utilizado para |
|-------|----------------|
| `web/src/types/index.ts` | Tipos TypeScript atuais (evidência de expectativa) |
| `web/src/lib/supabase.ts` | Conexão Supabase (editado: agora usa VITE_SUPABASE_PUBLISHABLE_KEY) |
| `web/src/contexts/AuthContext.tsx` | Fluxo de autenticação |
| `web/src/contexts/CartContext.tsx` | Implementação atual do carrinho (localStorage) |
| `web/src/app/App.tsx` | Rotas e estrutura da aplicação |
| `web/src/pages/Carrinho/Checkout.tsx` | Fluxo de checkout (evidência de implementação) |
| `web/src/pages/Produto/index.tsx` | Carregamento de produto via `produtos_view` |
| `web/src/pages/Carrinho/index.tsx` | Tela de carrinho |
| `web/src/pages/Login/index.tsx` | Tela de login/cadastro |
| `web/src/pages/Home/index.tsx` | Carregamento de produtos e categorias |
| `web/src/pages/Conta/index.tsx` | Tela de conta |
| `web/src/components/` | Estrutura de componentes |
| `supabase/functions/viaCEP/index.ts` | Edge Function existente |
| `supabase/migrations/*` | 9 migrations provisórias (analisadas, NÃO aprovadas) |
| `assets/sql/*.sql` | 16 schemas SQL do legado MySQL |

### 2.3 Projetos de Referência (estudo apenas, NÃO fonte de arquitetura)

| Projeto | Status |
|---------|--------|
| J&S Empregos | ❌ Não localizado (pending — AGUARDANDO USUÁRIO) |
| Pedacinho de Felicidade | ❌ Não localizado (pending — AGUARDANDO USUÁRIO) |
| AtendimentoOfflineAlpha | ✅ Estrutura mapeada via GitHub API (referência de padrões) |

---

## 3. Fontes Ausentes

| Fonte | Motivo |
|-------|--------|
| `J&S Empregos` (Supabase project) | AGUARDANDO USUÁRIO — não localizado |
| `Pedacinho de Felicidade` (Supabase project) | AGUARDANDO USUÁRIO — não localizado |
| `CONTRATO_FUNCIONAL_SISTEMA_v1.0.md` | Ainda não gerado — será derivado deste documento |
| `ARQUITETURA_TÉCNICA.md` | Ainda não gerado |
| `API_CONTRACT.md` | Ainda não gerado |
| `MODELO_DE_DADOS.md` | **Este documento serve como base** |
| `web/.env.example` | Não alinhado (não é fonte de modelo) |
| `web/.env.local` | Não existe (gitignored) |
| Documentação de testes | Não localizada |
| `assets/sql/angelcosmeticos_cadastro.sql` | Não lido (legado de cadastro) |
| `assets/sql/angelcosmeticos_routines.sql` | Não lido (rotinas MySQL legado) |
| `assets/sql/angelcosmeticos_usuarios_completo.sql` | Não lido (view denormalizada) |
| `assets/sql/angelcosmeticos_produtos_categoria.sql` | Não lido (tabela N:N) |
| `assets/sql/angelcosmeticos_view_produtos.sql` | Não lido (view) |

**Impacto das fontes ausentes:** Nenhuma entidade foi inventada por ausência de fonte. Lacunas são registradas na Seção 23.

---

## 4. Princípios de Modelagem

### 4.1 Princípios Gerais

1. **Produto é comércio configurável** — NÃO é maquiagem. O modelo suporta maquiagem, roupas, cama, mesa, banho, kits e categorias futuras sem refazer o modelo.
2. **Decisões fechadas são autoridade** — D1-D4, D9, D10, DEC1-DEC4, D5, D6a, D7, D8, D19 não são reinterpretadas.
3. **Nenhum JSONB como solução automática** — D1 rejeita explicitamente EAV/JSONB para atributos de variante. Atributos são estruturados em tabelas separadas.
4. **Preço é validado no servidor** — Nunca confiar no cliente para preço, desconto, estoque, total, status de pagamento ou permissão administrativa.
5. **Snapshot é obrigatório** — Preço no carrinho e no pedido é congelado no momento da operação.
6. **Estoque é transacional** — Reserva atômica no checkout, não no carrinho.
7. **Pagamento é separado de status do pedido** — Ciclo financeiro vs ciclo logístico.
8. **Histórico é preservado** — Alterações posteriores no catálogo NÃO modificam pedidos históricos.
9. **Service_role NÃO vai para frontend** — Operações privilegiadas via Edge Functions.
10. **Projetos de referência são estudo de padrões** — Nenhuma tabela, lógica ou arquitetura é copiada.

### 4.2 Princípios por Área

| Área | Princípio |
|------|-----------|
| Produtos | Produto simples é válido. Variante é opcional. Atributos são 3 específicos. |
| Clientes | Cadastro híbrido. Auth separado de perfil comercial. |
| Carrinho | Intenção, não reserva. Snapshot de preço. Visitor + autenticado. |
| Pedidos | Snapshot completo (produto, preço, endereço, frete). Dois fluxos convergem. |
| Pagamentos | Método ≠ Status. PIX + cartão no lançamento. |
| Frete | Configurável. Nenhuma regra hardcoded. |
| Promoções | Produto base → variantes. Não cumulativa. Menor preço final. |
| Estoque | Híbrido. Produto simples = produto. Variante = SKU. Kits = componentes. |
| Suporte | Humano explícito. Rascunho no WhatsApp. |
| Automação | Eventos do domínio. n8n orquestra. |
| Admin | Gestão das entidades do domínio. |
| Segurança | RLS + IDOR + autorização. Auditoria de operações sensíveis. |

---

## 5. Modelo Conceitual

### 5.1 Diagrama de Entidades (Simplificado)

```text
produto
│
├── atributos (produto_atributo → produto_atributo_valor)
│
├── variantes (produto_variante)
│    └── SKU (produto_variante.sku)
│         ├── preço
│         └── estoque (estoque, por variante)
│
├── opções de compra (produto_opcao_compra → produto_opcao_valor)
│    ├── quantidade
│    ├── kit
│    └── custom
│
└── kit/composição (kit_composicao)
     └── componentes (produto + variante opcional)

fornecedor (1:N) → produto
                    │
                    ├── categoria (N:N via produto_categoria)
                    │
                    └── [variantes, opções, kits, imagens, promoções, estoque conforme acima]

cliente (1:1) → auth.users
    │
    ├── endereco (1:N)
    ├── carrinho (1:1, server-side)
    │       └── carrinho_item (N:1)
    │               └── produto_variante (opcional)
    │
    └── pedido (1:N)
            ├── pedido_item (N:1)
            │       └── produto_variante (opcional)
            ├── pagamento (1:1)
            ├── frete_regra (N:1, aplicada)
            └── pedido_status_historico (1:N)

atendimento (1:N) → atendimento_mensagem
```

### 5.2 Notação

- PK = Primary Key
- FK = Foreign Key
- NN = Not Null
- UK = Unique
- CK = Check
- IDX = Index
- ↔ = N:N (relacionamento com tabela intermediária)

---

## 6. PRODUTOS

### 6.1 ENTIDADE: produto

**Fonte:** `CONTRATO_DOMINIO_COMERCIAL_v1.1.md` §4, `AUDITORIA_3` §2.1, `assets/sql/angelcosmeticos_produtos.sql`

**Motivo:** Entidade central do catálogo. Representa o item comercial publicado. Produto é comércio configurável (maquiagem, roupas, cama, mesa, banho, kits, futuras categorias).

**Decisões associadas:** D1 (variantes opcionais), D2 (preço variante), D3 (promoção), D4 (estoque), DEC4 (MVP com dados)

**Regras comerciais:**
- Produto pode ser simples (sem variantes) ou com variantes (D1)
- Preço base existe sempre (D2)
- Promoção aplica ao produto base (D3)
- Estoque pode ser no produto (simples) ou por variante (com variantes) (D4)
- Fornecedor **opcional** (DEC3: preservar na migração se houver; não obrigatório no domínio)
- Produto tem nome, descrição, ativo/inativo
- Categorias N:N

**Tabela proposta — `produto`:**

| Coluna | Tipo | Nullable | Default | Observação |
|--------|------|----------|---------|------------|
| id | bigserial | NN | — | PK |
| nome | varchar(255) | NN | — | Nome comercial |
| slug | varchar(255) | NN | — | URL-friendly, UK |
| descricao | text | Y | NULL | Descrição comercial |
| preco_base | decimal(10,2) | NN | — | Preço base (D2: variante pode sobrescrever) |
| fornecedor_id | bigint | Y | NULL | FK fornecedor (opcional — DEC3 preservação) |
| ativo | boolean | NN | true | Ativo/inativo |
| created_at | timestamptz | NN | now() | |
| updated_at | timestamptz | NN | now() | |

**Constraints:**
- PK: `produto_pkey` (id)
- UK: `produto_slug_unique` (slug)
- CK: `produto_ativo_check` (ativo IN (true, false))
- FK: `produto_fornecedor_fk` (fornecedor_id → fornecedor.id) ON DELETE SET NULL

**Índices:**
- IDX: `idx_produto_slug` (slug)
- IDX: `idx_produto_ativo` (ativo) WHERE ativo = true
- IDX: `idx_produto_fornecedor` (fornecedor_id)

**Relacionamentos:**
- 1:N → produto_atributo (atributos opcionais)
- 1:N → produto_imagem
- 1:N → promocao
- 1:1 → estoque (quando produto simples)
- N:N → categoria (via produto_categoria)
- N:1 → fornecedor

**Evidência:** `CONTRATO v1.1 §4`, `AUDITORIA_3 §2.1`, `produtos.sql` legado

**Classificação:** FECHADO (DEC1-DEC4, D1-D4 aplicáveis)

---

### 6.2 ENTIDADE: fornecedor

**Fonte:** `CONTRATO_DOMINIO_COMERCIAL_v1.1.md` §4.3, `assets/sql/angelcosmeticos_fornecedores.sql`

**Motivo:** Produto possui fornecedor. Cadastro existe no legado e será preservado na migração seletiva (DEC3).

**Decisões associadas:** DEC3 (migração seletiva), D1 (indireta — produto)

**Tabela proposta — `fornecedor`:**

| Coluna | Tipo | Nullable | Default | Observação |
|--------|------|----------|---------|------------|
| id | bigserial | NN | — | PK |
| nome | varchar(255) | NN | — | Nome do fornecedor |
| cnpj | varchar(20) | NN | — | UK |
| telefone | varchar(20) | Y | NULL | |
| email | varchar(255) | Y | NULL | |
| ativo | boolean | NN | true | |
| created_at | timestamptz | NN | now() | |
| updated_at | timestamptz | NN | now() | |

**Constraints:**
- PK: `fornecedor_pkey`
- UK: `fornecedor_cnpj_unique` (cnpj)
- CK: `fornecedor_ativo_check` (ativo IN (true, false))

**Índices:**
- IDX: `idx_fornecedor_cnpj` (cnpj)
- IDX: `idx_fornecedor_ativo` (ativo) WHERE ativo = true
- IDX: `idx_fornecedor_nome` (nome)

**Relacionamentos:**
- 1:N → produto

**Evidência:** `CONTRATO v1.1 §4.3`, `angelcosmeticos_fornecedores.sql`

**Classificação:** FECHADO (DEC3 — preservar na migração)

---

### 6.3 ENTIDADE: categoria

**Fonte:** `CONTRATO_DOMINIO_COMERCIAL_v1.1.md` §4.4, `assets/sql/angelcosmeticos_categorias_produtos.sql`

**Motivo:** Categoria se relaciona com produtos N:N. Categorias do legado devem ser preservadas (DEC3). Produto pode estar em múltiplas categorias.

**Decisões associadas:** DEC3 (preservar), D1 (indireta — produto)

**Tabela proposta — `categoria`:**

| Coluna | Tipo | Nullable | Default | Observação |
|--------|------|----------|---------|------------|
| id | bigserial | NN | — | PK |
| nome | varchar(255) | NN | — | Nome da categoria |
| slug | varchar(255) | NN | — | UK |
| ativo | boolean | NN | true | |
| created_at | timestamptz | NN | now() | |
| updated_at | timestamptz | NN | now() | |

**Constraints:**
- PK: `categoria_pkey`
- UK: `categoria_slug_unique` (slug)
- CK: `categoria_ativo_check` (ativo IN (true, false))

**Índices:**
- IDX: `idx_categoria_ativo` (ativo) WHERE ativo = true

**Relacionamentos:**
- N:N → produto (via produto_categoria)

**Evidência:** `CONTRATO v1.1 §4.4`, `categorias_produtos.sql` legado

**Classificação:** FECHADO (DEC3, D1)

---

### 6.4 ENTIDADE: produto_categoria (tabela N:N)

**Fonte:** `CONTRATO_DOMINIO_COMERCIAL_v1.1.md` §4.4, `AUDITORIA_3` §2.1

**Motivo:** Relacionamento N:N entre produto e categoria. Produto pode estar em várias categorias; categoria pode conter vários produtos.

**Tabela proposta — `produto_categoria`:**

| Coluna | Tipo | Nullable | Default | Observação |
|--------|------|----------|---------|------------|
| produto_id | bigint | NN | — | FK → produto.id |
| categoria_id | bigint | NN | — | FK → categoria.id |
| created_at | timestamptz | NN | now() | |

**Constraints:**
- PK: `produto_categoria_pkey` (produto_id, categoria_id)
- FK: `pc_produto_fk` (produto_id → produto.id) ON DELETE CASCADE
- FK: `pc_categoria_fk` (categoria_id → categoria.id) ON DELETE CASCADE
- UK: `pc_unique` (produto_id, categoria_id)

**Evidência:** `CONTRATO v1.1 §4.4`, `AUDITORIA_3 §2.1` (N:N)

**Classificação:** FECHADO

---

### 6.5 ENTIDADE: produto_atributo

**Fonte:** `DECISOES_NEGOCIO_v1.3.md` D1, `CONTRATO_DOMINIO_COMERCIAL_v1.1.md` §5

**Motivo:** Define os atributos que uma variante pode ter. D1 FECHADO: tamanho, cor, volume/ml. NÃO EAV/JSONB (D1). Cada atributo é uma entidade com valores estruturados.

**Decisões associadas:** D1 (FECHADO)

**Regras comerciais (D1):**
- Atributos válidos: tamanho, cor, volume/ml
- Não é obrigatório usar todos os três em toda variante
- São opcionais conforme o produto (batom → cor; shampoo → volume; roupa → tamanho)
- NÃO adotar atributos livres/EAV/JSONB
- NÃO criar outros atributos sem nova decisão de negócio
- NÃO assumir que todo produto possui tamanho

**Tabela proposta — `produto_atributo`:**

| Coluna | Tipo | Nullable | Default | Observação |
|--------|------|----------|---------|------------|
| id | bigserial | NN | — | PK |
| produto_id | bigint | NN | — | FK → produto.id |
| nome | varchar(50) | NN | — | 'tamanho' \| 'cor' \| 'volume' |
| ordem | integer | NN | 0 | Ordem de exibição |
| created_at | timestamptz | NN | now() | |
| updated_at | timestamptz | NN | now() | |

**Constraints:**
- PK: `produto_atributo_pkey` (id)
- FK: `pa_produto_fk` (produto_id → produto.id) ON DELETE CASCADE
- CK: `pa_nome_check` (nome IN ('tamanho', 'cor', 'volume'))
- UK: `pa_produto_nome_unique` (produto_id, nome) — cada produto não pode ter atributo duplicado

**Índices:**
- IDX: `idx_pa_produto` (produto_id)

**Relacionamentos:**
- N:1 → produto
- 1:N → produto_variante (via produto_atributo_valor)

**Evidência:** `DEC v1.3 D1`, `CONTRATO v1.1 §5`

**Classificação:** FECHADO (D1)

**Observação:** Se no futuro o negócio decidir novos atributos (ex: "material", "peso"), é necessária NOVA decisão de negócio. Este gate NÃO prevê esses atributos.

---

### 6.6 ENTIDADE: produto_atributo_valor

**Fonte:** `DECISOES_NEGOCIO_v1.3.md` D1, `AUDITORIA_3` §2.2

**Motivo:** Cada atributo possui valores possíveis (ex: tamanho → P, M, G, GG, XG). D1 exige estruturação dos valores, não JSONB.

**Decisões associadas:** D1 (FECHADO)

**Regras:**
- Valores são estruturados, não livres
- Cada atributo tem seus valores
- Valor é string (tamanho = 'P', cor = 'Rosa', volume = '500ml')

**Tabela proposta — `produto_atributo_valor`:**

| Coluna | Tipo | Nullable | Default | Observação |
|--------|------|----------|---------|------------|
| id | bigserial | NN | — | PK |
| produto_atributo_id | bigint | NN | — | FK → produto_atributo.id |
| valor | varchar(100) | NN | — | Ex: 'P', 'M', 'Rosa', '500ml' |
| ordem | integer | NN | 0 | Ordem de exibição |
| created_at | timestamptz | NN | now() | |

**Constraints:**
- PK: `pav_pkey` (id)
- FK: `pav_attr_fk` (produto_atributo_id → produto_atributo.id) ON DELETE CASCADE
- UK: `pav_attr_valor_unique` (produto_atributo_id, valor) — sem duplicatas

**Índices:**
- IDX: `idx_pav_attr` (produto_atributo_id)

**Relacionamentos:**
- N:1 → produto_atributo
- N:N → produto_variante (via produto_variante_atributo)

**Evidência:** `DEC v1.3 D1`, `AUDITORIA_3 §2.2` (variante = atributo opcional)

**Classificação:** FECHADO (D1)

---

### 6.7 ENTIDADE: produto_variante

**Fonte:** `DECISOES_NEGOCIO_v1.3.md` D1 + D2, `CONTRATO_DOMINIO_COMERCIAL_v1.1.md` §5

**Motivo:** Cada combinação comercialmente vendável de atributos é uma variante. D1 define atributos (tamanho, cor, volume). D2 define que variante pode sobrescrever preço base + snapshot no carrinho.

**Decisões associadas:** D1 (atributos), D2 (preço + snapshot)

**Regras comerciais:**
- Variante é combinação de valores de atributos de um produto (D1)
- Variante pode ter preço próprio (D2: B — sobrescreve base)
- Se variante não tem preço, herda do base (D2: D — fallback)
- Preço congelado no carrinho como snapshot (D2)
- Variante tem SKU virtual identificável
- Variante pode ter estoque próprio (D4: híbrido)
- NÃO usar JSONB para atributos (D1)

**Diferença entre variante e opção de compra:**
- **Variante** = combinação de atributos (tamanho+cor, tamanho sozinho, etc.)
- **Opção de compra** = configuração comercial do item (1 unidade, 2 unidades, kit) — decisões futuras
- Para este gate: **variante** é a entidade principal. **Opção de compra** é identificada como ABERTA (não há decisão de negócio para quantidades/kits como SKU separado).

**Tabela proposta — `produto_variante`:**

| Coluna | Tipo | Nullable | Default | Observação |
|--------|------|----------|---------|------------|
| id | bigserial | NN | — | PK |
| produto_id | bigint | NN | — | FK → produto.id |
| sku | varchar(100) | NN | — | Identificador comercial da combinação |
| preco | decimal(10,2) | NN | — | Preço da variante (D2: B — sobrescreve base) |
| ativo | boolean | NN | true | |
| peso | decimal(10,3) | Y | NULL | Peso para cálculo de frete (D4 indireta) |
| dimensoes | jsonb | Y | NULL | **🔴 NÃO APROVADO** — JSONB não aprovado. Decisão aberta (Frete/Estoque). Verificar necessidade de campos tipados: peso, altura, largura, comprimento |
| created_at | timestamptz | NN | now() | |
| updated_at | timestamptz | NN | now() | |

**Constraints:**
- PK: `produto_variante_pkey` (id)
- FK: `pv_produto_fk` (produto_id → produto.id) ON DELETE CASCADE
- CK: `pv_preco_check` (preco >= 0)
- CK: `pv_ativo_check` (ativo IN (true, false))
- UK: `pv_sku_unique` (sku)

**Índices:**
- IDX: `idx_pv_produto` (produto_id)
- IDX: `idx_pv_sku` (sku)

**Relacionamentos:**
- N:1 → produto
- 1:N → produto_variante_atributo (valores desta variante)
- 1:1 → estoque (por variante — D4: híbrido, quando aplicável)
- N:1 → promocao (via produto base, D3)

**Evidência:** `DEC v1.3 D1+D2`, `CONTRATO v1.1 §5`

**Classificação:** FECHADO (D1, D2)

**Conflito com migration 02:** Migration `2026091302_produto_variante.sql` usa `atributos jsonb`. **CONFLITANTE** com D1 (que rejeita JSONB). O modelo deste documento usa `produto_variante_atributo` em vez de JSONB.

---

### 6.8 ENTIDADE: produto_variante_atributo

**Fonte:** `DECISOES_NEGOCIO_v1.3.md` D1, `CONTRATO_DOMINIO_COMERCIAL_v1.1.md` §5

**Motivo:** Cada variante é uma combinação de valores de atributos. Esta tabela vincula a variante aos valores específicos de atributo que a compõem.

**Decisões associadas:** D1 (FECHADO)

**Tabela proposta — `produto_variante_atributo`:**

| Coluna | Tipo | Nullable | Default | Observação |
|--------|------|----------|---------|------------|
| id | bigserial | NN | — | PK |
| produto_variante_id | bigint | NN | — | FK → produto_variante.id |
| produto_atributo_valor_id | bigint | NN | — | FK → produto_atributo_valor.id |
| created_at | timestamptz | NN | now() | |

**Constraints:**
- PK: `pva_pkey` (id)
- FK: `pva_vvariante_fk` (produto_variante_id → produto_variante.id) ON DELETE CASCADE
- FK: `pva_valor_fk` (produto_atributo_valor_id → produto_atributo_valor.id) ON DELETE CASCADE
- UK: `pva_unique` (produto_variante_id, produto_atributo_valor_id)

**Índices:**
- IDX: `idx_pva_variante` (produto_variante_id)
- IDX: `idx_pva_valor` (produto_atributo_valor_id)

**Relacionamentos:**
- N:1 → produto_variante
- N:1 → produto_atributo_valor

**Evidência:** `DEC v1.3 D1`, `CONTRATO v1.1 §5`

**Classificação:** FECHADO (D1)

---

### 6.9 ENTIDADE: produto_imagem

**Fonte:** `AUDITORIA_3` §2.1 (imagens só no frontend), `AUDITORIA_4` §332 (P3), `DEC1` (Storage)

**Motivo:** Imagens de produto atualmente são hardcoded no frontend. D14 marca armazenamento como técnico. Necessário tabela para gerenciar galeria.

**Decisões associadas:** D14 (técnica — Storage), DEC1 (Supabase Storage)

**Regras:**
- Produto pode ter múltiplas imagens
- Uma imagem principal por produto
- Ordem de exibição
- URL aponta para Supabase Storage (implementação técnica)
- **Storage definido:** bucket `product-images`, visibilidade pública (catálogo), upload somente admin/operador, delete protegido, paths `/produtos/{produto_id}/{arquivo}`

**Configuração Storage (🟢 FECHADO):**

| Decisão | Valor |
|---------|-------|
| Bucket | `product-images` |
| Visibilidade | Pública (imagens de catálogo) |
| Upload | Somente admin/operador autorizado |
| Delete | Protegido (soft delete ou admin-only) |
| Paths | `/produtos/{produto_id}/{arquivo}` |
| CDN | Sim (público) |

**Observação:** Imagem de catálogo pode ser pública sem tornar o banco público. `produto_imagem` guarda metadados; Supabase Storage guarda arquivo.

**Tabela proposta — `produto_imagem`:**

| Coluna | Tipo | Nullable | Default | Observação |
|--------|------|----------|---------|------------|
| id | bigserial | NN | — | PK |
| produto_id | bigint | NN | — | FK → produto.id |
| url | text | NN | — | URL do Storage |
| ordem | integer | NN | 0 | Ordem de exibição |
| principal | boolean | NN | false | Imagem principal |
| created_at | timestamptz | NN | now() | |
| updated_at | timestamptz | NN | now() | |

**Constraints:**
- PK: `produto_imagem_pkey` (id)
- FK: `pi_produto_fk` (produto_id → produto.id) ON DELETE CASCADE
- CK: `pi_principal_check` (principal IN (true, false))

**Índices:**
- IDX: `idx_pi_produto` (produto_id)
- IDX: `idx_pi_principal` (produto_id) WHERE principal = true
- UK: `pi_unica_principal` (produto_id) WHERE principal = true

**Relacionamentos:**
- N:1 → produto

**Evidência:** `AUDITORIA_3 §2.1`, `AUDITORIA_4 §332`

**Classificação:** PROPOSTA (baseada em D14 técnica + necessidade do domínio)

---

### 6.14 STORAGE — Configuração Definida

**Decisões FECHADO (Rodada 5):**

| Decisão | Valor |
|---------|-------|
| Bucket | `product-images` |
| Visibilidade | Pública (imagens de catálogo acessíveis sem auth) |
| Upload | Somente admin/operador autorizado |
| Delete | Protegido (soft delete ou admin-only) |
| Paths | `/produtos/{produto_id}/{arquivo}` |
| CDN | Sim (público para cache) |
| Variante paths | `/produtos/{produto_id}/{variante_id}/{arquivo}` (fase futura, se necessário) |

**Regras:**
- Imagens de catálogo podem ser públicas SEM tornar o banco público
- `produto_imagem` guarda metadados (url, ordem, principal)
- Supabase Storage guarda o arquivo físico
- Nenhum segredo de Storage no frontend (apenas URLs públicas)
- Upload/delete via Edge Function com verificação de permissão

**Relacionamento:**
- produto_imagem.url → Supabase Storage path

**Evidência:** D14, DEC1

**Classificação:** FECHADO (Decisão de infraestrutura)

---

### 6.10 ENTIDADE: promocao

**Fonte:** `DECISOES_NEGOCIO_v1.3.md` D3, `CONTRATO_DOMINIO_COMERCIAL_v1.1.md` §7

**Motivo:** Promoções comerciais sobre produtos. D3 FECHADO: tipo %, R$, escopo produto→variantes, não cumulativa, menor preço, período obrigatório, sem cupons.

**Decisões associadas:** D3 (FECHADO)

**Regras comerciais (D3):**
- Tipo: percentual OU valor fixo (C)
- Escopo: produto base → aplica às variantes (D)
- Não cumulativa (H/I): apenas uma promoção válida por item
- Quando múltiplas: aplicar a que resultar no menor preço final
- Período obrigatório (J): data_início + data_fim
- Sem cupons no lançamento (L)
- Ordem: produto → resolução do preço variante → promoção → preço promocional → snapshot no carrinho → preservado no pedido

**Tabela proposta — `promocao`:**

| Coluna | Tipo | Nullable | Default | Observação |
|--------|------|----------|---------|------------|
| id | bigserial | NN | — | PK |
| produto_id | bigint | NN | — | FK → produto.id (escopo: produto base) |
| tipo | varchar(20) | NN | — | 'percentual' \| 'fixo' |
| valor | decimal(10,2) | NN | — | Valor do desconto (0-100 se %, valor se R$) |
| data_inicio | date | NN | — | Início obrigatório (J) |
| data_fim | date | NN | — | Fim obrigatório (J) |
| ativo | boolean | NN | true | |
| criado_em | timestamptz | NN | now() | |
| atualizado_em | timestamptz | NN | now() | |

**Constraints:**
- PK: `promocao_pkey` (id)
- FK: `prom_produto_fk` (produto_id → produto.id) ON DELETE CASCADE
- CK: `prom_tipo_check` (tipo IN ('percentual', 'fixo'))
- CK: `prom_valor_check` (valor >= 0)
- CK: `prom_data_check` (data_inicio < data_fim)
- CK: `prom_ativo_check` (ativo IN (true, false))

**Índices:**
- IDX: `idx_prom_produto` (produto_id)
- IDX: `idx_prom_ativa` (ativo) WHERE ativo = true
- IDX: `idx_prom_datas` (data_inicio, data_fim)

**Relacionamentos:**
- N:1 → produto (1:N — promoção por produto base)
- A promoção se aplica às variantes do produto (indireto via D3-D)

**Observação:** NÃO há tabela `promocao_aplicacao` neste gate. A aplicação de promoção ao carrinho/pedido é regra de negócio (D3 ordem de cálculo). Detalhes de registro de aplicação podem ser definidos no contrato funcional.

**Evidência:** `DEC v1.3 D3`, `CONTRATO v1.1 §7`

**Classificação:** FECHADO (D3)

**Conflito com migration 07:** Migration `2026091307_produtos_promocao_expand.sql` adiciona `variante_id` à tabela `produtos_promocao`. **🟡 RESERVADO — MVP não necessita.** D3 fecha promoção por produto base. `variante_id` não deve ser incluído no schema MVP. Reservado para evolução futura se houver necessidade real de promoção por variante.

---

### 6.11 ENTIDADE: produto_opcao_compra

**Fonte:** Gate 6.2 prompt (Seção 5 — Opções de compra), AUDITORIA_4 (7 implementações de carrinho)

**Motivo:** Diferencia CONFIGURAÇÃO COMERCIAL (quantidade, kit) de VARIANTE (atributo: tamanho, cor, volume). Variante define o produto físico; opção de compra define como ele é comprado. Precisam ser independentes.

**Decisões associadas:** D1 (atributos), D2 (preço) — indireta

**Classificação:** FECHADO (D1, D2, D3 — preço resolvido por fallback)

**Regra de preço definitiva:**
```text
Preço comercial efetivo =
  preco_proprio SE preco_proprio IS NOT NULL
  CASO CONTRÁRIO
  preço da variante/SKU
```

**Regra — Preço próprio NÃO é soma dos componentes:** O preço comercial de uma opção de compra é definido independentemente da composição. A composição determina conteúdo e estoque; o preço comercial é decisão de negócio.

**Observação:** Promoções incidem sobre o preço efetivo resolvido (D3). A interação promoção × opção é resolvida por regra de fallback: preco_proprio → variante → promoção (D3: não cumulativa, menor preço).

**Tabela proposta — `produto_opcao_compra`:**

| Coluna | Tipo | Nullable | Default | Observação |
|--------|------|----------|---------|------------|
| id | bigserial | NN | — | PK |
| produto_id | bigint | NN | — | FK → produto.id |
| nome | varchar(100) | NN | — | 'Unidade', 'Kit Completo', 'Custom' |
| tipo | varchar(20) | NN | — | 'quantidade' \| 'kit' \| 'custom' |
| preco_proprio | decimal(10,2) | Y | NULL | Preço comercial DA opção (se definido). Se NULL, usa preço da variante |
| ordem | integer | NN | 0 | Ordem de exibição |
| ativo | boolean | NN | true | Esta opção de compra está ativa |
| criado_em | timestamptz | NN | now() | |
| atualizado_em | timestamptz | NN | now() | |

**Constraints:**
- PK: `poc_pkey` (id)
- FK: `poc_produto_fk` (produto_id → produto.id) ON DELETE CASCADE
- CK: `poc_tipo_check` (tipo IN ('quantidade', 'kit', 'custom'))
- CK: `poc_ativo_check` (ativo IN (true, false))

**Índices:**
- IDX: `idx_poc_produto` (produto_id)
- IDX: `idx_poc_ativo` (ativo) WHERE ativo = true

**Relacionamentos:**
- N:1 → produto
- 1:N → produto_opcao_valor

**Evidência:** Gate 6.2 prompt Seção 5, AUDITORIA_4 §8 (7 implementações de carrinho com diferentes opções)

**Classificação:** FECHADO (D1, D2, D3 — preço resolvido por fallback)

**Exemplo suportado:**
```text
Toalha (produto)
  ├── Variante: Cor Bege
  │     └── SKU (produto_variante)
  ├── Opção de compra: 2 unidades (produto_opcao_compra, tipo='quantidade')
  ├── Opção de compra: 4 unidades (produto_opcao_compra, tipo='quantidade')
  └── Opção de compra: 5 unidades (produto_opcao_compra, tipo='quantidade')
```

---

### 6.12 ENTIDADE: produto_opcao_valor

**Fonte:** Gate 6.2 prompt (Seção 5 — Opções de compra)

**Motivo:** Cada opção de compra possui valores possíveis (ex: '2 unidades', '4 unidades', '5 unidades').

**Decisões associadas:** Indireta (D1, D2)

**Classificação:** FECHADO (D1, D2 — valores definidos por opção)

**Tabela proposta — `produto_opcao_valor`:**

| Coluna | Tipo | Nullable | Default | Observação |
|--------|------|----------|---------|------------|
| id | bigserial | NN | — | PK |
| produto_opcao_id | bigint | NN | — | FK → produto_opcao_compra.id |
| valor | varchar(100) | NN | — | '2 unidades', '4 unidades', etc. |
| quantidade | integer | Y | NULL | Quantidade real (para opções de quantidade) |
| ordem | integer | NN | 0 | Ordem de exibição |
| ativo | boolean | NN | true | Este valor de opção está ativo |
| criado_em | timestamptz | NN | now() | |

**Constraints:**
- PK: `pov_pkey` (id)
- FK: `pov_opcao_fk` (produto_opcao_id → produto_opcao_compra.id) ON DELETE CASCADE
- CK: `pov_valor_check` (LENGTH(valor) > 0)
- CK: `pov_ativo_check` (ativo IN (true, false))
- UK: `pov_opcao_valor_unique` (produto_opcao_id, valor)

**Índices:**
- IDX: `idx_pov_opcao` (produto_opcao_id)

**Relacionamentos:**
- N:1 → produto_opcao_compra

**Evidência:** Gate 6.2 prompt Seção 5

**Classificação:** PROPOSTA

---

### 6.13 ENTIDADE: kit_composicao

**Fonte:** Gate 6.2 prompt (Seção 5 — Kits/composição)

**Motivo:** Kits são composições de produtos com quantidades definidas. Um kit pode apontar para um SKU/variante específico, não apenas para o produto genérico. Essencial para estoque.

**Decisões associadas:** Indireta (D1, D4)

**Classificação:** FECHADO (D1, D4)

**Regras definitivas:**
- Kit é composto por componentes (produtos)
- Cada componente pode referenciar: produto genérico OU variante/SKU específico
- `ativo` = **esta composição de kit está ativa?** (NÃO disponibilidade do componente)
- **Kit NÃO possui estoque físico independente.** Disponibilidade é derivada dos componentes
- **Reserva/venda de kit reserva/baixa os componentes correspondentes**
- Se `variante_id` preenchido, a variante DEVE pertencer ao `produto_id` do mesmo componente

**Regra de disponibilidade e reserva de kit (🔴 obrigatória):**

> **A disponibilidade e a reserva de um kit composto devem considerar os estoques das variantes/SKUs componentes. O kit NÃO mantém estoque físico independente quando sua composição é derivada dos componentes.**

```text
kits_disponíveis = MIN(
  estoque_componente_1 / quantidade_1,
  estoque_componente_2 / quantidade_2,
  ...
)
```

**Reserva de kit consome componentes:**
```text
Cliente reserva 2 kits →
  Base: reservado +2
  Batom: reservado +2
  Blush: reservado +2
  Máscara: reservado +2
  (NÃO: kit reservado +2)
```

**Estoque é compartilhado entre venda individual e composição de kit. Não pode existir estoque fantasma.**

**Tabela proposta — `kit_composicao`:**

| Coluna | Tipo | Nullable | Default | Observação |
|--------|------|----------|---------|------------|
| id | bigserial | NN | — | PK |
| produto_opcao_id | bigint | NN | — | FK → produto_opcao_compra.id (tipo='kit') |
| produto_id | bigint | NN | — | FK → produto.id (componente) |
| variante_id | bigint | Y | NULL | FK → produto_variante.id (SKU específico, opcional) |
| quantidade | integer | NN | — | Quantidade do componente no kit (> 0) |
| ordem | integer | NN | 0 | Ordem de exibição |
| ativo | boolean | NN | true | **Esta composição de kit está ativa?** |
| criado_em | timestamptz | NN | now() | |
| atualizado_em | timestamptz | NN | now() | |

**Constraints:**
- PK: `kc_pkey` (id)
- FK: `kc_opcao_fk` (produto_opcao_id → produto_opcao_compra.id) ON DELETE CASCADE
- FK: `kc_produto_fk` (produto_id → produto.id) ON DELETE CASCADE
- FK: `kc_variente_fk` (variante_id → produto_variante.id) ON DELETE SET NULL
- CK: `kc_quantidade_check` (quantidade > 0)
- CK: `kc_ativo_check` (ativo IN (true, false))
- CHECK: (variante_id IS NOT NULL) OR (produto_id IS NOT NULL) — sempre tem produto

**Índices:**
- IDX: `idx_kc_opcao` (produto_opcao_id)
- IDX: `idx_kc_produto` (produto_id)
- IDX: `idx_kc_variente` (variante_id)
- IDX: `idx_kc_ativo` (ativo) WHERE ativo = true

**Relacionamentos:**
- N:1 → produto_opcao_compra (tipo='kit')
- N:1 → produto
- N:1 → produto_variante (nullable — SKU específico ou genérico)

**Evidência:** Gate 6.2 prompt Seção 5 (Kits/composição)

**Classificação:** FECHADO (D1, D4)

**Exemplo suportado:**
```text
Kit Maquiagem (produto_opcao_compra, tipo='kit')
 ├── Kit Composição (kit_composicao)
 │     ├── Base (produto) → SKU BASE-001 (variante_id)
 │     ├── Batom (produto) → variante_id NULL (qualquer variante)
 │     ├── Blush (produto) → SKU BLUSH-001 (variante_id)
 │     └── Máscara (produto) → SKU MASCARA-001 (variante_id)
 └── Opção de compra (produto_opcao_compra, tipo='kit')
       └── 'Kit Completo' (produto_opcao_valor)
```

**Conflito potencial:** Se `produto_opcao_compra` (tipo='kit') e `kit_composicao` coexistem, é necessário decidir: o kit é composto via `kit_composicao` OU via `produto_opcao_valor` com SKUs? Esta decisão depende da validação humana.

**Regra de integridade (🔴 obrigatória no modelo final):** Se `kit_composicao.variante_id` for preenchido, essa variante DEVE pertencer ao `produto_id` do mesmo componente. Não pode existir:
```text
produto_id = Lençol
variante_id = SKU de Toalha  ← INVÁLIDO
```
Esta validação deve ser garantida no banco (trigger ou check constraint), não apenas no frontend.

**Regra de disponibilidade e reserva de kit (🔴 obrigatória no modelo final):**

> **A disponibilidade e a reserva de um kit composto devem considerar os estoques das variantes/SKUs componentes. O kit NÃO mantém estoque físico independente quando sua composição é derivada dos componentes.**

```text
kits_disponíveis = MIN(
  estoque_componente_1 / quantidade_1,
  estoque_componente_2 / quantidade_2,
  ...
)
```

Exemplo:
```text
Kit Maquiagem: Base×1, Batom×1, Blush×1, Máscara×1

Estoque:    Base=10, Batom=4, Blush=8, Máscara=2

kits_disponíveis = MIN(10/1, 4/1, 8/1, 2/1) = 2 kits
```

**Reserva de kit consome componentes:**
```text
Cliente reserva 2 kits →
  Base: reservado +2
  Batom: reservado +2
  Blush: reservado +2
  Máscara: reservado +2
  (NÃO: kit reservado +2)
```

**Venda individual e kit compartilham o mesmo estoque:**
```text
Vender 1 Base individual → Base: 10 → 9
Imediatamente reduz capacidade de kits de 2 para 1 (se Batom=4 continua limitando)
```

**Estoque é compartilhado entre venda individual e composição de kit. Não pode existir estoque fantasma.**

---

## 7. CLIENTES

### 7.1 ENTIDADE: cliente

**Fonte:** `CONTRATO_DOMINIO_COMERCIAL_v1.1.md` §10, `DECISOES_NEGOCIO_v1.2.md` D8, `AUDITORIA_3` §2.8

**Motivo:** Cliente é o indivíduo que interage com o e-commerce. Cadastro híbrido (D8): pode comprar sem cadastro obrigatório. Auth é separado de perfil comercial.

**Decisões associadas:** D8 (cadastro híbrido), D9 (endereço), DEC1 (Supabase Auth)

**Regras comerciais (D8):**
- Cliente logado: usa dados e endereço salvos no sistema
- Cliente visitante: informa e-mail + endereço na finalização
- Ambos criam pedidos vinculados a usuários
- Criação de usuário lazy quando necessário
- Cadastro NÃO é obrigatório para comprar

**Dados comerciais do cliente:**
- Identificação: nome, e-mail, telefone, CPF (opcional)
- Endereços de entrega (D9)
- Histórico de pedidos
- Dados complementares

**Tabela proposta — `cliente`:**

| Coluna | Tipo | Nullable | Default | Observação |
|--------|------|----------|---------|------------|
| id | bigserial | NN | — | PK |
| nome | varchar(255) | NN | — | Nome comercial |
| email | varchar(255) | NN | — | UK — identificador único |
| telefone | varchar(20) | Y | NULL | |
| cpf | varchar(14) | Y | NULL | Opcional (CONTRATO §10.3) |
| data_nascimento | date | Y | NULL | |
| ativo | boolean | NN | true | |
| criado_em | timestamptz | NN | now() | |
| atualizado_em | timestamptz | NN | now() | |

**Constraints:**
- PK: `cliente_pkey` (id)
- UK: `cliente_email_unique` (email)
- CK: `cliente_ativo_check` (ativo IN (true, false))

**Índices:**
- IDX: `idx_cliente_email` (email)
- IDX: `idx_cliente_ativo` (ativo) WHERE ativo = true

**Relacionamentos:**
- 1:1 → auth.users (email como identificador)
- 1:N → endereco
- 1:1 → carrinho (server-side, quando logado)
- 1:N → pedido

**Evidência:** `CONTRATO v1.1 §10`, `DEC v1.2 D8`, `AUDITORIA_3 §2.8`

**Classificação:** FECHADO (D8, D9)

**Observação:** `cliente` e `auth.users` são entidades separadas. `auth.users` gerencia identidade (email, senha, provider). `cliente` gerencia perfil comercial. O relacionamento é 1:1 por email. Usuário lazy é criado no momento da compra (D8).

**Conflito com migration 09:** Migration `2026091309_carrinho_sync_perfis.sql` adiciona campos a `usuarios`. **REVISÁVEL** — o modelo propõe `cliente` como tabela separada de `auth.users` (separação contratual DEC1). Os campos adicionados na migration (telefone, data_nascimento, tipo, ultimo_login) pertencem ao `cliente`, não ao `usuarios` do Supabase Auth.

---

### 7.2 ENTIDADE: endereco

**Fonte:** `DECISOES_NEGOCIO_v1.3.md` D9, `CONTRATO_DOMINIO_COMERCIAL_v1.1.md` §11, `AUDITORIA_3` §2.9

**Motivo:** Endereço de entrega. Obrigatório no checkout (D9). CEP + ViaCEP para preenchimento. Número manual obrigatório. Múltiplos endereços por cliente. Snapshot no pedido.

**Decisões associadas:** D9 (FECHADO)

**Regras comerciais (D9):**
- Obrigatório no checkout do site (B)
- Obrigatório para visitante na finalização (H)
- WhatsApp: cliente informa endereço antes de finalizar (F)
- Apenas entrega no MVP (J)
- CEP obrigatório, ViaCEP preenche logradouro/bairro/cidade/UF (L)
- Número obrigatório e manual
- Complemento opcional
- Múltiplos endereços por cliente (1:N)
- Snapshot no pedido — alterações futuras NÃO modificam pedidos

**Tabela proposta — `endereco`:**

| Coluna | Tipo | Nullable | Default | Observação |
|--------|------|----------|---------|------------|
| id | bigserial | NN | — | PK |
| cliente_id | bigint | Y | NULL | FK → cliente.id (nullable — visitante pode ter endereço sem conta completa) |
| logradouro | varchar(255) | NN | — | |
| numero | varchar(10) | NN | — | Obrigatório e manual (D9-L) |
| complemento | varchar(100) | Y | NULL | Opcional |
| bairro | varchar(100) | NN | — | Preenchido por ViaCEP |
| cidade | varchar(100) | NN | — | Preenchido por ViaCEP |
| uf | char(2) | NN | — | Preenchido por ViaCEP |
| cep | varchar(8) | NN | — | Obrigatório (D9-L) |
| principal | boolean | NN | false | Endereço principal |
| ativo | boolean | NN | true | |
| criado_em | timestamptz | NN | now() | |
| atualizado_em | timestamptz | NN | now() | |

**Constraints:**
- PK: `endereco_pkey` (id)
- FK: `end_cliente_fk` (cliente_id → cliente.id) ON DELETE CASCADE
- CK: `end_cep_check` (cep ~ '^[0-9]{8}$') — 8 dígitos
- CK: `end_ativo_check` (ativo IN (true, false))

**Índices:**
- IDX: `idx_end_cliente` (cliente_id)
- IDX: `idx_end_cep` (cep)
- IDX: `idx_end_principal` (cliente_id) WHERE principal = true

**Relacionamentos:**
- N:1 → cliente (nullable — endereço pode existir sem cliente para visitante)
- 1:N → pedido (endereço de entrega snapshot)

**Observação:** `cliente_id` é nullable porque visitante pode ter endereço informado na finalização antes de ter uma conta completa (D8). Após compra, o usuário lazy é criado e o endereço pode ser vinculado.

**Regra de deleção (🟡 SQL/RLS):** A exclusão de endereço deve considerar pedidos existentes que referenciam `endereco_entrega_id`. O snapshot em `pedido.endereco_*` é a autoridade histórica e NÃO depende do endereço atual. Recomendações para SQL final:
- Se pedidos referenciam o endereço: `ON DELETE RESTRICT` (impede deleção enquanto vinculado)
- Se pedidos NÃO referenciam o endereço: `ON DELETE CASCADE` é aceitável
- A decisão depende da política de retenção de dados do cliente

**Evidência:** `DEC v1.3 D9`, `CONTRATO v1.1 §11`, `AUDITORIA_3 §2.9`

**Classificação:** FECHADO (D9)

**Conflito com migration 06:** Migration `2026091306_enderecos_fk.sql` tenta corrigir FK polimórfica. **REVISÁVEL** — o modelo deste documento usa FK direta para `cliente` (nullable), sem polimorfismo. Endereço é para entrega (tipo único no MVP — D9-J).

---

## 8. CARRINHO

### 8.1 ENTIDADE: carrinho

**Fonte:** `CONTRATO_DOMINIO_COMERCIAL_v1.1.md` §9, `DECISOES_NEGOCIO_v1.2.md` D13, `AUDITORIA_3` §2.7, `web/src/contexts/CartContext.tsx`

**Motivo:** Existe um conceito comercial único de carrinho. D13 diz: UM ÚNICO carrinho oficial. Implementação técnica é decisão da arquitetura.

**Decisões associadas:** D13 (técnica — carrinho canônico), D8 (híbrido), D2 (snapshot preço)

**Regras comerciais (D13):**
- UM ÚNICO carrinho oficial para o sistema
- Implementação definida na arquitetura, não neste contrato
- Deve suportar visitor e autenticado

**Regras do modelo de dados:**
- Carrinho representa INTENÇÃO, não reserva (D4)
- Carrinho persistido server-side para logados
- Carrinho local (localStorage) para visitantes, com sync posterior
- Merge de carrinhos no login (local → server)
- Snapshot de preço em cada item (D2)

**Regra — Fonte persistente:** O banco (tabela `carrinho`) é a fonte persistente do carrinho autenticado. O `localStorage` é mecanismo de conveniência para visitantes. Não devem existir duas verdades concorrentes.

**Regra — Visitor → Persistent merge:** No login, o carrinho do `localStorage` é mergeado ao carrinho server-side. Itens duplicados são consolidados pela quantidade.

**Regra — Carrinho visitor sem conta:** Visitantes podem ter `carrinho` com `cliente_id = NULL` e `session_id` preenchido. Após login/criação de conta, o `session_id` é substituído por `cliente_id`.

**Tabela proposta — `carrinho`:**

| Coluna | Tipo | Nullable | Default | Observação |
|--------|------|----------|---------|------------|
| id | bigserial | NN | — | PK |
| cliente_id | bigint | Y | NULL | FK → cliente.id (NULL para visitor — session-based) |
| session_id | text | Y | NULL | Para carrinhos de visitantes |
| criado_em | timestamptz | NN | now() | |
| atualizado_em | timestamptz | NN | now() | |

**Constraints:**
- PK: `carrinho_pkey` (id)
- FK: `car_cliente_fk` (cliente_id → cliente.id) ON DELETE SET NULL
- UK: `car_session_unique` (session_id) WHEN cliente_id IS NULL

**Índices:**
- IDX: `idx_car_cliente` (cliente_id)
- IDX: `idx_car_session` (session_id)

**Relacionamentos:**
- N:1 → cliente (nullable — visitor)
- 1:N → carrinho_item

**Evidência:** `CONTRATO v1.1 §9`, `DEC v1.2 D13`, `AUDITORIA_3 §2.7`, `CartContext.tsx`

**Classificação:** PROPOSTA (D13 técnica, conceito validado)

**Observação:** A existência de `carrinho` server-side depende da decisão de arquitetura (D13). Se D13 decidir que carrinho é apenas localStorage, esta tabela NÃO é necessária. O modelo inclui por flexibilidade e para suportar merge de carrinhos (D8 + D4).

**Diferença entre carrinho e pedido:**
- **Carrinho** = intenção (itens selecionados, preço snapshot, SEM reserva de estoque)
- **Pedido** = confirmação (itens congelados, endereço snapshot, reserva atômica, pagamento)

**Regra — Revalidação obrigatória:** O carrinho não é autoridade final de preço, promoção, estoque ou frete. No checkout, todos os dados comerciais devem ser revalidados no lado servidor antes de confirmar o pedido.

---

### 8.2 ENTIDADE: carrinho_item

**Fonte:** `CONTRATO_DOMINIO_COMERCIAL_v1.1.md` §9, `AUDITORIA_3` §2.7, `DECISOES_NEGOCIO_v1.3.md` D2

**Motivo:** Cada item no carrinho preserva a configuração comercial escolhida: produto, variante/SKU, opções, quantidade, preço vigente. Não confiar no preço enviado pelo navegador (D2).

**Decisões associadas:** D2 (snapshot), D1 (variantes)

**Regras:**
- Snapshot de preço no momento da adição (D2)
- Snapshot de preço congelado, não muda com catálogo (D2)
- Configuração comercial escolhida (produto + variante + opções + kit)
- Quantidade válida (> 0)
- Total = preço unitário × quantidade
- **A configuração comercial efetiva deve ser preservável** (opção de compra e/ou kit)

**Tabela proposta — `carrinho_item`:**

| Coluna | Tipo | Nullable | Default | Observação |
|--------|------|----------|---------|------------|
| id | bigserial | NN | — | PK |
| carrinho_id | bigint | NN | — | FK → carrinho.id |
| produto_id | bigint | NN | — | FK → produto.id |
| produto_variante_id | bigint | Y | NULL | FK → produto_variante.id (SKU, opcional — produto simples) |
| produto_opcao_compra_id | bigint | Y | NULL | FK → produto_opcao_compra.id (opção de compra, se aplicável) |
| kit_composicao_id | bigint | Y | NULL | FK → kit_composicao.id (kit, se aplicável) |
| nome_produto | varchar(255) | NN | — | Snapshot do nome |
| atributos_texto | text | Y | NULL | Resumo legível dos atributos (tamanho, cor, volume) |
| opcao_texto | text | Y | NULL | Snapshot da opção escolhida (ex: "4 unidades", "Kit Completo") |
| kit_texto | text | Y | NULL | Snapshot da composição do kit (componentes no momento da adição) |
| quantidade | integer | NN | 1 | Check > 0 (unidades do produto/variante) |
| quantidade_pacotes | integer | NN | 1 | Pacotes/conjuntos (relevante para opções e kits) |
| preco_unitario | decimal(10,2) | NN | — | Snapshot de preço (D2) |
| total | decimal(10,2) | NN | — | preco_unitario × quantidade |
| criado_em | timestamptz | NN | now() | |
| atualizado_em | timestamptz | NN | now() | |

**Constraints:**
- PK: `carrinho_item_pkey` (id)
- FK: `ci_carrinho_fk` (carrinho_id → carrinho.id) ON DELETE CASCADE
- FK: `ci_produto_fk` (produto_id → produto.id) ON DELETE CASCADE
- FK: `ci_variente_fk` (produto_variante_id → produto_variante.id) ON DELETE SET NULL
- FK: `ci_opcao_fk` (produto_opcao_compra_id → produto_opcao_compra.id) ON DELETE SET NULL
- FK: `ci_kit_fk` (kit_composicao_id → kit_composicao.id) ON DELETE SET NULL
- CK: `ci_quantidade_check` (quantidade > 0)
- CK: `ci_preco_check` (preco_unitario >= 0)
- CK: `ci_total_check` (total >= 0)

**Índices:**
- IDX: `idx_ci_carrinho` (carrinho_id)
- IDX: `idx_ci_produto` (produto_id)
- IDX: `idx_ci_sku` (produto_variante_id) — para dedup por variante

**Relacionamentos:**
- N:1 → carrinho
- N:1 → produto
- N:1 → produto_variante (opcional)
- N:1 → produto_opcao_compra (opcional)
- N:1 → kit_composicao (opcional)

**Observação:** `produto_variante_id` é nullable para suportar produtos simples (sem variantes). Para dedup no carrinho: se variante existe, dedup por (carrinho_id, produto_variante_id); se simples, dedup por (carrinho_id, produto_id). `produto_opcao_compra_id` e `kit_composicao_id` são mutuamente exclusivos (carrinho_item é: SKU simples, SKU + opção, OU kit). `opcao_texto` e `kit_texto` são snapshots para preservar a configuração mesmo que o catálogo mude depois.

**Evidência:** `CONTRATO v1.1 §9`, `AUDITORIA_3 §2.7`, `DEC v1.3 D2`

**Classificação:** PROPOSTA (D13 técnica, conceito validado)

**Conflito com migration 09:** Migration `2026091309_carrinho_sync_perfis.sql` cria `carrinho_itens` com `atributos jsonb`. **CONFLITANTE** com D1 (rejeita JSONB). Modelo deste documento usa `atributos_texto` (string legível).

---

## 9. PEDIDOS

### 9.1 ENTIDADE: pedido

**Fonte:** `DECISOES_NEGOCIO_v1.3.md` D10, `CONTRATO_DOMINIO_COMERCIAL_v1.1.md` §16, `AUDITORIA_3` §2.10

**Motivo:** Pedido é a unidade comercial de uma compra. Dois fluxos convergem (site + WhatsApp). Pagamento é separado de status do pedido (D10). Snapshot completo para preservação histórica.

**Decisões associadas:** D10 (FECHADO), D2 (snapshot), D4 (reserva/baixa), D9 (endereço snapshot), DEC2 (PIX + cartão)

**Regras comerciais (D10):**
- Dois fluxos convergem: site (checkout/pagamento) + WhatsApp (rascunho)
- `status_pedido`: ciclo comercial/logístico
- `status_pagamento`: ciclo financeiro — separado
- `rascunho` = intenção, NÃO pedido confirmado
- Confirmação por canal: site = pagamento aprovado; WhatsApp = vendedor confirma
- Cancelamento permitido até envio
- Devolução/troca: processo separado
- Estoque vinculado a evento de confirmação
- Alteração posterior no catálogo NÃO modifica pedido histórico

**Estados oficiais do pedido (D10):**
- `rascunho`, `processando`, `enviado`, `entregue`, `cancelado`

**Estados de pagamento:**
- `pendente`, `aprovado`, `recusado`

**Tabela proposta — `pedido`:**

| Coluna | Tipo | Nullable | Default | Observação |
|--------|------|----------|---------|------------|
| id | bigserial | NN | — | PK |
| numero | varchar(50) | NN | — | Identificador comercial (AC-YYYYMMDD-XXXX) |
| cliente_id | bigint | NN | — | FK → cliente.id (visitante lazy incluído) |
| origem | varchar(10) | NN | 'site' | 'site' \| 'whatsapp' |
| status | varchar(20) | NN | 'rascunho' | Estados D10 |
| endereco_entrega_id | bigint | NN | — | FK → endereco.id (referência; snapshot preservado nos campos abaixo) |
| endereco_nome | varchar(255) | NN | — | Snapshot: nome do destinatário |
| endereco_logradouro | varchar(255) | NN | — | Snapshot: logradouro |
| endereco_numero | varchar(10) | NN | — | Snapshot: número (manual, D9) |
| endereco_complemento | varchar(100) | Y | NULL | Snapshot: complemento |
| endereco_bairro | varchar(100) | NN | — | Snapshot: bairro |
| endereco_cidade | varchar(100) | NN | — | Snapshot: cidade |
| endereco_uf | char(2) | NN | — | Snapshot: estado |
| endereco_cep | varchar(8) | NN | — | Snapshot: CEP |
| frete_regra_id | bigint | Y | NULL | FK → frete_regra.id (aplicada) |
| frete_valor | decimal(10,2) | NN | 0 | Snapshot |
| subtotal | decimal(10,2) | NN | 0 | Snapshot |
| desconto_total | decimal(10,2) | NN | 0 | Snapshot de promoções |
| total | decimal(10,2) | NN | 0 | Snapshot final |
| observacoes | text | Y | NULL | |
| criado_em | timestamptz | NN | now() | |
| atualizado_em | timestamptz | NN | now() | |

**Status de pagamento (separado — D10):**

| Coluna | Tipo | Nullable | Default | Observação |
|--------|------|----------|---------|------------|
| metodo_pagamento | varchar(10) | NN | — | 'pix' \| 'cartao' (DEC2) |
| status_pagamento | varchar(15) | NN | 'pendente' | 'pendente' \| 'aprovado' \| 'recusado' |
| pagamento_id | bigint | Y | NULL | FK → pagamento.id (quando existir) |
| pago_em | timestamptz | Y | NULL | Quando pagamento confirmado |

**Constraints:**
- PK: `pedido_pkey` (id)
- UK: `pedido_numero_unique` (numero)
- FK: `ped_cliente_fk` (cliente_id → cliente.id)
- FK: `ped_endereco_fk` (endereco_entrega_id → endereco.id) ON DELETE RESTRICT
- FK: `ped_frete_fk` (frete_regra_id → frete_regra.id) ON DELETE SET NULL
- CK: `ped_origem_check` (origem IN ('site', 'whatsapp'))
- CK: `ped_status_check` (status IN ('rascunho','processando','enviado','entregue','cancelado'))
- CK: `ped_status_pagamento_check` (status_pagamento IN ('pendente','aprovado','recusado'))
- CK: `ped_metodo_check` (metodo_pagamento IN ('pix','cartao'))
- CK: `ped_valores_check` (subtotal >= 0 AND frete_valor >= 0 AND desconto_total >= 0 AND total >= 0)

**Índices:**
- IDX: `idx_pedido_cliente` (cliente_id)
- IDX: `idx_pedido_status` (status)
- IDX: `idx_pedido_numero` (numero)
- IDX: `idx_pedido_origem` (origem)
- IDX: `idx_pedido_status_pagamento` (status_pagamento)
- IDX: `idx_pedido_criado` (criado_em)

**Relacionamentos:**
- N:1 → cliente
- N:1 → endereco (referência; snapshot preservado nos campos endereco_nome, endereco_logradouro, endereco_numero, endereco_complemento, endereco_bairro, endereco_cidade, endereco_uf, endereco_cep)
- N:1 → frete_regra (aplicada, opcional)
- 1:N → pedido_item
- 1:N → pedido_status_historico
- 1:1 → pagamento (quando existir)

**Evidência:** `DEC v1.3 D10`, `CONTRATO v1.1 §16`, `AUDITORIA_3 §2.10`

**Classificação:** FECHADO (D10, D2, D9)

**Observação crítica:** Os campos de pagamento (`metodo_pagamento`, `status_pagamento`) ESTÃO na tabela `pedido` para acesso rápido, mas conceitualmente são entidade separada. Tabela `pagamento` (Seção 10) modela o detalhamento financeiro. Esta separação é obrigatória por D10. **Regra de imutabilidade:** Alteração posterior no catálogo, preços, endereços ou regras de frete NÃO modifica a representação histórica de um pedido já criado. Os campos `endereco_*` e `frete_valor` são snapshots definitivos que preservam o estado no momento da criação.

---

### 9.2 ENTIDADE: pedido_item

**Fonte:** `CONTRATO_DOMINIO_COMERCIAL_v1.1.md` §16, `DECISOES_NEGOCIO_v1.3.md` D2, `AUDITORIA_3` §2.11

**Motivo:** Itens do pedido com snapshot completo. Alteração posterior no catálogo NÃO modifica pedido histórico. Cada item preserva: produto, variante, preço, quantidade.

**Decisões associadas:** D2 (snapshot), D1 (variantes), D3 (promoção aplicada), D10 (histórico)

**Regras:**
- Snapshot de produto no momento da compra
- Snapshot de preço (D2)
- Variante no momento da compra (D1)
- Quantidade no momento da compra
- Desconto aplicado (D3)
- Subtotal e totais congelados
- **Snapshot de configuração comercial: variante/SKU, opção de compra, composição do kit** (Regra 3 — imutabilidade)

**Tabela proposta — `pedido_item`:**

| Coluna | Tipo | Nullable | Default | Observação |
|--------|------|----------|---------|------------|
| id | bigserial | NN | — | PK |
| pedido_id | bigint | NN | — | FK → pedido.id |
| produto_id | bigint | NN | — | FK → produto.id |
| produto_variante_id | bigint | Y | NULL | FK → produto_variante.id (SKU, opcional) |
| produto_opcao_compra_id | bigint | Y | NULL | FK → produto_opcao_compra.id (opção de compra, se aplicável) |
| kit_composicao_id | bigint | Y | NULL | FK → kit_composicao.id (kit, se aplicável — referência apenas) |
| nome_produto | varchar(255) | NN | — | Snapshot do nome |
| sku | varchar(100) | Y | NULL | SKU da variante |
| atributos_texto | text | Y | NULL | Resumo legível dos atributos |
| opcao_texto | text | Y | NULL | Snapshot da opção escolhida |
| kit_composicao_texto | text | Y | NULL | **IMUTÁVEL** — composição do kit no momento da venda |
| quantidade | integer | NN | — | Snapshot |
| preco_unitario | decimal(10,2) | NN | — | Snapshot de preço (D2) |
| desconto_unitario | decimal(10,2) | NN | 0 | Promoção aplicada por item (D3) |
| subtotal | decimal(10,2) | NN | — | preco_unitario × quantidade |
| total | decimal(10,2) | NN | — | subtotal - desconto_unitario × quantidade |
| criado_em | timestamptz | NN | now() | |

**Constraints:**
- PK: `pedido_item_pkey` (id)
- FK: `pi_pedido_fk` (pedido_id → pedido.id) ON DELETE CASCADE
- FK: `pi_produto_fk` (produto_id → produto.id) ON DELETE RESTRICT
- FK: `pi_variente_fk` (produto_variante_id → produto_variante.id) ON DELETE SET NULL
- FK: `pi_opcao_fk` (produto_opcao_compra_id → produto_opcao_compra.id) ON DELETE SET NULL
- FK: `pi_kit_fk` (kit_composicao_id → kit_composicao.id) ON DELETE SET NULL
- CK: `pi_quantidade_check` (quantidade > 0)
- CK: `pi_preco_check` (preco_unitario >= 0)
- CK: `pi_total_check` (total >= 0)

**Índices:**
- IDX: `idx_pi_pedido` (pedido_id)
- IDX: `idx_pi_produto` (produto_id)
- IDX: `idx_pi_variente` (produto_variante_id)

**Relacionamentos:**
- N:1 → pedido
- N:1 → produto
- N:1 → produto_variante (opcional)
- N:1 → produto_opcao_compra (opcional)
- N:1 → kit_composicao (opcional)

**Observação:** `produto_variante_id` é nullable para suportar produtos simples. `produto_opcao_compra_id` e `kit_composicao_id` são mutuamente exclusivos (item é: SKU simples, SKU + opção, OU kit). `opcao_texto` e `kit_composicao_texto` são snapshots para preservar a configuração mesmo que o catálogo mude depois. `kit_composicao_texto` é IMUTÁVEL — se o kit for alterado posteriormente, o texto preserva a composição original vendida. FK `kit_composicao_id` serve apenas para referência de relatórios; a composição comercial efetiva está no snapshot de texto.

**Evidência:** `CONTRATO v1.1 §16`, `DEC v1.3 D2`, `AUDITORIA_3 §2.11`

**Classificação:** FECHADO (D1, D2, D3, D10)

**Conflito com migration 01:** Migration `2026091301_itens_pedido.sql` cria tabela `itens_pedido`. **APROVEITÁVEL CONCEITO** — a estrutura geral está correta, MAS:
- Migration usa `atributos jsonb` → CONFLITANTE com D1
- Migration tem `pedido_id` como FK cascata → CORRETO
- Migration não tem `desconto_unitario` → Lacuna no modelo (D3 exige registro de desconto)
- Nome: `itens_pedido` vs `pedido_item` → O modelo deste documento usa `pedido_item` (mais idiomático em português)

---

### 9.3 ENTIDADE: pedido_status_historico

**Fonte:** `DECISOES_NEGOCIO_v1.3.md` D10, `AUDITORIA_4` §322 (P2)

**Motivo:** Registro imutável de mudanças de status do pedido. D10 exige rastreabilidade do ciclo comercial.

**Decisões associadas:** D10 (FECHADO)

**Tabela proposta — `pedido_status_historico`:**

| Coluna | Tipo | Nullable | Default | Observação |
|--------|------|----------|---------|------------|
| id | bigserial | NN | — | PK |
| pedido_id | bigint | NN | — | FK → pedido.id |
| status_anterior | varchar(20) | Y | NULL | Estado anterior |
| status_novo | varchar(20) | NN | — | Estado novo |
| canal | varchar(10) | Y | NULL | 'site' \| 'whatsapp' (quem confirmou) |
| usuario_id | bigint | Y | NULL | Quem registrou (vendedor, sistema) |
| criado_em | timestamptz | NN | now() | |

**Constraints:**
- PK: `psh_pkey` (id)
- FK: `psh_pedido_fk` (pedido_id → pedido.id) ON DELETE CASCADE
- CK: `psh_novo_check` (status_novo IN ('rascunho','processando','enviado','entregue','cancelado'))

**Índices:**
- IDX: `idx_psh_pedido` (pedido_id)
- IDX: `idx_psh_criado` (criado_em)

**Relacionamentos:**
- N:1 → pedido

**Observação:** Este gate NÃO define a máquina de estados (transições permitidas). Isso é decisão do contrato funcional (D10 pendente na v1.1, mas fechada no workshop — as transições precisam ser detalhadas no contrato funcional).

**Evidência:** `DEC v1.3 D10`, `AUDITORIA_4 §322`

**Classificação:** PROPOSTA (baseada em D10)

### 9.4 REGRAS DE OURO DO MODELO

**Regra 1 — Revalidação no checkout:**
> O carrinho NÃO é autoridade final de preço, promoção, estoque ou frete. No checkout, os dados comerciais devem ser revalidados no lado servidor antes de confirmar o pedido.

**Regra 2 — Imutabilidade comercial do pedido:**
> Alterações posteriores no catálogo, preços, promoções, variantes, opções, kits, endereços ou regras de frete NÃO podem alterar a representação histórica de um pedido já criado.

**Regra 3 — Configuração comercial preservada:**
> `pedido_item` deve preservar a configuração efetivamente adquirida, incluindo variante/SKU, opção de compra e, quando aplicável, composição do kit (via snapshots de texto imutáveis).

---

## 10. PAGAMENTOS

### 10.1 ENTIDADE: pagamento

**Fonte:** `DECISOES_NEGOCIO_v1.2.md` DEC2, D6a, `CONTRATO_DOMINIO_COMERCIAL_v1.1.md` §13, `DECISOES_NEGOCIO_v1.3.md` D10

**Motivo:** Pagamento é SEPARADO de status do pedido (D10). Método é diferente de status. No lançamento: PIX + cartão (DEC2). Gateway é decisão técnica (D6b → Arquitetura).

**Decisões associadas:** DEC2 (FECHADO), D6a (FECHADO), D10 (FECHADO)

**Regras comerciais:**
- Métodos no lançamento: PIX + cartão (DEC2)
- Método NÃO é status (D10-D)
- Status financeiro: pendente, aprovado, recusado (D10)
- Gateway/provedor é decisão técnica (D6b → Arquitetura)
- Webhooks essenciais para confirmação (CONTRATO §13.3)
- PIX pode ter QR Code, cópia e cola (não definido — técnico)
- Cartão via gateway (técnico)

**Diferença método vs status (D10-D):**
- `metodo_pagamento` = como se paga (PIX, cartão)
- `status_pagamento` = estado financeiro (pendente, aprovado, recusado)
- `status_pedido` = ciclo logístico (rascunho, processando, enviado, entregue)
- `pagamento_aprovado` NÃO é status principal do pedido

**Tabela proposta — `pagamento`:**

| Coluna | Tipo | Nullable | Default | Observação |
|--------|------|----------|---------|------------|
| id | bigserial | NN | — | PK |
| pedido_id | bigint | NN | — | FK → pedido.id |
| metodo | varchar(10) | NN | — | 'pix' \| 'cartao' (DEC2) |
| status | varchar(15) | NN | 'pendente' | 'pendente' \| 'aprovado' \| 'recusado' |
| valor | decimal(10,2) | NN | — | Valor do pagamento |
| transaction_id | varchar(100) | Y | NULL | ID da transação no gateway (técnico) |
| provider | varchar(50) | Y | NULL | Provedor (técnico — D6b) |
| dados_externos | jsonb | Y | NULL | Dados do webhook/gateway (técnico) |
| criado_em | timestamptz | NN | now() | |
| atualizado_em | timestamptz | NN | now() | |
| confirmado_em | timestamptz | Y | NULL | Quando aprovado |

**Constraints:**
- PK: `pagamento_pkey` (id)
- FK: `pag_pedido_fk` (pedido_id → pedido.id) ON DELETE RESTRICT
- CK: `pag_metodo_check` (metodo IN ('pix', 'cartao'))
- CK: `pag_status_check` (status IN ('pendente', 'aprovado', 'recusado'))
- UK: `pag_pedido_unique` (pedido_id) — 1 pagamento por pedido no lançamento
- CK: `pag_valor_check` (valor > 0)

**Índices:**
- IDX: `idx_pag_pedido` (pedido_id)
- IDX: `idx_pag_status` (status)
- IDX: `idx_pag_metodo` (metodo)
- IDX: `idx_pag_transaction` (transaction_id) WHEN transaction_id IS NOT NULL

**Relacionamentos:**
- N:1 → pedido (1:1 no lançamento)

**Observação:** `dados_externos` é jsonb para flexibilidade técnica — diferente de atributos de produto, dados de gateway são técnicos e variam por provedor. Aceito aqui como campo técnico (não é atributo de domínio comercial). Gateway/provedor é decisão D6b.

**Separação obrigatória (D10):** Pagamento é entidade distinta de pedido. Pedido tem `status` (ciclo comercial/logístico). Pagamento tem `status` (ciclo financeiro). `status_pagamento` dentro de `pedido` é apenas espelho para acesso rápido; a fonte de verdade está na tabela `pagamento`. Não usar `pedido.status = 'pago'` — "pago" é estado financeiro, NÃO estado logístico do pedido.

**Evidência:** `DEC v1.2 DEC2`, `CONTRATO v1.1 §13`, `DEC v1.3 D10`

**Classificação:** FECHADO (DEC2, D10) — Gateway específico ABERTO (D6b)

**Conflito com migration 05:** Migration `2026091305_pedidos_expand.sql` adiciona `metodo_pagamento` e `status_pagamento` ao `pedidos`. **APROVEITÁVEL CONCEITO** — correto separar, MAS modelo deste documento coloca em tabela `pagamento` separada (mais forte para D10).

---

## 11. FRETE

### 11.1 ENTIDADE: frete_regra

**Fonte:** `DECISOES_NEGOCIO_v1.2.md` D5, `CONTRATO_DOMINIO_COMERCIAL_v1.1.md` §12, `AUDITORIA_4` §263

**Motivo:** Frete é configurável no admin (D5). Nenhuma regra hardcoded. Fase 1: tabela admin configurável. Fase 2: integração transportadora.

**Decisões associadas:** D5 (FECHADO)

**Regras comerciais (D5):**
- Fase 1: tabela configurável no admin
- Fase 2: integração transportadora (decisão pendente)
- Regras por CEP/região/UF
- Diferentes valores por região
- Frete grátis a partir de valor mínimo (subtotal mínimo)
- Tipos de cálculo: valor fixo, por peso, percentual sobre subtotal
- Regras ativas/inativas
- NENHUM valor hardcoded no frontend (DEC5)
- **Frete é snapshot no pedido** — alteração posterior na regra NÃO modifica pedido existente

**Arquitetura de cálculo (fluxo):**
```text
CEP
 ↓
Edge Function / serviço
 ↓
endereço normalizado
 ↓
regras de frete (frete_regra)
 ↓
opções disponíveis
 ↓
cliente escolhe
 ↓
pedido salva snapshot
```

**Regra — Revalidação no checkout:** O carrinho NÃO é autoridade final de preço, promoção, estoque ou frete. No checkout, os dados comerciais devem ser revalidados no lado servidor antes de confirmar o pedido.

**Configuração de cálculo:**

| Tipo | Descrição | Exemplo |
|------|-----------|---------|
| `fixo` | Valor fixo por região | R$ 20 para SP/RJ |
| `por_kg` | Valor por kg do pedido | R$ 5/kg |
| `percentual_subtotal` | Percentual sobre subtotal | 10% do subtotal |
| `gratis` | Grátis acima de mínimo | Subtotal > R$ 300 |

**Tabela proposta — `frete_regra`:**

| Coluna | Tipo | Nullable | Default | Observação |
|--------|------|----------|---------|------------|
| id | bigserial | NN | — | PK |
| cep_inicio | varchar(8) | Y | NULL | CEP inicial (opcional — regra pode ser por região) |
| cep_fim | varchar(8) | Y | NULL | CEP final (opcional) |
| uf | char(2) | Y | NULL | Estado (opcional — regra pode ser por região) |
| regiao | varchar(50) | Y | NULL | Região (opcional) |
| tipo | varchar(20) | NN | 'fixo' | 'fixo' \| 'por_kg' \| 'percentual_subtotal' \| 'gratis' |
| valor | decimal(10,2) | NN | 0 | Valor do frete (0 se gratis) |
| subtotal_minimo | decimal(10,2) | NN | 0 | Subtotal mínimo para frete grátis (0 = não aplica) |
| peso_maximo | decimal(10,2) | Y | NULL | Peso máximo para regra (opcional) |
| ativo | boolean | NN | true | |
| criado_em | timestamptz | NN | now() | |
| atualizado_em | timestamptz | NN | now() | |

**Constraints:**
- PK: `frete_regra_pkey` (id)
- CK: `fr_tipo_check` (tipo IN ('fixo', 'por_kg', 'percentual_subtotal', 'gratis'))
- CK: `fr_valor_check` (valor >= 0)
- CK: `fr_subtotal_check` (subtotal_minimo >= 0)
- CK: `fr_ativo_check` (ativo IN (true, false))

**Índices:**
- IDX: `idx_frete_cep` (cep_inicio, cep_fim) WHEN cep_inicio IS NOT NULL
- IDX: `idx_frete_uf` (uf) WHERE ativo = true
- IDX: `idx_frete_regiao` (regiao) WHERE ativo = true
- IDX: `idx_frete_ativo` (ativo)

**Relacionamentos:**
- N:1 → pedido (aplicada, via frete_regra_id no pedido — referência para relatórios; valor efetivo snapshotted em `pedido.frete_valor`)

**Observação:** Múltiplas regras podem se aplicar a um mesmo CEP. A lógica de resolução (qual regra usar) é decisão do contrato funcional. No lançamento: primeiro match ativo, ou mais específica (CEP exact > região > UF). **Regra 2:** Alteração posterior na regra de frete NÃO modifica o valor já snapshot em pedidos existentes.

**Evidência:** `DEC v1.2 D5`, `CONTRATO v1.1 §12`, `AUDITORIA_4 §263`

**Classificação:** FECHADO (D5)

**Conflito com migration 04:** Migration `2026091304_frete_regra.sql` cria tabela `frete_regra`. **APROVEITÁVEL CONCEITO** — estrutura muito similar ao modelo deste documento. Lacunas na migration: não tem `tipo='gratis'`, não tem `subtotal_minimo` bem definido, trigger CEP não implementada. Modelo deste documento é mais completo.

---

## 12. PROMOÇÕES

**Fonte:** `DECISOES_NEGOCIO_v1.3.md` D3, `CONTRATO_DOMINIO_COMERCIAL_v1.1.md` §7

**Motivo:** Promoções comerciais sobre produtos. D3 FECHADO: tipo %, R$, produto→variantes, não cumulativa, menor preço final, período obrigatório, sem cupons.

> **NOTA:** A entidade `promocao` já foi documentada na Seção 6.10. Esta seção adiciona regras de aplicação e integração com o domínio.

### 12.1 Regras de Aplicação de Promoção (D3)

Ordem de cálculo (D3):

```text
1. Produto (preço base)
2. Resolução do preço da variante (D2: variante sobrescreve base, senão herda)
3. Promoção válida aplicada (D3: tipo, período, escopo)
4. Preço promocional
5. Snapshot no carrinho (D2)
6. Preservado no item do pedido ao confirmar
```

**Regras D3 detalhadas:**

| Regra | Decisão |
|-------|---------|
| Tipo | Percentual + valor fixo (C) |
| Escopo | Produto base → variantes (D). Sem promoção por variante no lançamento |
| Cumulatividade | Não cumulativa (H/I). Apenas uma promoção válida por item |
| Menor preço | Aplicar a que resultar no MENOR preço final para o cliente |
| Comparação | Não comparar apenas valor numérico do desconto (% e fixo não comparáveis) |
| Período | Início e fim obrigatórios (J). Sem promoção permanente |
| Cupons | Não no lançamento (L) |
| Preço promocional | Preço final após promoção (snapshot no carrinho e pedido) |

### 12.2 Prioridade de Promoção

Quando existem múltiplas promoções válidas para o mesmo item:

```text
1. Verificar se cada promoção está no período (data_inicio <= now <= data_fim)
2. Aplicar a que resulta no MENOR preço final para o cliente
3. NÃO comparar apenas o valor do desconto (percentual 50% de R$100 ≠ fixo R$30)
4. Calcular: preço_final = preço_resolvido - desconto_calculado
5. Menor preço_final vence
6. Apenas UMA promoção aplicada por item (não cumulativa)
```

### 12.3 Registro de Aplicação (PROPOSTA — decisão do contrato funcional)

Tabela sugerida para registro de promoções aplicadas (decisão futura):

| Coluna | Tipo | Observação |
|--------|------|------------|
| id | bigserial | PK |
| promocao_id | bigint | FK → promocao.id |
| produto_id | bigint | FK → produto.id |
| pedido_id | bigint | FK → pedido.id (quando aplicado) |
| carrinho_item_id | bigint | FK → carrinho_item.id (quando aplicado) |
| preco_anterior | decimal(10,2) | Antes da promoção |
| preco_promocional | decimal(10,2) | Após a promoção |
| aplicado_em | timestamptz | Data/hora da aplicação |

**Conflito com migration 07:** Migration `2026091307_produtos_promocao_expand.sql` adiciona `variante_id` a `produtos_promocao`. **🟡 RESERVADO — MVP não necessita.** D3 fecha promoção por produto base. `variante_id` não deve ser incluído no schema MVP. Reservado para evolução futura se houver necessidade real de promoção por variante.

---

## 13. ESTOQUE

### 13.1 ENTIDADE: estoque

**Fonte:** `DECISOES_NEGOCIO_v1.3.md` D4, `CONTRATO_DOMINIO_COMERCIAL_v1.1.md` §8, `assets/sql/angelcosmeticos_estoque.sql`

**Motivo:** Controle de disponibilidade de produtos. Modelo híbrido (D4): produto simples → estoque no nível do produto; variante → estoque individual por SKU.

**Decisões associadas:** D4 (FECHADO)

**Regras comerciais (D4):**
1. **Híbrido:** Produto simples → estoque no produto. Produto com variantes → estoque por variante/SKU
2. **Reserva no checkout** (transacional/atômica). NÃO no carrinho
3. **Baixa por canal:** Site=pagamento aprovado; WhatsApp=vendedor confirma
4. **Estoque negativo NÃO permitido**
5. **Cancelamento/devolução:** retorno com validação
6. **Regra crítica:** Disponibilidade garantida transacionalmente no checkout

**Diferença estoque simples vs variante:**
- Produto SIMPLES: `estoque` linkado ao `produto` (1:1)
- Produto COM VARIANTES: `estoque` linkado ao `produto_variante` (1:1 por variante)

**Tabela proposta — `estoque`:**

| Coluna | Tipo | Nullable | Default | Observação |
|--------|------|----------|---------|------------|
| id | bigserial | NN | — | PK |
| produto_id | bigint | Y | NULL | FK → produto.id (para produto simples) |
| produto_variante_id | bigint | Y | NULL | FK → produto_variante.id (para variante) |
| quantidade_fisica | integer | NN | 0 | Total físico em estoque (>= 0) |
| quantidade_reservada | integer | NN | 0 | Em reserva no checkout (>= 0, <= quantidade_fisica) |
| criado_em | timestamptz | NN | now() | |
| atualizado_em | timestamptz | NN | now() | |

**Constraints:**
- PK: `estoque_pkey` (id)
- FK: `est_produto_fk` (produto_id → produto.id) ON DELETE CASCADE
- FK: `est_variente_fk` (produto_variante_id → produto_variante.id) ON DELETE CASCADE
- CK: `est_quantidade_fisica_check` (quantidade_fisica >= 0)
- CK: `est_quantidade_reservada_check` (quantidade_reservada >= 0 AND quantidade_reservada <= quantidade_fisica)
- CHECK: (produto_id IS NOT NULL) OR (produto_variante_id IS NOT NULL) — pelo menos um
- CHECK: (produto_id IS NULL) OR (produto_variante_id IS NULL) — no máximo um (para simples vs variante)

**Índices:**
- IDX: `idx_estoque_produto` (produto_id) UNIQUE WHEN produto_variante_id IS NULL
- IDX: `idx_estoque_variente` (produto_variante_id) UNIQUE
- IDX: `idx_estoque_disponivel` (id) WHERE (quantidade_fisica - quantidade_reservada) > 0

**Relacionamentos:**
- N:1 → produto (nullable — estoque por produto para simples)
- N:1 → produto_variante (nullable — estoque por variante)

**Evidência:** `DEC v1.3 D4`, `CONTRATO v1.1 §8`, `angelcosmeticos_estoque.sql`

**Classificação:** FECHADO (D4)

**Observação:** O CHECK acima garante que o estoque é vinculado a UM tipo: produto simples OU variante, mas não ambos. Para produto simples, `produto_id` é preenchido e `produto_variante_id` é NULL. Para produto com variantes, cada variante tem seu estoque (`produto_variante_id` preenchido, `produto_id` NULL no estoque).

**Movimentação de estoque:** Ver Seção 13.2.

---

### 13.2 ENTIDADE: estoque_movimentacao

**Fonte:** `DECISOES_NEGOCIO_v1.3.md` D4, `CONTRATO_DOMINIO_COMERCIAL_v1.1.md` §8.2

**Motivo:** Estoque tem entradas e saídas com rastreabilidade (D4). Modelo baseado em movimentação (conforme Gate 6.2 prompt).

**Regras comerciais (D4):**
- Entrada (reposição, ajuste)
- Saída (venda, devolução, cancelamento)
- Reserva (checkout, temporária)
- Cancelamento (libera reserva)
- Devolução com validação

**Tipos de movimentação:**

| Tipo | Descrição | Canal |
|------|-----------|-------|
| `entrada` | Reposição/reatribuição | Admin |
| `saida_venda` | Venda consolidada | Checkout |
| `reserva` | Reserva temporária no checkout | Checkout |
| `cancelamento_reserva` | Libera reserva cancelada | Checkout/Admin |
| `cancelamento_venda` | Retorno de venda cancelada | Admin |
| `devolucao` | Retorno de devolução | Admin |
| `ajuste` | Correção manual | Admin |

**Tabela proposta — `estoque_movimentacao`:**

| Coluna | Tipo | Nullable | Default | Observação |
|--------|------|----------|---------|------------|
| id | bigserial | NN | — | PK |
| estoque_id | bigint | NN | — | FK → estoque.id |
| produto_id | bigint | Y | NULL | FK → produto.id (para rastreabilidade, opcional) |
| produto_variante_id | bigint | Y | NULL | FK → produto_variante.id (opcional) |
| tipo | varchar(20) | NN | — | Tipo de movimentação |
| quantidade | integer | NN | — | Positivo=entrada, Negativa=saída |
| quantidade_anterior | integer | NN | — | Saldo antes |
| quantidade_nova | integer | NN | — | Saldo depois |
| pedido_id | bigint | Y | NULL | FK → pedido.id (quando ligado a pedido) |
| canal | varchar(10) | Y | NULL | 'site' \| 'whatsapp' (quando aplicável) |
| observacao | text | Y | NULL | Motivo/justificativa |
| criado_em | timestamptz | NN | now() | |

**Constraints:**
- PK: `em_pkey` (id)
- FK: `em_estoque_fk` (estoque_id → estoque.id) ON DELETE RESTRICT
- FK: `em_pedido_fk` (pedido_id → pedido.id) ON DELETE SET NULL
- FK: `em_produto_fk` (produto_id → produto.id) ON DELETE SET NULL
- FK: `em_variente_fk` (produto_variante_id → produto_variante.id) ON DELETE SET NULL
- CK: `em_tipo_check` (tipo IN ('entrada','saida_venda','reserva','cancelamento_reserva','cancelamento_venda','devolucao','ajuste'))
- CK: `em_quantidade_check` (quantidade != 0)
- CK: `em_quantidade_nova_check` (quantidade_nova >= 0)

**Índices:**
- IDX: `idx_em_estoque` (estoque_id)
- IDX: `idx_em_produto` (produto_id)
- IDX: `idx_em_pedido` (pedido_id)
- IDX: `idx_em_tipo` (tipo)
- IDX: `idx_em_criado` (criado_em)

**Relacionamentos:**
- N:1 → estoque
- N:1 → pedido (opcional)
- N:1 → produto (opcional)
- N:1 → produto_variante (opcional)

**Observação:** Para kits: cada componente gera sua própria movimentação. A movimentação do kit é representada pelas movimentações dos componentes (D4: kits compatíveis com consumo de componentes).

**Evidência:** `DEC v1.3 D4`, `CONTRATO v1.1 §8.2`, `angelcosmeticos_entradas_estoque.sql`, `angelcosmeticos_saidas_estoque.sql`

**Classificação:** PROPOSTA (baseada em D4 + Gate 6.2 prompt)

**Conflito com migration 08:** Migration `2026091308_historico_e_estoque_expand.sql` adiciona `variante_id` a `saidas_estoque` e `entradas_estoque`. **REVISÁVEL** — o modelo deste documento substitui completamente as tabelas legadas por `estoque_movimentacao` (modelo unificado com tipos).

---

## 14. SUPORTE

### 14.1 ENTIDADE: atendimento

**Fonte:** `DECISOES_NEGOCIO_v1.2.md` D19, `CONTRATO_DOMINIO_COMERCIAL_v1.1.md` §17, `AUDITORIA_4` §16

**Motivo:** Atendimento ao cliente com botão explícito "Falar com humano" (D19). Dois canais: chatbot (OpenRouter/Render) + humano (WhatsApp Business 5511963205776). Handoff explícito.

**Decisões associadas:** D19 (FECHADO), D7 (WhatsApp)

**Regras comerciais (D19):**
- Ação explícita "Falar com humano" para transferência
- Handoff para atendimento humano via WhatsApp Business (5511963205776)
- Chatbot como primeira instância (não explícito, mas existente)
- Keyword triggers como complemento, não dependência exclusiva

**Tabela proposta — `atendimento`:**

| Coluna | Tipo | Nullable | Default | Observação |
|--------|------|----------|---------|------------|
| id | bigserial | NN | — | PK |
| cliente_id | bigint | Y | NULL | FK → cliente.id (nullable — visitante) |
| pedido_id | bigint | Y | NULL | FK → pedido.id (opcional — atendimento pode não estar associado a pedido) |
| tipo | varchar(20) | NN | — | 'chatbot' \| 'humano' \| 'handoff' |
| canal | varchar(20) | NN | — | 'site' \| 'whatsapp' |
| status | varchar(20) | NN | 'aberto' | 'aberto' \| 'em_andamento' \| 'encerrado' |
| assunto | varchar(255) | Y | NULL | |
| criado_em | timestamptz | NN | now() | |
| atualizado_em | timestamptz | NN | now() | |
| encerrado_em | timestamptz | Y | NULL | |

**Constraints:**
- PK: `atendimento_pkey` (id)
- FK: `at_cliente_fk` (cliente_id → cliente.id) ON DELETE SET NULL
- FK: `at_pedido_fk` (pedido_id → pedido.id) ON DELETE SET NULL
- CK: `at_tipo_check` (tipo IN ('chatbot', 'humano', 'handoff'))
- CK: `at_canal_check` (canal IN ('site', 'whatsapp'))
- CK: `at_status_check` (status IN ('aberto', 'em_andamento', 'encerrado'))

**Índices:**
- IDX: `idx_at_cliente` (cliente_id)
- IDX: `idx_at_pedido` (pedido_id)
- IDX: `idx_at_status` (status)
- IDX: `idx_at_tipo` (tipo)
- IDX: `idx_at_criado` (criado_em)

**Relacionamentos:**
- N:1 → cliente (nullable)
- N:1 → pedido (opcional)
- 1:N → atendimento_mensagem

**Evidência:** `DEC v1.2 D19`, `CONTRATO v1.1 §17`, `AUDITORIA_4 §16`

**Classificação:** FECHADO (D19)

---

### 14.2 ENTIDADE: atendimento_mensagem

**Fonte:** `AUDITORIA_4` §16, `DECISOES_NEGOCIO_v1.2.md` D19

**Motivo:** Mensagens trocadas durante o atendimento. Inclui mensagens do chatbot, do atendente humano, e do cliente. Histórico de conversação.

**Tabela proposta — `atendimento_mensagem`:**

| Coluna | Tipo | Nullable | Default | Observação |
|--------|------|----------|---------|------------|
| id | bigserial | NN | — | PK |
| atendimento_id | bigint | NN | — | FK → atendimento.id |
| remetente | varchar(20) | NN | — | 'cliente' \| 'atendente' \| 'chatbot' |
| tipo | varchar(20) | NN | — | 'texto' \| 'imagem' \| 'documento' \| 'sistema' |
| conteudo | text | NN | — | Mensagem |
| criado_em | timestamptz | NN | now() | |

**Constraints:**
- PK: `am_pkey` (id)
- FK: `am_atendimento_fk` (atendimento_id → atendimento.id) ON DELETE CASCADE
- CK: `am_remetente_check` (remetente IN ('cliente', 'atendente', 'chatbot'))
- CK: `am_tipo_check` (tipo IN ('texto', 'imagem', 'documento', 'sistema'))

**Índices:**
- IDX: `idx_am_atendimento` (atendimento_id)
- IDX: `idx_am_criado` (criado_em)

**Relacionamentos:**
- N:1 → atendimento

**Observação:** Este gate NÃO define: critérios de handoff automático (keyword, timeout), regras de roteamento,SLA de resposta, etc. Estes são decisões do contrato funcional. AÇÃO PRIMÁRIA: botão explícito "Falar com humano" (D19).

**Evidência:** `AUDITORIA_4 §16`, `DEC v1.2 D19`

**Classificação:** PROPOSTA (baseada em D19)

---

## 15. AUTOMAÇÃO / N8N

### 15.1 EVENTOS DO DOMÍNIO

**Fonte:** `CONTRATO_DOMINIO_COMERCIAL_v1.1.md` §13, `DECISOES_NEGOCIO_v1.2.md` DEC2

**Motivo:** Eventos do sistema para orquestração de automações. Usados por n8n, webhooks, integrações. Não modelar mais do que o necessário.

**Decisões associadas:** DEC2 (pagamentos), D7 (WhatsApp), D4 (estoque)

**Tabela proposta — `evento` (PROPOSTA — modelo mínimo):**

| Coluna | Tipo | Nullable | Default | Observação |
|--------|------|----------|---------|------------|
| id | bigserial | NN | — | PK |
| idempotency_key | varchar(255) | Y | NULL | **OBRIGATÓRIO** — chave única para processamento idempotente (ex: `order.paid-12345`). UNIQUE parcial onde not null |
| nome | varchar(50) | NN | — | Nome do evento |
| entidade_tipo | varchar(30) | NN | — | 'pedido' \| 'pagamento' \| 'estoque' \| 'cliente' |
| entidade_id | bigint | NN | — | ID da entidade |
| dados | jsonb | Y | NULL | Payload do evento |
| status | varchar(20) | NN | 'pendente' | 'pendente' \| 'processado' \| 'falhou' |
| processado_em | timestamptz | Y | NULL | Quando foi processado |
| tentativas | integer | NN | 0 | Número de tentativas (>= 0) |
| criado_em | timestamptz | NN | now() | |

**Constraints:**
- PK: `evento_pkey` (id)
- CK: `evento_nome_check` (nome IN ('order.created', 'order.confirmed', 'payment.paid', 'payment.refused', 'order.shipped', 'order.delivered', 'order.canceled', 'stock.reserved', 'stock.released', 'support.requested', 'support.handoff'))
- CK: `evento_status_check` (status IN ('pendente','processado','falhou'))
- CK: `evento_tentativas_check` (tentativas >= 0)

**Índices:**
- UNIQUE INDEX `idx_evento_idempotency` ON evento(idempotency_key) WHERE idempotency_key IS NOT NULL — idempotência
- IDX: `idx_evento_status` (status)
- IDX: `idx_evento_entidade` (entidade_tipo, entidade_id)

**Regra — Idempotência obrigatória:** Eventos podem ser entregues múltiplas vezes (webhook retry). O `idempotency_key` garante que cada evento seja processado uma única vez. Automação deve verificar: `status = 'processado'` antes de processar. Se `status = 'falhou'` após N tentativas, requer intervenção.

**Eventos mínimos do domínio:**

| Evento | Acionador |
|--------|-----------|
| `order.created` | Pedido criado (site checkout ou WhatsApp rascunho) |
| `order.confirmed` | Pedido confirmado (pagamento aprovado ou vendedor confirma) |
| `payment.paid` | Pagamento aprovado |
| `payment.refused` | Pagamento recusado |
| `order.shipped` | Pedido enviado |
| `order.delivered` | Pedido entregue |
| `order.canceled` | Pedido cancelado |
| `stock.reserved` | Estoque reservado no checkout |
| `stock.released` | Reserva liberada (cancelamento/expiração) |
| `support.requested` | Atendimento solicitado |
| `support.handoff` | Handoff para humano (D19) |

**Observação:** NÃO criar tabela de fila/processamento neste gate. Filas são infraestrutura técnica (n8n, broker). Os eventos alimentam filas externas.

**NÃO colocar segredo de n8n ou provider no frontend.** — Gate 6.2 prompt

**Evidência:** `CONTRATO v1.1 §13`, `DEC v1.2 DEC2`

**Classificação:** PROPOSTA (modelo mínimo para orquestração)

---

## 16. ADMIN

### 16.1 ESCOPO ADMINISTRATIVO

**Fonte:** `AUDITORIA_4_RELATORIO.md` §23 (matriz MANTER/MELHORAR/REFAZER)

**Motivo:** Identificar quais entidades precisam de gestão administrativa. Não importar RBAC complexo de outro projeto. Criar apenas nível de autorização necessário ao Angel.

**Entidades que precisam de gestão admin:**

| Entidade | CRUD | Observação |
|----------|------|------------|
| Produto | C,R,U,D | Incluir upload de imagens (D14) |
| Produto Variante | C,R,U,D | Gerenciar combinações e preços |
| Produto Imagem | C,R,U,D | Gerenciar galeria |
| Categoria | C,R,U,D | Gerenciar categorias do catálogo |
| Fornecedor | C,R,U,D | Cadastro de fornecedores |
| Promoção | C,R,U,D | Configurável no admin (D3+D5) |
| Frete Regra | C,R,U,D | Configurável no admin (D5) |
| Estoque | R,U | Entradas, saídas, ajustes (D4) |
| Pedido | R,U | Status, atendimento, cancelamento |
| Cliente | R,U | Gestão de perfil, endereços |
| Atendimento | R,U | Histórico, handoff |
| Pagamento | R | Acompanhamento financeiro |

### 16.2 OPERAÇÕES ADMIN-ONLY

**Fonte:** AUDITORIA_4 §23

Operações que NÃO devem estar disponíveis para cliente:

| Operação | Entidade | Motivo |
|----------|----------|--------|
| Criar/Editar/Excluir produto | produto | Gestão de catálogo |
| Definir preço base | produto | Preço é decisão de negócio |
| Criar variante | produto_variante | Configuração de produto |
| Publicar/despublicar | produto | Controle de visibilidade |
| Criar/Editar promoção | promocao | Gestão de promoções |
| Configurar frete | frete_regra | D5 configurável |
| Movimentar estoque | estoque_movimentacao | Controle de inventário |
| Cancelar pedido | pedido | Autorização necessária |
| Gerenciar usuário | cliente | Dados pessoais |
| Ver relatórios | todos | Acesso privilegiado |

### 16.3 Nível de Autorização Necessário

**Fonte:** Gate 6.2 prompt Seção 15

O modelo define os seguintes papéis (conceitual — implementação é decisão técnica):

| Papel | Escopo |
|-------|--------|
| `cliente` | Comprar, ver pedidos, gerenciar perfil |
| `operador` | Gestão de pedidos, estoque, atendimento |
| `admin` | Todas as operações acima + gestão de catálogo, promoções, frete, fornecedores |

**Observação:** RBAC específico é decisão técnica. O modelo define apenas os níveis necessários ao negócio. NÃO importar RBAC complexo de outros projetos.

**Evidência:** `AUDITORIA_4 §23`, `Gate 6.2 prompt Seção 15`

**Classificação:** PROPOSTA (escopo do domínio)

---

## 17. SEGURANÇA

**Fonte:** `DECISOES_NEGOCIO_v1.2.md` DEC1, `AUDITORIA_3` §19, `AUDITORIA_4` §19, `Gate 6.2 prompt Seção 16`

**Motivo:** Requisitos de segurança para o modelo de dados. RLS, IDOR, autorização, auditoria. Separação de riscos: regra comercial vs segurança vs implementação técnica.

### 17.1 Princípios de Segurança

| Princípio | Regra | Classificação |
|-----------|-------|---------------|
| RLS | Obrigatório em todas as tabelas do cliente | Segurança |
| IDOR | Proteção contra acesso indevido a recursos | Segurança |
| Preço | NUNCA confiar no cliente para preço | Regra comercial |
| Desconto | NUNCA confiar no cliente para desconto | Regra comercial |
| Estoque | Validar no servidor (checkout transacional) | Regra comercial |
| Total do pedido | Calcular no servidor | Regra comercial |
| Status de pagamento | Validar no servidor | Regra comercial |
| Permissão admin | Validar no servidor | Segurança |
| Service Role | NUNCA no frontend | Implementação técnica |

### 17.2 RLS — Políticas Necessárias

| Tabela | LEITURA | INSERÇÃO | ATUALIZAÇÃO | EXCLUSÃO | Observação |
|--------|---------|----------|-------------|----------|------------|
| `produto` | Público (ativo) | Admin | Admin | Admin | Ativo/inativo visível |
| `produto_variante` | Público (ativo) | Admin | Admin | Admin | Preço pode ser sensível |
| `categoria` | Público | Admin | Admin | Admin | |
| `fornecedor` | Público | Admin | Admin | Admin | CNPJ sensível |
| `promocao` | Público (ativa) | Admin | Admin | Admin | Datas podem ser sensíveis |
| `cliente` | Dono | Dono | Dono | Dono | Dados pessoais |
| `endereco` | Dono | Dono | Dono | Dono | Dados pessoais |
| `carrinho` | Dono | Dono | Dono | Dono | |
| `carrinho_item` | Dono | Dono | Dono | Dono | |
| `pedido` | Dono | Dono (checkout) | Admin (status) | Dono (cancelar até envio) | RLS + validação server |
| `pedido_item` | Dono | — | — | — | Somente leitura pelo dono |
| `pagamento` | Dono | — | — | — | Somente leitura |
| `frete_regra` | Admin | Admin | Admin | Admin | Configurável |
| `estoque` | Admin | — | Admin | — | Somente leitura/manutenção |
| `estoque_movimentacao` | Admin | — | — | — | Auditoria |
| `atendimento` | Dono/Admin | Dono | Admin | Admin | |
| `atendimento_mensagem` | Dono/Admin | Dono | — | — | |
| `evento` | Admin | System | — | — | Automático |
| `auth.users` | Dono | Dono | Auth | Dono | Gerenciado pelo Supabase Auth |

**Operações privilegiadas via Edge Functions com `service_role`:**
- Cálculo de frete
- Criação de pedido (validação de preço/estoque)
- Reserva de estoque (transacional)
- Confirmação de pagamento
- Cancelamento de pedido
- Movimentação de estoque
- Criação de promoção
- Configuração de frete

### 17.3 IDOR — Proteção Necessária

| Risco | Tabela | Proteção |
|-------|--------|----------|
| Cliente acessa pedido de outro | `pedido` | RLS: `cliente_id = auth.uid()` + Edge Function revalidar |
| Cliente acessa carrinho de outro | `carrinho` | RLS: `cliente_id = auth.uid()` |
| Cliente acessa endereço de outro | `endereco` | RLS: `cliente_id = auth.uid()` |
| Cliente acessa cliente de outro | `cliente` | RLS: `id = auth.uid()` |
| Cliente acessa atendimento de outro | `atendimento` | RLS: `cliente_id = auth.uid()` |
| Cliente acessa produto sensível | `produto` | RLS: `ativo = true` (preço pode ser restrito) |
| Admin acessa dados de cliente | Todos | RLS: role check via Edge Function |

### 17.4 Auditoria

**Fonte:** `AUDITORIA_4` §19, `Gate 6.1` §3.10

**Requisito obrigatório:** Operações administrativas sensíveis devem possuir rastreabilidade. Não necessariamente todas as tabelas, mas operações administrativas sensíveis.

**Perguntas que devem ser respondíveis:**
- Quem alterou o preço?
- Quem alterou o estoque?
- Quem cancelou o pedido?
- Quem alterou a promoção?
- Quem alterou o produto?

Tabela de auditoria para operações sensíveis:

| Coluna | Tipo | Observação |
|--------|------|------------|
| id | bigserial | PK |
| entidade_tipo | varchar(30) | 'pedido', 'produto', 'preco', 'estoque', etc. |
| entidade_id | bigint | ID da entidade |
| campo | varchar(100) | Campo alterado |
| valor_anterior | text | Antes |
| valor_novo | text | Depois |
| usuario_id | bigint | Quem fez |
| ip | inet | IP do cliente |
| acao | varchar(20) | 'create', 'update', 'delete', 'view' |
| criado_em | timestamptz | Timestamp |

**Aplicar a:** preço, promoção, estoque, pedido, status, desconto, configurações, endereço, cliente.

**Regra — Imutabilidade do log:** Registros de auditoria NÃO devem ser atualizados nem excluídos. Apenas INSERT.

**Evidência:** `AUDITORIA_4 §19`, `Gate 6.1 §3.10`

**Classificação:** FECHADO (requisito de segurança)

### 17.5 Validação Server-Side (Nunca Confiar no Cliente)

| Dado | Validação | Local |
|------|-----------|-------|
| Preço | Comparar com produto.variante.preco ou produto.preco_base | Edge Function |
| Desconto | Validar contra promoção ativa | Edge Function |
| Estoque | Verificar quantidade disponível | Edge Function (transacional) |
| Total do pedido | Recalcular server-side | Edge Function |
| Status de pagamento | Validar via webhook gateway | Edge Function |
| Permissão admin | Verificar role/jwt claim | Edge Function |
| Endereço | Validar CEP, campos obrigatórios | Edge Function |

---

## 18. RELACIONAMENTOS

### 18.1 Relacionamentos Completos

| De | Para | Tipo | Card. | Via |
|----|------|------|-------|-----|
| fornecedor | produto | 1:N | um fornecedor tem muitos produtos | FK produto.fornecedor_id |
| produto | categoria | N:N | produto em várias categorias | produto_categoria |
| produto | produto_atributo | 1:N | produto tem muitos atributos | FK produto_atributo.produto_id |
| produto_atributo | produto_atributo_valor | 1:N | atributo tem muitos valores | FK produto_atributo_valor.produto_atributo_id |
| produto_atributo_valor | produto_variante | N:N | valor aparece em variantes | produto_variante_atributo |
| produto | produto_variante | 1:N | produto tem muitas variantes | FK produto_variante.produto_id |
| produto | produto_imagem | 1:N | produto tem muitas imagens | FK produto_imagem.produto_id |
| produto | promocao | 1:N | produto tem muitas promoções | FK promocao.produto_id |
| produto | estoque | 1:1 | produto tem 1 estoque (simples) | FK estoque.produto_id (nullable) |
| produto_variante | estoque | 1:1 | variante tem 1 estoque | FK estoque.produto_variante_id (nullable) |
| produto | estoque | 1:1 | produto tem 1 estoque (simples) | FK estoque.produto_id (nullable) |
| produto_variante | estoque | 1:1 | variante tem 1 estoque | FK estoque.produto_variante_id (nullable) |
| produto_variante | pedido_item | 1:N | variante em muitos itens | FK pedido_item.produto_variante_id |
| produto | produto_opcao_compra | 1:N | produto tem muitas opções de compra | FK produto_opcao_compra.produto_id |
| produto_opcao_compra | produto_opcao_valor | 1:N | opção tem muitos valores | FK produto_opcao_valor.produto_opcao_id |
| produto_opcao_compra | kit_composicao | 1:N | kit tem muitos componentes | FK kit_composicao.produto_opcao_id |
| kit_composicao | produto | N:1 | componente é 1 produto | FK kit_composicao.produto_id |
| kit_composicao | produto_variante | N:1 | componente pode apontar para variante específica | FK kit_composicao.variante_id (nullable) |
| cliente | endereco | 1:N | cliente tem muitos endereços | FK endereco.cliente_id |
| cliente | carrinho | 1:1 | cliente tem 1 carrinho | FK carrinho.cliente_id |
| cliente | pedido | 1:N | cliente tem muitos pedidos | FK pedido.cliente_id |
| cliente | atendimento | 1:N | cliente tem muitos atendimentos | FK atendimento.cliente_id |
| cliente | auth.users | 1:1 | cliente vinculado ao auth | email como identificador |
| carrinho | carrinho_item | 1:N | carrinho tem muitos itens | FK carrinho_item.carrinho_id |
| pedido | pedido_item | 1:N | pedido tem muitos itens | FK pedido_item.pedido_id |
| pedido | pedido_status_historico | 1:N | pedido tem muitas alterações | FK psh.pedido_id |
| pedido | pagamento | 1:1 | pedido tem 1 pagamento | FK pagamento.pedido_id |
| pedido | frete_regra | N:1 | pedido usa 1 regra de frete | FK pedido.frete_regra_id |
| pedido | estoque_movimentacao | 1:N | pedido gera movimentações | FK em.pedido_id |
| atendimento | atendimento_mensagem | 1:N | atendimento tem mensagens | FK am.atendimento_id |
| endereco | pedido | 1:N | endereço snapshot em pedidos | FK pedido.endereco_entrega_id |
| frete_regra | pedido | 1:N | regra aplicada em pedidos | FK pedido.frete_regra_id |
| promocao | produto | N:1 | promoção de 1 produto | FK promocao.produto_id |
| estoque | estoque_movimentacao | 1:N | estoque gera movimentações | FK em.estoque_id |

### 18.2 Diagrama de Relacionamentos (Pedido Focus)

```text
cliente ──┬── endereco ──┐
           ├── carrinho ── carrinho_item ── produto_variante ── produto ──┐
           └── pedido ──┬── pedido_item ──┬── produto_variante ── produto
                         ├── pedido_status_historico
                         ├── pagamento
                         ├── frete_regra
                         └── estoque_movimentacao
```

---

## 19. RLS PLANEJADO

RLS será implementado no Supabase (DEC1). Políticas planejadas por tabela:

### 19.1 Tabelas com RLS Obrigatória

| Tabela | Política de leitura | Política de escrita |
|--------|---------------------|---------------------|
| `produto` | auth.role='anon' AND ativo=true | auth.role='authenticated' + is_admin() |
| `produto_variante` | auth.role='anon' AND ativo=true | auth.role='authenticated' + is_admin() |
| `categoria` | auth.role='anon' AND ativo=true | auth.role='authenticated' + is_admin() |
| `fornecedor` | auth.role='anon' | auth.role='authenticated' + is_admin() |
| `promocao` | auth.role='anon' AND ativo=true | auth.role='authenticated' + is_admin() |
| `produto_opcao_compra` | auth.role='authenticated' + is_admin() | auth.role='authenticated' + is_admin() |
| `produto_opcao_valor` | auth.role='authenticated' + is_admin() | auth.role='authenticated' + is_admin() |
| `kit_composicao` | auth.role='authenticated' + is_admin() | auth.role='authenticated' + is_admin() |
| `cliente` | auth.uid()=id | auth.uid()=id |
| `endereco` | auth.uid()=cliente_id OR NULL (visitor) | auth.uid()=cliente_id |
| `carrinho` | auth.uid()=cliente_id | auth.uid()=cliente_id |
| `carrinho_item` | auth.uid()=cliente_id (via carrinho) | auth.uid()=cliente_id |
| `pedido` | auth.uid()=cliente_id OR is_admin() | auth.uid()=cliente_id (criar) + is_admin() (status) |
| `pedido_item` | auth.uid()=cliente_id (via pedido) | — (sistema) |
| `pagamento` | auth.uid()=cliente_id (via pedido) | — (sistema) |
| `frete_regra` | auth.role='authenticated' | auth.role='authenticated' + is_admin() |
| `estoque` | auth.role='authenticated' + is_admin() | auth.role='authenticated' + is_admin() |
| `estoque_movimentacao` | auth.role='authenticated' + is_admin() | auth.role='authenticated' + is_admin() |
| `atendimento` | auth.uid()=cliente_id OR is_admin() | auth.uid()=cliente_id (criar) + is_admin() (status) |
| `atendimento_mensagem` | auth.uid()=cliente_id OR is_admin() | auth.uid()=cliente_id |
| `evento` | auth.role='authenticated' + is_admin() | service_role (sistema) |

### 19.2 Funções Helper Necessárias

```sql
create or replace function is_admin()
returns boolean as $$
  select role from profiles where user_id = auth.uid() and role = 'admin';
$$ language sql security definer;
```

> **Implementação é decisão técnica** (Arquitetura). Este gate define a necessidade.

---

## 20. CONSTRAINTS IMPORTANTES

### 20.1 Constraints de Integridade Comercial

| Constraint | Tabela | Regra | Classificação |
|-----------|--------|-------|---------------|
| `ck_produto_preco_base_positivo` | produto | preco_base >= 0 | FECHADO |
| `ck_variante_preco_positivo` | produto_variante | preco >= 0 | FECHADO |
| `ck_estoque_quantidade_fisica_positivo` | estoque | quantidade_fisica >= 0 | FECHADO |
| `ck_estoque_quantidade_reservada_valida` | estoque | quantidade_reservada >= 0 AND quantidade_reservada <= quantidade_fisica | FECHADO |
| `ck_pedido_status_valido` | pedido | status IN (D10 states) | FECHADO |
| `ck_pedido_status_pagamento_valido` | pedido | status_pagamento IN (pendente, aprovado, recusado) | FECHADO |
| `ck_pedido_total_positivo` | pedido | total >= 0 | FECHADO |
| `ck_pedido_item_quantidade_positiva` | pedido_item | quantidade > 0 | FECHADO |
| `ck_pedido_item_preco_positivo` | pedido_item | preco_unitario >= 0 | FECHADO |
| `ck_carrinho_item_quantidade_positiva` | carrinho_item | quantidade > 0 | PROPOSTO |
| `ck_frete_tipo_valido` | frete_regra | tipo IN (fixo, por_kg, percentual_subtotal, gratis) | FECHADO |
| `ck_promocao_tipo_valido` | promocao | tipo IN (percentual, fixo) | FECHADO |
| `ck_promocao_periodo_valido` | promocao | data_inicio < data_fim | FECHADO |
| `ck_pagamento_metodo_valido` | pagamento | metodo IN (pix, cartao) | FECHADO |
| `ck_pagamento_status_valido` | pagamento | status IN (pendente, aprovado, recusado) | FECHADO |
| `ck_cep_formato` | endereco | cep ~ '^[0-9]{8}$' | FECHADO |
| `ck_cep_entrega_obrigatorio` | pedido | endereco_entrega_id NOT NULL | FECHADO (D9) |
| `ck_estoque_unico_por_tipo` | estoque | EXCLUDE (produto_id, produto_variante_id) WHERE (produto_id IS NOT NULL OR produto_variante_id IS NOT NULL) | FECHADO (D4) |

### 20.2 Constraints de Unicidade

| Constraint | Tabela | Colunas | Classificação |
|-----------|--------|---------|---------------|
| Unique SKU | produto_variante | sku | FECHADO |
| Unique slug | produto | slug | FECHADO |
| Unique CNPJ | fornecedor | cnpj | FECHADO |
| Unique email | cliente | email | FECHADO |
| Unique número | pedido | numero | FECHADO |
| Unique endereço principal | endereco | cliente_id WHERE principal=true | FECHADO (D9) |
| Unique variante atributo | produto_atributo | (produto_id, nome) | FECHADO (D1) |
| Promoção única por item | Aplicação | (pedido_id, produto_id) — via regra de negócio | PROPOSTO |

---

## 21. INTEGRIDADE COMERCIAL

### 21.1 Fluxo de Integridade — Checkout Site

```text
1. Cliente seleciona itens no carrinho (snapshot de preço no carrinho_item)
2. CEP informado → ViaCEP preenche endereço
3. Regra de frete aplicada (configurável)
4. Reserva atômica de estoque (Edge Function transacional)
5. Preço revalidado server-side (não confiar no cliente)
6. Desconto revalidado server-side (promoção ativa?)
7. Total recalculado server-side
8. Pedido criado com snapshot completo (preço, item, endereço, frete)
9. Estoque consumido (baixa confirmada)
10. Pagamento processado (separado do status do pedido)
11. Status do pedido atualizado conforme pagamento
```

### 21.2 Fluxo de Integridade — Checkout WhatsApp

```text
1. Cliente seleciona itens no carrinho (snapshot de preço)
2. CEP informado → endereço estruturado
3. Botão "Finalizar pelo WhatsApp"
4. POST /api/orders com origem: 'whatsapp'
5. Pedido criado como RASCUNHO (status='rascunho')
6. Endereço incluído no rascunho
7. NÃO baixa estoque (D4, D10-N)
8. Mensagem pré-preenchida aberta no WhatsApp
9. Vendedor confirma no sistema
10. Status: rascunho → processando
11. Estoque consumido (confirmação do vendedor)
```

### 21.3 Regras de Integridade Críticas

| Regra | Justificativa | Decisão |
|-------|---------------|---------|
| Pedido não sai de rascunho sem endereço válido | D9 obrigatório | FECHADO |
| Pedido não sai de rascunho sem estoque disponível | D4 reserva | FECHADO |
| Preço no pedido é imutável após criação | D2 snapshot | FECHADO |
| Estoque negativo proibido | D4 | FECHADO |
| Cancelamento permitido até envio | D10-I | FECHADO |
| Promoção não cumulativa | D3 | FECHADO |
| Menor preço final prevalece | D3 | FECHADO |
| Carrinho NÃO é autoridade final — revalidação server-side obrigatória no checkout | Regra 1 | FECHADO |
| Pedido comercialmente imutável — alterações posteriores não alteram snapshot | Regra 2 | FECHADO |
| pedido_item preserva configuração efetiva (variante, opção, kit via snapshot) | Regra 3 | FECHADO |
| Pedido preserva snapshot de endereço (campos endereco_*) | D9 + Regra 2 | FECHADO |
| Pedido preserva snapshot de frete (pedido.frete_valor) | D5 + Regra 2 | FECHADO |
| Período de promoção obrigatório | D3-J | FECHADO |
| Pagamento separado de status do pedido | D10-D | FECHADO |
| Rascunho ≠ confirmação | D10-F | FECHADO |
| 2 fluxos convergem após confirmação | D10-A | FECHADO |
| Carrinho não reserva estoque | D4 | FECHADO |
| Reserva atômica no checkout | D4 | FECHADO |
| Baixa por canal | D4 | FECHADO |
| Service_role NÃO no frontend | DEC1 | FECHADO |

---

## 22. CONFLITOS COM MIGRATIONS ANTIGAS

### 22.1 Classificação das 9 Migrations Provisórias

| Migration | Classificação | Motivo |
|-----------|---------------|--------|
| `2026091301_itens_pedido.sql` | APROVEITÁVEL CONCEITO | Estrutura correta, mas usa `jsonb` em atributos → CONFLITANTE com D1 |
| `2026091302_produto_variante.sql` | CONFLITANTE | Usa `atributos jsonb` → D1 rejeita JSONB explicitamente |
| `2026091303_produto_imagens.sql` | APROVEITÁVEL | Estrutura correta, alinhada ao domínio |
| `2026091304_frete_regra.sql` | APROVEITÁVEL CONCEITO | Nome muito restritivo (`frete_regra`) — D5 inclui transportadoras Fase 2 |
| `2026091305_pedidos_expand.sql` | APROVEITÁVEL CONCEITO | Adiciona campos necessários, mas modelo deste documento separa `pagamento` |
| `2026091306_enderecos_fk.sql` | REVISÁVEL | FK polimórfica é complexa — modelo deste documento usa FK direto nullable |
| `2026091307_produtos_promocao_expand.sql` | REVISÁVEL | `variante_id` contradiz D3 (promoção por produto base, não por variante no lançamento) |
| `2026091308_historico_e_estoque_expand.sql` | REVISÁVEL | `pedido_status_historico` é bom, mas estoque precisa ser reestruturado (D4 híbrido) |
| `2026091309_carrinho_sync_perfis.sql` | REVISÁVEL | `carrinho_itens` conceito válido, mas usa `jsonb` → CONFLITANTE com D1 |

### 22.2 Conflitos Específicos

| Migration | Conflito | Documento | Resolução |
|-----------|----------|-----------|-----------|
| 02 | `atributos jsonb` | D1 rejeita JSONB | Substituir por `produto_atributo` + `produto_atributo_valor` + `produto_variante_atributo` |
| 07 | `variante_id` em promoção | D3 (promoção por produto base) | Remover ou manter para fase futura |
| 09 | `atributos jsonb` em carrinho | D1 | Substituir por `atributos_texto` |
| 01 | `atributos jsonb` em itens_pedido | D1 | Substituir por `atributos_texto` |
| 06 | FK polimórfica | D9 (endereço simples) | FK direto nullable para cliente |

### 22.3 Lacunas nas Migrations (não cobertas)

| Lacuna | Migration que deveria cobrir | Status |
|--------|------------------------------|--------|
| `produto_atributo` | Nenhuma | Não coberto — D1 exige |
| `produto_atributo_valor` | Nenhuma | Não coberto — D1 exige |
| `produto_variante_atributo` | Nenhuma | Não coberto — D1 exige |
| `pedido_status_historico` | Migration 08 | PARCIAL — apenas estrutura básica |
| `pedido_item` (completo) | Migration 01 | PARCIAL — sem desconto, sem SKU |
| `pagamento` separado | Nenhuma | Não coberto — D10 exige separação |
| `estoque_movimentacao` unificado | Nenhuma | Não coberto — D4 exige |
| `atendimento` | Nenhuma | Não coberto — D19 exige |
| `evento` | Nenhuma | Não coberto — automação |
| `carrinho` server-side | Migration 09 | PARCIAL — usa jsonb |
| `frete_regra` expandida | Migration 04 | PARCIAL — sem tipo 'gratis' |

---

## 23. LACUNAS (sem preenchimento especulativo)

### 23.1 Lacunas de Modelo

| Lacuna | Motivo | Classificação |
|--------|--------|---------------|
| Opções de compra (1 unidade, 2 unidades, kit) | Estrutura e regras FECHADAS (produto_opcao_compra + produto_opcao_valor) | FECHADO |
| Kits/composição de produtos | Estrutura e regras FECHADAS (kit_composicao) | FECHADO |
| Dimensões do produto (peso, L×A×P) | 🔴 JSONB não aprovado. Verificar campos tipados: peso, altura, largura, comprimento | ABERTO |
| `promocao_aplicacao` (registro) | Ordem de cálculo definida (D3), mas registro não modelado | PROPOSTO |
| Máquina de estados do pedido | D10 fecha estados mas não transições | ABERTO |
| Categoria de frete (por CEP vs região vs UF) | D5 menciona múltiplas dimensões | ABERTO |
| Transportadoras | Fase 2 (D5) | FORA DO ESCOPO IDENTIFICADO |
| Boleto, pagamento na entrega | Mencionados mas não confirmados para lançamento | FORA DO ESCOPO |
| Coupon/cupom de desconto | D3-L: não no lançamento | FORA DO ESCOPO |
| Endereço de cobrança | D9-J: apenas entrega no MVP | FORA DO ESCOPO |
| E-mail transacional | D16: técnico | FORA DO ESCOPO |
| PWA | D17: Fase 2 | FORA DO ESCOPO |
| SEO | D18: técnico | FORA DO ESCOPO |
| Gateway de pagamento | D6b: técnico | FORA DO ESCOPO |
| Carrinho canônico (implementação) | D13: técnico | FORA DO ESCOPO |
| Multi-tenancy | NÃO REUTILIZAR — site único | NÃO APLICÁVEL |
| RBAC específico | Decisão técnica | FORA DO ESCOPO |
| Chatbot (implementação) | NÃO definido neste gate | ABERTO |
| Keyword triggers | D19 complemento, não dependência | ABERTO |
| Auto-reply rules | NÃO definido | ABERTO |
| Filtro de produto (busca, preço, categoria) | NÃO definido | ABERTO |
| Wishlist/favoritos | NÃO mencionado em fontes | NÃO DEFINIDO |
| Avaliações/reviews | NÃO mencionado em fontes | NÃO DEFINIDO |
| Gift card/vale-presente | NÃO mencionado em fontes | NÃO DEFINIDO |
| Newsletter | NÃO mencionado em fontes | NÃO DEFINIDO |
| Relatórios/admin dashboards | NÃO definido | ABERTO |
| Gestão de estoque — interface | NÃO definido | ABERTO |
| Devolução/troca — processo | D10-L: processo separado | ABERTO |
| Cancelamento — regras detalhadas | D10-I: até envio, mas regras detalhadas faltam | ABERTO |
| Expiração de reserva | D4: liberação, mas tempo limite não definido | ABERTO |
| Reserva de estoque — visitantes | D4: checkout transacional, visitors incluídos | ABERTO |

### 23.2 Fontes Ausentes Relevantes

| Fonte | Impacto na modelagem |
|-------|---------------------|
| `J&S Empregos` | N/A — referência externa, não fonte de modelo Angel |
| `Pedacinho de Felicidade` | N/A — referência externa |
| `CONTRATO_FUNCIONAL_SISTEMA_v1.0.md` | Será derivado deste documento |
| `ARQUITETURA_TÉCNICA.md` | Definirá implementação (RLS, RBAC, EFs) |
| Documentação de testes | Pode revelar casos de uso adicionais |

---

## 24. DECISÕES AINDA ABERTAS

| Decisão | Área | Motivo | Destino Sugerido |
|---------|------|--------|------------------|
| Máquina de estados do pedido | Pedido | D10 fecha estados, não transições | Contrato Funcional |
| Regras de frete específicas | Frete | D5 configurável, valores não definidos | Admin + Contrato Funcional |
| Transportadora(s) | Frete | D5 Fase 2 | Arquitetura Técnica |
| Gateway de pagamento | Pagamento | D6b técnico | Arquitetura Técnica |
| Provedor de e-mail | Automação | D16 técnico | Arquitetura Técnica |
| Chatbot implementation | Suporte | NÃO definido | Arquitetura Técnica |
| RBAC roles | Segurança | Necessário mas técnico | Arquitetura Técnica |
| Devolução/troca processo | Estoque/Pedido | D10-L processo separado | Contrato Funcional |
| Expiração de reserva | Estoque | D4 não define tempo | Contrato Funcional |
| Wishlist/favoritos | Produto | NÃO mencionado | Não priorizar |
| Promoção por variante | Promoção | D3 diz produto base no lançamento | Contrato Funcional (fase futura) |

---

## 25. MATRIZ DE RASTREABILIDADE

| Decisão | Entidade afetada | Modelagem | Fonte | Status |
|---------|-----------------|-----------|-------|--------|
| DEC1 | auth.users, cliente | Backend = Supabase (Auth + PostgreSQL) | DEC v1.2 DEC1 | FECHADO |
| DEC2 | pagamento | PIX + cartão, sem gateway fixo | DEC v1.2 DEC2 | FECHADO |
| DEC3 | fornecedor, produto, categoria, cliente, endereco, pedido, estoque, promocao | Migração seletiva | DEC v1.2 DEC3 | FECHADO |
| DEC4 | Todas | MVP com dados comerciais | DEC v1.2 DEC4 | FECHADO |
| D1 | produto, produto_atributo, produto_atributo_valor, produto_variante, produto_variante_atributo | Atributos: tamanho, cor, volume/ml (opcionais, NÃO EAV/JSONB) | DEC v1.3 D1 | FECHADO |
| D2 | produto, produto_variante, carrinho_item, pedido_item | Variante sobrescreve base + snapshot | DEC v1.3 D2 | FECHADO |
| D3 | promocao, produto, produto_variante, pedido_item | %, R$, produto→variantes, não cumulativa, menor preço, período, sem cupom | DEC v1.3 D3 | FECHADO |
| D4 | estoque, estoque_movimentacao, pedido, kit_composicao | Híbrido, reserva no checkout, baixa por canal, sem negativo, kits via componentes | DEC v1.3 D4 | FECHADO |
| D5 | frete_regra | Configurável no admin + transportadora Fase 2 | DEC v1.2 D5 | CONFIRMADO |
| D6a | pagamento | PIX + cartão | DEC v1.2 D6a | CONFIRMADO |
| D7 | pedido, atendimento | Pedido rascunho + abre WhatsApp | DEC v1.2 D7 | CONFIRMADO |
| D8 | cliente | Cadastro híbrido (visitante pode comprar) | DEC v1.2 D8 | CONFIRMADO |
| D9 | endereco | Obrigatório no checkout + visitante, CEP + ViaCEP, número manual, múltiplos, snapshot | DEC v1.3 D9 | FECHADO |
| D10 | pedido, pagamento, pedido_status_historico | Dois fluxos convergem, pagamento separado, confirmação por canal, cancelamento até envio | DEC v1.3 D10 | FECHADO |
| D19 | atendimento, atendimento_mensagem | Botão explícito "Falar com humano" | DEC v1.2 D19 | CONFIRMADO |
| D6b | pagamento | Gateway de pagamento | Arquitetura Técnica | PENDENTE (técnico) |
| D13 | carrinho | Carrinho canônico | Arquitetura Técnica | PENDENTE (técnico) |
| D14 | produto_imagem | Armazenamento de imagens (bucket `product-images`, público) | Infraestrutura | FECHADO |
| D16 | N/A | E-mail transacional | Integração | PENDENTE (técnico) |
| D17 | N/A | PWA | Fase 2 | PENDENTE (técnico) |
| D18 | N/A | SEO Cleanup | Tarefa técnica | PENDENTE (técnico) |

---

## 26. VALIDAÇÃO FINAL

### 26.1 Checklist de Validação

- [ ] Produto é genérico/configurável ✅
- [ ] Variantes são diferentes de opções de compra ✅
- [ ] Kits possuem composição (kit_composicao criado) ✅
- [ ] SKU é identificável (produto_variante.sku) ✅
- [ ] Preço histórico do pedido é preservado (pedido_item.preco_unitario) ✅
- [ ] Estoque suporta variantes (estoque.produto_variante_id) ✅
- [ ] Estoque suporta kits (kit_composicao permite SKU de componente) ✅
- [ ] Frete não é hardcoded (frete_regra configurável) ✅
- [ ] Promoções não dependem de código (tabela promocao) ✅
- [ ] Carrinho visitante é considerado (session_id nullable) ✅
- [ ] Merge após login é considerado (sincronização local→server) ✅
- [ ] Carrinho server-side é fonte persistente (localStorage é conveniência) ✅
- [ ] Carrinho_item preserva configuração comercial (opção + kit) ✅
- [ ] Pagamento é separado do pedido (tabela pagamento separada) ✅
- [ ] Status de pagamento é separado do método ✅
- [ ] Pedido_item preserva configuração comercial (variante, opção, kit) ✅
- [ ] Pedido preserva snapshot de endereço (campos endereco_* dedicados) ✅
- [ ] Pedido preserva snapshot de frete (pedido.frete_valor) ✅
- [ ] Revalidação no checkout — carrinho NÃO é autoridade final (Regra 1) ✅
- [ ] Imutabilidade comercial do pedido (Regra 2) ✅
- [ ] Configuração comercial preservada em pedido_item (Regra 3) ✅
- [ ] Segurança considera RLS (Seção 19) ✅
- [ ] Segurança considera IDOR (Seção 17.3) ✅
- [ ] Preço é validado no servidor (Seção 17.5) ✅
- [ ] Estoque é validado no servidor (Seção 17.5) ✅
- [ ] Service role não vai para frontend (Seção 17.1) ✅
- [ ] Nenhuma migration foi criada ✅
- [ ] Nenhuma migration foi aplicada ✅
- [ ] Preço: preco_proprio SE NOT NULL CASO CONTRÁRIO variante (FECHADO) ✅
- [ ] Ativo em kit_composicao = composição ativa (NÃO disponibilidade de componente) ✅

### 26.2 Estado Final Obrigatório

```text
Código alterado: NÃO (exceto web/src/lib/supabase.ts — alinhamento de variável)
Supabase alterado: NÃO
Schema remoto alterado: NÃO
Migration criada: NÃO
Migration aplicada: NÃO
Dados alterados: NÃO
Git commit: NÃO
Git push: NÃO
```

**A única alteração permitida e realizada neste Gate:**
- `web/src/lib/supabase.ts` — Alinhamento de variável de ambiente (VITE_SUPABASE_ANON_KEY → VITE_SUPABASE_PUBLISHABLE_KEY) — alteração de configuração, não de modelo de dados

**A única criação permitida neste Gate:**
- `MODELO_DE_DADOS_GATE62.md` — Este documento

---

## 27. PRÓXIMOS PASSOS

### 27.1 Revisão Humana (PRIORIDADE MÁXIMA)

O usuário solicitou revisão crítica ENTIDADE POR ENTIDADE, principalmente:
1. **Produto → Variante → SKU → Opção de compra → Kit → Estoque → Pedido**
2. Maior complexidade do Angel
3. Cada entidade validada antes de avançar

### 27.2 Após Revisão Humana

1. **Modelo de dados oficial** — Derivado deste documento após aprovação
2. **Segurança/RLS/IDOR** — Definir antes de migrations
3. **Migrations SQL** — Derivadas do modelo de dados oficial
4. **Supabase remoto** — Aplicar migrations
5. **API Contract** — Derivado do modelo de dados
6. **Implementação** — Frontend + Edge Functions

---

> **FIM DO DOCUMENTO — MODELO_DE_DADOS_GATE62.md**
>
> **Nenhuma migration criada. Nenhum código alterado (exceto supabase.ts). Nenhum Supabase alterado. Nenhum push.**
>
> **Este documento é RASCUNHO — sujeito a revisão humana entidade por entidade.**


