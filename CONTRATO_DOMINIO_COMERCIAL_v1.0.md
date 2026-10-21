# CONTRATO DO DOMÍNIO COMERCIAL v1.0 — Angel Cosméticos
**Base:** Auditorias 1, 2, 3 + Workshop de Decisões de Negócio (10 decisões fechadas)
**Data:** 2026-09-13 | **Versão:** 1.0 | **Status:** Aprovado para arquitetura/implementação

---

## 1. MODELO DE PRODUTO (Decisões 1, 2)

```
Produto
├── Simples (sem variantes)
│   ├── preco_base (decimal)
│   ├── estoque no produto (quantidade total)
│   └── SKU = produto_id
│
└── Com Variantes (opcional)
    ├── atributos livres/dinâmicos (tamanho, cor, volume/ml, fragrância, voltagem, acabamento...)
    ├── cada combinação = uma Variante (SKU virtual = produto_id + atributos)
    ├── preco próprio por variante (obrigatório)
    ├── estoque por variante (cada SKU tem quantidade própria)
    └── herda promoção do produto base (não há promoção por variante)
```

**Regras:**
- Produto **pode** ter variantes (não é obrigatório)
- Variante **sempre** tem preço próprio (pode ser igual ao base)
- Estoque: híbrido — simples no produto, com variante no SKU
- Atributos: modelo flexível (EAV ou JSONB), não fixos

---

## 2. CATÁLOGO & PREÇO

### 2.1 Entidades
| Entidade | Campos-chave | Regras |
|----------|--------------|--------|
| **Produto** | id, nome, preco_base, descricao, fornecedor_id, ativo, criado_em | PK id; preco_base = fallback |
| **ProdutoVariante** | id, produto_id, atributos (JSONB), preco, ativo, criado_em | PK id; UNIQUE(produto_id, atributos); preco obrigatório |
| **Categoria** | id, nome, ativo | N:N via produto_categoria |
| **Promocao** | id, produto_id, tipo_desconto (percentual/fixo), valor_desconto, data_inicio, data_fim, ativo | Aplica ao produto base; herda para variantes; não há promoção por variante |
| **Imagem** | id, produto_id, url, ordem, principal | 1:N; tabela nova |

### 2.2 Resolução de Preço (função pura)
```typescript
function resolvePrice(produto: Produto, variante?: Variante, promocao?: Promocao): number {
  const base = variante?.preco ?? produto.preco_base;
  if (!promocao?.ativo) return base;
  return promocao.tipo_desconto === 'percentual'
    ? base * (1 - promocao.valor_desconto / 100)
    : Math.max(0, base - promocao.valor_desconto);
}
```

---

## 3. ESTOQUE (Decisão 4)

| Cenário | Tabela | Chave | Regras |
|---------|--------|-------|--------|
| Produto simples | `estoque` | (produto_id, variante_id=NULL) | quantidade total |
| Produto com variantes | `estoque` | (produto_id, variante_id) | quantidade por SKU; 1 linha por variante ativa |
| Entrada/Saída | `entradas_estoque` / `saidas_estoque` | referencia produto_id + variante_id (nullable) | Rastreabilidade completa |

**Constraints:**
- `estoque`: UNIQUE(produto_id, variante_id)
- Trigger: se produto tem variantes ativas → impede estoque com variante_id=NULL
- Reserva: **não** no carrinho; **sim** no checkout (transação atômica)

---

## 4. CARRINHO (Contrato Unificado)

### 4.1 Estrutura do Item
```typescript
interface CartItem {
  sku: string;                    // `${produto_id}` ou `${produto_id}:${hash(atributos)}`
  produtoId: number;
  varianteId?: number;            // null se produto simples
  nome: string;
  atributos: Record<string,string>; // {tamanho: 'G', cor: 'Rosa', volume: '100ml'}
  precoUnitario: number;          // resolvePrice() no momento da adição
  quantidade: number;
  imagem?: string;
  total: number;                  // precoUnitario * quantidade
}
```

### 4.2 Operações (API canônica)
- `getCart(): CartItem[]`
- `addItem(item: CartItem): void` — dedup por `sku`; soma quantidade
- `updateQuantity(sku: string, qty: number): void` — valida estoque disponível
- `removeItem(sku: string): void`
- `clearCart(): void`
- `getSubtotal(): number`
- `getTotalItems(): number`

### 4.3 Persistência
- **Fase 1:** localStorage (chave `carrinho`) + sync posterior com backend
- **Fase 2:** Backend `POST /api/cart` + `GET /api/cart` (session/user)

---

## 5. CLIENTE & ENDEREÇO (Decisões 8, 9)

### 5.1 Cliente
```typescript
interface Cliente {
  id: number;
  nome: string;
  email: string;              // UNIQUE
  telefone?: string;
  cpf?: string;               // UNIQUE (opcional)
  data_nascimento?: Date;
  criado_em: Date;
  ultimo_login?: Date;
}
```
- Criação *lazy* no checkout (se não logado)
- Autenticação: e-mail + senha ou magic link (fase 2)

### 5.2 Endereço
```typescript
interface Endereco {
  id: number;
  cliente_id: number;         // FK usuarios (apenas clientes)
  tipo: 'entrega' | 'cobranca';
  cep: string;                // 8 dígitos, obrigatório
  logradouro: string;         // ViaCEP auto-fill
  numero: string;             // Obrigatório (input usuário)
  complemento?: string;
  bairro: string;             // ViaCEP auto-fill
  cidade: string;             // ViaCEP auto-fill
  uf: string;                 // ViaCEP auto-fill (2 letras)
  principal: boolean;
  criado_em: Date;
}
```
- **ViaCEP proxy** obrigatório: `GET /api/cep/{cep}` → preenche logradouro/bairro/cidade/uf
- Número **sempre** input manual
- Um endereço principal por cliente
- `pedidos.endereco_entrega_id` NOT NULL (FK enderecos)

---

## 6. PEDIDO & CHECKOUT (Decisões 5, 6, 7, 10)

### 6.1 Status do Pedido (Decisão 10)
```
rascunho
  → aguardando_pagamento (site) / aguardando_whatsapp (WhatsApp)
    → pagamento_aprovado / confirmado_whatsapp
      → em_separacao
        → enviado
          → entregue
        → devolvido/trocado (pós-entrega)
    → cancelado (qualquer momento antes de enviado)
    → recusado/estornado (falha pagamento)
```

### 6.2 Entidades
```typescript
interface Pedido {
  id: number;
  numero: string;              // Formato: AC-YYYYMMDD-XXXX
  cliente_id: number;          // FK usuarios (sempre preenchido)
  origem: 'site' | 'whatsapp';
  status: StatusPedido;        // Enum acima
  metodo_pagamento: 'whatsapp' | 'pix' | 'cartao' | 'boleto' | 'entrega';
  status_pagamento: 'pendente' | 'aprovado' | 'recusado' | 'estornado' | 'aguardando_entrega';
  endereco_entrega_id: number; // FK enderecos (NOT NULL)
  frete_valor: number;
  subtotal: number;
  desconto_total: number;
  total: number;
  observacoes?: string;
  criado_em: Date;
  atualizado_em: Date;
  pago_em?: Date;
  enviado_em?: Date;
  entregue_em?: Date;
}

interface PedidoItem {
  id: number;
  pedido_id: number;
  produto_id: number;
  variante_id?: number;        // Null se produto simples
  nome_produto: string;        // Snapshot
  atributos: Record<string,string>; // Snapshot
  quantidade: number;
  preco_unitario: number;      // Snapshot (resolvePrice no momento)
  total: number;
}
```

### 6.3 Fluxos de Checkout

#### A) Site (Decisão 6, 8)
1. Carrinho → CEP (ViaCEP) → Frete (tabela admin) → Resumo
2. Cliente: logado (usa endereço salvo) **OU** convidado (e-mail + endereço → cria usuário lazy)
3. Escolhe pagamento: PIX / Cartão / Boleto / Entrega
4. **PIX/Cartão/Boleto:** Cria pedido `aguardando_pagamento` → Webhook gateway → `pagamento_aprovado` → `em_separacao`
5. **Entrega:** Cria pedido `aguardando_entrega` → `em_separacao` (validação regional)
6. Baixa estoque **apenas** em `pagamento_aprovado` / `aguardando_entrega` (transação atômica)

#### B) WhatsApp (Decisão 7)
1. Carrinho → CEP (ViaCEP) → Frete → Resumo
2. Botão "Finalizar pelo WhatsApp"
3. `POST /api/orders` com `origem: 'whatsapp'` → Cria pedido `rascunho` + itens + **reserva estoque** (soft hold)
4. Retorna `numero_pedido` → Abre `wa.me/...?text=Pedido%20${numero}...`
5. Vendedor valida no CRM/WhatsApp Business API → `confirmado_whatsapp` → Baixa estoque definitiva + `historico_compras`
6. Webhook assíncrono para CRM

---

## 7. FRETE (Decisão 5)

### 7.1 Fase 1 — Tabela Admin Configurável
```sql
CREATE TABLE frete_regra (
  id SERIAL PRIMARY KEY,
  cep_inicio VARCHAR(8),
  cep_fim VARCHAR(8),
  uf CHAR(2),
  regiao VARCHAR(50),
  tipo VARCHAR(20),        -- 'fixo' | 'por_kg' | 'percentual_subtotal'
  valor DECIMAL(10,2),
  subtotal_minimo DECIMAL(10,2) DEFAULT 0,  -- Para frete grátis
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP DEFAULT NOW()
);
```
- API: `GET /api/frete?cep=01310100&subtotal=250.00&peso=0.5`
- Regra: mais específica vence (CEP range > UF > regiao > default)

### 7.2 Fase 2 — Integração Transportadora
- Adaptador para Correios (SIGEP), Jadlog, Melhor Envio, etc.
- Cálculo real por dimensões/peso/CEP origem-destino
- Fallback para tabela admin se falhar

---

## 8. PAGAMENTO (Decisão 6)

| Método | Gateway | Fluxo | Status Pedido |
|--------|---------|-------|---------------|
| **WhatsApp** | Manual/CRM | Pedido rascunho → vendedor confirma | `aguardando_whatsapp` → `confirmado_whatsapp` |
| **PIX** | Mercado Pago / Asaas / Stark Bank | QR Code dinâmico + webhook | `aguardando_pagamento` → `pagamento_aprovado` |
| **Cartão** | Mercado Pago / Stripe / Cielo | Checkout transparente + webhook | `aguardando_pagamento` → `pagamento_aprovado` |
| **Boleto** | Asaas / Banco Inter / Gerencianet | Boleto + webhook compensação | `aguardando_pagamento` → `pagamento_aprovado` (D+1/2) |
| **Entrega** | — | Validação regional + dinheiro/cartão na porta | `aguardando_entrega` → `em_separacao` |

**Comum a todos:** `pedidos.metodo_pagamento` + `pedidos.status_pagamento` + webhook idempotente + logs de auditoria

---

## 9. HISTÓRICO & AUDITORIA

- `historico_compras`: **Log imutável** de itens vendidos (denormalizado para relatórios rápidos)
- `pedidos` + `pedido_itens`: **Fonte da verdade** transacional
- Auditoria de status: tabela `pedido_status_historico` (pedido_id, status_anterior, status_novo, usuario_id, criado_em)

---

## 10. CHAT / ATENDIMENTO (Legado Ativo)

- Mantido como está: Node.js/Express + OpenRouter (GPT-3.5-turbo) no Render
- Integração futura: Webhook `pedido.criado` → notifica chat para vendedor
- Contexto do bot: passa `cliente_id`, `carrinho_resumo`, `ultimo_pedido_id`

---

## 11. GAPS TÉCNICOS PARA MIGRAÇÃO (do legacy para novo)

| Item | Atual (Legacy) | Necessário (Novo) | Ação |
|------|----------------|-------------------|------|
| `itens_pedido` | **Não existe** | Tabela `pedido_itens` completa | **Migration prioritária #1** |
| `enderecos` FK | Aponta só `usuarios` | FK `cliente_id` + remover polimorfismo | Migration #2 |
| `produto_variante` | Não existe | Tabela + atributos JSONB | Migration #3 |
| `estoque.variante_id` | Não existe | Nullable FK + unique constraint | Migration #4 |
| `produtos_promocao` | `desconto` ambíguo | `tipo_desconto` + `valor_desconto` | Migration #5 |
| `frete_regra` | Não existe | Tabela completa | Migration #6 |
| `pedidos` status | 4 valores | 9 valores + máquina de estados | Migration #7 |
| `pedidos` campos | Faltam: metodo_pagamento, status_pagamento, endereco_entrega_id, frete_valor, desconto_total, numero | Adicionar todos | Migration #8 |
| Imagens produto | Hardcoded frontend | Tabela `produto_imagens` | Migration #9 |
| `historico_compras` | Duplica pedido | Manter como log imutável; não source of truth | Documentar |

---

## 12. PRÓXIMOS PASSOS (Pós-Contrato)

1. **Arquitetura** — Definir: Supabase (PostgreSQL + Auth + Realtime + Edge Functions) vs Node/Express + PostgreSQL
2. **API Contract** — OpenAPI 3.1 para: Products, Variants, Cart, Checkout, Orders, Customers, Addresses, Freight, Promotions, Webhooks
3. **Migrations SQL** — Gerar 9 migrations ordenadas (acima)
4. **Seed/Fixtures** — Dados mestres: categorias, regras frete iniciais, promoções exemplo
5. **Frontend** — React + TypeScript + Vite + TanStack Query + React Hook Form + Zod
6. **Integrações** — Gateways pagamento, ViaCEP proxy, WhatsApp Business API, Transportadoras
7. **Testes** — Contratos (Pact), Unit (Vitest), E2E (Playwright)
8. **Deploy** — Preview branches → Staging → Produção (Netlify/Vercel + Railway/Render/Supabase)

---

## 13. APROVAÇÕES

| Papel | Nome | Assinatura | Data |
|-------|------|------------|------|
| **Negócio / Dono** | | | 2026-09-13 |
| **Tech Lead** | | | |
| **Arquiteto** | | | |

---

> **Este contrato é imutável v1.0.** Qualquer alteração requer nova versão (v1.1, v2.0) com rastreabilidade de decisão.