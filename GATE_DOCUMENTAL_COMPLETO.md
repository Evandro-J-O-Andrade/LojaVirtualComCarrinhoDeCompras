# Gate Documental Completo — Angel Cosméticos

**Data:** 2026-09-21  
**Status:** AUDITORIA CONCLUÍDA — Matriz de Conformidade  
**Objetivo:** Ler integralmente todos os `.md` documentais, extrair requisitos/decisões, cruzar com código React + Supabase + HTML/CSS/IMG legado, e produzir matriz de conformidade.

---

## 1. Documentos Auditorados (Leitura Integral)

| # | Documento | Tamanho | Leitura | Relevância |
|---|-----------|---------|---------|------------|
| 1 | `DECISOES_NEGOCIO_v1.3.md` | 455 linhas | ✅ Integral | **CRÍTICO** — Decisões D1-D4, D9, D10 fechadas |
| 2 | `CONTRATO_DOMINIO_COMERCIAL_v1.1.md` | 777 linhas | ✅ Integral | **CRÍTICO** — Domínio comercial canônico |
| 3 | `MODELO_DE_DADOS_GATE62.md` | 2576 linhas | ✅ Integral (3 partes) | **CRÍTICO** — Schema proposto (28 tabelas) |
| 4 | `GATE_6_4A_FRONTEND.md` | 76 linhas | ✅ Integral | Frontend implementation status |
| 5 | `GATE_6_3_DERIVACAO.md` | 119 linhas | ✅ Integral | Migrations derivadas e aprovadas |
| 6 | `GATE_6_3B_AUDITORIA.md` | 299 linhas | ✅ Integral | Auditoria de migrations (APROVADA) |
| 7 | `AUDITORIA_3_DOMAIN_CONTRACT.md` | 261 linhas | ✅ Integral | Contrato de domínio (fontes técnicas) |
| 8 | `AUDITORIA_4_RELATORIO.md` | 548 linhas | ✅ Integral | Inventário funcional completo |
| 9 | `WORKSHOP_DECISOES_NEGOCIO_PROMPT.md` | 187 linhas | ✅ Integral | Contexto das decisões de negócio |
| 10 | `WORKSHOP_FECHAMENTO_D1_D4_D9_D10_PROMPT.md` | — | ✅ Integral | Workshop de fechamento |
| 11 | `GATE_6_1_REFERENCAS.md` | — | ✅ Integral | Referências bibliográficas |
| 12 | `GATE_6_1_INVENTARIO_BIBLIOTECAS.md` | — | ✅ Integral | Inventário de bibliotecas |
| 13 | `GATE_6_2_FINAL_CONSISTENCY.md` | — | ✅ Integral | Consistência final do modelo |
| 14 | `P0-AUDIT-REPORT-20260916.md` | 400 linhas | ✅ Integral | Proveniência das migrations P0 |
| 15 | `BACKEND-AUDIT-20260902.md` | 173 linhas | ✅ Integral | Backend audit (GREEN) |
| 16 | `HARDENING-SPEC.md` | 137 linhas | ✅ Integral | Spec de hardening |
| 17 | `GAP-MATRIX.md` | 112 linhas | ✅ Integral | Gap matrix 32 domínios |
| 18 | `ALLOWLIST.md` | 176 linhas | ✅ Integral | Migration allowlist (J&S - não Angel) |
| 19 | `README.md` | 3 linhas | ✅ Integral | Projeto raiz |
| 20 | `web/.env` | 6 linhas | ✅ Integral | Configuração frontend |

## 2. Matriz de Conformidade — Decisões de Negócio (D1-D4, D9, D10)

| Decisão | Requisito | Implementação | Evidência ( código/arquivo/linha ) | Status |
|---------|-----------|---------------|--------------------------------------|--------|
| **D1** Atributos de Variante | Tamanho + cor + volume/ml (opcionais) | `produto_variante`, `produto_atributo` (nome IN tamanho/cor/volume) | `web/src/types/index.ts:42-57` (ProductAttribute), `MODELO_DE_DADOS_GATE62.md:378-422` | 🟡 Parcial — tipo definido mas atributos específicos (cor, volume) não testados |
| **D2** Preço de Variante | Variante sobrescreve base + snapshot no carrinho | `produto_variante.preco`, `carrinho_item.preco_unitario` | `web/src/components/ProductDetail/index.tsx:44-47` (resolve preço variante), `web/src/pages/Carrinho/Checkout.tsx:109-110` (snapshot) | 🟢 Implementado |
| **D2** Snapshot preço | Preço congelado no carrinho | `carrinho_item.preco_unitario` | `web/src/contexts/CartContext.tsx` (CartItem.precoUnitario) | 🟢 Implementado |
| **D3** Promoções | % + R$, produto→variantes, não cumulativa, menor preço, período obrigatório | `promocao` com tipo/periodo | `web/src/types/index.ts:97-107`, `web/src/pages/Home/index.tsx:72-78` (consulta promocao) | 🟡 Parcial — consulta implementada, mas não aplicada no ProductDetail |
| **D4** Estoque | Híbrido (produto simples = produto, variante = SKU), reserva no checkout, não no carrinho | `estoque` (produto_id XOR variante_id) | `MODELO_DE_DADOS_GATE62.md:1697-1735`, `web/src/pages/Home/index.tsx:80-89` (consulta estoque) | 🟡 Parcial — estoque lido, mas NÃO há reserva transacional no checkout |
| **D4** Estoque negativo | Proibido | CHECK constraint | `GATE_6_3B_AUDITORIA.md:121-122` (ck_estoque_quantidade_fisica_positivo) | 🟢 Implementado |
| **D9** Endereço | Obrigatório no checkout, CEP + ViaCEP, número manual obrigatório | `endereco` com campos obrigatórios | `web/src/pages/Carrinho/Checkout.tsx:22-35` (ViaCEP), `web/src/pages/Carrinho/Checkout.tsx:75` (número via prompt) | 🟡 Parcial — ViaCEP funciona, mas número obrigatório via `prompt()` (UX ruim, não via formulário) |
| **D10** Status do Pedido | Dois fluxos convergem, pagamento separado | `pedido.status` + `pedido.status_pagamento` | `web/src/types/index.ts:206-233`, `MODELO_DE_DADOS_GATE62.md:1246-1250` | 🟢 Implementado |
| **D10** Estados | rascunho, processando, enviado, entregue, cancelado | `CHECK ped_status_check` | `GATE_6_3B_AUDITORIA.md:123-124` | 🟢 Implementado |

## 3. Matriz de Conformidade — Fluxos Comerciais

| Fluxo | Requisito | Implementação | Evidência | Status |
|-------|-----------|---------------|-----------|--------|
| **Checkout Site** | Carrinho → CEP → Frete → Dados → Pagamento → Pedido → Confirmação | `Checkout.tsx` (Carrinho/Checkout) | `web/src/pages/Carrinho/Checkout.tsx:38-126` | 🟡 Parcial — fluxo existe mas não valida preço/estoque server-side |
| **Checkout WhatsApp** | Carrinho → CEP → Pedido rascunho → wa.me | `Checkout.tsx` handleWhatsApp | `web/src/pages/Carrinho/Checkout.tsx:128-144` | 🟡 Parcial — NÃO cria pedido rascunho no Supabase (D7 não implementado) |
| **Pagamento** | PIX + cartão (DEC2) | Nenhum gateway integrado | `web/src/pages/Carrinho/Checkout.tsx:179` (botão placeholder) | 🔴 Não implementado |
| **Reserva estoque** | Transacional no checkout | Nenhuma implementação | Checkout.tsx não chama função de reserva | 🔴 Não implementado |
| **Atendimento humano** | Botão "Falar com humano" | Nenhum botão visível | Header não tem botão de falar com humano | 🔴 Não implementado |
| **Cadastro híbrido** | Visitante informa e-mail + endereço na finalização | AuthContext + lazy signup no checkout | `web/src/pages/Carrinho/Checkout.tsx:47-59` (lazy signup) | 🟡 Parcial — funciona mas sem validação de dados |

## 4. Matriz de Conformidade — Tabelas do Supabase (28/28)

| # | Tabela | Existe no Supabase | Frontend usa? | Observação |
|---|--------|-------------------|---------------|------------|
| 1 | categoria | ✅ 28/28 (auditado) | ✅ Home.tsx:50-54 | — |
| 2 | fornecedor | ✅ | ❌ Não consultado no frontend | — |
| 3 | produto_atributo | ✅ | ❌ Tipo definido, mas atributos não carregados | `types.ts:42` mas não usado em queries |
| 4 | produto_atributo_valor | ✅ | ❌ Não consultado | — |
| 5 | produto | ✅ | ✅ Home.tsx:57-66, Produtos.tsx | — |
| 6 | produto_imagem | ✅ | ✅ Home.tsx:61 (url, principal, ordem) | — |
| 7 | produto_categoria | ✅ | ✅ Home.tsx:63 (categoria_id) | — |
| 8 | produto_opcao_compra | ✅ | ❌ Não carregado em queries | `types.ts:109-119` mas não usado |
| 9 | produto_opcao_valor | ✅ | ❌ Não carregado | — |
| 10 | kit_composicao | ✅ | ❌ Não implementado | — |
| 11 | promocao | ✅ | ✅ Home.tsx:72-78 | Consulta, mas não aplicada em produtos |
| 12 | produto_variante | ✅ | ✅ Home.tsx:62, ProductDetail.tsx | — |
| 13 | produto_variante_atributo | ✅ | ❌ Não consultado | `types.ts:35-40` |
| 14 | cliente | ✅ | ✅ AuthContext | — |
| 15 | endereco | ✅ | ✅ Checkout.tsx:61-71 | — |
| 16 | carrinho | ✅ | ⚠️ Server-side (proposto), frontend usa localStorage | Divergência: `MODELO_DE_DADOS_GATE62.md:1118` vs implementação |
| 17 | carrinho_item | ✅ | ⚠️ Server-side (proposto), frontend usa localStorage | Divergência: `MODELO_DE_DADOS_GATE62.md:1155` vs implementação |
| 18 | pedido | ✅ | ✅ Checkout.tsx:82-94 | — |
| 19 | pedido_item | ✅ | ✅ Checkout.tsx:98-114 | — |
| 20 | pedido_status_historico | ✅ | ❌ Não implementado no frontend | Pedidos não atualizam histórico |
| 21 | pagamento | ✅ | ❌ Não implementado no frontend | Checkout cria pedido mas não pagamento |
| 22 | frete_regra | ✅ | ✅ CartContext loadFreteRegra | — |
| 23 | estoque | ✅ | ✅ Home.tsx:80-89 | Estoque lido mas sem reserva |
| 24 | estoque_movimentacao | ✅ | ❌ Não implementado | Sem movimentação no checkout |
| 25 | atendimento | ✅ | ❌ Não implementado | Sem chat/atendimento |
| 26 | atendimento_mensagem | ✅ | ❌ Não implementado | Sem chat/atendimento |
| 27 | evento | ✅ | ⚠️ Eventos.tsx consulta | `web/src/pages/Eventos/index.tsx` |
| 28 | auditoria | ✅ | ❌ Não implementado no frontend | — |

## 5. Matriz de Conformidade — Segurança (IDOR/RLS)

| Risco | Tabela | Proteção Necessária (D10) | Implementação Atual | Status |
|-------|--------|--------------------------|---------------------|--------|
| Cliente acessa pedido de outro | `pedido` | RLS: cliente_id = auth.uid() | ✅ RLS configurada | 🟢 |
| Cliente acessa carrinho de outro | `carrinho` | RLS + server-side | ⚠️ Frontend usa localStorage | 🟡 Parcial |
| Cliente acessa endereço de outro | `endereco` | RLS: cliente_id = auth.uid() | ✅ Checkout cria com cliente_id | 🟢 |
| Cliente acessa dados de outro cliente | `cliente` | RLS: id = auth.uid() | ✅ AuthContext | 🟢 |
| Admin operações privilegiadas | Todas | Edge Functions com service_role | ❌ Checkout.tsx usa cliente direto | 🔴 NÃO implementado |
| Preço confiável | — | Server-side validation | ❌ Checkout confia no frontend | 🔴 NÃO implementado |
| Estoque transacional | `estoque` | Checkout transacional | ❌ Nenhuma validação no checkout | 🔴 NÃO implementado |
| Service role no frontend | — | NUNCA no frontend | ✅ `.env` usa VITE_SUPABASE_PUBLISHABLE_KEY | 🟢 |

## 6. Matriz de Conformidade — Identidade Visual (HTML/CSS/IMG)

| Elemento Visual | HTML Legado | React Atual | Status |
|-----------------|-------------|-------------|--------|
| Logo | `logosemfundo3.png` / `logo2semfundo2.png` | `logo2semfundo2.png` | 🟡 Parcial — usa uma das logos |
| Banner principal | `grasicombaton.png` + CTA | Banner genérico + placeholder | 🔴 Não migrado |
| Categorias (3 col) | Imagens + títulos reais | Consulta DB (sem imagens) | 🔴 Visuais não migrados |
| Produtos em destaque | 8 cards com imagens/imagens | ProductCard (sem design original) | 🔴 Não migrado do HTML |
| Promoções/Ofertas | `ofertas-img` layout | Nenhuma seção de ofertas | 🔴 Não implementado |
| Depoimentos | 3 cards com cliente/real | Nenhum | 🔴 Não implementado |
| Marcas (5) | `marca-1.png` a `marca-5.png` | Nenhuma | 🔴 Não implementado |
| Footer | Layout 5-colunas + redes sociais + CNPJ | Footer minimalista | 🔴 Não migrado |
| Menu mobile | Hamburger + `menu.png` | Menu mobile com motion | 🟡 Implementado (diferente estilo) |
| CartIcon | `carrinho.png` + contador | `carrinho2.png` + contador | 🟡 Parcial (imagem diferente) |
| CSS original | `assets/css/style.css` (81KB, 3671 linhas) | `web/src/styles/legacy.css` (226 linhas) | 🔴 NÃO migrado (81KB vs 226 linhas) |
| Imagens (174) | `assets/img/` todas referenciadas | `/assets/img/` referenciadas | 🟡 Parcial — algumas imagens usadas, mas não todas as classes CSS originais |

## 7. Matriz de Conformidade — Documentos Específicos

| Documento | Requisito Extraído | Implementação | Evidência | Status |
|-----------|-------------------|---------------|-----------|--------|
| `CONTRATO v1.1 §17` | Botão "Falar com humano" (D19) | Nenhum botão no Header | `web/src/components/Header/index.tsx` — sem botão de atendimento | 🔴 Não implementado |
| `CONTRATO v1.1 §12` | Frete configurável (D5) | `frete_regra` tabela + CartContext | `web/src/contexts/CartContext.tsx` loadFreteRegra | 🟡 Parcial — tabela existe, mas sem frete por transportadora (Fase 2) |
| `DEC v1.3 D4` | Snapshot de endereço no pedido | `pedido.endereco_*` campos | `web/src/pages/Carrinho/Checkout.tsx:93` (endereco_entrega_id) + types | 🟡 Parcial — usa FK mas não copia snapshot para pedido |
| `DEC v1.3 D10` | Pedido rascunho = intenção | Checkout cria com status 'rascunho' | `web/src/pages/Carrinho/Checkout.tsx:86` | 🟢 Implementado |
| `GATE_6_3_DERIVACAO.md` | 3 migrations aprovadas | Aplicadas no Supabase | Auditado GATE_6_3B: 28/28 tabelas, 61 policies | 🟢 Implementado |
| `GATE_6_4A_FRONTEND.md` | Build + lint pass | `npm run build` e `npm run lint` | Documento confirma PASS | 🟢 Implementado |

## 8. Resumo de Gaps Críticos

| Prioridade | Gap | Documento de Origem | Impacto |
|------------|-----|---------------------|---------|
| **P0** | CSS original (81KB) não migrado | `assets/css/style.css` → `web/src/styles/legacy.css` | 🔴 Identidade visual zero no React |
| **P0** | 174 imagens reais parcialmente usadas | `assets/img/` | 🔴 Layout quebrado (imagens faltando) |
| **P0** | Botão "Falar com humano" não implementado | `CONTRATO v1.1 §17`, D19 | 🔴 Falha no atendimento |
| **P0** | Checkout não valida preço/estoque server-side | `MODELO_DE_DADOS_GATE62.md:1440-1441` | 🔴 IDOR/security breach |
| **P0** | WhatsApp checkout não cria rascunho | `DEC v1.3 D7` | 🔴 Fluxo WhatsApp quebrado |
| **P1** | Carrinho usa localStorage, não server-side | `MODELO_DE_DADOS_GATE62.md:1118-1146` | 🟡 Dados não sincronizam entre dispositivos |
| **P1** | Pagamento não integrado | `DEC2` | 🔴 Não há forma real de pagar |
| **P1** | Footer original não migrado | HTML `index.html` | 🔴 Perde CNPJ, redes sociais, app links |
| **P2** | Header não mostra usuário logado | `CONTRATO v1.1 §10.2` D8 | 🟡 UX degradada |

## 9. Conclusão

### Status Geral da Implementação

| Área | Status |
|------|--------|
| ✅ Backend (Supabase schema) | **COMPLETO** — 28/28 tabelas, 42 FKs, 61 policies |
| ✅ Migrations | **COMPLETO** — 3 migrations aprovadas e aplicadas |
| ✅ Edge Functions (viaCEP) | **IMPLEMENTADO** — v2 com CORS + validação |
| 🟡 Frontend (funcionalidade) | **PARCIAL** — 13 rotas, conexão Supabase, mas gaps em segurança/validações |
| 🟡 Frontend (tipos) | **COMPLETO** — 28 interfaces TypeScript |
| 🔴 Frontend (identidade visual) | **INCOMPLETO** — CSS original de 3671 linhas não migrado |
| 🔴 Frontend (assets) | **INCOMPLETO** — 174 imagens reais parcialmente referenciadas |
| 🔴 Atendimento humano | **NÃO IMPLEMENTADO** — sem botão D19 |
| 🔴 Pagamento | **NÃO IMPLEMENTADO** — sem gateway |
| 🔴 Reserva estoque | **NÃO IMPLEMENTADO** — checkout não valida server-side |

### Recomendação

**NÃO PROSSEGUIR** para E2E, pagamento, ou novos módulos até:

1. **Migrar CSS original** (`assets/css/style.css` → `web/public/assets/css/` ou `web/src/styles/`)
2. **Migrar imagens reais** para `web/public/assets/img/`
3. **Reconstruir Header/Footer** com HTML original
4. **Implementar botão "Flar com humano"** (D19)
5. **Revisar checkout** para server-side validation (preço, estoque, frete)

---

## 10. Matriz de Conformidade — Tabela Final

| Documento | Item Auditoriado | Código | Evidência | Status |
|-----------|------------------|--------|-----------|--------|
| `DECISOES_NEGOCIO_v1.3.md` | D1: Atributos variante (tamanho, cor, volume) | ✅ types.ts:42-57 | Schema D1 fechado, tipo definido | 🟡 Parcial |
| `DECISOES_NEGOCIO_v1.3.md` | D2: Variante sobrescreve preço + snapshot | ✅ Checkout.tsx:109-110 | `preco_unitario` no carrinho_item | 🟢 Implementado |
| `DECISOES_NEGOCIO_v1.3.md` | D3: Promoções (%+R$, não cumulativa, menor preço) | ✅ types.ts:97-107 | Tipos definidos, consulta em Home | 🟡 Parcial (não aplicada em ProductDetail) |
| `DECISOES_NEGOCIO_v1.3.md` | D4: Estoque híbrido, reserva no checkout | ✅ Schema Supabase | `estoque.produto_id XOR variante_id` | 🟡 Parcial (sem reserva) |
| `DECISOES_NEGOCIO_v1.3.md` | D9: Endereço obrigatório + ViaCEP + número | ✅ Checkout.tsx:22-35 | ViaCEP + número via prompt | 🟡 Parcial (UX ruim) |
| `DECISOES_NEGOCIO_v1.3.md` | D10: Status do pedido separado de pagamento | ✅ Schema + types | `pedido.status` + `status_pagamento` | 🟢 Implementado |
| `CONTRATO v1.1` | Produto simples ou com variantes | ✅ Schema | `produto` + `produto_variante` | 🟢 Implementado |
| `CONTRATO v1.1 §7` | Promoção por produto base | ✅ Schema + Home.tsx | `promocao.produto_id` | 🟢 Implementado |
| `CONTRATO v1.1 §8` | Estoque híbrido | ✅ Schema | 28/28 tables auditadas | 🟢 Implementado |
| `CONTRATO v1.1 §9` | Carrinho único | 🟡 types.ts | Carrinho server-side proposto, frontend usa localStorage | 🟡 Parcial |
| `CONTRATO v1.1 §10.2` | Cadastro híbrido | ✅ Checkout.tsx:47-59 | Lazy signup funciona | 🟡 Parcial |
| `CONTRATO v1.1 §11` | Endereço múltiplo + snapshot | ✅ types.ts:155-169 | `endereco.cliente_id` nullable | 🟢 Implementado |
| `CONTRATO v1.1 §12` | Frete configurável (D5) | ✅ frete_regra + CartContext | `loadFreteRegra()` | 🟡 Parcial |
| `CONTRATO v1.1 §13` | PIX + cartão (DEC2) | ❌ Nenhum pagamento | Checkout.tsx:179 (botão placeholder) | 🔴 Não implementado |
| `CONTRATO v1.1 §14` | Checkout site fluxo | ✅ Checkout.tsx:38-126 | Carrinho → CEP → Dados → Pagamento → Pedido | 🟡 Parcial |
| `CONTRATO v1.1 §15` | WhatsApp rascunho | ❌ Não cria pedido | handleWhatsApp só abre wa.me | 🔴 Não implementado |
| `CONTRATO v1.1 §16` | Pedido snapshot | ✅ types.ts:206-233 | `pedido.endereco_*` snapshot fields | 🟡 Parcial (FK + não snapshot completo) |
| `CONTRATO v1.1 §17` | "Falar com humano" (D19) | ❌ Nenhum botão | Header.tsx sem botão de atendimento | 🔴 Não implementado |
| `MODELO_DE_DADOS_GATE62.md` | 28 tabelas propostas | ✅ Supabase auditado | GATE_6_3B: 28/28 PASS | 🟢 Implementado |
| `MODELO_DE_DADOS_GATE62.md` | ExCLUDE constraint estoque | ✅ Supabase | `GATE_6_3B_AUDITORIA.md:136` | 🟢 Implementado |
| `GATE_6_3_DERIVACAO.md` | 3 migrations | ✅ Supabase aplicado | Auditoria aprovada | 🟢 Implementado |
| `GATE_6_3B_AUDITORIA.md` | Security: zero destructive ops | ✅ Auditado | 28 tables, 61 policies | 🟢 Implementado |
| `GATE_6_4A_FRONTEND.md` | Build + lint | ✅ PASS | `npm run build` PASS, `npm run lint` PASS | 🟢 Implementado |

---

> **Conclusão do Gate Documental:** O backend (Supabase schema + migrations + RLS) está completo e auditado. O frontend tem as estruturas de dados (types, contexts, rotas) implementadas, mas **a identidade visual original (CSS de 3671 linhas + 174 imagens) NÃO foi migrada para React**, e **funcionalidades críticas** (pagamento real, reserva de estoque server-side, pedido rascunho WhatsApp, atendimento humano) **não estão implementadas**. Recomenda-se migrar assets visuais antes de prosseguir para E2E.

**DOCUMENTO COMPLETO — NENHUMA ALTERAÇÃO DE CÓDIGO, MIGRATION OU PUSH REALIZADA.**