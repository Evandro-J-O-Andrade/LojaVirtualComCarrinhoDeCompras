# Auditoria CRUD — Frontend × Supabase (Angel)

Modo: somente leitura. Nenhuma migration, política ou trigger foi alterado.

## 1. Repositórios e operações implementadas

| Domínio | Arquivo | Create | Read | Update | Delete | Observações |
|---|---|---|---|---|---|---|
| Produtos | `produto.repository.supabase.ts` | `createProduto` | `getProdutoBySlug`, `getProdutosRelacionados`, listar (via hook) | `updateProduto` | `deleteProduto` (verifica `.select('id')`, lança erro se 0 linhas) | Escrita bloqueada no frontend até RBAC validado |
| Serviços | `service.repository.supabase.ts` | `createService` | `getServiceBySlug` | `updateService` | `deleteService` | Depende de tabelas remotas confirmadas |
| Clientes | `cliente.repository.supabase.ts` | — (via auth signUp) | `buscarPorEmail`, `buscarPorId`, `listar`, `listarEnderecos` | `salvarEndereco` | `excluir` | Lacunas em vínculo `auth_user_id` |
| CMS/Páginas | `pagina.repository.supabase.ts` | — | `listar`, `buscarPorId`, `buscarPorSlug` | blocos (adicionar/remover) | `excluir`, `removerBloco`, `removerSecao`, `removerMidia` | Persistência precisa validação operação a operação |
| Experiências | `experiencia.repository.supabase.ts` | — | `listar`, `buscarPorId`, `buscarPorSlug` | — | `excluir`, `removerMidia` | Midia carregada com tratamento de erro |
| Categorias | (hook `useAdminCategorias`) | criar, editar, ativar/desativar | listar | — | não disponível | Exclusão não implementada |
| Mimos | `mimo.repository.supabase.ts` | — (read-only) | `getMimoBySlug`, buscar kit/produtos/promoção | — | — | CRUD administrativo ausente na matriz |
| Booking | `booking.repository.supabase.ts` | `createAppointment` | `getAvailability` | — | — | — |
| Orçamentos | `orcamento.repository.supabase.ts` | — | `getOrcamento` | — | — | — |
| Pagamentos | `pagamento.repository.supabase.ts` | — | — | — | — | Vazio (sem métodos) |
| Pedidos | `pedido.repository.supabase.ts` | — | — | — | — | Vazio (sem métodos) |

## 2. Mídias

| Recurso | Estado |
|---|---|
| `AdminMidiaPage` | Lista objetos do Storage (`product-images`), upload básico, exclusão via `window.confirm` |
| `MediaLibraryModal` | Incompleto: só mostra itens enviados na sessão, não carrega biblioteca existente, vídeos vão para bucket `site-media` (inexistente), imagens para `product-images` |
| `MediaPicker` reutilizável | Não existe |
| Confirmação de exclusão personalizada | Ainda usa `window.confirm` |
| Cadastro central de metadados | Não existe |

## 3. Permissões e autorização

| Componente | Estado |
|---|---|
| `AdminPermissionContext` | Consulta `is_admin()` RPC; estados distintos (`carregando`/`autorizado`/`negado`). `pode(acao)` não diferencia ações — sem granularidade por operação |
| RLS Storage `product-images` | A verificar (possível causa da falha de exclusão) |
| `site-media` bucket | Não existe |
| `user-avatars` bucket | Não existe (proposta não aplicada) |

## 4. Loading e feedback

| Nível | Estado |
|---|---|
| Página | Parcial (spinners em algumas telas) |
| Seção | Parcial |
| Ação | `ExclusaoFeedback` criado mas não integrado aos fluxos reais |
| Rollback visual | Não implementado |

## 5. Módulos sem CRUD funcional

- **Mimos**: CRUD administrativo não implementado.
- **Pagamentos/Pedidos**: repositórios vazios.
- **Categorias**: sem exclusão.
- **Produtos**: escrita bloqueada pendente RBAC.
- **Clientes**: lacunas em `auth_user_id`.
- **Configurações**: sem persistência (precisa migration).

## 6. Ordem de correção recomendada

1. Auditoria concluída (este documento).
2. Identidade/RBAC: resolver perfil, tenant e permissões granulares.
3. Biblioteca central: implementar `MediaPicker` (biblioteca + upload), exclusão segura com distinção desvincular/arquivar/excluir.
4. CRUDs por domínio: corrigir Create/Read/Update/Delete, feedback unificado, loading nos 3 níveis.
5. Validação: testes de sucesso, falha, permissão negada, rollback.