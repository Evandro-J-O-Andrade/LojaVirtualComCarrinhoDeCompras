# GATE 6.2 — AUDITORIA E FECHAMENTO DO DOMÍNIO COMERCIAL COMPLETO

**Contexto:** Angel Cosméticos — `CONTRATO_DOMINIO_COMERCIAL_v1.1` aprovado. Decisões D1-D4, D9, D10 fechadas. DEC1-DEC4 fechadas. Gate de Domínio Comercial (20 áreas) mapeado.
**Objetivo:** Auditar o domínio completo e produzir o documento que define **exatamente** o banco de dados que o Angel Cosméticos precisa. 100% READ-ONLY. Sem código, sem Supabase, sem migrations.
**Restrições CRÍTICAS:**
1. **NÃO criar migrations.** Nenhuma migration. Zero.
2. **NÃO aplicar db push, db diff, ou qualquer alteração no Supabase.**
3. **NÃO criar buckets, views, ou funções no Supabase.**
4. **NÃO usar web/src/types como fonte de verdade do banco.**
5. **NÃO copiar arquitetura dos projetos de referência** (J&S, Pedacinho, AtendimentoOffline). Apenas estudar padrões.
6. **NÃO modelar "maquiagem".** Modelar comércio de produtos configuráveis (maquiagem é caso de uso).
7. **NÃO assumir tabelas, colunas, ou tipos** sem validar contra decisões fechadas.
8. **NÃO colocar service_role em arquivos frontend.**
9. **NÃO avançar para migrations** após este gate. Produzir documento → revisão humana → só então modelo de dados → migrations.

---

## 📂 FONTES OBRIGATÓRIAS (ler antes de executar)

1. `CONTRATO_DOMINIO_COMERCIAL_v1.1.md` — domínio comercial aprovado
2. `DECISOES_NEGOCIO_v1.2.md` — decisões fechadas (DEC1-DEC4, D5-D10, D19)
3. `DECISOES_NEGOCIO_v1.3.md` — decisões do Workshop D1-D4 + D9-D10
4. `GATE_6_1_INVENTARIO_BIBLIOTECAS.md` — Gate 6.1 (se existir)
5. `AUDITORIA_4_RELATORIO.md` — inventário funcional completo
6. `AUDITORIA_3_DOMAIN_CONTRACT.md` — domain contract com evidências
7. Gate de Domínio Comercial (20 áreas) — mapeamento de referência
8. `web/src/lib/supabase.ts` — para entender como o código se conecta ao Supabase
9. Projetos de referência (J&S, Pedacinho, AtendimentoOffline) — **APENAS para estudo de padrões**

Se algum arquivo não existir, registrar e continuar com fontes disponíveis.

---

## ⚠️ REGRAS ABSOLUTAS

### 1. READ-ONLY total

Este gate NÃO:
- Cria migrations
- Aplica db push/db diff
- Cria tabelas, buckets, funções
- Modifica código
- Modifica Supabase
- Modifica qualquer arquivo existente

Este gate PRODUZ:
- Um documento de modelo de dados completo
- Mapeamento de entidades, relacionamentos, regras
- Identificação de tabelas, colunas, tipos, restrições
- Políticas RLS necessárias
- Eventos e triggers necessários

### 2. Decisões fechadas são autoridade

As seguintes decisões NÃO devem ser reinterpretadas, alteradas ou questionadas:

| Decisão | Conteúdo |
|---------|----------|
| DEC1 | Backend = Supabase |
| DEC2 | Pagamentos = PIX + cartão |
| DEC3 | Migração seletiva |
| DEC4 | MVP com dados comerciais |
| D1 | Variantes: tamanho + cor + volume/ml (opcionais) |
| D2 | Preço: variante pode sobrescrever + snapshot no carrinho |
| D3 | Promoções: %/R$, produto→variantes, não cumulativa, menor preço final, período obrigatório |
| D4 | Estoque: híbrido, reserva no checkout, baixa por canal, sem negativo, retorno com validação |
| D6a | Métodos: PIX + cartão |
| D7 | WhatsApp: pedido rascunho + abre WhatsApp |
| D8 | Cadastro: híbrido |
| D9 | Endereço: obrigatório no checkout + visitante |
| D10 | Status: dois fluxos convergem, pagamento separado |
| D19 | Atendimento: botão explícito |

Se houver contradição entre este gate e decisões fechadas, **as decisões fechadas vencem**.

### 3. Produto = comércio configurável

O modelo de produto NÃO é "produto de maquiagem". Deve suportar:
- Maquiagem (atributos: cor, tamanho, volume)
- Roupas (atributos: cor, tamanho, material)
- Mesa/Banho (atributos: quantidade, tamanho)
- Kits (composição de produtos)
- Categorias futuras sem refazer o modelo

### 4. Projetos de referência = estudo apenas

J&S Empregos, Pedacinho de Felicidade, AtendimentoOfflineAlpha são **referência para padrões**, não para copiar tabelas, lógica ou arquitetura. Identificar IDEA -> decidir para Angel -> modelar de forma própria.

### 5. Separação de riscos

O documento produzido deve identificar claramente:
- O que é regra comercial (decisão do negócio)
- O que é segurança (RLS, IDOR, autorização)
- O que é implementação técnica (tipos SQL, índices, triggers)

---

## 🎯 ENTREGÁVEIS ESPERADOS

### A1 — Documento de Modelo de Dados Completo

Arquivo: `MODELO_DE_DADOS_GATE62.md` (ou similar)

Estrutura obrigatória para cada entidade:

```text
### ENTIDADE: [nome]

**Fonte:** [qual documento/auditoria fundamenta]
**Decisões associadas:** [D1, D2, etc.]
**Regras comerciais:**
- [regra 1]
- [regra 2]

**Tabela proposta:**
- nome
- colunas (nome, tipo, nullable, default)
- PK, FK, UNIQUE, CHECK constraints
- índices necessários

**RLS necessárias:**
- [política 1: quem pode fazer o quê]

**Relacionamentos:**
- [relação com outras entidades]

**Evidência:** [qual arquivo/auditoria sustenta]
```

### A2 — Mapeamento de Domínio Completo

Para cada uma das áreas abaixo, documentar:

```text
### ÁREA: [nome]

**Entidades envolvidas:**
**Relacionamentos:**
**Regras de negócio:**
**Segurança necessária:**
**Dados necessários:**
**Evidência:**
```

### A3 — Mapa de Risco e Segurança

Identificar para cada tabela/operção:
- Quais dados são sensíveis?
- Quais operações precisam RLS?
- Quais operações precisam autorização?
- Quais podem ser exploradas via IDOR?
- Quais precisam auditoria?

### A4 — Próximos Passos

1. Revisão humana do documento de modelo de dados
2. Modelo de dados oficial (derivado do documento Gate 6.2)
3. Segurança/RLS/IDOR (definir antes de migrations)
4. Migrations SQL (derivadas do modelo de dados)
5. Supabase remoto
6. API Contract
7. Implementação

---

## 📋 ÁREAS DO DOMÍNIO A AUDITAR

Para cada área, auditar entidades, relacionamentos, regras, segurança e evidências.

### 1. PRODUTOS

Fontes: AUDITORIA_4 §3, §7, AUDITORIA_3 §2.1, DECISÃO D1 (tamanho+cor+volume), DECISÃO D2 (preço por variante)

Entidades: produto, informações, imagens, categorias, atributos, variantes/SKUs, opções de compra, kits/composições, preços, promoções, estoque.

Perguntas-chave:
- Quais informações um produto possui? (nome, descrição, slug, material, características, cuidados)
- Quais imagens? (principal, galeria, ordem, Storage URL)
- Quais categorias? (N:N com categoria)
- Quais atributos por produto? (tamanho, cor, volume, outros — D1)
- Como funcionam variações/SKUs? (cada combinação é SKU? preco por SKU? D2)
- O que são opções de compra? (unidade, kit, quantidade — D1 contexto)
- O que são kits? (composição de produtos — kits de maquiagem, etc.)
- Como funciona preço? (base, variante, promoção — D2, D3)
- Como funciona estoque? (híbrido, reserva, baixa — D4)

### 2. CLIENTES

Fontes: AUDITORIA_4 §14, D8 (cadastro híbrido), D9 (endereço)

Entidades: cliente/usuario, auth, perfil, endereços, favoritos, histórico.

Perguntas-chave:
- Como funciona auth? (email/senha, magic link?)
- O que é perfil além de auth?
- Como funciona cadastro híbrido? (visitante lazy creation)
- Quais dados pessoais? (nome, email, telefone, CPF)
- Endereços: quantos por cliente, validação, tipo
- Favoritos: produtos salvos, ordem, data

### 3. CARRINHO

Fontes: AUDITORIA_4 §8 (7 implementações), D13 (carrinho canônico), DEC2 (PIX+cartão)

Entidades: carrinho, itens, configuração comercial.

Perguntas-chave:
- Carrinho visitante (localStorage) vs persistente (backend)
- Merge após login (D8 contexto)
- CartItem: sku, produtoId, varianteId, nome, atributos, precoUnitario, quantidade, total
- Configuração comercial escolhida (qual variante/opção, não só produto)
- Snapshot de preço (D2 contexto)

### 4. PEDIDOS

Fontes: AUDITORIA_4 §11, D7 (WhatsApp rascunho), D10 (status)

Entidades: pedido, itens, snapshot, endereço, frete, descontos, total, histórico de status.

Perguntas-chave:
- Itens do pedido (pedido_itens / PedidoItem)
- Snapshot: o que é congelado? (preço, variante, endereço)
- Endereço de entrega (D9 obrigatório)
- Frete (D5 configurável)
- Descontos (D3 promoção)
- Total (cálculo final)
- Status do pedido (D10: rascunho, processando, enviado, entregue, cancelado)
- Status do pagamento (D10: pendente, aprovado, recusado)
- Origem (site/whatsapp)
- Histórico de status (pedido_status_historico?)

### 5. PAGAMENTOS

Fontes: DEC2 (PIX + cartão), D10 (separado de status pedido)

Entidades: pagamento, transação, método.

Perguntas-chave:
- PIX (QR Code, copia e cola)
- Cartão (via gateway — técnico)
- Link de pagamento?
- Transações (cada pagamento é transação)
- Status (pendente, aprovado, recusado)
- Webhooks (confirmação automática)
- O que é do escopo comercial vs técnico?

### 6. FRETE

Fontes: D5 (configurável + transportadora F2), AUDITORIA_4 §8

Entidades: regra de frete, cotação, opção de entrega.

Perguntas-chave:
- ViaCEP (proxy para endereço)
- Regras (CEP/região/UF, valor, tipo, subtotal_mínimo)
- Cálculo (peso, dimensões, distância)
- Métodos (fixo, por kg, percentual)
- Prazo estimado
- Transportadoras (Fase 2)
- Grátis a partir de valor (configurável)

### 7. PROMOÇÕES

Fontes: D3 (fechada), AUDITORIA_4 §13

Entidades: promoção, aplicação, cupom (futuro).

Perguntas-chave:
- Tipo (% ou R$)
- Período (data início/fim obrigatórios)
- Escopo (produto base → variantes)
- Cumulatividade (não cumulativa, menor preço final)
- Regras de aplicação
- Cupons (não no lançamento, futuro)

### 8. ESTOQUE

Fontes: D4 (fechada), AUDITORIA_4 §12

Entidades: estoque, movimentação, reserva.

Perguntas-chave:
- Estoque por produto (simples) vs por variante (SKU)
- Entrada (reposição, ajuste)
- Saída (venda, devolução, cancelamento)
- Reserva (checkout, temporária)
- Venda (consolidação)
- Cancelamento (libera reserva)
- Ajuste (correção manual)
- Composição de kits (baixa componentes)

### 9. SUPORTE

Fontes: D19 (humano), D7 (WhatsApp), AUDITORIA_4 §16

Entidades: atendimento, conversa, mensagem, solicitação.

Perguntas-chave:
- Atendimento humano (WhatsApp Business 5511963205776)
- Chatbot (OpenRouter no Render)
- Handoff (botão explícito + complementos futuros)
- Histórico de conversas?
- Solicitações (tickets, reclamações, elogios)
- Automações (respostas automáticas, FAQ)

### 10. AUTOMAÇÃO

Fontes: D7 (WhatsApp), DEC2 (pagamentos), infraestrutura

Entidades: evento, fila, automação, integração.

Perguntas-chave:
- Eventos do sistema (pedido_criado, pagamento_aprovado, etc.)
- Fila de processamento
- n8n (automações?)
- WhatsApp Business API
- E-mail transacional (provedor técnico, não negócio)
- Webhooks

### 11. ADMIN

Fontes: AUDITORIA_4 §23 (matriz MANTER/MELHORAR/REFAZER)

Entidades: painel, gestão de produtos, pedidos, clientes, estoque, promoções, frete, configurações.

Perguntas-chave:
- CRUD produtos (incluir upload de imagens)
- Gestão de pedidos (status, atendimento)
- Gestão de clientes
- Gestão de estoque (entradas/saídas/ajustes)
- Promoções (configuráveis no admin — D5)
- Regras de frete (configuráveis no admin — D5)
- Configurações (categorias, atributos, opções de compra)
- Quais operações são admin-only?

### 12. SEGURANÇA

Fontes: DEC1 (Supabase), AUDITORIA_4 §19 (credenciais expostas), IDOR

Entidades: auth, RLS, IDOR, autorização, auditoria, operações privilegiadas.

Perguntas-chave:
- Auth (Supabase Auth, RLS policies)
- RLS por tabela (quem pode ler/inserir/atualizar/deletar)
- IDOR protection (acesso a recursos de outros usuários)
- Autorização (quem pode fazer o quê)
- Auditoria (logs de operações sensíveis)
- Operações privilegiadas (admin, gerenciamento de estoque)
- Credenciais (service_role nunca no frontend)

---

## 🔄 PROCESSO DE EXECUÇÃO

### 1. Auditoria de cada área

Para cada área listada acima:
1. Identificar entidades e relacionamentos
2. Definir regras comerciais (baseadas em decisões fechadas)
3. Identificar segurança necessária (RLS, IDOR, autorização)
4. Propor tabela com colunas, tipos, constraints
5. Documentar evidências e decisões associadas
6. Identificar lacunas (sem suposições)

### 2. Validação cruzada

Após auditar todas as áreas:
- Verificar se todas as decisões fechadas estão representadas
- Verificar se não há contradições entre tabelas
- Verificar se o modelo suporta Maquiagem + Roupas + Mesa/Banho + Kits
- Verificar se service_role está fora do frontend
- Verificar se RLS está definida para tabelas sensíveis

### 3. Produção do documento final

Consolidar em MODELO_DE_DADOS_GATE62.md com:
- Todas as entidades
- Todas as tabelas propostas
- Todas as RLS
- Todas as relações
- Todas as evidências
- Todas as lacunas (sem preenchimento especulativo)

---

## ✅ VALIDAÇÃO ANTES DE FINALIZAR

Antes de considerar o documento concluído:

1. ✅ Todas as 14 decisões fechadas representadas? (DEC1-DEC4, D1-D4, D9, D10)
2. ✅ D6b NÃO aparece como decisão de gateway? (continua técnica)
3. ✅ Produto é configurável, não específico para maquiagem?
4. ✅ service_role não aparece em arquivo frontend?
5. ✅ RLS mencionada para tabelas sensíveis?
6. ✅ IDOR mencionado como risco?
7. ✅ Kits/composição mencionados com estoque de componentes?
8. ✅ Estoque híbrido (produto + variante) representado?
9. ✅ Pagamento separado de status do pedido?
10. ✅ WhatsApp como rascunho (não confirmação)?
11. ✅ Cadastro híbrido (visitante pode comprar)?
12. ✅ Endereço obrigatório no checkout?
13. ✅ Promoções com regras fechadas (D3)?
14. ✅ Snapshot no carrinho e no pedido (D2)?
15. ✅ Nenhuma migration criada?
16. ✅ Nenhuma alteração de código?
17. ✅ Nenhuma alteração no Supabase?
18. ✅ Nenhum push?
19. ✅ Projetos de referência citados apenas como estudo?
20. ✅ Lacunas identificadas sem preenchimento especulativo?

---

## SAÍDA OBRIGATÓRIA

Ao terminar, apresentar:

### 1. Documento criado
`MODELO_DE_DADOS_GATE62.md` (ou similar)

### 2. Resumo de entidades
Tabela: | Entidade | Tabela | Decisões | Segurança |

### 3. Lacunas identificadas
Lista de tópicos onde NÃO há evidência suficiente (sem inventar respostas).

### 4. Verificação de segurança
Confirmar explicitamente:
- código não alterado
- banco não alterado
- migrations não criadas
- Supabase não alterado
- deploy não realizado
- push não realizado

### 5. Próximo passo
Modelo de dados oficial derivado deste documento → migrations → Supabase remoto.

**NÃO gerar migrations neste gate.**

---

**Início:** Ler todas as fontes obrigatórias e auditar a área PRODUTOS primeiro (é a mais complexa e determina o resto do modelo).
