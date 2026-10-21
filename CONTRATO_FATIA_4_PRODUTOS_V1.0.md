# CONTRATO DA FATIA 4 — PRODUTOS / CATÁLOGO COMERCIAL v1.0

**Base:** CONTRATO_DOMINIO_COMERCIAL_v1.1 + decisões fechadas na Fatia 4 e Fatia 4.1
**Data:** 2026-10-05 | **Versão:** 1.0 | **Status:** Contrato de fatia — regras fechadas
**Natureza:** Contrato de domínio da fatia de produtos. Regras comerciais e de experiência.

---

## 1. Regra fechada (inviolável)

> **Todo produto possui uma experiência própria por slug.**
> O card é apenas a porta de entrada; a página `/produtos/:slug` é a experiência comercial completa.

Consequências:

- O **card** mostra só: foto, nome, avaliação e preço. Não tenta contar a história.
- O **slug** é a identidade comercial/editorial do produto.
- A página do produto é uma **mini landing page própria**, não uma ficha de descrição.

---

## 2. Estrutura da experiência por slug

```text
HERO DO PRODUTO
 ├── Galeria / vídeo (palco + miniaturas + zoom + fullscreen)
 ├── Nome + benefício principal
 ├── Avaliação (★★★★★) e SKU
 ├── Preço base → promoção válida → preço ofertado
 ├── Condição (estoque / sob consulta)
 ├── Variantes
 ├── Quantidade
 └── [Comprar] [Solicitar orçamento]
────────────────────
HISTÓRIA DO PRODUTO
DESCRIÇÃO
COMO USAR
INGREDIENTES / COMPOSIÇÃO
DETALHES (condição, SKU, marca, categorias)
────────────────────
MIMOS RELACIONADOS (curadorias que contêm este produto)
PRODUTOS RELACIONADOS (mesma categoria)
AGENDAMENTO / EXPERIÊNCIAS (CTA para /agendamento)
```

---

## 3. Mídia de produto

Modelo alvo no banco (futura migration — **não criar colunas arbitrárias em `produto`**):

```text
produto_midia
├── tipo: image | video
├── url
├── ordem
├── alt
├── titulo
├── largura
├── altura
└── ativo
```

Enquanto a camada de conteúdo não existe:

- `produto_imagem` (url, ordem, principal) alimenta as imagens;
- vídeo, alt e título vivem no modelo de domínio, nulos no fonte Supabase;
- o catálogo editorial carrega a mídia real do patrimônio (fotos e vídeo de demonstração).

**Cadeia de mídia (Fallback → Rollback → Feedback):**

1. **Imagem real** — URL do banco/catálogo.
2. **Fallback visual** — bloco visual com ícone, se a URL falhar (`onError`) ou não existir.
3. **Feedback** — aviso "Sem imagem disponível" com `role="img"` e `aria-label`.

Nunca renderizar URL inventada ou quebrada.

---

## 4. Galeria e zoom

- Palco principal com troca de mídia sem sair da página;
- Miniaturas numeradas + aba de vídeo;
- Zoom ampliado (lightbox): zoom (botões, teclado, pinch), pan por arrasto,
  próxima/anterior, thumbnails, fullscreen;
- Mobile: swipe entre mídias, pinch-to-zoom, fullscreen;
- Acessibilidade: `alt`, teclado (`Esc`, `←`, `→`, `+`, `-`, `0`), foco gerenciado,
  `aria-label`, `role="dialog"`, sem depender exclusivamente de hover.

---

## 5. Oferta não é preço

A UI preserva a cadeia semântica e nunca a achata:

```text
preco_base → promoção válida (janela + ativa) → preco_ofertado
```

Futuro: `preco_ofertado → orçamento → desconto comercial → condição de pagamento → snapshot vendido`.

---

## 6. Um produto, várias experiências

Mimos, Home, busca, orçamento e carrinho consomem o **mesmo** catálogo.
Navegação cruzada: a página do produto mostra os Mimos que o contêm
(`mimo_produto`), sem duplicar produto dentro de Mimos.

---

## 7. O que esta fatia NÃO faz

- Não inventa estado comercial (preço, estoque, vínculos) no editorial além dos
  dados de demonstração explícitos, sempre marcados com `source: 'editorial'`;
- Não altera o schema do Supabase (a migration de `produto_midia` é posterior);
- Não migra Home/Favoritos para o card do domínio (fase 10 — fechamento).
