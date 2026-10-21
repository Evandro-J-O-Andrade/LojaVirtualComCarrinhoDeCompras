# AUDITORIA/WORKSHOP DE FECHAMENTO — D1, D2, D3, D4, D9, D10

**Contexto:** Angel Cosméticos — `CONTRATO_DOMINIO_COMERCIAL_v1.1` aprovado. 6 decisões de domínio permanecem abertas e precisam ser fechadas antes de gerar `CONTRATO_FUNCIONAL_SISTEMA_v1.0`.

**Objetivo:** Fechar D1, D2, D3, D4, D9, D10 apresentando evidências do sistema atual, alternativas viáveis e impactos de cada escolha. **A decisão comercial é do dono do negócio. Kilo NÃO decide.**

**Regra absoluta:** Kilo não pode decidir pelo usuário.

Para cada decisão, Kilo deve:
1. Apresentar o que o sistema atual suporta (com evidências de arquivos específicos)
2. Apresentar o que o CONTRATO DOMÍNIO COMERCIAL v1.1 diz (se houver)
3. Apresentar alternativas viáveis com impactos
4. **Aguardar resposta antes de avançar**

Kilo NÃO pode:
- Inventar regras de negócio
- Escolher alternativas pelo usuário
- Assumir que uma decisão já foi tomada
- Avançar para a próxima decisão sem resposta
- Gerar código, migrations, contrato funcional ou arquitetura
- Fazer push

---

## 📂 FONTES OBRIGATÓRIAS (ler antes de executar)

1. `CONTRATO_DOMINIO_COMERCIAL_v1.1.md` — domínio comercial aprovado
2. `DECISOES_NEGOCIO_v1.2.md` — decisões fechadas e pendentes
3. `AUDITORIA_4_RELATORIO.md` — inventário funcional completo
4. `AUDITORIA_3_DOMAIN_CONTRACT.md` — domain contract com evidências
5. `AUDITORIA_5_1_SANEAMENTO_PROMPT.md` — contexto do saneamento
6. `CONTRATO_DOMINIO_COMERCIAL_v1.0.md` — contrato original (referência)

Se algum arquivo não existir, registrar isso e continuar com as fontes disponíveis.

---

## ⚠️ RESTRIÇÕES

### 1. NÃO decidir pelo usuário

Cada decisão é apresentada com alternativas e impactos. O usuário responde. Kilo registra.

### 2. NÃO transformar evidência em regra

O fato de o sistema atual fazer algo de certa forma NÃO significa que deve continuar assim. O sistema atual é **evidência**, não **decisão**.

### 3. NÃO inventar o que o sistema suporta

Se não há evidência de que o sistema suporta algo, dizer "não determinado" ou "sem evidência". Não assumir.

### 4. NÃO acelerar

Uma decisão por vez. Aguardar resposta. Não avançar múltiplas decisões em paralelo.

### 5. NÃO gerar artefatos de implementação

Nenhuma código, migration, modelo de dados, API contract, ou documento funcional. Apenas fechar as decisões.

---

## 📋 DECISÕES A FECHAR (em ordem sugerida)

### Evidência de estado atual para cada decisão

Antes de apresentar cada decisão, Kilo deve localizar e citar a evidência relevante das fontes obrigatórias.

---

### D1 — Atributos de Variante

**O que o sistema atual suporta (evidência):**

| Aspecto | Evidência | Fonte |
|---------|-----------|-------|
| Variant exists no banco? | **NÃO** — não existe tabela `produto_variante` | AUDITORIA_4 §7, AUDITORIA_3 §2.1 |
| `tamanho` no frontend? | **SIM** — `verprodutos.js` tem `<select name="Tamanho">` com P/M/G/GG/XG | AUDITORIA_4 §3, AUDITORIA_3 §2.1 |
| `cor` no sistema? | **NÃO** — sem evidência em HTML/JS/PHP/SQL | AUDITORIA_3 §2.1 |
| `volume/ml` no sistema? | **NÃO** — sem evidência | AUDITORIA_3 §2.1 |
| Outros atributos? | **NÃO** — sem evidência de fragrância, voltagem, acabamento, modelo, etc. | — |
| Tamanho obrigatório? | **NÃO** — é mock frontend, não obrigatório | AUDITORIA_4 §12, AUDITORIA_3 §2.1 |
| Produto simples válido? | **SIM** — todos os produtos no SQL são simples (sem variante) | AUDITORIA_3 §2.1 |
| Preço por variante no banco? | **NÃO** — preço é no produto base no banco; `verprodutos.js` tem preços diferenciados por tamanho apenas no frontend | AUDITORIA_3 §2.1, §2.5 |
| Promoção por variante? | **NÃO** — `produtos_promocao` é 1:N por produto, sem variante | AUDITORIA_4 §13, AUDITORIA_3 §2.4 |

**O que o CONTRATO v1.1 diz:**
- Produto **pode** ter variantes (não obrigatório)
- Variante é um conceito reconhecido mas atributos específicos não definidos (PENDENTE)
- Produto simples é válido (sem variantes)

**Alternativas para apresentar ao usuário:**

A) **Apenas tamanho** — variante restrita a tamanho (P/M/G/GG/XG), como o mock atual. Simples, limitado.

B) **Tamanho + cor** — amplia o atributo. Comum em e-commerce de cosméticos.

C) **Tamanho + cor + volume/ml** — adequado para cosméticos líquidos (50ml, 100ml, 200ml).

D) **Tamanho + cor + volume + outros específicos** — listar quais.

E) **Atributos livres** (cadastro dinâmico — EAV ou JSONB) — flexibilidade máxima, complexidade maior.

F) **Sem variantes** — todos produtos simples. Simples, limitado.

**Impactos a mencionar:**
- Cada atributo adicionado afeta estrutura de `produto_variante`, `estoque`, `carrinho`, `checkout`
- Mais atributos = mais complexidade no cadastro de produtos
- Atributos livres (EAV/JSONB) são flexíveis mas dificultam queries e indexação
- Sem variantes = simpler mas não suporta produtos com múltiplas SKUs

**Pergunta ao usuário:**
Quais atributos uma variante pode ter? Produto simples continua válido (sem variantes)?

---

### D2 — Preço de Variante

**O que o sistema atual suporta (evidência):**

| Aspecto | Evidência | Fonte |
|---------|-----------|-------|
| Preço por variante no banco? | **NÃO** — `produtos.preco` é único | AUDITORIA_3 §2.1 |
| Preço por variante no frontend? | **SIM** — `verprodutos.js`: `precos: {P:450, M:500, G:550, GG:600, XG:650}` | AUDITORIA_3 §2.1, §2.2 |
| `resolvePrice()` no frontend? | **SIM** — mas opera apenas no mock | AUDITORIA_3 §2.5 |
| Promoção calculada no checkout? | **NÃO** — frontend ignora tabela `produtos_promocao` | AUDITORIA_4 §13, AUDITORIA_3 §2.4 |

**O que o CONTRATO v1.1 diz:**
- Variante **pode** ter preço próprio (D2 pendente)
- Resolução de preço menciona variante primeiro (PENDENTE)
- Promoções aplicam ao preço final (PENDENTE)

**Alternativas para apresentar ao usuário:**

A) **Variante sempre herda preço do produto base** — simples, consistente, mas limita flexibilidade de precificação por SKU.

B) **Variante pode sobrescrever preço do base** — permite preço diferente por variante. Se variante não tem preço, herda do base. (A opção do CONTRATO v1.0: "variante tem preço próprio (obrigatório)")

C) **Variante tem preço independente** — variante pode ter preço totalmente independente do base, mesmo se base muda. Mais complexo, mais flexível.

D) **Preço fixo no carrinho** (no momento da adição) — preço congelado no `CartItem` independente de alterações posteriores no produto.

**Impactos a mencionar:**
- Se variante tem preço próprio → `produto_variante.preco` obrigatório, resolvePrice() consulta variante primeiro
- Se variante herda → preço simples, mas não permite SKU com margem diferente
- Preço congelado no carrinho evita mudança entre adição e checkout, mas exige snapshot
- Promoções sobre variantes vs produto base alteram cálculo total

**Pergunta ao usuário:**
Variante pode ter preço diferente do produto base? Sempre herda? Pode sobrescrever? Pode ter preço independente?

---

### D3 — Promoções

**O que o sistema atual suporta (evidência):**

| Aspecto | Evidência | Fonte |
|---------|-----------|-------|
| Tabela promoção no banco? | **SIM** — `produtos_promocao` com `desconto`, `data_inicio`, `data_fim` | AUDITORIA_4 §13, AUDITORIA_3 §2.4 |
| Promoção por produto? | **SIM** — `produtos_promocao` é 1:N por `produto_id` | AUDITORIA_3 §2.4 |
| Promoção por variante? | **NÃO** — não existe `variante_promocao` | AUDITORIA_4 §13 |
| Tipo de desconto definido? | **NÃO** — `desconto decimal(5,2)` é ambíguo (% ou R$?) | AUDITORIA_4 §13, AUDITORIA_3 §2.4 |
| Promoção calculada no checkout? | **NÃO** — frontend ignora tabela completamente | AUDITORIA_4 §13 |
| Promoção no carrinho? | **NÃO** — carrinho não consulta promoções | AUDITORIA_4 §13 |
| Período de validade? | **SIM** — `data_inicio`, `data_fim` existem | AUDITORIA_3 §2.4 |
| Múltiplas promoções por produto? | **Possível** — 1:N, sem regra de prioridade | AUDITORIA_3 §2.4 |

**O que o CONTRATO v1.1 diz:**
- Promoção é conceito reconhecido (1:N por produto)
- Valor de desconto, período de validade, ativa/inativa
- Regras específicas NÃO fechadas (PENDENTE)

**Alternativas para apresentar ao usuário:**

Sobre tipo de desconto:
- A) Apenas percentual (0-100%)
- B) Apenas valor fixo (R$ X)
- C) Ambos (tipo + valor)

Sobre cumulatividade:
- D) Promoções são cumulativas (múltiplas aplicam)
- E) Apenas uma promoção por produto (prioridade manual)
- F) Apenas uma promoção por produto (prioridade automática: maior desconto)

Sobre escopo:
- G) Promoção aplica ao produto base (herda para variantes) — como o contrato atual
- H) Promoção pode ser por variante específica
- I) Ambos (produto + variante)

Sobre cupons:
- J) Cupons como mecanismo separado de promoção
- K) Sem cupons no lançamento

**Impactos a mencionar:**
- Tipo de desconto define coluna (`tipo_desconto` enum + `valor_desconto` decimal) vs single `desconto` decimal ambíguo
- Cumulatividade afeta cálculo final no checkout
- Promoção por variante exige `variante_promocao` ou `produto_promocao.variante_id`
- Cupons exigem tabela própria, validação, expiração, uso único, etc.

**Pergunta ao usuário:**
Tipo de desconto (%/R$/ambos)? Cumulatividade? Prioridade? Escopo (produto/variante/ambos)? Cupons?

---

### D4 — Estoque

**O que o sistema atual suporta (evidência):**

| Aspecto | Evidência | Fonte |
|---------|-----------|-------|
| Estoque por produto? | **SIM** — `estoque.quantidade` 1:1 com `produtos` | AUDITORIA_4 §12, AUDITORIA_3 §2.6 |
| Estoque por variante? | **NÃO** — `estoque.variante_id` não existe | AUDITORIA_4 §12, AUDITORIA_3 §2.6 |
| Reserva no carrinho? | **NÃO** — não há reserva ao adicionar ao carrinho | AUDITORIA_4 §12 |
| Baixa na compra? | **NÃO** — checkout é simulado, não persiste pedido | AUDITORIA_4 §12 |
| Estoque negativo? | **[HIPÓTESE] SIM** — sem controle de não negativo confirmado | AUDITORIA_4 §12 |
| Movimentação (entradas/saídas)? | **SIM** — tabelas `entradas_estoque` / `saidas_estoque` existem no SQL | AUDITORIA_4 §12 |
| Histórico de estoque? | **SIM** — views de histórico existem | AUDITORIA_4 §12 |
| Auditoria de estoque? | **NÃO** — sem evidência de log de auditoria | AUDITORIA_4 §12 |
| Estoque mínimo? | **NÃO** — sem evidência | AUDITORIA_4 §12 |
| Disponibilidade no catálogo? | **NÃO** — frontend não consulta estoque | AUDITORIA_4 §12 |

**O que o CONTRATO v1.1 diz:**
- Estoque é conceito comercial reconhecido
- Produto simples tem estoque no produto; produto com variantes pode ter por variante
- Modelo específico PENDENTE

**Alternativas para apresentar ao usuário:**

Sobre modelo de estoque:
- A) Estoque apenas por produto (simples) — como o sistema atual
- B) Estoque por variante (cada SKU tem quantidade) — necessário se variantes existirem
- C) Híbrido (produto simples usa estoque do produto; produto com variantes usa por variante) — conforme DECISOES v1.0

Sobre reserva:
- D) Reserva no carrinho (soft hold ao adicionar)
- E) Reserva no checkout (transação atômica ao confirmar pagamento)
- F) Sem reserva (risco de venda acima do disponível)

Sobre baixa:
- G) Baixa ao pagamento aprovado
- H) Baixa ao confirmar no WhatsApp/vendedor
- I) Baixa ao enviar/entregar
- J) Baixa ao criar pedido (imediato)

Sobre estoque negativo:
- K) Não permitido (bloquear venda se sem estoque)
- L) Permitido (risco de não entrega)

Sobre cancelamento/devolução:
- M) Estoque retorna ao cancelar/devolver
- N) Estoque não retorna (perda)
- O) Estoque retorna com validação de prazo

**Impactos a mencionar:**
- Estoque por variante exige `estoque.variante_id`, unique constraint, triggers de validação
- Reserva no carrinho requer lock ou soft hold com timeout
- Baixa em diferentes momentos tem implicações financeiras e de disponibilidade
- Estoque negativo gera risco de não entrega mas permite pré-venda
- Devolução/cancelamento com retorno de estoque exige regras de prazo e condição

**Pergunta ao usuário:**
Estoque por produto, por variante, ou híbrido? Reserva onde? Baixa quando? Estoque negativo permitido? Cancelamento/devolução retorna estoque?

---

### D9 — Endereço

**O que o sistema atual suporta (evidência):**

| Aspecto | Evidência | Fonte |
|---------|-----------|-------|
| Tabela `enderecos`? | **SIM** — com `tipo_endereco`, `entidade_id`, logradouro, número, complemento, bairro, cidade, estado, CEP | AUDITORIA_4 §15, AUDITORIA_3 §2.9 |
| Endereço no cadastro? | **SIM** — cadastro inclui endereço | AUDITORIA_4 §15 |
| Endereço no checkout? | **NÃO** — checkout não usa `enderecos` | AUDITORIA_4 §15 |
| `endereco_entrega_id` no pedido? | **NÃO** — campo não existe na tabela `pedidos` | AUDITORIA_4 §11, AUDITORIA_3 §2.10 |
| FK polimórfica funcional? | **PARCIALMENTE** — FK só aponta para `usuarios`, não para `fornecedores` | AUDITORIA_4 §15, AUDITORIA_3 §2.9 |
| ViaCEP auto-fill? | **SIM** — chamado em 3 arquivos (`verprodutos.js`, `finalizarcompra.js`, `carrinho.js`) | AUDITORIA_4 §19, AUDITORIA_3 §2.9 |
| Endereço obrigatório no checkout? | **NÃO** — checkout atual não solicita endereço estruturado | AUDITORIA_4 §15 |
| Pedido com endereço de entrega? | **NÃO** — pedido não tem `endereco_entrega_id` | AUDITORIA_4 §11 |
| Cliente com múltiplos endereços? | **Possível** — tabela permite 1:N por `entidade_id` | AUDITORIA_3 §2.9 |

**O que o CONTRATO v1.1 diz:**
- Endereço é conceito reconhecido (CEP, logradouro, número, complemento, bairro, cidade, UF)
- ViaCEP para auto-fill
- Cadastro híbrido (DEC8 confirmada) — visitante informa e-mail + endereço na finalização
- Endereço obrigatório por modalidade — PENDENTE (D9)

**Alternativas para apresentar ao usuário:**

Sobre obrigatoriedade:
- A) Endereço obrigatório em TODAS as modalidades (site, WhatsApp, visitante)
- B) Endereço obrigatório apenas no site (checkout); WhatsApp pede separadamente; visitante informa na finalização
- C) Endereço obrigatório apenas para entrega; retirada não exige
- D) Endereço nunca obrigatório (só CEP para frete)

Sobre modalidades:
- E) Endereço obrigatório para compra como visitante? (sim/não)
- F) Endereço obrigatório para checkout pelo WhatsApp? (sim/não)
- G) Endereço de cobrança separado de entrega? (sim/não)

Sobre momento de obrigatoriedade:
- H) Endereço obrigatório antes de calcular frete
- I) Endereço obrigatório antes de finalizar pagamento
- J) Endereço obrigatório apenas para confirmação do pedido

**Impactos a mencionar:**
- Endereço obrigatório em todas modalidades = mais dados no checkout, mais conversão perdida
- Endereço apenas para entrega = mais flexível
- Separar cobrança/entrega = mais complexo mas mais realista
- ViaCEP obrigatório vs opcional afeta UX
- Pedido sem `endereco_entrega_id` = impossível saber onde entregar

**Pergunta ao usuário:**
Endereço obrigatório em qual(is) modalidade(s)? Site? WhatsApp? Visitação? Cobrança vs entrega? Momento de obrigatoriedade?

---

### D10 — Status do Pedido

**O que o sistema atual suporta (evidência):**

| Aspecto | Evidência | Fonte |
|---------|-----------|-------|
| Tabela `pedidos.status`? | **SIM** — `pedidos.status` existe | AUDITORIA_4 §11, AUDITORIA_3 §2.10 |
| Valores atuais de status? | **4 valores:** `Em processamento`, `Enviado`, `Entregue`, `Cancelado` | AUDITORIA_4 §11, AUDITORIA_3 §2.10 |
| Status de pagamento? | **NÃO** — `pedidos.status_pagamento` não existe | AUDITORIA_4 §11 |
| Pedido real persistido? | **NÃO** — checkout simula apenas (alert + PDF) | AUDITORIA_4 §11 |
| `itens_pedido`? | **NÃO** — tabela não existe | AUDITORIA_4 §11 |
| `numero_pedido`? | **NÃO** — campo não existe | AUDITORIA_4 §11 |
| `origem` (site/whatsapp)? | **NÃO** — campo não existe | AUDITORIA_4 §11 |
| `metodo_pagamento`? | **NÃO** — campo não existe | AUDITORIA_4 §11 |
| `endereco_entrega_id`? | **NÃO** — campo não existe | AUDITORIA_4 §11 |
| `historico_compras`? | **SIM** — mas duplica pedido (log imutável não definido) | AUDITORIA_4 §11 |
| Pedido WhatsApp no sistema? | **NÃO** — apenas mensagem, sem persistência | AUDITORIA_4 §11 |
| Máquina de estados documentada? | **NÃO** — apenas 4 valores sem transições | AUDITORIA_4 §11 |
| Cancelamento? | **SIM** — `Cancelado` é um dos 4 status | AUDITORIA_4 §11 |
| Devolução/troca? | **NÃO** — sem evidência | AUDITORIA_4 §11 |

**O que o CONTRATO v1.1 diz:**
- Pedido possui ciclo de vida comercial com múltiplos estados
- Estados oficiais serão definidos no contrato funcional (PENDENTE D10)
- NÃO deve incluir máquina de estados detalhada neste contrato comercial
- Rascunho (WhatsApp) + Checkout (site) são dois fluxos distintos (DEC7 confirmada)

**Alternativas para apresentar ao usuário:**

Sobre estados mínimos do pedido:
- A) Manter os 4 estados atuais (Em processamento, Enviado, Entregue, Cancelado)
- B) Expandir para: Rascunho → Aguardando pagamento → Pagamento aprovado → Em separação → Enviado → Entregue → Cancelado → Devolvido
- C) Expandir com estados WhatsApp: Rascunho WhatsApp → Confirmado WhatsApp → Em separação → ...
- D) Outro conjunto (especificar)

Sobre diferenciação de fluxos:
- E) Pedido site e pedido WhatsApp compartilham a mesma máquina de estados? (sim/não)
- F) Pedido WhatsApp tem estados próprios (rascunho, confirmado_whatsapp)?

Sobre pagamento:
- G) Separar status de pagamento (pendente, aprovado, recusado, estornado) do status do pedido?
- H) Não separar (pagamento é parte do status do pedido)?

Sobre cancelamento:
- I) Cancelamento permitido a qualquer momento?
- J) Cancelamento permitido apenas antes de envio?
- K) Cancelamento requer aprovação?

Sobre devolução:
- L) Devolução/troca como estado do pedido?
- M) Devolução/troca como processo separado (não estado do pedido)?

Sobre confirmação WhatsApp:
- N) Rascunho WhatsApp → Confirmado pelo vendedor → Processamento → ... (separado do site)
- O) Rascunho WhatsApp entra na mesma máquina de estados do site?

**Impactos a mencionar:**
- Mais estados = mais complexidade no sistema, mais dashboards, mais automações
- Separar pagamento do pedido = mais precisão no fluxo financeiro
- Estados WhatsApp diferentes do site = dois fluxos paralelos que convergem
- Cancelamento com/a sem aprovação = controle operacional diferente
- Devolução como estado vs processo separado = rastreabilidade diferente

**Pergunta ao usuário:**
Quais são os estados oficiais do pedido? Transições permitidas? Cancelamento (quando/como)? Conclusão? Diferença entre rascunho WhatsApp e pedido efetivamente confirmado? Devolução como estado?

---

## 🔄 PROCESSO DE EXECUÇÃO

### Ordem das decisões

Apresentar na seguinte ordem, uma por vez, aguardando resposta:

1. **D1 — Atributos de Variante**
2. **D2 — Preço de Variante**
3. **D3 — Promoções**
4. **D4 — Estoque**
5. **D9 — Endereço**
6. **D10 — Status do Pedido**

### Para cada decisão

1. Apresentar evidências do sistema atual (tabelas com fontes)
2. Apresentar o que o CONTRATO v1.1 diz
3. Apresentar alternativas com impactos
4. **Aguardar resposta do usuário**
5. Registrar a decisão

### Após todas as 6 decisões fechadas

1. Gerar `DECISOES_NEGOCIO_v1.3.md` com as 6 decisões fechadas
2. Atualizar `DECISOES_NEGOCIO_v1.2.md` (marcando D1-D4, D9, D10 como fechadas)
3. Atualizar `CONTRATO_DOMINIO_COMERCIAL_v1.1.md` (marcando D1-D4, D9, D10 como fechadas)
4. **NÃO gerar CONTRATO_FUNCIONAL_SISTEMA_v1.0.md automaticamente**
5. Aguardar revisão humana do CONTRATO DOMÍNIO antes de prosseguir

### Registro de decisões (modelo)

Para cada decisão fechada, registrar:

```text
### DECISÃO [ID] — [Título] (AGORA FECHADA)

**Escolha:** [Opção escolhida]
**Justificativa:** [1 frase do usuário, se houver]
**Impacto técnico:** [1 linha — NÃO detalhar implementação]
**Data:** [data da decisão]
**Decisor:** Negócio
**Evidência anterior:** [O que o sistema fazia antes]
**Status anterior:** PENDENTE → FECHADO
```

---

## ⚠️ VALIDAÇÃO ANTES DE FINALIZAR

Após fechar todas as 6 decisões, verificar:

1. Nenhuma decisão foi inventada por Kilo
2. Cada decisão tem escolha explícita do usuário
3. Nenhuma decisão técnica foi apresentada como decisão de negócio
4. As evidências do sistema atual estão corretas
5. Nenhum código foi alterado
6. Nenhuma migration foi executada
7. Nenhuma arquitetura foi definida
8. Nenhum push foi realizado

---

## SAÍDA OBRIGATÓRIA

Ao terminar (após respostas do usuário em todas as 6 decisões), apresentar:

### 1. Decisões fechadas

Tabela:

| ID | Decisão | Escolha | Antes | Depois | Status |
|----|---------|---------|-------|--------|--------|

### 2. Decisões que continuam pendentes

Listar (deve ser zero após o fechamento, mas confirmar).

### 3. Próximo passo

Após revisão humana do CONTRATO DOMÍNIO, o próximo artefato será:
`CONTRATO_FUNCIONAL_SISTEMA_v1.0.md`

Mas NÃO gerá-lo agora. Aguardar aprovação humana.

### 4. Verificação de segurança

Confirmar explicitamente:
- código não alterado
- banco não alterado
- migrations não executadas
- deploy não realizado
- push não realizado

---

**Início:** Apresentar D1 — Atributos de Variante com as evidências do sistema atual.
