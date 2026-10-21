# Imagens de Produtos — Angel Cosméticos

## Árvore de diretórios

```
assets-importacao/
└── catalogo/
    ├── produtos/
    │   ├── mary-kay/
    │   │   ├── cuidados-pele/
    │   │   ├── maquiagem/
    │   │   ├── corpo-banho/
    │   │   ├── cabelos/
    │   │   ├── acessorios/
    │   │   └── promocoes/
    │   ├── bela/
    │   ├── puro/
    │   └── sem-fornecedor/
    ├── categorias/
    ├── fornecedores/
    ├── banners/
    └── outros/
```

## Finalidade de cada pasta

- `produtos/<fornecedor>/<categoria>`: fotos de produtos do catálogo.
- `categorias`: imagens ilustrativas de categorias.
- `fornecedores`: logotipos e materiais de fornecedores.
- `banners`: peças de banners institucionais e promocionais.
- `outros`: imagens sem identificação confirmada (revisão pendente).

## Convenção de nomes

`<produto_id>-<ordem>-<slug>.<ext>` — ex.: `42-01-serum-vitamina-c.jpg` (exemplo, não produto real).

## Imagem principal e secundárias

- Principal: `<produto_id>-00-main.<ext>` (única por produto, regra de unicidade do banco).
- Secundárias: `<produto_id>-01.<ext>`, `<produto_id>-02.<ext>`.

## Produtos sem foto

Usar placeholder em `web/public/images/placeholder-product.jpg` (ou equivalente). Não substituir imagens válidas.

## Associação com banco

PostgreSQL (`produto`, `produto_imagem`) é fonte de verdade. Storage bucket `product-images` guarda arquivos definitivos. Caminhos persistidos no banco, não nomes de arquivo.

## Imagens externas

URLs externas (incluindo VTEX) permanecem; não substituir automaticamente.

## Caminhos antigos preservados

- `web/public/images/*`
- `web/public/assets/img/*`
- `web/public/brand/*`

Nenhum arquivo existente foi movido nesta etapa.

## Categorias não confirmadas no banco

A confirmar via Supabase: `produto`, `produto_imagem`, `categoria`, `fornecedor` — não inventar IDs/categorias.

## Formatos suportados

`.jpg`, `.jpeg`, `.png`, `.webp`, `.avif` (se pipeline suportar). PDFs não aceitos como imagem de produto.

## Git

A área `assets-importacao/` deve ser avaliada para `.gitignore` caso contenha centenas de imagens comerciais. Pendência de decisão.
