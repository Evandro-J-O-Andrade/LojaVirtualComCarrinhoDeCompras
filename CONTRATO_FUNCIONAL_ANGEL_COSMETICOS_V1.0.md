# CONTRATO FUNCIONAL — ANGEL COSMÉTICOS v1.0

> **Status:** CONTRATO BASE — nada foi aplicado ao Supabase remoto com base neste documento.
> **Data:** 2026-10-03 · **Projeto:** Angel Cosméticos · **Supabase ref:** `bmqxgibhuzekxpcgosap`
> **Método de verificação:** cada linha marcada `[VERIFICADO]` foi conferida via REST/SQL somente leitura em 2026-10-03; `[LEGADO]` veio dos HTML em `assets/html/`; `[PROPOSTO]` é decisão de design, não fato.

---

## 0. Nada aplicado ainda

- A migration `supabase/migrations/20260920000002_angel_commerce_reconciliation.sql` é **DRAFT FOR HUMAN REVIEW — NÃO APLICADA** (cabeçalho próprio). Ela cria `orcamento` + `orcamento_item` e políticas RLS.
- `supabase/storage/product-images-policies.sql` é rascunho de políticas, **não aplicado**.
- Nenhuma migration, DDL, DML, seed, alteração de RLS ou Storage foi executada neste ciclo.
- **Regra de ouro:** qualquer coisa marcada `[PROPOSTO]` ou "gap" exige decisão humana antes de tocar no Supabase.

---

## 1. O que existe no site (frontend atual — `web/src/pages/`)

Públicas: `Home`, `Products` (listagem), `Product` (detalhe), `Carrinho`, `Checkout`, `Conta`, `Favoritos`, `Sobre`, `Contato`, `Atendimento`, `Diagnostico`, `Orcamento`.
Admin (`/admin*`, bypass do cinema): `Admin/index`, `Admin/Login`, `Admin/Produtos`, `Admin/Orcamentos`, `Admin/OrcamentoNovo`.

**Achado crítico `[VERIFICADO]`:** `Admin/Orcamentos/index.tsx:13` faz `.from('orcamento').select(...)`. Como `orcamento` **não existe no remoto** (§3), a página de Orçamentos do admin está **quebrada contra o banco real** hoje.

---

## 2. O que existe no legado (`assets/html/`)

- Páginas: `index`, `produtos`, `ver-produtos`, `eventos`, `empresa` (Sobre Nós), `contato`, `conta` (Minha Conta), `carrinho`, `completarCadastro`, `fornecedores`, `pdf`, `teste`.
- Navegação: Início · Produtos · Eventos · Sobre Nós · Contatos · Minha Conta · Carrinho.
- Home: hero "Transforme Sua Beleza com a Angel Cosméticos", blocos "Lançamento!" e "Promoção!", grade de produtos, CTA "Comprar Agora".
- **Não existe no legado:** programa de fidelidade, "Mimos", brindes, pontos, parcelamento, frete, pagamento, avaliações, e-mail, horário de atendimento.
- Contatos legados `[VERIFICADO]`: WhatsApp/telefone `+55-11-96320-5776`; endereço Viela Aristides de Oliveira, 130 — **Vila Júlia**, Poá/SP, CEP 08551-275; `facebook.com/angelcosmeticos`; `instagram.com/angelcosmeticos`.
- **Mapa legado (`empresa.html:235`) aponta para `-46,35, -23,52` — está ERRADO** (não corresponde a Poá/SP).

---

## 3. O que existe no banco (remoto, verificado via REST 2026-10-03)

**Com dados:** `produto` (13), `categoria` (7), `fornecedor` (3), `produto_variante` (1).
**Existe, vazio:** `produto_imagem` (0), `produto_categoria` (0), `promocao` (0) e ~19 tabelas restantes.
**NÃO existe (HTTP 404 PGRST205):** `orcamento`, `orcamento_item`.
**Storage:** bucket `product-images` (público, **vazio**).
**Função:** `is_admin()` existe (security definer, stable).

**Dados atuais são seed/teste:** fornecedores com CNPJs/telefones fictícios. `categoria` id=1 está defeituosa: `{"nome":"Esmalgue","slug":"esmalhe"}`.

**Contrato de 5 imagens sem fonte:** o esquema prevê até 5 imagens por produto (`produto_imagem`), mas a tabela está vazia e o bucket vazio — não há imagens reais para carregar.

---

## 4. O que existe nos seeds

**Nada.** `supabase/seeds/` está vazio/ausente. Todos os dados atuais entraram manualmente e são de teste.

---

## 5. O que já está aplicado vs. rascunho

| Item | Estado |
|---|---|
| 28 tabelas do `202609190101_base_schema.sql` | Aplicadas no remoto (existem) |
| `is_admin()`, bucket `product-images`, políticas de storage | Existem no remoto |
| `orcamento`, `orcamento_item` + RLS | **Rascunho — NÃO aplicado** |
| Policies `product-images-policies.sql` | **Rascunho — NÃO aplicado** |
| Seeds | Inexistentes |

---

## 6. O que está faltando (resumo)

Tabelas `orcamento`/`orcamento_item`; imagens de produto (0 no banco, 0 no bucket); seeds reais; frete (`frete_regra` vazia); estoque (`estoque` vazia); pagamento (`pagamento` vazia, sem gateway); "Mimos Diários" (não existe em lugar nenhum); e-mail e horário de atendimento (não existem no legado); mapa corrigido; dados reais de catálogo (preços atuais são históricos).

---

## 7. Produtos

- **O que é:** catálogo com variações (pele/valor), kits (`kit_composicao`), atributos, opções de compra, promoções.
- **Frontend é responsável por:** listagem, filtros, página de detalhe (zoom, lightbox, swipe, pinch-zoom, até 5 fotos), exibição de variantes e composição de kits.
- **Backend (Supabase) é responsável por:** `produto`, `produto_variante`, `produto_atributo(_valor)`, `produto_opcao_compra/valor`, `kit_composicao`, `promocao`, `produto_categoria` (link many-to-many).
- **Gaps:** `produto_imagem` vazia; `promocao` vazia; preços de catálogo são **HISTÓRICOS** (2024/2025); `categoria` id=1 defeituosa.

## 8. Mimos Diários

- **O que é:** `[PROPOSTO]` módulo novo de mimos/brindes diários. **Não existe no legado, nem no banco, nem no frontend.**
- **Frontend seria responsável por:** vitrine do mimo do dia, regras de resgate, estados de elegibilidade.
- **Backend seria responsável por:** entidade de mimo, estoque de mimos, registro de resgates, regras de frequência.
- **Gaps (tudo):** não há tabela, não há regra, não há definição. **Precisa de especificação antes de qualquer código.** Perguntas em aberto: o que é um "mimo", frequência (diário?), quem tem direito, como se resgata, há limite por cliente, esgota em estoque?

## 9. Clientes

- **O que é:** cadastro, endereços, conta, favoritos.
- **Frontend:** formulários de cadastro/completar cadastro, página `Conta`, `Favoritos` (local + sync quando autenticado).
- **Backend:** `cliente`, `endereco`, `carrinho`, `carrinho_item` (via `carrinho_item`), autenticação Supabase Auth.
- **Gaps:** `cliente`/`endereco`/`carrinho`/`carrinho_item` vazias; sem e-mail institucional definido.

## 10. Orçamentos

- **O que é:** solicitação de proposta (formulário `Orcamento` + admin `Orcamentos`/`OrcamentoNovo`).
- **Frontend:** formulário público; admin lista/filtra por `status` (`pendente`, `aprovado`).
- **Backend:** `orcamento` + `orcamento_item` + RLS (dono ou admin) — **definidos apenas no rascunho, não existem no remoto.**
- **Gap crítico `[VERIFICADO]`:** `orcamento` e `orcamento_item` retornam **404**. Aplicar a migration de reconciliação é pré-requisito para o admin de orçamentos funcionar.

## 11. Descontos

- **O que é:** `[PROPOSTO]` cupons/promocionais. `promocao` existe mas está **vazia**.
- **Frontend:** campo de cupom no carrinho/checkout (não implementado).
- **Backend:** `promocao` (existe, vazia).
- **Gaps:** sem dados, sem regras de validação, sem frontend de cupom.

## 12. Pagamentos

- **O que é:** fechamento de pedido. **Não existe integração nenhuma.**
- **Frontend:** `Checkout` (UI apenas).
- **Backend:** `pedido`, `pagamento`, `pedido_item`, `pedido_status_historico` (existem, **todos vazios**); `frete_regra` vazia.
- **Gaps:** sem gateway (Pix/cartão), sem parcelamento real, sem regras de frete, sem estoque. **Qualquer valor/parcela exibida hoje seria simulação — proibido.**

## 13. Atendimento

- **O que é:** suporte/protocolo (`Atendimento`) + tabelas de atendimento.
- **Frontend:** página `Atendimento` (protocolo/contato).
- **Backend:** `atendimento`, `atendimento_mensagem` (existem, vazias).
- **Gaps:** sem chat real, sem e-mail/horário (não existem no legado), tabelas vazias.

## 14. Imagens

- **O que é:** fotos de produto (até 5), patrimônio editorial.
- **Frontend:** galeria (zoom/lightbox/swipe/pinch).
- **Backend:** `produto_imagem` (vazia) + bucket `product-images` (público, vazio).
- **Gaps:** **zero imagens reais**; contrato de 5 imagens sem fonte. Não inventar imagens, datas de eventos ou metadados.

---

## 15. Fluxos comerciais (quem faz o quê)

1. **Catálogo → Produto:** Frontend lê `produto`/`categoria`/`produto_variante` (real); imagens bloqueadas (sem fonte).
2. **Carrinho:** Frontend (contexto local) → `carrinho`/`carrinho_item` só quando autenticado.
3. **Checkout → Pedido:** **BLOQUEADO PELO BACKEND** — `pedido`/`pagamento`/`frete_regra` vazios, sem gateway. Não simular.
4. **Orçamento:** Frontend `Orcamento` → `orcamento`/`orcamento_item` — **bloqueado até aplicar a migration (404 hoje).**
5. **Diagnóstico:** página `Diagnostico` é um **teste de conexão** (lê `produto`), não um fluxo comercial real.
6. **Atendimento:** protocolo/contato; chat real bloqueado (tabelas vazias).

## 16. Gaps de banco (exigem mudança no Supabase)

- Aplicar `orcamento`/`orcamento_item` (rascunho pronto).
- Criar tabelas para **Mimos Diários** (inexistentes).
- Popular `produto_imagem` + subir arquivos ao bucket `product-images`.
- Popular `promocao`, `frete_regra`, `estoque`, `cliente`, `pedido`... (todos vazios).
- Corrigir `categoria` id=1 (`Esmalgue`/`esmalhe`).
- Definir gateway de pagamento (não é só tabela — é integração externa).

## 17. Gaps de frontend

- Admin Orçamentos quebrado (404).
- Sem cupons, sem frete, sem parcelamento, sem pagamento real.
- `Diagnostico` é página de teste, não produto.
- Imagens de produto sem fonte.

## 18. Gaps de domínio

- Sem e-mail institucional e sem horário de atendimento (não existem no legado).
- Mapa com coordenadas erradas (`empresa.html:235`).
- Canonical/hosting/redirects 301 e otimização do vídeo de 4,2 MB pendentes.
- Identidade histórica (preto/dourado/púrpura) ainda sem auditoria; sem Dark Mode antes disso.

## 19. Arquitetura SaaS proposta `[PROPOSTO]`

- Direção: multi-tenant (loja única hoje; SaaS é evolução, não estado atual).
- Frontend (Next.js/React em `web/`) = apresentação, estado local (carrinho/favoritos), chamadas REST ao Supabase.
- Backend (Supabase) = dados, RLS por `cliente`/`is_admin()`, Storage, Auth.
- Nenhuma lógica comercial crítica (preço, estoque, pagamento) no frontend — tudo via backend.
- **Decisão em aberto:** se/Quando multi-tenant, modelo de tenant, e gateway de pagamento.

## 20. Decisões que precisam de você

1. Aplicar a migration `orcamento`/`orcamento_item`? (desbloqueia o admin de orçamentos)
2. Especificar **Mimos Diários**: regras, elegibilidade, estoque, frequência.
3. Fornecer imagens reais de produto (contrato de 5 imagens sem fonte).
4. Definir gateway de pagamento e regras de frete/parcelamento.
5. Confirmar e-mail e horário de atendimento (não existem no legado).
6. Corrigir coordenadas do mapa.
7. Aprovar preços atuais (os de catálogo são históricos).
8. Multi-tenant SaaS agora ou depois?

---

**Fim do contrato v1.0.** Este documento é o ponto de verificação antes de qualquer mudança no Supabase. Nada aqui autoriza aplicação automática — cada gap em §16–§20 exige decisão humana.
