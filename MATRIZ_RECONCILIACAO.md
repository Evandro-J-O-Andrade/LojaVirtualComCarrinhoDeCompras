# Matriz de Reconciliação Funcional — Angel Cosméticos

## 1. Domínios e status

| Domínio | Repositório Supabase | Páginas Admin | Páginas Públicas | Status |
|---------|---------------------|---------------|------------------|--------|
| Catálogo (Produtos) | ✅ produto.repository.supabase.ts | ✅ AdminProdutosPage, AdminCategoriasPage | ✅ ProductDetailPage, ProductsPage | Conectado |
| Fornecedores | ❌ não existe | ❌ | ❌ | Ausente |
| Compras (Pedidos de compra) | ❌ não existe | ❌ | ❌ | Ausente |
| Estoque | ❌ não existe | ❌ AdminEstoquePage (placeholder) | ❌ | Ausente |
| CMS (Páginas) | ✅ pagina.repository.supabase.ts | ✅ AdminPaginasPage | ✅ PaginaPublicaPage | Parcial |
| Mídia | ❌ (usa product-images bucket) | ✅ AdminMidiaPage (upload/list/delete) | ✅ via URLs | Parcial |
| Configurações | ❌ não existe | ✅ AdminConfiguracoesPage (UI only) | ❌ | Ausente (sem persistência) |
| Serviços | ✅ service.repository.supabase.ts | ✅ AdminServicosPage | ✅ ServiceDetailPage, ServicesPage | Parcial |
| Profissionais | ❌ (local only?) | ✅ AdminProfissionaisPage | ❌ | Parcial |
| Agendamentos | ✅ booking.repository.supabase.ts | ✅ AdminAgendamentosPage, AdminAgendaPage | ✅ BookingPage | Parcial |
| Clientes | ✅ cliente.repository.supabase.ts | ✅ AdminClientesPage | ✅ Conta pages | Parcial |
| Orçamentos | ✅ orcamento.repository.supabase.ts | ✅ AdminOrcamentosPage | ❌ | Parcial |
| Pedidos | ✅ pedido.repository.supabase.ts | ✅ AdminPedidosPage | ❌ | Parcial |
| Pagamentos | ✅ pagamento.repository.supabase.ts | ✅ AdminPagamentosPage | ❌ | Parcial |
| Atendimento | ✅ atendimento.repository (local only) | ✅ AdminAtendimentosPage | ❌ | Parcial (local) |
| Promoções | ❌ | ✅ AdminPromocoesPage | ❌ | Ausente |
| Kits | ❌ | ✅ AdminKitsPage (read-only) | ❌ | Parcial |
| Mimos | ✅ mimo.repository.supabase.ts | ✅ AdminMimosPage | ✅ MimosPage | Parcial |
| Experiências | ✅ experiencia.repository.supabase.ts | ✅ AdminExperienciasPage | ❌ | Parcial |
| Eventos | ❌ (read-only admin) | ✅ AdminEventosPage | ❌ | Parcial |
| Auditoria | ❌ (read-only admin) | ✅ AdminAuditoriaPage | ❌ | Parcial |

## 2. Tabelas existentes no Supabase (bmqxgibhuzekxpcgosap)

### Criadas pela migration 20261102000001
- pagina, pagina_secao, pagina_midia, pagina_bloco, pagina_revisao
- experiencia, experiencia_midia
- servico_categoria, servico_midia
- cliente_preferencia, cliente_interacao
- chamado, chamado_interacao
- automacao_execucao
- agendamento_status

### Pré-existentes (reconciliação anterior)
- produto, produto_imagem, produto_categoria
- produto_variante, produto_variante_atributo, produto_atributo, produto_atributo_valor
- estoque, estoque_movimentacao
- promocao, produto_opcao_compra, produto_opcao_valor, kit_composicao
- cliente, endereco
- carrinho, carrinho_item, pedido, pedido_status_historico, pagamento, frete_regra
- atendimento, atendimento_mensagem
- profissional, agenda, agenda_bloqueio, agendamento
- fornecedor (3 registros fictícios)
- mimo, mimo_regra
- orcamento, orcamento_item

## 3. Gaps críticos identificados

### Ausentes (sem tabela, sem repository, sem CRUD)
1. **Fornecedores** — tabela existe mas sem CRUD operacional
2. **Pedidos de compra** — não existe
3. **Recebimento de mercadorias** — não existe
4. **Estoque operacional** — tabelas existem mas sem CRUD de movimentação
5. **Configurações globais** — não existe tabela
6. **Media assets central** — não existe tabela (usa product-images bucket diretamente)
7. **Promoções CRUD** — tabela existe mas sem admin funcional
8. **Atendimento Supabase** — repository é local only

### Parciais (existem mas incompletos)
1. **CMS** — repository carrega seções/blocos/mídias, mas AdminPaginasPage precisa de editor visual completo
2. **Mídia** — upload funciona mas sem metadados persistentes, pastas, busca avançada
3. **Configurações** — UI existe mas sem persistência
4. **Serviços** — CRUD básico existe, falta galeria, SEO, CTA de agendamento
5. **Experiências** — CRUD básico, falta galeria, SEO, páginas públicas
6. **Clientes** — cadastro existe, falta endereços, preferências, histórico
7. **Agendamentos** — básico existe, falta calendário, conflitos, confirmação
8. **Orçamentos** — repository existe, falta UI completa
9. **Pedidos** — repository existe, falta UI completa

## 4. Ordem de execução (já aprovada)

| Fase | Entrega | Status |
|------|---------|--------|
| 1 | Auditoria do banco e frontend | ✅ Concluída |
| 2 | CMS e experiências | 🔄 Em progresso |
| 3 | Serviços | 🔄 Em progresso |
| 4 | Clientes | 🔄 Em progresso |
| 5 | Agendamentos | 🔄 Parcial |
| 6 | Central comercial | ❌ Não iniciado |
| 7 | Automações e integrações | ❌ Não iniciado |

## 5. Próximos passos recomendados

1. **Configurações** — criar tabela `configuracao_loja` (migration) e conectar AdminConfiguracoesPage
2. **Media assets** — criar tabela `media_asset` (migration) e conectar AdminMidiaPage com metadados
3. **CMS visual builder** — expandir AdminPaginasPage com editor de blocos, preview e publicação
4. **Serviços públicos** — enrich ServiceDetailPage com blocos CMS
5. **Experiências públicas** — criar página pública dinâmica
6. **Fornecedores/Estoque/Compras** — novas migrations + CRUD completo
7. **Agendamentos** — calendário, conflitos, confirmação
8. **Central comercial** — orçamentos, pedidos, pagamentos end-to-end
9. **Atendimento** — migrar de local para Supabase

## 6. Governança

- Banco remoto: `bmqxgibhuzekxpcgosap` (Angel Cosméticos)
- Nenhuma alteração estrutural sem autorização explícita
- Migration `20261102000001` aplicada e verificada
- GitHub: `main` at `837a4c4`
- Build: passando (24.63s)
- Testes: falhas preexistentes (auth, admin, dashboard contract tests)
