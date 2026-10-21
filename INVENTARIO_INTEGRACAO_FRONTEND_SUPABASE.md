# INVENTÁRIO DE INTEGRAÇÃO — FRONTEND ↔ SUPABASE (somente leitura)

**Data:** 2026-10-01
**Projeto Supabase:** `bmqxgibhuzekxpcgosap.supabase.co`
**Método:** consultas `select` via publishable key. **Nenhuma escrita, nenhuma
migration, nenhuma alteração de banco.** Scripts temporários removidos após a auditoria.

---

## 1. Correção importante ao briefing

A descrição "o banco já tem bastante coisa" está **meio certa**. O que existe é o
**schema**, não o **negócio**. Vale separar as duas coisas:

```
SCHEMA   → 26 tabelas presentes e modeladas
NEGÓCIO  → 24 delas estão VAZIAS
```

> Consequência prática: um site com catálogo, carrinho, checkout e conta pode ser
> **perfeitamente construído e functional contra este banco hoje**, e ainda assim
> aparecer **vazio para o visitante**. Schema não é dado.

---

## 2. Contagem real, tabela por tabela

| Tabela | Linhas | Leitura |
|---|---:|---|
| `produto` | **13** | seed/teste — ver §4 |
| `categoria` | **7** | 1 com defeito — ver §5 |
| `fornecedor` | **3** | **dados fictícios** — ver §5 |
| `produto_variante` | **1** | 1 linha, `produto_id = 1` |
| `produto_imagem` | **0** | **crítico** — ver §3 |
| `produto_categoria` | 0 | |
| `produto_atributo` | 0 | |
| `produto_atributo_valor` | 0 | |
| `produto_variante_atributo` | 0 | |
| `produto_opcao_compra` | 0 | |
| `produto_opcao_valor` | 0 | |
| `kit_composicao` | 0 | |
| `promocao` | 0 | |
| `estoque` | 0 | |
| `estoque_movimentacao` | 0 | |
| `cliente` | 0 | |
| `endereco` | 0 | |
| `carrinho` | 0 | |
| `carrinho_item` | 0 | |
| `pedido` | 0 | |
| `pedido_item` | 0 | |
| `pedido_status_historico` | 0 | |
| `pagamento` | 0 | |
| `frete_regra` | 0 | |
| `atendimento` | 0 | |
| `atendimento_mensagem` | 0 | |
| `evento` | 0 | |
| `auditoria` | 0 | |
| `orcamento` | **não existe** | erro PGRST205 |
| `orcamento_item` | **não existe** | erro PGRST205 |

**Resumo:** 4 tabelas com dados, 22 vazias, 2 inexistentes.

---

## 3. Achado crítico — não há uma única imagem no banco

`produto_imagem` **existe** e tem as colunas previstas (`produto_id`, `url`,
`ordem`, `principal`), mas tem **0 linhas**.

Verifiquei se as imagens estariam em outra tabela. Todas ausentes:

| Tabela candidata | Resultado |
|---|---|
| `produto_imagem` | existe, 0 linhas |
| `imagem`, `produto_foto`, `fotos`, `galeria`, `galeria_imagem`, `evento_imagem`, `evento_foto`, `midia` | **inexistentes** (PGRST205) |

E `produto` **não tem nenhuma coluna de imagem**:

```
id, nome, slug, descricao, preco_base, fornecedor_id, ativo, created_at, updated_at
```

**Portanto: o banco não contém nenhuma imagem de produto.** Não há `placehold.co`
armazenado lá — os placeholders que você viu não vêm do banco.

### Impacto direto na Slice 1

O contrato de produto que fechamos **não pode ser Cumprido hoje**:

| Slot de imagem | Fonte hoje | Estado |
|---|---|---|
| 01 capa | — | ❌ inexistente |
| 02 ângulo | — | ❌ inexistente |
| 03 detalhe/textura | — | ❌ inexistente |
| 04 aplicação/contexto | — | ❌ inexistente |
| 05 lifestyle | — | ❌ inexistente |

**A galeria de 5 imagens precisa ser desenhada e validada com um fallback de
"produto sem imagem"** — e o desenho só faz sentido se tratarmos a ausência de
imagem como estado de primeira classe, não como exceção.

O bucket `product-images` está vazio e não há script de carga de imagens.

---

## 4. Os 13 produtos são seed de teste

Evidências verificáveis:

1. **IDs 2–13 não existem.** A sequência vai de `id = 1` para `id = 14…25`.
   As linhas 2–13 foram removidas ou nunca existiram — o ID 1 ficou órfão.
2. **12 dos 13 têm `descricao = null`.** Só `produto.id = 1` tem descrição, e
   ela é genérica: *"Esmalte brilhante de alta qualidade"*.
3. **Produtos genéricos atribuídos a cosméticos:**
   `Álcool Gel`, `Sabonete Líquido`, `Desodorante Roll-on`, `Máscara Facial` —
   atribuídos a "Mary Kay", "Bela Cosméticos" e "Puro Cosméticos".
4. **Nenhum produto está ligado a categoria** (`produto_categoria` = 0). O
   catálogo está sem classificação.
5. **Apenas 1 produto tem variante** (`produto_variante` = 1, para `produto_id = 1`).

> **Classificação: `DADO DE TESTE`.** Nenhum destes registros deve ser tratado
> como catálogo real da Angel. Não há produto, preço ou imagem real no banco.

---

## 5. Os "fornecedores reais" são fictícios

Isto contraria diretamente o ponto 4 do briefing.

| id | nome | cnpj | telefone | email |
|---:|---|---|---|---|
| 10 | Puro Cosmeticos | `11223344556677` | `11987654323` | vendas@puro.com |
| 11 | Mary Kay Cosmeticos | `01020304000109` | `11987654321` | **fornedor**@marykay.com |
| 12 | Bela Cosmeticos LTDA | `98765432100109` | `11987654322` | contato@bela.com |

Evidência de falsidade:

- **CNPJs são dígitos sequenciais** — `11223344556677`, `01020304000109`,
  `98765432100109`. Nenhum CNPJ válido tem esse padrão.
- **Telefones são sequenciais** — `…321`, `…322`, `…323`.
- **Erro de digitação**: `fornedor@marykay.com`.

**Classificação: `DADO DE TESTE`.**

O modelo de fornecedor está correto e deve ser preservado — **não recriamos
nenhum modelo**. Mas **os registros precisam ser substituídos por fornecedores
reais antes de qualquer go-live**, e isso é uma pendência de negócio, não de código.

---

## 6. Defeito de dado em `categoria`

```json
{"id":1,"nome":"Esmalgue","slug":"esmalhe","ativo":true}
```

Dois erros no mesmo registro:

- `nome` = **"Esmalgue"** — não existe essa categoria; o correto seria "Esmalte".
- `slug` = **"esmalhe"** — não é a transliteração de nenhum dos dois.

As outras 6 categorias estão coerentes (`maquiagem`, `cuidados-pele`,
`cabelos`, `corpo-banho`, `acessorios`, `promocoes`).

---

## 7. O que o frontend realmente consome hoje

| Tabela | Frontend | Estado |
|---|---|---|
| `produto` | `pages/Products`, `pages/Product`, `Admin/Produtos`, `Home` | parcial — lê `id, nome, slug, descricao, preco_base` |
| `produto_imagem` | `commerce/ProductGallery`, `ProductCard`, `pages/Product` | **conectado, mas retorna 0 linhas → sempre cai no placeholder** |
| `categoria` | filtro do catálogo | parcial |
| `orcamento` | `pages/Orcamento`, `Admin/Orcamentos` | **tabela inexistente → BLOQUEADO PELO BACKEND** |

**Nenhum outro domínio é consumido.** `fornecedor`, `estoque`, `promocao`,
`produto_variante`, `cliente`, `endereco`, `carrinho`, `pedido`, `pagamento`,
`frete_regra`, `evento` existem no schema e **não têm contrapartida no frontend**.

---

## 8. Matriz de integração

| Domínio | Schema | Dados | Frontend | Situação |
|---|---|---|---|---|
| Produtos | ✅ | 13 seed | parcial | reconstruir em Slice 1 |
| **Imagens** | ✅ | **0** | fraco | **crítico** — sem dado nenhum |
| **Zoom / Lightbox** | — | — | ❌ | implementar |
| Categorias | ✅ | 7 | parcial | corrigir registro 1 |
| Fornecedores | ✅ | 3 fictícios | ❌ | admin; **dados a substituir** |
| Variantes | ✅ | 1 | parcial | implementar |
| Atributos | ✅ | 0 | ❌ | implementar |
| Opções de compra | ✅ | 0 | ❌ | implementar |
| Kits | ✅ | 0 | ❌ | implementar |
| Promoções | ✅ | 0 | ❌ | implementar |
| Estoque | ✅ | 0 | parcial | implementar |
| Movimentação | ✅ | 0 | ❌ | admin |
| Clientes | ✅ | 0 | ❌ | Auth + perfil |
| Endereços | ✅ | 0 | ❌ | conta / checkout |
| Carrinho | ✅ | 0 | parcial (local) | integrar |
| Pedidos | ✅ | 0 | parcial | integrar |
| Status histórico | ✅ | 0 | ❌ | implementar |
| Pagamento | ✅ | 0 | parcial | integrar |
| Frete | ✅ | 0 | ❌ | implementar |
| Atendimento | ✅ | 0 | ❌ | implementar |
| Eventos | ✅ | **0** | ❌ | **galeria sem dado — ver §9** |
| Auditoria | ✅ | 0 | ❌ | admin |
| **Orçamento** | ❌ | ❌ | ❌ | **migração futura, SQL revisado** |

---

## 9. A galeria de eventos: sem estrutura E sem dados

Este ponto merece destaque porque a galeria de eventos é patrimônio central.

- A tabela `evento` **existe** no schema.
- `evento` tem **0 linhas**.

Não existe `evento_imagem` nem `evento_foto`. Não há onde associate uma foto a um
evento no banco.

**As imagens de eventos existem como arquivos** (`assets/img/evento*.png|jpeg`,
`introducao*.png`, `grasi*`, entre outras), mas estão **soltas em disco, sem
metadado, sem nome de evento, sem ano, sem data**.

> Consequência: qualquer apresentação "por evento / por ano / por categoria"
> **exigiria inventar classificação** — o que está proibido.
> A galeria pode ser montada como **acervo visual com flyers reais**, usando
> apenas texto que exista nos arquivos, até que `evento` seja populada.

---

## 10. O que muda na Slice 1

A Slice 1 foi definida como:

```
produto → produto_imagem → produto_variante → estoque → ProductPage → Carrinho
```

Com os dados atuais, três dos quatro elos do início estão **austeridade zero**:

| Elo | Realidade |
|---|---|
| `produto` | 13 seed, sem categoria, sem descrição |
| `produto_imagem` | **vazio** |
| `produto_variante` | 1 linha |
| `estoque` | **vazio** |

A Slice 1 **não pode ser validada de ponta a ponta** sem carga de dados. O que
*dá* para fazer agora, e vale fazer:

1. Construir a página de produto contra o schema real, com **estados completos**:
   sem imagem, uma imagem, cinco imagens; sem variante, com variante; sem estoque,
   com estoque; com e sem promoção.
2. Fazer a galeria degradar com elegância para o caso **zero imagens** — que é o
   estado de 100% do catálogo hoje.
3. Não exibir preço de variante, desconto ou estoque que não existam.

O que **bloqueia a validação**: carga real de produtos, imagens, categorias e
estoque. Isso é pendência de conteúdo/dados.

---

## 11. Pendências que exigem decisão de negócio

1. **Catálogo real** — onde estão os produtos verdadeiros da Angel? O PDF do
   catálogo ainda não foi fornecido. Sem ele, não há o que cadastrar.
2. **Imagens reais** — o acervo em `assets/img/` é do site legado e precisa ser
  triado: quais fotos são de produto real, e em que ângulo? Sem isso, os 5 slots
   ficam sem origem.
3. **Fornecedores reais** — os 3 cadastrados são fictícios e precisam ser
   substituídos por dados reais (nome, CNPJ válido, contato).
4. **Categoria "Esmalgue"** — corrigir para "Esmalte" + slug `esmalte`?
   É uma correção de dado; não executei nada.
5. **`orcamento` / `orcamento_item`** — continuam inexistentes. A migration de
   reconciliação já redigida precisa ser revisada antes de qualquer aplicação.
   **Nada foi aplicado.**
6. **`evento`** — a galeria de eventos é patrimônio, mas `evento` está vazia e
   não tem tabela de imagens. Definir se a galeria nasce como acervo em disco
   ou se vamos popular `evento` com dados que ainda não existem.

---

## 12. Regras que permanecem

- Nenhuma escrita foi feita no Supabase nesta auditoria.
- Nenhum registro foi criado, alterado ou removido.
- Nenhuma migration foi aplicada.
- Nenhum produto, preço, fornecedor, evento, avaliação ou métrica foi inventado.
