# SERVIÇOS + AGENDAMENTO — Angel Cosméticos v1.0

**Status:** Domínio operacional fechado. **NÃO contém SQL, API ou migration. Nenhuma alteração no Supabase nesta etapa.**
**Data:** 2026-10-03
**Base:** `CONTRATO_FUNCIONAL_V1.0` + `MODELO_COMERCIAL_V1.0` + `DECISOES_NEGOCIO` (D1–D4, D9, D10) + `ESPECIFICACAO_MIMOS_V1.0`
**Natureza:** documento de domínio funcional. Fecha regras operacionais. SQL só nas etapas 5–6 (Gap Analysis → SQL proposto → revisão → autorização).

---

## 0. Posição na sequência

```text
CONTRATO FUNCIONAL V1.0   ✅
REGRA DE DESIGN V1          ✅
ESPECIFICAÇÃO MIMOS V1      ✅
MODELO COMERCIAL V1         ✅
SERVIÇOS + AGENDAMENTO V1   ← ESTE DOCUMENTO
NOTIFICAÇÕES / WHATSAPP / E-MAIL
GAP ANALYSIS FINAL SUPABASE
SQL PROPOSTO → REVISÃO → AUTORIZAÇÃO → MIGRATIONS
```

**Decisão arquitetural (fechada):** o agendamento **não depende de WhatsApp**.

```text
Site
  ↓
Agendamento
  ↓
Banco / regra transacional
  ↓
Agendamento confirmado
  ↓
Evento
  ├── painel administrativo
  ├── e-mail
  └── WhatsApp
```

Se o WhatsApp estiver indisponível, **o agendamento continua existindo e confirmado**. WhatsApp/e-mail são **canais**, não fonte de verdade — o `agendamento` é o estado oficial. Isso prepara a Etapa 4 (Notificações) para trabalhar sobre **eventos reais**, sem acoplar comunicação à regra de negócio.

---

## 1. Serviços

Serviço de beleza (maquiagem, consultoria de beleza, cuidados etc. — exemplos estruturais, não conteúdo definitivo).

1. **Identidade:** `nome`, `slug` (canônico, único, indexável), `descrição`.
2. **Duração:** `duracao_minutos` (obrigatória — base do cálculo de agenda).
3. **Preço:** `preco` **ou** `"sob consulta"`. Regra: `preco = null` → **sob consulta** (nenhum valor exibido; contato/orçamento). `preco` preenchido → valor real de referência.
4. **Ativo/inativo:** serviço inativo não aparece nem aceita agendamento.
5. **Imagem/conteúdo:** `imagem_capa`, `vídeo`, texto (para quem é, preparação). Fallback por REGRA_DE_DESIGN §7 (nunca URL falsa no banco).
6. **Profissional(is) habilitado(s):** via vínculo N:N (§2). Serviço sem profissional ativo vinculado **não é agendável**.
7. **Regras específicas do serviço:** `preparacao`, `publico_alvo`, `requer_agendamento` (se precisa agendar ou é atendimento de walk-in), `requer_confirmacao` (padrão `true` — ver §4).
8. **Separação de domínio:** `servico.preco` é **referência**. **Cobrança/pagamento pertence ao domínio comercial (etapa 2)**, não ao agendamento. O agendamento **não** guarda estado de pagamento.

---

## 2. Profissionais

1. **Identidade reutilizada (regra dura):** profissional **não** cria um "usuário novo" quando já existe identidade no sistema. Vínculo com `auth.users` (uuid) existente: `profissional.user_id` (único). Uma identidade auth → **no máximo um** perfil profissional. Se a pessoa já tem conta, **vincula**; se não, cria a identidade auth **uma única vez**.
2. **Não é necessariamente cliente:** profissional é entidade própria. Uma mesma pessoa **pode** ter perfil de `cliente` e de `profissional` sob a **mesma** identidade auth (dois perfis, uma identidade) — mas não é obrigatório.
3. **Vínculo profissional ↔ serviço:** **N:N** (`profissional_servico`). Profissional executa vários serviços; serviço pode ser executado por vários profissionais.
4. **Ativo/inativo:** profissional inativo não recebe agendamentos (mas mantém histórico).
5. **Dados:** `nome`, contato (telefone/e-mail interno).

---

## 3. Disponibilidade

Toda disponibilidade é **calculada**, nunca assumida. Timezone: **`America/Sao_Paulo`** (UTC-3; sem DST desde 2019). Timestamps armazenados com timezone; exibição e validação em `America/Sao_Paulo`.

1. **Agenda semanal (`agenda`):** por profissional — `dia_semana`, `horario_inicio`, `horario_fim`, `ativo`. Janela recorrente de atendimento.
2. **Exceções / feriados / bloqueios (`agenda_bloqueio`):** por data — `data`, `motivo`, `tipo` (`bloqueio` | `feriado` | `indisponibilidade`), opcionalmente por profissional ou global.
3. **Horários de atendimento:** derivados da agenda semanal menos bloqueios menos agendamentos existentes.
4. **Duração + intervalo/buffer:** `duracao_minutos` do serviço + `buffer_minutos` (padrão **15**, configurável; pode ser sobrescrito por serviço ou profissional). Buffer impede encostar agendamentos.
5. **Indisponibilidade manual:** bloqueio ad-hoc (§3.2) derruba a disponibilidade imediatamente.
6. **Cálculo de slots (conceitual):**
   ```text
   agenda semanal (profissional)
     − bloqueios/feriados/indisponibilidade
     − agendamentos existentes (solicitado + confirmado)
     − buffer
     → slots livres
   ```

---

## 4. Agendamento

```text
cliente → serviço → profissional → data → horário → confirmação → protocolo → status
```

1. **Cliente:** `cliente` autenticado **ou** visitante (dados de contato; cliente lazy — D8 híbrido).
2. **Campos:** serviço, profissional, data, horário_início, horário_fim (derivado = início + duração), `duracao_minutos` (snapshot), `protocolo`, `status`, `observacao`, `origem` (`site` | `whatsapp` | `admin`).
3. **Máquina de estados (fechada):**
   ```text
   solicitado → confirmado → concluído
                    │
        ┌───────────┼────────────┬──────────────┐
        ↓           ↓            ↓              ↓
    cancelado  nao_compareceu  reagendado   expirado
   ```
   - `solicitado`: criado pelo cliente; **reserva o horário** (§5).
   - `confirmado`: staff confirmou.
   - `concluído`: serviço realizado (staff).
   - `cancelado`: cancelamento (§7).
   - `nao_compareceu`: cliente não compareceu (staff, após o horário).
   - `reagendado`: original substituído por novo agendamento (§7) — preserva histórico.
   - `expirado`: `solicitado` não confirmado dentro do prazo (§5.3) — libera o horário.
4. **Modos de criação (fechados):**
   - **Com confirmação (padrão, `requer_confirmacao=true`):** cliente **solicita** → `solicitado` → staff **confirma** → `confirmado`.
   - **Instantâneo (`requer_confirmacao=false`):** cliente agenda → `confirmado` direto (auto).
5. **Confirmação:** ato de staff/admin, auditado (§7.6).

---

## 5. Anti-double-booking (regra crítica)

**A UI não é a autoridade de disponibilidade.** A regra é transacional:

```text
disponibilidade calculada
       ↓
tentativa de reserva
       ↓
validação transacional (banco)
       ↓
conflito?
   ├─ sim → rejeita
   └─ não → grava agendamento
```

1. **Autoridade é o banco:** a reserva é validada e gravada **transacionalmente**, serializada por profissional + faixa de tempo.
2. **Sobreposição proibida:** o banco **impede duas reservas sobrepostas para o mesmo profissional**, inclusive quando duas pessoas clicam praticamente ao mesmo tempo (a transação serializa; a segunda vê a primeira já confirmada e **rejeita**).
3. **`solicitado` também reserva:** uma solicitação **ocupa o horário atomicamente** (evita que duas pessoas "solicitem" o mesmo slot). Se não for confirmada dentro do **prazo de confirmação** (padrão **15 min**, configurável), auto-libera → `expirado` (§4.3).
4. **Validação no servidor:** nenhuma reserva é confirmada apenas por validação frontend; a regra é aplicada no backend/banco.
5. **Rejeição com feedback:** conflito → mensagem clara + recalcular disponibilidade (sem expor estado interno).

---

## 6. Protocolo + confirmação

1. **Protocolo:** `AG-<YYYYMMDD>-<NNNNNN>` (ex.: `AG-20261003-000123`), sequencial por dia, gerado pelo **backend** (nunca informado pelo cliente), único. Internamente apoiado em `id` global.
2. **Referência operacional, não segredo:** o protocolo é referência de atendimento, **não** segredo de segurança nem credencial.
3. **Confirmação gera eventos:** painel administrativo · e-mail · WhatsApp. **WhatsApp/e-mail não são fonte de verdade** — o `agendamento` é o estado oficial. Se um canal falhar, o agendamento permanece confirmado (decisão arquitetural §0).
4. **Evento, não acoplamento:** a confirmação **emite eventos** (Etapa 4 consumirá); não executa a comunicação como regra de negócio.

---

## 7. Cancelamento e reagendamento

1. **Quem pode cancelar:** **cliente** (dono do agendamento) **e** **staff/admin**.
2. **Até quando o cliente pode cancelar:** até **24h antes** do início (padrão, configurável no admin). Após o prazo, cancelamento só por **staff**, com justificativa.
3. **Quem pode reagendar:** **cliente** (até o prazo) **e** **staff** (sempre).
4. **Preservar histórico (regra dura):** reagendar **não sobrescreve** data/horário anteriores. O original recebe `status = reagendado` e `agendamento_substituto_id → novo`; o novo nasce com `agendamento_origem_id → original`. Histórico em **cadeia**, nunca perdido.
5. **Horário liberado:** ao cancelar/reagendar/expirar, o horário **volta à disponibilidade** imediatamente (recalculado em §3.6).
6. **Auditoria:** toda confirmação, cancelamento, reagendamento, conclusão e não-comparecimento é registrado em `auditoria` (ator, ação, entidade, antes/depois, timestamp).

---

## 8. Integração entre domínios (separação explícita)

Nenhuma tabela monstruosa misturando venda, agenda e comunicação.

| Domínio | Responsabilidade | Pertence a |
|---|---|---|
| **Serviço / Agendamento** | operacional (o que, quem, quando, disponibilidade) | **este documento** |
| **Produto / Pedido / Pagamento** | comercial (venda, preço, estoque) | `MODELO_COMERCIAL_V1.0` |
| **Notificação** | canal de comunicação (e-mail, WhatsApp, painel) | **Etapa 4** |
| **Auditoria** | registro transversal de atos sensíveis | `auditoria` (existe) |

- **Agendamento não guarda pagamento:** se o serviço tem preço, a **cobrança** é um fluxo do domínio comercial (referenciado, não embutido).
- **Notificação é efeito, não causa:** o agendamento emite eventos; a Etapa 4 os entrega pelos canais.
- **Cliente é compartilhado:** `cliente` (comercial) e `profissional` (operacional) podem coexistir sob a mesma identidade auth (§2.2).

---

## 9. Regras transversais

1. **Timezone:** tudo em `America/Sao_Paulo` (§3).
2. **Atômica:** reserva de horário é transacional (§5); cancelamento/reagendamento libera horário atomicamente (§7.5).
3. **Não-falsificação:** mock preserva a experiência visual, **nunca** falsifica disponibilidade (não exibir slot livre que não é — REGRA_DE_DESIGN §8).
4. **Rastreabilidade:** atos sensíveis auditados (§7.6).
5. **Snapshot:** `duracao_minutos` e dados do agendamento são congelados no registro (alteração futura de serviço não reescreve agendamento passado).

---

## 10. Modelo de dados conceitual (sem SQL)

**Reaproveita (existem):** `cliente`, `atendimento`, `atendimento_mensagem`, `evento`, `auditoria`, `auth.users`.

**Candidatos a novo (sinalizados para GAP Analysis — etapa 5; NENHUM criado agora):**
- `servico` (nome, slug, descrição, duracao_minutos, preco, ativo, conteúdo, requer_confirmacao)
- `servico_imagem` / conteúdo do serviço (ou mídia genérica — decidir na etapa 5)
- `profissional` (user_id → auth.users, nome, contato, ativo)
- `profissional_servico` (N:N profissional ↔ serviço)
- `agenda` (agenda semanal por profissional)
- `agenda_bloqueio` (exceções/feriados/indisponibilidade)
- `agendamento` (cliente, serviço, profissional, data, horários, duracao, protocolo, status, origem, observacao, ligações de reagendamento)

**Nenhuma migration escrita ou aplicada.** A definição final de tabelas, índices e a **regra transacional de anti-double-booking** (trigger/constraint/lock) só ocorrem após a etapa 5 (Gap Analysis) e revisão humana (etapa 7).

---

## 11. O que não é decidido aqui (destino técnico, não pendência operacional)

- **Execução SQL/RLS/trigger de exclusão de sobreposição** → etapas 5–6.
- **Envio de e-mail/WhatsApp** → Etapa 4 (Notificações).
- **Cobrança de serviço pago** → domínio comercial (etapa 2), referenciado não embutido.

As **regras operacionais** (estados, prazos, buffer, timezone, anti-double-booking, protocolo, auditoria) estão **fechadas** acima.

---

> **Nenhuma migration, alteração de Supabase ou implementação de código é autorizada por este documento.** Ele fecha o domínio operacional de Serviços + Agendamento (etapa 3). O schema só é projetado após o Gap Analysis final (etapa 5).
