# ANGEL COSMÉTICOS — MATRIZ DE RECONCILIAÇÃO FRONTEND × SUPABASE

## 1. Método

Matriz read-only comparando o frontend React com o Supabase remoto `bmqxgibhuzekxpcgosap`. Cada linha distingue: existência de evidência no frontend, existência de evidência no banco, integração efetiva, estado funcional, tipo de dados e lacuna.

## 2. Matriz completa

| Domínio | Requisito | Evidência Frontend | Evidência Banco | Integração Efetiva | Estado Funcional | Dados | Lacuna | Ação Recomendada |
|---|---|---|---|---|---|---|---|---|
| Mimos Diários | Conteúdo editorial | `mimo.repository.supabase.ts` — queries reais | Tabelas `mimo`, `mimo_produto` | Parcial (`.single()` sem `.maybeSingle()`) | PARCIAL | Desconhecido | Sem seed confirmado; sem admin CRUD | Verificar dados remotos; implementar admin |
| Mimos Diários | Produtos relacionados | `buscarProdutosVinculados()` — query real | `mimo_produto` (FK) | Implementado | PARCIAL | Desconhecido | Sem validação de composição | Testar fluxo completo |
| Mimos Diários | Validade | `hojeISODate()` check no repository | `ativo`, `inicio`, `fim` | Implementado | PARCIAL | Desconhecido | Sem dados reais para testar | Verificar dados remotos |
| Mimos Diários | Administração | Ausente | RLS policies | N/A | AUSENTE | N/A | Sem CRUD admin | Implementar admin CRUD |
| Produtos | Cadastro | `AdminProdutosPage.tsx` — parcial | Tabela `produto` | Parcial | PARCIAL | Seed dev (12) | Sem CRUD completo | Implementar admin CRUD |
| Produtos | Detalhe | `ProductDetailPage.tsx` — Supabase real | Tabela `produto` | Implementado (com fallbacks) | PARCIAL | Seed dev | Fallback silencioso esconde erros | Remover fallbacks; testar |
| Produtos | Imagens | `ProdutoGaleria.tsx`, `ProdutoImagem.tsx` | `produto_imagem` | Implementado | PARCIAL | Sem dados confirmados | Storage inconsistente | Resolver Storage; testar upload |
| Produtos | Persistência | `produto.repository.supabase.ts` | Tabelas relacionadas | Implementado | PARCIAL | Seed dev | Queries com nomenclatura inconsistente | Corrigir `criado_em`→`created_at` |
| Categorias | Relações reais | `listCategorias()` — query real | `categoria`, `produto_categoria` | Implementado | PARCIAL | Seed dev (6) | Sem admin CRUD | Implementar admin CRUD |
| Preços | Fonte | `preco_base` do produto, `preco` da variante | Colunas `preco_base`, `preco` | Implementado | PARCIAL | Seed dev | Sem validação server-side | Implementar revalidação no checkout |
| Preços | Atualização | Admin parcial | Tabelas | Parcial | PARCIAL | N/A | Sem CRUD completo | Completar admin |
| Preços | Validação comercial | Ausente server-side | N/A | N/A | AUSENTE | N/A | Checkout confia no frontend | Implementar Edge Function/validação |
| Promoções | Regras | `buscarPromocoes()` — query real | `promocao` | Implementado | PARCIAL | Sem dados confirmados | Sem admin CRUD | Implementar admin + testes |
| Promoções | Validade | `ativo`, `data_inicio`, `data_fim` | Colunas correspondentes | Implementado | PARCIAL | Sem dados | Sem dados para testar | Inserir dados de teste |
| Promoções | Cálculo | Frontend only | N/A | Não implementado | AUSENTE | N/A | Sem cálculo server-side | Implementar validação |
| Pagamentos | Métodos disponíveis | `pagamento.repository.supabase.ts` | `pagamento` | Não verificado | AUSENTE | N/A | Sem provedor real | Integrar provedor |
| Pagamentos | Integração efetiva | Ausente | Tabela existe | N/A | AUSENTE | N/A | Sem gateway | Integrar gateway real |
| Carrinho | Persistência | `CarrinhoProvider` — localStorage + Supabase | `carrinho`, `carrinho_item` | Parcial (merge não confirmado) | PARCIAL | localStorage | Persistência Supabase não confirmada | Testar fluxo completo |
| Carrinho | Cálculo consistente | Frontend only | N/A | Não implementado | PARCIAL | N/A | Sem validação server-side | Implementar revalidação |
| Favoritos | Persistência | `FavoritesContext` | Não verificado | NÃO VERIFICADO | NÃO VERIFICADO | N/A | Tabela não confirmada | Verificar schema remoto |
| Favoritos | Associação ao usuário | `FavoritesContext` | Não verificado | NÃO VERIFICADO | NÃO VERIFICADO | N/A | Sem evidência | Verificar e implementar |
| Pedidos | Criação | `pedido.repository.supabase.ts` | `pedido` | Parcial (`pedidop` bug) | PARCIAL | Sem dados | Referência `pedidop` incorreta | Corrigir para `pedido` |
| Pedidos | Itens | `pedido_item` | Tabela existe | Parcial | PARCIAL | Sem dados | Sem dados para testar | Inserir dados de teste |
| Pedidos | Estados | `pedido_status_historico` | Tabela existe | Parcial | PARCIAL | Sem dados | Sem fluxo completo | Implementar fluxo |
| Pedidos | Histórico | `pedido_status_historico` | Tabela existe | Parcial | PARCIAL | Sem dados | Sem implementação completa | Implementar |
| Clientes | Cadastro | `EntrarPage.tsx`, `AuthContext` | `cliente` | Parcial (`.single()` bug) | PARCIAL | Sem dados | `.single()` causa 406 | Corrigir para `.maybeSingle()` |
| Clientes | Autenticação | `AuthContext.tsx` — Supabase Auth | `auth.users` | Implementado | PARCIAL | Sem dados | Fluxo Auth→perfil não confirmado | Testar fluxo completo |
| Clientes | Endereços | `PerfilPage.tsx` | `endereco` | Parcial | PARCIAL | Sem dados | Sem CRUD completo | Implementar CRUD |
| Atendimento | Persistência | `atendimento.repository.supabase.ts` | `atendimento` | Parcial | PARCIAL | Sem dados | Dual (local + Supabase) | Unificar repositório |
| Atendimento | Mensagens | `atendimento_mensagem` | Tabela existe | Parcial | PARCIAL | Sem dados | Sem fluxo completo | Implementar fluxo |
| Atendimento | Protocolo | Ausente | N/A | N/A | AUSENTE | N/A | Sem geração de protocolo | Implementar |
| Administração | CRUD real | `AdminProdutosPage.tsx` — parcial | RLS policies | Parcial | PARCIAL | N/A | Sem CRUD completo | Implementar módulos |
| Administração | Permissões | `AdminPermissionContext.tsx` | RLS | Parcial | PARCIAL | N/A | `is_admin()` usa `raw_user_meta_data` | Corrigir para `app_metadata` |
| Administração | Auditoria | `auditoria` | Tabela existe | Não verificado | NÃO VERIFICADO | N/A | Sem evidência de uso | Verificar implementação |
| Eventos | Conteúdo editorial | `ExperienciasPage.tsx` | `evento` | Parcial | PARCIAL | Sem dados | Tabela `evento` vs conteúdo legado | Reconciliar |
| Orçamentos | Criação | `NovoOrcamentoPage.tsx` | `orcamento` | Parcial | PARCIAL | Sem dados | Sem validação | Testar fluxo |
| Orçamentos | PDF | Ausente | N/A | N/A | AUSENTE | N/A | Sem geração de PDF | Implementar |
| Mimos | Administração | Ausente | RLS | N/A | AUSENTE | N/A | Sem CRUD admin | Implementar |
| Storage | Upload | `ProdutoImagemUpload.tsx` | Bucket `product-images` | Inconsistente | CONFLITO | N/A | Bucket relatado como criado mas REST retorna `[]` | Resolver inconsistência |
| Cinema/Home | Identidade visual | `CinematicIntro.tsx`, `HeroCinematico.tsx` | N/A | Implementado (visual) | PARCIAL | N/A | Sem validação visual aprovada | Testar desktop/mobile |

## 3. Resumo de estados

| Estado | Quantidade | Domínios |
|---|---|---|
| IMPLEMENTADO | 0 | Nenhum completamente implementado e validado |
| PARCIAL | 24 | Maioria dos domínios |
| AUSENTE | 6 | Pagamentos, favoritos (não verificado), protocolo, admin CRUD, PDF, mimos admin |
| NÃO VERIFICADO | 2 | Favoritos, auditoria |
| CONFLITO | 1 | Storage product-images |
| MOCK | 0 | Nenhum mock identificado (fallbacks silenciosos presentes) |

## 4. Lacunas críticas (bloqueiam produção)

1. **Nomenclatura inconsistente** — `criado_em` vs `created_at` causa HTTP 400
2. **`.single()` em consultas de cliente** — causa HTTP 406
3. **Referência `pedidop`** — checkout não cria pedidos
4. **Fallback silencioso (`seguro()`)** — esconde erros de integração
5. **Storage inconsistente** — bucket relatado como criado mas REST retorna `[]`
6. **Sem validação server-side** — checkout confia no frontend para preço/estoque
7. **`is_admin()` vulnerável** — usa `raw_user_meta_data` mutável
8. **Credencial DB exposta** — rotação pendente
9. **Sem seed executado** — banco vazio ou com dados parciais
10. **Sem testes E2E** — validação manual apenas
