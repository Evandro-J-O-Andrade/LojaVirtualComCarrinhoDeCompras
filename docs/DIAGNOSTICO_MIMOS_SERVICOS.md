# DIAGNÓSTICO MIMOS E SERVIÇOS — ANGEL COSMÉTICOS

**Data:** 2026-10-23
**Status:** Diagnóstico completo. Nenhuma escrita remota realizada.

---

## 1. Mimos — Causa Raiz

### Tabelas ausentes (confirmadas via REST, HTTP 404)
| Tabela | Status | Migration de origem |
|--------|--------|---------------------|
| `mimo` | 404 | 005 (mimos_diarios) |
| `mimo_produto` | 404 | 005 (mimos_diarios) |
| `promocao` | 404 | 006 (alteracoes_comerciais) |
| `produto_opcao_compra` | 404 | 006 (alteracoes_comerciais) |
| `kit_composicao` | 404 | 006 (alteracoes_comerciais) |

### Código frontend
- **Arquivo:** `web/src/domains/mimos/repositories/mimo.repository.supabase.ts`
- **Comportamento:** Consulta `mimo` → recebe erro `42P01` → lança `MimoTableMissingError`
- **UI:** `MimosPage.tsx` exibe `ErrorState` com "Não foi possível carregar os mimos."
- **Detalhe:** A página também exibe banner "Catálogo em montagem" (isEditorial = true) quando não há dados

### Conclusão
O frontend já trata o erro corretamente. O problema é puramente de backend: as tabelas não existem porque as migrations 004 e 005 não foram aplicadas.

---

## 2. Serviços — Causa Raiz

### Tabela ausente (confirmada via REST, HTTP 404)
| Tabela | Status | Migration de origem |
|--------|--------|---------------------|
| `servico` | 404 | 003 (servicos_agendamento) |

### Código frontend
- **Arquivo:** `web/src/domains/services/repositories/service.repository.supabase.ts`
- **Comportamento:** Consulta `servico` → recebe erro `42P01` → lança `ServiceTableMissingError`
- **UI:** `ServicesPage` exibe `ErrorState` com "Não foi possível carregar o serviço."

### Conclusão
Mesmo padrão dos mimos: frontend trata o erro, backend ausente.

---

## 3. Agendamento — Causa Raiz (múltiplas dependências)

### Tabelas ausentes (todas 404)
| Tabela | Status | Migration de origem |
|--------|--------|---------------------|
| `servico` | 404 | 003 |
| `profissional` | 404 | 003 |
| `profissional_servico` | 404 | 003 |
| `agenda` | 404 | 003 |
| `agenda_bloqueio` | 404 | 003 |
| `agendamento` | 404 | 003 |

### View ausente
| View | Status | Migration de origem |
|------|--------|---------------------|
| `profissional_publico` | 404 | 003 |

### Edge Functions ausentes (404)
| Function | Status | Uso |
|----------|--------|-----|
| `booking-availability` | 404 | Consulta de horários disponíveis |
| `booking-create` | 404 | Persistência do agendamento |

### Código frontend
- **Arquivo:** `web/src/domains/booking/repositories/booking.repository.supabase.ts`
- **Dependências:** `profissional_servico` (404), `profissional_publico` (404), `booking-availability` (404), `booking-create` (404)
- **Tratamento de erro:** `BookingTableMissingError`, `BookingBackendUnavailableError`, `BookingAccessRestrictedError`

### Fluxo de agendamento (7 etapas, todas bloqueadas)
1. Seleção de serviço → bloqueado (tabela `servico` não existe)
2. Seleção de profissional → bloqueado (tabela `profissional_servico` não existe)
3. Seleção de data → bloqueado (sem profissional)
4. Seleção de horário → bloqueado (Edge Function `booking-availability` não existe)
5. Dados do cliente → bloqueado (sem horário)
6. Resumo → bloqueado (sem dados)
7. Confirmação/persistência → bloqueado (Edge Function `booking-create` não existe)

### Conclusão
O agendamento está travado em cascata: a ausência da tabela `servico` impede toda a cadeia. Mesmo que a tabela existisse, as Edge Functions não estão deployadas.

---

## 4. Resumo: O que falta (backend)

### Migrations a aplicar (requer autorização)
| Migration | Tabelas criadas | Status |
|-----------|----------------|--------|
| 003 (servicos_agendamento) | servico, profissional, profissional_servico, agenda, agenda_bloqueio, agendamento + view profissional_publico | Registrada, não aplicada |
| 004 (notificacoes_eventos) | notificacao, notificacao_template, notificacao_preferencia + ALTER evento | Registrada, não aplicada |
| 005 (mimos_diarios) | mimo, mimo_produto | Registrada, não aplicada |
| 006 (alteracoes_comerciais) | promocao, produto_opcao_compra, kit_composicao + ALTERs | Registrada, não aplicada |

### Edge Functions a criar (requer autorização)
| Function | Propósito | Dependências |
|----------|-----------|--------------|
| `booking-availability` | Consultar horários disponíveis via RPC | Tabelas 003 + função de disponibilidade |
| `booking-create` | Persistir agendamento com anti-double-booking | Tabelas 003 + exclusão parcial |

### Dados a seedar (requer autorização)
- Serviços (pelo menos 1 ativo para testar o fluxo)
- Profissionais (pelo menos 1 vinculado a um serviço)
- Mimos (pelo menos 1 ativo para testar a página)

---

## 5. O que o frontend já faz bem

- **Tratamento de erro:** Todas as 3 páginas (Mimos, Serviços, Agendamento) exibem `ErrorState` com retry quando tabelas não existem
- **Loading states:** Skeletons e spinners implementados
- **Empty states:** Mensagens apropriadas quando não há dados
- **Tipagem:** TypeScript strict, interfaces bem definidas
- **Testes:** 47 arquivos de teste, 362 testes passando
- **Build:** Compila sem erros

## 6. O que NÃO posso fazer sem autorização

1. Aplicar migrations 003-006 no banco remoto
2. Criar Edge Functions no Supabase
3. Inserir dados de exemplo (seeds)
4. Alterar políticas RLS

## 7. Proposta mínima para desbloquear Mimos e Serviços

### Passo 1: Aplicar migration 003 (serviços + agendamento)
- Cria 6 tabelas + 1 view + índices + RLS + constraints
- **Idempotente:** usa `CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`
- **Reversível:** todas as tabelas podem ser dropadas sem afetar outras

### Passo 2: Aplicar migration 005 (mimos)
- Cria 2 tabelas
- **Idempotente:** usa `CREATE TABLE IF NOT EXISTS`
- **Reversível:** tabelas podem ser dropadas

### Passo 3: Aplicar migration 006 (alterações comerciais)
- Cria 3 tabelas + ALTERs em tabelas existentes
- **Idempotente:** usa `CREATE TABLE IF NOT EXISTS`, `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`
- **Reversível:** parcialmente (ALTERs em tabelas existentes são mais complexos de reverter)

### Passo 4: Deploy Edge Functions
- `booking-availability`: consulta de disponibilidade
- `booking-create`: persistência de agendamento
- **Requer:** código das functions (não existe localmente)

### Passo 5: Seed mínimo
- 1 serviço ativo
- 1 profissional vinculado
- 1 mimo ativo
- **Requer:** autorização explícita

---

## 8. Arquivos relevantes

| Arquivo | Função |
|---------|--------|
| `web/src/domains/mimos/repositories/mimo.repository.supabase.ts` | Consulta `mimo` (404) |
| `web/src/domains/mimos/pages/MimosPage.tsx` | UI com ErrorState |
| `web/src/domains/mimos/pages/MimoDetailPage.tsx` | UI de detalhe |
| `web/src/domains/services/repositories/service.repository.supabase.ts` | Consulta `servico` (404) |
| `web/src/domains/booking/repositories/booking.repository.supabase.ts` | Consulta `profissional_servico` (404) + Edge Functions (404) |
| `web/src/domains/booking/pages/BookingPage.tsx` | UI de agendamento (7 etapas) |
| `supabase/migrations/20261003000003_servicos_agendamento.sql` | Migration 003 (serviços + agendamento) |
| `supabase/migrations/20261003000004_notificacoes_eventos.sql` | Migration 004 (notificações) |
| `supabase/migrations/20261003000005_mimos_diarios.sql` | Migration 005 (mimos) |
| `supabase/migrations/20261003000006_alteracoes_comerciais.sql` | Migration 006 (comercial) |

---

**Nenhuma alteração foi realizada. Aguardando autorização para aplicar migrations 003-006 e deployar Edge Functions.**