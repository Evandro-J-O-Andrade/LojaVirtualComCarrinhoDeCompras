# Relatório de investigação — catálogo e mídias

**Data da verificação:** 2026-10-25  
**Projeto:** Angel Cosméticos  
**Escopo:** leitura dos manifestos de mídia no GitHub e consultas somente leitura ao Supabase `bmqxgibhuzekxpcgosap`.

> **Segurança:** esta investigação foi somente leitura. Não foram executados INSERT, UPDATE, DELETE, uploads, exclusões ou movimentações de arquivos.

## 1. Conclusão executiva

A investigação conseguiu cruzar o manifesto de 507 mídias com o catálogo atualmente acessível no Supabase. Ainda não foi possível concluir a inspeção visual de cada arquivo: os caminhos no inventário apontam para arquivos locais do Windows (`D:\\LojaVirtualComCarrinhoDeCompras\\assets...`) e o conteúdo acessível pelo GitHub retornou os CSVs/índice textual, mas não os binários das imagens importadas. `docs/catalogo-visual.md` é uma lista de nomes e tamanhos, não uma folha de miniaturas.

Há evidência concreta de que as mídias comerciais ainda não estão integradas ao Storage:
- 13 produtos ativos;
- 14 registros em `produto_imagem`;
- 13 desses registros são placeholders `placehold.co`;
- 1 URL é externa (VTEX) para o produto 1;
- 0 objetos no bucket `product-images`.

Portanto, o principal gap não é a existência do cadastro: é substituir os placeholders por fotos reais verificadas, preservando vínculos comerciais corretos.

## 2. Qualidade dos manifestos atuais

Fontes: `docs/inventario-midias.csv`, `docs/duplicidades-midias.csv`, `docs/manifesto-midias.csv`, `docs/manifesto-organizacao.csv`, `docs/mapping-supabase.csv` e `docs/catalogo-visual.md`.

| Verificação | Resultado |
|---|---:|
| Arquivos no inventário | 507 |
| Hashes únicos | 281 |
| Grupos de duplicidade exata | 203 |
| Linhas no CSV de duplicidades | 429 |
| Cópias excedentes dentro dos grupos | 226 |
| Linhas em cada manifesto de classificação/mapeamento | 507 |
| Itens com revisão pendente em `manifesto-midias.csv` | 507 |
| Itens com confiança baixa em `manifesto-midias.csv` | 507 |
| Itens com revisão pendente em `mapping-supabase.csv` | 507 |
| Itens com ID real de produto preenchido no mapa | 0 |
| Itens com caminho de Storage proposto preenchido | 0 |

### Classificação registrada em `manifesto-midias.csv`

| Tipo candidato | Quantidade |
|---|---:|
| Não classificado | 305 |
| Produto | 113 |
| Marca | 57 |
| Categoria | 21 |
| Banner | 11 |
| **Total** | **507** |

Os 113 itens classificados como candidatos a produto não devem ser automaticamente vinculados aos produtos atuais: o campo `ProdutoCandidato` está vazio para todos os 507 itens no mapa de integração. A classificação por nome/pasta ainda não comprova correspondência visual nem comercial.

### Distribuição por pasta no inventário

| Pasta | Arquivos | Grupos de duplicidade exata |
|---|---:|---:|
| `produtos/` | 410 | 159 |
| `fornecedores/` | 57 | 26 |
| `categorias/` | 21 | 9 |
| `banners/` | 19 | 9 |
| **Total** | **507** | **203** |

A diferença entre os 19 arquivos na pasta `banners/` e os 11 classificados como `banner` no manifesto reforça que a classificação atual ainda não está completa. Vídeos também exigem revisão de conteúdo e não devem ser tratados como banners estáticos sem verificação.

## 3. Estado atual do Supabase — consulta somente leitura

Projeto consultado: `bmqxgibhuzekxpcgosap`.

| Entidade | Contagem |
|---|---:|
| `produto` | 13 |
| Produtos ativos | 13 |
| `categoria` | 7 |
| `fornecedor` | 3 |
| `produto_categoria` | 13 vínculos |
| `produto_imagem` | 14 registros |
| Objetos de Storage em `product-images` | 0 |

### Produtos atuais e categorias

| ID | Produto | Categoria | Fornecedor | Estado de mídia observado |
|---:|---|---|---|---|
| 1 | Esmalte Cristal Vermelho | Esmalte (1) | Sem fornecedor | 1 URL externa VTEX + 1 placeholder secundário |
| 14 | Batom Matte Vermelho | Maquiagem (20) | Mary Kay Cosméticos (11) | Placeholder principal |
| 15 | Base Líquida Clara | Maquiagem (20) | Mary Kay Cosméticos (11) | Placeholder principal |
| 16 | Máscara de Cabelos | Cabelos (22) | Bela Cosméticos LTDA (12) | Placeholder principal |
| 17 | Sabonete Líquido | Corpo e Banho (23) | Puro Cosméticos (10) | Placeholder principal |
| 18 | Esmalte Vermelho | Esmalte (1) | Mary Kay Cosméticos (11) | Placeholder principal |
| 19 | Álcool Gel | Corpo e Banho (23) | Puro Cosméticos (10) | Placeholder principal |
| 20 | Protetor Solar | Cuidados com a Pele (21) | Bela Cosméticos LTDA (12) | Placeholder principal |
| 21 | Shampoo Antirresíduo | Cabelos (22) | Bela Cosméticos LTDA (12) | Placeholder principal |
| 22 | Hidratante Labial | Cuidados com a Pele (21) | Mary Kay Cosméticos (11) | Placeholder principal |
| 23 | Máscara Facial | Cuidados com a Pele (21) | Puro Cosméticos (10) | Placeholder principal |
| 24 | Óleo Capilar | Cabelos (22) | Bela Cosméticos LTDA (12) | Placeholder principal |
| 25 | Desodorante Roll-on | Corpo e Banho (23) | Puro Cosméticos (10) | Placeholder principal |

Os nomes e categorias acima refletem o banco consultado em 2026-10-25. A tabela descreve URLs e registros, não a validação visual das fotos.

### Categorias atuais

| ID | Nome | Slug |
|---:|---|---|
| 1 | Esmalte | `esmalte` |
| 20 | Maquiagem | `maquiagem` |
| 21 | Cuidados com a Pele | `cuidados-pele` |
| 22 | Cabelos | `cabelos` |
| 23 | Corpo e Banho | `corpo-banho` |
| 24 | Acessorios | `acessorios` |
| 25 | Promocoes | `promocoes` |

### Divergência documental relevante

`docs/LOTE_A_CATALOGO.md` registra um estado anterior em que `produto_categoria` estava vazia e a categoria 1 se chamava “Esmalgue”. Na consulta atual, há 13 vínculos e a categoria 1 se chama “Esmalte” com slug `esmalte`. O relatório antigo deve ser tratado como histórico, não como fotografia do estado atual do banco.

## 4. Riscos e decisões de integração

1. **Não usar nomes de arquivo como prova de correspondência.** Há nomes de mídia relacionados a produtos/brands específicos (por exemplo, Mary Kay e Eudora), enquanto o catálogo atual usa vários nomes genéricos. A associação exige inspeção da imagem e conferência do produto real.
2. **Não carregar todos os 410 arquivos de `produtos/` no Storage.** Parte pode ser arte, evento, avatar, logo, banner, captura de tela ou duplicata; a pasta e o nome não garantem que seja foto comercial.
3. **Não tratar fornecedores como marcas automaticamente.** O vínculo de fornecedor do catálogo é uma entidade comercial; marca no arquivo pode ser uma fabricante/linha e precisa de confirmação.
4. **Não substituir a URL VTEX automaticamente.** Preservar a referência externa até confirmar a imagem e aprovar a migração.
5. **Não remover duplicatas ainda.** Os hashes provam igualdade binária, mas não mostram quais caminhos são consumidos por UI, documentação ou rotinas de importação.
6. **Manter avatares separados.** A pasta `AVATAR` não aparece como classe própria no inventário de 507 arquivos; deve receber inventário separado, sem misturar retratos pessoais com imagens comerciais.

## 5. Próximo passo para concluir o inventário visual

É necessário disponibilizar os arquivos binários originais — por exemplo, um ZIP da pasta `assets-importacao/catalogo/` ou uma cópia acessível das pastas de mídia — porque os manifestos e o índice atual não contêm miniaturas. A pasta `AVATAR` deve ser enviada separadamente.

Com os binários acessíveis, gerar uma folha de contato em lotes, mantendo o nome do arquivo e o hash visíveis, e completar o mapa com:

- classificação visual confirmada;
- produto/categoria/fornecedor candidato e evidência;
- confiança e decisão humana;
- caminho original e caminho canônico sugerido;
- destino editorial ou comercial;
- estado `aprovado`, `pendente`, `não publicar` ou `duplicata exata`.

O vínculo comercial e qualquer upload ao Supabase continuam como etapa posterior, depois da revisão. Nenhuma mutação de banco ou Storage foi realizada nesta investigação.
