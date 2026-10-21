## DECISOES_NEGOCIO_v1.2.md — Decisões Fechadas

**Gerado por:** Fechamento das 4 decisões reais (Auditoria 5.1 + resposta do dono)
**Data:** 2026-09-15
**Base:** DECISOES_NEGOCIO_v1.1.md + Decisões oficiais do dono do negócio
**Motivo:** Formalizar as 4 decisões que bloqueavam o avanço para contratos e arquitetura.

---

## RESUMO DE ALTERAÇÕES vs v1.1

| Alteração | Detalhe |
|-----------|---------|
| DEC1 | Backend = Supabase (fechado) |
| DEC2 | Pagamentos no lançamento = PIX + cartão (fechado) |
| DEC3 | Dados legados = migração seletiva dos relevantes (fechado) |
| DEC4 | Timing = MVP já com dados comerciais migrados (fechado) |
| D6a | Parcialmente fechado — métodos definidos (PIX + cartão), gateway ainda técnico |
| D11 | Superseded por DEC1 (Supabase confirmado como backend) |
| D12 | Superseded por DEC3 (migração seletiva confirmada) |

---

## DECISÕES DE NEGÓCIO FECHADAS (versão 1.2)

### D1 — Atributos de Variante
- **Escolha:** C — Tamanho + cor + volume/ml (atributos opcionais por produto)
- **Status:** ✅ FECHADO — Workshop 2026-09-15
- Produto simples continua válido. Produto pode ter variantes quando houver diferenciação comercial. Atributos disponíveis: tamanho, cor, volume/ml. Não adotar EAV/JSONB nesta versão. Não assumir que todo produto possui tamanho.

### D2 — Variante Altera Preço?
- **Escolha:** B + D — Variante pode sobrescrever preço base + preço congelado no carrinho
- **Status:** ✅ FECHADO — Workshop 2026-09-15
- Se variante não tem preço, herda do base. Snapshot no carrinho protege contra mudanças silenciosas. Revalidação no checkout. Preço confirmado no pedido como histórico.

### D3 — Promoções
- **Escolha:** C + D + H/I + J + L
  - Tipo: percentual + valor fixo
  - Escopo: produto base → variantes
  - Cumulatividade: não cumulativa; menor preço final
  - Período: início + fim obrigatórios
  - Cupons: não no lançamento
- **Status:** ✅ FECHADO — Workshop 2026-09-15
- Ordem: produto → resolução do preço da variante → promoção válida → preço promocional → snapshot no carrinho → preservado no item do pedido.

### D4 — Estoque
- **Escolha:** C + E + G+H + K + M
  - Modelo: híbrido (simples=produto, variante=SKU)
  - Reserva: no checkout (transacional)
  - Baixa: site=pagamento aprovado, WhatsApp=vendedor confirma
  - Estoque negativo: não permitido
  - Cancelamento/devolução: retorna com validação
- **Status:** ✅ FECHADO — Workshop 2026-09-15

### D5 — Frete
- **Escolha:** A — Tabela configurável no admin (Fase 1) + Integração transportadora (Fase 2)
- **Status:** ✅ CONFIRMADO (revalidado v1.1)
- **Ressalva:** Valores monetários parametrizados/configuráveis, NÃO hardcoded no frontend
- **Decisor:** Negócio

### D6 — Formas de Pagamento
- **D6a (NEGÓCIO):** Quais métodos no lançamento?
  - **Escolha:** PIX + cartão
  - **Status:** ✅ CONFIRMADO
  - **Nota:** Gateway/provedor técnico fica para a arquitetura (não Mercado Pago/Stripe/Asaas agora)
- **D6b (TÉCNICA):** Qual gateway?
  - **Status:** 🔴 Pendente — decisão técnica na fase de arquitetura
- **Decisor:** Negócio (D6a), Técnico (D6b)

### D7 — WhatsApp Gera Pedido no Sistema
- **Escolha:** B — Cria pedido/rascunho + abre WhatsApp
- **Status:** ✅ CONFIRMADO (revalidado v1.1)
- **Ressalva:** Baixa definitiva de estoque NÃO no clique. Segue estado do contrato funcional.
- **Decisor:** Negócio

### D8 — Compra pelo Site Exige Cadastro?
- **Escolha:** C — Híbrido
- **Status:** ✅ CONFIRMADO (revalidado v1.1)
- **Decisor:** Negócio

### D9 — Endereço Obrigatório por Modalidade
- **Escolha:** B + H + F + J + L
  - Obrigatoriedade: checkout do site + visitante
  - WhatsApp: cliente informa no site antes de finalizar
  - Tipo: apenas entrega no MVP
  - Campos: CEP + ViaCEP + número manual
  - Múltiplos endereços permitidos; snapshot no pedido
- **Status:** ✅ FECHADO — Workshop 2026-09-15

### D10 — Status do Pedido
- **Escolha:** A + D + F + I + L + N
  - Dois fluxos convergem (site + WhatsApp)
  - Pagamento separado (status_pagamento vs status_pedido)
  - Confirmação por canal (site=pagamento aprovado, WhatsApp=vendedor confirma)
  - Cancelamento até envio
  - Devolução: processo separado
  - Estoque vinculado a evento de confirmação
- **Status:** ✅ FECHADO — Workshop 2026-09-15

### D19 — Suporte Humano / Handoff do Chatbot
- **Escolha:** C — Botão explícito "Falar com humano"
- **Status:** ✅ CONFIRMADO (revalidado v1.1)
- **Ressalva:** Keyword triggers como complemento, não dependência exclusiva
- **Decisor:** Negócio

---

## DECISÕES ESTRATÉGICAS FECHADAS (NOVAS — v1.2)

### DEC1 — Backend / Arquitetura
- **Escolha:** Supabase (PostgreSQL + Auth + Storage + Edge Functions + Realtime)
- **Status:** ✅ FECHADO — Decisão do dono do negócio
- **Justificativa:** PostgreSQL substitui MySQL legado, Auth para clientes, Storage para imagens, RLS para segurança, Edge Functions para checkout/estoque/WhatsApp/integrações, Realtime para atendimento, integração natural com React/Vite, elimina dependência PHP que não executa no Netlify, mantém Netlify como frontend
- **Decisor:** Negócio
- **Data:** 2026-09-15
- **Impacto:** Define toda a stack de backend, banco, auth, deploy, integrations

### DEC2 — Pagamentos no Lançamento
- **Escolha:** PIX + cartão (métodos); gateway como decisão técnica posterior
- **Status:** ✅ FECHADO — Decisão do dono do negócio
- **Justificativa:** PIX + cartão são os métodos para o lançamento; gateway (Mercado Pago/Stripe/Asaas/outro) será definido na arquitetura técnica
- **Decisor:** Negócio (métodos), Técnico (gateway)
- **Data:** 2026-09-15
- **Impacto:** Define integrações de pagamento, webhooks, status de pedido (pendente, aprovado, etc.)
- **Nota importante:** Não amarrar sistema a gateway específico antes da arquitetura

### DEC3 — Dados Legados
- **Escolha:** Migração seletiva dos dados comerciais relevantes
- **Status:** ✅ FECHADO — Decisão do dono do negócio
- **Justificativa:** Não apagar tudo e começar limpo. Preservar dados comerciais relevantes com utilidade operacional/histórica
- **Decisor:** Negócio
- **Data:** 2026-09-15
- **Categorias a migrar:**
  - Produtos
  - Categorias
  - Clientes/usuários
  - Cadastro complementar
  - Endereços
  - Estoque
  - Promoções
  - Histórico de compras/pedidos (quando houver dados válidos)
- **Categorias a não migrar (validar):**
  - Dados técnicos quebrados
  - Duplicados
  - Sem utilidade operacional/histórica
- **Processo:** Auditoria dos dados → Classificação (Migrar / Não migrar / Arquivar) → Migração controlada

### DEC4 — Timing da Migração
- **Escolha:** MVP novo já com os dados comerciais necessários migrados
- **Status:** ✅ FECHADO — Decisão do dono do negócio
- **Justificativa:** Não fazer MVP vazio e depois importar tudo. Catálogo, clientes, estoque e histórico fazem parte do negócio
- **Decisor:** Negócio
- **Data:** 2026-09-15
- **Fluxo:**
  ```text
  Sistema atual
       ↓
  Auditoria dos dados
       ↓
  Classificação (Migrar / Não migrar / Arquivar)
       ↓
  Novo modelo
       ↓
  Migração controlada
       ↓
  React + Supabase
       ↓
  Validação local
       ↓
  Produção
  ```

---

## DECISÕES RECLASSIFICADAS COMO TÉCNICAS (NEGÓCIO NÃO DECIDE)

### D11 — Backend Arquitetura → ABRANGIDA POR DEC1
- **Status:** ✅ FECHADO via DEC1 (Supabase confirmado)

### D12 — Migração de Dados → ABRANGIDA POR DEC3
- **Status:** ✅ FECHADO via DEC3 (migração seletiva confirmada)

### D13 — Carrinho Canônico
- **Classificação:** TÉCNICA — Implementação
- **Status:** 🟢 Não bloqueia negócio
- **Regra:** Deve existir UM ÚNICO carrinho oficial. Implementação definida na arquitetura.

### D14 — Armazenamento de Imagens
- **Classificação:** TÉCNICA — Infraestrutura
- **Status:** 🟢 Não bloqueia negócio
- **Requisito comercial:** Produto pode possuir múltiplas imagens/galeria.

### D16 — E-mail Transacional
- **Classificação:** TÉCNICA — Integração
- **Status:** 🟢 Não bloqueia negócio
- **Pré-requisito:** Definir eventos, obrigatoriedade e conteúdo antes de escolher provedor.

### D17 — PWA
- **Classificação:** TÉCNICA — Funcionalidade extra
- **Status:** 🟢 FASE 2

### D18 — SEO Cleanup
- **Classificação:** TÉCNICA — Correção
- **Status:** 🟢 Tarefa técnica, não bloqueadora de arquitetura

---

## MIGRATIONS EXISTENTES (PROVISÓRIAS — FORA DA CADEIA OFICIAL)

As 9 migrations em `supabase/migrations/` **não são parte do modelo de dados oficial**, mesmo com Supabase agora escolhido como backend.

**Motivo:** Foram criadas prematuramente e assumiram decisões antes do fechamento correto. Mesmo com Supabase confirmado, o modelo oficial deve ser derivado dos contratos. Essas migrations serão **revisadas, descartadas ou reconstruídas** conforme necessário.

| Arquivo | Status |
|---------|--------|
| `2026091301_itens_pedido.sql` | ⏳ Provisória — revisar após modelo de dados |
| `2026091302_produto_variante.sql` | ⏳ Provisória — revisar após modelo de dados |
| `2026091303_produto_imagens.sql` | ⏳ Provisória — revisar após modelo de dados |
| `2026091304_frete_regra.sql` | ⏳ Provisória — revisar após modelo de dados |
| `2026091305_pedidos_expand.sql` | ⏳ Provisória — revisar após modelo de dados |
| `2026091306_enderecos_fk.sql` | ⏳ Provisória — revisar após modelo de dados |
| `2026091307_produtos_promocao_expand.sql` | ⏳ Provisória — revisar após modelo de dados |
| `2026091308_historico_e_estoque_expand.sql` | ⏳ Provisória — revisar após modelo de dados |
| `2026091309_carrinho_sync_perfis.sql` | ⏳ Provisória — revisar após modelo de dados |

---

## PRÓXIMOS PASSOS

### Fase 1 — Fechar decisões pendentes no contrato funcional

1. ~~D1 — Atributos de Variante~~ ✅ FECHADO (2026-09-15)
2. ~~D2 — Variante Altera Preço~~ ✅ FECHADO (2026-09-15)
3. ~~D3 — Promoções~~ ✅ FECHADO (2026-09-15)
4. ~~D4 — Estoque~~ ✅ FECHADO (2026-09-15)
5. ~~D9 — Endereço Obrigatório~~ ✅ FECHADO (2026-09-15)
6. ~~D10 — Status do Pedido~~ ✅ FECHADO (2026-09-15)

**Todas as 6 decisões de domínio pendentes foram fechadas no workshop de 2026-09-15.**

### Fase 2 — Gerar CONTRATO FUNCIONAL_SISTEMA_v1.0

Após revisão humana do CONTRATO_DOMINIO_COMERCIAL_v1.1, gerar `CONTRATO_FUNCIONAL_SISTEMA_v1.0.md` consolidando:
- DEC1–DEC4 (decisões estratégicas)
- D1-D4, D9, D10 (decisões de domínio fechadas)
- D5, D7, D8, D19 (decisões confirmadas)
- Fluxo consolidado de D1-D4 + D9-D10
- Separação D6a (negócio) vs D6b (técnica)
1. `CONTRATO_DOMINIO_COMERCIAL_v1.1.md` — atualizado com DEC1-DEC4 + D5-D19 fechadas
2. `CONTRATO_FUNCIONAL_SISTEMA_v1.0.md` — primeiro contrato funcional real
3. `ARQUITETURA_TECNICA.md` — baseada em Supabase + React/Vite/TS
4. `MODELO_DE_DADOS.md` — derivado do contrato funcional (NÃO de migrations provisórias)
5. `API_CONTRACT.md` — OpenAPI 3.1

### Fase 3 — Modelo e migrations
6. Modelo de dados oficial
7. Revisar/reconstruir 9 migrations provisórias
8. Gerar migrations oficiais

### Fase 4 — Implementação
9. Implementação
10. Auditoria + Testes
11. Revisão local
12. Push final

---

**DECISOES_NEGOCIO_v1.1 → v1.2 CONCLUÍDO**
**DECISOES_NEGOCIO_v1.2 → v1.3 CONCLUÍDO**
**6 decisões de domínio (D1-D4, D9, D10) fechadas no Workshop 2026-09-15**
**Todas as decisões de negócio FECHADAS.**
**Próximo passo: CONTRATO_FUNCIONAL_SISTEMA_v1.0.md (após revisão humana do v1.1)**
**Zero push — manter regra.**
