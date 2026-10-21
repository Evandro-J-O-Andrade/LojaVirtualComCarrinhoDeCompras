# PROMPT PARA KILO — WORKSHOP DE DECISÕES DE NEGÓCIO v1.0
**Contexto:** Angel Cosméticos — Legacy E-commerce (HTML/CSS/JS + PHP/MySQL + Node.js Chat)
**Objetivo:** Fechar **apenas** as decisões de negócio que ainda estão abertas, usando como base as Auditorias 1, 2 e 3 já realizadas.
**Restrição:** **Não inventar regra de negócio.** Perguntar apenas o que depende de decisão do dono/negócio. Não escrever código, não criar migrations, não escolher tecnologia.

---

## 📋 REGRAS DE ENGAJAMENTO

1. **Uma decisão por vez** — apresente a pergunta, o contexto técnico mínimo, as opções viáveis e o impacto no modelo. Espere resposta antes de ir para a próxima.
2. **Formato de resposta esperado:** rótulo curto da opção escolhida (ex: "A", "B", "C") + justificativa de 1 frase se quiser.
3. **Não sugerir "melhor prática genérica"** — o negócio decide. Se houver trade-off técnico, explique neutro.
4. **Registrar cada decisão** em `DECISOES_NEGOCIO_v1.0.md` conforme formos fechando.
5. **Parar** quando todas as 10 decisões estiverem fechadas. Não continuar para arquitetura/implementação.

---

## 🎯 DECISÕES A FECHAR (em ordem)

### DECISÃO 1 — Atributos de Variante
**Contexto técnico:** Hoje só existe `tamanho` (P/M/G/GG/XG) no mock `verprodutos.js`. Banco não tem tabela de variante.
**Pergunta:** Quais atributos uma variante pode ter?
- A) Apenas **tamanho**
- B) Tamanho + **cor**
- C) Tamanho + cor + **volume/ml** (ex: 50ml, 100ml, 200ml)
- D) Tamanho + cor + volume + **outro** (qual?)
- E) **Atributos livres** (cadastro dinâmico — ex: voltagem, fragrância, acabamento)

**Impacto:** Define colunas/estrutura da futura `produto_variante` ou JSON de atributos.

---

### DECISÃO 2 — Variante Altera Preço?
**Contexto técnico:** No mock, cada tamanho tem preço próprio (`precos: {P:450, M:500...}`). No banco, `produtos.preco` é único.
**Pergunta:** Uma variante pode ter preço diferente do produto base?
- A) **Sim** — cada combinação de atributos tem preço próprio (ex: tamanho G custa mais que P)
- B) **Não** — preço é sempre do produto base; variante só diferencia SKU/estoque
- C) **Apenas alguns atributos** alteram preço (ex: tamanho altera, cor não)

**Impacto:** Se A ou C → `produto_variante.preco` obrigatório. Se B → preço só em `produtos`.

---

### DECISÃO 3 — Promoções
**Contexto técnico:** Existe `produtos_promocao` (desconto % por produto, datas início/fim). Não há promoção por variante.
**Perguntas:**
3a) Promoção aplica-se ao **produto base** (todas as variantes herdam)?
- A) Sim (herda)
- B) Não (promoção é por variante)

3b) Promoção pode ser **por variante específica** (ex: só tamanho G com 20% off)?
- A) Sim
- B) Não

3c) Promoção é **percentual** (0-100%) ou **valor fixo** (R$ X)?
- A) Percentual (atual `decimal(5,2)`)
- B) Valor fixo
- C) Ambos (tipo + valor)

**Impacto:** Define se `produtos_promocao` ganha `variante_id` ou se cria `variante_promocao`.

---

### DECISÃO 4 — Estoque
**Contexto técnico:** Hoje `estoque.quantidade` é 1:1 com `produtos`. Mock não tem estoque por tamanho.
**Pergunta:** Onde o estoque é controlado?
- A) **Apenas no produto base** — soma de todas as variantes (atual)
- B) **Por variante** — cada tamanho/cor tem estoque próprio
- C) **Misto** — produto simples usa estoque do produto; produto com variante usa estoque por variante

**Impacto:** Se B ou C → `estoque` ganha `variante_id` (nullable) ou cria `variante_estoque`.

---

### DECISÃO 5 — Frete
**Contexto técnico:** 3 implementações com regras diferentes:
- `carrinho.js` / `listaDeProduto.js`: grátis ≥ R$360 | SP/RJ=30, Sul=50, Outros=70
- `finalizarcompra.js`: grátis ≥ R$300 | SP/RJ=20, Sul=30, Outros=50
**Pergunta:** Qual a regra oficial?
- A) Grátis ≥ **R$300** | SP/RJ=20, Sul=30, Outros=50
- B) Grátis ≥ **R$360** | SP/RJ=30, Sul=50, Outros=70
- C) **Tabela por CEP/região** configurável no admin (não hardcoded)
- D) **Integração transportadora** (Correios, Jadlog, etc.) — cálculo real

**Impacto:** Define se frete é regra simples hardcoded ou serviço externo/configurável.

---

### DECISÃO 6 — Formas de Pagamento
**Contexto técnico:** Checkout atual só simula (alert + PDF). WhatsApp envia mensagem para vendedor.
**Pergunta:** Quais formas de pagamento o site deve suportar no lançamento?
- A) **Apenas WhatsApp** (site gera pedido, cliente finaliza no WhatsApp)
- B) **PIX** (chave estática ou QR Code dinâmico) + WhatsApp
- C) **Cartão de crédito/débito** (gateway: Mercado Pago, Stripe, Asaas, etc.) + PIX + WhatsApp
- D) **Boleto** + cartão + PIX + WhatsApp
- E) **Todas acima** + **pagamento na entrega** (regiões específicas)

**Impacto:** Define integrações de pagamento, webhooks, status de pedido (pendente_pagamento, pago, etc.).

---

### DECISÃO 7 — WhatsApp Gera Pedido no Sistema?
**Contexto técnico:** Hoje botão WhatsApp só monta mensagem e abre `wa.me/...`. Não cria `pedidos`, não baixa estoque, não registra `historico_compras`.
**Pergunta:** Quando o cliente clica "Finalizar pelo WhatsApp", o que acontece?
- A) **Só abre WhatsApp** — vendedor anota manualmente (zero automação)
- B) **Cria pedido rascunho** (status `aguardando_whatsapp`) + abre WhatsApp com nº do pedido
- C) **Cria pedido confirmado** (status `confirmado`) + baixa estoque + registra histórico + abre WhatsApp
- D) **Cria pedido** + **envia webhook/notificação** para CRM/WhatsApp Business API

**Impacto:** Define fluxo de `POST /api/orders` com `origem: 'whatsapp'`, transação de estoque, numeração.

---

### DECISÃO 8 — Compra pelo Site Exige Cadastro?
**Contexto técnico:** Existe `usuarios` + `enderecos` (FK polimórfica quebrada). Checkout atual não valida login.
**Pergunta:** Para finalizar compra pelo site (não WhatsApp), o cliente precisa estar logado?
- A) **Sim** — login obrigatório (endereço vem do cadastro)
- B) **Não** — checkout como **convidado** (informa e-mail + endereço na hora); opcional criar conta após
- C) **Híbrido** — logado usa endereço salvo; não logado preenche e-mail + endereço; ambos criam `pedidos` vinculados a `usuarios` (cria usuário se não existir)

**Impacto:** Define fluxo de auth no checkout, criação de `usuarios` lazy, vinculação `enderecos`.

---

### DECISÃO 9 — Endereço Obrigatório por Modalidade
**Contexto técnico:** `enderecos` existe mas FK só aponta para `usuarios`. WhatsApp não pede endereço estruturado.
**Pergunta:** Endereço estruturado (logradouro, nº, bairro, cidade, UF, CEP) é obrigatório em:
- **Compra pelo site:** A) Sim  B) Não (só CEP p/ frete)
- **WhatsApp:** A) Sim (pedir no site antes de abrir WhatsApp)  B) Não (vendedor pergunta no chat)

**Impacto:** Define validação no checkout, campos obrigatórios no `Order`, se `endereco_entrega_id` é NOT NULL.

---

### DECISÃO 10 — Status do Pedido
**Contexto técnico:** `pedidos.status` tem: `Em processamento`, `Enviado`, `Entregue`, `Cancelado`. Não tem status de pagamento.
**Pergunta:** Quais status o pedido precisa ter? (marque todos que se aplicam)
- [ ] `rascunho` / `carrinho_abandonado`
- [ ] `aguardando_pagamento`
- [ ] `pagamento_aprovado` / `pago`
- [ ] `em_separacao` / `em_processamento` (atual)
- [ ] `enviado` (atual)
- [ ] `entregue` (atual)
- [ ] `cancelado` (atual)
- [ ] `devolvido` / `trocado`
- [ ] `aguardando_whatsapp` (se Decisão 7 = B/C/D)

**Impacto:** Define enum `pedidos.status`, transições permitidas, dashboards, automações.

---

## 📝 FORMATO DE REGISTRO (para `DECISOES_NEGOCIO_v1.0.md`)

```markdown
## DECISÃO N — [Título]
**Escolha:** [Letra(s)]
**Justificativa:** [1 frase]
**Impacto técnico:** [1 linha]
**Data:** 2026-09-13
**Decisor:** [Nome]
```

---

## ✅ CHECKLIST DE CONCLUSÃO

Todas as 10 decisões fechadas → **Contrato do Domínio Comercial v1.0** pode ser gerado.

**Não prosseguir para:**
- ❌ Escolha de backend (Supabase/Node/PHP)
- ❌ Arquitetura (REST/GraphQL/RPC)
- ❌ React/Vite/TypeScript setup
- ❌ Migrations SQL
- ❌ Qualquer código

---

## 🔧 COMO EXECUTAR

1. Leia `AUDITORIA_3_DOMAIN_CONTRACT.md` para contexto técnico completo.
2. Apresente **DECISÃO 1** com as opções acima.
3. Aguarde resposta do usuário.
4. Registre no arquivo `DECISOES_NEGOCIO_v1.0.md`.
5. Repita para DECISÃO 2...10.
6. Ao final, gere `CONTRATO_DOMINIO_COMERCIAL_v1.0.md` consolidando tudo.

**Início:** Apresente a DECISÃO 1 agora.