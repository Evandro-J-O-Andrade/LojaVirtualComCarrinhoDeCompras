# CONTRATO DO DOMÍNIO COMERCIAL v1.1 — Angel Cosméticos

**Base:** CONTRATO_DOMINIO_COMERCIAL_v1.0 + DECISOES_NEGOCIO_v1.2 + AUDITORIA_4_RELATORIO + AUDITORIA_3_DOMAIN_CONTRACT + Respostas oficiais do dono do negócio (Q1-Q14)
**Data:** 2026-09-15 | **Versão:** 1.1 | **Status:** Consolidação de decisões fechadas
**Natureza:** Documento de domínio comercial. NÃO contém implementação técnica.

> ⚠️ **Este documento NÃO é o `CONTRATO_DOMINIO_COMERCIAL_v1.0` reescrito.** É uma consolidação que incorpora decisões oficiais fechadas após a v1.0, preserva o domínio comercial original onde não houve alteração, e identifica explicitamente tudo o que permanece pendente.

---

## 1. Objetivo

Definir o **domínio comercial** do e-commerce Angel Cosméticos como fonte oficial de referência para:

- Decisões de negócio fechadas e suas regras comerciais
- Entidades conceituais do domínio e suas relações comerciais
- Comportamentos funcionais esperados pelo negócio
- Requisitos comerciais que o sistema deve atender

Este documento **não define**:

- Estrutura de banco de dados
- APIs ou contratos técnicos
- Arquitetura de sistema
- Implementação de código
- Migrations SQL
- Fluxos técnicos de integração

Esses elementos pertencem a documentos posteriores na cadeia oficial.

---

## 2. Escopo do domínio

O domínio comercial abrange:

- Catálogo de produtos (simples e com variantes)
- Promoções e preços
- Estoque
- Carrinho de compras
- Clientes e cadastro
- Endereços de entrega
- Frete e entrega
- Pagamentos
- Pedidos e checkout (site e WhatsApp)
- Atendimento humano
- Dados legados e migração

**Fora do escopo deste contrato:**

- Arquitetura técnica (DEC1)
- Gateway de pagamento específico (DEC2/D6b)
- Implementação de carrinho (D13)
- Armazenamento de imagens (D14)
- E-mail transacional (D16)
- PWA (D17)
- SEO (D18)
- Status detalhado do pedido (D10)
- Regras de endereço obrigatório (D9)
- Atributos específicos de variante (D1)
- Regras de preço de variante (D2)
- Regras de promoção (D3)
- Modelo de estoque (D4)

---

## 3. Princípios comerciais

1. **Um único carrinho oficial** — existirá uma única implementação de carrinho para o sistema (implementação definida na arquitetura, não neste contrato)
2. **Cadastro híbrido** — o cliente pode comprar sem cadastro obrigatório (DECISÃO 8 confirmada)
3. **Pedido no WhatsApp é rascunho** — o clique em "Finalizar no WhatsApp" cria um pedido/rascunho e abre o WhatsApp, NÃO confirma automaticamente o pedido (DECISÃO 7 confirmada)
4. **Frete será configurável** — regras de frete serão gerenciadas no admin, não hardcoded no frontend (DECISÃO 5 confirmada)
5. **Pagamentos no lançamento:** PIX + cartão (DECISÃO 2 confirmada)
6. **MVP já com dados comerciais** — o lançamento incluirá os dados comerciais necessários já migrados (DECISÃO 4 confirmada)
7. **Supabase como backend-alvo** — decisão estratégica fechada (DEC1), detalhes técnicos não pertencem a este contrato
8. **Atendimento humano explícito** — deve existir ação explícita "Falar com humano" (DECISÃO 19 confirmada)
9. **Dados legados preservados seletivamente** — migração seletiva dos dados comerciais relevantes (DEC3)
10. **Nenhuma decisão técnica antes das decisões de negócio fechadas**

---

## 4. Produto

### 4.1 Conceito comercial

Produto é a entidade central do catálogo. Possui:

- Nome
- Descrição
- Preço base
- Fornecedor
- Categorias (N:N)
- Ativo/inativo
- Imagens (galeria — conceito apenas comercial, implementação definida posteriormente)

### 4.2 Produto simples vs produto com variantes

| Tipo | Descrição | Regra comercial |
|------|-----------|-----------------|
| **Simples** | Sem variantes | Preço e estoque no nível do produto |
| **Com variantes** | Possui variações (atributos) | Cada variante pode ter preço próprio e estoque próprio |

**Regra:** Produto **pode** ter variantes — não é obrigatório ter variantes.

> **PENDENTE (D1):** Quais atributos uma variante pode ter? O domínio reconhece o conceito de variantes, mas os atributos específicos (tamanho, cor, volume, etc.) serão definidos no contrato funcional. **Não assumir que todo produto possui tamanho.** Não assumir automaticamente qualquer atributo específico.

### 4.3 Fornecedor

Produto possui fornecedor. O cadastro de fornecedores existe no legado e precisa ser preservado na migração seletiva.

### 4.4 Categoria

Categoria se relaciona com produtos de forma N:N (produto pode estar em várias categorias; categoria pode conter vários produtos).

---

## 5. Variantes

### 5.1 Conceito comercial

Variante é uma combinação de atributos de um produto que pode ter:

- Preço próprio (potencialmente diferente do preço base)
- Estoque próprio (potencialmente diferente do estoque do produto base)
- SKU virtual (identificador comercial da combinação)

### 5.2 Relação com produto

```text
PRODUTO
   │
   ├── sem variantes → preço e estoque no produto
   │
   └── com variantes → cada variante é uma combinação comercial
             │
             ├── atributo(s) — definir no contrato funcional (D1)
             ├── preço — pode ou não diferir do base (D2 pendente)
             └── estoque — pode ou não ser por variante (D4 pendente)
```

> **PENDENTE (D2):** Variante sempre herda preço do base? Pode sobrescrever? Pode ter preço independente? Não decidido. Registrar como requisito pendente.

> **PENDENTE (D1):** Quais atributos são válidos para variantes? Não decidido.

---

## 6. Preço

### 6.1 Conceito comercial

O preço de um item no carrinho é determinado por resolução de preço (comportamento funcional):

```text
Resolução de preço:
  1. Se variante tem preço próprio → usar preço da variante (D2 pendente)
  2. Senão → usar preço base do produto
  3. Aplicar promoção do produto base se ativa (D3 pendente)
```

> **PENDENTE (D2):** A regra de resolução de preço (variante sobrescreve base?) não foi fechada. Não assumir nenhuma regra específica.

### 6.2 Promoções sobre preço

Promoções aplicam-se ao preço final (base ou variante) conforme regras que serão definidas no contrato funcional (D3 pendente).

---

## 7. Promoções

### 7.1 Conceito comercial

Promoção é uma oferta comercial aplicável a produtos. O domínio reconhece:

- Promoção está associada a um produto (1:N)
- Promoção tem valor de desconto
- Promoção tem período de validade (data início/fim)
- Promoção pode ser ativa ou inativa

> **PENDENTE (D3):** As seguintes regras NÃO foram fechadas:
> - Cumulatividade (promoção + promoção?)
> - Prioridade (qual promoção aplica se existem múltiplas?)
> - Tipo de desconto (% vs R$ vs ambos)
> - Promoção por produto vs por variante
> - Cupons
> - Regras de cálculo

Registrar o estado atual e a necessidade de fechamento posterior no contrato funcional.

---

## 8. Estoque

### 8.1 Conceito comercial

Estoque é um conceito comercial que controla a disponibilidade de produtos para venda. O domínio reconhece:

- Produto possui estoque (quantidade disponível)
- Produto com variantes pode ter estoque por variante (cada combinação é um SKU distinto)
- Estoque pode entrar e sair (movimentação)
- Estoque precisa ser controlado para evitar venda sem estoque

> **PENDENTE (D4):** O modelo exato de estoque não foi fechado:
> - Reserva no carrinho ou no checkout?
> - Baixa definitiva quando? (pagamento aprovado? confirmação do vendedor? entrega?)
> - Estoque negativo é permitido?
> - Estoque por variante ou por produto ou misto?
> - Reposição/reatribuição
>
> Não inventar regras. Registrar como pendente para o contrato funcional.

### 8.2 Movimentação

O domínio reconhece que estoque tem entradas e saídas, com rastreabilidade. Detalhes de movimentação serão definidos no contrato funcional.

---

## 9. Carrinho

### 9.1 Conceito comercial

Existe **um conceito comercial único de carrinho**. O carrinho é a unidade comercial de seleção de produtos para compra.

O carrinho contém:

- Itens (produto(s) + quantidade + opção de variante)
- Subtotal
- Frete estimado
- Total

### 9.2 Relação com checkout

O carrinho alimenta dois fluxos comerciais distintos:

```text
        CARRINHO (conceito único)
              │
      ┌───────┴───────┐
      ↓               ↓
   WhatsApp        Site
      ↓               ↓
  Pedido          Pedido
  Rascunho        + Checkout
  + WhatsApp      (cadastro + pagamento)
```

> **PENDENTE (D13):** A implementação técnica do carrinho (reaproveitar código, reescrever, criar novo módulo, usar CartContext, etc.) é decisão técnica para a arquitetura. Não há decisão de negócio sobre engenharia.

---

## 10. Cliente e cadastro

### 10.1 Conceito comercial

Cliente é o indivíduo que interage com o e-commerce. Pode estar em diferentes estados:

- Visitante (navega, consulta, usa chatbot, WhatsApp)
- Comprador (inicia carrinho, checkout, pedido)
- Cadastrado (login, conta, endereços salvos)

### 10.2 Cadastro — Modelo híbrido (DECISÃO 8 confirmada)

```text
Cliente logado:
    → usa dados e endereço salvos no sistema

Cliente visitante:
    → informa e-mail + endereço na finalização
    → cria pedido vinculado (cria usuário lazy se não existir)

Ambos:
    → criam pedidos vinculados a usuários
    → criação de usuário lazy quando necessário
```

**O cadastro NÃO é obrigatório para comprar.** O cliente pode finalizar compra sem ter conta prévia.

### 10.3 Dados comerciais do cliente

O domínio reconhece que o cliente possui:

- Identificação (nome, e-mail, telefone, CPF — CPF opcional)
- Endereços de entrega
- Histórico de pedidos
- Dados complementares

> **PENDENTE (D9):** A obrigatoriedade de endereço por modalidade (site vs WhatsApp) e as regras de endereço não foram explicitamente validadas. Sugerido validar no contrato funcional.

---

## 11. Endereço

### 11.1 Conceito comercial

Endereço é um endereço físico estruturado utilizado para entrega de pedidos. O domínio reconhece:

- Endereço possui logradouro, número, complemento, bairro, cidade, UF, CEP
- CEP é campo estruturado e obrigatório para cálculo de frete
- ViaCEP é utilizado para preenchimento automático (logradouro, bairro, cidade, UF)
- Número é informação manual obrigatória (não preenchido por ViaCEP)
- Cliente pode ter múltiplos endereços

### 11.2 ViaCEP

O sistema utiliza ViaCEP para preenchimento de endereço a partir do CEP. O CEP é obrigatório em ambos os fluxos (site e WhatsApp).

> **PENDENTE (D9):** Endereço é obrigatório em qual(is) modalidade(s)? A confirmação de D8 (híbrido) e D7 (WhatsApp com CEP) implicam endereço relevante, mas D9 não foi explicitamente validado. Fechar no contrato funcional.

---

## 12. Frete e entrega

### 12.1 Modelo — Configurável + Transportadora Fase 2 (DECISÃO 5 confirmada)

#### Fase 1 — Tabela admin configurável

Regras de frete serão gerenciáveis no admin, não hardcoded no frontend. O domínio reconhece:

- Frete por CEP/região/UF
- Diferentes valores por região
- Frete grátis a partir de valor mínimo (subtotal mínimo)
- Tipos de cálculo: valor fixo, por peso, percentual sobre subtotal
- Regras ativas/inativas

> **Ressalva comercial:** Valores monetários específicos são parametrizados/configuráveis no admin. NÃO são regras fixas codificadas no frontend. As regras atuais do legacy (R$300/R$360, SP/RJ/Sul/Outros) são temporárias e serão substituídas pela tabela configurável.

#### Fase 2 — Integração transportadora

Cotação real de frete via integração com transportadoras (Correios, Jadlog, ou outras). A decisão sobre qual(is) transportadora(s) NÃO foi fechada.

### 12.2 Entrega

O domínio reconhece que a entrega é uma etapa comercial pós-pagamento. Detalhes de entrega (prazo, rastreamento, transportadora específica) serão definidos no contrato funcional.

---

## 13. Pagamentos

### 13.1 Métodos no lançamento (DECISÃO 2 confirmada)

No lançamento, o sistema oferecerá:

- **PIX**
- **Cartão** (crédito/débito)

> **D6b:** Gateway/provedor específico (Mercado Pago, Stripe, Asaas, outro) é decisão técnica para a arquitetura. **Não pertence a este contrato nem ao Contrato Funcional.** Será definido na `ARQUITETURA_TÉCNICA`.

### 13.2 Métodos futuros (não confirmados para lançamento)

Os seguintes métodos foram mencionados nas fontes, mas NÃO foram confirmados para o lançamento:

- Boleto
- Pagamento na entrega
- Outros

Estes serão considerados em decisões futuras de negócio, se aplicáveis.

### 13.3 Conceito comercial de pagamento

O domínio reconhece que:

- Pedido possui método de pagamento
- Pedido possui status de pagamento (pendente, aprovado, recusado, etc.)
- Gateway externo será integrado via webhooks
- Webhooks são essenciais para confirmação de pagamento

A natureza específica dos fluxos de pagamento (QR Code dinâmico, checkout transparente, boleto, etc.) será definida no contrato funcional e na arquitetura.

---

## 14. Checkout pelo site

### 14.1 Fluxo comercial (baseado em decisões confirmadas)

```text
Carrinho
   ↓
CEP (ViaCEP auto-fill)
   ↓
Frete (tabela configurável)
   ↓
Resumo (subtotal + frete + total)
   ↓
Dados do cliente:
   → Logado: usa dados/endereço salvos
   → Visitante: informa e-mail + endereço (cadastro lazy)
   ↓
Pagamento: PIX / Cartão
   ↓
Pedido criado
   ↓
Confirmação
```

### 14.2 Regras comerciais confirmadas

- Cadastro híbrido (DEC8 confirmada)
- CEP obrigatório antes de finalizar
- Frete calculado via tabela configurável (DEC5 confirmada)
- Pagamento: PIX + cartão (DEC2 confirmada)
- Pedido persistido no sistema (não simulado)

> **PENDENTE (D10):** Os estados/exatos status do pedido durante o checkout serão definidos no contrato funcional. Não incluir máquina de estados neste contrato comercial.

---

## 15. Checkout pelo WhatsApp

### 15.1 Fluxo comercial (DECISÃO 7 confirmada)

```text
Carrinho
   ↓
CEP (ViaCEP auto-fill)
   ↓
Frete (tabela configurável)
   ↓
Resumo (itens + total + dados)
   ↓
Botão "Finalizar pelo WhatsApp"
   ↓
POST /api/orders com origem: 'whatsapp'
   ↓
Cria pedido RASCUNHO + itens
   ↓
Retorna número do pedido
   ↓
Abre wa.me com mensagem contendo nº do pedido + itens + dados
   ↓
Vendedor atende no WhatsApp
   ↓
Vendedor valida/recusa no sistema (CRM/WhatsApp Business API)
   ↓
Status muda: rascunho → confirmado
   ↓
Baixa de estoque definitiva + histórico
   ↓
Webhook assíncrono para CRM (futuro)
```

### 15.2 Regras comerciais confirmadas

- Pedido é criado como **rascunho** (NÃO confirmado automaticamente pelo clique)
- Baixa de estoque definitiva NÃO ocorre no clique — segue o estado definido no contrato funcional
- Carrinho existente será utilizado como base da operação
- WhatsApp é uma rota de checkout legítima (não apenas canal de comunicação)

> **PENDENTE (D10):** Os estados/exatos status do pedido no fluxo WhatsApp serão definidos no contrato funcional.

---

## 16. Pedidos

### 16.1 Conceito comercial

Pedido é a unidade comercial de uma compra. Possui:

- Identificador (número comercial)
- Origem: site ou WhatsApp
- Cliente/Cliente (sempre vinculado, mesmo visitante lazy)
- Itens (produtos + quantidades + preços)
- Endereço de entrega
- Frete
- Pagamento
- Status comercial (ciclo de vida)

### 16.2 Ciclo de vida

O pedido possui ciclo de vida comercial com múltiplos estados. Os estados oficiais e suas transições **serão definidos no contrato funcional** (D10 pendente).

O domínio reconhece a necessidade de:

- Rascunho (pedido criado, não confirmado)
- Aguardando pagamento/confirmacao
- Processamento/separacao
- Enviado
- Entregue
- Cancelado/recusado/devolvido

> **PENDENTE (D10):** A máquina de estados completa, os nomes dos status, e as transições permitidas NÃO foram fechadas. Não inventar status ou transições. Registrar como pendente.

### 16.3 Histórico comercial

O domínio reconhece que histórico de compras/pedidos existe para referência comercial. A natureza exata (log imutável, tabela separada, denormalizado) será definida no contrato funcional.

---

## 17. Atendimento humano

### 17.1 Regra confirmada (DECISÃO 19)

Deve existir ação explícita **"Falar com humano"** para transferência ao atendimento humano.

### 17.2 Fluxo comercial

```text
Cliente interage com chatbot
   ↓
Cliente deseja atendimento humano
   ↓
Ação explícita: [Falar com humano]
   ↓
Handoff para atendimento humano
   ↓
Atendimento via WhatsApp Business (5511963205776)
```

### 17.3 Complementos futuros (não confirmados como decisão)

Os seguintes mecanismos de handoff foram mencionados nas fontes, mas NÃO foram confirmados como decisões:

- Detecção por palavras-chave (keyword trigger)
- Timeout sem resposta
- Baixa confiança da intenção do bot
- Problema não resolvido

Estes podem ser adicionados como complementos no futuro, mas **não devem depender exclusivamente de nenhum deles**. A ação explícita do cliente é o mecanismo primário.

---

## 18. Dados legados e migração

### 18.1 Abordagem — Migração seletiva (DEC3 confirmada)

A migração de dados legados do PHP/MySQL para o novo backend será **seletiva**, preservando apenas os dados comerciais relevantes com utilidade operacional ou histórica.

### 18.2 Categorias de dados (pendência de matriz detalhada)

| Categoria | Intenção comercial | Status |
|-----------|--------------------|--------|
| Produtos | Preservar | Provavelmente migrar |
| Categorias | Preservar | Provavelmente migrar |
| Clientes/Usuários | Preservar | Validar |
| Endereços | Preservar | Validar |
| Pedidos antigos | Preservar | Validar |
| Estoque | Preservar | Validar |
| Fornecedores | Preservar | Validar |
| Histórico de compras | Preservar se dados válidos | Validar |
| Promoções | Preservar | Validar |
| Dados técnicos quebrados | Não preservar | Não migrar |
| Dados duplicados | Não preservar | Não migrar |
| Dados sem utilidade | Não preservar | Arquivar/reter |

> **PENDENTE:** A matriz detalhada de migração (o que exatamente migrar, o que arquivar, o que descartar) será definida na etapa de auditoria de dados antes da migração.

### 18.3 Timing — MVP com dados comerciais (DEC4 confirmada)

O MVP do novo sistema será lançado **já com os dados comerciais necessários migrados**. Não será adotado um MVP comercial vazio seguido de migração posterior indiscriminada.

### 18.4 Processo comercial de migração

```text
Sistema atual (PHP/MySQL)
    ↓
Auditoria dos dados existentes
    ↓
Classificação: Migrar / Não migrar / Arquivar
    ↓
Novo modelo de dados (derivado do Contrato Funcional)
    ↓
Migração controlada
    ↓
React + Backend-alvo (Supabase)
    ↓
Validação local
    ↓
Produção
```

> **Nota importante:** O código PHP/MySQL legado não será migrado. Apenas os dados selecionados. A substituição do código PHP será consequência da arquitetura escolhida, não uma decisão isolada de "migrar PHP".

---

## 19. Decisões estratégicas fechadas

### DEC1 — Backend/Arquitetura

**Backend-alvo: Supabase** (PostgreSQL + Auth + Storage + Edge Functions + Realtime)

Motivos objetivos:

- PostgreSQL substitui MySQL legado
- Auth para autenticação de clientes
- Storage para imagens
- RLS para segurança
- Edge Functions para webhooks, checkout, estoque, WhatsApp, integrações
- Realtime para atendimento
- Integração natural com React/Vite
- Elimina dependência de PHP que não executa no Netlify
- Mantém Netlify como frontend

> DECISÃO FECHADA pelo dono do negócio em 2026-09-15.
> Detalhes técnicos (tabelas, RLS, Edge Functions, Storage, estrutura PostgreSQL) pertencem à arquitetura técnica e NÃO são detalhados neste contrato comercial.

### DEC2 — Pagamentos no lançamento

**Métodos: PIX + cartão.** Gateway como decisão técnica posterior.

> DECISÃO FECHADA pelo dono do negócio em 2026-09-15.
> Não amarrar sistema a gateway específico (Mercado Pago, Stripe, Asaas, etc.) antes da arquitetura.

### DEC3 — Dados legados

**Migração seletiva dos dados comerciais relevantes.**

> DECISÃO FECHADA pelo dono do negócio em 2026-09-15.
> Matriz detalhada de migração será definida na etapa de auditoria de dados.

### DEC4 — Timing da migração

**MVP lançado já com os dados comerciais necessários migrados.**

**Derivação:** DEC3 (migração seletiva) + decisão estratégica de timing do dono do negócio. O timing (lançar MVP já com dados vs MVP vazio) é uma decisão estratégica que decorre da decisão de migração seletiva, mas não é a mesma decisão.

> DECISÃO FECHADA pelo dono do negócio em 2026-09-15.
> Não MVP vazio. Dados comerciais (catálogo, clientes, estoque, histórico) são parte do negócio e estarão presentes desde o primeiro dia.

---

## 20. Decisões de domínio fechadas (Workshop 2026-09-15)

As seguintes decisões foram fechadas no Workshop de Fechamento e devem ser incorporadas ao `CONTRATO_FUNCIONAL_SISTEMA_v1.0`:

| ID | Decisão | Escolha | Resumo |
|----|---------|---------|--------|
| D1 | Atributos de Variante | C | Tamanho + cor + volume/ml (opcionais por produto). Produto simples válido. Sem EAV/JSONB. |
| D2 | Preço de Variante | B + D | Variante pode sobrescrever base + preço congelado no carrinho. Snapshot obrigatório. |
| D3 | Promoções | C + D + H/I + J + L | % + R$. Produto → variantes. Não cumulativa, menor preço final. Período obrigatório. Sem cupons. |
| D4 | Estoque | C + E + G+H + K + M | Híbrido. Reserva no checkout. Baixa por canal. Sem estoque negativo. Devolução com validação. |
| D9 | Endereço | B + H + F + J + L | Obrigatório no checkout e para visitante. WhatsApp com endereço pré-preenchido. Apenas entrega MVP. |
| D10 | Status do Pedido | A + D + F + I + L + N | Dois fluxos convergem. Pagamento separado. Confirmação por canal. Cancelamento até envio. |

### Fluxo consolidado (D1–D4, D9–D10)

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

### Regra crítica

A disponibilidade de estoque deve ser garantida de forma transacional/atômica no checkout. Não confiar apenas em validação frontend.

---

### Para a Arquitetura Técnica

| Decisão | Classificação | Destino |
|---------|---------------|---------|
| D6b | Técnica | `ARQUITETURA_TÉCNICA.md` |

---

## 21. Limites do contrato

Este contrato define o **domínio comercial** do sistema. Ele NÃO define:

- Estrutura de banco de dados ou schema SQL
- APIs, endpoints, ou contratos técnicos
- Arquitetura de sistema ou stack
- Implementação de código
- Fluxos técnicos de integração (gateways, webhooks, transportadoras)
- Migrations SQL
- Requisitos não-comerciais (SEO, PWA, performance)
- Detalhes de infraestrutura ou deploy

Esses elementos serão definidos em:

```text
CONTRATO_FUNCIONAL_SISTEMA_v1.0 → ARQUITETURA_TECNICA → MODELO_DE_DADOS → API_CONTRACT
```

---

## 22. Dependências para o Contrato Funcional

Todas as decisões de domínio estão fechadas. O `CONTRATO_FUNCIONAL_SISTEMA_v1.0` pode ser gerado a partir deste documento.

Decisões estratégicas fechadas (DEC1–DEC4):

| Fonte | Decisão | Status |
|-------|---------|--------|
| DEC1 | Backend = Supabase | ✅ Fechado |
| DEC2 | Pagamentos no lançamento = PIX + cartão | ✅ Fechado |
| DEC3 | Migração seletiva | ✅ Fechado |
| DEC4 | MVP lançado já com dados comerciais necessários | ✅ Fechado |

Decisões de domínio fechadas (D1-D4, D9, D10):

| Fonte | Decisão | Escolha |
|-------|---------|---------|
| D1 | Atributos de Variante | C — Tamanho + cor + volume/ml |
| D2 | Preço de Variante | B + D — Sobrescreve + snapshot |
| D3 | Promoções | C + D + H/I + J + L |
| D4 | Estoque | C + E + G+H + K + M |
| D9 | Endereço | B + H + F + J + L |
| D10 | Status do Pedido | A + D + F + I + L + N |

Decisões técnicas penduradas (para Arquitetura Técnica):

| Fonte | Decisão | Destino |
|-------|---------|---------|
| D6b | Gateway de pagamento | `ARQUITETURA_TÉCNICA.md` |

---

## 23. Histórico de versão

### v1.2 — 2026-09-15 (revisão de governança)

- D6b reclassificado de Contrato Funcional para Arquitetura Técnica.
- D6a eliminado da tabela principal (consolidado em DEC2).
- D11-D18 terminologia alterada de "Removidas" para "↪ Superseded / Reclassificadas".
- DEC4 com fonte corrigida (derivação de DEC3 + decisão estratégica de timing).

### v1.3 — 2026-09-15 (Workshop de Fechamento concluído)

- 6 decisões de domínio fechadas no Workshop D1-D4 + D9-D10:
  - D1 (Atributos de Variante): C — Tamanho + cor + volume/ml
  - D2 (Preço de Variante): B + D — Sobrescreve + snapshot
  - D3 (Promoções): C + D + H/I + J + L
  - D4 (Estoque): C + E + G+H + K + M
  - D9 (Endereço): B + H + F + J + L
  - D10 (Status do Pedido): A + D + F + I + L + N
- Seção 20 atualizada: "Decisões pendentes" → "Decisões de domínio fechadas"
- Fluxo consolidado D1-D4 + D9-D10 incluído
- Seção 22 atualizada: todas as decisões fechadas, Contrato Funcional pronto para ser gerado
- Nenhuma implementação, alteração de código, migration ou push realizada.

### v1.0 — 2026-09-13 (referência)

- Documento original com 10 decisões fechadas.
- Detalhamento técnico que foi posteriormente identificado como ultrapassado ou não confirmado formalmente pelo dono do negócio.
- Mantido como referência histórica.

---

## 24. Alterações realizadas vs v1.0

| Item | v1.0 | v1.1 | Justificativa |
|------|------|------|---------------|
| Backend | Não mencionado | DEC1: Supabase | Decisão fechada pelo dono |
| Pagamentos | Detalhado com gateways | DEC2: PIX + cartão (gateway pendente) | Decisão fechada; gateway é técnico |
| Migração | Não mencionado | DEC3: Seletiva | Decisão fechada pelo dono |
| Timing | Não mencionado | DEC4: MVP com dados (derivação de DEC3 + decisão estratégica de timing) | Decisão fechada pelo dono |
| D11-D18 | Incluídas como decisões de negócio | ↪ Superseded / Reclassificadas — não são decisões de negócio | Não aprovadas pelo dono (Q1=B) |
| SQL/Tech interfaces | Incluídos | Removidos | Não pertencem ao contrato comercial |
| D6 | "Todas + entrega" | D6a→DEC2: PIX + cartão; D6b: Arquitetura Técnica | Métodos confirmados; gateway não |
| D10 | Status do Pedido | A + D + F + I + L + N | Fechado no Workshop 2026-09-15 |
| Decisões de domínio | Não listadas | D1-D4 + D9 + D10 → FECHADAS no Workshop | Transparente |

---

> **Este documento é a fonte oficial do domínio comercial para as próximas etapas do projeto.**
> Nenhuma implementação, alteração de código, execução de migration, ou push foi realizada para gerar este documento.
