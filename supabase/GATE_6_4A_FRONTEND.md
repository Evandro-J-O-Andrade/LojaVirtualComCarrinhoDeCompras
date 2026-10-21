# Gate 6.4A — Frontend Implementation

## Status

| Item | Status | Notes |
|------|--------|-------|
| Types (28 interfaces) | ✅ concluído | `web/src/types/index.ts` |
| AuthContext | ✅ concluído | `web/src/contexts/AuthContext.tsx` |
| CartContext (frete_regra integration) | ✅ concluído | `web/src/contexts/CartContext.tsx` |
| Checkout | ✅ concluído | `web/src/pages/Carrinho/Checkout.tsx` |
| ProductCard | ✅ concluído | `web/src/components/ProductCard/index.tsx` |
| ProductDetail | ✅ concluído | `web/src/components/ProductDetail/index.tsx` |
| CartIcon | ✅ concluído | `web/src/components/CartIcon/index.tsx` |
| Home page | ✅ concluído | queries `produto` table |
| Produtos page | ✅ concluído | queries `produto` table |
| Produto page | ✅ concluído | queries `produto` table |
| Eventos page | ✅ concluído | queries `evento` table |
| Carrinho page | ✅ concluído | uses CartContext |
| Header/Footer | ✅ concluído | uses CartContext |
| Build | ✅ concluído | TypeScript + Vite: PASS |
| Lint | ✅ concluído | oxlint: PASS (warnings only) |

## Changes Made

### CartContext (`web/src/contexts/CartContext.tsx`)
- Added `loadFreteRegra(cep: string)` — fetches active `frete_regra` from Supabase
- Added `syncCarrinhoServidor()` — syncs localStorage cart to server-side `carrinho` table
- `getFreight()` now uses loaded `frete_regra` rules (tipo: fixo/por_kg/percentual_subtotal/gratis)
- Falls back to default (free > 300, else R$50) if no rules loaded
- Added `carrinhoState` — tracks server-side cart ID for sync
- Added `FreteRegra[]` state for loaded freight rules

### Checkout (`web/src/pages/Carrinho/Checkout.tsx`)
- `buscarCep` now calls `loadFreteRegra(cleanCep)` after ViaCEP lookup
- Freight calculated from loaded rules (not hardcoded)

### Eventos (`web/src/pages/Eventos/index.tsx`)
- Now queries `evento` table from Supabase
- Displays event name, status, entity type, attempts
- Filters by `status = 'pendente'`

### Types (`web/src/types/index.ts`)
- 28 interfaces matching all 28 database tables

## Build Verification

```
npm run build    → PASS (tsc -b && vite build)
npm run lint     → PASS (oxlint, warnings only)
```

## Frontend → DB Mapping

| Page | Query | Table |
|------|-------|-------|
| Home | `produto` WHERE ativo=true LIMIT 12 + `categoria` | produto, categoria |
| Produtos | `produto` WHERE ativo=true + filters | produto |
| Produto | `produto` WHERE id=:id | produto |
| Eventos | `evento` WHERE status='pendente' | evento |
| Carrinho | (localStorage + CartContext) | carrinho, carrinho_item |
| Checkout | (CartContext + viaCEP function) | pedido, pedido_item, endereco, pagamento |

## RLS Considerations for Frontend

- `frete_regra`: authenticated users can READ (used by CartContext)
- `evento`: authenticated users can READ
- `produto`, `categoria`: public read
- All admin operations via Edge Functions with `service_role`

## Pending (Future Gates)

- Runtime smoke test (start dev server + verify all pages connect to Supabase)
- Empresa page (static, no table in schema)
- Contato page (static form)
- Conta page (uses AuthContext ✅)
- Login page (uses AuthContext ✅)
