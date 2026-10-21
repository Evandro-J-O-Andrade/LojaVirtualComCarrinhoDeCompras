## DECISÃO 1 — Atributos de Variante
**Escolha:** E) Atributos livres (dinâmicos)
**Justificativa:** Todos esses são essenciais — tamanho, cor, volume/ml e outros atributos conforme necessidade do produto
**Impacto técnico:** Modelo flexível com tabela `produto_variante` + `variante_atributo` (EAV) ou JSONB para atributos dinâmicos por variante
**Data:** 2026-09-13
**Decisor:** Negócio

## DECISÃO 2 — Variante Altera Preço?
**Escolha:** A) Sim — variante tem preço próprio
**Justificativa:** Cada combinação de atributos (tamanho/cor/volume) pode ter preço diferente
**Impacto técnico:** `produto_variante.preco` obrigatório (decimal(10,2)); resolvePrice() consulta variante primeiro
**Data:** 2026-09-13
**Decisor:** Negócio

## DECISÃO 3 — Promoções
**Escolha:** 3a) A) Sim — herda | 3b) B) Não | 3c) C) Ambos (tipo + valor)
**Justificativa:** Promoção no produto base aplica a todas as variantes; não há promoção por variante específica; suportar tanto % quanto R$ fixo
**Impacto técnico:** `produtos_promocao` ganha colunas `tipo_desconto` (enum 'percentual'|'fixo') e `valor_desconto`; herança via resolvePrice() aplica promoção do produto base se variante não tiver promoção própria
**Data:** 2026-09-13
**Decisor:** Negócio

## DECISÃO 4 — Estoque
**Escolha:** C) Misto (híbrido)
**Justificativa:** Produto simples (sem variantes) usa estoque no nível do produto; produto com variantes usa estoque por variante (cada combinação de atributos é um SKU distinto)
**Impacto técnico:** `estoque` ganha `variante_id` nullable (FK → produto_variante); unique constraint (produto_id, variante_id); trigger/application logic garante: se produto tem variantes → estoque obrigatório por variante; se não tem → estoque no produto (variante_id = NULL)
**Data:** 2026-09-13
**Decisor:** Negócio (proposta técnica aceita)

## DECISÃO 5 — Frete
**Escolha:** C) Tabela admin configurável + D) Integração transportadora (fase 2)
**Justificativa:** Valores atuais (A/B) são hardcoded mock sem persistência; fase 1 = tabela de frete por CEP/região gerenciável no admin; fase 2 = integração Correios/Jadlog/outros para cálculo real
**Impacto técnico:** Nova tabela `frete_regra` (cep_inicio, cep_fim, uf, regiao, valor, tipo 'fixo'|'por_kg'|'percentual', ativo); API `GET /api/frete?cep=...&subtotal=...`; fase 2 adiciona adaptador para Correios/Jadlog
**Data:** 2026-09-13
**Decisor:** Negócio

## DECISÃO 6 — Formas de Pagamento
**Escolha:** E) Todas + pagamento na entrega
**Justificativa:** WhatsApp (atual) + PIX (QR Code dinâmico) + Cartão (gateway: Mercado Pago/Stripe/Asaas) + Boleto + Pagamento na entrega (regiões específicas)
**Impacto técnico:** Múltiplos gateways; webhooks para confirmação; `pedidos` ganha `metodo_pagamento` enum + `status_pagamento` (pendente, aprovado, recusado, estornado); pagamento na entrega = status `aguardando_entrega` + validação regional
**Data:** 2026-09-13
**Decisor:** Negócio

## DECISÃO 7 — WhatsApp Gera Pedido no Sistema
**Escolha:** B + C + D (progressivo: rascunho → confirmado + webhook)
**Justificativa:** Não quer opção A (zero automação); deseja fluxo completo: cria pedido rascunho com nº → confirma + baixa estoque + registra histórico → envia webhook para CRM/WhatsApp Business API
**Impacto técnico:** `POST /api/orders` com `origem: 'whatsapp'`; status inicial `rascunho_whatsapp` → `confirmado` (após validação vendedor); transação atômica: pedido + itens + baixa estoque + historico_compras; webhook assíncrono para CRM
**Data:** 2026-09-13
**Decisor:** Negócio

## DECISÃO 8 — Compra pelo Site Exige Cadastro?
**Escolha:** C) Híbrido
**Justificativa:** Logado usa endereço salvo; não logado preenche e-mail + endereço na hora; ambos criam pedido vinculado a usuário (cria usuário lazy se não existir)
**Impacto técnico:** Checkout aceita `usuario_id` opcional; se não logado → cria `usuarios` com e-mail + nome mínimo + senha aleatória (ou magic link); `enderecos` criado/atualizado; `pedidos.usuario_id` sempre preenchido
**Data:** 2026-09-13
**Decisor:** Negócio

## DECISÃO 9 — Endereço Obrigatório por Modalidade
**Escolha:** 9a) A) Sim (com ViaCEP auto-fill) | 9b) A) Sim (com ViaCEP auto-fill antes de abrir WhatsApp)
**Justificativa:** Em ambas modalidades, CEP é obrigatório e ViaCEP preenche logradouro/bairro/cidade/UF automaticamente; usuário só completa número/complemento; endereço completo estruturado salvo em `enderecos` e referenciado no `pedidos.endereco_entrega_id`
**Impacto técnico:** Checkout (site e WhatsApp) exige CEP → `GET /api/cep/{cep}` proxy ViaCEP → preenche campos → validação de número obrigatório → cria/atualiza `enderecos` → `pedidos.endereco_entrega_id` NOT NULL
**Data:** 2026-09-13
**Decisor:** Negócio

---

## DECISÃO 11 — Backend Arquitetura
**Escolha:** A) Supabase (PostgreSQL + Auth + Storage + Edge Functions)
**Justificativa:** Supabase forneece PostgreSQL, autenticação, storage e edge functions em uma plataforma gerenciada, mapeando diretamente ao modelo de domínio já definido no CONTRATO_DOMINIO_COMERCIAL_v1.0
**Impacto técnico:** `supabase/supabase-js` v2; schema Postgres (não MySQL); Edge Functions para webhooks de pagamento e WhatsApp
**Data:** 2026-09-13
**Decisor:** Negócio

## DECISÃO 12 — Migração de Dados Legados
**Escolha:** A) Migrar (MySQL dump → Supabase Postgres + CSV backup de segurança)
**Justificativa:** Preservar usuários, pedidos e produtos existentes evita perda de histórico e dados de clientes
**Impacto técnico:** Script ETL: exportar MySQL dump → transformar schema → importar para Postgres; backup CSV paralelo antes da migração
**Data:** 2026-09-13
**Decisor:** Negócio

## DECISÃO 13 — Carrinho Canônico
**Escolha:** C) Novo módulo (baseado no `CartItem` do CONTRATO §4.1, não em nenhuma das 7 implementações existentes)
**Justificativa:** Nenhuma das 7 implementações suporta variantes + SKU + sync backend; o contrato já define a interface, então implementar do zero é mais limpo que adaptar código legacy
**Impacto técnico:** `useCart()` hook + `CartContext`; localStorage para fase 1, Supabase sync para fase 2
**Data:** 2026-09-13
**Decisor:** Negócio

## DECISÃO 14 — Armazenamento de Imagens
**Escolha:** A) Supabase Storage buckets
**Justificativa:** Integração nativa com Supabase; `produto_imagens` table referencia URLs de storage bucket; controle de acesso e CDN
**Impacto técnico:** Bucket `produto-imagens`; colunas `produto_imagens.url` apontando para storage; migração de `/assets/img/` para bucket
**Data:** 2026-09-13
**Decisor:** Negócio

## DECISÃO 15 — Handoff do Chatbot para Humano
**Escolha:** A) Keyword trigger (palavras-chave: "falar com atendente", "humano", "atendente real", "WhatsApp")
**Justificativa:** Simples, determinístico, fácil de ajustar com base no feedback real; evita transferências indesejadas por timer
**Impacto tecnico:** `chatbot.js` detecta keywords → exibe botão "Conversar com atendente no WhatsApp" → abre `wa.me/5511963205776`
**Data:** 2026-09-13
**Decisor:** Negócio

## DECISÃO 16 — E-mail Transacional
**Escolha:** A) SendGrid
**Justificativa:** 100 emails/dia grátis, integração direta com Supabase via Edge Functions, bem documentado
**Impacto técnico:** API key no `.env`; Edge Function envia confirmação de pedido/após pagamento/estoque baixo
**Data:** 2026-09-13
**Decisor:** Negócio

## DECISÃO 17 — PWA
**Escolha:** A) Full PWA
**Justificativa:** Site já tem manifest + favicon parciais; PWA completo adiciona offline cart, instalação e notificações push para promotions
**Impacto técnico:** Vite PWA plugin (`vite-plugin-pwa`); service worker; cache estratégico para assets + cart em IndexedDB
**Data:** 2026-09-13
**Decisor:** Negócio

## DECISÃO 18 — SEO Cleanup
**Escolha:** A) Immediate cleanup
**Justificativa:** Problemas críticos (canonical .com.br, 5 meta descriptions duplicadas, robots.txt bloqueando páginas) afetam indexação hoje
**Impacto técnico:** Corrigir canonical para `.netlify.app`, consolidar meta descriptions, ajustar robots.txt para permitir /carrinho/ e /conta/
**Data:** 2026-09-13
**Decisor:** Negócio

## DECISÃO 19 — Suporte Humano
**Escolha:** A) WhatsApp Business interno
**Justificativa:** Número 5511963205776 já usado em 6 páginas; não requer plataforma terceirizada no início
**Impacto técnico:** Mensagens do chatbot transfere para `wa.me/5511963205776` com contexto do carrinho
**Data:** 2026-09-13
**Decisor:** Negócio