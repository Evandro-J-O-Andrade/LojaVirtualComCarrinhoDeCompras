# PLANO DE IMPLANTAÇÃO — MIMOS E SERVIÇOS (Angel Cosméticos)

**Data:** 2026-10-23
**Status:** Plano pronto. Nenhuma escrita remota realizada.
**Governança:** Toda operação de escrita requer autorização explícita.

---

## 1. Diagnóstico (já confirmado)

| Módulo | Tabelas ausentes | Edge Functions ausentes | Causa raiz |
|--------|-----------------|----------------------|------------|
| Mimos | `mimo`, `mimo_produto` | — | Migration 005 não aplicada |
| Serviços | `servico` | — | Migration 003 não aplicada |
| Agendamento | `profissional`, `profissional_servico`, `agenda`, `agenda_bloqueio`, `agendamento` | `booking-availability`, `booking-create` | Migration 003 não aplicada + Edge Functions não deployadas |

---

## 2. Ordem de execução (5 passos)

### Passo 1: Aplicar migration 003 (serviços + agendamento)
- **Arquivo:** `supabase/migrations/20261003000003_servicos_agendamento.sql`
- **Cria:** 6 tabelas + 1 view + índices + RLS + constraints + anti-double-booking
- **Idempotente:** `CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`
- **Risco:** Baixo — tabelas novas, sem impacto em dados existentes
- **Reversível:** Sim — `DROP TABLE` em ordem inversa de dependência
- **Dependências:** Nenhuma (tabelas novas)
- **Verificação pré:** Confirmar que `servico` retorna 404 (já confirmado)
- **Verificação pós:** `SELECT count(*) FROM servico` → deve retornar 0 (tabela vazia, pronta para seed)

### Passo 2: Aplicar migration 004 (notificações + eventos)
- **Arquivo:** `supabase/migrations/20261003000004_notificacoes_eventos.sql`
- **Cria:** 3 tabelas + ALTER `evento` + índices + RLS
- **Idempotente:** `CREATE TABLE IF NOT EXISTS`, `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`
- **Risco:** Baixo — tabelas novas + ALTER aditivo
- **Reversível:** Parcialmente — ALTERs em `evento` são mais complexos de reverter
- **Dependências:** Nenhuma
- **Verificação pré:** Confirmar que `notificacao` retorna 404 (já confirmado)
- **Verificação pós:** `SELECT count(*) FROM notificacao` → deve retornar 0

### Passo 3: Aplicar migration 005 (mimos)
- **Arquivo:** `supabase/migrations/20261003000005_mimos_diarios.sql`
- **Cria:** 2 tabelas (`mimo`, `mimo_produto`)
- **Idempotente:** `CREATE TABLE IF NOT EXISTS`
- **Risco:** Baixo — tabelas novas
- **Reversível:** Sim
- **Dependências:** Nenhuma
- **Verificação pré:** Confirmar que `mimo` retorna 404 (já confirmado)
- **Verificação pós:** `SELECT count(*) FROM mimo` → deve retornar 0

### Passo 4: Aplicar migration 006 (alterações comerciais)
- **Arquivo:** `supabase/migrations/20261003000006_alteracoes_comerciais.sql`
- **Cria:** 3 tabelas (`promocao`, `produto_opcao_compra`, `kit_composicao`) + ALTERs
- **Idempotente:** `CREATE TABLE IF NOT EXISTS`, `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`
- **Risco:** Médio — ALTERs em tabelas existentes (`produto`, `kit_composicao`)
- **Reversível:** Parcialmente
- **Dependências:** Migration 003 (referência a `servico` em `profissional_servico`? Não — 006 não depende de 003)
- **Verificação pré:** Confirmar que `promocao` retorna 404 (já confirmado)
- **Verificação pós:** `SELECT count(*) FROM promocao` → deve retornar 0

### Passo 5: Deploy Edge Functions + Seed mínimo
- **Edge Functions a criar:**
  - `booking-availability`: recebe `servico_id`, `profissional_id`, `data` → retorna slots disponíveis
  - `booking-create`: recebe dados do agendamento → persiste com anti-double-booking
- **Seed mínimo:**
  - 1 serviço ativo (nome, slug, duração, preço)
  - 1 profissional ativo vinculado ao serviço
  - 1 mimo ativo (nome, slug, contexto, período)
- **Risco:** Médio — Edge Functions precisam ser implementadas do zero
- **Dependências:** Passos 1-4 concluídos

---

## 3. Riscos identificados

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Migration 003 cria view `profissional_publico` que ignora RLS | Médio | View projeta apenas id/nome de profissionais ativos — sem dados sensíveis |
| Anti-double-booking via exclusão parcial (btree_gist) | Alto | Requer extensão `btree_gist` instalada (confirmado) |
| Edge Functions não existem localmente | Alto | Precisam ser implementadas do zero ou recuperadas de backup |
| Seed de dados pode conflitar com RLS | Médio | Usar service_role para seed (não expor no frontend) |
| Migration 006 faz ALTERs em tabelas existentes | Médio | Usar `ADD COLUMN IF NOT EXISTS` para idempotência |

---

## 4. O que o frontend já faz (não precisa mudar)

- **Mimos:** `MimoTableMissingError` → `ErrorState` com retry. Funciona.
- **Serviços:** `ServiceTableMissingError` → `ErrorState` com retry. Funciona.
- **Agendamento:** `BookingTableMissingError`, `BookingBackendUnavailableError`, `BookingAccessRestrictedError`. Funciona.
- **Loading/empty states:** Implementados em todas as páginas.
- **Testes:** 47 arquivos, 362 testes passando.

## 5. Verificação pós-implantação (quando autorizado)

```sql
-- Passo 1
SELECT count(*) FROM servico;           -- 0 (vazio, pronto para seed)
SELECT count(*) FROM profissional;       -- 0
SELECT count(*) FROM agendamento;        -- 0

-- Passo 2
SELECT count(*) FROM notificacao;        -- 0
SELECT count(*) FROM notificacao_template; -- 0

-- Passo 3
SELECT count(*) FROM mimo;               -- 0
SELECT count(*) FROM mimo_produto;        -- 0

-- Passo 4
SELECT count(*) FROM promocao;           -- 0
SELECT count(*) FROM produto_opcao_compra; -- 0
SELECT count(*) FROM kit_composicao;      -- 0

-- Edge Functions
-- Testar via curl ou Supabase Dashboard
```

## 6. Dependências que bloqueiam

| Dependência | Status | Ação necessária |
|-------------|--------|-----------------|
| Autorização para aplicar migrations | Pendente | Usuário deve autorizar |
| Código das Edge Functions | Não existe | Implementar ou recuperar |
| Seed de dados | Pendente | Autorização + dados reais |
| Testes de integração com Supabase real | Não existem | Criar após migrations aplicadas |

---

**Nenhuma operação foi executada. Este plano está pronto para execução mediante autorização.**