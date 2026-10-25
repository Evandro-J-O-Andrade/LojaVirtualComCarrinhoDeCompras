# ANGEL COSMÉTICOS — NOTIFICAÇÕES E COMUNICAÇÃO V1.0

## 1. Princípio fundamental

**Evento não é notificação.**

```
EVENTO
"agendamento confirmado"
        ↓
NOTIFICATION DISPATCHER
        ↓
┌────────────┬────────────┬─────────────┐
│   INTERNO  │   E-MAIL   │  WHATSAPP   │
└────────────┴────────────┴─────────────┘
```

O evento informa **o que aconteceu**. Ele não manda o domínio fazer outra coisa.

A infraestrutura de comunicação é independente dos domínios de negócio (pedido, agendamento, pagamento, atendimento). Nenhum domínio controla notificações; apenas emite eventos.

## 2. Eventos

### 2.1 Catálogo de eventos

| Evento | Emissor | Descrição |
|---|---|---|
| `agendamento.criado` | Agendamento | Novo agendamento registrado |
| `agendamento.confirmado` | Agendamento | Agendamento confirmado |
| `agendamento.cancelado` | Agendamento | Agendamento cancelado |
| `agendamento.reagendado` | Agendamento | Agendamento reagendado |
| `pedido.criado` | Pedido | Novo pedido criado |
| `pedido.atualizado` | Pedido | Status do pedido alterado |
| `pagamento.confirmado` | Pagamento | Pagamento confirmado |
| `pagamento.estornado` | Pagamento | Pagamento estornado |
| `orcamento.enviado` | Orçamento | Orçamento enviado ao cliente |
| `orcamento.aceito` | Orçamento | Orçamento aceito pelo cliente |
| `orcamento.recusado` | Orçamento | Orçamento recusado |
| `atendimento.criado` | Atendimento | Novo atendimento aberto |
| `atendimento.respondido` | Atendimento | Resposta enviada ao cliente |

Novos eventos podem ser adicionados conforme necessidade, sem alterar a infraestrutura de dispatch.

### 2.2 Estrutura do evento

```text
evento
├── id (PK)
├── tipo (enum: agendamento.criado, pedido.criado, etc.)
├── entidade (nome da entidade: agendamento, pedido, pagamento, etc.)
├── entidade_id (ID da entidade)
├── payload (JSON com dados do evento)
├── idempotency_key (UNIQUE)
├── criado_em (timestamptz)
└── processado (boolean)
```

### 2.3 Regra de idempotência

Se o servidor receber o mesmo evento duas vezes (mesma `idempotency_key`), a segunda é ignorada. Nenhuma notificação duplicada é gerada.

```text
evento
   ↓
idempotency_key (UNIQUE)
   ↓
se já existe → ignorar
se não existe → processar
```

## 3. Canais

### 3.1 Separação de camadas

```text
evento
   ↓
notificação
   ↓
canal
├── interno
├── e-mail
└── WhatsApp
```

### 3.2 Canais definidos

| Canal | Descrição | Suporta entrega? | Suporta leitura? |
|---|---|---|---|
| `interno` | Notificação no painel admin | Sim | Sim |
| `email` | E-mail transacional | Sim | Não (depende do provedor) |
| `whatsapp` | WhatsApp via API/provedor | Sim | Não (depende do provedor) |

Novos canais podem ser adicionados sem alterar a lógica de negócio dos domínios emissores.

### 3.3 Regra de independência

O canal é responsável apenas pela **entrega**. O domínio de negócio não sabe qual canal será usado. O Notification Dispatcher decide quais canais acionar com base em templates e preferências do cliente.

## 4. Templates

### 4.1 Estrutura

Template por evento + canal.

```text
AGENDAMENTO_CONFIRMADO
   ├── EMAIL
   ├── WHATSAPP
   └── INTERNO
```

### 4.2 Variáveis controladas

Templates utilizam variáveis com sintaxe `%variavel%`:

| Variável | Descrição |
|---|---|
| `%nome%` | Nome do cliente |
| `%protocolo%` | Protocolo do agendamento/pedido |
| `%servico%` | Nome do serviço |
| `%data%` | Data formatada |
| `%hora%` | Hora formatada |
| `%pedido%` | Número do pedido |
| `%valor%` | Valor formatado |
| `%endereco%` | Endereço formatado |
| `%link%` | Link de ação |

### 4.3 Regra de centralização

Nenhuma mensagem comercial deve ser montada em componentes React. Toda mensagem é gerada a partir de templates registrados no backend, com variáveis substituídas no momento do envio.

### 4.4 Estrutura da tabela de templates

```text
notificacao_template
├── id (PK)
├── evento (tipo do evento)
├── canal (interno, email, whatsapp)
├── assunto (para e-mail)
├── corpo (template com variáveis)
├── ativo (boolean)
├── created_at
└── updated_at
```

## 5. Preferências do cliente

### 5.1 Tipos de comunicação

| Tipo | Descrição | Opt-in/opt-out |
|---|---|---|
| Operacional | Confirmações, cancelamentos, atualizações de pedido | Não pode ser bloqueado (essencial) |
| Marketing | Promoções, novidades, campanhas | Opt-in/opt-out pelo cliente |

### 5.2 Preferências

```text
cliente_preferencia_notificacao
├── id (PK)
├── cliente_id (FK)
├── canal (interno, email, whatsapp)
├── tipo (operacional, marketing)
├── ativo (boolean)
├── created_at
└── updated_at
```

### 5.3 Regras

- Comunicações operacionais são obrigatórias e não podem ser desativadas pelo cliente.
- Comunicações de marketing respeitam opt-in/opt-out.
- O cliente pode escolher o canal preferencial.
- O consentimento é registrado e auditável.

## 6. Estado de entrega

### 6.1 Estados possíveis

```text
pendente
   ↓
processando
   ↓
enviado
   ↓
entregue
   ↓
lido
```

### 6.2 Falhas

```text
falhou
   ↓
retry (tentativa automática)
   ↓
falhou definitivamente
```

### 6.3 Regra de suporte parcial

Nem todo canal fornece todos os estados. O modelo deve permitir `null` para estados não suportados pelo canal.

Exemplo: WhatsApp pode informar "enviado" mas não "lido" (depende do provedor). E-mail pode informar "entregue" mas não "lido".

### 6.4 Estrutura da tabela de entrega

```text
notificacao_entrega
├── id (PK)
├── notificacao_id (FK)
├── canal (interno, email, whatsapp)
├── status (pendente, processando, enviado, entregue, lido, falhou, falhou_definitivamente)
├── tentativas (integer)
├── ultimo_erro (text, nullable)
├── enviado_em (timestamptz, nullable)
├── entregue_em (timestamptz, nullable)
├── lido_em (timestamptz, nullable)
├── idempotency_key (UNIQUE)
├── created_at
└── updated_at
```

## 7. WhatsApp

### 7.1 Papel

WhatsApp é **canal**, não banco de dados.

O sistema registra que um evento ocorreu (ex: agendamento confirmado) e tenta entregar a notificação via WhatsApp.

### 7.2 Fluxo

```text
evento
   ↓
Notification Dispatcher
   ↓
WhatsApp → API/provedor
   ↓
status de entrega
```

### 7.3 Regra de resiliência

Se a API do WhatsApp estiver indisponível:

- **o agendamento/pedido continua existindo.**
- A notificação é marcada como `falhou` ou `pendente`.
- Retry automático é tentado conforme política.
- O domínio de negócio não é afetado.

### 7.4 Segredos

API keys e credenciais do provedor WhatsApp ficam exclusivamente no backend/Edge Function. Nunca no frontend.

## 8. E-mail

### 8.1 Fluxo

```text
evento
   ↓
fila/outbox
   ↓
serviço de e-mail
   ↓
provider
   ↓
status
```

### 8.2 Regra de resiliência

Mesma regra do WhatsApp: se o provedor de e-mail estiver indisponível, o domínio de negócio continua funcionando. A notificação é registrada como falha e retry é tentado.

### 8.3 Segredos

API keys e credenciais do provedor de e-mail ficam exclusivamente no backend/Edge Function.

## 9. Notificação interna

### 9.1 Funcionalidade

O admin deve conseguir visualizar notificações internas no painel:

```text
🔔 Novo agendamento
AG-20261003-000123
Maquiagem
14:00
```

### 9.2 Independência

A notificação interna não depende de WhatsApp nem de e-mail. É um canal autônomo que funciona mesmo se todos os outros canais estiverem indisponíveis.

### 9.3 Estrutura

A notificação interna é armazenada na tabela `notificacao` com `canal = 'interno'` e `status` apropriado.

## 10. Auditoria

### 10.1 Separação

**Notificação:** "Tentamos enviar o WhatsApp."

**Auditoria:** "Usuário X confirmou/reagendou/cancelou o agendamento."

São coisas diferentes e não devem ser misturadas.

### 10.2 Tabela de auditoria

A tabela `auditoria` registra ações de usuários e sistemas:

```text
auditoria
├── id (PK)
├── entidade (nome da entidade)
├── entidade_id (ID da entidade)
├── acao (criar, atualizar, cancelar, etc.)
├── usuario_id (FK para auth.users, nullable para sistema)
├── dados_anteriores (JSON, nullable)
├── dados_novos (JSON, nullable)
├── ip (nullable)
├── created_at
```

### 10.3 Regra

- Notificações registram **tentativas de comunicação**.
- Auditoria registra **ações de negócio**.
- Uma ação de negócio pode gerar uma notificação, mas são entidades separadas.

## 11. Idempotência e retry

### 11.1 Idempotência

Cada notificação tem uma `idempotency_key` única. Se o mesmo evento for processado duas vezes, a segunda tentativa é ignorada.

### 11.2 Retry

Política de retry:

| Tentativa | Intervalo | Ação |
|---|---|---|
| 1 | Imediato | Primeira tentativa |
| 2 | 1 minuto | Retry automático |
| 3 | 5 minutos | Retry automático |
| 4 | 15 minutos | Retry automático |
| 5 | 1 hora | Retry automático |
| 6+ | — | `falhou_definitivamente` |

### 11.3 Regra de segurança

Retry não pode causar efeito colateral duplicado. A idempotency_key garante que, mesmo se o retry for processado, a notificação não será enviada duas vezes.

## 12. Outbox pattern

### 12.1 Conceito

Utilizar o padrão outbox para garantir que eventos sejam processados de forma confiável:

```text
Domínio de negócio
   ↓
grava evento na tabela outbox (mesma transação)
   ↓
processador assíncrono lê outbox
   ↓
dispatch para canais
   ↓
atualiza status de entrega
```

### 12.2 Vantagens

- Garante que o evento seja registrado mesmo se o dispatch falhar.
- Permite retry automático.
- Desacopla o domínio de negócio da infraestrutura de comunicação.
- Permite processamento assíncrono.

## 13. Resumo da arquitetura

```text
DOMÍNIO DE NEGÓCIO
(agendamento, pedido, pagamento, orçamento, atendimento)
        ↓
    EMITE EVENTO
        ↓
    OUTBOX (idempotency_key)
        ↓
    NOTIFICATION DISPATCHER
        ↓
┌───────────┬───────────┬───────────┐
│  INTERNO  │  E-MAIL   │ WHATSAPP  │
└───────────┴───────────┴───────────┘
        ↓
    STATUS DE ENTREGA
    (pendente → processando → enviado → entregue → lido)
    (falhou → retry → falhou definitivamente)
```

### Regras finais

1. **Evento não é notificação.** Evento informa o que aconteceu; notificação é a tentativa de comunicar.
2. **Canal não é banco de dados.** WhatsApp e e-mail são meios de entrega, não fontes de verdade.
3. **Domínio não controla comunicação.** Domínios emitem eventos; o dispatcher decide canais e templates.
4. **Idempotência é obrigatória.** Nenhuma notificação pode ser enviada duas vezes para o mesmo evento.
5. **Retry é seguro.** Retry não pode causar efeito colateral duplicado.
6. **Segredos ficam no backend.** API keys e credenciais de provedores nunca no frontend.
7. **Auditoria é separada de notificação.** Auditoria registra ações; notificação registra tentativas de comunicação.
8. **Comunicação essencial não pode ser bloqueada.** O cliente não pode desativar comunicações operacionais.
9. **Novos canais não alteram domínios.** Adicionar um canal novo não requer alteração nos domínios de negócio.
10. **Novos eventos não alteram infraestrutura.** Adicionar um evento novo não requer alteração no dispatcher.
