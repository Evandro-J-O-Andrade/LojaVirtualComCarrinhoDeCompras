# ANGEL COSMÉTICOS — LACUNAS E DECISÕES PENDENTES

## 1. Lacunas técnicas

### 1.1 Integração Frontend × Supabase

| Lacuna | Tipo | Descrição | Impacto |
|---|---|---|---|
| Nomenclatura inconsistente (`criado_em` vs `created_at`) | SCHEMA | Tabelas `produto_opcao_compra`, `produto_opcao_valor`, `produto_atributo_valor`, `kit_composicao` usam `criado_em`/`atualizado_em`; demais usam `created_at`/`updated_at` | HTTP 400 em consultas que misturam nomenclaturas |
| `.single()` em consultas de cliente | INTEGRAÇÃO | `AuthContext.tsx` e `Conta/dados/index.tsx` usam `.single()` que falha com 0 ou >1 registros | HTTP 406 em consultas de cliente |
| Referência `pedidop` em vez de `pedido` | FRONTEND | Checkout referencia tabela inexistente | Checkout não consegue criar pedidos |
| Fallback silencioso (`seguro()`) | FRONTEND | Repository usa `seguro()` que retorna `null` em caso de erro, escondendo falhas | Erros de integração não são visíveis |
| Storage `product-images` inconsistente | INTEGRAÇÃO | Bucket relatado como criado mas REST retorna `[]` | Upload de imagens pode falhar |
| Sem validação server-side de preço/estoque | REGRA_DE_NEGÓCIO | Checkout confia nos valores enviados pelo navegador | Risco de manipulação de preço/estoque |

### 1.2 Segurança

| Lacuna | Tipo | Descrição | Impacto |
|---|---|---|---|
| `is_admin()` usa `raw_user_meta_data` | SEGURANÇA | Metadados mutáveis pelo próprio usuário | Risco de auto-promoção a admin |
| Credencial DB exposta | SEGURANÇA | Senha em `.env` (raiz) e `test-direct.cjs` | Exposição de credencial administrativa |
| Sem auditoria de operações sensíveis | SEGURANÇA | Tabela `auditoria` existe mas uso não comprovado | Sem rastreabilidade de alterações |
| RLS não verificado end-to-end | SEGURANÇA | Policies existem mas testes de IDOR não comprovados | Risco de acesso não autorizado |

### 1.3 Funcionalidades incompletas

| Lacuna | Tipo | Descrição | Impacto |
|---|---|---|---|
| Admin CRUD incompleto | FRONTEND | Apenas produtos (lista + detalhe) implementados | Admin não consegue gerenciar catálogo completo |
| Sem integração de pagamento | INTEGRAÇÃO | Estrutura de `pagamento` existe mas sem provedor | Checkout não pode finalizar compra |
| Sem geração de PDF de orçamento | FRONTEND | Orçamento existe mas sem PDF | Funcionalidade de negócio não disponível |
| Carrinho não persistido no Supabase | INTEGRAÇÃO | Usa localStorage; persistência Supabase não confirmada | Carrinho perdido ao trocar de dispositivo |
| Favoritos não verificados | DADOS | `FavoritesContext` existe mas tabela não confirmada | Funcionalidade pode não funcionar |
| Atendimento dual (local + Supabase) | INTEGRAÇÃO | Dois repositórios (local e Supabase) | Inconsistência de dados |
| Sem testes E2E | FRONTEND | Validação manual apenas | Regressões não detectadas |
| Sem validação visual aprovada | FRONTEND | Cinema implementado mas não aprovado visualmente | Experiência não validada |

## 2. Decisões pendentes

### 2.1 Decisões arquiteturais (A1/A2/A3)

| Decisão | Status | Descrição | Dependência |
|---|---|---|---|
| A1 — Estratégia de identificação | FECHADA (condicional) | Preservar PKs/FKs bigint; usar `/produtos/:slug`; `auth_user_id` compatível com Supabase Auth; segurança via RLS | Gate 9 |
| A2 — Descrição estruturada | PENDENTE | Considerar opções registradas, recomendação da auditoria e conflito D1 vs EAV | A3 |
| A3 — Ledger × schema | PENDENTE | Reconciliar ledger com schema efetivo; esclarecer estado das migrations | Pré-requisito para Gate 10 |

### 2.2 Decisões de negócio (7 abertas)

| # | Decisão | Status | Descrição |
|---|---|---|---|
| 1 | Dark mode e tokens visuais | ABERTA | Definir se e como implementar |
| 2 | Correções pontuais ou refatoração do repository de orçamentos | ABERTA | Avaliar escopo |
| 3 | Substituição dos produtos fictícios por catálogo real | ABERTA | Depende de catálogo real |
| 4 | Escopo e prioridade do PDV | ABERTA | Definir se inclui PDV |
| 5 | Definição do domínio de mimos | ABERTA | Clarificar escopo |
| 6 | Operação atômica para descontos comerciais | ABERTA | Avaliar necessidade |
| 7 | Marca como entidade própria ou atributo do produto | ABERTA | Decisão de modelagem |

### 2.3 Decisões de segurança

| Decisão | Status | Descrição |
|---|---|---|
| Rotação de credencial DB | PENDENTE | Senha exposta em `.env` e `test-direct.cjs` |
| Correção de `is_admin()` | PENDENTE | Migrar de `raw_user_meta_data` para `app_metadata` |
| Auditoria de RLS/IDOR | PENDENTE | Testes end-to-end não comprovados |

## 3. Sequência recomendada de implementação

1. **Corrigir bugs de integração** (nomenclatura, `.single()`, `pedidop`) — frontend only
2. **Verificar estado real do Storage** `product-images`
3. **Executar seed de desenvolvimento** em ambiente isolado para testar fluxos
4. **Implementar validação server-side** de preço/estoque no checkout
5. **Completar admin CRUD** para produtos, categorias, estoque
6. **Implementar integração de pagamento** real
7. **Validar fluxo completo** no navegador (desktop + mobile)
8. **Auditar segurança** (RLS, IDOR, `is_admin()`)
9. **Reconciliar A2/A3** (descrição estruturada, ledger×schema)
10. **Preparar deploy** e domínio público

## 4. Restrições vigentes

- Não alterar schema, migrations ou RLS sem autorização
- Não fazer commit, push, deploy ou reset sem autorização explícita
- Não expor credenciais ou dados pessoais
- Não criar dados fictícios para preencher interfaces
- Não considerar "tabela existente" como "funcionalidade operacional"
- Não considerar "build passou" como "teste aprovado"
- Não considerar "arquivo criado" como "implementação concluída"
