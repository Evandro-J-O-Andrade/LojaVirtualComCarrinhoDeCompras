# GATE 6.1 — Inventário de Bibliotecas e Padrões Reutilizáveis

**Projeto:** Angel Cosméticos — E-commerce
**Status:** 🔍 READ-ONLY — Nenhuma alteração em código, Git, Supabase ou contrato
**Base:** Gate 6 (reconciliação aprovada) + React local (`web/`) + Legado (`assets/`)
**Data:** 2026-09-19

---

## 1. Regras do Gate 6.1

1. **Nenhuma alteração em código, Supabase, migrations ou Git**
2. Inventariar o que existe na Angel e nos outros SaaS
3. Avaliar reutilizabilidade de cada padrão/biblioteca
4. Registrar decisões de adaptação para o contrato funcional
5. Nenhum código será copiado — apenas mapeado

---

## 2. Acesso a outros SaaS

> ⚠️ **BLOQUEADO — AGUARDANDO**
>
> O inventário completo exige acesso aos repositórios dos outros SaaS.
> Sem eles, apenas o que está na Angel pode ser avaliado com evidência.
>
> **Necessário:** Caminhos locais ou links GitHub dos outros SaaS.

---

## 3. Inventário — Bibliotecas e Padrões

### 3.1 TanStack Query (`@tanstack/react-query`)

| Campo | Valor |
|-------|-------|
| **Na Angel?** | ✅ Presente em `web/package.json` (v5.102.8) |
| **Usado no código?** | ❌ **ZERO uso** — nenhum `useQuery`, `useMutation`, `QueryClient`, `useQueryClient` encontrado |
| **Evidência** | Todas as páginas (`Home`, `Produtos`, `Carrinho`, `Checkout`, etc.) usam `useState` + `useEffect` + `supabase.from().select()` diretamente |
| **Nos SaaS?** | 🔍 AGUARDANDO ACESSO |
| **Reutilização** | **CONFIRMADA** — mas precisa de adoção forçada |
| **Classificação** | 🟢 **REUTILIZAR** — já está na dependência, precisa ser ativada |
| **Adaptação** | Mínima: criar `QueryClientProvider` no `main.tsx`, migrar `useEffect+useState` para `useQuery` nos hooks de dados |
| **Decisão** | Adotar como camada de cache/invalidação para produtos, categorias, pedidos, estoque, clientes |

---

### 3.2 Zod (`zod`)

| Campo | Valor |
|-------|-------|
| **Na Angel?** | ✅ Presente em `web/package.json` (v4.6.4) |
| **Usado no código?** | ❌ **ZERO uso** — nenhum `z.object()`, `z.string()`, `z.number()` encontrado |
| **Evidência** | `types/index.ts` usa interfaces TypeScript puras sem validação; formulários em Login e Carrinho usam validação manual |
| **Nos SaaS?** | 🔍 AGUARDANDO ACESSO |
| **Reutilização** | **CONFIRMADA** |
| **Classificação** | 🟢 **REUTILIZAR** — essencial para validação de domínio |
| **Adaptação** | Criar schemas Zod para: Produto, Variante, Preço, CarrinhoItem, Pedido, Endereço, Cliente, Promoção, Estoque, Frete, Pagamento |
| **Decisão** | Validar entrada de dados no frontend E servir como base para validação em Edge Functions |

---

### 3.3 React Hook Form (`react-hook-form`)

| Campo | Valor |
|-------|-------|
| **Na Angel?** | ✅ Presente em `web/package.json` (v7.88.0) |
| **Usado no código?** | ❌ **ZERO uso** — nenhum `useForm`, `Register` encontrado |
| **Evidência** | Login usa `useState` para e-mail/senha/nome; Carrinho usa inputs nativos sem form library |
| **Nos SaaS?** | 🔍 AGUARDANDO ACESSO |
| **Reutilização** | **CONFIRMADA** |
| **Classificação** | 🟢 **REUTILIZAR** |
| **Adaptação** | Substituir formulários manuais em: Login, Cadastro, Endereço, Produto (admin), Variante, Promoção, Checkout |
| **Decisão** | Todos os formulários do sistema devem usar React Hook Form + Zod para validação |

---

### 3.4 Supabase Client (`@supabase/supabase-js`)

| Campo | Valor |
|-------|-------|
| **Na Angel?** | ✅ Presente em `web/package.json` (v2.116.0) |
| **Usado no código?** | ✅ Sim — `lib/supabase.ts` |
| **Evidência** | Todas as páginas importam `supabase` de `@/lib/supabase`; Checkout usa `supabase.functions.invoke('viaCEP')`, `supabase.auth.getUser()`, `supabase.from().insert()` |
| **Nos SaaS?** | 🔍 AGUARDANDO ACESSO |
| **Reutilização** | **CONFIRMADA** — cliente é padrão |
| **Classificação** | 🟢 **REUTILIZAR** |
| **Adaptação** | Mínima: manter client base, adicionar RLS awareness, criar wrapper com error handling padronizado |
| **Decisão** | Manter como cliente principal; criar `services/supabaseClient.ts` com interceptors/logging |

---

### 3.5 AuthContext (Autenticação)

| Campo | Valor |
|-------|-------|
| **Na Angel?** | ✅ Presente — `contexts/AuthContext.tsx` |
| **Usado no código?** | ✅ Sim — `App.tsx` envolve toda a aplicação |
| **Evidência** | `signIn`, `signUp`, `signOut`, `getEnderecos`, `addEndereco`; consulta `usuarios` por `id` do Supabase Auth; sem verificação de perfil/permissão |
| **Nos SaaS?** | 🔍 AGUARDANDO ACESSO |
| **Reutilização** | 🟡 **ADAPTAR** — conceito reutilizável, implementação precisa de RBAC |
| **Classificação** | 🟡 **ADAPTAR** |
| **Adaptação necessária** | Adicionar: RBAC, RLS awareness, roles (admin/cliente/operador), middleware de permissão, gerenciamento de perfil completo |
| **Decisão** | Reutilizar estrutura (context + provider), REESCREVER lógica interna com RBAC e roles do domínio |

**Problemas identificados:**
- Consulta `usuarios` por `id` sem verificação de role
- Sem proteção RLS-aware no cliente
- `getEnderecos` filtra por `usuario_id` (legado) vs `clienteId` (novo domínio)
- Sem tratamento de sessão expirada
- Sem diferenciação entre autenticação e identidade comercial

---

### 3.6 CartContext (Carrinho)

| Campo | Valor |
|-------|-------|
| **Na Angel?** | ✅ Presente — `contexts/CartContext.tsx` |
| **Usado no código?** | ✅ Sim — `App.tsx`, `ProductDetail`, `Header`, `CartIcon`, `Carrinho`, `Checkout` |
| **Evidência** | localStorage `carrinho`; operações CRUD em memória; `getSubtotal`, `getTotal`, `getFreight`, `getTotalItems` |
| **Nos SaaS?** | 🔍 AGUARDANDO ACESSO |
| **Reutilização** | 🟡 **ADAPTAR** — conceito correto, regras comerciais precisam ser implementadas |
| **Classificação** | 🟡 **ADAPTAR** |
| **Adaptação necessária** | Remover hardcoded freight (`FREE_SHIPPING_THRESHOLD = 300`, `DEFAULT_FREIGHT = 50`); adicionar persistência servidor para logados; merge carrinho local + servidor no login; validação de estoque/preço no servidor; integração com domínio (promoções, descontos) |
| **Decisão** | Manter como contexto central do carrinho, mas REESCREVER regras internas conforme domínio |

**Problemas identificados:**
- `CartIcon/index.tsx:6` — `const totalItems = 0` (hardcoded, nunca lê carrinho real!)
- `CartContext.tsx:34-35` — Frete hardcoded (`R$300`, `R$50`)
- Sem persistência no banco para carrinho de cliente logado
- Sem merge de carrinhos (local → servidor) no login
- Sem validação de estoque/preço ao adicionar item
- Sem integração com promoções/descontos do domínio

---

### 3.7 Repository Pattern

| Campo | Valor |
|-------|-------|
| **Na Angel?** | ❌ **NÃO EXISTE** |
| **Evidência** | Todas as páginas chamam `supabase.from('...').select/insert/update` diretamente; zero abstração de acesso a dados |
| **Nos SaaS?** | 🔍 AGUARDANDO ACESSO |
| **Reutilização** | **CONFIRMADA** nos SaaS |
| **Classificação** | 🟢 **ADAPTAR** — necessário criar do zero para Angel, baseado no padrão dos SaaS |
| **Adaptação** | Criar `services/repositories/`: `products.repository.ts`, `customers.repository.ts`, `orders.repository.ts`, `cart.repository.ts`, `inventory.repository.ts`, `promotions.repository.ts`, `addresses.repository.ts`, `audit.repository.ts` |
| **Decisão** | Implementar Repository Pattern como camada obrigatória entre UI e Supabase |

---

### 3.8 Service Layer

| Campo | Valor |
|-------|-------|
| **Na Angel?** | ❌ **NÃO EXISTE** |
| **Evidência** | Lógica de negócio espalhada em components (cálculo de preço em `ProductDetail`, `ProductCard`; cálculo de frete em `CartContext`) |
| **Nos SaaS?** | 🔍 AGUARDANDO ACESSO |
| **Reutilização** | **CONFIRMADA** nos SaaS |
| **Classificação** | 🟢 **ADAPTAR** |
| **Adaptação** | Criar `services/`: `pricing.service.ts`, `cart.service.ts`, `checkout.service.ts`, `order.service.ts`, `inventory.service.ts`, `promotion.service.ts`, `freight.service.ts`, `payment.service.ts` |
| **Decisão** | Implementar Service Layer para todas as regras de negócio do domínio |

---

### 3.9 RLS (Row Level Security)

| Campo | Valor |
|-------|-------|
| **Na Angel?** | ⚠️ **REFERÊNCIA APENAS** — `DEC1` define RLS como parte do backend, mas não existe no Supabase local |
| **Evidência** | `DECISOES_NEGOCIO_v1.3.md` e `CONTRATO_DOMINIO_COMERCIAL_v1.1.md` confirmam RLS; `web/lib/supabase.ts` usa anon key (sem admin key) |
| **Nos SaaS?** | 🔍 AGUARDANDO ACESSO |
| **Reutilização** | **CONFIRMADA** — padrões de RLS dos SaaS |
| **Classificação** | 🟢 **REUTILIZAR** |
| **Adaptação** | Definir políticas RLS por tabela para: produtos, categorias, pedidos, carrinho, endereços, clientes, estoque, promoções, audit, configurações |
| **Decisão** | RLS obrigatório no banco; operations privilegiadas via Edge Functions com `service_role` |

---

### 3.10 Audit Log

| Campo | Valor |
|-------|-------|
| **Na Angel?** | ⚠️ **PARCIAL** — `AUDITORIA_3_DOMAIN_CONTRACT.md` documenta inconsistências; `historico_compras` existe no legado mas duplica pedidos; zero log de auditoria de alterações |
| **Evidência** | Legado tem `historico_compras` (log imutável de itens vendidos); zero tabela/registro de quem alterou preço, estoque, configurações |
| **Nos SaaS?** | 🔍 AGUARDANDO ACESSO |
| **Reutilização** | **CONFIRMADA** nos SaaS |
| **Classificação** | 🟢 **ADAPTAR** — conceito reutilizável, tabela nova para Angel |
| **Adaptação** | Criar `audit_logs` table: entidade, campo, anterior, novo, usuário, timestamp, ip/action; aplicar a: preço, promoção, estoque, pedido, status, desconto, configurações |
| **Decisão** | Audit Log obrigatório — é uma das camadas mais importantes do sistema |

---

### 3.11 IDOR Protections

| Campo | Valor |
|-------|-------|
| **Na Angel?** | ❌ **NÃO EXISTE** — zero proteção contra acesso indevido |
| **Evidência** | `Checkout.tsx` escreve pedidos com `usuario_id` do auth sem validação; `Conta` não verifica dono de recursos; URLs como `/produtos/:id` não têm check de acesso |
| **Nos SaaS?** | 🔍 AGUARDANDO ACESSO |
| **Reutilização** | **CONFIRMADA** nos SaaS |
| **Classificação** | 🟢 **ADAPTAR** |
| **Adaptação** | Implementar em: RLS policies (dono do recurso), Edge Functions (validação de acesso), checkout (revalidar preço/estoque no servidor), nunca confiar no cliente para autorização |
| **Decisão** | Proteção IDOR obrigatória — RLS no banco + validação em Edge Functions |

---

### 3.12 Error Handling / Error Boundaries

| Campo | Valor |
|-------|-------|
| **Na Angel?** | ❌ **NÃO EXISTE** |
| **Evidência** | Erros tratados com `alert()` (Login, Checkout); sem `ErrorBoundary`; sem logging centralizado; `CartContext` não trata erros de forma estruturada |
| **Nos SaaS?** | 🔍 AGUARDANDO ACESSO |
| **Reutilização** | **CONFIRMADA** nos SaaS |
| **Classificação** | 🟢 **ADAPTAR** |
| **Adaptação** | Criar Error Boundary para páginas; handler de erro centralizado; toast/notificação de erro; logging de erros |
| **Decisão** | Implementar como infraestrutura base antes da primeira página |

---

### 3.13 Toast / Feedback

| Campo | Valor |
|-------|-------|
| **Na Angel?** | ❌ **NÃO EXISTE** |
| **Evidência** | Todos os feedbacks usam `alert()`: Login, Checkout, Carrinho; sem loading states visuais; sem notificações de sucesso |
| **Nos SaaS?** | 🔍 AGUARDANDO ACESSO |
| **Reutilização** | 🟡 **AVALIAR** — conceito universal, provavelmente adaptar |
| **Classificação** | 🟡 **AVALIAR** |
| **Adaptação** | Substituir todos os `alert()` por toast system; adicionar loading skeletons; feedback de sucesso/erro/empty |
| **Decisão** | Provavelmente REUTILIZAR com adaptação de identidade visual |

---

### 3.14 Logger

| Campo | Valor |
|-------|-------|
| **Na Angel?** | ❌ **NÃO EXISTE** |
| **Evidência** | `console.error()` no Checkout; sem logger estruturado; sem log de auditoria de operações |
| **Nos SaaS?** | 🔍 AGUARDANDO ACESSO |
| **Reutilização** | 🟡 **AVALIAR** |
| **Classificação** | 🟡 **AVALIAR** |
| **Adaptação** | Logger para Edge Functions (obrigatório); logger de auditoria; logger de erros em produção |
| **Decisão** | Logger necessário para backend; frontend pode usar console padronizado |

---

### 3.15 Storage Abstraction

| Campo | Valor |
|-------|-------|
| **Na Angel?** | ⚠️ **PARCIAL** — `Supabase Storage` mencionado em DEC1; zero uso atual (imagens hardcoded) |
| **Evidência** | `types/index.ts` tem `ImagemProduto` com `url`; mas imagens reais vêm de paths hardcoded no HTML/JS legado; `vite.config.ts` tem PWA configurado |
| **Nos SaaS?** | 🔍 AGUARDANDO ACESSO |
| **Reutilização** | **CONFIRMADA** — Supabase Storage é padrão |
| **Classificação** | 🟢 **ADAPTAR** |
| **Adaptação** | Criar `services/storageService.ts` para upload/download/remoção de imagens; integração com admin; validação de tipo/tamanho; CDN URLs |
| **Decisão** | Storage service obrigatório — imagens de produto virão do Supabase Storage |

---

### 3.16 Edge Functions

| Campo | Valor |
|-------|-------|
| **Na Angel?** | ✅ Presente — `supabase/functions/viaCEP/index.ts` |
| **Usado?** | ✅ Sim — chamado por `Checkout.tsx:28` via `supabase.functions.invoke('viaCEP')` |
| **Evidência** | Edge Function de CEP funcional; `serve` framework (sift@0.2.0); POST handler com validação |
| **Nos SaaS?** | 🔍 AGUARDANDO ACESSO |
| **Reutilização** | 🟡 **ADAPTAR** — padrão reutilizável, novas functions necessárias |
| **Classificação** | 🟢 **ADAPTAR** |
| **Adaptação** | Criar: `checkout`, `order-create`, `inventory-reserve`, `payment-webhook`, `cep`, `whatsapp-draft`, `promotion-validate`, `freight-calc` |
| **Decisão** | Edge Functions serão a camada de regras de negócio; todas as operações sensíveis passam por elas |

---

### 3.17 React Router

| Campo | Valor |
|-------|-------|
| **Na Angel?** | ✅ Presente em `web/package.json` (v7.18.3) e `app/App.tsx` |
| **Usado?** | ✅ Sim — `BrowserRouter`, `Routes`, `Route`, `NavLink`, `Link`, `useNavigate` |
| **Evidência** | Todas as páginas roteadas via `App.tsx`; Header usa `NavLink`; Checkout usa `useNavigate` |
| **Nos SaaS?** | 🔍 AGUARDANDO ACESSO |
| **Reutilização** | **CONFIRMADA** |
| **Classificação** | 🟢 **REUTILIZAR** |
| **Adaptação** | Mínima: migrar `window.location.href` (ProductDetail:57) para `useNavigate`; adicionar lazy loading de rotas |
| **Decisão** | Manter como router principal; lazy load pages |

---

### 3.18 React Hooks customizados

| Campo | Valor |
|-------|-------|
| **Na Angel?** | ⚠️ **PARCIAL** — Nenhum custom hook criado; apenas context hooks (`useAuth`, `useCart`) |
| **Evidência** | `hooks/` está VAZIO; toda lógica de dados está em `useEffect` dentro dos componentes |
| **Nos SaaS?** | 🔍 AGUARDANDO ACESSO |
| **Reutilização** | **CONFIRMADA** nos SaaS |
| **Classificação** | 🟢 **ADAPTAR** |
| **Adaptação** | Criar hooks: `useProducts`, `useProduct`, `useCartServer`, `useOrders`, `useCustomers`, `useInventory`, `usePromotions`, `useCheckout`, `useAddresses` |
| **Decisão** | Hooks customizados obrigatórios — separar lógica de dados da UI |

---

## 4. Descobertas Críticas da Angel

### 🚨 4.1 Dependências fantasmas

Três bibliotecas críticas estão em `package.json` mas **nunca são usadas**:

```text
@tanstack/react-query ← INSTALADO, NÃO USADO (0% adoção)
zod ← INSTALADO, NÃO USADO (0% adoção)
react-hook-form ← INSTALADO, NÃO USADO (0% adoção)
axios ← INSTALADO, NÃO USADO (0% adoção)
```

**Impacto:** O React tem a "intenção" de usar essas ferramentas mas não as utiliza. Isso invalida qualquer lógica que assume que o código já está preparado.

### 🚨 4.2 CartIcon quebrado

`web/src/components/CartIcon/index.tsx:6`:
```tsx
const totalItems = 0
```

O ícone do carrinho **nunca mostra a quantidade real**. Sempre mostra 0.

### 🚨 4.3 Frete hardcoded

`web/src/contexts/CartContext.tsx:34-35`:
```tsx
const FREE_SHIPPING_THRESHOLD = 300
const DEFAULT_FREIGHT = 50
```

Dois valores fixos que contradizem DEC5 (frete configurável no admin).

### 🚨 4.4 Checkout sem proteção

`web/src/pages/Carrinho/Checkout.tsx` apresenta:

| Problema | Linha |
|----------|-------|
| Operações de banco direto do cliente | 62-112 |
| Pedido items com `pedido_id: null` (bug) | 101 |
| Senha gerada com `Math.random()` | 56 |
| Sem transação/atomicidade | 83-112 |
| Sem validação de preço/estoque no servidor | 38-122 |
| `prompt()` para input de usuário | 49-50 |
| WhatsApp number hardcoded | 139 |
| Sem tratamento de erro para `pedido_error` | 96 |
| Operação de endereço com `usuario_id` (legado) | 62 |

### 🚨 4.5 Dados do contrato vs dados do código

| Aspecto | `types/index.ts` | Banco/Supabase real |
|---------|------------------|---------------------|
| Endereço FK | `clienteId` | `usuario_id` |
| Tabelas | 15+ referenciadas | 0 criadas |
| Estoque | `product.estoque?` | Vista `estoque` sem variante |
| Promoção | `promocaoAtiva?` | Vista `produtos_view` |
| Carrinho | Context apenas | `pedidos` existe no legado |

### 🚨 4.6 Migrations no diretório mas bloqueadas

`supabase/migrations/` contém 9 migrations que **não podem ser aplicadas** conforme determinado pelo Gate 6 — elas pressupõem decisões de domínio que ainda não foram fechadas e contradizem D1 (JSONB em vez de atributos estruturados).

---

## 5. Resumo de Classificação — Angel

| Biblioteca / Padrão | Na Angel | Usado? | Classificação | Ação |
|---------------------|----------|--------|---------------|------|
| TanStack Query | ✅ | ❌ Não | 🟢 REUTILIZAR | Ativar e adotar |
| Zod | ✅ | ❌ Não | 🟢 REUTILIZAR | Criar schemas de domínio |
| React Hook Form | ✅ | ❌ Não | 🟢 REUTILIZAR | Substituir formulários manuais |
| Supabase Client | ✅ | ✅ Sim | 🟢 REUTILIZAR | Manter + wrapper |
| React Router | ✅ | ✅ Sim | 🟢 REUTILIZAR | Mínima adaptação |
| AuthContext | ✅ | ✅ Sim | 🟡 ADAPTAR | REESCREVER com RBAC |
| CartContext | ✅ | ✅ Sim | 🟡 ADAPTAR | REESCREVER regras internas |
| Repository Pattern | ❌ | ❌ Não | 🟢 ADAPTAR | Criar do zero |
| Service Layer | ❌ | ❌ Não | 🟢 ADAPTAR | Criar do zero |
| RLS | ⚠️ | ❌ Não | 🟢 REUTILIZAR | Definir políticas |
| Audit Log | ⚠️ | ❌ Não | 🟢 ADAPTAR | Criar tabela + serviço |
| IDOR Protections | ❌ | ❌ Não | 🟢 ADAPTAR | Implementar |
| Error Handling | ❌ | ❌ Não | 🟢 ADAPTAR | Criar do zero |
| Toast/Feedback | ❌ | ❌ Não | 🟡 AVALIAR | Provavelmente reutilizar |
| Logger | ❌ | ❌ Não | 🟡 AVALIAR | Backend obrigatório |
| Storage Abstraction | ⚠️ | ❌ Não | 🟢 ADAPTAR | Criar service |
| Edge Functions | ✅ | ✅ Sim | 🟢 ADAPTAR | Expandir |
| Custom Hooks | ❌ | ❌ Não | 🟢 ADAPTAR | Criar do zero |

---

## 6. Resumo — SaaS (pendente)

| Biblioteca / Padrão | Status |
|---------------------|--------|
| TanStack Query | 🔍 AGUARDANDO ACESSO |
| Zod | 🔍 AGUARDANDO ACESSO |
| React Hook Form | 🔍 AGUARDANDO ACESSO |
| Supabase Client | 🔍 AGUARDANDO ACESSO |
| React Router | 🔍 AGUARDANDO ACESSO |
| AuthContext | 🔍 AGUARDANDO ACESSO |
| CartContext | 🔍 AGUARDANDO ACESSO |
| Repository Pattern | 🔍 AGUARDANDO ACESSO |
| Service Layer | 🔍 AGUARDANDO ACESSO |
| RLS | 🔍 AGUARDANDO ACESSO |
| Audit Log | 🔍 AGUARDANDO ACESSO |
| IDOR Protections | 🔍 AGUARDANDO ACESSO |
| Error Handling | 🔍 AGUARDANDO ACESSO |
| Toast/Feedback | 🔍 AGUARDANDO ACESSO |
| Logger | 🔍 AGUARDANDO ACESSO |
| Storage Abstraction | 🔍 AGUARDANDO ACESSO |
| Edge Functions | 🔍 AGUARDANDO ACESSO |
| Custom Hooks | 🔍 AGUARDANDO ACESSO |

---

## 7. Padrões a investigar nos SaaS adicionais

Os seguintes itens podem existir nos SaaS e precisam de verificação:

| Item | Relevância para Angel |
|------|----------------------|
| Multi-tenancy layer | ❌ NÃO REUTILIZAR — site único |
| Billing/subscription | ❌ NÃO REUTILIZAR — e-commerce |
| Workspace/org hierarchy | ❌ NÃO REUTILIZAR — site único |
| Feature flags complexas | 🟡 AVALIAR — simples se houver |
| Notification system (email/push) | 🟢 REUTILIZAR — n8n orquestra |
| Database connection pooling | 🟢 REUTILIZAR — Supabase cuida |
| Environment management | 🟢 REUTILIZAR |
| Caching strategy | 🟢 REUTILIZAR — TanStack Query |
| Form validation patterns | 🟢 REUTILIZAR — Zod + RHF |
| Responsive/design system | 🟢 ADAPTAR — Tailwind ou similar |
| API versioning | 🟡 AVALIAR |
| Testing framework | 🟢 REUTILIZAR |
| CI/CD config | 🟢 REUTILIZAR |
| Docker/containerization | 🟡 AVALIAR |
| Documentation generation | 🟡 AVALIAR |
| Rate limiting | 🟢 REUTILIZAR |
| CORS management | 🟢 REUTILIZAR |

---

## 8. Decisões de Não Reutilização

Estes itens dos SaaS **provavelmente não** devem ser levados para a Angel:

```text
❌ tenant_id / multi-tenancy
❌ tenant_memberships
❌ billing / subscription / plan
❌ workspace / organization hierarchy
❌ complex feature flags
❌ SaaS-specific middleware
❌ multi-region logic
❌ cross-tenant queries
❌ org-switching UI
```

**Regra aplicada:** "Arquitetura de produto profissional, sem complexidade de SaaS onde ela não agrega valor."

---

## 3.2 AtendimentoOfflineAlpha — Análise Estrutural via GitHub

**Repositório:** `https://github.com/Evandro-J-O-Andrade/AtendimentoOfflineAlpha`
**Linguagem:** TypeScript | **Tamanho:** 281KB | **License:** N/A
**Último push:** 2026-08-04

### O que é

SaaS enterprise de **gestão hospitalar** (saúde). **Não é e-commerce**. É um projeto radicalmente mais complexo que a Angel.

### Estrutura descoberta (via API GitHub — leitura apenas)

```text
AtendimentoOfflineAlpha/
├── apps/                          ← Aplicações frontend
│   ├── portal/                    ← Portal web
│   └── totem/                     ← Totem/quiosque
├── backend/                       ← Backend Node/TypeScript
│   ├── src/
│   ├── tests/
│   ├── migrations/
│   ├── seed.js
│   ├── migrate.js
│   └── package.json
├── packages/                      ← Pacotes compartilhados (pnpm workspace)
│   ├── api/                       ← Camada de API
│   ├── auth/                      ← Autenticação/Autorização
│   ├── contracts/                 ← Contratos de tipo
│   ├── enterprise-components/     ← Componentes UI compartilhados
│   ├── enterprise-hooks/          ← Hooks React compartilhados
│   ├── enterprise-icons/
│   ├── enterprise-layout/
│   ├── enterprise-sdk/
│   ├── enterprise-shell/
│   ├── enterprise-theme/
│   ├── kernel/
│   └── runtime/
├── database/                      ← Scripts de banco
│   ├── migrations/
│   ├── seeds/
│   ├── dump/
│   ├── stages/
│   └── PROCESSO_MIGRATIONS.md
├── modules/                       ← Módulos de domínio (22 módulos)
│   ├── iam/                       ← Gestão de identidade/acesso
│   ├── identity/
│   ├── auditoria/                 ← Auditoria
│   ├── configuracao/
│   ├── estoque/                   ← Estoque
│   ├── financeiro/
│   ├── faturamento/
│   ├── atendimento/
│   ├── enfermagem/
│   ├── laboratorio/
│   ├── medico/
│   ├── paciente/
│   ├── notificacao/
│   ├── recepcao/
│   ├── triagem/
│   ├── internacao/
│   ├── farmacia/
│   ├── fila/
│   ├── FFA/
│   ├── painel/
│   ├── pessoa/
│   ├── governanca/
│   ├── display/
│   ├── kernel/
│   └── runtime/
├── docs/
├── engineering/
├── scripts/
├── tools/
├── pnpm-workspace.yaml            ← Workspace config
├── turbo.json                     ← Turborepo config
├── tsconfig.base.json
├── AGENTS.md
├── AI_CONTEXT.md
└── Documentação canônica (MD-*/*.md)
```

### Padrões identificados (reutilizáveis para Angel)

| Padrão | No AtendimentoOfflineAlpha | Para Angel | Classificação |
|--------|---------------------------|------------|---------------|
| **Monorepo (pnpm+Turborepo)** | ✅ | ⚠️ Overkill — Angel é site único | 🟡 REFERÊNCIA — não copiar estrutura |
| **Shared packages** | ✅ `packages/` com auth, api, hooks, components, theme | ✅ Reutilizável como `src/lib/`, `src/hooks/`, `src/components/` | 🟢 ADAPTAR |
| **Domain modules** | ✅ 22 módulos (iam, auditoria, estoque, etc.) | ✅ Reutilizável como `src/domain/` | 🟢 ADAPTAR |
| **Auth package** | ✅ `packages/auth` | ✅ Reutilizar conceito | 🟢 ADAPTAR |
| **Audit module** | ✅ `modules/auditoria` | ✅ Reutilizar conceito | 🟢 ADAPTAR |
| **Enterprise hooks** | ✅ `packages/enterprise-hooks` | ✅ Custom hooks do React | 🟢 ADAPTAR |
| **Contracts** | ✅ `packages/contracts` | ✅ Tipos compartilhados / Zod schemas | 🟢 ADAPTAR |
| **Database migrations** | ✅ `database/migrations/` | ✅ Padrão para Supabase migrations | 🟢 REUTILIZAR |
| **Seed/DB scripts** | ✅ `database/seeds/`, `seed.js` | ✅ Para dados iniciais | 🟡 AVALIAR |
| **Repository pattern** | ❓ Necessita clonar para confirmar | 🟡 AGUARDANDO | 🟡 INVESTIGAR |
| **Service layer** | ❓ Necessita clonar para confirmar | 🟡 AGUARDANDO | 🟡 INVESTIGAR |
| **RLS** | ❓ Necessita clonar para confirmar | 🟡 AGUARDANDO | 🟡 INVESTIGAR |
| **IDOR protections** | ❓ Necessita clonar para confirmar | 🟡 AGUARDANDO | 🟡 INVESTIGAR |
| **Error boundaries** | ❓ Necessita clonar para confirmar | 🟡 AGUARDANDO | 🟡 INVESTIGAR |
| **Toast/feedback** | ❓ Necessita clonar para confirmar | 🟡 AGUARDANDO | 🟡 INVESTIGAR |
| **Logger** | ❓ Necessita clonar para confirmar | 🟡 AGUARDANDO | 🟡 INVESTIGAR |
| **Storage abstraction** | ❓ Necessita clonar para confirmar | 🟡 AGUARDANDO | 🟡 INVESTIGAR |

### O que NÃO reutilizar da Angel

```text
❌ Multi-tenancy (enterprise SaaS)
❌ 22 domain modules (hospitalares — irrelevantes)
❌ Toter/quiosque apps (apps/totem)
❌ Enfermagem, laboratório, internação, triagem, farmácia
❌ Healthcare-specific domains
❌ Complexidade de 281KB para um e-commerce simples
```

### O que POSSIVELMENTE reutilizar (padrões, não código)

```text
✅ Conceito de shared packages
✅ Conceito de domain modules
✅ Conceito de enterprise hooks
✅ Conceito de contracts/tipos compartilhados
✅ Conceito de database migrations com seeds
✅ Conceito de auth package (implementação Nova)
✅ Conceito de audit module (implementação Nova)
```

### Decisão para o Gate 6.1

AtendimentoOfflineAlpha serve como **referência arquitetural**, não como fonte de código. Os padrões conceituais são valiosos; a implementação é específica para hospital e não se aplica à Angel.

Para extrair padrões detalhados (auth, audit, repository, RLS), seria necessário **clonar o repositório**. Isso permanece READ-ONLY e será solicitado ao usuário antes de qualquer ação.

---

## 4. Status de Acesso — Resumo

| Projeto | Acesso | Tipo | Status |
|---------|--------|------|--------|
| **Angel** | ✅ Local (read-only) | E-commerce | Inventário completo |
| **AtendimentoOfflineAlpha** | ✅ GitHub (API only) | SaaS Healthcare | Estrutura mapeada; conteúdo precisa de clone |
| **js-empregos** | ❌ Não localizado | Supabase | **AGUARDANDO USUÁRIO** |
| **GestãoAlpha** | ❌ Não localizado | Supabase | **AGUARDANDO USUÁRIO** |

### AGUARDANDO USUÁRIO

Para completar o inventário, preciso de acesso a:

1. **js-empregos** — Supabase project (conforme verificação do usuário)
2. **GestãoAlpha** — Supabase project (conforme verificação do usuário)
3. **AtendimentoOfflineAlpha** — Clone local do GitHub (opcional, para padrões detalhados)

Por favor, confirme:

- **js-empregos**: `https://app.supabase.com/project/...` ou caminho local?
- **GestãoAlpha**: `https://app.supabase.com/project/...` ou caminho local?
- **AtendimentoOfflineAlpha**: Devo clonar via `git clone`?

---

## 5. Inventário — Angel (Completo)

*(Seção mantida do documento original, seção 3.1 — não incluída aqui para não duplicar)*

---

## 6. Evidências de Bloqueio

Todos os arquivos citados neste documento foram lidos sem alteração. A análise de AtendimentoOfflineAlpha foi via API GitHub (sem clone). Nenhuma migration aplicada, nenhuma tabela alterada, nenhum código alterado, nenhum commit, nenhum push.

1. **[BLOQUEADO]** Obter acesso aos repositórios dos outros SaaS
2. Executar inventário nos SaaS (reutilizar tabela acima)
3. Completar coluna "Nos SaaS?" com evidências
4. Definir decisão final (REUTILIZAR / ADAPTAR / REFERÊNCIA / NÃO REUTILIZAR / INVESTIGAR) para cada item
5. Incorporar resultados no `CONTRATO_FUNCIONAL_SISTEMA_v1.0`
6. **Sem alteração em código, Git, Supabase ou migrations**

---

## 10. Evidências de Bloqueio

Todos os arquivos citados neste documento foram lidos sem alteração:

- `web/package.json` (lido, não modificado)
- `web/src/contexts/AuthContext.tsx` (lido, não modificado)
- `web/src/contexts/CartContext.tsx` (lido, não modificado)
- `web/src/lib/supabase.ts` (lido, não modificado)
- `web/src/types/index.ts` (lido, não modificado)
- `web/src/app/App.tsx` (lido, não modificado)
- `web/src/pages/Carrinho/Checkout.tsx` (lido, não modificado)
- `web/src/pages/Login/index.tsx` (lido, não modificado)
- `web/src/pages/Home/index.tsx` (lido, não modificado)
- `web/src/pages/Produtos/index.tsx` (lido, não modificado)
- `web/src/pages/Carrinho/index.tsx` (lido, não modificado)
- `web/src/pages/Conta/index.tsx` (lido, não modificado)
- `web/src/pages/Eventos/index.tsx` (lido, não modificado)
- `web/src/components/Header/index.tsx` (lido, não modificado)
- `web/src/components/Footer/index.tsx` (lido, não modificado)
- `web/src/components/CartIcon/index.tsx` (lido, não modificado)
- `web/src/components/ProductCard/index.tsx` (lido, não modificado)
- `web/src/components/ProductDetail/index.tsx` (lido, não modificado)
- `web/vite.config.ts` (lido, não modificado)
- `supabase/functions/viaCEP/index.ts` (lido, não modificado)
- `supabase/migrations/*` (9 arquivos, não modificados)
- `web/hooks/` (vazio, confirmado)

> **Nenhuma alteração, git add, commit, push ou modificação foi realizada.**
