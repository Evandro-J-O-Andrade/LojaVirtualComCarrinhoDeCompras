const fs = require('fs');
const content = require('fs').readFileSync('AUDITORIA_4_RELATORIO.md', 'utf8');

// Part 2
const part2 = `
## 2. Estado do repositório

| Item | Valor |
|------|-------|
| Branch atual | main |
| Working tree | Limpo (4 .md nao rastreados) |
| Ultimo commit | 612aea4 — ajuste de html |
| Alteracoes locais | Nenhuma |
| Site em producao | https://angelcosmeticos.netlify.app/ |
| Chat backend | https://angel-cosmeticos.onrender.com/ |
| Estrutura | index.html + assets/html/ + assets/js/ + assets/css/ + assets/php/ + assets/sql/ + chat/ |

Obs: Os 4 arquivos .md nao rastreados sao documentos de auditoria/contracao anteriores.

## 3. Inventario de funcionalidades

| ID | Area | Funcionalidade | Onde existe | Evidencia | Estado | Observacao |
|----|------|----------------|-------------|-----------|--------|------------|
| F01 | Homepage | Banner, categorias, produtos destaque, promocoes | index.html | CONF-CODIGO | Funcionando | Precos hardcoded |
| F02 | Catalogo | Listagem produtos com filtros | produtos.html+produtos.js | CONF-CODIGO | Parcial | Dados ficticios em JS |
| F03 | Produto detalhe | Detalhe com variantes (tamanho) | ver-produtos.html+verprodutos.js | CONF-CODIGO | Parcial | Mock 5 produtos identicos |
| F04 | Carrinho | Tabela itens, subtotal, frete, total | carrinho.html+carrinho.js | CONF-CODIGO | Parcial | Multi implementacoes conflitantes |
| F05 | Checkout | Finalizar compra CEP+PDF | carrinho.html+finalizarcompra.js | CONF-CODIGO | Parcial | 3 implementacoes regras divergentes |
| F06 | Login | Formulario login | conta.html+login.js+login.php | CONF-CODIGO | Legado | login.js so tem menu mobile |
| F07 | Cadastro | Formulario cadastro | conta.html+cadastro.js+cadastrar_usuario.php | CONF-CODIGO | Parcial | JS previne envio |
| F08 | Recuperacao | Formulario recuperacao senha | conta.html | CONF-CODIGO | Estatico | Sem PHP recuperacao |
| F09 | Completar cadastro | Dados complementares | completarCadastro.html+completar_cadastro.php | CONF-CODIGO | Parcial | SESSION pode nao iniciar |
| F10 | Conta | Pagina usuario | conta.html | CONF-CODIGO | Parcial | Sem dados dinamicos |
| F11 | Contato | Formulario + WhatsApp | contato.html+contato.js | CONF-CODIGO | Funcionando | Formspree.io |
| F12 | Empresa | Sobre, missao, mapa | empresa.html | CONF-CODIGO | Funcionando | Google Maps embed |
| F13 | Fornecedores | Pagina fornecedores | fornecedores.html | CONF-CODIGO | Quebrado | Sem backend conectado |
| F14 | Eventos | Galeria eventos | eventos.html | CONF-CODIGO | Funcionando | Schema duplicado |
| F15 | Catalogos PDF | Download catalogos | pdf.html+pdf.js | CONF-CODIGO | Funcionando | PDFs existentes |
| F16 | Teste | Pagina teste | teste.html | CONF-CODIGO | Legado | Codigo desenvolvimento |
| F17 | Chatbot | Chat IA OpenRouter | chatbot.js+index.js+chat/ | CONF-CODIGO | Parcial | 2 duplicatas, depende Render |
| F18 | Carrinho backend | CRUD carrinho PHP | carrinho.php+obter_carrinho.php | CONF-CODIGO | Quebrado | PHP nao roda Netlify |
| F19 | Produtos backend | CRUD produtos | produtos.php+adicionar_proutdo.php | CONF-CODIGO | Quebrado | mysql vs PDO misturados |
| F20-F25 | Estoque/Logout/Dashboard | Operacoes PHP | *.php | CONF-CODIGO | Quebrado | PHP nao roda Netlify |
| F26 | PWA | Manifest+favicon | site.webmanifest | CONF-CONFIG | Funcionando | Basico |
| F27 | SEO | Meta+OG+JSON-LD | Todas paginas | CONF-CODIGO | Funcionando | Descricoes duplicadas |
| F28 | WhatsApp | Links wa.me | 6 paginas HTML | CONF-CODIGO | Funcionando | Numero 5511963205776 |
| F29 | PDF carrinho | Resumo carrinho PDF | carrinho.js+resumoCompraPdf.js | CONF-CODIGO | Parcial | jsPDF+AutoTable |
| F30 | PDF nota | Nota fiscal PDF | resumoCompraPdf.js | CONF-CODIGO | Parcial | Dados ficticios |
| F31 | Mapa | Google Maps | empresa.html | CONF-CODIGO | Funcionando | |
| F32 | Btn topo | Voltar ao topo | btntop.js | CONF-CODIGO | Funcionando | |
| F33 | Menu mobile | Menu hamburger | app.js | CONF-CODIGO | Funcionando | |
| F34 | Galeria modal | Modal imagem | modal.js | CONF-CODIGO | Funcionando | |
| F35 | Galeria setas | Navegacao setas | setas.js | CONF-CODIGO | Duplicado | Igual modal.js |
| F36 | Responsividade | Ajustes layout | responsive.js | CONF-CODIGO | Funcionando | |
| F37 | Contato AJAX | Envio formulario | contato.js | CONF-CODIGO | Funcionando | Formspree |
| F38 | Sitemap | URLs | sitemap.xml+generate-sitemap.js | CONF-CONFIG | Funcionando | |
| F39 | robots | Regras robos | robots.txt | CONF-CONFIG | Parcial | Bloqueia login/carrinho |
`;

fs.appendFileSync('AUDITORIA_4_RELATORIO.md', part2, 'utf8');
console.log('Parte 2 escrita');
`;

fs.writeFileSync('write_part2.js', content);
"