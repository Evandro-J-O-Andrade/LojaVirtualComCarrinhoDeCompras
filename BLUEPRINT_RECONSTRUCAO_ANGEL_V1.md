# BLUEPRINT DE RECONSTRUÇÃO — ANGEL COSMÉTICOS v1

**Status:** Especificação. Nenhum código de produto alterado por este documento.
**Data:** 2026-10-01
**Escopo:** Frontend (identidade, design system, experiência de produto, fluxos comerciais).
**Fora de escopo:** Supabase, migrations aplicadas, RLS, Storage, backend PHP, conteúdo editorial.

---

## 1. Decisão arquitetural

Esta reconstrução **não é um refactor**. O frontend atual deixa de ser a base
visual e funcional e passa a ser tratado como **depósito de ativos e conhecimento**.

O objetivo é uma rebuild completa da camada de apresentação e dos fluxos de
compra, preservando apenas o que tem valor técnico ou SEO comprovado.

**Marca apresentada ao cliente:** Angel Cosméticos.
**"Angel Commerce":** apenas identificador técnico interno (nome de pacote,
prefixo de variáveis). Nunca aparece na interface.

---

## 2. Estado real do repositório (auditado 2026-10-01)

Medições reais, sem estimativa:

| Local | Arquivos | Bytes | Observação |
|---|---|---|---|
| `web/src` | 60 (`.ts`/`.tsx`/`.css`) | 149.709 | SPA ativa, React 19 |
| `web/public/assets` | ~240 | ~90 MB | Legado PHP: CSS (101 KB), JS (30 arquivos), imagens, vídeo 4,2 MB |
| `web/_legacy_styles` | 1 | 81.627 | `legacy.css` — **nenhuma referência no `src`** (órfão) |
| `web/_legacy_assets` | 3 | 27.934 | `hero.png`, `react.svg`, `vite.svg` — **órfãos** |
| `web/public/images` | 5 | ~540 KB | Curadoria já migrada do legado |
| `assets/` (raiz) | 272 | 138.604.164 | Acervo do site legado |
| `references/` | 7.519 | 555.624.807 | Referências externas (J&S, etc.) |
| `supabase/` | 29 | 99.329 | Migrations e SQL redigidos |

**Estado Git:** tudo não rastreado (`?? web/`, `?? supabase/`, `?? assets/`…).
Modificados: `.gitignore`, `package.json`, `package-lock.json`.
Nenhum commit foi criado nesta fase.

**Rotas atuais:** 17 declaradas em `web/src/routes/AppRouter.tsx`.

**Build:** `npm run build` (`tsc -b && vite build`) aprovado. Bundle anterior:
639,77 kB / gzip 175,74 kB. `noUnusedLocals` e `noUnusedParameters` ativos.

**Dependências relevantes já instaladas:** `react@19`, `react-router-dom@7`,
`@tanstack/react-query@5`, `@supabase/supabase-js@2`, `motion@13`,
`lucide-react`, `sonner`, `react-hook-form`, `zod`, `jspdf`, `vite-plugin-pwa`.
Vitest + Testing Library disponíveis.

> **Implicação:** o cinema de entrada e a galeria com zoom **não exigem nova
> dependência**. `motion` e a stack de gestos Pointer Events cobrem tudo.

---

## 3. Classificação do patrimônio

### 3.1 PRESERVAR (não tocar)

| Item | Caminho | Motivo |
|---|---|---|
| Verificação Google | `google830b1a727b681834.html`, `google8bbb07b1cfd519ac.html` | Ownership do Search Console |
| `robots.txt` | `web/public/robots.txt` | Indexação |
| `sitemap.xml` | `web/public/sitemap.xml` | Indexação |
| PWA manifest | `web/public/site.webmanifest`, `public/favicon.*`, `icons.svg` | Branding técnico / instalação |
| Env e build | `.env`, `.env.example`, `.env.local`, `vite.config.ts`, `tsconfig.*` | Infraestrutura |
| Pacotes | `web/package.json` | Stack aprovada |
| Migrations Supabase | `supabase/migrations/**` | Fonte de verdade do banco |
| Storage | `product-images` (bucket público) | Acervo de imagens |
| SEO helper | `web/src/lib/seo.tsx` | Já centralizado e correto |
| Contextos de domínio | `CartContext`, `AuthContext`, `FavoritesContext` | Lógica de negócio, não visual |

### 3.2 REUTILIZAR COMO REFERÊNCIA (ler, não copiar)

| Item | Uso |
|---|---|
| `web/src/pages/**` | Mapear jornadas, campos de formulário, consultas Supabase |
| `web/src/components/admin/**`, `dashboard/**` | Regras de CRUD e rotas admin |
| `web/src/lib/supabase.ts`, `utils.ts` | Cliente e formatadores (BRL, datas) |
| Textos de `Sobre`, `Contato`, `Atendimento` | Conteúdo editorial válido do negócio |
| `references/jstercerizados/**` | **Ler a técnica de entrada cinematográfica**, sem copiar identidade visual |
| `assets/img/**` | Acervo de fotos de produto e marca (fonte para as 5 imagens) |

### 3.3 RECONSTRUIR (o núcleo do trabalho)

- Design tokens, tipografia, paleta, motion, superfícies
- Camada de estilos (`design/`, `styles/`)
- Design system de primitivos
- App Shell: Header, navegação, Footer, AnnouncementBar
- Cinema de entrada
- Home
- Catálogo (filtros, busca, grid)
- Página de produto (galeria 5 imagens, zoom, fullscreen, variantes)
- Carrinho, Checkout, Conta, Favoritos
- Páginas institucionais
- Área administrativa (re skin, mesma lógica)

### 3.4 DESCARTAR (legado sem valor)

| Item | Motivo |
|---|---|
| `web/public/assets/css/**` (101 KB) | CSS do site PHP, não referenciado pelo Vite |
| `web/public/assets/js/**` (30 arquivos) | JS vanilla do site legado; `server.mjs`, `carrinhofull2`, `carrinho copy` são duplicatas |
| `web/_legacy_styles/legacy.css` | Órfão: zero imports |
| `web/_legacy_assets/**` | Boilerplate Vite/React (`react.svg`, `vite.svg`) |
| `barrinhoDeCompras/**` (raiz) | Diretório acidental — ver §11 |
| Componentes visuais atuais | Serão reescritos; ver §7 |

**Nenhum arquivo de 3.4 será removido antes do Gate da Fase 0.**

---

## 4. Identidade visual — DECIDIDA

**Direção:** premium editorial + boutique de cosméticos contemporâneos.
Sensação de luxo acessível, sophistication e cuidado — não template Shopify,
não infantil, não "empório escolar com fundo rosa".

> **DECIDIDO em 2026-10-01: Candidata A (vinho + champanhe).**

> Nota de método: a paleta foi escolhida entre duas candidatas concretas:

**Candidata A — Vinho / champanhe** (presente no rascunho `barrinhoDeCompras/`)
```
primary       #8E1A5C   vinho profundo
primary-dark  #6D1448
primary-light #A82A6E
accent        #C4A87C   champanhe
background    #FAF7F2   ivory quente
text          #2D2420
```

**Candidata B — Rosa / nude** (paleta atual em `web/`)
```
primary       #C2185B   rosa intenso
accent        #D4A574
background    #FAF5F0
```

**Resultado:** A — vinho + champanhe. Sustenta o Positioning "sophisticated /
forte" e funciona para as três categorias (beleza, moda feminina, cama/mesa/banho)
sem ficar presa a maquiagem. A Candidata B foi descartada por ser mais genérica e
mais específica de maquiagem.

**Onde a paleta vive agora**
- `web/tailwind.config.js` — escala Tailwind (tokens de marca + camadas legacy)
- `web/src/design/tokens.ts` — espelho em TypeScript para consumo em JS
- `web/src/styles/global.css` — reset, base, primitivos de componente

**Tipografia**
- Display / editorial: **Cormorant Garamond** (serifa de alto contraste)
- Títulos de seção: **Playfair Display**
- Corpo / UI: **Inter**
- Utilitário (preço, SKU): **Inter tabular-nums**

**Superfícies e efeitos**
- Fundo ivory quente, cartões brancos, bordas champanhe
- Sombras suaves e quentes (nunca cinza puro)
- Cards com elevação mínima e transição de 300 ms
- **Sem gradientes chamativos, sem glassmorphism, sem bounce elástico**

**Motion**
- Durações: `fast 150ms`, `normal 300ms`, `slow 500ms`
- Easing: `cubic-bezier(0.16, 1, 0.3, 1)`
- Nada de overshoot/spring em transições comerciais

---

## 5. Cinema de entrada — especificação

**Objetivo:** abertura cinematográfica que apresentação a marca e entrega à Home.
Inspiração técnica em `references/jstercerizados`; identidade **Angel**.

### 5.1 Comportamento

```
overlay preto/vinho → marcaANGEL COSMÉTICOS
        ↓ (linha de Hairline se desenha, 600ms)
        ↓ (wordmark entra com fade + tracking, 900ms)
        ↓ (cena/imagem entra em escala suave, 800ms)
        ↓ overlay sai para cima revelando a Home, 700ms
```

**Duração total alvo:** ≤ 1,6 s. Curto o bastante para não irritar.

### 5.2 Regras obrigatórias

| Regra | Implementação |
|---|---|
| `prefers-reduced-motion` | Intro **não executa**. Vai direto para a Home. |
| SEO | O conteúdo real da Home renderiza **por baixo** do overlay. Nada de tela vazia para o crawler. |
| Execução | **Uma vez por sessão** (`sessionStorage`). Não a cada navegação. |
| Sem JS | Intro é puramente CSS. Sem JS → intro toca e some (ou nunca aparece). |
| Scroll | `overflow: hidden` no body enquanto ativo; liberado no fim. |
| Escape | Tecla `Esc` ou clique pula a intro imediatamente. |
| Foco | Foco preso no overlay enquanto ativo; devolve ao `body` ao sair. |
| Performance | Sem vídeo no caminho crítico. `poster` estático primeiro; o vídeo de 4,2 MB só é montado após `LCP` e nunca em `prefers-reduced-motion`. |
| Mobile | Sequência reduzida: sem parallax, sem vídeo, 900 ms. |
| Rota | Não aparece em `/admin*`. |

### 5.3 Implementado em 2026-10-01

```
web/src/design/cinema.ts                    # paleta e tempo da sequência
web/src/components/brand/CinematicIntro.tsx # o palco
web/src/components/brand/AngelWordmark.tsx  # lockup "Angel Cosméticos"
web/src/styles/cinematic.css                # palco, frame, identidade, keyframes
```

Montado no App Shell em `web/src/app/App.tsx`, **fora** do router: a intro pertence
ao shell, não a uma rota. Sem dependência nova. `motion` não foi usado — a
sequência é CSS puro com `animation-delay`, o que remove JavaScript do
caminho crítico e mantém a intro funcionando mesmo se o bundle atrasar.

Sequência real (total ≈ 3.700 ms):

| t | Evento |
|---|---|
| 0 ms | Vinho profundo entra como palco |
| 200 ms | `cinematic.png` assenta de `scale(1.08)` para `scale(1)` |
| 600 ms | Fio de champagne se desenha |
| 900 ms | **ANGEL** entra com `blur(10px)` → 0 e tracking `0.5em` → `0.26em` |
| 1.500 ms | "Cosméticos" em itálico champanhe + tagline |
| 2.900 ms | Cortina sobe revelando o Home |
| 3.700 ms | Desmonta |

### 5.4 Decisão sobre o asset do cinema — DOCUMENTADA

Asset escolhido: **`web/public/assets/img/cinematic.png`**.

Medições reais:

```
968 KB   719 × 1280   ratio 0.562 (retrato 9:16)
```

**Restrição encontrada:** o asset é **vertical**, não horizontal. Em 1920 px de
largura ele sofreria upscale de ~2,7× e pareceria borrado.

**Decisão:** o frame **não** é esticado em full-bleed no desktop. Ele é
apresentado como um *still* vertical centralizado sobre o palco vinho —
que é a leitura editorial premium, e respeita a orientação nativa do asset.
Em `< 640 px` o frame passa a ocupar a tela inteira, onde 9:16 casa com o
viewport e o `object-position` recorta a parte superior da composição.

**Consequências e riscos assumidos:**

1. **Peso: 968 KB de PNG** na primeira visita, atrás da dobra. Aceito por ora
   porque a intro toca uma vez por sessão, mas é o **P1 de performance** mais
   provável. Correção recomendada: converter para WebP (~120 KB esperado) e
   usar `<picture>` com `avif`/`webp`/`png`. **Não instalei ferramenta de
   conversão** — isso altera dependências.
2. Se houver um **`cinematic.png` em versão horizontal**, ele substitui o
   tratamento de frame e libera o full-bleed no desktop.
3. **Não pude inspecionar a imagem visualmente.** Este modelo não tem entrada
   de imagem; a composição, o enquadramento e o contraste da foto **não foram
   verificados por olho**. As medições acima são de metadados do arquivo.

### 5.5 Fallbacks implementados

| Falha | Comportamento |
|---|---|
| `prefs-reduced-motion: reduce` | Componente nem renderiza; Home direta; flag de sessão gravada |
| Imagem 404 / erro de rede | `onError` → palco tipográfico com gradiente vinho, cinema segue |
| `sessionStorage` bloqueado | Intro repete; nada quebra |
| Navegação em `/admin*` | Intro nunca aparece |
| JS desabilitado | Home renderiza normalmente (SSR-less SPA: mostra-se o conteúdo) |

---

## 6. Design system — arquitetura de pastas

```
web/src/
├── design/
│   ├── tokens.ts        # cor, tipografia, espaço, raio, sombra, z
│   ├── motion.ts        # durações, easings, variantes de animação
│   └── surfaces.ts      # classes de superfície, borda, elevação
├── styles/
│   ├── globals.css      # reset, base, tipografia, seleção, scrollbar
│   ├── layout.css       # container, seção, grid, stack
│   └── utilities.css    # utilitários internos (não substituem Tailwind)
└── components/
    ├── brand/           # AngelLogo, AngelWordmark, CinematicIntro, Selo
    ├── navigation/      # Header, Nav, MegaMenu, MobileNav, SearchBar, CartButton
    ├── commerce/        # ProductCard, CategoryCard, PriceTag, KitCard, PriceRange
    ├── product/         # Gallery, ZoomLens, Lightbox, Thumbs, VariantPicker, StockBadge
    ├── feedback/        # Loading, Empty, ErrorState, Skeletons
    └── layout/          # Layout, Footer, Section, SectionHeader, AnnouncementBar
```

**Regras estruturais**
1. Nenhum `className` arbitrário repetido em 3+ lugares. Isso vira primitivo.
2. Nenhum `ProductCardV2`. Um único `ProductCard`.
3. Tokens são a **única** fonte de cor/espaço. Proibido hex em componente.
4. Página não escreve CSS de layout; consome primitivos.

---

## 7. Mapa de páginas

### 7.1 Rotas públicas (preservadas — SEO)

| Rota | Página | Nota |
|---|---|---|
| `/` | Home | Nova, editorial |
| `/produtos` | Catálogo | Filtros + busca + grid |
| `/produtos/:slug` | **Produto** | Contrato completo, ver §8 |
| `/carrinho` | Carrinho | Redesenhado |
| `/checkout` | Checkout | Redesenhado, BLOQUEADO no envio |
| `/conta` | Conta | Perfil |
| `/conta/favoritos` | Favoritos | Já existe, re-skin |
| `/sobre` | Institucional | Reaproveita texto atual |
| `/contato` | Institucional | Reaproveita texto atual |
| `/atendimento` | Institucional | Reaproveita texto atual |
| `/diagnostico` | Diagnóstico | Ficha de pele |
| `/orcamentos/novo` | Orçamento | Fluxo B2B |

### 7.2 Rotas novas (previstas, dependem de backend)

| Rota | Bloqueio |
|---|---|
| `/pedido/:id` | `orcamento_item` ausente |
| `/conta/pedidos` | `orcamento_item` ausente |

### 7.3 Rotas admin

`/admin/login`, `/admin`, `/admin/produtos`, `/admin/orcamentos`,
`/admin/orcamentos/novo` — mesma lógica, nova pele.

---

## 8. Contrato da página de produto

Este é o artefato central da reconstrução. Imagem é elemento comercial, não
decoração.

### 8.1 Modelo de dados

```
produto
  └── produto_imagem  (url, principal, ordem)
        ├── ordem 1  → capa
        ├── ordem 2  → ângulo
        ├── ordem 3  → detalhe
        ├── ordem 4  → textura/acabamento
        └── ordem 5  → contexto/uso
```

Bucket `product-images`, layout de arquivos:
```
product-images/produtos/{produto_id}/capa.webp
product-images/produtos/{produto_id}/01.webp ... 05.webp
```

**Regras**
- `principal = true` é derivado de `ordem = 1`; nunca dois principais.
- 5 é o **máximo suportado**, não o mínimo. Renderizar o que existir.
- 0 imagens → placeholder editorial (`/images/placeholder-product.jpg`).
- Todas em WebP, até 1200 px no eixo maior, ≤ 200 KB cada.

### 8.2 Layout desktop (≥ 1024 px)

```
┌──────────────────────────────────────────────────────────────┐
│ ┌──────────────────────────┐  ┌───────────────────────────┐  │
│ │                          │  │ CATEGORIA · RÓTULO         │  │
│ │      IMAGEM ATIVA         │  │ Nome do Produto            │  │
│ │                          │  │ ★ avaliações*             │  │
│ │    zoom on hover          │  │ R$ preço / riscado / badge │  │
│ │                          │  │ descrição curta            │  │
│ │              [ 🔍 ]       │  │ variantes (cor, tamanho)   │  │
│ └──────────────────────────┘  │ estoque                    │  │
│ ┌───┐┌───┐┌───┐┌───┐┌───┐     │ quantidade                 │  │
│ │ 1 ││ 2 ││ 3 ││ 4 ││ 5 │     │ [ COMPRAR ] [ ORÇAMENTO ]  │
│ └───┘└───┘└───┘└───┘└───┘     │ frete · Trust badges       │  │
│                                │ descrição · detalhes       │  │
│                                └───────────────────────────┘  │
│                                                              │
│  RELACIONADOS · MESMA CATEGORIA · KIT/COMBO                  │
└──────────────────────────────────────────────────────────────┘
```

`*` avaliações só renderizam se houver dado real. Sem dado → elemento ausente.

### 8.3 Interações da galeria

| Interação | Desktop | Mobile |
|---|---|---|
| Trocar imagem | Clique na miniatura | Toque / swipe horizontal |
| Zoom | `transform: scale` seguindo o cursor | Pinch-to-zoom |
| Fullscreen | Botão + clique na imagem | Botão |
| Navegar | Setas ← → do teclado | Swipe |
| Fechar | `Esc` | Toque fora / botão |
| Acessibilidade | `role="dialog"`, `aria-modal`, foco preso, rótulo por índice | idem |

**Implementação:** Pointer Events + CSS transform. Sem biblioteca nova.

### 8.4 Campos comerciais

Preço (`preco_base`), promoção, estoque, variações, quantidade, frete,
favoritos, kit/combo, relacionados.

> **Regra inegociável:** nada de preço, desconto, parcelamento, avaliação,
> estoque ou prazo de frete inventado. Campo sem dado → o bloco não renderiza
> ou renderiza estado neutro explícito.

### 8.5 Bloqueios

| Recurso | Motivo |
|---|---|
| Estoque real | Sem coluna de estoque confirmada |
| Avaliações | Tabela de reviews inexistente |
| Frete/CEP | Sem integração de transportadora |
| Envio de pedido | `orcamento_item` ausente no remoto |
| Pagamento | Sem gateway configurado |

Todos marcados `BLOQUEADO PELO BACKEND` na UI.

---

## 9. Contrato de dados

Trabalho em paralelo entre banco e frontend, com contratos fixos:

**Já existe e é usado:** `produto`, `categoria`, `orcamento`, `produto_imagem`
(`url`, `principal`, `ordem`), campos `preco_base`, `orcamento_total`, `created_at`.

**Ausente no remoto:** `orcamento_item`, `fornedor`, `ClienteEndereco`,
`produtoCategoria`.

**Migração redigida e NÃO aplicada:**
`supabase/migrations/20260920000002_angel_commerce_reconciliation.sql`

**Políticas de Storage redigidas e NÃO aplicadas:**
`supabase/storage/product-images-policies.sql`

RLS: leitura anônima permitida em `categoria`, `orcamento`, `produto`; negada em
`fornedor`, `ClienteEndereco`, `orcamento_item`.

---

## 10. Ordem de implementação

| Fase | Entrega | Gate |
|---|---|---|
| **0. Saneamento** | Resolver `barrinhoDeCompras/`; fixar baseline de build; mapear URLs antigas para 301 | Build verde; inventário de URLs publicado |
| **1. Fundação** | Paleta, tipografia, tokens, `tailwind.config.js`, `globals.css`, reset | Build verde; fontes carregando |
| **2. Primitivos** | `Button`, `Input`, `Badge`, `Card`, `Container`, `Section`, `Text`, `Field` | Storybook-less smoke page; a11y básico |
| **3. App Shell** | Header, Nav, Footer, AnnouncementBar, cinema de entrada | 17 rotas 200; intro com `reduced-motion` e sem JS |
| **4. Home** | Hero editorial, categorias, destaques, trusting, kits | Layout em 8 larguras |
| **5. Catálogo** | Grid, filtros, busca, ordenação, vazio/erro/carregando | Filtros por querystring |
| **6. Produto** | Galeria 5 imgs, zoom, fullscreen, variantes, relacionados | Touch e teclado testados |
| **7. Comercial** | Carrinho e Checkout | Estados vazio/carregado/erro |
| **8. Institucionais** | Sobre, Contato, Atendimento, Diagnóstico, Conta, Favoritos | Textos preservados |
| **9. Admin** | Re-skin do CRUD existente | Permissões mantidas |
| **10. SEO e performance** | Reconciliar `robots.txt`/`sitemap.xml`, OG images, Core Web Vitals, a11y audit | Lighthouse e rastreamento de rota |

**Regra:** nenhuma fase avança com build vermelho.

---

## 11. Decisões tomadas e pendências

### 11.1 Resolvidas

| # | Item | Decisão | Efeito |
|---|---|---|---|
| 1 | `barrinhoDeCompras/` | **Mover como semente, depois remover** | Os 3 arquivos foram absorvidos em `web/src/design/tokens.ts`, `web/src/styles/global.css` e `web/tailwind.config.js`. Diretório acidental removido da raiz. Cópias de rascunho (`*.seed.*`) também removidas — o `tsc` as compilava e quebravam o build. |
| 2 | Paleta | **Candidata A — vinho + champanhe** | Design system desbloqueado. Ver §4. |
| 3 | Asset do cinema | **`assets/img/cinematic.png`** | Implementado em §5.3–5.5. Limitação de orientação e peso documentadas. |
| 4 | Supabase | **Já existe — nada novo a criar** | `.env` existente preservado. Nenhum banco, mock ou backend paralelo criado. Nenhuma migration alterada ou executada. |
| 5 | Galeria de eventos | **Patrimônio — não descartar** |treatment reservado para fase própria, com masonry, lightbox e categorias **somente onde houver dado real**. Nada inventado. |

### 11.2 Defeito crítico encontrado na Fase 0

**O Tailwind CSS não estava instalado.** Descoberto ao auditar o pipeline de build:

- `web/package.json` não declarava `tailwindcss`
- `web/node_modules/tailwindcss` — ausente
- não existia `postcss.config.js` nem plugin Tailwind no `vite.config.ts`

Consequência real: **todas** as classes Tailwind dos 60 arquivos em `web/src`
resolviam para nada, e `global.css` era publicado com `@apply` em bruto,
ignorado pelo navegador. O site renderizava como HTML sem estilo.

Isso **invalida a verificação anterior** de "build aprovado e 17 rotas com HTTP
200": HTTP 200 prova que o servidor responde, nunca que o estilo foi aplicado.
O bundle CSS anterior tinha 4,13 kB — o tamanho de um arquivo CSS não
processado.

**Correção aplicada (Fase 1):**
- instalado `tailwindcss@^3.4.17`, `postcss@^8.4.49`, `autoprefixer@^10.4.20`
  (v3 escolhida porque os 60 arquivos existentes usam sintaxe v3 com
  `@apply`; migrar para v4 agora quebraria todos eles)
- criado `web/postcss.config.js`
- bundle CSS saiu de 4,13 kB → **23,93 kB**, sem nenhum `@apply` residuo
- adicionada camada de aliases **deprecated** no `tailwind.config.js`
  (`deep-rose`, `soft-black`, `warm-gray`, `rose`, `coral` → paleta nova) para que
  as páginas legadas das Fases 3–9 continuem compilando
- `.oxlintrc.json` agora ignora `public/assets`, `_legacy_styles` e
  `public/_legacy_assets` (o lint estava reportando 13 avisos de JS vanilla morto)

> **Lição registrada:** a partir de agora, verificação de build inclui checar o
> **tamanho do CSS gerado**, não apenas o código de saída do `vite build`.

### 11.3 Pendências que exigem decisão

1. **`.htaccess`** — não existe na raiz. O site parece rodar em Netlify
   (`sitemap.xml` e `robots.txt` referenciam `angelcosmeticos.netlify.app`).
   Existe `.htaccess` apenas dentro de `references/`. Confirmar qual hosting
   é o oficial antes da Fase 10.

2. **URLs antigas** — `robots.txt` e `sitemap.xml` da raiz apontam para
   `/assets/html/*.html` (site PHP), incompatível com as rotas da SPA. As URLs
   antigas com histórico de busca **precisam** de mapa de redirecionamento
   antes do go-live. Falta o histórico do Search Console ou lista de URLs.

3. **Vídeo de 4,2 MB** (`assets/video/sessãoMaquiagem.mp4`) — usar no hero
   (com `poster` e lazy load) ou converter/comprimir? Recomendação: poster
   estático + vídeo apenas no desktop e após LCP.

4. **Remoção do legado** — a lista §3.4 continua no disco. Nenhum item de
   `public/assets`, `_legacy_styles` ou `_legacy_assets` foi apagado.
   Confirmar quando liberar a remoção (recomendação: só na Fase 10, depois do
   go-live do novo build).

---

## 12. Não objetivos

- Não refatorar incrementalmente o site antigo.
- Não inventar dados comerciais.
- Não simular integração com backend ausente.
- Não alterar banco, migrations aplicadas, RLS ou Storage sem aprovação.
- Não executar `commit`, `push`, `merge`, `reset`, `rebase` ou `checkout`
  destrutivo.
