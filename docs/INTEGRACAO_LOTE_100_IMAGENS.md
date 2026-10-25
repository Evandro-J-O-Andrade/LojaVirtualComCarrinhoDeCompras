# Integracao do lote de 100 imagens - Angel Cosméticos

Branch: feat/integracao-100-imagens

## Implementado nesta etapa
- Inventario tipado com 100 imagens em web/src/domains/conteudo/model/acervo-visual.ts.
- Galeria em /acervo-visual com busca, filtros, contagens, lazy loading e texto alternativo.
- Link para o acervo na pagina inicial.
- Teste automatizado para nomes unicos, distribuicao e caminhos locais.

## Distribuicao
- Beleza: 76
- Banners: 5
- Produtos para revisao: 14
- Moda: 3
- Casa: 2
- Total: 100

## Preservacao e limites
- Os 100 arquivos foram encontrados em web/public/assets/img no estado atual do repositorio.
- Os caminhos publicos existentes foram preservados.
- As imagens classificadas como produtos nao foram vinculadas a IDs do catalogo, pois isso exige confirmacao comercial.
- Os cinco banners estao classificados como banners na galeria, mas ainda ficam fisicamente nas pastas beleza. A movimentacao fisica fica para uma etapa separada.
- Nenhuma imagem foi removida ou renomeada.
- Nenhuma alteracao no Supabase ou no Storage.

## Validacao pendente
Executar dentro de web/: npm run test:run, npm run build e npm run lint. A galeria nao deve ser considerada pronta para producao antes dos resultados desses comandos e da revisao visual.
