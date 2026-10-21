## DECISOES_NEGOCIO_v1.1.md — Reclassificação e Validação

**Gerado por:** Auditoria 5.1 — Saneamento das Decisões
**Data:** 2026-09-15
**Base:** DECISOES_NEGOCIO_v1.0.md (19 decisões) + Respostas oficiais do dono do negócio (Q1-Q14)
**Motivo:** Separar decisões de negócio das técnicas, eliminar suposições não aprovadas, e produzir lista correta de decisões pendentes.

---

## RESUMO DE ALTERAÇÕES vs v1.0

| Alteração | Detalhe |
|-----------|---------|
| D11-D18 | **Removidas** do domínio de negócio → reclassificadas como decisões técnicas/arquiteturais |
| D19 | **Reclassificada** de decisão de negócio para requisito funcional/operacional |
| D6 | **Dividida** em D6a (negócio: métodos) + D6b (técnica: gateway) |
| D10 | **Reclassificada** de decisão para requisito funcional (status do pedido) |
| Q2, Q8, Q10, Q11 | **Identificadas** como decisões técnicas (não negócio) |
| Q9 | **Identificada** como pendente de matriz de dados legados |
| Q3 | **Identificada** como pendente de arquitetura |

---

## DECISÕES DE NEGÓCIO VALIDADAS (CONFIRMADAS)

### D5 — Frete
- **Escolha:** A — Tabela configurável no admin (Fase 1) + Integração transportadora (Fase 2)
- **Status:** ✅ CONFIRMADO como direção funcional
- **Ressalva:** Valores monetários específicos devem ser parametrizados/configuráveis, NÃO hardcoded no frontend
- **Data:** 2026-09-15 (revalidado)
- **Decisor:** Negócio

### D7 — WhatsApp Gera Pedido no Sistema
- **Escolha:** B — Cria pedido/rascunho + abre WhatsApp
- **Status:** ✅ CONFIRMADO
- **Ressalva:** A baixa definitiva de estoque NÃO ocorre no clique. Segue estado definido no contrato funcional:
  ```text
  Cliente → Finalizar WhatsApp → Pedido/rascunho no sistema → WhatsApp com itens+dados → Atendimento/confirmação → Reserva/baixa conforme confirmação
  ```
- **Data:** 2026-09-15 (revalidado)
- **Decisor:** Negócio

### D8 — Compra pelo Site Exige Cadastro?
- **Escolha:** C — Híbrido
- **Status:** ✅ CONFIRMADO
- **Detalhamento:**
  ```text
  Cliente logado → usa dados/endereço salvos
  Cliente visitante → informa e-mail + endereço → finaliza compra
  Ambos → criam pedidos vinculados a usuários (cria usuário lazy se não existir)
  ```
- **Não obrigar cadastro para comprar.**
- **Data:** 2026-09-15 (revalidado)
- **Decisor:** Negócio

### D19 — Suporte Humano / Handoff do Chatbot
- **Escolha:** C — Botão explícito "Falar com humano"
- **Status:** ✅ CONFIRMADO como direção funcional
- **Ressalva:** Pode manter keyword triggers como complemento, mas NÃO depender exclusivamente de keyword. Futuramente adicionar timeout, baixa confiança, problema não resolvido como gatilhos adicionais.
- **Fluxo:**
  ```text
  Chatbot → Cliente quer atendimento → [Falar com humano] → Handoff → Atendimento humano
  ```
- **Data:** 2026-09-15 (revalidado)
- **Decisor:** Negócio

---

## DECISÕES DE NEGÓCIO PENDENTES (VALIDAR NO CONTRATO FUNCIONAL)

### D1 — Atributos de Variante
- **Status:** ⏳ Pendente — validar no fechamento do contrato funcional
- **Nota:** Nenhuma confirmação explícita nesta Auditoria 5.1. Manter aberta para validação no contexto do CONTRATO FUNCIONAL v1.0.

### D2 — Variante Altera Preço?
- **Status:** ⏳ Pendente — validar no fechamento do contrato funcional

### D3 — Promoções
- **Status:** ⏳ Pendente — validar no fechamento do contrato funcional

### D4 — Estoque (Misto/Híbrido)
- **Status:** ⏳ Pendente — validar no fechamento do contrato funcional

### D6 — Formas de Pagamento
- **Status:** 🔴 PENDENTE — DECISÃO DE NEGÓCIO REAL
- **Sub-decisão D6a (NEGÓCIO):** Quais métodos serão aceitos no lançamento?
  - PIX? Cartão? Boleto? Pagamento na entrega? Outros?
  - **Não decidido.** Aguardando resposta do dono.
- **Sub-decisão D6b (TÉCNICA):** Qual gateway/provedor?
  - Mercado Pago? Stripe? Asaas? Outro?
  - **Não decidir agora.** Decisão técnica para a fase de arquitetura.

### D9 — Endereço Obrigatório por Modalidade
- **Status:** ⏳ Implícito na confirmação de D7 (C — híbrido), mas não validado explicitamente. Sugerido validar no contrato funcional.

---

## DECISÕES RECLASSIFICADAS COMO TÉCNICAS (NÃO SÃO DE NEGÓCIO)

### D11 — Backend Arquitetura (REMOVIDA do negócio)
- **Classificação:** TÉCNICA — Arquitetura
- **Status:** 🔴 PENDENTE — DECISÃO TÉCNICA REAL
- **Detalhe:** Supabase NÃO está formalmente aprovado. O dono confirmou que a escolha ainda está em discussão.
- **Alternativas a avaliar:**
  - Supabase (PostgreSQL + Auth + Storage + Edge Functions)
  - Node/Express + PostgreSQL
  - Outra alternativa tecnicamente justificável
- **Impacto:** Define toda a stack de backend, banco, auth, deploy.
- **Nota:** Esta decisão bloqueia modelo de dados, API contract, e migrations.

### D12 — Migração de Dados Legados (REMOVIDA do negócio)
- **Classificação:** TÉCNICA — Mas depende de decisão de negócio (escopo de preservação)
- **Status:** 🔴 PENDENTE — Requer matriz de dados legados antes
- **Detalhe:** Não há decisão formal sobre quais dados legados preservar. NÃO assumir que tudo migra nem que tudo descarta.
- **Categorias a classificar:**
  ```text
  Produtos       → provavelmente preservar
  Categorias     → provavelmente preservar
  Clientes       → validar
  Endereços      → validar
  Pedidos antigos → validar
  Estoque        → validar
  Fornecedores   → validar
  Histórico      → validar
  Promoções      → validar
  ```
- **Pergunta pendente:** O lançamento precisa trazer esses dados desde o primeiro dia ou migramos depois?

### D13 — Carrinho Canônico (REMOVIDA do negócio)
- **Classificação:** TÉCNICA — Implementação
- **Status:** 🟢 Não bloqueia negócio
- **Regra registrada:** Deve existir UM ÚNICO carrinho oficial. A implementação será definida na arquitetura (reaproveitar código, reescrever, ou criar novo módulo).
- **Nota:** As 7 implementações atuais são LEGADO. Uma única implementação futura será criada.

### D14 — Armazenamento de Imagens (REMOVIDA do negócio)
- **Classificação:** TÉCNICA — Infraestrutura
- **Status:** 🟢 Não bloqueia negócio
- **Requisito comercial:** Produto pode possuir múltiplas imagens/galeria.
- **Decisão técnica:** Supabase Storage, CDN, servidor local, ou outro — decidir na arquitetura.

### D16 — E-mail Transacional (REMOVIDA do negócio)
- **Classificação:** TÉCNICA — Integração
- **Status:** 🟢 Não bloqueia negócio
- **Pré-requisito antes de escolher provedor:**
  1. Quais eventos geram e-mail?
  2. Quais são obrigatórios vs opcionais?
  3. Conteúdo/fluxo funcional dos e-mails
- **Só depois:** Escolher provedor (SendGrid, Mailgun, SES, ou outro).

### D17 — PWA (REMOVIDA do negócio)
- **Classificação:** TÉCNICA — Funcionalidade extra
- **Status:** 🟢 FASE 2 (não é requisito de lançamento)
- **Prioridade:**
  ```text
  MVP → Catálogo → Carrinho → Checkout → Pedido → Pagamento → Estoque → Atendimento
  ↓
  PWA (offline/cache, instalação, push)
  ```

### D18 — SEO Cleanup (REMOVIDA do negócio)
- **Classificação:** TÉCNICA — Correção
- **Status:** 🟢 Tarefa técnica, não bloqueadora de arquitetura
- **Escopo:** Preservar/corrigir essencial:
  - URLs públicas
  - Canonical
  - Metadata
  - Sitemap
  - Robots
  - Schema.org
  - Títulos e descrições
  - Links quebrados
- **Ressalva:** Não parar a reconstrução para grande refatoração SEO.

---

## REQUISITOS FUNCIONAIS/OPERACIONAIS

### D10 — Status do Pedido
- **Classificação:** REQUISITO FUNCIONAL
- **Status:** ⏳ Pendente — detalhar no contrato funcional
- **Nota:** Pedidos terão múltiplos status (não apenas os 4 atuais: Em processamento, Enviado, Entregue, Cancelado). Precisa incluir: rascunho, aguardando_pagamento, pagamento_aprovado, em_separacao, aguardando_whatsapp (se D7=B), etc.

---

## 🔴 DECISÕES REAIS AINDA PENDENTES (PRIORIDADE MÁXIMA)

Estas são as únicas decisões que realmente merecem atenção agora. As demais são técnicas ou podem esperar.

### DECISÃO REAL 1 — Backend / Arquitetura
> **Supabase ou outra arquitetura?**
- Alternativas: Supabase, Node/Express + PostgreSQL, outra
- Bloqueia: modelo de dados, API contract, migrations, deploy
- **Não confundir** existência de arquivos `supabase/` com aprovação formal

### DECISÃO REAL 2 — Pagamentos (Negócio)
> **Quais métodos de pagamento serão oferecidos no lançamento?**
- Separar: quais métodos (negócio) vs qual gateway (técnica)
- Métodos possíveis: PIX, cartão, boleto, pagamento na entrega, outros
- **Não escolher gateway agora** (Mercado Pago/Stripe/Asaas são técnica)

### DECISÃO REAL 3 — Dados Legados (Negócio)
> **Quais dados antigos precisam sobreviver à migração?**
- Produtos, categorias → provavelmente sim
- Clientes, endereços, pedidos, estoque → validar
- Histórico, fornecedores, promoções → validar
- **Não assumir** que tudo migra nem que tudo descarta

### DECISÃO REAL 4 — Escopo da Migração (Negócio)
> **O lançamento precisa trazer os dados desde o primeiro dia?**
- Opção A: Dados legados disponíveis desde dia 1 (lançamento com história)
- Opção B: Lançar sem dados legados, migrar depois (MVP limpo)
- Opção C: Parcial (só algumas categorias desde dia 1, resto depois)

---

## CORREÇÃO IMPORTANTE

**"Migração PHP" NÃO é decisão de negócio independente.**

O PHP/MySQL é implementação legada. A decisão real é:
1. **Preservação de dados** (DECISÃO REAL 3)
2. **Preservação de funcionalidades** (quais rotas/comportamentos legados devem existir no novo sistema?)
3. A substituição do código PHP será **consequência** da arquitetura escolhida, não uma decisão isolada.

---

## PRÓXIMOS PASSOS

### Fase 1 — Fechar as 4 decisões reais
1. DECISÃO REAL 1: Backend/arquitetura
2. DECISÃO REAL 2: Métodos de pagamento (negócio)
3. DECISÃO REAL 3: Escopo de dados legados (negócio)
4. DECISÃO REAL 4: Timing da migração (negócio)

### Fase 2 — Gerar documentos (SOMENTE depois das 4 fechadas)
1. `DECISOES_NEGOCIO_v1.2.md` — decisões de negócio fechadas
2. `CONTRATO_DOMINIO_COMERCIAL_v1.1.md` — atualizado com decisões reais
3. `CONTRATO_FUNCIONAL_SISTEMA_v1.0.md` — primeiro contrato funcional real
4. `ARQUITETURA_TECNICA.md` — baseada em decisões de negócio fechadas
5. `MODELO_DE_DADOS.md` — derivado do contrato funcional (NÃO de migrations provisórias)
6. `API_CONTRACT.md` — OpenAPI 3.1
7. `MIGRATIONS/` — revalidadas/generadas do contrato funcional (as 9 atuais permanecem FORA da cadeia oficial)

### Regra de ouro
```text
Nenhuma decisão técnica antes das decisões de negócio.
Nenhuma migration antes do modelo de dados derivado do contrato.
Nenhuma arquitetura antes das decisões de negócio fechadas.
```

---

## MIGRATIONS EXISTENTES (PROVISÓRIAS — FORA DA CADEIA OFICIAL)

As 9 migrations em `supabase/migrations/` **não são parte do modelo de dados oficial**. Permanecem como material de referência/auditoria até serem revalidadas após o fechamento das decisões de negócio e geração do modelo de dados definitivo.

| Arquivo | Status |
|---------|--------|
| `2026091301_itens_pedido.sql` | ⏳ Provisória — revalidar |
| `2026091302_produto_variante.sql` | ⏳ Provisória — revalidar |
| `2026091303_produto_imagens.sql` | ⏳ Provisória — revalidar |
| `2026091304_frete_regra.sql` | ⏳ Provisória — revalidar |
| `2026091305_pedidos_expand.sql` | ⏳ Provisória — revalidar |
| `2026091306_enderecos_fk.sql` | ⏳ Provisória — revalidar |
| `2026091307_produtos_promocao_expand.sql` | ⏳ Provisória — revalidar |
| `2026091308_historico_e_estoque_expand.sql` | ⏳ Provisória — revalidar |
| `2026091309_carrinho_sync_perfis.sql` | ⏳ Provisória — revalidar |

---

**DECISOES_NEGOCIO_v1.0 → v1.1 CONCLUÍDO**
**4 decisões reais pendentes → próximas etapa**
