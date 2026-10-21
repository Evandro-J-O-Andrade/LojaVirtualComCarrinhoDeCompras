# REGRA DE DESIGN — ANGEL COSMÉTICOS v1.0

**Status:** REGRA DE PROJETO. Não é detalhe para decidir depois — é restrição estrutural.
**Data:** 2026-10-03 · **Base:** decisão do dono do negócio + `BLUEPRINT_RECONSTRUCAO_ANGEL_V1.md` (tokens/identidade já implementados)
**Vigência:** aplica-se a toda a Home e a todas as páginas editoriais.

---

## 1. Direção visual fechada

- **Vinho profundo** = cor de personalidade.
- **Champanhe** = detalhes, títulos, bordas, elementos premium.
- **Dourado muito controlado** = iluminação e destaque (não enchimento).
- **Preto/grafite** = profundidade.
- **Light Mode:** tons claros/quentes (marfim, champagne claro, vinho nos títulos, detalhes dourados, sombras suaves, fotografia quente, blocos editoriais).
- **Dark Mode:** fundo predominantemente vinho/preto com iluminação champagne sutil + partículas/purpurinas douradas caindo suavemente.
- Referência conceitual: **luxo feminino + cosméticos + editorial + experiência digital cinematográfica.**

## 2. Partículas (Dark Mode) — regras duras

- Camada **atmosférica**, não chuva constante pesada.
- Baixa opacidade · movimento lento · quantidade limitada.
- **`prefers-reduced-motion`** respeitado (sem partículas quando reduzido).
- Sem prejudicar leitura · sem excesso de brilho · sem efeito carnavalesco.
- Desligável em dispositivos de baixo desempenho, se necessário.

## 3. Viewport: 100dvh como disciplina, não como enfiar tudo numa tela

- Cada seção **sabe ocupar e respeitar o viewport**.
- Proibido: footer cobrindo conteúdo · scroll duplo · conteúdo cortado · hero com altura errada · barras horizontais · mobile quebrando.
- A Home **pode ter várias seções** e continuar sendo uma experiência vertical longa.

## 4. A Home conta uma história (não é mural de fotos)

Sequência editorial alvo:

```text
HEADER
  ↓
HERO CINEMATOGRÁFICO (✦ purpurinas · ANGEL COSMÉTICOS · "Beleza que acompanha você" · [CONHECER] [COMPRAR])
  ↓
O SEU MOMENTO ("Um mimo para cada momento." · CUIDAR | RITUAL | PRESENTEAR)
  ↓
MIMOS DIÁRIOS (editorial/storytelling · imagem + texto + produto)
  ↓
DESTAQUES DA ANGEL (produtos reais / ofertas reais)
  ↓
RITUAIS & KITS (rotina → produtos → kit)
  ↓
ANGEL EXPERIENCES (eventos / momentos)
  ↓
NOSSA HISTÓRIA (Angel desde 2022)
  ↓
FOOTER
```

## 5. Composição, não acumulação

> **A experiência visual deve ser composta, não acumulativa. Fotografias, textos, produtos, efeitos, cores e espaços vazios devem formar uma narrativa visual coerente. A Home não deve ser implementada como uma sequência de grids ou coleções de cards.**

Misturar: hero · composição assimétrica · editorial · produto · texto · fotografia · números · storytelling · carrosséis (quando fizer sentido) · blocos de campanha · produtos destacados · chamadas comerciais.

**O produto aparece dentro de uma história — não a história inteira vira uma lista de produtos.**

## 6. 100dvh, responsividade, acessibilidade e performance são estruturais

> **100dvh, responsividade, acessibilidade e performance são requisitos estruturais; efeitos visuais nunca podem comprometer navegação, legibilidade ou conteúdo.**

## 7. Contrato de resiliência: Fallback → Rollback → Feedback

Aplicável a: imagens · vídeos · produtos · categorias · promoções · estoque · frete · carrinho · conta · atendimento · conteúdo · links.

```text
dado real disponível → usa dado real
dado ausente         → fallback seguro
erro recuperável     → rollback visual
                      → feedback/observabilidade
```

**Imagens — 3 níveis:**
1. **Produção:** imagem real → mostra imagem real.
2. **Ausência:** sem imagem → fallback premium (fundo da identidade, textura/gradiente, categoria, ícone refinado, nome do produto).
3. **Erro:** imagem existe mas falha (404/corrompida/indisponível) → `onError` → rollback para fallback.

Regras de implementação:
- O componente **marca que já entrou em fallback** (não entra em loop imagem→erro→fallback→erro).
- `imagem = produto.imagemPrincipal ?? fallbackDaCategoria(produto.categoria)`.
- **`fallback ≠ produto_imagem`**: nunca grava URL falsa no banco. O banco continua dizendo `produto_imagem = 0`; a UI lidar com isso.
- No **site público**, evitar "Imagem em breve" em destaque (passa sensação de produto incompleto); usar fallback elegante.
- No **admin**, mostrar saúde: ✅ Capa · ⚠️ Sem imagem · ⚠️ Imagem quebrada · 📤 Enviar imagem; e dashboard "Saúde do catálogo" (N produtos · N com imagem · N sem · N com erro). Fallback é **observabilidade**, não esconderijo.

## 8. Regra de ouro comercial

> **Mock pode existir para preservar a experiência visual; não pode falsificar o estado comercial do sistema.**

- `promocao = null` → **não** inventa "-30%"; apresenta o produto normalmente.
- `estoque` indisponível → **não** inventa "Em estoque".
- Nunca simular backend, preços, estoque, avaliações, parcelamento, contatos ou métricas.

## 9. Patrimônio da Angel (4 grupos) — antes de qualquer `rm -rf`

> **Código antigo não é patrimônio. Conteúdo e infraestrutura real são patrimônio.**

**PRESERVAR:** fotos reais · vídeos reais · textos institucionais/comerciais reais (se ainda fizerem sentido) · logos/marcas · PDFs/catálogos (como fonte/arquivo) · eventos reais (conteúdo e fotos) · endereço · telefone/WhatsApp · Instagram/Facebook · identidade/cores realmente usadas · `robots.txt` · `.htaccess` · `sitemap.xml` · verificação Google Search Console · canonical/SEO metadata válido · JSON-LD/schema.org · `site.webmanifest`.

**DESCARTAR:** HTML/CSS/JS antigo · PHP/MySQL · componentes React antigos (como arquitetura) · layout antigo · formulários antigos (implementação) · mocks · Lorem ipsum · produtos fake · imagens placeholder · preços fake/seed · fornecedor fake · links quebrados · integrações antigas inúteis.

**`preservar a identidade ≠ preservar o código visual antigo`:** extrair identidade (cores institucionais, logo, variações da marca, tipografia, elementos gráficos, fotografias, vídeos, linguagem visual) e criar **um design system novo**.

## 10. Fase 0 — Inventário de Patrimônio (antes de apagar o frontend)

```text
FASE 0
├── 0.1 Conteúdo real      0.6 Eventos        0.11 sitemap
├── 0.2 Fotos              0.7 Catálogos/PDFs  0.12 .htaccess
├── 0.3 Vídeos             0.8 Identidade      0.13 Google verification
├── 0.4 Logos/marcas       0.9 SEO             0.14 URLs/redirects
├── 0.5 Textos             0.10 robots         0.15 classificação final
```

Resultado esperado por item: **PRESERVAR · ADAPTAR · DESCARTAR**.

**Nesta etapa não mexemos no Supabase.** Primeiro salvamos o patrimônio real; depois fechamos o contrato funcional; só então partimos para a reconstrução.

## 11. `.htaccess` — reconstruir, não copiar

Identificar o estruturalmente necessário (HTTPS, redirects, URLs antigas, regras de acesso, compressão/cache, compatibilidade de hosting) e reconstruir as regras para a nova arquitetura.

---

> Nenhuma migration, alteração de Supabase ou implementação de código é autorizada por este documento. Ele é regra de design e governança.
