# Classificação e mapa de integração de mídias — Angel Cosméticos

**Escopo:** análise documental do inventário de importação em `docs/inventario-midias.csv`, da relação de duplicidades em `docs/duplicidades-midias.csv`, das regras de `docs/IMAGENS_PRODUTOS.md` e do manifesto existente `web/src/domains/conteudo/model/asset.ts`.

**Limite desta etapa:** os arquivos binários não foram inspecionados visualmente nesta análise. Portanto, esta matriz classifica por pasta, intenção e destino técnico; não afirma que uma foto específica corresponde a um produto específico. Nenhum arquivo foi removido ou movido, nenhuma mídia foi enviada ao Supabase e nenhuma tabela/registro foi alterado.

## 1. Inventário confirmado pelos CSVs

| Indicador | Resultado |
|---|---:|
| Arquivos inventariados | 507 |
| Hashes SHA-256 únicos | 281 |
| Grupos de duplicidade exata | 203 |
| Linhas em `duplicidades-midias.csv` | 429 |
| Cópias excedentes dentro dos grupos | 226 |

A relação de duplicidades contém uma linha por arquivo participante de um grupo, com hash, caminho canônico sugerido, caminho observado e indicador `IsCanonical`. O caminho canônico é uma **sugestão de referência**, não uma autorização para excluir ou sobrescrever arquivos.

### Distribuição por pasta de origem

| Pasta | Arquivos | Grupos de duplicidade exata | Tratamento proposto |
|---|---:|---:|---|
| `produtos/` | 410 | 159 | Classificação visual e correspondência com catálogo antes de qualquer associação comercial |
| `fornecedores/` | 57 | 26 | Identificar logotipo/material e confirmar marca/fornecedor antes de publicar |
| `categorias/` | 21 | 9 | Selecionar imagens representativas por categoria real do catálogo |
| `banners/` | 19 | 9 | Separar peças estáticas, vídeos e variações de campanha; validar conteúdo e dimensões |

Os grupos são calculados por hash exato. Imagens visualmente parecidas, recortadas, redimensionadas ou recomprimidas podem não aparecer como duplicatas nesse relatório.

## 2. Matriz de classificação e integração

| Classe | Origem principal | Critério para aprovar | Destino de integração | Estado nesta etapa |
|---|---|---|---|---|
| Foto comercial de produto | `produtos/<fornecedor>/<categoria>` e `produtos/sem-fornecedor` | Conferir embalagem, nome, variante e correspondência com produto ativo no catálogo | Fluxo comercial `produto_imagem` + Storage `product-images`, após aprovação explícita e validação do cadastro | **Pendente de revisão visual e vínculo ao produto** |
| Imagem editorial de categoria | `categorias/` | Relacionar à categoria real existente; evitar imagem enganosa ou incompatível | Conteúdo/UI do catálogo por meio do domínio de conteúdo existente | **Pendente de seleção e mapeamento** |
| Logo/material de fornecedor | `fornecedores/` | Confirmar identidade visual, origem e uso permitido; distinguir logo oficial de rascunho | Conteúdo de marca/fornecedor; não tratar como logotipo da Angel | **Pendente de validação** |
| Banner promocional/institucional | `banners/` | Conferir texto, validade, proporção, campanha, legibilidade e versão desktop/mobile | Área de banners/hero/cinemática do site, aproveitando o manifesto de conteúdo | **Pendente de validação editorial** |
| Vídeo promocional | Arquivos de vídeo identificados no inventário, inclusive em `banners/` | Reproduzir e validar duração, áudio, proporção, direitos e comportamento sem som | Slot de vídeo/cinemática do conteúdo, com fallback estático acessível | **Pendente de reprodução e validação** |
| Avatar/retrato | Pasta `AVATAR`, separada do catálogo comercial | Confirmar pessoa/uso, consentimento, finalidade e se é perfil interno ou conteúdo público | Trilha separada; não misturar com fotos de produto, logos ou banners | **Não consta como classe separada no CSV de 507 itens; auditar a pasta separadamente** |
| Não classificado/rascunho | `outros/` e arquivos sem identidade confirmada | Só aprovar após identificar finalidade, origem e risco de publicação | Quarentena documental; não renderizar automaticamente | **Pendente de revisão** |
| SVG de interface | Assets vetoriais do projeto | Verificar se é ícone/elemento de interface ou imagem comercial | UI/ícones; não usar como substituto de fotografia comercial | **Manter finalidade técnica** |

## 3. Mapa técnico recomendado

### A. Conteúdo editorial do site

Reutilizar `web/src/domains/conteudo/model/asset.ts`, que já define `PatrimonioAsset`, `PATRIMONIO`, `PATRIMONIO_NAO_CONTEUDO` e consultas como `assetsDoContexto` e `assetsDoProduto`. Não criar um segundo manifesto paralelo.

- Imagens aprovadas para publicação devem receber caminho público estável, texto alternativo e contexto correto.
- Arquivos de teste/desenvolvimento permanecem fora do conjunto renderizável.
- Categorias, marcas, banners, hero e vídeo devem usar o contexto editorial correspondente.
- A inclusão no manifesto não prova que um produto está cadastrado, ativo ou à venda.

### B. Fotos comerciais de produto

Reutilizar o contrato descrito em `docs/IMAGENS_PRODUTOS.md` e o serviço comercial existente `web/src/domains/produtos/services/produtoImagem.service.ts`.

1. Criar uma tabela de correspondência revisada: caminho original → hash → produto candidato → evidência visual → decisão → ordem → principal/secundária.
2. Confirmar cada candidato contra os dados reais do catálogo antes de atribuir `produto_id`.
3. Manter a fonte de verdade comercial em `produto`/`produto_imagem`; o Storage `product-images` é o destino dos arquivos definitivos.
4. Não substituir URLs externas automaticamente e não gravar caminhos no banco só porque o nome do arquivo parece corresponder.
5. Executar upload e inserções somente numa etapa posterior, com autorização explícita, prévia de lote e validação de rollback.

### C. Duplicidades

- Preservar todos os arquivos na fase de classificação.
- Usar `Canonical` como preferência de referência para revisão, não como regra automática de exclusão.
- Se dois caminhos de uso diferentes apontarem para o mesmo hash, confirmar primeiro todos os consumidores e referências.
- Só propor limpeza depois que o mapeamento estiver aprovado, o caminho canônico for testado no build e houver plano de reversão.

## 4. Ordem de trabalho

1. **Catalogar visualmente** os 507 itens em lotes, com miniaturas/contato visual e metadados; incluir a pasta `AVATAR` em relatório separado, sem misturá-la aos 507 se não fazia parte do CSV.
2. **Revisar produtos**: identificar marca, linha, variante e produto correspondente; registrar candidatos ambíguos como pendentes.
3. **Revisar conteúdo**: selecionar imagens de categoria, logos, banners e vídeos e registrar destino/alt text/estado de aprovação.
4. **Gerar mapa por arquivo** com decisão `aprovado`, `pendente`, `rascunho`, `duplicata exata` ou `não publicar`, mantendo hash e caminhos original/canônico.
5. **Implementar apenas o mapeamento editorial aprovado** no manifesto existente e validar testes/build/caminhos públicos.
6. **Planejar separadamente** o lote comercial para `product-images` e `produto_imagem`; não executar mutações no banco nesta etapa.
7. **Considerar limpeza de duplicatas por último**, com evidência de ausência de referências e reversibilidade.

## 5. Critérios de aceite

- [ ] Cada arquivo tem classificação, responsável/decisão e justificativa.
- [ ] Nenhum produto recebe foto por inferência baseada apenas no nome do arquivo.
- [ ] Nenhum rascunho, avatar interno ou logo de terceiro é publicado sem validação.
- [ ] Os caminhos do manifesto existem e funcionam no build/servidor.
- [ ] Imagens comerciais e editoriais permanecem em fluxos distintos.
- [ ] Duplicatas não são excluídas automaticamente.
- [ ] Nenhum upload, alteração de `produto_imagem` ou mudança no banco ocorre sem aprovação específica.

## 6. Evidências e lacunas

**Fontes verificadas:** `docs/inventario-midias.csv`, `docs/duplicidades-midias.csv`, `docs/IMAGENS_PRODUTOS.md`, `web/src/domains/conteudo/model/asset.ts` e pesquisa no repositório sobre o serviço `produtoImagem.service.ts`.

**Ainda necessário para concluir a classificação arquivo a arquivo:** acesso às imagens binárias/miniaturas e ao catálogo atual de produtos/categorias/fornecedores. Os CSVs atuais registram caminho, extensão, tamanho e hash; esses metadados não bastam para confirmar visualmente o conteúdo ou a correspondência comercial.
