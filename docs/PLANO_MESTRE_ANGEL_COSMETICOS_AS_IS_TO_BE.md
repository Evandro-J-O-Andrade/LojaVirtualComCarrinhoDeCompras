# PLANO MESTRE — Angel Cosméticos: AS-IS → TO-BE

**Status:** Matriz de planejamento. Nenhuma implementação autorizada por este documento.
**Data:** 2026-10-21
**Base:** Auditoria consolidada (2026-10-21) + documentos históricos (BLUEPRINT, REGRA_DE_DESIGN, DECISOES_NEGOCIO, MODELO_COMERCIAL, INVENTARIO_INTEGRACAO) + código em `web/` + migrations em `supabase/`
**Projeto Supabase:** `bmqxgibhuzekxpcgosap`

---

## 1. Documentos históricos consultados

| Documento | Data | Relevância |
|---|---|---|
| `BLUEPRINT_RECONSTRUCAO_ANGEL_V1.md` | 2026-10-01 | Rebuild completo; 10 fases; identidade vinho+champagne; cinema; contrato de produto (5 imgs); bloqueios backend |
| `REGRA_DE_DESIGN_ANGEL_V1.md` | 2026-10-03 | Dark mode partículas douradas; 100dvh; composição editorial; fallback→rollback→feedback; regra de ouro comercial |
| `DECISOES_NEGOCIO_v1.0–v1.3.md` | 2026-09-15 | D1–D4, D9, D10 fechadas |
| `MODELO_COMERCIAL_COMPLETO_V1.0.md` | 2026-10-03 | 5 camadas de preço; desconto comercial; kits; orçamento; pagamento; pedido; auditoria; mimo |
| `CONTRATO_DOMINIO_COMERCIAL_v1.0/v1.1.md` | — | Contrato funcional comercial |
| `CONTRATO_FATIA_4_PRODUTOS_V1.0.md` | — | Fatia de produtos |
| `INVENTARIO_INTEGRACAO_FRONTEND_SUPABASE.md` | 2026-10-01 | 26 tabelas, 4 com dados, 22 vazias, 2 inexistentes |
| `MATRIZ_SCHEMA_REMOTO_VS_CANONICO.md` | — | Matriz schema remoto vs canônico |
| `GAP_ANALYSIS_SUPABASE_V1.0–V1.2.md` | — | Gap analysis |
| `GATE_6_1–6_4A*.md` | — | Gates documentais e frontend |
| `DECISOES_ARQUITETURA_v1.0.md` | 2026-10-21 | Decisões de arquitetura do redesenho por domínio: A1 (identificação bigint + slug) ✅ fechada; A2 (descrição estruturada) e A3 (ledger × schema) pendentes |
| `docs/P1.3–P1.7*.md` | — | Revisão de migrations de imagens |
| `docs/catalogo-visual.md`, `docs/IMAGENS_PRODUTOS.md` | — | Catálogo visual |

---

## 2. Estado atual do Git

**10 commits organizados (mais recente → mais antigo):**

| # | Hash | Mensagem | Arquivos |
|---|---|---|---|
| 1 | `8d3453b` | feat(admin): update product detail and experience rules | 3 |
| 2 | `ece31cf` | feat(ui): add shared layout, footer, and WhatsApp components | 4 |
| 3 | `3c59543` | feat(checkout): integrate CEP lookup into checkout flow | 3 |
| 4 | `4b9bf03` | feat(checkout): add CEP lookup service | 2 |
| 5 | `2c5400f` | feat(produtos): add product image upload workflow | 5 |
| 6 | `db837e5` | fix(supabase): correct ViaCEP CORS headers | 1 |
| 7 | `b91a4cc` | test(supabase): add product image principal validation scenarios | 1 |
| 8 | `253edec` | feat(supabase): add commercial, services, notifications, mimos, indexes migrations | 7 |
| 9 | `60e6c7a` | chore(web): remove unused database dependencies | 3 |
| 10 | `9bf9e8b` | feat(supabase): add RBAC/storage policies and catalog seed v2 | 3 |

**Pendentes (intencionais):** 4 deletions (migration draft + 3 test scripts), ~300 arquivos não rastreados (docs, assets, backups, diagnósticos).

---

## 3. Decisões de negócio fechadas (preservadas)

| ID | Decisão | Escolha | Status |
|---|---|---|---|
| D1 | Atributos de Variante | C — Tamanho + cor + volume/ml (opcionais, sem EAV/JSONB) | ✅ Fechada |
| D2 | Preço de Variante | B+D — Sobrescreve base + snapshot no carrinho + revalidação checkout | ✅ Fechada |
| D3 | Promoções | C+D+H/I+J+L — % ou R$ fixo, produto-base→variantes, não cumulativa, menor preço final, datas obrigatórias, sem cupons | ✅ Fechada |
| D4 | Estoque | C+E+G+H+K+M — híbrido, reserva só checkout, baixa por canal, sem negativo, devolução com validação | ✅ Fechada |
| D9 | Endereço | B+H+F+J+L — obrigatório checkout, WhatsApp F, entrega MVP, CEP+ViaCEP+número manual | ✅ Fechada |
| D10 | Status Pedido | A+D+F+I+L+N — dois fluxos convergem, pagamento separado, confirmação por canal | ✅ Fechada |

**Decisões de design fechadas:**
- Paleta: Candidata A (vinho #8E1A5C + champanhe #C4A87C + ivory #FAF7F2)
- Dark mode: vinho/preto + partículas douradas caindo (baixa opacidade, lento, reduced-motion)
- Cinema: CSS puro, sessionStorage, reduced-motion, Esc para pular
- Sem gradientes chamativos, glassmorphism, bounce elástico
- Mock visual ≠ comercial (regra de ouro)

---

## 4. Matriz mestre AS-IS → TO-BE

### Legenda de estados
- **✅ Verificado** — implementado e com evidência de funcionamento
- **⚠️ Parcial** — implementado parcialmente ou sem validação suficiente
- **❌ Ausente** — não implementado
- **🔒 Bloqueado** — depende de decisão externa ou dado real

---

### 4.1 Design System

| # | Requisito | Estado | Evidência AS-IS | TO-BE | Dependências | Prioridade |
|---|---|---|---|---|---|---|
| 1.1 | Tokens de cor (light) | ✅ Verificado | `design/tokens.ts` (161 linhas), `tailwind.config.js` | Manter | — | — |
| 1.2 | Tokens de tipografia | ✅ Verificado | `design/tokens.ts` (angelTypography), tailwind fontSize | Manter | — | — |
| 1.3 | Tokens de espaçamento/raio/sombra/motion | ✅ Verificado | `design/tokens.ts`, tailwind config | Manter | — | — |
| 1.4 | **Dark mode** | ❌ Ausente | Busca realizada por `ThemeContext`, `useTheme`, `data-theme` e `darkMode` em `web/src/` e `web/tailwind.config.js` — 0 resultados em todos os padrões. Tailwind config não possui propriedade `darkMode`. | ThemeContext + CSS vars dark + tailwind `darkMode: 'class'` + tokens dark + partículas douradas (reduced-motion) | Design tokens light (✅) | Alta |
| 1.5 | Partículas douradas (dark) | ❌ Ausente | Sem componente | Camada atmosférica, baixa opacidade, movimento lento, desligável em low-perf | 1.4 | Média |
| 1.6 | Cinema de entrada | ✅ Verificado | `design/cinema.ts`, `components/brand/CinematicIntro.tsx`, `styles/cinematic.css`, App.tsx (fora do router) | Manter (CSS puro, sessionStorage, reduced-motion, Esc, mobile reduzido) | — | — |
| 1.7 | 100dvh disciplina | ⚠️ Parcial | `.app-shell` usa `100dvh` em global.css; nem todas as seções auditadas | Cada seção respeita viewport; sem scroll duplo, footer cobrindo | Audit visual | Média |
| 1.8 | Fallback de imagem (3 níveis) | ⚠️ Parcial | REGRA_DE_DESIGN §7 documenta; `onError` no cinema; produto_imagem upload existe | Componente de imagem com fallback premium (fundo identidade, textura, categoria, ícone) | Produto page | Alta |
| 1.9 | Aliases deprecados (tailwind) | ⚠️ Parcial | `deep-rose`, `soft-black`, `warm-gray`, `rose`, `coral` presentes (legado Phase 3-9) | Remover quando migração de paleta concluir | Auditoria de uso | Baixa |
| 1.10 | CSS legado (3671 linhas) | ❌ Ausente | `assets/css/style.css` não migrado | Migrar ou descartar (Fase 10) | Go-live | Baixa |

---

### 4.2 Home e Páginas Editoriais

| # | Requisito | Estado | Evidência AS-IS | TO-BE | Dependências | Prioridade |
|---|---|---|---|---|---|---|
| 2.1 | Home (10 seções editoriais) | ⚠️ Parcial | Rotas existem; `components/sections/` existe; conteúdo não auditado | Hero → Momento → Mimos → Destaques → Kits → Experiências → História → Footer | Design system, dados reais | Alta |
| 2.2 | Composição editorial (não acumulação) | ⚠️ Parcial | REGRA_DE_DESIGN §5 documenta; implementação não verificada | Misturar hero, assimetria, editorial, produto, texto, números, storytelling | 2.1 | Alta |
| 2.3 | Páginas institucionais (Sobre, Contato, Atendimento) | ⚠️ Parcial | Rotas existem; textos legados a preservar | Re-skin com textos reais | Conteúdo editorial | Média |
| 2.4 | Diagnóstico (ficha de pele) | ⚠️ Parcial | Rota `/diagnostico` existe | Funcional com dados reais | — | Baixa |

---

### 4.3 Catálogo, Produtos, Variantes, Imagens, Kits

| # | Requisito | Estado | Evidência AS-IS | TO-BE | Dependências | Prioridade |
|---|---|---|---|---|---|---|
| 3.1 | Catálogo com filtros/busca/grid | ⚠️ Parcial | `domains/produtos/` existe; leitura de produto parcial | Filtros por querystring, busca, ordenação, estados vazio/erro/loading | Dados reais | Alta |
| 3.2 | Página de produto (galeria 5 imgs, zoom, fullscreen) | ⚠️ Parcial | `domains/produtos/` existe; upload implementado; galeria frontend não confirmada | Galeria com zoom on hover, fullscreen, swipe mobile, teclado, acessibilidade | Upload (✅) | Alta |
| 3.3 | Variantes (tamanho/cor/volume) | ⚠️ Parcial | `produto_variante` tabela existe, 1 linha seed; frontend parcial | Resolução de variante → preço (D2) → estoque (D4); combinação inexistente = não vendável | D1 fechada | Alta |
| 3.4 | Imagem upload (admin) | ✅ Verificado | `ProdutoImagemUpload.tsx` (10KB), `produtoImagem.service.ts`, RPC `produto_imagem_definir_principal` (SECURITY DEFINER) | Manter | Migration 004 v2 (✅) | — |
| 3.5 | Kits | ⚠️ Parcial | `kit_composicao` tabela existe, 0 linhas; frontend não consome | Kit = produto com `kit_composicao`; disponibilidade derivada dos componentes; reserva fan-out | Estoque (⚠️) | Média |
| 3.6 | Atributos (produto_atributo/valor) | ❌ Ausente | Tabela existe, 0 linhas; frontend não consome | Implementar quando variantes forem necessárias | 3.3 | Média |
| 3.7 | Opções de compra | ❌ Ausente | Tabela existe, 0 linhas | Implementar | — | Baixa |

---

### 4.4 Motor Comercial

| # | Requisito | Estado | Evidência AS-IS | TO-BE | Dependências | Prioridade |
|---|---|---|---|---|---|---|
| 4.1 | 5 camadas de preço (catálogo→oferta→negociação→pagamento→snapshot) | ❌ Ausente | MODELO_COMERCIAL documenta; frontend não implementa | Ordem de resolução imutável: base → variante → promoção → desconto comercial → frete → total → snapshot | D2, D3 | Alta |
| 4.2 | Promoções (% ou R$ fixo) | ⚠️ Parcial | `promocao` tabela existe, 0 linhas; frontend não consome | CRUD admin, período obrigatório, não cumulativa, menor preço final, aplica a variantes | D3 fechada | Alta |
| 4.3 | Desconto comercial (negociação) | ❌ Ausente | Tabela `desconto_comercial` candidata a gap (não criada); sem UI | Concessão por vendedor/admin autenticado, teto configurável, rastreável, preservado na conversão | Orçamento (⚠️) | Alta |
| 4.4 | Kits (preço próprio, disponibilidade derivada) | ⚠️ Parcial | `kit_composicao` tabela existe, 0 linhas | Kit = produto com composição; disponibilidade derivada; reserva fan-out atômica | Estoque (⚠️) | Média |
| 4.5 | Carrinho (snapshot preço, qty sync, totals) | ✅ Verificado | Commits 3c59543, 4b9bf03; CEP service 16 testes; localStorage | Manter | — | — |
| 4.6 | Checkout (CEP, pickup=R$0, price authority) | ✅ Verificado | Commits 3c59543, 4b9bf03; ViaCEP CORS fix | Manter + reserva atômica (D4) | Estoque (⚠️) | Alta |
| 4.7 | Endereço (ViaCEP + número manual) | ✅ Verificado | CEP service 16 testes; checkout integrado | Manter + endereços salvos (múltiplos, snapshot no pedido) | — | — |
| 4.8 | Frete (regra configurável) | ❌ Ausente | `frete_regra` tabela existe, 0 linhas; frontend não consome | Implementar cálculo por regra | — | Média |
| 4.9 | Snapshot comercial (preço, desconto, frete, endereço) | ❌ Ausente | Documentado (D2, D9, D10); não implementado | Congelar tudo ao confirmar pedido | Pedido (❌) | Alta |

---

### 4.5 Pedidos, Pagamento, Orçamento

| # | Requisito | Estado | Evidência AS-IS | TO-BE | Dependências | Prioridade |
|---|---|---|---|---|---|---|
| 5.1 | Pedidos (5 estados, histórico) | ❌ Ausente | `domains/pedidos/` diretório vazio | rascunho→processando→enviado→entregue→cancelado; `pedido_status_historico`; snapshot comercial | 4.9, Pagamento | Alta |
| 5.2 | Pagamento (PIX, cartão) | ❌ Skeletal | `domains/pagamentos/` — providers.ts 1.7KB, repo 0.9KB, webhook | PIX QR code, cartão, webhook confirma, status_pagamento separado, estorno | Gateway (externo) | Alta |
| 5.3 | Orçamento (negociação, conversão) | ⚠️ Parcial | `domains/orcamentos/` — NovoOrcamentoPage 27KB, repos local+supabase; tabela `orcamento` inexistente no remoto (PGRST205) | Tabela no Supabase, negociação com desconto comercial, conversão auditada, snapshot | Migration futura | Alta |
| 5.4 | Confirmação por canal (site=pagamento, WhatsApp=vendedor) | ❌ Ausente | Documentado (D10); não implementado | Site: pagamento aprovado → processando; WhatsApp: vendedor confirma → processando | 5.1, 5.2 | Alta |
| 5.5 | Cancelamento até envio | ❌ Ausente | Documentado (D10-I); não implementado | Cancelamento respeita situação do pedido/pagamento; libera reserva | 5.1 | Média |
| 5.6 | Devolução/troca (processo separado) | ❌ Ausente | Documentado (D10-L); não implementado | Processo próprio com movimentações de retorno | 5.1 | Baixa |

---

### 4.6 Clientes, Auth, RBAC, Auditoria

| # | Requisito | Estado | Evidência AS-IS | TO-BE | Dependências | Prioridade |
|---|---|---|---|---|---|---|
| 6.1 | Auth (cliente + admin) | ✅ Verificado | AuthContext, AdminPermissionContext, ProtectedRoute | Manter | — | — |
| 6.2 | RBAC/permissoes | ✅ Verificado | Migration 20261011000002 (RBAC admin storage) | Manter | — | — |
| 6.3 | Conta do cliente (perfil, favoritos, pedidos, endereços) | ⚠️ Parcial | `domains/conta/` — 8 páginas, integração Supabase parcial | Integração endpoint a endpoint com Supabase | Auth (✅) | Alta |
| 6.4 | Gestão de clientes (admin) | ❌ Ausente | Sem CRUD de clientes no admin | CRUD admin, perfil, mimos, endereços | — | Média |
| 6.5 | Usuários internos (vendedor, admin) | ⚠️ Parcial | AdminPermissionContext existe; gestão não auditada | CRUD de usuários internos com papéis | RBAC (✅) | Média |
| 6.6 | Auditoria (tabela + frontend) | ⚠️ Parcial | `auditoria` tabela existe, 0 linhas; frontend não consome | Registro de atos sensíveis (desconto, aprovação, conversão, cancelamento, estorno) | — | Média |
| 6.7 | Mimos (benefícios) | ⚠️ Parcial | `domains/mimos/` existe; migration 20261003000005; frontend não auditado | Curadoria editorial, referencia produtos/kits/promoções reais, sem preço próprio | — | Média |

---

### 4.7 Estoque, PDV, Fornecedores

| # | Requisito | Estado | Evidência AS-IS | TO-BE | Dependências | Prioridade |
|---|---|---|---|---|---|---|
| 7.1 | Estoque (híbrido, reserva, baixa) | ⚠️ Parcial | `estoque` tabela existe, 0 linhas; frontend parcial | Movimentação registrada, reserva atômica no checkout, baixa por canal, sem negativo | D4 fechada | Alta |
| 7.2 | Movimentação de estoque | ❌ Ausente | `estoque_movimentacao` tabela existe, 0 linhas; frontend não consome | Registrar entradas/saídas/baixas/devoluções | 7.1 | Média |
| 7.3 | PDV | ❌ Ausente | Sem módulo | Ponto de venda com estoque, pagamento, recibo | Estoque, Pagamento | Baixa (pós-MVP) |
| 7.4 | Fornecedores | ⚠️ Parcial | 3 registros fictícios (CNPJs sequenciais); modelo correto | Substituir por dados reais (nome, CNPJ válido, contato) | Dado de negócio | Média |

---

### 4.8 Serviços, Agendamento, Notificações

| # | Requisito | Estado | Evidência AS-IS | TO-BE | Dependências | Prioridade |
|---|---|---|---|---|---|---|
| 8.1 | Serviços/Agendamento | ⚠️ Parcial | `domains/services/`, `domains/booking/` existem; migration 20261003000003 | UI de agendamento funcional | — | Média |
| 8.2 | Notificações (WhatsApp/email) | ⚠️ Parcial | Migration 20261003000004; frontend não consome | Notificações por evento (pedido, orçamento, mimo) | — | Baixa |

---

### 4.9 Supabase (Schema, Migrations, RLS, RPCs)

| # | Requisito | Estado | Evidência AS-IS | TO-BE | Dependências | Prioridade |
|---|---|---|---|---|---|---|
| 9.1 | Migrations base (schema) | ✅ Verificado | 3 aplicadas: 202609190101 (base), 0102 (indexes), 0103 (RLS) | Manter | — | — |
| 9.2 | Migrations adicionais (commercial, services, notifications, mimos, indexes) | ✅ Verificado | 7 aplicadas: 20261003000001–0008 | Manter | — | — |
| 9.3 | Migration 004 v2 (imagem principal RPC) | ✅ Verificado | Version 20261017023347; RPC `produto_imagem_definir_principal`; índice `produto_imagem_principal_unica`; 14 imgs/13 produtos | Manter | — | — |
| 9.4 | RBAC/Storage policies | ✅ Verificado | 20261011000002 (RBAC admin storage) | Manter | — | — |
| 9.5 | RLS produto_imagem anon read | ✅ Verificado | 20261011000003 | Manter | — | — |
| 9.6 | Tabela `orcamento`/`orcamento_item` | 🔒 Bloqueado | Inexistente no remoto (PGRST205); migration draft removida intencionalmente | Criar via migration revisada (incorporar desconto comercial, condição pagamento, histórico, conversão) | Decisão de negócio + revisão | Alta |
| 9.7 | Tabela `desconto_comercial` | ❌ Ausente | Candidata a gap (não criada) | Criar via migration (ator, tipo, valor, teto, vinculação) | 9.6 | Alta |
| 9.8 | Dados reais (catálogo) | 🔒 Bloqueado | 13 produtos seed (test data); 0 imagens; fornecedores fictícios; categoria "Esmalgue" | Substituir por catálogo real (PDF pendente); corrigir "Esmalgue"→"Esmalte" | Dado de negócio | Alta |
| 9.9 | Eventos (galeria) | 🔒 Bloqueado | `evento` tabela existe, 0 linhas; sem tabela de imagens; fotos soltas em disco | Definir se galeria nasce como acervo em disco ou popular `evento` | Decisão de negócio | Baixa |
| 9.10 | `is_admin()` (sessão real) | 🔒 Bloqueado | Requer sessão auth real; B1 validation bloqueada | Validar com admin password (Auth ≠ DB password) | Credencial admin | Alta |

---

### 4.10 Testes, Acessibilidade, SEO, Performance

| # | Requisito | Estado | Evidência AS-IS | TO-BE | Dependências | Prioridade |
|---|---|---|---|---|---|---|
| 10.1 | Testes (CEP) | ✅ Verificado | `web/src/domains/checkout/services/cep.test.ts` — 16 testes passam (normalização, sucesso, inválido, inexistente, erros de servidor/rede) | Manter + expandir | — | — |
| 10.2 | Testes (imagem upload) | ✅ Verificado | `ProdutoImagemUpload.test.tsx` (10KB) | Manter | — | — |
| 10.3 | Testes (admin produtos) | ✅ Verificado | `useAdminProdutos.test.tsx`, `AdminProdutosPage.contract.test.tsx` | Manter | — | — |
| 10.4 | Testes (conta) | ⚠️ Parcial | `ContaProtegida.test.tsx`, `AccountContext.test.tsx`, `conta.test.ts` | Expandir cobertura | — | Média |
| 10.5 | Acessibilidade (a11y) | ⚠️ Parcial | `:focus-visible`, `prefers-reduced-motion` em global.css; não auditado sistematicamente | Auditoria WCAG 2.1 AA | — | Média |
| 10.6 | Responsividade | ⚠️ Parcial | Tailwind breakpoints; não auditado em 8 larguras | Testar em 8 larguras (blueprint §10) | — | Média |
| 10.7 | SEO (robots, sitemap, OG) | ⚠️ Parcial | `robots.txt`, `sitemap.xml` existem mas apontam para URLs PHP antigas | Reconciliar URLs, OG images, JSON-LD | Go-live | Baixa |
| 10.8 | Performance (CSS bundle, LCP) | ⚠️ Parcial | Lição registrada (HTTP 200 ≠ estilo); cinema.png 968KB PNG | Converter cinema.png para WebP; verificar CSS bundle size | — | Média |

---

## 5. Fases de implementação (ordenadas por dependência)

> **Nota:** Fases 0 e 1 refletem evidência verificada no código. Fases 2–10 são herdadas do `BLUEPRINT_RECONSTRUCAO_ANGEL_V1.md` § 10 (2026-10-01) e ainda não foram auditadas individualmente contra o código atual. Commits relevantes vinculados quando confirmados.

### Fase 0 — Saneamento (JÁ CONCLUÍDA parcialmente)
- ✅ Build verde (tsc + vite) — verificado
- ✅ Tailwind instalado e funcionando (CSS 23.93KB) — verificado (lição registrada: HTTP 200 ≠ estilo)
- ✅ Tokens de design light mode — `design/tokens.ts` (161 linhas)
- ✅ Cinema de entrada — `design/cinema.ts`, `components/brand/CinematicIntro.tsx`, `styles/cinematic.css`
- ⚠️ `barrinhoDeCompras/` removido (absorvido em tokens) — commit não isolado
- ❌ URLs antigas não mapeadas (pendente Fase 10)
- ❌ Legado não removido (pendente Fase 10)

### Fase 1 — Fundação (PARCIALMENTE CONCLUÍDA)
- ✅ Paleta, tipografia, tokens, tailwind.config.js, global.css — verificado
- ❌ Dark mode (0% implementado) — busca por `ThemeContext`, `useTheme`, `data-theme`, `darkMode` = 0 resultados (ver § 4.1 item 1.4)
- ❌ Partículas douradas — referência: `REGRA_DE_DESIGN_ANGEL_V1.md` § 2

### Fase 2 — Primitivos (NÃO INICIADA — herdada do blueprint)
- Button, Input, Badge, Card, Container, Section, Text, Field
- Storybook-less smoke page, a11y básico
- Evidência: nenhum primitivo dedicado encontrado em `components/` além dos existentes

### Fase 3 — App Shell (PARCIALMENTE CONCLUÍDA)
- ✅ Header, Footer (modificado — Phone icon, WhatsApp link, social icons), WhatsAppFloat, WhatsAppLogo, Layout — commits ece31cf
- ✅ Cinema de entrada — `design/cinema.ts`, `components/brand/CinematicIntro.tsx`
- ❌ AnnouncementBar — não encontrado
- ❌ MegaMenu — não encontrado
- ❌ MobileNav — não encontrado

### Fase 4 — Home (NÃO INICIADA / PARCIAL — herdada do blueprint)
- Hero editorial, categorias, destaques, trusting, kits
- Layout em 8 larguras
- Evidência: `components/sections/` existe mas conteúdo não auditado individualmente

### Fase 5 — Catálogo (PARCIAL — herdada do blueprint)
- Grid, filtros, busca, ordenação, vazio/erro/carregando
- Filtros por querystring
- Evidência: `domains/produtos/` existe; leitura de produto parcial

### Fase 6 — Produto (PARCIAL — herdada do blueprint)
- Galeria 5 imgs, zoom, fullscreen, variantes, relacionados
- Touch e teclado testados
- Evidência: upload implementado (commit 2c5400f); galeria frontend não confirmada

### Fase 7 — Comercial (PARCIAL)
- ✅ Carrinho e Checkout (CEP, price authority) — commits 3c59543, 4b9bf03
- ❌ Reserva atômica de estoque — não implementado
- ❌ Desconto comercial — não implementado
- ❌ Frete por regra — `frete_regra` tabela existe, 0 linhas

### Fase 8 — Institucionais (PARCIAL — herdada do blueprint)
- Sobre, Contato, Atendimento, Diagnóstico, Conta, Favoritos
- Textos preservados
- Evidência: rotas existem; integração Supabase parcial (não confirmada endpoint a endpoint)

### Fase 9 — Admin (PARCIAL)
- ✅ Re-skin do CRUD de produtos + imagem upload — commits 2c5400f, 8d3453b
- ❌ PDV — sem módulo
- ❌ Gestão de clientes — sem CRUD
- ❌ Gestão de estoque — sem UI
- ❌ Gestão de promoções/descontos — sem UI

### Fase 10 — SEO e Performance (NÃO INICIADA — herdada do blueprint)
- Reconciliar robots.txt/sitemap.xml, OG images, Core Web Vitals, a11y audit
- Lighthouse e rastreamento de rota
- Evidência: `robots.txt` e `sitemap.xml` existem mas apontam para URLs PHP antigas

---

## 6. Bloqueios para a primeira fase de implementação

1. **Dark mode** não pode ser implementado sem decisão sobre: (a) ThemeContext vs CSS-only toggle, (b) persistência (localStorage vs sessionStorage), (c) partículas: canvas vs CSS, (d) performance budget para partículas em mobile. Referência: `REGRA_DE_DESIGN_ANGEL_V1.md` § 2 (partículas: baixa opacidade, movimento lento, `prefers-reduced-motion`, desligável em low-perf).
2. **Catálogo real** bloqueado: PDF do catálogo não fornecido; 13 produtos são seed de teste; fornecedores fictícios
3. **Orçamento** bloqueado: tabela inexistente no remoto; migration draft removida intencionalmente
4. **B1 validation** bloqueada: requer sessão válida do Supabase Auth (admin password da conta Auth, distinta da senha do banco PostgreSQL). Enquanto não houver sessão Auth válida, `is_admin()` retorna false e B1 permanece bloqueado.
5. **Upload pilot** bloqueado: requer admin Auth password
6. **Evento/galeria** bloqueada: 0 dados, sem tabela de imagens, fotos soltas

---

## 7. Conflitos que exigem decisão humana

| Conflito | Documentos envolvidos | Decisão necessária |
|---|---|---|
| Dark mode: tokens dark não existem | REGRA_DE_DESIGN (prevê dark) vs tokens.ts (só light) vs tailwind.config.js (sem propriedade `darkMode`) | Criar tokens dark ou usar CSS vars com override? |
| Orçamento: tabela inexistente vs UI complexa (27KB) | INVENTARIO (PGRST205) vs domains/orcamentos/ | Criar tabela via migration ou simplificar UI? |
| Catálogo real vs seed de teste | INVENTARIO (13 seed) vs BLUEPRINT (catálogo real) | Quando substituir seed por dados reais? |
| PDV: escopo MVP? | MODELO_COMERCIAL (menciona PDV) vs BLUEPRINT (10 fases, sem PDV) | PDV é MVP ou pós-MVP? |
| Mimos: tabela vs curadoria | ESPECIFICACAO_MIMOS (tabela) vs MODELO_COMERCIAL (curadoria editorial) | Mimo é tabela ou referência a produto? |
| Desconto comercial: tabela nova | MODELO_COMERCIAL (candidata a gap) vs migrations (não existe) | Criar `desconto_comercial` ou usar campo em `orcamento`? |
| Descrição estruturada do produto (A2) | `produto_atributo`/`produto_atributo_valor` (EAV já aplicado) vs D1 ("sem EAV/JSONB" para **variante**) vs `produto.descricao` texto único | EAV de produto + `descricao_resumida`, 5 colunas em `produto`, ou EAV sem coluna resumida? → `DECISOES_ARQUITETURA_v1.0.md` A2 |
| Ledger `schema_migrations` × schema real (A3) | 7 migrations registradas e nunca aplicadas vs 29 tabelas reais | Reverter linhas falsas, renomear arquivos ou reconstruir o schema? → `DECISOES_ARQUITETURA_v1.0.md` A3 |

---

## 8. Próxima etapa recomendada

**Não iniciar implementação de nenhum módulo isoladamente.** A matriz acima deve ser revisada pelo humano para:

1. Confirmar prioridades (quais fases são MVP vs pós-MVP)
2. Resolver conflitos da seção 7
3. Fornecer credencial admin (desbloquear B1, upload pilot)
4. Fornecer catálogo real (desbloquear dados)
5. Decidir sobre orçamento (migration vs simplificação)

Após revisão, a primeira fase de implementação deve ser escolhida com base nas dependências reais, não apenas na aparência das telas.

---

**Fim do documento. Aguardando revisão humana antes de qualquer implementação.**
