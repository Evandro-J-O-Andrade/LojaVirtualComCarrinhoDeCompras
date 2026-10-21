# AUDITORIA 3 — DOMAIN CONTRACT (v1.0)
**Projeto:** Angel Cosméticos — Legacy E-commerce (HTML/CSS/JS + PHP/MySQL + Node.js Chat)
**Branch:** `main` (clean working tree) | **Produção:** https://angelcosmeticos.netlify.app/
**Data:** 2026-09-13

---

## 1. DECISÃO DE MODELO DE PRODUTO: **C — MISTO** ✅ CONFIRMADO
> **Base:** `assets/sql/angelcosmeticos_produtos.sql:25-35` + `assets/js/verprodutos.js:3-80`

| Aspecto | Banco (Real) | Frontend (Mock) | Decisão Contratual |
|---------|--------------|-----------------|-------------------|
| Tabela `produtos` | `id, nome_produto, preco (único), descricao, fornecedor_id` | — | **Produto base = preço único** |
| Tabela `estoque` | `produto_id, quantidade` (1:1) | — | **Estoque por produto base** |
| Variantes (tamanho/cor) | **NÃO EXISTEM no banco** | `verprodutos.js`: `precos: {P:450, M:500, G:550, GG:600, XG:650}` + `<select name="Tamanho">` | **Variante = atributo opcional no carrinho (SKU virtual)** |
| `produtos_categoria` | N:N (`produto_id`, `categoria_id`) | — | **Categorias N:N mantidas** |
| `produtos_promocao` | 1:N (`produto_id`, `desconto`, `data_inicio/fim`) | `produtos.js`: `promocao: true/false` | **Promoção por produto base** |

**Regra de negócio:** Produto simples = preço único + estoque único. Produto com variante = mesmo `produto_id` + atributo `tamanho` (ou `cor`, `volume` no futuro) com **preço próprio** no carrinho. **Não há SKU separado no banco.**

---

## 2. ENTIDADES DO CONTRATO (com evidências)

### 2.1 Product
```typescript
interface Product {
  id: number;                    // PK auto_increment [produtos.sql:26]
  nome: string;                  // nome_produto varchar(255) [produtos.sql:27]
  precoBase: number;             // preco decimal(10,2) [produtos.sql:28]
  descricao?: string;            // text [produtos.sql:29]
  fornecedorId: number;          // FK fornecedores [produtos.sql:30,34]
  categorias: number[];          // N:N via produtos_categoria [produtos_categoria.sql:25-31]
  promocaoAtiva?: Promotion;     // 1:N via produtos_promocao [produtos_promocao.sql:25-33]
  estoque: number;               // 1:1 via estoque.quantidade [estoque.sql:25-32]
  imagens: string[];             // Apenas frontend (verprodutos.js:14-20)
}
```

### 2.2 ProductVariant (Virtual — apenas carrinho/checkout)
```typescript
interface ProductVariant {
  produtoId: number;             // FK → produtos.id
  atributo: 'tamanho' | 'cor' | 'volume'; // Hoje só 'tamanho' [verprodutos.js:102-107]
  valor: string;                 // 'P' | 'M' | 'G' | 'GG' | 'XG'
  preco: number;                 // Preço específico da variante (sobrescreve precoBase)
  // SKU virtual = `${produtoId}:${atributo}:${valor}`
}
```
> **Evidência:** Único local com variante = `verprodutos.js:6-12, 102-107, 133-135, 150-158`. Banco **não** tem tabela `produto_variante`.

### 2.3 Category
```typescript
interface Category {
  id: number;                    // PK [categorias_produtos.sql:26]
  nome: string;                  // nome_categoria varchar(255) [categorias_produtos.sql:27]
  produtos: number[];            // N:N via produtos_categoria
}
```

### 2.4 Promotion
```typescript
interface Promotion {
  id: number;                    // PK [produtos_promocao.sql:26]
  produtoId: number;             // FK [produtos_promocao.sql:27]
  descontoPercent: number;       // desconto decimal(5,2) [produtos_promocao.sql:28]
  dataInicio: Date;              // date [produtos_promocao.sql:29]
  dataFim: Date;                 // date [produtos_promocao.sql:30]
  ativo: boolean;                // Computado: now() BETWEEN dataInicio AND dataFim
}
```

### 2.5 Price (Resolução em tempo de execução)
```typescript
function resolvePrice(product: Product, variant?: ProductVariant): number {
  if (variant?.preco != null) return variant.preco;
  if (product.promocaoAtiva) return product.precoBase * (1 - product.promocaoAtiva.descontoPercent / 100);
  return product.precoBase;
}
```

### 2.6 Stock
```typescript
interface Stock {
  produtoId: number;             // FK único [estoque.sql:27]
  quantidade: number;            // quantidade int default 0 [estoque.sql:28]
  // Regras:
  // - Reserva no "adicionar ao carrinho"? NÃO (apenas no checkout real)
  // - Baixa no "finalizar compra"? SIM (via saida_estoque.php)
  // - Variante consome estoque do produto base (sem estoque por variante)
}
```

### 2.7 Cart (7 implementações conflitantes → **UNIFICAR**)
| Arquivo | Storage | Chave de dedup | Variante | Backend |
|---------|---------|----------------|----------|---------|
| `icon-carrinho.js` | localStorage `carrinho` | `id` | ❌ | ❌ |
| `produtos.js:90-118` | localStorage `carrinho` | `id` | ❌ | ❌ |
| `verprodutos.js:150-171` | localStorage `carrinho` | `id + tamanho` | ✅ `tamanho` | ❌ |
| `carrinho_adicionar_produto.js` | **PHP Session** (adicionar_produto.php) | `produto_id` | ❌ | ✅ |
| `carrinho_evento_adicionar_produto.js` | localStorage `carrinho` | `nome` (BUG) | ✅ `tamanho` | ❌ |
| `carrinhopoduto.js` | localStorage `carrinho` | `id` (usa index p/ remover) | ❌ | ❌ |
| `carrinhoProdutoCategoria.js` | Stub (`console.log`) | — | ❌ | ❌ |

**Contrato unificado (localStorage-first, sync posterior):**
```typescript
interface CartItem {
  sku: string;                   // `${produtoId}` ou `${produtoId}:tamanho:${valor}`
  produtoId: number;
  nome: string;
  precoUnitario: number;         // Preço resolvido no momento da adição
  quantidade: number;
  variante?: ProductVariant;     // Opcional
  imagem?: string;
  total: number;                 // precoUnitario * quantidade
}
```

### 2.8 Customer
```typescript
interface Customer {
  id: number;                    // PK [usuarios.sql / usuarios_completo.sql]
  nome: string;
  email: string;                 // UNIQUE
  senhaHash: string;
  telefone?: string;
  cpf?: string;
  dataNascimento?: Date;
  enderecos: Address[];          // 1:N via enderecos.entidade_id (tipo='Usuario')
}
```

### 2.9 Address
```typescript
interface Address {
  id: number;                    // PK [enderecos.sql:26]
  tipo: 'Usuario' | 'Fornecedor'; // enum [enderecos.sql:27]
  entidadeId: number;            // FK polimórfica → usuarios.id OU fornecedores.id
  logradouro: string;
  numero?: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;                // UF 2 letras
  cep: string;                   // 8 dígitos
  // ⚠️ INCONSISTÊNCIA: FK aponta só para usuarios [enderecos.sql:40]
  // Correção: FK polimórfica ou tabela separada enderecos_usuario / enderecos_fornecedor
}
```

### 2.10 Order
```typescript
interface Order {
  id: number;                    // PK [pedidos.sql:26]
  usuarioId: number;             // FK usuarios [pedidos.sql:27,32]
  dataPedido: Date;              // timestamp default now() [pedidos.sql:28]
  status: 'Em processamento' | 'Enviado' | 'Entregue' | 'Cancelado'; // [pedidos.sql:29]
  enderecoEntregaId: number;     // FK enderecos (NOVO - não existe hoje)
  frete: number;
  subtotal: number;
  total: number;
  itens: OrderItem[];            // **TABELA itens_pedido NÃO EXISTE** ⚠️
}
```

### 2.11 OrderItem
```typescript
interface OrderItem {
  id: number;
  pedidoId: number;              // FK pedidos
  produtoId: number;             // FK produtos
  variante?: ProductVariant;     // JSON ou colunas separadas (tamanho, cor, volume)
  quantidade: number;
  precoUnitario: number;         // Preço no momento da compra (snapshot)
  total: number;
}
```
> **Gap crítico:** Tabela `itens_pedido` **não existe** no schema SQL. `historico_compras` duplica pedido sem status/endereço/frete.

### 2.12 Checkout — Site (3 implementações com regras de frete diferentes)
| Arquivo | Frete Grátis | Regiões (ViaCEP) | PDF | Nota Fiscal |
|---------|--------------|------------------|-----|-------------|
| `carrinho.js` | R$ 360 | SP/RJ=30, Sul=50, Outros=70 | ✅ jsPDF | ✅ (botão) |
| `carrinhoriginal.js` | R$ 360 | **Não implementado** (auto grátis) | ✅ jsPDF | ✅ |
| `finalizarcompra.js` | R$ 300 | SP/RJ=20, Sul=30, Outros=50 | ✅ jsPDF (autoTable) | ✅ |
| `listaDeProduto.js` | R$ 360 | SP/RJ=30, Sul=50, Outros=70 | ❌ | ❌ |

**Contrato unificado:**
- Frete grátis: **R$ 300** (menor valor = mais generoso)
- Tabela ViaCEP: **SP/RJ=20, Sul=30, Outros=50** (valores de `finalizarcompra.js`)
- CEP obrigatório antes de finalizar
- PDF = resumo (não nota fiscal fiscalmente válida)
- **Checkout só simula** (alert + PDF) — não persiste pedido no banco

### 2.13 Checkout — WhatsApp
```typescript
// assets/html/carrinho.html + pdf.html + js/chatbot.js
// Gera mensagem formatada com itens, total, endereço → abre wa.me/5511963205776
// Não cria pedido no banco, não baixa estoque, não registra histórico
```

---

## 3. GAPS & BLOQUEIROS PARA MODERNIZAÇÃO

| # | Item | Impacto | Ação Requerida |
|---|------|---------|----------------|
| 1 | Tabela `itens_pedido` inexistente | Impossível persistir pedido real | **Criar migration** antes de qualquer backend novo |
| 2 | `enderecos` FK polimórfica quebrada | Fornecedor não pode ter endereço | Ajustar schema (tabela separada ou FK condicional) |
| 3 | 7 carts conflitantes | Dados inconsistentes entre páginas | **Eleger `icon-carrinho.js` como API canônica** + migrar todas páginas |
| 4 | Variante só no frontend | Preço/tamanho não persistem no banco | Definir: variante = atributo de carrinho (SKU virtual) ou criar tabela `produto_variante` |
| 5 | Checkout só simula | Zero pedidos reais no banco | Implementar `POST /api/orders` com transação (pedido + itens + baixa estoque + histórico) |
| 6 | `historico_compras` duplicado | Duplicação de dados | Decidir: manter como log imutável ou remover em favor de `itens_pedido` |
| 7 | Promoção: `desconto` decimal(5,2) | Ambíguo: % ou valor absoluto? | Padronizar como **percentual** (0-100) |
| 8 | Imagens de produto | Só no frontend (hardcoded) | Criar tabela `produto_imagens` (1:N) |
| 9 | Chat middleware order bug | `cors()` e `express.json()` **depois** das rotas [server.js:19-22] | Mover middleware para antes das rotas |

---

## 4. PRODUÇÃO URLs (generate-sitemap.js)
```
/
/assets/html/produtos.html
/assets/html/ver-produtos.html   ← Página de detalhe (candidata a recovery)
/assets/html/carrinho.html
/assets/html/conta.html
/assets/html/contato.html
/assets/html/empresa.html
/assets/html/eventos.html
/assets/html/fornecedores.html
/assets/html/completarCadastro.html
/assets/html/pdf.html
```

---

## 5. PRÓXIMOS PASSOS (Sem código, só decisão)

1. **Aprovar este Domain Contract** como "Contrato v1.0"
2. **Definir atributos de variante** além de `tamanho`: `cor`, `volume`, `voltagem`, etc. (input de negócio)
3. **Escolher backend alvo:** Supabase (PostgreSQL + Auth + Realtime) vs Node/Express + PostgreSQL vs manter PHP
4. **Criar migration SQL** para `itens_pedido` + correção `enderecos` + `produto_imagens` + `produto_variante` (se decisão for tabela real)
5. **Especificar API Contract** (OpenAPI) para: Products, Cart, Checkout, Orders, Customers, Addresses, Chat
6. **Só então** iniciar setup React/Vite/TypeScript

---

## 6. ARQUIVOS-CHAVE PARA RECUPERAÇÃO/REFATORAÇÃO
| Arquivo | Papel |
|---------|-------|
| `assets/sql/*.sql` (16 tabelas + 5 views) | **Schema canônico** — fonte da verdade |
| `assets/js/verprodutos.js` | Único com variante + preço por tamanho |
| `assets/js/icon-carrinho.js` | API de carrinho mais limpa (ler/salvar/atualizar ícone) |
| `assets/html/ver-produtos.html` | Página de detalhe de produto (template para React) |
| `chat/server.js` + `chat/chat.js` | Backend chat ativo (Render + OpenRouter) |
| `generate-sitemap.js` | Lista URLs de produção |

---

**Assinatura técnica:** _________________ **Data:** _________
**Aprovação negócio (variantes/preços/frete):** _________________ **Data:** _________