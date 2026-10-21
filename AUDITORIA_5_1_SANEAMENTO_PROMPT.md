# PROMPT PARA KILO — AUDITORIA 5.1: SANEMENTO DAS DECISÕES

**Contexto:** Angel Cosméticos — E-commerce legacy (HTML/CSS/JS + PHP/MySQL) com 9 migrations Supabase provisórias e DECISOES_NEGOCIO_v1.0 com 19 decisões (expandido de 10 originais).
**Objetivo:** Saneamento FINAL das decisões — eliminar contradições entre documentos, separar decisões de negócio das técnicas, identificar o que é realmente aprovado vs assumido, e produzir a lista EXATA de perguntas que o dono do negócio precisa responder antes de avançar para CONTRATO COMERCIAL v1.1 e CONTRATO FUNCIONAL v1.0.
**Restrições CRÍTICAS:**
1. **NÃO tratar `supabase/migrations/` como verdade oficial.** São artefatos provisórios criados antes da arquitetura ser finalizada. Usar apenas como referência do que foi rascunhado.
2. **NÃO assumir que Supabase é o backend definitivo.** DECISÃO 11 existe mas precisa ser validada.
3. **NÃO misturar decisões de negócio com escolhas técnicas.** Separar categoricamente.
4. **NÃO escrever código, migrations, ou arquitetura.** Apenas diagnosticar e perguntar.
5. **NÃO aceitar "está no documento" como resposta.** Cada decisão precisa ser verificada contra evidência real.

---

## 📊 ESTADO ATUAL DOS DOCUMENTOS

| Documento | Status | Problema Conhecido |
|-----------|--------|--------------------|
| `CONTRATO_DOMINIO_COMERCIAL_v1.0.md` | Diz "10 decisões fechadas" | Tem 19 decisões no DECISOES — contagem incompatível |
| `DECISOES_NEGOCIO_v1.0.md` | 19 decisões (D1-D19) | Mistura decisões de negócio com técnicas (D11 backend, D16 email, D17 PWA, D18 SEO) |
| `AUDITORIA_4_RELATORIO.md` | Completo (548 linhas) | Seção 30 lista "10 decisões humanas" mas só mostra H1-H5 |
| `supabase/migrations/` | 9 migration files | PROVISÓRIOS — não são verdade oficial |
| `supabase/functions/viaCEP/` | 1 Edge Function | PROVISÓRIO |
| `WORKSHOP_DECISOES_NEGOCIO_PROMPT.md` | Já existe | Obsoleto — referencia apenas 10 decisões originais |

---

## 🔴 CONTRADIÇÕES A RESOLVER (ordem de prioridade)

### C1 — Contagem de decisões inconsistente
- CONTRATO §1 diz "10 decisões fechadas"
- DECISOES tem 19 decisões
- Auditoria 5 §30 diz "10 decisões humanas" mas lista apenas H1-H5 (5 itens) e menciona 3 bloqueios
- **Pergunta a resolver:** Quantas decisões de negócio existem de fato? Quais são as 10 oficiais vs as 9 adicionais que são técnicas?

### C2 — CONTRATO diz arquitetura aberta, DECISOES diz Supabase
- CONTRATO §12 "Próximos Passos" lista "Arquitetura — Definir: Supabase vs Node/Express" como passo 1
- DECISÃO 11 já escolheu Supabase (data 2026-09-13, mesmo dia das outras decisões)
- CONTRATO é "imutável v1.0" mas decisões pós-contrato existem
- **Pergunta a resolver:** CONTRATO v1.0 está realmente "fechado" se 9 decisões foram tomadas depois dele? Precisa de v1.1?

### C3 — Migrations existem mas deveriam ser provisórias
- 9 migrations em `supabase/migrations/` datam de 2026-09-13 (mesma data de todas as decisões)
- CONTRATO §11 lista 9 migrations como "necessárias"
- Mas o usuário disse que migrations são provisórias e não representam o modelo final
- **Pergunta a resolver:** As 9 migrations são referência para CONTRATO FUNCIONAL ou foram descartadas? O modelo de dados real no Supabase existe?

### C4 — Backend escolhido mas arquitetura não finalizada
- DECISÃO 11 escolheu Supabase (negócio)
- Mas CONTRATO diz que arquitetura é aberta
- DECISÃO 11 justifica com base no CONTRATO, mas o CONTRATO ainda não confirma Supabase
- **Pergunta a resolver:** A escolha de Supabase está aprovada ou é uma suposição? Qual o status real da decisão de backend?

### C5 — Email provider classificado como decisão de negócio
- DECISÃO 16 escolheu SendGrid (classificado como "Decisor: Negócio")
- Mas escolha de provedor de email é técnico, não negócio
- **Pergunta a resolver:** Quais decisões em DECISOES estão mal classificadas? Quais são realmente de negócio vs técnicas?

### C6 — PWA e SEO como decisões de negócio
- DECISÃO 17 (Full PWA) e D18 (SEO Cleanup) classificadas como "Negócio"
- São decisões técnicas de implementação, não estratégicas de negócio
- **Pergunta a resolver:** O negócio realmente decidiu PWA e SEO, ou o técnico assumiu? Qual o ROI/prioridade vs outras decisões de negócio pendentes?

### C7 — Pagamento misturado em decisão de negócio
- DECISÃO 6 lista "Mercado Pago/Stripe/Asaas" como opções — isso é técnico
- Mas métodos de pagamento (PIX, boleto, cartão, delivery) É negócio
- **Pergunta a resolver:** Separar: (a) quais métodos de pagamento o negócio quer (negócio) vs (b) qual gateway técnico usar (técnico)

### C8 — Status de bloqueios não clarificado
- Auditoria 5 §30 diz "3 bloqueios" mas quais? H6 (Migração), H7 (Pagamento), H8 (Email)?
- Ou são bloqueios técnicos (backend não definido) que impedem H6-H9?
- **Pergunta a resolver:** Quais decisões estão REALMENTE bloqueadas vs as que estão apenas pendientes?

### C9 — Data uniforme suspeita
- Todas as 19 decisões datam de 2026-09-13
- É realisticamente possível tomar 19 decisões de negócio num único dia?
- **Pergunta a resolver:** Quais decisões foram realmente discutidas com o dono no dia 13 vs quais foram registradas retroactivamente pelo técnico?

### C10 — CONTRATO v1.0 "imutável" mas contradito
- CONTRATO §13 diz "imutável v1.0"
- Mas DECISOES tem 19 decisões que contradizem/modificam o contrato (backend, migração, PWA, etc.)
- **Pergunta a resolver:** O CONTRATO v1.0 precisa de versionamento para v1.1 para incorporar as decisões pós-contrato?

---

## 📂 CLASSIFICAÇÃO DE DECISÕES (precisa ser validada)

### Decisões de NEGÓCIO (devem ir para CONTRATO COMERCIAL v1.1):
| ID | Decisão | Classificação atual | Classificação correta? |
|----|---------|---------------------|----------------------|
| D1 | Atributos de Variante | Negócio | ? |
| D2 | Variante Altera Preço | Negócio | ? |
| D3 | Promoções | Negócio | ? |
| D4 | Estoque | Negócio | ? |
| D5 | Frete | Negócio | ? |
| D6 | Formas de Pagamento | Negócio | ? (mistura técnico) |
| D7 | WhatsApp Gera Pedido | Negócio | ? |
| D8 | Compra Exige Cadastro | Negócio | ? |
| D9 | Endereço Obrigatório | Negócio | ? |
| D19 | Suporte Humano | Negócio | ? |

### Decisões TÉCNICAS (devem ir para ARQUITETURA TÉCNICA / CONTRATO FUNCIONAL):
| ID | Decisão | Classificação atual | Classificação correta? |
|----|---------|---------------------|----------------------|
| D11 | Backend (Supabase) | Negócio | ❌ É técnica |
| D12 | Migração de Dados | Negócio | ❌ É técnica |
| D13 | Carrinho Canônico | Negócio | ❌ É técnica |
| D14 | Armazenamento de Imagens | Negócio | ❌ É técnica |
| D16 | E-mail Transacional (SendGrid) | Negócio | ❌ É técnica |
| D17 | PWA | Negócio | ❌ É técnica |
| D18 | SEO Cleanup | Negócio | ❌ É técnica |

### Decisões AMBIGUAS (precisam de reclassificação):
| ID | Decisão | Por quê? |
|----|---------|----------|
| D10 | Status do Pedido | Pode ser negócio (fluxo) ou técnica (implementação) |
| D15 | Handoff Chatbot | Mistura UX (negócio) com implementação (técnica) |

---

## 🎯 QUESTÕES A APRESENTAR AO DONO DO NEGÓCIO (em ordem de prioridade)

### BLOQUEIO 0 — Validação de Base (responder antes de tudo)
1. **O CONTRATO DOMÍNIO COMERCIAL v1.0 está correto?** Ele diz "10 decisões fechadas" mas existem 19 no DECISOES. Qual é a contagem oficial? As decisões D11-D19 foram aprovadas pelo negócio ou registradas pelo time técnico sem aprovação formal?

2. **As 9 migrations em `supabase/migrations/` são referência válida para o modelo de dados final?** Ou o modelo de dados precisa ser redesenholado do zero como parte do CONTRATO FUNCIONAL v1.0?

3. **A escolha de Supabase como backend está aprovada pelo dono do negócio?** Ou o dono ainda quer avaliar alternativas (Node/Express + PostgreSQL, PHP/MySQL evoluído, etc.)?

### BLOQUEIO 1 — Decisões de Negócio Fundamentais (precisam fechar antes de arquitetura)
4. **Quais métodos de pagamento o negócio vai oferecer no lançamento?** (Separe: quais métodos = negócio; qual gateway técnico = técnico)

5. **Qual o modelo de frete definitivo?** (Tabela configurável no admin? Integração transportadora? Ambos? Qual a regra de valor atual?)

6. **O fluxo de WhatsApp gerando pedido no sistema está confirmado?** (Rascunho? Confirmado? Com webhook para CRM?)

7. **O cadastro de usuário no checkout é obrigatório, opcional ou híbrido?**

### BLOQUEIO 2 — Decisões que Afetam Implementação Imediata
8. **Onde as imagens dos produtos serão hospedadas?** (Supabase Storage? CDN externa? Servidor local? Caminho futuro?)

9. **A migração de dados do PHP/MySQL para o novo backend é prioridade para o lançamento ou pode ser pós-lançamento?** (Dados legados precisam estar disponíveis desde o dia 1?)

10. **O carrinho deve ser reescrito do zero ou adaptado de uma das 7 implementações existentes?** (Confirmar DECISÃO 13)

### DECISÕES TÉCNICAS (não são de negócio — devem ir para próxima fase)
11. **Provedor de email transacional:** SendGrid, Mailgun, Amazon SES, Postmark, ou outro? (Isto é decisão técnica, não de negócio)

12. **PWA é prioridade para o lançamento ou fase 2?** (Perguntar ao negócio sobre prioridade, não sobre implementação técnica)

13. **SEO cleanup:** É urgente (afeta indexação hoje) ou pode esperar o relançamento?

14. **Chatbot — handoff para humano:** A estratégia de keyword trigger está correta ou o negócio quer outro mecanismo?

---

## 📋 ENTREGÁVEIS ESPERADOS DESTA AUDITORIA 5.1

### A1 — Documento `DECISOES_NEGOCIO_v1.1.md` (ou novo arquivo)
- Classificação correta de cada decisão (Negócio / Técnica / Ambígua)
- Status real de cada uma (Aprovada / Pendente / Bloqueada / Retirada)
- Decisões duplicadas ou contraditórias resolvidas
- Decisões que precisam ser RE-splitidas (ex: D6 pagamento = D6a negócio + D6b técnica)

### A2 — Lista de Perguntas para o Dono do Negócio
- Máximo 10-12 perguntas, em ordem de prioridade
- Cada pergunta com contexto mínimo (1-2 frases)
- Cada pergunta com opções claras (A/B/C) + impacto de 1 linha
- SEM opções técnicas irrelevantes (não perguntar sobre detalhes de implementação)

### A3 — Mapa de Dependências
- Quais decisões de negócio bloqueiam quais decisões técnicas
- Qual a ordem correta de fechamento
- Quais decisões podem ser paralelizadas

### A4 — Próximos Passos Pós-Auditoria 5.1
1. Fechar perguntas do dono → gerar DECISOES_NEGOCIO_v1.1
2. Gerar CONTRATO COMERCIAL v1.1 (atualizado)
3. Gerar CONTRATO FUNCIONAL v1.0 (primeiro contrato funcional real)
4. Definir arquitetura técnica (baseada em decisões de negócio fechadas)
5. Gerar modelo de dados (baseado em CONTRATO FUNCIONAL, não em migrations provisórias)
6. Gerar API Contract (OpenAPI 3.1)
7. SÓ ENTÃO: revisar/gerar migrations SQL
8. SÓ ENTÃO: implementar

---

## ⚠️ REGRAS DURA PARA ESTA AUDITORIA

1. **NÃO assumir que algo está aprovado** só porque está num documento. Verificar contradições.
2. **NÃO usar migrations como referência verdadeira.** Elas são provisórias.
3. **NÃO classificar decisão técnica como decisão de negócio.** Separar.
4. **NÃO propor "melhor prática"** como opção — perguntar ao negócio.
5. **NÃO avançar para arquitetura, modelo de dados, ou código.** Apenas diagnosticar e perguntar.
6. **Cada pergunta deve poder ser respondida com uma letra (A/B/C) em <30 segundos** pelo dono do negócio.
7. **Não aceitar "depende"** como resposta a uma pergunta — refinar até ter opções concretas.
8. **Se houver contradição entre documentos**, apresentar a contradição e perguntar qual versão é correta.

---

## 📂 DOCUMENTOS DE REFERÊNCIA (ler antes de executar)

1. `AUDITORIA_4_RELATORIO.md` — inventário funcional completo
2. `DECISOES_NEGOCIO_v1.0.md` — 19 decisões atuais
3. `CONTRATO_DOMINIO_COMERCIAL_v1.0.md` — contrato v1.0 (com 10 decisões declaradas)
4. `AUDITORIA_3_DOMAIN_CONTRACT.md` — auditoria anterior
5. `WORKSHOP_DECISOES_NEGOCIO_PROMPT.md` — workshop original (10 decisões)
6. `AUDITORIA_5_RELATORIO.md` — relatório de auditoria 5 (se existir)
7. `supabase/migrations/*.sql` — APENAS como referência provisória (NÃO como verdade)

**COMO EXECUTAR:**
1. Ler todos os documentos de referência acima
2. Identificar todas as contradições entre eles (usar modelo C1-C10 acima como base, mas encontrar todas que existirem)
3. Reclassificar todas as 19 decisões (Negócio / Técnica / Ambígua)
4. Produzir a lista final de perguntas para o dono (seção 🎯)
5. Gerar os 4 entregáveis (A1-A4)
6. Parar. NÃO iniciar implementação, arquitetura, migrations ou código.

**Início:** Ler os documentos de referência e apresentar as contradições encontradas, depois a lista de perguntas para o dono do negócio.
