## DECISOES_NEGOCIO_v1.3.md — D1 Fechada

**Gerado por:** Workshop de Fechamento D1-D4 + D9-D10
**Data:** 2026-09-15
**Base:** DECISOES_NEGOCIO_v1.2.md + Decisão oficial do dono do negócio (D1)
**Motivo:** Registro da primeira decisão fechada no workshop.

---

## DECISÃO 1 — Atributos de Variante

**FECHADA:** 2026-09-15

### Escolha

**C — Tamanho + cor + volume/ml** (atributos opcionais conforme o produto)

### Regra comercial

- Um produto **pode ser simples**, sem variantes.
- Um produto **pode possuir variantes** quando houver diferenciação comercial real.
- Uma variante pode utilizar **um ou mais atributos aplicáveis ao produto**:
  - tamanho;
  - cor;
  - volume/ml.
- **Não é obrigatório** utilizar todos os três atributos em toda variante.
- Os atributos são opcionais conforme o produto:
  - batom → cor;
  - shampoo → volume;
  - roupa → tamanho;
  - produto com mais de uma dimensão comercial → combinação dos atributos aplicáveis.
- **Não adotar atributos livres/EAV/JSONB** nesta versão.
- **Não criar outros atributos** sem nova decisão de negócio.
- **Não assumir que todo produto possui tamanho.**

### Justificativa

Preserva a simplicidade dos produtos atuais sem amarrar o novo sistema ao mock de tamanho P/M/G/GG/XG. Evita dois extremos: modelo limitado (apenas tamanho) e complexidade prematura (atributos livres/EAV).

### Impacto técnico (resumo — detalhes na arquitetura)

Definir estrutura de variante com suporte a 3 atributos opcionais. Não incluir EAV/JSONB. Modelo será detalhado no Contrato Funcional.

### Decisor

Negócio

### Evidência anterior

- Sistema atual: apenas `tamanho` no frontend mock (`verprodutos.js`), sem variante no banco
- CONTRATO v1.1: produto pode ter variantes, atributos não definidos (PENDENTE)

### Status

PENDENTE → **FECHADO**

---

---

## DECISÃO 2 — Preço de Variante

**FECHADA:** 2026-09-15

### Escolha

**B + D — Variante pode sobrescrever o preço base + preço congelado no carrinho**

### Regra comercial

- Todo produto pode possuir um **preço base**.
- Uma variante **pode ter preço próprio** quando houver diferença comercial.
- Se a variante não tiver preço próprio, **herda o preço base do produto**.
- No momento em que o item entra no carrinho, o preço unitário é registrado como **snapshot**.
- Alterações posteriores no preço do catálogo **não alteram silenciosamente** o preço daquele item já no carrinho.
- No checkout, o sistema deve **revalidar disponibilidade e regras comerciais** antes de confirmar o pedido. Snapshot não significa ignorar validações.
- O preço efetivamente utilizado no pedido fica registrado como **histórico**.

### Exemplo

```text
Produto: Shampoo X
Preço base: R$ 30,00

Variante:
500 ml → R$ 30,00
1 litro → R$ 45,00

Cliente adiciona 1 litro ao carrinho → Preço no carrinho = R$ 45,00
Se catálogo muda para R$ 50,00 → carrinho NÃO muda silenciosamente para R$ 50,00
No checkout → sistema revalida disponibilidade e regras antes de confirmar
```

### Justificativa

B permite flexibilidade sem perder o preço base. D protege o cliente de mudanças silenciosas de preço entre carrinho e checkout. C (preço totalmente independente) é desnecessariamente rígida. F (tempo real) pode produzir experiência ruim (R$ 45 → R$ 52 sem ação do cliente).

### Impacto técnico (resumo)

`produto_variante.preco` obrigatório com fallback para `produtos.preco_base`. `CartItem.precoUnitario` como snapshot. Revalidação no checkout. Preço confirmado no pedido como histórico. Detalhes no Contrato Funcional.

### Regras de promoção (D3)

- **Tipo:** Percentual + valor fixo (C)
- **Escopo:** Promoção no produto base, aplica às variantes (D). Sem promoção por variante no lançamento.
- **Cumulatividade:** Não cumulativa (H/I). Apenas uma promoção válida por item. Quando houver mais de uma, aplicar a que resultar no **menor preço final** para o cliente. Não comparar apenas o valor numérico do desconto, pois percentual e fixo não são diretamente comparáveis.
- **Período:** Início e fim obrigatórios (J). Sem promoção permanente sem datas.
- **Cupons:** Não no lançamento (L). Serão avaliados como mecanismo separado futuramente.
- **Ordem de cálculo:** Produto → resolução do preço da variante → promoção válida → preço promocional → snapshot no carrinho → preservado no item do pedido ao confirmar.

### Decisor

Negócio

### Evidência anterior

- Sistema atual: `produtos_promocao` existe (1:N por produto), mas tipo de desconto ambíguo (`desconto decimal(5,2)`), frontend ignora completamente, sem regras de prioridade ou cumulatividade
- CONTRATO v1.1: promoção reconhecida, regras específicas pendentes

### Status

PENDENTE → **FECHADO**

---

## DECISÃO 4 — Estoque

**FECHADA:** 2026-09-15

### Escolha

**Modelo: C — Híbrido | Reserva: E — Checkout | Baixa: G + H por canal | Estoque negativo: K | Cancelamento: M**

### Regras comerciais

1. **Modelo de estoque: Híbrido**
   - Produto simples → estoque no nível do produto.
   - Produto com variantes → estoque individual por variante/SKU.
   - Variante sem estoque próprio não deve assumir estoque compartilhado implicitamente.

2. **Reserva: No checkout (transacional/atômica)**
   - Não reservar ao adicionar ao carrinho.
   - O carrinho representa intenção, não reserva.
   - Ao avançar para checkout/pagamento, disponibilidade é validada e quantidade reservada atomicamente.
   - Fluxo WhatsApp não reserva estoque automaticamente (conforme D7).

3. **Baixa: G + H por canal**
   - Site: estoque consumido mediante pagamento aprovado.
   - WhatsApp: estoque consumido somente após confirmação explícita do pedido pelo vendedor.
   - Clique em "Finalizar no WhatsApp" não representa venda confirmada e não gera baixa.

4. **Estoque negativo: Não permitido**
   - Zero significa indisponível. Nenhuma venda pode ultrapassar a quantidade disponível.
   - Pré-venda não faz parte do MVP.

5. **Cancelamento/devolução: M — Retorno com validação**
   - Reserva não consolidada → liberada ao cancelar/expirar.
   - Venda consolidada cancelada/devolvida → reposição conforme regra comercial aplicável.
   - Não usar retorno cego sem considerar o evento que originou a baixa.

6. **Regra crítica**
   - Disponibilidade deve ser garantida de forma transacional/atômica no checkout. Não confiar apenas em validação frontend.

### Fluxo de referência (D1–D4)

```text
Produto
  → resolve variante (D1)
  → resolve preço da variante (D2)
  → aplica promoção válida (D3)
  → snapshot do preço no carrinho
  → checkout valida disponibilidade
  → reserva atômica
  → pagamento/confirmação
  → baixa/consolidação do estoque (D4)
```

### Relação com D1-D3

- D1 define SE estoque é por produto ou por variante
- D2 define quando preço é congelado (antes da reserva)
- D3 define promoção incide sobre preço já resolvido (antes da reserva)
- Disponibilidade validada APÓS resolução de preço e promoção

### Justificativa

Modelo híbrido preserva simplicidade para produtos simples e resolve corretamente o problema criado por D1. Reserva no checkout (não no carrinho) evita bloqueio desnecessário e garante concorrência correta entre dois canais (site + WhatsApp). Estoque negativo não permitido evita venda sem entrega.

### Decisor

Negócio

### Evidência anterior

- Sistema atual: estoque 1:1 com produtos, sem reserva no carrinho, sem baixa funcional (PHP não roda), sem controle de estoque negativo confirmado
- CONTRATO v1.1: estoque reconhecido como conceito comercial, modelo específico pendente

### Status

PENDENTE → **FECHADO**

---

## DECISÃO 9 — Endereço

**FECHADA:** 2026-09-15

### Escolha

**Obrigatoriedade: B + H | WhatsApp: F | Tipo: J (entrega MVP) | Campos: L (CEP + ViaCEP, número manual)**

### Regras comerciais

1. **Obrigatoriedade: B + H**
   - Endereço de entrega é obrigatório no checkout do site.
   - Visitante também deve informar endereço para concluir uma compra com entrega.
   - Endereço NÃO é obrigatório para navegação ou cadastro.
   - Cadastro híbrido (D8) preservado: visitante informa e-mail + endereço na finalização.

2. **WhatsApp: F**
   - Cliente informa endereço no fluxo do site antes de finalizar no WhatsApp.
   - Pedido WhatsApp continua sendo rascunho (D7).
   - Endereço fica estruturado e vinculado ao rascunho antes da abertura do WhatsApp.
   - Endereço pode ser incluído na mensagem pré-preenchida ao vendedor.
   - Clique em "Finalizar no WhatsApp" não representa confirmação da venda.

3. **Tipo de endereço: J — apenas entrega (MVP)**
   - Não há endereço de cobrança separado no MVP.
   - Questões de cobrança/pagamento permanecem na arquitetura técnica.

4. **Campos: L com número manual obrigatório**
   - CEP obrigatório.
   - ViaCEP preenche logradouro, bairro, cidade, UF.
   - Número obrigatório e informado manualmente.
   - Complemento opcional.
   - Endereço validado antes da conclusão do pedido.

5. **Endereços salvos: múltiplos**
   - Cliente pode ter múltiplos endereços cadastrados (1:N).
   - Cada pedido aponta para um endereço de entrega específico.
   - Não limitar a um endereço por cliente.

6. **Snapshot do endereço no pedido**
   - O endereço efetivamente utilizado na compra é preservado como snapshot histórico.
   - Alterações futuras no cadastro NÃO modificam pedidos já realizados.

7. **Regra crítica**
   - Nenhum pedido com entrega pode ser concluído sem endereço de entrega válido.

### Fluxo de referência

**Checkout do site:**
```text
Carrinho → dados do cliente (e-mail) → endereço de entrega → validação → checkout/pagamento
```

**WhatsApp:**
```text
Carrinho → dados do cliente → endereço de entrega → criação do rascunho → mensagem pré-preenchida → abertura WhatsApp → confirmação pelo vendedor
```

### Relação com D7, D8

- D8 (cadastro híbrido): cliente cadastrado usa endereço salvo; visitante informa endereço na finalização. Ambos têm endereço obrigatório para compra com entrega.
- D7 (WhatsApp rascunho): endereço é preenchido antes do rascunho, não depois. O rascunho tem endereço estruturado quando é criado.

### Decisor

Negócio

### Evidência anterior

- Sistema atual: `enderecos` existe mas não é usado no checkout; pedido não tem `endereco_entrega_id`; ViaCEP chamado mas endereço não obrigatório no checkout
- CONTRATO v1.1: endereço reconhecido, ViaCEP obrigatório, obrigatoriedade pendente

### Status

PENDENTE → **FECHADO**

---

## DECISÃO 10 — Status do Pedido

**FECHADA:** 2026-09-15

### Escolha

**A + D + F + I + L + N — Dois fluxos convergem, pagamento separado, confirmação por canal**

### Regras comerciais

1. **Fluxos: A — dois fluxos que convergem**
   - Site começa no checkout/pagamento.
   - WhatsApp começa como `rascunho`.
   - Após confirmação, ambos convergem: `processando → enviado → entregue`.
   - `rascunho` representa intenção, NÃO pedido confirmado.

2. **Pagamento: D — separado do status do pedido**
   - `status_pedido`: ciclo comercial/logístico.
   - `status_pagamento`: ciclo financeiro.
   - `pagamento_aprovado` NÃO é status principal do pedido.
   - Pedido pode existir com pagamento pendente ou recusado.

3. **Confirmação: F — depende do canal**
   - Site: confirmação comercial após pagamento aprovado.
   - WhatsApp: confirmação após validação explícita do vendedor.
   - Criar rascunho NÃO significa confirmação da venda.

4. **Estados oficiais do pedido**
   - `rascunho`
   - `processando`
   - `enviado`
   - `entregue`
   - `cancelado`

5. **Estados de pagamento**
   - `pendente`
   - `aprovado`
   - `recusado`

6. **Cancelamento: I — permitido até o envio**
   - Cancelamento pode ocorrer antes do envio.
   - Após envio, situações de pós-venda seguem processo próprio.
   - Cancelamento deve respeitar situação do pedido e do pagamento.

7. **Devolução/troca: L — processo separado**
   - `devolvido` e `trocado` NÃO são estados principais do pedido.
   - Devolução/troca tem processo próprio com movimentações registradas.

8. **Estoque: N — vinculado ao evento de confirmação**
   - Site: pagamento aprovado → consolidação da baixa.
   - WhatsApp: vendedor confirma → consolidação da baixa.
   - Reserva segue D4 (checkout, transacional).
   - Criar rascunho WhatsApp ou abrir WhatsApp NÃO gera baixa de estoque.
   - Estoque negativo permanece proibido (D4).

9. **Relação com D4**
   - Carrinho não reserva estoque.
   - Checkout valida disponibilidade e reserva transacionalmente.
   - Consolidação/baixa conforme evento de confirmação de cada canal.
   - Cancelamento/expiração de reserva libera estoque.
   - Devoluções podem gerar movimentação de retorno ao estoque.

10. **Relação com D7**
    `rascunho → confirmação do vendedor → processando → enviado → entregue`.

11. **Relação com D9**
    - Pedido com entrega NÃO pode sair de `rascunho` sem endereço válido.
    - Endereço utilizado na compra preservado no histórico do pedido.

12. **Regra histórica**
    - Alterações posteriores no cadastro de cliente, endereço, produto, preço ou promoção NÃO podem alterar dados comerciais já registrados no pedido confirmado.

### Máquina comercial

```text
                    SITE
                     │
                     ▼
              checkout/pagamento
                     │
          ┌──────────┴──────────┐
          │                     │
      pagamento             pagamento
       pendente               aprovado
          │                     │
          │                     ▼
          │                PROCESSANDO
          │                     │
          │                     ▼
          │                  ENVIADO
          │                     │
          │                     ▼
          │                 ENTREGUE
          │
          └──── cancelamento conforme regra

                  WHATSAPP
                     │
                     ▼
                  RASCUNHO
                     │
              vendedor confirma
                     │
                     ▼
                PROCESSANDO
                     │
                     ▼
                  ENVIADO
                     │
                     ▼
                 ENTREGUE
```

### Decisor

Negócio

### Evidência anterior

- Sistema atual: 4 status (`Em processamento`, `Enviado`, `Entregue`, `Cancelado`), sem persistência real, sem separação de pagamento, sem WhatsApp no sistema
- CONTRATO v1.1: ciclo de vida reconhecido, estados pendentes

### Status

PENDENTE → **FECHADO**

---

## DECISÕES FECHADAS NO WORKSHOP

| ID | Decisão | Escolha | Status |
|----|---------|---------|--------|
| D1 | Atributos de Variante | C — Tamanho + cor + volume/ml | ✅ Fechada |
| D2 | Preço de Variante | B + D — Sobrescreve + snapshot | ✅ Fechada |
| D3 | Promoções | C + D + H/I + J + L — ordem: variante → promo → snapshot | ✅ Fechada |
| D4 | Estoque | C + E + G+H + K + M — híbrido, checkout, baixa por canal | ✅ Fechada |
| D9 | Endereço | B + H + F + J + L — obrigatório checkout, WhatsApp F, entrega MVP | ✅ Fechada |
| D10 | Status do Pedido | A + D + F + I + L + N — dois fluxos, pagamento separado | ✅ Fechada |

---

### Fluxo completo consolidado (D1–D4, D9–D10)

```text
Produto (D1: simples ou variante com tamanho/cor/volume)
  ↓
Preço resolvido (D2: variante sobrescreve base, snapshot no carrinho)
  ↓
Promoção aplicada (D3: menor preço final, não cumulativa)
  ↓
Carrinho (intenção, SEM reserva de estoque)
  ↓
Checkout
  ↓
Endereço validado (D9: obrigatório no checkout, snapshot no pedido)
  ↓
Reserva atômica (D4: no checkout, não no carrinho)
  ↓
Pagamento (DEC2: PIX + cartão | status_pagamento separado)
  ↓
Confirmação (D10: site = pagamento aprovado; WhatsApp = vendedor confirma)
  ↓
Processando (estoque baixado/consumido)
  ↓
Enviado (cancelamento permitido até aqui)
  ↓
Entregue
  ↓
Devolução/troca (processo separado, D10-L)
```

---

> **NENHUMA implementação, alteração de código, migration ou push realizada.**
