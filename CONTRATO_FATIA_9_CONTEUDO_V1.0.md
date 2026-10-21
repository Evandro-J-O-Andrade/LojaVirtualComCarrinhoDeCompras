# CONTRATO DA FATIA 9 — CONTEÚDO, ASSETS E PATRIMÔNIO EDITORIAL v1.0

**Base:** Fatia 8 (Home + Institucional) + regra de imagem da Fatia 4
**Data:** 2026-10-07 | **Versão:** 1.0 | **Status:** Contrato de fatia — regras fechadas

**Natureza:** Domínio de conteúdo. Transforma o patrimônio real de
`web/public/` em conteúdo utilizável, sem inventar informação comercial.

---

## 1. Regras fechadas

1. **Manifesto editorial não vira verdade comercial.** Uma foto associada
   editorialmente a um produto não significa que o produto está à venda.
2. **Nenhum arquivo real é apagado sem classificação.** Arquivos de teste e
   artefatos de desenvolvimento são classificados e nunca renderizados.
3. **Nenhuma URL falsa.** Todo caminho do manifesto existe no disco — há
   teste que prova isso (`asset.test.ts`).
4. **Dado desconhecido não se inventa.** `data` e `local` de experiência só
   existem quando reais. Ausência = estado editorial honesto ("em breve").
5. **Lacuna documentada, não coberta.** `produto-22.jpg` e `produto-25.jpg`
   não existem no acervo. O catálogo editorial referencia produto-22
   (blush); a regra de imagem (real → fallback visual → feedback) cobre a
   ausência sem quebrar o layout. O manifesto registra a lacuna por teste.
6. **Arquivo com nome inválido para web é artefato.** `produto-mary- kay-2.jpg`
   (espaço no nome) é classificado como desenvolvimento, não conteúdo.

## 2. Modelo de mídia

```text
PatrimonioAsset
 ├── id            (único no manifesto)
 ├── tipo          ('imagem' | 'video')
 ├── caminho       (caminho real em public/)
 ├── alt           (texto alternativo honesto)
 ├── titulo
 ├── contexto      ('produto' | 'evento' | 'galeria' | 'categoria' |
 │                  'marca' | 'hero' | 'cinematica' | 'institucional' | 'tecnico')
 ├── produtoSlug?  (vinculo editorial — não é oferta)
 ├── eventoSlug?   (vinculo à experiência)
 └── status        ('real' | 'teste' | 'desenvolvimento')
```

- `PATRIMONIO` — só `status: 'real'`. É o que o site pode consumir.
- `PATRIMONIO_NAO_CONTEUDO` — `teste` (logoteste2/3, lototeste) e
  `desenvolvimento` (capturas, rascunhos, carrinhos, logos genéricos,
  terceiro-`logomarykay`). Nunca renderizado.

## 3. Modelo de experiência

```text
Experiencia
 ├── slug, titulo, chamada, narrativa
 ├── capa          (imagem real do patrimônio)
 ├── galeria       (imagens reais — nada preenche espaço)
 ├── video         (só quando existir de verdade)
 ├── contextos     (rótulos editoriais)
 ├── data          (string | null — nunca inventada)
 └── local         (string | null — nunca inventado)
```

`midiasDaExperiencia()`: galeria ordenada + vídeo por último.
Mídia ausente simplesmente não existe.

## 4. Rotas

| Rota | Página | Nota |
|---|---|---|
| `/experiencias` | `ExperienciasPage` | Galeria masonry real (Fatia 9) |
| `/experiencias/:slug` | `ExperienciaDetailPage` | Galeria multi-imagem + vídeo + lightbox/zoom/pan/pinch/fullscreen/teclado/swipe (reutiliza `ProdutoGaleria` da Fatia 4.1) |

Experiências deixam o domínio institucional e passam ao domínio
`conteudo` (Fatia 9). `/beleza` e `/maquiagem` permanecem institucionais.

## 5. Regra visual definitiva (consolidada)

```text
ASSET REAL
   ↓
CARREGAMENTO
   ↓
erro?
   ├── não → exibe
   └── sim
        ↓
   FALLBACK VISUAL   (ImagemEditorial / ProdutoImagem)
        ↓
   FEEDBACK          ("Sem imagem disponível", nunca <img> quebrada)
```

```text
DADO DESCONHECIDO
      ↓
não inventar
      ↓
estado editorial honesto  ("Em breve", ausência de data/local)
```

## 6. O que esta fatia NÃO faz

- migration, seed, limpeza de Supabase (freeze da Etapa 8)
- pagamento, estoque, autenticação
- WhatsApp, e-mail, notificações
- administração de conteúdo no banco
- remoção de arquivos legados (só classificação — remoção é decisão
  de fase posterior, ver blueprint §3.4/§11.3)

## 7. Verificação

- `npx tsc -b` — OK
- `npm run lint` — exit 0
- `npm run test:run` — **171/171** (20 arquivos), incluindo:
  - `asset.test.ts` — integridade do manifesto: ids/caminhos únicos,
    **todo caminho real existe no disco**, sem teste em `PATRIMONIO`,
    sem 'real' no não-conteúdo, lacuna produto-22/25 documentada
  - `experiencia.test.ts` — slugs únicos, mídias reais, vídeo por
    último, data/local nunca inventados
