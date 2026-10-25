# ANGEL COSMÉTICOS — INVENTÁRIO DO PRODUTO

## 1. Escopo e método

Inventário read-only do produto Angel Cosméticos, consolidando o estado real do repositório, do frontend React e do Supabase remoto `bmqxgibhuzekxpcgosap`.

Nenhuma alteração de código, banco, migration, seed ou configuração foi realizada.

## 2. Frontend — rotas e páginas

### Rotas registradas (AppRouter.tsx)

| Rota | Arquivo | Tipo | Estado |
|---|---|---|---|
| `/` | `domains/home/pages/HomePage.tsx` | Página | Implementado (parcial) |
| `/produtos` | `domains/produtos/pages/ProductsPage.tsx` | Página | Implementado |
| `/produtos/:slug` | `domains/produtos/pages/ProductDetailPage.tsx` | Página | Implementado (Supabase real) |
| `/categorias` | `domains/produtos/pages/CategoriasPage.tsx` | Página | Implementado |
| `/categorias/:slug` | `domains/produtos/pages/CategoriaDetailPage.tsx` | Página | Implementado |
| `/carrinho` | `domains/carrinho/pages/CarrinhoPage.tsx` | Página | Implementado (localStorage) |
| `/checkout` | `domains/checkout/pages/CheckoutPage.tsx` | Página | Parcial |
| `/entrar` | `domains/conta/pages/EntrarPage.tsx` | Página | Implementado |
| `/conta` | `domains/conta/pages/ContaPage.tsx` | Página | Parcial |
| `/conta/perfil` | `domains/conta/pages/PerfilPage.tsx` | Página | Parcial |
| `/conta/pedidos` | `domains/conta/pages/PedidosPage.tsx` | Página | Parcial |
| `/conta/orcamentos` | `domains/conta/pages/OrcamentosPage.tsx` | Página | Parcial |
| `/conta/agendamentos` | `domains/conta/pages/AgendamentosPage.tsx` | Página | Parcial |
| `/conta/favoritos` | `domains/conta/pages/FavoritosPage.tsx` | Página | Parcial |
| `/conta/seguranca` | `domains/conta/pages/SegurancaPage.tsx` | Página | Parcial |
| `/sobre` | `domains/institucional/pages/SobrePage.tsx` | Página | Parcial |
| `/beleza` | `domains/institucional/pages/BelezaPage.tsx` | Página | Parcial |
| `/maquiagem` | `domains/institucional/pages/MaquiagemPage.tsx` | Página | Parcial |
| `/beleza/:slug` | `domains/institucional/pages/BelezaEditorialPage.tsx` | Página | Parcial |
| `/maquiagem/:slug` | `domains/institucional/pages/MaquiagemEditorialPage.tsx` | Página | Parcial |
| `/contato` | `domains/atendimento/pages/ContatoPage.tsx` | Página | Parcial |
| `/atendimento` | `domains/atendimento/pages/AtendimentoPage.tsx` | Página | Parcial |
| `/experiencias` | `domains/conteudo/pages/ExperienciasPage.tsx` | Página | Parcial |
| `/experiencias/:slug` | `domains/conteudo/pages/ExperienciaDetailPage.tsx` | Página | Parcial |
| `/orcamentos/novo` | `domains/orcamentos/pages/NovoOrcamentoPage.tsx` | Página | Parcial |
| `/diagnostico` | `pages/Diagnostico/index.tsx` | Página | Diagnóstico |
| `/admin/login` | `pages/Admin/Login/index.tsx` | Página | Implementado |
| `/admin` | `domains/admin/pages/DashboardPage.tsx` | Página | Parcial |
| `/admin/produtos` | `domains/admin/pages/AdminProdutosPage.tsx` | Página | Parcial |
| `/admin/produtos/:id` | `domains/admin/pages/AdminProdutoDetalhePage.tsx` | Página | Parcial |
| `/mimos` | `domains/mimos/pages/MimosPage.tsx` | Página | Parcial |
| `/mimos/:slug` | `domains/mimos/pages/MimoDetailPage.tsx` | Página | Parcial |
| `/servicos` | `domains/services/pages/ServicesPage.tsx` | Página | Parcial |
| `/servicos/:slug` | `domains/services/pages/ServiceDetailPage.tsx` | Página | Parcial |
| `/agendamento` | `domains/booking/pages/BookingPage.tsx` | Página | Parcial |

### Domínios não conectados ao AppRouter (existem mas não registrados)

- `domains/carrinho` — CarrinhoPage existe mas não está em AppRouter (carregado via lazy em AppRouter como `/carrinho`)
- `domains/checkout` — CheckoutPage carregado via lazy

### Componentes compartilhados

- `Header.tsx`, `Footer.tsx`, `Layout.tsx`, `MobileNav.tsx` — estrutura compartilhada
- `ProductCard.tsx`, `ProductGallery.tsx`, `ProductVariants.tsx`, `ProductPrice.tsx`, `ProductImagem.tsx`, `ProductLightbox.tsx`
- `CartDrawer.tsx` — mini-cart
- `CinematicIntro.tsx` — intro cinematográfica
- `ErrorBoundary.tsx`, `ErrorState.tsx`, `LoadingGrid.tsx`

### Contexts

- `AuthContext.tsx` — autenticação Supabase
- `AccountContext.tsx` — conta do cliente
- `CarrinhoProvider.tsx` — carrinho (localStorage + Supabase)
- `FavoritesContext.tsx` — favoritos
- `AdminPermissionContext.tsx` — permissões admin

### Repositories / Services Supabase

- `produto.repository.supabase.ts` — produtos, categorias, variantes, imagens, promoções, estoque
- `mimo.repository.supabase.ts` — mimos diários
- `orcamento.repository.supabase.ts` — orçamentos
- `pedido.repository.supabase.ts` — pedidos
- `pagamento.repository.supabase.ts` — pagamentos
- `atendimento.repository.supabase.ts` / `.local.ts` — atendimento
- `booking.repository.supabase.ts` — agendamentos
- `service.repository.supabase.ts` — serviços
- `produtoImagem.service.ts` — upload de imagens

## 3. Supabase — schema remoto

### Tabelas existentes (conforme migrations e relatórios)

| Tabela | Origem | RLS | Status |
|---|---|---|---|
| `categoria` | base_schema | Sim | Existente |
| `fornecedor` | base_schema | Sim | Existente |
| `produto` | base_schema | Sim | Existente |
| `produto_imagem` | base_schema | Sim | Existente |
| `produto_categoria` | base_schema | Sim | Existente |
| `produto_opcao_compra` | base_schema | Sim | Existente |
| `produto_opcao_valor` | base_schema | Sim | Existente |
| `promocao` | base_schema | Sim | Existente |
| `produto_atributo` | base_schema | Sim | Existente |
| `produto_atributo_valor` | base_schema | Sim | Existente |
| `produto_variante` | base_schema | Sim | Existente |
| `produto_variante_atributo` | base_schema | Sim | Existente |
| `kit_composicao` | base_schema | Sim | Existente |
| `cliente` | base_schema | Sim | Existente |
| `endereco` | base_schema | Sim | Existente |
| `carrinho` | base_schema | Sim | Existente |
| `carrinho_item` | base_schema | Sim | Existente |
| `frete_regra` | base_schema | Sim | Existente |
| `pedido` | base_schema | Sim | Existente |
| `pedido_item` | base_schema | Sim | Existente |
| `pagamento` | base_schema | Sim | Existente |
| `pedido_status_historico` | base_schema | Sim | Existente |
| `estoque` | base_schema | Sim | Existente |
| `estoque_movimentacao` | base_schema | Sim | Existente |
| `atendimento` | base_schema | Sim | Existente |
| `atendimento_mensagem` | base_schema | Sim | Existente |
| `evento` | base_schema | Sim | Existente |
| `auditoria` | base_schema | Sim | Existente |
| `mimo` | 20261003000005 | Sim | Existente |
| `mimo_produto` | 20261003000005 | Sim | Existente |
| `orcamento` | 20261003000002 | Sim | Existente |
| `orcamento_item` | 20261003000002 | Sim | Existente |
| `desconto_comercial` | 20261003000002 | Sim | Existente |
| `condicao_pagamento` | 20261003000002 | Sim | Existente |
| `servico` | 20261003000003 | Sim | Existente |
| `agendamento` | 20261003000003 | Sim | Existente |
| `notificacao` | 20261003000004 | Sim | Existente |
| `notificacao_evento` | 20261003000004 | Sim | Existente |

### Colunas relevantes

- `produto`: `id, nome, slug, descricao, preco_base, fornecedor_id, ativo, created_at, updated_at`
- `produto_opcao_compra`: `criado_em, atualizado_em` (nomenclatura inconsistente com `produto`)
- `produto_atributo_valor`: `criado_em` (nomenclatura inconsistente)
- `kit_composicao`: `criado_em, atualizado_em` (nomenclatura inconsistente)
- `produto_imagem`: `id, produto_id, url, ordem, principal, created_at, updated_at`

### Nota sobre nomenclatura

As tabelas `produto`, `categoria`, `fornecedor`, `promocao`, `produto_variante` usam `created_at`/`updated_at`. As tabelas `produto_opcao_compra`, `produto_opcao_valor`, `produto_atributo_valor`, `kit_composicao` usam `criado_em`/`atualizado_em`. Esta inconsistência foi identificada como causa do HTTP 400 em consultas que misturavam as duas nomenclaturas.

## 4. Seeds e catálogo

### Arquivos de seed localizados

| Arquivo | Tipo | Conteúdo | Status |
|---|---|---|---|
| `seed-dev.sql` | SQL | 12 produtos, 3 fornecedores, 6 categorias | Dev only, marcado como não produção |
| `supabase/seeds/20261015_angel_catalogo_seed_v2.sql` | SQL | 60 produtos rascunho (ativo=false, preco_base=0), 7 categorias | Rascunho inativo, sem imagens |
| `assets/sql/angelcosmeticos_*.sql` | SQL | Dados legados (produtos, categorias, estoque, pedidos, etc.) | Legado MySQL/PHP |
| `supabase-backup-*.sql` | SQL | Backups do schema remoto | Backup |
| `temp_*.sql` | SQL | Schemas temporários remotos | Temporário |

### Seeds de desenvolvimento

- `seed-dev.sql`: 12 produtos reais (Batom, Base, Máscara, Sabonete, Esmalte, etc.) com fornecedores e categorias. Marcado como "NAO usar em producao".
- `20261015_angel_catalogo_seed_v2.sql`: 60 produtos rascunho (ativo=false, preco_base=0) para Mary Kay, categorias existentes, sem imagens. Marcado como rascunho inativo.

### Dados legados

- `assets/sql/` contém scripts MySQL para: cadastro, carrinho, categorias/produtos, endereços, estoque, fornecedores, histórico de compras, pedidos, promoções, rotinas, usuários.
- Estes são dados do sistema legado (PHP/MySQL) e não devem ser importados diretamente.

## 5. Matriz de reconciliação

| Domínio | Requisito | Evidência Frontend | Evidência Banco | Integração | Estado Funcional | Dados | Lacuna | Ação |
|---|---|---|---|---|---|---|---|---|
| Mimos Diários | Conteúdo, produtos relacionados, validade, administração | `mimo.repository.supabase.ts` — queries reais | Tabelas `mimo`, `mimo_produto` | Parcial (`.single()` sem `.maybeSingle()`) | PARCIAL | Desconhecido | Sem seed confirmado; sem admin CRUD | Verificar dados remotos; implementar admin |
| Produtos | Cadastro, detalhe, imagens, persistência | `produto.repository.supabase.ts` — queries reais com fallbacks | Tabelas `produto`, `produto_imagem`, etc. | Parcial (fallback silencioso em `seguro()`) | PARCIAL | Seed dev (12 produtos) | Queries com nomenclatura inconsistente; fallbacks escondem erros | Corrigir queries; remover fallbacks silenciosos |
| Categorias | Relações reais com produtos | `listCategorias()` — query real | `categoria`, `produto_categoria` | Implementado | PARCIAL | Seed dev (6 categorias) | Sem admin CRUD de categorias | Implementar admin CRUD |
| Preços | Fonte, atualização, validação comercial | `preco_base` do produto, `preco` da variante | Colunas `preco_base`, `preco` | Implementado | PARCIAL | Seed dev | Sem validação server-side no checkout | Implementar revalidação |
| Promoções | Regras, validade, cálculo | `buscarPromocoes()` — query real | `promocao` | Implementado | PARCIAL | Sem dados confirmados | Sem admin CRUD; validade não testada | Implementar admin + testes |
| Pagamentos | Métodos e integração efetiva | `pagamento.repository.supabase.ts` | `pagamento` | Não verificado | AUSENTE | N/A | Sem provedor real | Integrar provedor |
| Carrinho | Persistência e cálculo | `CarrinhoProvider` — localStorage + Supabase | `carrinho`, `carrinho_item` | Parcial (merge não confirmado) | PARCIAL | localStorage | Persistência Supabase não confirmada | Testar fluxo completo |
| Favoritos | Persistência e associação | `FavoritesContext` | Não verificado | Não verificado | NÃO VERIFICADO | N/A | Tabela não confirmada | Verificar schema remoto |
| Pedidos | Criação, itens, estados, histórico | `pedido.repository.supabase.ts` | `pedido`, `pedido_item`, `pedido_status_historico` | Parcial | PARCIAL | Sem dados confirmados | `pedidop` bug; checkout incompleto | Corrigir referência; completar fluxo |
| Clientes | Cadastro, auth, endereços | `AuthContext`, `AccountContext` | `cliente`, `endereco` | Parcial (`.single()` bug) | PARCIAL | Sem dados confirmados | `.single()` causa 406; fluxo Auth→perfil não confirmado | Corrigir query; testar fluxo |
| Atendimento | Persistência, mensagens, protocolo | `atendimento.repository.supabase.ts` | `atendimento`, `atendimento_mensagem` | Parcial | PARCIAL | Sem dados confirmados | Repositório local + Supabase (dual) | Unificar; testar fluxo |
| Administração | CRUD real, permissões, auditoria | `AdminProdutosPage`, `AdminProdutoDetalhePage` | RLS policies | Parcial | PARCIAL | N/A | Sem CRUD completo; sem auditoria | Implementar módulos restantes |

## 6. Classificação das lacunas

| Lacuna | Tipo | Descrição |
|---|---|---|
| Nomenclatura inconsistente (`criado_em` vs `created_at`) | SCHEMA | Causa HTTP 400 em consultas de produto |
| `.single()` em consultas que podem retornar 0 registros | INTEGRAÇÃO | Causa HTTP 406 em consultas de cliente |
| Referência `pedidop` em vez de `pedido` | FRONTEND | Checkout não consegue criar pedidos |
| Fallback silencioso (`seguro()`) | FRONTEND | Esconde erros de integração |
| Seeds não executados | DADOS | Banco vazio ou com dados parciais |
| Storage `product-images` inconsistente | INTEGRAÇÃO | Bucket relatado como criado mas REST retorna `[]` |
| `is_admin()` usa `raw_user_meta_data` | SEGURANÇA | Risco de auto-promoção |
| Credencial DB exposta em `.env` e `test-direct.cjs` | SEGURANÇA | Rotação pendente |
| Sem validação server-side de preço/estoque | REGRA_DE_NEGÓCIO | Checkout confia no frontend |
| Sem admin CRUD completo | FRONTEND | Admin parcial |
| Sem testes E2E | FRONTEND | Validação manual apenas |

## 7. Próximos passos recomendados

1. Corrigir as 3 bugs de integração identificados (nomenclatura, `.single()`, `pedidop`)
2. Verificar estado real do Storage `product-images`
3. Executar seed de desenvolvimento em ambiente isolado para testar fluxos
4. Implementar validação server-side de preço/estoque no checkout
5. Completar admin CRUD para produtos, categorias, estoque
6. Implementar integração de pagamento real
7. Validar fluxo completo no navegador (desktop + mobile)
8. Auditar segurança (RLS, IDOR, `is_admin()`)
9. Reconciliar A2/A3 (descrição estruturada, ledger×schema)
10. Preparar deploy e domínio público
