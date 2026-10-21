# MODELO COMERCIAL COMPLETO — Angel Cosméticos v1.0

**Status:** Modelo de domínio comercial fechado. **NÃO contém SQL, API ou migration. Nada aplicado ao Supabase.**
**Data:** 2026-10-03
**Base:** `CONTRATO_FUNCIONAL_V1.0` + `DECISOES_NEGOCIO` (D1–D4, D9, D10) + `DEC1–DEC4` + `ESPECIFICACAO_MIMOS_V1.0` + `REGRA_DE_DESIGN_V1`
**Natureza:** documento de domínio funcional. Fecha regras comerciais. SQL só nas etapas 5–6 (Gap Analysis → SQL proposto → revisão → autorização).

---

## 0. Posição na sequência

```text
CONTRATO FUNCIONAL V1.0   ✅
REGRA DE DESIGN V1        ✅
ESPECIFICAÇÃO MIMOS V1    ✅
MODELO COMERCIAL V1       ← ESTE DOCUMENTO
SERVIÇOS + AGENDAMENTO
NOTIFICAÇÕES / WHATSAPP / EMAIL
GAP ANALYSIS FINAL SUPABASE
SQL PROPOSTO → REVISÃO → AUTORIZAÇÃO → MIGRATIONS
```

**Decisões de base já fechadas (não reabertas aqui):** D1 (variantes: tamanho/cor/volume, opcionais, sem EAV/JSONB) · D2 (variante sobrescreve base + snapshot no carrinho) · D3 (promoção % ou R$ fixo, produto-base→variantes, não cumulativa, menor preço final, datas obrigatórias, sem cupons) · D4 (estoque híbrido, reserva só no checkout, baixa por canal, sem estoque negativo, devolução com validação) · D9 (endereço obrigatório no checkout e para visitante, só entrega no MVP, CEP+ViaCEP+número manual) · D10 (dois fluxos convergem, pagamento separado do status, confirmação por canal, cancelamento até envio).

---

## 1. Ciclo comercial

```text
                    PRODUTO
                       │
          ┌────────────┼────────────┐
          ↓            ↓            ↓
       PREÇO       PROMOÇÃO       VARIANTE
          │            │            │
          └────────────┼────────────┘
                       ↓
                    OFERTA
                       │
              ┌────────┴────────┐
              ↓                 ↓
             KIT          DESCONTO COMERCIAL
              │                 │
              └────────┬────────┘
                       ↓
                  CARRINHO
                       │
             ┌─────────┴─────────┐
             ↓                   ↓
          COMPRAR            ORÇAMENTO
             │                   │
             ↓                   ↓
          CHECKOUT          NEGOCIAÇÃO
             │                   │
             └─────────┬─────────┘
                       ↓
                     PEDIDO
                       │
                 PAGAMENTO
                       │
                    ENTREGA
```

---

## 2. Regra fundamental — camadas de preço

O sistema **separa** cinco camadas. Nunca confunde preço de catálogo com preço vendido.

```text
1. PREÇO DE CATÁLOGO    produto.preco_base  (+ variante.preco sobrescreve — D2)
2. OFERTA               promocao            (% ou R$ fixo — D3)
3. NEGOCIAÇÃO           desconto_comercial  (concedido por vendedor, autorizado)
4. CONDIÇÃO DE PAGAMENTO pagamento/condição (método, parcelas)
5. PREÇO EFETIVAMENTE VENDIDO  snapshot em orcamento_item / pedido_item
```

**Ordem de resolução (imutável):**

```text
preco_base (produto)
  → variante (D2: se variante tem preço próprio, sobrescreve; senão herda base)
  → promoção (D3: apenas a válida que resultar no MENOR preço final; não cumulativa)
  → desconto comercial (negociação: no máximo UM, autorizado, aplicado APÓS promoção)
  → frete (frete_regra — configurável, não hardcoded)
  → total
  → snapshot no carrinho (D2) → preservado em orcamento_item / pedido_item
```

**Invariante crítico:** alterar o preço de catálogo, a promoção ou a condição de pagamento **nunca altera** um orçamento ou pedido já registrado. O preço efetivamente vendido é sempre o **snapshot** congelado no item. Isso evita a arquitetura perigosa em que o preço atual do produto reescreve vendas e orçamentos antigos.

---

## 3. Produto e variante

1. **Preço que prevalece (D2):** variante com preço próprio **sobrescreve** `produto.preco_base`; variante sem preço próprio **herda** o base.
2. **SKU:** toda unidade vendável tem SKU.
   - Produto simples → SKU = identificador comercial do produto.
   - Variante → SKU = produto + combinação de atributos (tamanho/cor/volume — D1).
   - SKU é **virtual/derivado** para variante (não exige tabela extra). Campo `sku`/`codigo` é **candidato a gap** (etapa 5).
3. **Disponibilidade (D4):** produto simples → estoque no nível do produto; produto com variantes → estoque por variante/SKU. Variante sem estoque próprio **não assume** estoque compartilhado implicitamente.
4. **Resolução de variante:** dado um produto, o cliente escolhe a combinação de atributos aplicáveis (D1); o sistema resolve a variante exata → preço (D2) → estoque (D4). Se a combinação não existe, o produto/variante não é vendável.
5. **Produto simples é válido** (sem variantes) — não assumir que todo produto tem tamanho/cor/volume (D1).

---

## 4. Promoção

1. **Tipo (D3):** percentual **ou** valor fixo (uma promoção é de um só tipo).
2. **Escopo (D3):** promoção anexa ao **produto base**, aplica-se às suas variantes. **Sem promoção por variante** no lançamento.
3. **Período (D3):** `inicio` e `fim` **obrigatórios**. Sem promoção permanente sem datas.
4. **Elegibilidade:** produto base ativo com promoção válida (dentro da janela).
5. **Prioridade quando houver mais de uma (D3):** **não cumulativa**. Apenas uma promoção válida por item; quando houver mais de uma, aplica a que resultar no **menor preço final** (não se compara só o percentual, pois % e R$ fixo não são diretamente comparáveis).
6. **Cupons (D3):** **não** no lançamento (avaliados como mecanismo separado futuro).
7. **Ordem (D3):** produto → resolução de preço da variante → promoção válida → preço promocional → snapshot no carrinho → preservado no item do pedido.

---

## 5. Desconto comercial (negociação) — NOVO

Desconto comercial é um **ato de negociação**, distinto de promoção. **Não é cupom** (cupom = código digitado pelo cliente; desconto comercial = concessão autorizada por vendedor).

1. **Quem pode conceder:** somente **vendedor/admin autenticado** (`is_admin()` ou papel de vendedor). **Nunca** autoatendimento do cliente. **Nunca** automático.
2. **Onde vive:** primariamente no **orçamento** (fluxo de negociação) e, por extensão, no pedido gerado por conversão de orçamento. **No checkout autoatendimento do site não há desconto comercial** — apenas promoção (D3). Isso separa autoatendimento de venda negociada.
3. **Tipo:** percentual **ou** valor fixo (um desconto é de um só tipo).
4. **Limite:** teto máximo de desconto **configurável** (proteção de margem). Candidato a gap: `desconto_comercial.teto_maximo` / configuração global de margem mínima (etapa 5).
5. **Acumulação com promoção:** **pode combinar** com **uma** promoção (camadas distintas: oferta pública + negociação privada), aplicado **após** a promoção, sujeito ao teto de margem. **Não** acumula com outro desconto comercial (no máximo um).
6. **Ordem de aplicação:** base → variante (D2) → promoção (D3, menor preço final) → **desconto comercial (um, autorizado)** → frete → total.
7. **Rastreabilidade:** todo desconto comercial registra **quem concedeu**, **quando**, **valor/percentual** e **autorização** (→ auditoria, §11).
8. **Conversão:** desconto comercial concedido num orçamento é **preservado como snapshot** ao converter em pedido (§8.10).

---

## 6. Kits

**Decisão de modelo (fechada):** um **kit é um `produto`** (com `preco_base` próprio) que possui uma `kit_composicao` listando seus componentes. Kit não é uma entidade de preço paralela.

1. **Composição:** `kit_composicao` = kit (produto) → componente (produto) + quantidade. Componentes são produtos normais (podem também ser vendidos avulsos — mesmo pool de estoque).
2. **Preço:** kit tem **preço próprio** (`produto.preco_base` do kit), definido no admin. Pode ser menor que a soma dos componentes, mas é um **preço real de kit**, não uma promoção inventada.
3. **Estoque dos componentes (D4 híbrido):** kit **não tem estoque próprio**; sua disponibilidade é **derivada** dos componentes.
4. **Disponibilidade:** kit está disponível **se e somente se** cada componente tiver estoque ≥ quantidade exigida pela composição.
5. **Compra do kit:** kit entra no carrinho como item; no checkout, a **reserva atômica** (D4) consome, para cada componente, a quantidade da composição.
6. **Impacto no estoque:** na venda confirmada (baixa por canal — D4), cada componente tem o estoque reduzido pela quantidade da composição. A movimentação do kit **fane-out** para os componentes (rastreável via `estoque_movimentacao`).
7. **Antissobrevenda:** como componentes compartilham pool com venda avulsa, a **reserva atômica no checkout** (D4) é o que impede oversell entre kit e avulso.

---

## 7. Carrinho

1. **Conceito único:** um carrinho por sessão/cliente; alimenta dois fluxos (site e WhatsApp) que convergem em pedido (D10).
2. **Snapshot necessário (D2):** no momento em que o item entra no carrinho, o **preço unitário é registrado como snapshot**. Alterações posteriores no catálogo **não alteram silenciosamente** o preço do item já no carrinho.
3. **Atualização de preço:** o carrinho **não** reajusta preço sozinho; se o catálogo muda, o item mantém o snapshot até revalidação no checkout (o cliente é informado, não sofrido silenciosamente).
4. **Disponibilidade:** o carrinho representa **intenção, não reserva** (D4). Estoque não é reservado ao adicionar.
5. **Reserva — somente no checkout (D4):** ao avançar para checkout/pagamento, disponibilidade é validada e quantidade **reservada atomicamente/transacionalmente**.
6. **Revalidação no checkout:** antes de confirmar, o sistema **revalida** disponibilidade e regras comerciais. Snapshot não significa ignorar validações (D2).

---

## 8. Orçamento

**Conceito:** orçamento é uma **proposta comercial negociada**, veículo do desconto comercial. Ciclo:

```text
rascunho → enviado → aceito | recusado | expirado
                        ↓ (aceito)
                    conversão → PEDIDO
```

1. **Cliente:** vinculado a `cliente` (ou visitante lazy, D8).
2. **Itens (`orcamento_item`):** produto + variante + quantidade + **preço unitário congelado (snapshot)**.
3. **Preços congelados:** sim — mesmo princípio de D2 estendido ao orçamento. Preço de catálogo futuro não reescreve orçamento.
4. **Descontos:** pode conter **um** desconto comercial (§5), autorizado e rastreado.
5. **Frete:** **estimativa** via `frete_regra` (não reserva estoque; não é cobrança final até o pedido).
6. **Validade:** `validade` (data). Ao passar da validade → status `expirado` (não aceitável).
7. **Condição de pagamento:** método/parcelas esperadas (PIX, cartão, parcelas) registradas.
8. **Observações:** texto livre do vendedor.
9. **Status:** `rascunho` · `enviado` · `aceito` · `recusado` · `expirado` (check constraint).
10. **Aprovação:** por vendedor/admin (`is_admin()`). Aprovação = transição para `aceito` (ou `recusado`).
11. **Histórico:** transições de status registradas (quem, quando, de→para).
12. **Conversão para pedido:** orçamento `aceito` pode ser **convertido em pedido**, carregando o **snapshot** dos itens, do desconto comercial e do frete. A conversão é um ato auditado (§11). Após conversão, o pedido segue o ciclo D10.
13. **Não é pedido:** orçamento `aceito` **não** é venda confirmada nem gera baixa de estoque. Só o pedido convertido (e sua confirmação por canal — D10) consolida.

---

## 9. Pagamento

1. **Método (DEC2):** **PIX** ou **cartão** (crédito/débito) no lançamento. Boleto/pagamento na entrega: não confirmados para o lançamento.
2. **Condição:** à vista (PIX) ou parcelado (cartão).
3. **Parcelas:** regra comercial configurável — máximo de parcelas e limite de sem-juros, por método. (Execução/gateway é técnico — D6b — e pertence à arquitetura, não a este modelo.) Candidato a gap: `condicao_pagamento`/configuração de parcelamento (etapa 5).
4. **Status (D10):** `status_pagamento` **separado** do `status_pedido`: `pendente` · `aprovado` · `recusado`. `pagamento_aprovado` **não** é status principal do pedido.
5. **Transação:** identificador da transação do gateway registrado no `pagamento`.
6. **Confirmação (D10):** **site** = pagamento aprovado (via webhook do gateway); **WhatsApp** = vendedor confirma explicitamente. Criar rascunho **não** confirma venda.
7. **Cancelamento/estorno:** estorno/void registrado como **evento de pagamento** separado; estorno de venda consolidada gera **movimentação de retorno** ao estoque (D4-M), não retorno cego.

---

## 10. Pedido

1. **Snapshot comercial:** ao confirmar, o pedido congela **tudo**: preços dos itens, desconto comercial, frete, endereço, condição de pagamento. Alterações futuras em cadastro/produto/preço/promoção **não alteram** o pedido confirmado (regra histórica — D10).
2. **Itens (`pedido_item`):** produto + variante + quantidade + **preço unitário snapshot** + desconto aplicado.
3. **Endereço:** snapshot do endereço de entrega utilizado (D9). Pedido com entrega **não** sai de `rascunho` sem endereço válido.
4. **Frete:** valor de frete snapshot.
5. **Pagamento:** `pagamento` vinculado, com `status_pagamento` separado (D10).
6. **Status (D10):** `rascunho` · `processando` · `enviado` · `entregue` · `cancelado`. Dois fluxos convergem (site: checkout→pagamento; WhatsApp: rascunho→vendedor confirma) → `processando → enviado → entregue`.
7. **Histórico (`pedido_status_historico`):** cada transição registrada (quem/quando/de→para).
8. **Cancelamento (D10-I):** permitido **até o envio**; respeita situação do pedido e do pagamento; libera reserva/estoque conforme D4. Após envio, pós-venda é processo próprio.
9. **Devolução/troca (D10-L):** `devolvido`/`trocado` **não** são estados principais; processo próprio com movimentações registradas.
10. **Origem:** `site` ou `whatsapp` (confirmação por canal — D10).

---

## 11. Auditoria

`auditoria` (existe) é a camada de observabilidade da integridade comercial. Registra, com ator (`auth.jwt()->>'email'`), ação, entidade, `entity_id`, antes/depois e timestamp:

1. **Quem concedeu** desconto comercial (§5.7).
2. **Quem alterou** orçamento (itens, preço, desconto, validade).
3. **Quem aprovou** orçamento (transição de status).
4. **Quem converteu** orçamento em pedido (§8.12).
5. **Alterações comerciais relevantes:** preço de catálogo, promoção, estoque crítico, cancelamento, estorno.

**Regra:** nenhum ato comercial sensível (desconto, aprovação, conversão, cancelamento, estorno) é executado sem registro de auditoria.

---

## 12. Mimo no modelo comercial

O Mimo **não é** uma tabela financeira paralela. É **curadoria comercial/editorial** (decisão fechada): **não é automaticamente um brinde gratuito**.

```text
Mimo
  ↓ curadoria
  ↓ produto → kit → promoção válida → oferta
```

- Se o Mimo **não** tem promoção → **continua sendo um Mimo** (storytelling de marca), apresenta produtos normalmente.
- Se tem promoção → mostra a **oferta real** (D3).
- Se tem kit → mostra o **kit real** (§6).
- Se não tem nenhum dos dois → **não inventa desconto**.
- O Mimo **nunca** carrega preço, desconto ou estoque próprio; apenas **referencia** entidades comerciais reais. Uma futura campanha de **brinde** será **outro mecanismo comercial**, com regra própria — não se mistura "Mimo" com "brinde".

---

## 13. Modelo de dados conceitual (sem SQL)

**Reaproveita (existem no schema canônico):** `produto` (`preco_base`), `produto_variante` (`preco`), `produto_atributo(_valor)`, `produto_variante_atributo`, `kit_composicao`, `promocao`, `categoria`, `fornecedor`, `cliente`, `endereco`, `carrinho`, `carrinho_item`, `frete_regra`, `pedido`, `pedido_item`, `pagamento`, `pedido_status_historico`, `estoque`, `estoque_movimentacao`, `auditoria`.

**Candidatos a novo (sinalizados para GAP Analysis — etapa 5; NENHUM criado agora):**
- `desconto_comercial` (negociação: ator, tipo, valor, teto, vinculação a orçamento/pedido).
- `orcamento` + `orcamento_item` (rascunho existe `20260920000002` — **não aplicado**; será **reescrito** na etapa 6 para incorporar desconto comercial, condição de pagamento, histórico e conversão).
- `condicao_pagamento`/parcelamento (configuração de parcelas).
- `sku`/`codigo` em produto/variante.

**Nenhuma migration escrita ou aplicada.** A definição final de tabelas só ocorre após a etapa 5 (Gap Analysis) e revisão humana (etapa 7).

---

## 14. Regras de integridade transversal

1. **Atômica:** reserva de estoque e baixa são transacionais (D4). Kit faz fan-out atômico para componentes (§6.6).
2. **Não-falsificação:** mock preserva a experiência visual, **nunca** falsifica estado comercial (sem preço/estoque/promoção inventados — REGRA_DE_DESIGN §8).
3. **Snapshot:** preço, desconto, frete e endereço são congelados no item/pedido (D2/D9/D10).
4. **Piso de margem:** desconto comercial respeita teto configurável (§5.4).
5. **Estorno com validação:** retorno ao estoque considera o evento que originou a baixa (D4-M), não retorno cego.
6. **Rastreabilidade:** atos comerciais sensíveis são auditados (§11).

---

## 15. O que não é decidido aqui (pertence à arquitetura técnica, não é "decidir depois" comercial)

- **Gateway de pagamento** (D6b) e execução de PIX/cartão/parcelamento → `ARQUITETURA_TÉCNICA.md`.
- **Webhooks** do gateway → arquitetura técnica.
- **Estrutura SQL/RLS/Edge Functions** → etapas 5–6.

Estes são **destino técnico**, não pendência comercial: as **regras** comerciais (métodos, parcelas, status, confirmação por canal) estão fechadas acima.

---

> **Nenhuma migration, alteração de Supabase ou implementação de código é autorizada por este documento.** Ele fecha o modelo comercial (etapa 2). O `orcamento` só se torna SQL correto e integrado após o Gap Analysis final (etapa 5) — não será "desbloqueado" agora só porque a tela antiga está quebrada.
