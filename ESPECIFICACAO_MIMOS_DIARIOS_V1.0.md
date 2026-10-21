# ESPECIFICAÇÃO FUNCIONAL — MIMOS DIÁRIOS v1.0

**Status:** Especificação funcional. **NÃO contém migration. Nada aplicado ao Supabase.**
**Data:** 2026-10-03
**Base:** `CONTRATO_FUNCIONAL_ANGEL_COSMETICOS_V1.0` + `DECISOES_NEGOCIO` (D1–D4, D9, D10) + `DEC1–DEC4` + `REGRA_DE_DESIGN_ANGEL_V1`
**Natureza:** documento de domínio funcional. Define regras, telas, slug, relacionamentos e o que precisa (ou não) de banco. **Não define SQL, APIs ou implementação.**

---

## 0. Sequência do projeto (onde estamos)

```text
CONTRATO_FUNCIONAL_V1.0 ✅
  ↓
1. MIMOS DIÁRIOS            ← ESTE DOCUMENTO
  ↓
2. MODELO COMERCIAL COMPLETO (Produtos · Promoções · Descontos · Kits · Orçamentos · Pagamentos · Pedidos)
  ↓
3. SERVIÇOS + AGENDAMENTO
  ↓
4. ATENDIMENTO + WHATSAPP + E-MAIL + NOTIFICAÇÕES
  ↓
5. GAP ANALYSIS FINAL DO SUPABASE
  ↓
6. SQL/MIGRATIONS PROPOSTAS
  ↓
7. REVISÃO HUMANA
  ↓
8. APLICAÇÃO AUTORIZADA
  ↓
9. RECONSTRUÇÃO DO FRONTEND
```

**Decisão de sequência (fechada):** ❌ **não** aplicar `orcamento`/`orcamento_item` agora. O admin de Orçamentos quebrado (`.from('orcamento')` → PGRST205) é **dívida técnica conhecida**, aceitável temporariamente durante a reconstrução — não justifica migration emergencial antes de fechar o modelo comercial inteiro.

---

## 1. O que é Mimos Diários

**Módulo comercial/editorial** (não apenas conteúdo): uma **curadoria narrativa** que contextualiza **produtos, kits e promoções REAIS** em torno de um momento, necessidade ou rotina da cliente.

O Mimo conduz: **história → produtos → kit → oferta real → ação comercial (COMPRAR | SOLICITAR ORÇAMENTO).**

Cada Mimo tem **slug próprio** e janela de publicação.

## 2. O que NÃO é (fronteiras duras)

- ❌ **Não é brinde gratuito por padrão** (ver decisão pendente §9 — pode ter mimos-brinde, mas não é a regra).
- ❌ **Não é blog** nem mural de fotos nem grid de cards.
- ❌ **Não inventa desconto**: "oferta real" = `promocao` ou `kit` **real no banco** (D3). Nunca fabrica "-30%".
- ❌ **Não é conteúdo fictício**: texto, mídia e produtos vêm do **patrimônio real da Angel + estratégia comercial aprovada**, não de invenção.
- ❌ **Não é um sistema de fidelidade/pontos** (não existe no legado nem no banco).

## 3. Modelo conceitual

```text
MIMO
├── Identidade   nome · slug · título · descrição · imagem/vídeo
├── Contexto     necessidade · momento · rotina · categoria
├── Comercial    produtos · variantes · kit · promoção · chamada para ação
├── Conteúdo     texto · mídia · dicas · ordem
└── Publicação   ativo · início · fim · SEO
```

## 4. Regras comerciais (herdam das decisões fechadas)

1. **Oferta real (integridade):** toda oferta exibida num Mimo deve referenciar uma `promocao` válida (D3: % ou R$ fixo, não cumulativa, menor preço final, datas obrigatórias) ou um `kit` real. **Sem oferta real → o Mimo apresenta os produtos normalmente, sem inventar desconto.**
2. **Preço (D2):** resolve variante (pode sobrescrever base) → aplica promoção válida (D3) → snapshot no carrinho. O Mimo **não redefine preço**; ele apenas apresenta a resolução real.
3. **Estoque (D4):** disponibilidade real; **reserva só no checkout**, nunca ao adicionar. O Mimo **não promete estoque**.
4. **Publicação:** `ativo` + `início` + `fim` obrigatórios. Mimo fora da janela **não aparece** no site (visível apenas no admin, como rascunho/expirado).
5. **Fallback (REGRA_DE_DESIGN §7):** imagem ausente → fallback premium; erro → rollback; **nunca URL falsa gravada no banco**.
6. **Conteúdo:** bloco editorial é real; nenhum Lorem ipsum, nenhuma data/evento inventado.

## 5. Telas

### 5.1 Lista — `/mimos-diarios`
- Pergunta editorial: **"Como você quer se cuidar hoje?"**
- Navegação por contexto: **CUIDAR · RITUAL · PRESENTEAR** (exemplos estruturais, não conteúdo definitivo).
- Lista dos **Mimos ativos** (dentro da janela), em composição editorial (não grid de cards iguais).
- **Estados:** carregando · vazio (nenhum mimo ativo → mensagem elegante, sem grid vazio) · erro recuperável.

### 5.2 Detalhe — `/mimos-diarios/:slug`
- Fluxo: **HISTÓRIA → PRODUTOS → KIT → OFERTA REAL → [COMPRAR] [SOLICITAR ORÇAMENTO]**
- Composição assimétrica/editorial: imagem + texto + produto integrados (REGRA_DE_DESIGN §4–§5).
- **Estados:** ativo · expirado/fora de janela (não indexado, mensagem adequada) · sem imagem (fallback) · erro (rollback) · sem oferta real (apresenta produtos sem desconto inventado).

### 5.3 Admin (futuro)
- CRUD de Mimos: identidade, contexto, produtos/kits/promoções vinculados, janela, SEO, ordem.
- Indicador de saúde: mimo sem imagem · oferta sem promoção real · fora de janela.

## 6. Slug / URL

```text
/mimos-diarios                          (lista)
/mimos-diarios/:slug                    (detalhe)
/mimos-diarios/ritual-de-autocuidado    (exemplo ESTRUTURAL — não é conteúdo a inventar)
/mimos-diarios/pele-radiante            (exemplo ESTRUTURAL)
/mimos-diarios/momento-relax            (exemplo ESTRUTURAL)
```

Slug é **canônico, único, indexável** (SEO). Slugs de exemplo são estrutura; o conteúdo real vem do patrimônio + estratégia.

## 7. Relacionamentos

```text
MIMO
 ├── N:N → PRODUTO            (via mimo_produto)
 │          └── resolve VARIANTES (D1: tamanho/cor/volume, opcionais)
 ├── N:1 → KIT                (kit_composicao — existe)
 ├── N:1 → PROMOÇÃO           (promocao — existe, D3)
 └── N:1 → CATEGORIA          (contexto/rotina)
```

- **Reaproveita** entidades existentes: `produto`, `produto_variante`, `kit_composicao`, `promocao`, `categoria`.
- **Não** reutiliza `produto_categoria` (essa é a vinculação produto↔categoria; o Mimo é um agrupamento editorial distinto).

## 8. O que precisa de banco vs. o que não precisa

| Aspecto | Precisa de banco? | Observação |
|---|---|---|
| Entidade `mimo` (identidade, contexto, publicação, SEO) | **Sim — nova** | proposta, pendente revisão do modelo comercial |
| Vinculação `mimo` ↔ `produto` (`mimo_produto`) | **Sim — nova** | N:N, com ordem |
| `mimo` → `kit` / `promocao` / `categoria` | Sim (FKs) | reusa tabelas existentes |
| Janela de publicação (ativo/início/fim) | Sim | campo do `mimo` |
| Layout editorial, composição visual, animações | **Não** | frontend |
| Fallback visual de imagem | **Não** | frontend (nunca grava no banco) |
| "Diário" (rotação/agendamento de exibição) | **Pendente** | ver §9 — pode ser regra de publicação, não tabela nova |

**Proposta mínima de tabelas (SUJEITA À REVISÃO do modelo comercial — etapa 5):** `mimo`, `mimo_produto`. **Nenhuma migration escrita ou aplicada.**

## 9. Decisões que precisam de você (antes de fechar)

1. **Mimo é brinde gratuito ou curadoria editorial?** (A especificação assume curadoria editorial que conduz à compra; mimos-brinde seriam um subtipo.)
2. **"Diário" é regra de negócio ou editorial?** Há rotação automática por dia, ou a Angel publica manualmente na janela que escolher?
3. **Elegibilidade:** todos os visitantes? apenas cadastradas? primeira compra?
4. **Limite de Mimos ativos** simultâneos? Ordem de destaque?
5. **Se houver mimo-brinde físico:** ele tem estoque próprio (D4 híbrido) e resgate registrado? (afetaria modelo de estoque)
6. **Mimo pode existir sem oferta real**, apenas como storytelling de marca? (recomendado: sim)

## 10. O que não foi inventado

- Nenhum conteúdo de Mimo real foi criado aqui (nomes, textos, fotos, datas).
- Slugs e contextos (CUIDAR/RITUAL/PRESENTEAR) são **estrutura**, não conteúdo.
- Conteúdo real virá do **Inventário de Patrimônio (Fase 0)** + estratégia comercial aprovada.

---

> **Nenhuma migration, alteração de Supabase ou implementação de código é autorizada por este documento.** Ele fecha o domínio funcional de Mimos Diários para a etapa 1; o modelo de dados só se torna SQL após a etapa 5 (Gap Analysis) e revisão humana (etapa 7).
