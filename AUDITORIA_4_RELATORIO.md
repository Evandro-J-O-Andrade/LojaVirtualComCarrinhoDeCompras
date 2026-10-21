# AUDITORIA 4 — INVENTARIO FUNCIONAL E MAPA DE SOBREVIVENCIA

## 1. Resumo executivo

**Projeto:** Angel Cosméticos (LojaVirtualComCarrinhoDeCompras)
**Branch:** main | **Producao:** https://angelcosmeticos.netlify.app/ | **Chat:** https://angel-cosmeticos.onrender.com/
**Data:** 2026-09-13

**Diagnostico sintetico:**
- 13 paginas HTML, 24+ arquivos JS, 21 PHP, 16 schemas SQL
- 6+ implementacoes concorrentes de carrinho
- 3 implementacoes conflitantes de checkout
- 2 implementacoes de chatbot (duplicadas)
- Checkout atual: 100% simulado (alert + PDF, zero persistencia de pedido)
- Pedido no banco: incompleto (sem itens_pedido)
- Estoque: nao transacional no fluxo de compra
- PHP/MySQL: nao executado no Netlify

**O que funciona:** Catalogo estatico, navegacao, chatbot (depende Render), WhatsApp links, SEO parcial.
**O que esta quebrado:** Carrinho (dados inconsistentes entre paginas), Checkout (sem persistencia), Login JS incompleto, Pedidos sem itens_pedido.
**O que e legado:** teste.html, fornecedores.html (form sem listagem), carrinho_evento_adicionar_produto.js (comentado), 7+ scripts duplicados.

## 2. Estado do repositorio

| Item | Valor |
|------|-------|
| Branch atual | main |
| Working tree | Limpo (4 .md nao rastreados) |
| Ultimo commit | 612aea4 — ajuste de html |
| Alteracoes locais | Nenhuma |
| Site em producao | https://angelcosmeticos.netlify.app/ |
| Chat backend | https://angel-cosmeticos.onrender.com/ |
| Estrutura principal | index.html + assets/html/ + assets/js/ + assets/css/ + assets/php/ + assets/sql/ + chat/ |

**Observacao:** Os 4 arquivos .md nao rastreados sao documentos de auditoria/contracao anteriores, nao parte do codigo do site.

## 3. Inventario de funcionalidades

| ID | Area | Funcionalidade | Onde existe | Evidencia | Estado atual | Observacao |
|----|------|----------------|-------------|-----------|--------------|------------|
| F01 | Homepage | Banner, categorias, produtos destaque | index.html | CONF-CODIGO | Funcionando | Precos hardcoded |
| F02 | Catalogo | Listagem produtos + filtros | produtos.html+produtos.js | CONF-CODIGO | Parcial | Dados ficticios |
| F03 | Produto detalhe | Detalhe+variantes | ver-produtos.html+verprodutos.js | CONF-CODIGO | Parcial | Mock 5 produtos |
| F04 | Carrinho | Tabela itens+frete+total | carrinho.html+carrinho.js | CONF-CODIGO | Parcial | 7 implementacoes |
| F05 | Checkout | Finalizar+CEP+PDF | carrinho.html+finalizarcompra.js | CONF-CODIGO | Parcial | 3 implementacoes |
| F06 | Login | Formulario login | conta.html+login.js+login.php | CONF-CODIGO | Legado | JS so menu |
| F07 | Cadastro | Formulario cadastro | conta.html+cadastro.php | CONF-CODIGO | Parcial | JS bloqueia envio |
| F08 | Recuperacao | Formulario recuperacao | conta.html | CONF-CODIGO | Estatico | Sem PHP |
| F09 | Completar cadastro | Dados complementares | completarCadastro.html | CONF-CODIGO | Parcial | SESSION duvida |
| F10 | Conta | Pagina usuario | conta.html | CONF-CODIGO | Parcial | Sem dados reais |
| F11 | Contato | Formulario+WhatsApp | contato.html+contato.js | CONF-CODIGO | Funcionando | Formspree |
| F12 | Empresa | Sobre+mapa | empresa.html | CONF-CODIGO | Funcionando | Google Maps |
| F13 | Fornecedores | Pagina fornecedores | fornecedores.html | CONF-CODIGO | Quebrado | Sem backend |
| F14 | Eventos | Galeria eventos | eventos.html | CONF-CODIGO | Funcionando | Schema duplo |
| F15 | Catalogos PDF | Download PDFs | pdf.html+pdf.js | CONF-CODIGO | Funcionando | PDFs existem |
| F16 | Teste | Pagina teste | teste.html | CONF-CODIGO | Legado | Dev leftover |
| F17 | Chatbot | Chat IA OpenRouter | chatbot.js+index.js+chat/ | CONF-CODIGO | Parcial | 2 duplicatas |
| F18 | Carrinho backend | CRUD carrinho PHP | carrinho.php+obter+remover | CONF-CODIGO | Quebrado | PHP nao Netlify |
| F19 | Produtos backend | CRUD produtos | produtos.php | CONF-CODIGO | Quebrado | mysql+PDO misturados |
| F20-F25 | Estoque/Logout/Dash | Operacoes PHP | *.php | CONF-CODIGO | Quebrado | PHP nao Netlify |
| F26 | PWA | Manifest+favicon | site.webmanifest | CONF-CONFIG | Funcionando | Basico |
| F27 | SEO | Meta+OG+JSON-LD | Todas paginas | CONF-CODIGO | Funcionando | Descricoes dup |
| F28 | WhatsApp | Links wa.me | 6 paginas | CONF-CODIGO | Funcionando | Numero 5511963205776 |
| F29 | PDF carrinho | Resumo carrinho | carrinho.js+resumoCompraPdf.js | CONF-CODIGO | Parcial | jsPDF+AutoTable |
| F30 | PDF nota | Nota fiscal | resumoCompraPdf.js | CONF-CODIGO | Parcial | Dados ficticios |
| F31 | Mapa | Google Maps | empresa.html+googlemapa.js | CONF-CODIGO | Funcionando | |
| F32 | Btn topo | Voltar ao topo | btntop.js | CONF-CODIGO | Funcionando | |
| F33 | Menu mobile | Menu hamburger | app.js | CONF-CODIGO | Funcionando | |
| F34 | Galeria modal | Modal imagem | modal.js | CONF-CODIGO | Funcionando | |
| F35 | Galeria setas | Navegacao setas | setas.js | CONF-CODIGO | Duplicado | Igual modal.js |
| F36 | Responsividade | Ajustes layout | responsive.js | CONF-CODIGO | Funcionando | |
| F37 | Contato AJAX | Envio formulario | contato.js | CONF-CODIGO | Funcionando | Formspree |
| F38 | Sitemap | Listagem URLs | sitemap.xml+generate-sitemap.js | CONF-CONFIG | Funcionando | |
| F39 | robots | Regras robos | robots.txt | CONF-CONFIG | Parcial | Bloqueia login/carrinho |
## 4. Inventario de telas

| Tela | Arquivo | Publico/Privado | Funcionalidade | Estado |
|------|---------|-----------------|----------------|--------|
| Homepage | index.html | Publico | CTA, categorias, produtos destaque, promocoes, depoimentos | Funcionando |
| Catalogo | produtos.html | Publico | Listagem produtos + filtros | Parcial |
| Produto | ver-produtos.html | Publico | Detalhe + variantes tamanho | Parcial |
| Carrinho | carrinho.html | Publico | Tabela itens, frete, total, PDF | Parcial |
| Login/Cadastro | conta.html | Publico | Login, cadastro, recuperacao | Parcial |
| Completar cadastro | completarCadastro.html | Privado | Dados complementares | Parcial |
| Conta | conta.html | Privado | Dados usuario | Parcial |
| Contato | contato.html | Publico | Formulario + chatbot | Funcionando |
| Empresa | empresa.html | Publico | Sobre, missao, mapa, historia | Funcionando |
| Fornecedores | fornecedores.html | Publico | Formulario sem listagem | Quebrado |
| Eventos | eventos.html | Publico | Galeria imagens + video | Funcionando |
| Catalogos PDF | pdf.html | Publico | Download catálogos | Funcionando |
| Teste | teste.html | Publico | Dev leftover | Legado |
| Dashboard | dashboard.php | Privado | Saudacao minima | Quebrado |

## 5. Atores

### Cliente
- Visitante: Navegar, ver produtos, contato, chatbot, WhatsApp. CONF-CODIGO
- Cadastrado: Login, cadastro, conta. CONF-CODIGO (PHP nao roda no Netlify)
- Comprador: Carrinho, checkout, PDF. CONF-CODIGO (simulado)

### Operacao
- Administrador: CRUD produtos, estoque, pedidos. CONF-CODIGO (PHP nao roda)
- Vendedor: Pedidos WhatsApp. [INFERENCIA]

### Atendimento
- Chatbot: OpenRouter via Render. CONF-CODIGO
- WhatsApp: wa.me/5511963205776. CONF-CODIGO
- Humano: [HIPOTESE] nao evidenciado

## 6. Fluxos atuais

### Fluxo cliente completo

| Etapa | Existe | Onde | Funciona | Backend | Banco | Duplicada | Simulada | Sobrevive |
|-------|--------|------|----------|---------|-------|-----------|----------|-----------|
| Entrada/Homepage | Sim | index.html | Sim | Nao | Nao | Nao | Nao | Sim |
| Catalogo | Sim | produtos.html | Sim(mock) | Nao | Nao | Nao | Sim | Sim |
| Categoria | Sim | index.html | Sim | Nao | Nao | Nao | Sim | Sim |
| Produto | Sim | ver-produtos.html | Sim(mock) | Nao | Nao | Nao | Sim | Sim |
| Selecao | Sim | ver-produtos.js | Sim | Nao | Nao | Sim(7 carts) | Sim | Sim |
| Carrinho | Sim | carrinho.html | Parcial | Sim(PHP) | Sim | Sim(7+) | Sim | Sim |
| Checkout | Sim | carrinho.html | Sim(simulado) | Sim(PHP) | Sim | Sim(3+) | Sim | Sim |
| Pedido | Parcial | pedidos.sql | NAO persistido | Sim | Sim | Nao | Sim | Sim |
| Pagamento | Sim | --- | NAO existe | Nao | Nao | Nao | Sim | Sim |
| Entrega | Nao | --- | Nao | Nao | Nao | Nao | Sim | Sim |
| Pos-venda | Parcial | WhatsApp | Sim(mensagem) | Nao | Nao | Nao | Nao | Sim |

## 7. Fluxo de produto

- Produto simples: SIM (SQL: id, nome_produto, preco, descricao, fornecedor_id) CONF-SQL
- Produto com variante: NAO no banco. Apenas frontend (verprodutos.js: precos P/M/G/GG/XG) CONF-CODIGO
- Tamanho: Apenas frontend mock, nao obrigatorio CONF-CODIGO
- Imagens: Hardcoded frontend, nao persistidas CONF-CODIGO
- Preco: Mock frontend, nao banco em tempo real CONF-CODIGO
- Promocao: Tabela SQL existe mas frontend ignora CONF-SQL/CODIGO
- Estoque: Tabela SQL existe, nao consultado na compra CONF-SQL
- SKU: NAO existe CONF-SQL
- Fornecedor: Existe no banco CONF-SQL
- Categoria: N:N CONF-SQL

## 8. Fluxo de carrinho (7 implementacoes)

| Arquivo | Storage | Dedup | Backend | Ativo |
|---------|---------|-------|---------|-------|
| icon-carrinho.js | localStorage carrinho | id | Nao | Sim |
| produtos.js | localStorage carrinho | id | Nao | Sim |
| verprodutos.js | localStorage carrinho | id+tamanho | Nao | Sim |
| carrinho_adicionar_produto.js | PHP Session | produto_id | Sim | Nao(PHP) |
| carrinho_evento_adicionar_produto.js | localStorage carrinho | nome(BUG) | Nao | Comentado |
| carrinhopoduto.js | localStorage carrinho | id(index) | Nao | Sim |
| carrinhopoduto copy.js | localStorage carrinho | id | Nao | Duplicado |
| carrinhoProdutoCategoria.js | Stub | - | Nao | Nao |
| carrinho.js(carrinho.html) | DOM+localStorage | data-preco | Nao | Sim |
| finalizarcompra.js | DOM | - | Nao | Sim |
| listaDeProduto.js | DOM | - | Nao | Sim |

Conflitos: carrinho.js frete R$360 vs finalizarcompra.js R$300; regiois divergentes; formatos de item diferentes.

## 9. Fluxo de checkout (3 implementacoes)

| Regra | carrinho.js | finalizarcompra.js | listaDeProduto.js | Conflito |
|-------|-------------|--------------------|--------------------|----------|
| Frete gratuito | R$360 | R$300 | R$360 | SIM |
| SP/RJ | R$30 | R$20 | R$30 | SIM |
| Sul | R$50 | R$30 | R$50 | SIM |
| Outros | R$70 | R$50 | R$70 | SIM |
| Gera PDF | Sim | Sim | Nao | - |
| Cria pedido | Nao | Nao | Nao | TODOS FALHAM |
| Pagamento | Nao | Nao | Nao | TODOS FALHAM |

## 10. WhatsApp

- Numero: 5511963205776 CONF-CODIGO
- Mensagem: "Ola, gostaria de saber mais sobre os produtos!" CONF-CODIGO
- Montagem automatica pedido: NAO CONF-CODIGO
- Envio itens: NAO CONF-CODIGO
- Envio quantidade: NAO CONF-CODIGO
- Envio preco: NAO CONF-CODIGO
- Envio total: NAO CONF-CODIGO
- Identificacao cliente: NAO CONF-CODIGO
- Endereco: NAO CONF-CODIGO
- Registro pedido: NAO CONF-CODIGO
- Integracao carrinho-WhatsApp: NAO CONF-CODIGO

## 11. Pedidos

- Tabela pedidos existe (id, usuario_id, data_pedido, status) CONF-SQL
- Nao existe itens_pedido CONF-SQL
- Nao existe relacao pedido-produto CONF-SQL
- Nao existe preco congelado CONF-SQL
- Nao existe item de pedido CONF-SQL
- historico_compras existe mas duplica CONF-SQL
- Status: Em processamento, Enviado, Entregue, Cancelado CONF-SQL
- NENHUM codigo persiste pedido real CONF-CODIGO

## 12. Estoque

- Por produto: SIM (1:1) CONF-SQL
- Por variante: NAO CONF-SQL
- Reservado no carrinho: NAO CONF-CODIGO
- Baixado na compra: NAO CONF-CODIGO
- Pode negativo: [HIPOTESE] SIM
- Movimentacao: SIM (entradas/saidas) CONF-SQL
- Historico: SIM (views) CONF-SQL
- Auditoria: NAO CONF-SQL
- Estoque minimo: NAO CONF-SQL
- Disponibilidade catalogo: NAO CONF-CODIGO

## 13. Precos e promocoes

- Promocao por produto: SIM CONF-SQL
- Promocao por variante: NAO CONF-SQL
- Desconto: decimal(5,2) ambíguo CONF-SQL
- Preco promocional calculado: Nao, frontend ignora tabela CONF-CODIGO
- Carrinho usa promocional: NAO CONF-CODIGO
- Conflito frontend-banco: SIM CONF-CODIGO

## 14. Clientes e autenticacao

- Login funciona ambiente atual: NAO CONF-CODIGO
- Cadastro funciona: NAO CONF-CODIGO
- Recuperacao funciona: NAO CONF-CODIGO
- Dados em: usuarios, usuarios_completo, cadastro CONF-SQL
- Duplicidade: usuarios+usuarios_completo+cadastro CONF-SQL
- Sessao: PHP SESSION CONF-CODIGO
- Autenticacao real frontend: NAO CONF-CODIGO

## 15. Enderecos

- Tabela enderecos: id, tipo_endereco(Usuario/Fornecedor), entidade_id, logradouro, numero, complemento, bairro, cidade, estado, cep CONF-SQL
- Polimorfismo: PARCIALMENTE quebrado FK so para usuarios CONF-SQL
- Uso checkout: NAO CONF-CODIGO
- Uso cadastro: SIM CONF-CODIGO
- Impacto: Fornecedor nao tem endereco; dados duplicados CONF-SQL

## 16. Chat e atendimento

- chatbot.js: implementacao principal frontend CONF-CODIGO
- index.js: DUPLICATA exata do chatbot.js CONF-CODIGO
- chat/server.js: Express, rota /api/chat, porta 10000 CONF-CODIGO
- chat/index.js + chat/chat.js: DUPLICATAS backend CONF-CODIGO
- Bug middleware: cors() e express.json() DEPOIS das rotas CONF-CODIGO
- OpenRouter: openai/gpt-3.5-turbo CONF-CODIGO
- Persistencia conversa: NAO CONF-CODIGO
- Atendimento humano: [HIPOTESE]

## 17. Documentos/PDF

- gerarPDF() carrinho.js: jsPDF+AutoTable, "Resumo-Carrinho.pdf" CONF-CODIGO
- gerarNotaFiscalPDF() resumoCompraPdf.js: dados ficticios CONF-CODIGO
- Confiabilidade: BAIXA CONF-CODIGO
- CNPJ ficticio: 12.345.678/0001-99 CONF-CODIGO
- CPF ficticio: 123.456.789-00 CONF-CODIGO

## 18. SEO

- Meta descricoes: 5 tags duplicadas em index.html CONF-CODIGO
- Open Graph: Presente, URLs inconsistentes CONF-CODIGO
- Twitter Card: Presente, imagem errada CONF-CODIGO
- Schema.org: Presente CONF-CODIGO
- Sitemap: Existe, 11 URLs CONF-CONFIG
- robots.txt: Bloqueia login/carrinho CONF-CONFIG
- Favicon: Inconsistente CONF-CODIGO
- Canonical: Apenas 2 paginas, dominio errado CONF-CODIGO

## 19. Infraestrutura

Browser -> Netlify(frontend) -> PHP/MySQL(NAO RODA) / Node/Render(chat OK) -> OpenRouter(OK) -> WhatsApp(OK) / ViaCEP(OK) / Formspree(OK) / GoogleMaps(OK)

- Netlify: Producao frontend CONF-CONFIG
- PHP/MySQL: NAO em producao CONF-CODIGO
- Render: Chat backend ativo CONF-CONFIG
- OpenRouter: Chatbot ativo CONF-CODIGO
- ViaCEP: Chamado em 3 arquivos CONF-CODIGO
- Formspree: Contato CONF-CODIGO
- WhatsApp: Links funcionais CONF-CONFIG
- Credenciais DB: root/root expostas em conexao.php CONF-CODIGO

## 20. Integracoes

| Integracao | Origem | Destino | Finalidade | Estado | Sobrevive |
|-----------|--------|---------|------------|--------|-----------|
| Netlify | Frontend | CDN | Hospedagem | Ativo | Sim |
| PHP/MySQL | Frontend | Banco | Backend logico | Inativo | Decisao |
| Render | Frontend | Node.js | Chat backend | Ativo | Sim |
| OpenRouter | Render | OpenRouter | Chatbot IA | Ativo | Sim |
| ViaCEP | Frontend | ViaCEP API | CEP-Endereco | Ativo | Sim |
| Formspree | Frontend | Formspree | Contato | Ativo | Sim |
| WhatsApp | Frontend | wa.me | Comunicacao | Ativo | Sim |
| Google Maps | Frontend | Google | Mapa | Ativo | Sim |
| jsPDF | Frontend | jsPDF lib | Geracao PDF | Ativo | Sim |
| Font Awesome | Frontend | CDN | Icone | Ativo | Sim |

## 21. Duplicacoes

| Domínio | Implementacoes | Qtd | Conflito | Estrategia |
|---------|---------------|-----|----------|------------|
| Carrinho | 11 arquivos | 11 | Alta | Unificar |
| Checkout | 3 arquivos | 3 | Alta | Unificar |
| Chat | 4 arquivos | 4 | Alta | Unificar |
| Login | 5 arquivos | 5 | Medio | Unificar |
| Conexao DB | conexao.php+db_config.php | 2 | Alta | Eliminar 1 |
| Icon carrinho | icon-carrinho.js+mudafotocarrinho.js | 2 | Alta | Unificar |
| Galeria | modal.js+setas.js | 2 | Medio | Unificar |

## 22. Funcionalidades ausentes

| Necessidade | Existe | Evidencia | Impacto | Prioridade |
|------------|--------|-----------|---------|------------|
| item_pedido | Nao | CONF-SQL | P0 | P0 |
| Pedido real | Nao | CONF-CODIGO | P0 | P0 |
| Checkout real | Nao | CONF-CODIGO | P0 | P0 |
| Pagamento | Nao | CONF-CODIGO | P0 | P0 |
| Reserva estoque | Nao | CONF-CODIGO | P1 | P1 |
| Baixa estoque | Nao | CONF-CODIGO | P1 | P1 |
| Preco congelado | Nao | CONF-SQL | P1 | P1 |
| Endereco entrega | Nao | CONF-SQL | P1 | P1 |
| Status pagamento | Nao | CONF-SQL | P1 | P1 |
| Atendimento humano | Nao | HIPOTESE | P1 | P1 |
| Carrinho nao logado | Nao | CONF-CODIGO | P1 | P1 |
| Email confirmacao | Nao | CONF-CODIGO | P2 | P2 |
| Historico pedidos | Parcial | CONF-SQL | P2 | P2 |
| Cancelamento | Nao | CONF-SQL | P2 | P2 |
| SKU real | Nao | CONF-SQL | P2 | P2 |
| Estoque variante | Nao | CONF-SQL | P2 | P2 |

## 23. Matriz MANTER/MELHORAR/REFAZER/REMOVER/NOVO

| Funcionalidade | Decisao | Motivo |
|---------------|---------|--------|
| Homepage | MANTER | Conteudo valido, SEO |
| Catalogo | REFAZER | Dados mock |
| Produto detalhe | REFAZER | Mock 5 identicos |
| Carrinho | REFAZER | 7 implementacoes conflitantes |
| Checkout | REFAZER | 3 implementacoes, sem persistencia |
| Chatbot | MELHORAR | Duplicacao, sem historico |
| WhatsApp | MANTER | Funcional, sem automacao |
| Contato | MANTER | Funciona |
| Empresa | MANTER | Estatico valido |
| Eventos | MANTER | Galeria valida |
| Catalogos PDF | MANTER | Downloads reais |
| Login | REFAZER | JS incompleto, PHP nao roda |
| Cadastro | REFAZER | JS bloqueia envio |
| Fornecedores | REMOVER | Sem backend |
| Teste | REMOVER | Dev leftover |
| Carrinho evento | REMOVER | Comentado |
| Dashboard PHP | REFAZER | Minimo, PHP nao roda |
| Todas rotas PHP | REFAZER | PHP nao executa Netlify |

## 24. Fluxos futuros

A) Compra simples: Produto -> Carrinho(unificado) -> Checkout(CEP+Pagamento) -> Pedido(persistido) -> Confirmacao
B) WhatsApp: Produto -> Carrinho -> Pedido rascunho(API) -> wa.me -> Vendedor confirma -> Baixa estoque
C) Checkout site: Carrinho -> Dados(login/convidado) -> CEP -> Frete -> Pagamento -> Pedido -> Confirmacao
D) Atendimento: Site -> Chatbot -> Humano -> CRM
E) Operacao: Admin -> Produtos -> Estoque -> Pedidos -> Clientes -> Relatorios

## 25. Dependencias

Produto -> Categoria, Imagem(frontend), Preco(frontend), Promocao(tabela/ignorada), Variante(frontend), Estoque(tabela/nao consultado), Fornecedor
      -> Carrinho(7 impl) -> Checkout(3 impl) -> Pedido(incompleto) -> Historico(duplicado)
      -> Chatbot/WhatsApp/ViaCEP/Formspree/GoogleMaps

## 26. Riscos de migracao

| Risco | Origem | Impacto | Probabilidade | Mitigacao |
|-------|--------|---------|---------------|-----------|
| Dados login perdidos | PHP nao exportado | Alto | Alta | Exportar usuarios/cadastro |
| Pedidos fantasma | pedidos sem itens | Alto | Alta | Nao migrar, novo schema |
| Clientes duplicados | 3 tabelas | Alto | Alta | Unificar |
| Enderecos orfãos | FK quebrado | Medio | Alta | Novo esquema |
| Carrinho inconsistente | 7 implementacoes | Alto | Certa | Unificar |
| Imagens hardcoded | Frontend | Medio | Certa | Tabela imagens |
| Estoque negativo | Sem controle | Alto | Alta | Reserva checkout |
| Credenciais DB | root/root | Alto | Certa | .env |
| Views quebradas | JOIN falho | Medio | Alta | Recriar |
| URLs canonicas erradas | produto.html .com.br | Baixo | Media | Corrigir |

## 27. O que NÃO podemos perder

1. Homepage - identidade marca, SEO
2. Catalogo - negocio principal
3. WhatsApp - canal venda ativo
4. Chatbot - atendimento atual
5. Catalogos PDF - materiais vendas
6. Contato - funcional
7. Empresa - conteudo institucional
8. Eventos - galeria
9. CNPJ: 48.591.163/0001-12 (marca)
10. Numero WhatsApp: 5511963205776
11. Endereco fisico: Viela Aristides de Oliveira 130, Poá SP
12. Regras frete atuais (temporario)
13. Catalogo produtos (mock -> real)
14. Sistema de avaliacoes (estrelas)

## 28. Legados candidatos a eliminacao

1. teste.html - Dev leftover
2. fornecedores.html - Form sem listagem/backend
3. carrinho_evento_adicionar_produto.js - Comentado
4. carrinhoProdutoCategoria.js - Stub
5. login.js - Duplicata de app.js (menu mobile)
6. setas.js - Duplicata de modal.js
7. carrinhopoduto copy.js - Copia exata
8. db_config.php - Duplicata de conexao.php
9. Todas rotas PHP (login, cadastro, dashboard, estoque) - PHP nao roda Netlify
10. cadastrar_fornecedor.php + exibir_fornecedores.php - Dependem frontend quebrado
11. adicionar_proutdo.php - Typo no nome
12. resetar_senha.php - Depende sessao que nao funciona
13. logoutAutomatico.php - Depende PHP Netlify
14. salvar_dados_complementares.php - Esquema diferente do resto

## 29. Decisoes ja fechadas

1. Produto simples ou com variante: MISTO (variante opcional) - DECISOES_NEGOCIO_v1.0
2. Variante opcional - DECISOES_NEGOCIO_v1.0
3. Variante tem preco proprio: SIM - DECISOES_NEGOCIO_v1.0
4. Estoque: Misto (híbrido) - DECISOES_NEGOCIO_v1.0
5. Frete: Tabela admin + Transportadora Fase 2 - DECISOES_NEGOCIO_v1.0
6. Pagamentos: Todas + entrega - DECISOES_NEGOCIO_v1.0
7. WhatsApp gera pedido: Progressivo (rascunho->confirmado->webhook) - DECISOES_NEGOCIO_v1.0
8. Compra exige cadastro: Híbrido - DECISOES_NEGOCIO_v1.0
9. Endereço obrigatório: Sim (com ViaCEP) - DECISOES_NEGOCIO_v1.0
10. Status pedido: 9 status - DECISOES_NEGOCIO_v1.0

## 30. Decisoes ainda pendentes

1. Backend alvo: Supabase vs Node/Express + PostgreSQL vs manter PHP - [NÃO DETERMINADO]
2. Backend PHP atual deve ser migrado ou eliminado? - [NÃO DETERMINADO]
3. Carrinho canônico: qual das 7 implementações base? - [NÃO DETERMINADO]
4. Imagens produtos: upload management? - [NÃO DETERMINADO]
5. Chatbot humano: como detectar e transferir? - [NÃO DETERMINADO]
6. E-mail transacional: servico (SendGrid, Mailgun)? - [NÃO DETERMINADO]
7. PWA completo ou site responsivo? - [NÃO DETERMINADO]
8. Favicon/SEO cleanup: quem prioriza? - [NÃO DETERMINADO]
9. Dados legados (pedidos, clientes PHP): migrar ou descartar? - [NÃO DETERMINADO]
10. Atendimento humano: interno ou terceirizado? - [NÃO DETERMINADO]

## 31. Correcoes das auditorias anteriores

1. icon-carrinho.js NAO deve ser considerado carrinho canônico - tem apenas icon + 3 funções basicas
2. Supabase NÃO está decidido - é apenas opção entre várias
3. React/Vite/TS NÃO foi implementado - apenas stackbit.config.ts sugere futuro
4. Nenhuma migration deve ser criada nesta auditoria
5. Tamanho NÃO é obrigatório - apenas mock frontend
6. Nem todas variantes são tamanho - apenas tamanho existe hoje
7. Variante NÃO necessariamente altera preço - decisão futura
8. WhatsApp NÃO gera pedido no banco - apenas mensagem
9. Cadastro NÃO é obrigatório para compra - DECISAO pendente
10. Regras de frete SEM decisão final - 3 valores diferentes
11. Regras de pagamento SEM decisão final - apenas WhatsApp
12. Hipotese nao transformada em regra - atendimento humano, estoque negativo
13. login.js NÃO contém logica de login - apenas menu mobile
14. fornecedores.html NÃO é tela funcional - apenas form HTML
15. teste.html NÃO é funcionalidade - codigo de desenvolvimento
16. chat/index.js e chatbot.js SAO duplicatas no frontend
17. chat/index.js e chat/chat.js SAO duplicatas no backend
18. conexao.php e db_config.php SAO identicas
19. carrinhopoduto.js e carrinhopoduto copy.js SAO identicas
20. robots.txt Bloqueia paginas que deveriam ser indexadas

## 32. Prioridades P0/P1/P2/P3

### P0 - Bloqueadores
- item_pedido (tabela nao existe)
- Pedido real persistido (checkout simula apenas)
- Pagamento (sem nenhuma forma de pagar)
- Carrinho unificado (7 implementacoes conflitantes)

### P1 - Criticos
- Reserva estoque checkout
- Baixa estoque compra
- Preco congelado pedido
- Endereco entrega pedido
- Status pagamento
- Atendimento humano chat
- Carrinho nao logado

### P2 - Importantes
- Email confirmacao
- Historico pedidos completo
- Cancelamento pedido
- Devolucao/troca
- SKU real
- Estoque por variante
- Carrinho sync backend
- Promocao funcional checkout

### P3. P3 - Melhorias
- Imagens produto banco
- Favicon padronizado
- robots.txt correto
- CNPJ/CPF real PDFs
- Schema.org refinado
- Canonical correto

## 33. Diagnostico final

### A. O que realmente temos hoje?
Um site estatico em HTML/CSS/JS hospedado no Netlify com 13 paginas, um chatbot em Node.js no Render usando OpenRouter, links WhatsApp, formulário de contato via Formspree, e um backend PHP/MySQL que EXISTE no codigo mas NAO executa no ambiente de producao.

### B. O que está funcionando?
Homepage, catalogo (mock), produto (mock), contato, empresa, eventos, catálogos PDF, chatbot (depende Render), WhatsApp links, PWA básico, sitemap, SEO parcial.

### C. O que está quebrado?
Login (JS incompleto + PHP nao roda), cadastro (JS bloqueia envio), carrinho (7 implementacoes divergentes), checkout (3 implementacoes, sem persistência), fornecedores (form sem backend), dashboard (PHP nao roda), todas rotas PHP, robots bloqueia conteudo útil.

### D. O que está duplicado?
2 chatbots frontend, 2 chatbots backend, 2 conectores DB, 2 carrinho icons, 2 galerias, 2 carrinhos quase-identicos, 11 implementações totais de carrinho, 3 de checkout.

### E. O que é legado?
teste.html, fornecedores.html, carrinho_evento_adicionar_produto.js, carrinhoProdutoCategoria.js, login.js, setas.js, carrinhopoduto copy.js, db_config.php, todas rotas PHP.

### F. O que é essencial para o negócio?
Homepage, catalogo, carrinho, checkout, chatbot, WhatsApp, contato, produtos, categorias, estoque, pedidos, clientes.

### G. O que pode ser descartado?
teste.html, fornecedores.html, todos scripts comentados/stubs, duplicatas de código, rotas PHP não operacionais.

### H. O que precisa ser reconstruído?
Carrinho, checkout, login/cadastro, pedidos (schema completo), estoque transacional, pagamento, atendimento humano.

### I. O que ainda depende de decisão de negócio?
Backend alvo, migração PHP, carrinho canônico, imagens, chatbot humano, email, PWA, SEO cleanup, dados legados.

### J. Qual é a ordem correta para a próxima etapa?
1. Consolidar CONTRATO FUNCIONAL + CONTRATO DOMINIO COMERCIAL v1.1
2. Decidir backend alvo
3. Definir arquitetura
4. Gerar migrations SQL
5. Especificar API Contract
6. SÓ ENTÃO iniciar implementação

---

**AUDITORIA 4 CONCLUÍDA — NENHUMA ALTERAÇÃO REALIZADA**

## PRÓXIMA ETAPA RECOMENDADA

Consolidar o **CONTRATO FUNCIONAL DO SISTEMA + CONTRATO DO DOMÍNIO COMERCIAL v1.0/1.1** antes de qualquer decisão definitiva de backend, banco ou frontend. Usar este relatório como base para fechar as decisões pendentes da Seção 30 (backend alvo, migração PHP, carrinho canônico, etc.) e então gerar as 9 migrations SQL priorizadas.

[HIPÓTESE]: Possibilidade ainda não comprovada
[CONFIRMADO — CÓDIGO]: Evidência direta em HTML/JS/PHP/CSS
[CONFIRMADO — SQL]: Evidência direta no schema/dump SQL
[CONFIRMADO — EXECUÇÃO]: Efetivamente executado/testado
[CONFIRMADO — CONFIGURAÇÃO]: Confirmado por configuração/deploy
[INFERÊNCIA]: Derivado de múltiplas evidências
[NÃO DETERMINADO]: Sem evidência suficiente
