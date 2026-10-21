# NOTIFICAÇÕES + COMUNICAÇÃO — Angel Cosméticos v1.0

**Status:** Infraestrutura de comunicação fechada. **NÃO é regra de negócio. NÃO contém SQL, API ou migration. Nenhuma alteração no Supabase nesta etapa.**
**Data:** 2026-10-03
**Base:** `CONTRATO_FUNCIONAL_V1.0` + `MODELO_COMERCIAL_V1.0` + `SERVICOS_AGENDAMENTO_V1.0` + `DECISOES_NEGOCIO` (D1–D4, D9, D10)
**Natureza:** documento de infraestrutura de comunicação. Fecha eventos, canais, templates, preferências, entrega, idempotência. SQL só nas etapas 5–6.

---

## 0. Regra fundamental — Evento não é notificação

```text
EVENTO
"agendamento confirmado"
        ↓
NOTIFICATION DISPATCHER
        ↓
┌────────────┬────────────┬─────────────┐
│   INTERNO  │   E-MAIL   │  WHATSAPP   │
└────────────┴────────────┴─────────────┘
```

- **Evento** informa **o que aconteceu**. Ele **não** manda o domínio fazer outra coisa.
- **Notificação** é a **tentativa de entrega** desse evento por um canal.
- Trocar provedor de WhatsApp/e-mail **não reescreve** pedido/agendamento — muda só o adaptador do canal.

**Decisão arquitetural (fechada):** comunicação é **efeito**, não **causa**. Nenhuma regra de pedido, agenda ou pagamento depende de um canal ter entregue.

---

## 1. Eventos (catálogo)

O evento é o fato. Catálogo fechado:

### 1.1 Operacionais — **já existem no schema** (nomes em inglês; reconciliar convenção — §11)

| nome atual | normalização proposta | domínio |
|---|---|---|
| `order.created` | `pedido.criado` | pedido |
| `order.confirmed` | `pedido.confirmado` | pedido |
| `payment.paid` | `pagamento.confirmado` | pagamento |
| `payment.refused` | `pagamento.recusado` | pagamento |
| `order.shipped` | `pedido.enviado` | pedido |
| `order.delivered` | `pedido.entregue` | pedido |
| `order.canceled` | `pedido.cancelado` | pedido |
| `stock.reserved` | `estoque.reservado` | estoque |
| `stock.released` | `estoque.liberado` | estoque |
| `support.requested` | `atendimento.criado` | atendimento |
| `support.handoff` | `atendimento.handoff` | atendimento |

### 1.2 Operacionais — **novos** (a adicionar ao catálogo)

- `agendamento.criado` · `agendamento.confirmado` · `agendamento.cancelado` · `agendamento.reagendado` · `agendamento.concluido`
- `agendamento.naousou` · `agendamento.expirado` (internos)
- `orcamento.enviado` · `orcamento.aceito` · `orcamento.recusado` · `orcamento.expirado` (interno)
- `pagamento.estornado`
- `atendimento.mensagem`
- `estoque.baixo` (interno, alerta)

### 1.3 Marketing (opt-in — §4)

`promocao.publicada` · `campanha.lancada` · `mimo.publicado` · `carrinho.abandonado`

**Canais padrão por evento:**

| Evento | Cliente | Admin interno |
|---|---|---|
| `agendamento.*` | email/whatsapp (preferencial) | ✅ |
| `pedido.*`, `pagamento.*` | email/whatsapp (preferencial) | ✅ |
| `orcamento.*` | email/whatsapp (preferencial) | ✅ |
| `atendimento.*` | email/whatsapp | ✅ |
| marketing | email/whatsapp (opt-in) | — |

---

## 2. Canais

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

- Canal é um **adaptador**. Adicionar `sms`/`push` posteriormente **não altera** pedido/agendamento.
- Cada canal declara quais estados de entrega **suporta** (§5 — nem todos reportam `lido`).
- Canal inoperante **não bloqueia** o domínio (§7, §8).

---

## 3. Templates

Template por **evento + canal**:

```text
AGENDAMENTO_CONFIRMADO
   ├── EMAIL
   ├── WHATSAPP
   └── INTERNO
```

**Variáveis controladas** (nada de montar mensagem comercial em componentes React):

`%nome%` · `%protocolo%` · `%servico%` · `%data%` · `%hora%` · `%pedido%` · `%valor%`

- Renderização é **server-side** (Edge Function/backend), nunca no frontend.
- Template tem `variaveis` declaradas; variável ausente → campo vazio, **nunca** inventado.
- Conteúdo de template é **dados reais** do evento (dados do `evento.dados`), sem Lorem ipsum, sem preço inventado.

---

## 4. Preferências do cliente

1. **Operacional vs marketing:**
   - **Operacional** (agendamento, pedido, pagamento, orçamento, atendimento): **essencial à operação**.
   - **Marketing** (promoção, campanha, mimo, abandono): **não essencial**.
2. **Opt-in/opt-out:** marketing exige **opt-in explícito** (consentimento, LGPD) com data; opt-out a qualquer momento. Operacional **não** pode ser bloqueado quando juridicamente/operacionalmente necessário.
3. **Canal preferencial:** cliente escolhe canal preferido (email/whatsapp); se o preferido falhar, operacional pode **recair** em outro canal (marketing, não).
4. **Respeito a consentimento:** nenhuma comunicação é enviada sem consentimento válido quando exigido.
5. **Essenciais intransferíveis:** confirmação de agendamento, confirmação de pagamento, alerta de segurança **nunca** são silenciados por preferência.

---

## 5. Estado de entrega

```text
pendente → processando → enviado → entregue → lido
```

Falhas:

```text
falhou → retry → falhou definitivamente
```

- **Nem todo canal fornece todos os estados** → o modelo permite `null`/`não suportado` (ex.: WhatsApp pode não reportar `lido`; interno nasce `entregue` e fica `lido` quando o admin visualiza).
- `entregue_em` e `lido_em` são **anuláveis**.
- `falhou definitivamente` → **dead-letter** para revisão manual (não reenvio infinito).

---

## 6. Idempotência e retry (crítico)

Se o servidor receber **duas vezes** `pedido.criado`, **não** podemos mandar dois WhatsApps/e-mails iguais.

```text
evento
  ↓
idempotency_key
  ↓
entrega
```

1. **Ingestão:** `evento.idempotency_key` **único** → mesmo evento produzido duas vezes é deduplicado (não cria linha duplicada no outbox).
2. **Entrega:** `notificacao.idempotency_key` **único** (ou `(evento_id, canal, destinatario)` único) → mesmo evento+canal+destinatário é entregue **uma vez**.
3. **Retry seguro:** retry **incrementa `tentativas` na mesma `notificacao`** (não cria nova entrega) → nenhum envio duplicado. Backoff exponencial; após máximo de tentativas → `falhou definitivamente`.

---

## 7. WhatsApp

- WhatsApp é **canal, não banco de dados**.
- O sistema **registra** o fato (`agendamento confirmado`) e **depois tenta entregar** (`WhatsApp → API/provedor`).
- **Se a API estiver indisponível: o agendamento continua existindo e confirmado.** A entrega fica `falhou` → retry → `falhou definitivamente` (revisão manual).
- Credencial do provedor fica **exclusivamente no backend/Edge Function** — nunca no frontend.
- Trocar provedor = trocar adaptador do canal, não reescrever o sistema.

---

## 8. E-mail

```text
evento → fila/outbox → serviço de e-mail → provider → status
```

- **Outbox:** o fato é persistido (`evento`) antes de qualquer tentativa de envio; o dispatcher consome o outbox e entrega.
- **Segredos/API keys exclusivamente no backend/Edge Function/provider seguro** — **nunca** em `.env` do frontend (alinhado ao `supabase/config.toml`: *"service_role key must NEVER be in frontend .env files"*).
- Status de entrega atualizado via callback/webhook do provider (quando disponível).

---

## 9. Notificação interna

O admin visualiza, sem depender de WhatsApp nem de e-mail:

```text
🔔 Novo agendamento
AG-20261003-000123
Maquiagem
14:00
```

- `notificacao` com `canal = interno`, persistida, com `lido_em` quando o admin visualiza.
- Inbox do admin com não-lidas e histórico.
- Funciona mesmo com todos os canais externos fora.

---

## 10. Auditoria ≠ Notificação

Comunicação e auditoria são **coisas diferentes** — não misturar.

- **Notificação:** *"Tentamos enviar o WhatsApp."* (registro técnico de entrega → `notificacao`)
- **Auditoria:** *"Usuário X confirmou/reagendou/cancelou o agendamento."* (ato comercial, quem fez o quê → `auditoria`)

Um ato comercial escreve em `auditoria` **e** pode emitir um `evento` que gera uma `notificacao` — **dois registros, duas preocupações separadas**.

---

## 11. Achado — a infraestrutura de eventos já existe

A tabela `evento` **já existe** no schema canônico (`202609190101_base_schema.sql:474`) como **barramento/outbox**:

- `idempotency_key varchar(255)` — idempotência **já modelada**.
- `nome` com CHECK fechado (os 11 eventos de §1.1).
- `entidade_tipo` · `entidade_id` · `dados jsonb` · `status ('pendente','processado','falhou')` · `tentativas` · `processado_em`.

**Implicação:** a camada de **evento/outbox + idempotência + retry** já está presente. O **gap** é a camada de **dispatch** (notificação/template/preferência/canal) e a **expansão do catálogo** de eventos (§1.2, §1.3).

**Reconciliação de convenção (fechada):** adotar **`dominio.acao` em português** (ex.: `pedido.criado`, `agendamento.confirmado`), coerente com a linguagem do domínio e com esta especificação. Os 11 eventos existentes em inglês (`order.created` etc.) serão **normalizados/mapeados** na etapa 6 (migração do CHECK + produtores). A **decisão de convenção está fechada aqui**; a execução é migration da etapa 6.

---

## 12. Modelo de dados conceitual (sem SQL)

**Reaproveita (existem):** `evento` (outbox + idempotency_key + tentativas) · `auditoria` (campo-level, `acao` create/update/delete/view) · `atendimento` + `atendimento_mensagem` (threads de suporte) · `cliente` (destinatário).

**Candidatos a novo (sinalizados para GAP Analysis — etapa 5; NENHUM criado agora):**
- `notificacao` (evento_id, canal, destinatario, template, variaveis, idempotency_key único, status, tentativas, proxima_tentativa, enviado_em, entregue_em, lido_em, erro)
- `notificacao_template` (evento_nome, canal, assunto, corpo, variaveis, ativo)
- `notificacao_preferencia` (cliente_id, categoria operacional/marketing, canal_preferencial, opt_in_marketing, opt_in_marketing_em)
- **Expansão** do CHECK `evento.nome` (§1.2, §1.3) + normalização de convenção (§11)
- **Dispatcher** Edge Function (consome `evento` → dispatch idempotente por canal)

**Dúvida para a etapa 5:** `auditoria.usuario_id bigint` — atualmente provavelmente aponta para `cliente`; precisa mapear também **profissional/admin** como ator de atos operacionais (§10).

**Nenhuma migration escrita ou aplicada.**

---

## 13. O que não é decidido aqui (destino técnico)

- **Provedores** de WhatsApp/e-mail e suas credenciais → arquitetura técnica/segurança.
- **Execução SQL/Edge Function** do dispatcher → etapas 5–6.
- **Templates visuais** (HTML/WhatsApp) → fase de construção, com conteúdo real.

As **regras de comunicação** (eventos, canais, idempotência, entrega, preferências, separação auditoria/notificação) estão **fechadas** acima.

---

> **Nenhuma migration, alteração de Supabase ou implementação de código é autorizada por este documento.** Ele fecha a infraestrutura de comunicação (etapa 4). O schema só é projetado após o Gap Analysis final (etapa 5).
