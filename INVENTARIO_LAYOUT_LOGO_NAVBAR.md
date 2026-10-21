# INVENTÁRIO — LAYOUT / LOGO / NAVBAR (somente leitura)

**Data:** 2026-10-01
**Nenhum arquivo foi editado. Nenhum banco tocado. Sem commit, sem push.**

---

## 1. Estrutura atual do layout

```
web/index.html
└── body
    └── #root
        └── main.tsx
            └── App.tsx
                └── AppRouter.tsx
                    └── Layout.tsx
                        ├── Header.tsx        (fixed, h-16 / md:h-20)
                        ├── <main>           (pt-16 md:pt-20)
                        └── Footer.tsx
```

`Layout.tsx` hoje:

```tsx
<div className="min-h-screen flex flex-col">
  <Header />
  <main className="flex-1 pt-16 md:pt-20">
    <Outlet />
  </main>
  <Footer />
</div>
```

**Problema:** `min-h-screen` = `min-height: 100vh`. Em mobile, `100vh` no
Chrome/Safari Android **inclui a barra de endereço**, então o rodapé de uma
página curta fica parcialmente atrás da barra do sistema.

---

## 2. Ocorrências de altura de viewport (8 arquivos)

| Arquivo | Linha | Classe atual | Correção |
|---|---|---|---|
| `components/layout/Layout.tsx` | 8 | `min-h-screen` | `min-h-dvh` ⚠️ **P0 mobile** |
| `components/sections/Hero.tsx` | 6 | `min-h-screen` | `min-h-dvh` |
| `styles/cinematic.css` | 76 | `height: 100vh` | `height: 100dvh` ⚠️ **P0 mobile** |
| `components/admin/AdminLayout.tsx` | — | `min-h-screen` | `min-h-dvh` |
| `components/admin/AdminSidebar.tsx` | — | `h-screen` | `h-dvh` |
| `components/auth/ProtectedRoute.tsx` | — | `min-h-screen` | `min-h-dvh` |
| `components/common/ErrorBoundary.tsx` | — | `min-h-screen` | `min-h-dvh` |
| `pages/Admin/Login/index.tsx` | — | `min-h-screen` | `min-h-dvh` |

### 2.1 Por que `cinematic.css` é o caso mais urgente

O cinema mobile usa `height: 100vh` com a regra `@media (max-width: 639px)`.
Em iOS Safari, `100vh` é **maior** que a área visível (a barra de endereço não
conta). Resultado: o frame do cinema **transborda por baixo da barra**, e a
cortina final não cobre a tela toda — a transição fica com uma faixa exposta.
`100dvh` corrige isso e é seguro onde não suportado (cai para `100vh`).

---

## 3. A logo — 27 candidatas, nenhuma verificável por mim

Não existe uma pasta de marca. As candidatas estão espalhadas em
`assets/img/` com nomes de teste e versões duplicadas.

### 3.1 Candidatas com proporção horizontal — adequadas a navbar

| Arquivo | Dimensões | Peso | Alfa |
|---|---|---:|---|
| `logo.png` | **300 × 89** | 52 KB | sim (ARGB) |
| `logo-2.png` | **300 × 89** | 52 KB | sim |
| `logoEscura.png` | **300 × 89** | 51 KB | sim |

Proporção 3,37:1 — exatamente o formato de um lockup horizontal para navbar.

### 3.2 Candidatas quadradas

| Arquivo | Dimensões | Peso | Uso no legado |
|---|---|---:|---|
| `logosemfundobaner.png` | 1024 × 1024 | 973 KB | **usada no header de todas as páginas** |
| `Logosemfunto.png` | 500 × 500 | 227 KB | usada em todas as páginas |
| `logosemfundo3.png` | 1024 × 1024 | 1.125 KB | index.html |
| `logo6.png` | 1024 × 1024 | 1.850 KB | — |
| `marca-1..5.png` | 180 × 90 | 56–62 KB | — |
| `logo2semfundo*.png` | 500 × 500 | 267–269 KB | `ver-produtos.html` |

### 3.3 Candidatas **descartadas por evidência**

| Arquivo | Motivo da descarte |
|---|---|
| `logoteste2.png` | nome = "logo teste". **Era a usada no rodapé de todas as páginas do site antigo.** |
| `logoteste3.png` | idem |
| `lototeste.png` | idem |
| `logoIA.jpeg` | 1024×1024, sem alfa, 24bpp |
| `logo5.png`, `Logosemfunto.png`, `logosemfundo3.png` | duplicatas de teste do processo criativo |

### 3.4 WebP disponível

`logo2.webp` (243 KB), `logo3.webp` (342 KB), `logo4.webp` (342 KB) — formato
melhor para produção, mas as dimensões não puderam ser lidas sem dependência
de decodificação.

### 3.5 ⚠️ Bloqueio

**Não consigo ver nenhuma dessas imagens.** Este modelo não tem entrada de
imagem. Só tenho dimensões, peso e presença de canal alfa.

**A escolha da logo precisa ser sua.** Sem ela, qualquer decisão minha é chute.

---

## 4. O componente de logo atual — é artificial

`web/src/components/common/AngelLogo.tsx`:

```tsx
<div className="rounded-full bg-gradient-to-br from-deep-rose to-coral ...">A</div>
<span className="font-display font-bold text-xl ...">ANGEL</span>
```

Três problemas:

1. **Um "A" em círculo com gradiente** — não é a marca, é um placeholder.
2. **Exibe só "ANGEL"**, violando a decisão de usar o nome completo.
3. Usa `from-deep-rose to-coral` — aliases deprecated da paleta antiga.

---

## 5. Navbar atual — `Header.tsx` (130 linhas)

### 5.1 Defeitos encontrados

**a) Chaves React duplicadas — bug real**

```tsx
const navItems = [
  { label: 'Início',  href: '/' },
  { label: 'Beleza', href: '/produtos?categoria=maquiagem' },
  { label: 'Casa',   href: '/produtos' },   // ← idêntico
  { label: 'Moda',   href: '/produtos' },   // ← idêntico
  { label: 'Sobre',  href: '/sobre' },
]
```

`key={item.href}` com dois itens tendo `/produtos` → **chaves duplicadas**.
Além disso "Casa" e "Moda" levam ao mesmo lugar: a navegação é falsa.

**b) Dois botões não fazem nada**

```tsx
<Button variant="icon" aria-label="Favoritos"><Heart /></Button>
<Button variant="icon" aria-label="Conta"><User /></Button>
```

Sem `onClick`, sem `Link`. São controles decorativos queappears clicáveis —
falha de acessibilidade e de UX. `FavoritesContext` e `ContaPage` já existem.

**c) A busca não busca**

O modal abre com `autoFocus`, mas o `<input>` não tem estado, não submete e
não navega. É uma casca.

**d) Estado ativo quebrado para query string**

`location.pathname === item.href` — "Beleza" aponta para
`/produtos?categoria=maquiagem`, então `pathname` é `/produtos` e nunca casa
com o href completo. O item nunca fica ativo.

**e) Menu mobile não é drawer**

Um `<div>` absoluto dentro do `<header>`, sem backdrop, sem foco preso, sem
animação, sem fechar por `Esc` ou clique fora.

**f) `bg-transparent` no topo**

No scroll 0 o header é transparente sobre a Home. Com a nova identidade
vinho/champanhe, o contraste do logo fica indefinido até rolar.

**g) Padding hardcoded e acoplado**

`Layout.tsx` compensa o header fixo com `pt-16 md:pt-20`. Qualquer mudança de
altura do header desalinha o conteúdo — e vice-versa.

---

## 6. Outros defeitos reais encontrados no caminho

| Arquivo | Defeito | Gravidade |
|---|---|---|
| `Footer.tsx:62` | `contato@angel.com` — **domínio inexistente**; o real é `angelcosmeticos.com.br` | 🔴 sai publicado |
| `Footer.tsx:74` | `© 2026 ANGEL` — marca truncada | 🟡 |
| `Footer.tsx:15` | wordmark "ANGEL" em vez de "Angel Cosméticos" | 🟡 |
| `CartDrawer.tsx:21` | contador existe e funciona (`count` do `CartContext`) | ✅ ok |

---

## 7. Arquivos que serão alterados

**Nenhum foi alterado ainda.** Esta é a lista proposta.

### P0 — viewport e estrutura

| Arquivo | Mudança |
|---|---|
| `web/src/styles/globals.css` | adicionar utilitário `.app-shell` com `min-height: 100dvh` e fallback `100vh` |
| `web/src/components/layout/Layout.tsx` | `min-h-dvh`, `main` sem padding hardcoded, altura do header via token |
| `web/src/styles/cinematic.css` | `height: 100dvh` com fallback |
| `web/src/components/sections/Hero.tsx` | `min-h-dvh` |

### P1 — marca

| Arquivo | Mudança |
|---|---|
| `web/src/components/brand/AngelLogo.tsx` | **novo** — usa o asset real escolhido |
| `web/src/components/common/AngelLogo.tsx` | **remover** (duplicata) |
| `web/public/brand/angel-logo.*` | **novo** — asset real, otimizado, em WebP |

### P2 — navbar

| Arquivo | Mudança |
|---|---|
| `web/src/components/navigation/Header.tsx` | **novo** — desktop + drawer mobile |
| `web/src/components/navigation/MobileNav.tsx` | **novo** — drawer acessível |
| `web/src/components/navigation/SearchOverlay.tsx` | **novo** — busca funcional |
| `web/src/components/navigation/NavLink.tsx` | **novo** — estado ativo com query string |
| `web/src/components/layout/Header.tsx` | **remover** (substituído) |

### P3 — varredura

| Arquivo | Mudança |
|---|---|
| `web/src/components/layout/Footer.tsx` | corrigir `contato@angel.com`, marca completa |
| `web/src/components/admin/AdminLayout.tsx` | `min-h-dvh` |
| `web/src/components/admin/AdminSidebar.tsx` | `h-dvh` |
| `web/src/components/auth/ProtectedRoute.tsx` | `min-h-dvh` |
| `web/src/components/common/ErrorBoundary.tsx` | `min-h-dvh` |
| `web/src/pages/Admin/Login/index.tsx` | `min-h-dvh` |

**Total: 4 arquivos novos, 3 removidos, 9 editados.**
Nada fora disso. Sem tocar em páginas de produto, carrinho, checkout, admin de
dados, Supabase ou migrations.

---

## 8. O que preciso de você antes de editar

1. **Qual logo é a real?** Ver §3. Sem ver as imagens, não posso escolher.
   Sugestão se quiser o caminho rápido: `logo.png` (300×89, com alfa) é a
   candidata com proporção correta, mas **confirme** — `logoEscura.png` pode ser
   a versão para fundo claro e `logo.png` a versão escura, e aí a escolha depende
   do fundo do header.
2. **A logo vem com fundo transparente ou chapado?** As de 300×89 têm alfa.
3. **O header começa transparente ou sólido?** Recomendo sólido na nova
   identidade, mas é decisão sua.
4. **Confirma a remoção de `AngelLogo.tsx` e `Header.tsx` antigos?** Os dois
   viram duplicata quando os novos existirem.

---

## 9. ⚠️ ACHADO NOVO — análise métrica das logos

Feito sem visão: hash MD5, bounding box do conteúdo opaco e cor dominante por
pixel. É medição objetiva, não impressão.

### 9.1 As três logos de 300×89 são a MESMA arte, em três cores

Todas com **7.850 px opacos**, bounding box **287×85**, ocupação **91,4%** do
canvas. Arte idêntica, três colorways:

| Arquivo | Conteúdo | Cor média | Acento saturado | Px coloridos | Serve para |
|---|---|---|---|---:|---|
| `logo.png` | 287×85 | `#FFFFFF` | **nenhum** | 0 | fundo escuro |
| `logo-2.png` | 287×85 | `#FFCFC9` | **`#FF523B`** | 2.160 | fundo escuro |
| `logoEscura.png` | 287×85 | `#460000` | **`#FF0000`** | 2.160 | **fundo claro** |

Conclusões objetivas:

1. **É um lockup horizontal apertado** — 91,4% de ocupação, proporção 3,38:1.
   É a candidata correta para navbar. Não há margem morta a recortar.
2. `logoEscura.png` tem texto escuro (`#460000`) → **é a versão para fundo
   claro**.
3. `logo-2.png` tem texto claro (`#FFCFC9` sobre cinza) → **é a versão para
   fundo escuro**.
4. `logo.png` é totalmente branca → **é a versão monocromática branca**.

> Atenção ao nome: `logoEscura.png` é a versão de **texto escuro** (fundo
> claro). A nomeação do acervo é enganosa.

### 9.2 🔴 A cor da marca é VERMELHO, não vinho

O acento saturado médio das duas versões coloridas:

```
logo-2.png      → #FF523B   (coral/vermelhão vivo)
logoEscura.png  → #FF0000   (vermelho puro)
```

**A identidade real da Angel Cosméticos usa vermelho.** 27,5% dos pixels da
marca são coloridos, e são vermelhos.

**Isso conflita com a paleta que implementamos:**

| | Cor |
|---|---|
| Acento real da logo | `#FF523B` / `#FF0000` |
| `primary` do nosso tokens.ts | `#8E1A5C` (vinho) |

Vinho e vermelho são famílias distintas. Uma marca cujo símbolo é
`#FF523B` com um site em `#8E1A5C` não lê como a mesma empresa.

**Ressalva de honestidade:** medi cor média e proporção, não objeto. Não sei
**qual** elemento é vermelho — pode ser um ícone, uma letra estilizada ou o
wordmark inteiro. Também não posso descartar que `#FF523B` seja um tom de
trabalho e exista uma versão corporativa mais escura entre os arquivos que não
analisei (`logosemfundobaner.png` etc.). **Isso precisa da sua leitura visual.**

### 9.3 Isso só aparece porque a logo foi medida

O briefing original dizia "usa a logo que existe". Sem medir, eu teria usado
`logoEscura.png` num header vinho e ninguém notaria até alguém ver a página
junta com a marca. É exatamente o tipo de contaminação entre **descoberta** e
**produção** que você pediu para evitar — no sentido de que a paleta foi
escolhida sem evidência da marca real.

---

## 10. 🔴 Footer publica dados inventados

`web/src/components/layout/Footer.tsx` — leitura integral:

| Linha | Conteúdo | Realidade |
|---|---|---|
| 58 | `Rua das Flores, 123 - São Paulo, SP` | ❌ **inventado** |
| 62 | `contato@angel.com` | ❌ **inventado** — domínio não existe |
| 66 | `(11) 99999-99999` | ❌ **inventado** |
| 21/24/27 | `<a href="#">` × 3 redes sociais | ❌ links mortos |
| 12-15 | círculo gradiente com "A" + `ANGEL` | ❌ logo falsa, marca truncada |
| 74 | `© 2026 ANGEL` | ❌ marca truncada |

**E o dado real existe, recuperado no acervo:**

```
Angel Cosméticos
CNPJ 48.591.163/0001-12
Viela Aristides de Oliveira, nº 130 — Poá/SP — CEP 08551-275
```

O footer atual **contradiz frontalmente** a identidade real da empresa. Isso é
pior que um defeito visual: é informação falsa em um site comercial.

> Nota: **telefone e e-mail reais não foram recuperados.** O acervo tem
> telefone e e-mail de *fornecedor* (fictício), não da Angel. Esses dois campos
> ficam `PENDENTE` até você fornecer — não vou inferir.

---

## 11. `Button.tsx` — desalinhado do design system

`web/src/components/common/Button.tsx` usa os tokens deprecated
(`deep-rose`, `rose`, `blush`, `warm-gray`, `soft-black`) e define as variantes
por conta própria, duplicando o que já existe em `global.css`
(`.btn-angel`, `.btn-angel-ghost`, `.btn-angel-icon`, `.btn-angel-subtle`).

**Duas fontes de verdade para o mesmo botão.** A Fase 2 (primitivos) resolve
isso, mas o navbar novo deve consumir os tokens novos, não este componente.

