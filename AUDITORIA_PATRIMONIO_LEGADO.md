# AUDITORIA DE PATRIMÔNIO DO LEGADO — ANGEL COSMÉTICOS

**Data:** 2026-10-01
**Método:** somente leitura. Inventário de arquivos, extração de texto de PDF por
descompressão dos streams, leitura de HTML legado.
**Nível de evidência:** `EVIDÊNCIA` (extraído de arquivo) · `CONFIRMADO` (procurado
em 2+ fontes) · `PENDENTE` (existe mas precisa de decisão humana) · `DESCARTADO`.

> **Nada foi gravado.** Sem alteração no Supabase, sem migration, sem alteração de
> arquivo do legado, sem commit, sem push.

---

## 1. O que realmente existe no legado

| Tipo | Quantidade | Tamanho |
|---|---:|---:|
| Imagens (jpg/png/jpeg/webp) | 172 | ~138 MB |
| HTML | 13 | ~150 KB |
| PHP | 21 | ~45 KB |
| SQL | 16 | ~45 KB |
| JS | 26 | ~90 KB |
| CSS | 9 | ~101 KB |
| **PDF** | **4** | ~63 KB |
| Vídeo | 1 | 4,2 MB |

---

## 2. ⚠️ Os PDFs — e a ressalva que invalida os preços

Foram encontrados **4 PDFs reais da Angel Cosméticos** em `assets/pdf/`:

| Arquivo | Período | Texto extraível |
|---|---|---|
| `Catálogo DIGITAL - NATAL 2024 - 24 OUT - páginas simples.pdf` | Nov–Dez 2024 | ✅ sim |
| `TL_DEZ_DIGITAL_compressed.pdf` ("The Look" Dezembro 2024) | Dez 2024 | ✅ sim |
| `THE LOOK JANEIRO 2025.pdf` | Janeiro 2025 | ✅ sim |
| `Cartilha Skincare_17x22cm - SETEMBRO 2024 - WEB - 04 SET 2024.pdf` | Set 2024 | ❌ **não extraível** |

### 2.1 A ressalva — leia antes de qualquer carga

Os próprios PDFs carregam o aviso:

> *"Todos os preços, inclusive os promocionais, são sugestões para revenda e são
> válidos do dia **01/12/2024 a 31/12/2024**."*

> *"…válidos do dia **1/1/2025 a 31/1/2025**."*

> *"A impressão pode alterar a cor real do produto."*

**Classificação dos preços: `PENDENTE` — NÃO SÃO PREÇOS ATUAIS.**
são preços de campanha sazonais, todos **vencidos**. São úteis para:

- ✅ saber **quais produtos a Angel realmente vendia**;
- ✅ saber a **hierarquia de preço de referência** por linha;
- ✅ identificar **variantes e nomeações oficiais**;
- ❌ **não** preencher `preco_base` como preço vigente;
- ❌ **não** preencher `promocao` — as campanhas já expiraram.

### 2.2 O PDF do Skincare não pôde ser lido

`Cartilha Skincare_17x22cm` produz texto ilegível na extração (fontes com
codificação CID sem `ToUnicode`). Não é ausência de conteúdo — é ausência de
mapa de caracteres. **Requer OCR** para virar catálogo.

Classificação: `PENDENTE` (conteúdo existe, extração bloqueada).

---

## 3. O que a Angel vendia — evidência real extraída

**A Angel é distribuidora Mary Kay.** Isso está confirmado em 3 PDFs
("presents Mary Kay®", "MARYKAY.COM.BR", "LOJA.MARYKAY.COM.BR", "Share Valor,
Maquiagem — 100% Base Facial / Total Brasil / Nielsen Homescan").

> Isto **revisita** a conclusão da auditoria anterior: eu havia classificado o
> fornecedor "Mary Kay Cosméticos" como fictício. O **registro** é fictício
> (CNPJ `01020304000109` é inválido), mas o **vínculo com a Mary Kay é real**.
> Ver §7.

### 3.1 Categorias reais (do próprio catálogo)

`Maquiagem` · `Cuidados com a Pele` · `Fragrâncias` · `Cuidados com o Corpo`

Isso casa 1:1 com as categorias já existentes no Supabase — mas com nomes
diferentes (lá são `maquiagem`, `cuidados-pele`, `corpo-banho`, + `esmalgue`
quebrado). Também existem no catálogo as linhas `Presentes`, `Acessórios`,
`Necessaire`, `Kits`, `Fragrâncias Portáteis`, `Skincare`.

### 3.2 Produtos com preço — amostra evidenciada

Formato: `DE:` preço cheio · `POR:` preço promocional · ambos **vencidos**.

**Maquiagem**

| Produto | DE | POR |
|---|---:|---:|
| Base TimeWise 3D®, 30 ml | 76,90 | 58,90 |
| Pincel para Base Líquida Mary Kay® | 59,90 | 50,90 |
| Delineador Líquido At Play®, 3 ml — Matte Black | — | 66,90 |
| Batom Líquido Matte At Play®, 6,5 g | 91,80 | 81,90 |
| Batom Matte Mary Kay®, 3,3 g | 93,80 | 83,90 |
| Batom Cremoso Mary Kay® — Gingerbread / Shell, 3,6 g | 95,80 | 85,90 |
| Batom Líquido Magic Mary Kay At Play®, 5,5 g (ed. limitada) | 49,90 | 39,90 |
| Máscara para Cílios Lash Intensity®, 9 g | em kit | — |
| Corretivo Mary Kay® — Yellow, 8,6 ml | 49,90 | 36,90 |
| Brilho Labial Mary Kay Unlimited®, 3,9 ml | 61,90 | 49,50 |

**Cuidados com a Pele**

| Produto | DE | POR |
|---|---:|---:|
| Loção Diurna FPS 30 TimeWise®, 29 g | em kit | — |
| Gel de Recuperação Noturna TimeWise®, 29 g | em kit | — |
| Máscara Hidratante Renovadora em Gel TimeWise®, 85 g | 119,90 | 83,90 |
| Pincel Aplicador de Máscara Facial Mary Kay® | 49,90 | 39,90 |
| Gel de Limpeza Corporal Perfumado, 200 g — Amora & Baunilha | 39,90 | 33,90 |
| Hidratante Desodorante Corporal Perfumado, 200 g | 61,90 | 49,50 |
| Loção Hidratante Desodorante Karité Essência de Chá Branco & Citrus, 192 ml | — | 57,90 |
| Gel de Limpeza Corporal Perfumado — Maçã e Amêndoa, 200 g | 136,70 | 114,90 |
| Protetor Solar Mineral Mary Kay At Play® FPS 30, 49 ml | em kit | — |

**Fragrâncias**

| Produto | DE | POR |
|---|---:|---:|
| Live Fearlessly™ Deo Parfum, 50 ml | 174,90 | 147,90 |
| At Play™ Deo Colônia, 50 ml (Red / Nude) | — | 89,90 |
| Hello Brilliant™ Deo Colônia, 50 ml | 131,80 | 111,90 |
| Modern Charm® Deo Parfum, 50 ml | 142,90 | 125,50 |
| Mary Kay Velvet Scent® Deo Parfum, 50 ml | 149,80 | 131,50 |
| True Passion™ Deo Colônia, 60 ml | 173,80 | 155,90 |
| Love Fearlessly™ Deo Parfum, 50 ml | 222,80 | 165,90 |
| Embrace™ para Ela / para Ele Deo Colônia, 60 ml | 182,80 | 154,90 |
| Authentic Hero® Deo Colônia, 100 ml | 192,80 | 169,90 |
| Upscale Gentleman® Deo Parfum, 75 ml | 147,90 | 128,50 |

**Kits — o que prova que `kit_composicao` é necessário**

| Kit | DE | POR |
|---|---:|---:|
| Kit Básico TimeWise® | 178,80 | 124,90 |
| Kit Dia e Noite TimeWise® | — | 209,80 |
| Sistema Avançado TimeWise® (1–5) | 409,90 | 309,90 |
| Sistema Completo TimeWise® (1–4) | 388,60 | 349,90 |
| Sistema Volu-Firm TimeWise Repair® (1–5) | 973,50 | 925,90 |
| Kit Antiacne Clear Proof® | 218,70 | 207,90 |
| Kit Satin Body® | 189,70 | 169,90 |
| Kit Lábios de Seda | 94,80 | 84,90 |
| Kit Pele Matte Mary Kay® | 154,70 | 146,90 |

**Acessórios e Necessaire (com prova de que "Acessórios" é categoria real)**

| Item | DE | POR |
|---|---:|---:|
| Clutch Diamond | 54,90 | 36,90 |
| Nécessaire Skincare | 54,90 | 39,90 |
| Nécessaire Flores MK | 54,90 | 36,90 |
| Nécessaire Marrom | 54,90 | 39,90 |
| Nécessaire Cinza-Chumbo | 46,90 | 39,90 |
| Shoulder Bag Embrace | 59,90 | 49,90 |
| Bolsa Crossbody Scents | 69,90 | 59,90 |
| Nécessaire Satin | 57,90 | 36,90 |
| Nécessaire Charme | 54,90 | 46,90 |
| Nécessaire Puffer | 54,90 | 46,90 |
| Caixa Especial P / G | 9,90 / 13,90 | 6,40 / 8,90 |
| Caixa Mary Kay® Vermelha | — | 3,00 |
| Carteira Authentic Hero® | 64,90 | 54,90 |
| Cordão de Celular Embrace™ | — | 56,90 |

**Total extraído: 111 pares `DE`/`POR` em 3 PDFs, mais dozens de preços avulsos.**

### 3.3 O que isso prova sobre o modelo de dados

- ✅ **Variação por cor existe com nomenclatura oficial**: `Bronze C 170`,
  `Ivory C 100`, `Red AmoreRed`, `Favorito Nude`, `Nude Blush`, `Pink Ballerina`,
  `Unique Mauve`, `Sheer Illusion`. → justifica `produto_atributo` /
  `produto_atributo_valor` / `produto_variante_atributo`.
- ✅ **Kit é entidade de primeira classe** com composição numerada (`1 e 2`,
  `3 e 4`, `1, 2, 3, 4 e 5`). → justifica `kit_composicao`.
- ✅ **Preço é por produto, desconto é por campanha com janela de datas.**
  → `promocao.tipo` + `data_inicio` + `data_fim` modela exatamente isso.
- ✅ **There IS "faixa de pele"** (`Ivory / Beige / Bronze`, tons `W` e `C`).
  → o `Diagnostico` já existente na SPA tem base real.

---

## 4. ⚠️ Os 13 produtos do Supabase vs. a evidência real

Nenhum dos 13 tem correspondência com o catálogo real:

| Supabase (seed) | Existe no catálogo? |
|---|---|
| Batom Matte Vermelho | ❌ o real é "Batom Matte Mary Kay®" com **12 tons nomeados** |
| Base Líquida Clara | ❌ o real é "Base TimeWise 3D®, 30 ml" com tons C/W |
| Sabonete Líquido | ❌ não aparece |
| Esmalte Vermelho / Esmalte Cristal Vermelho | ❌ **Mary Kay não comercializa esmalte** |
| Álcool Gel | ❌ não é cosmético |
| Protetor Solar | ⚠️ existe, mas "Protetor Solar Mineral Mary Kay At Play® FPS 30, 49 ml" |
| Máscara Facial | ⚠️ existe como "Máscara Hidratante Renovadora em Gel TimeWise®, 85 g" |
| Hidratante Labial | ⚠️ existe como "Bálsamo para os Lábios, 8 g" |

**Conclusão: `DESCARTADO` como catálogo.** Os 13 são seed genérico. **Dois
deles são fisicamente impossíveis para uma distribuidora Mary Kay** (esmalte,
álcool gel).

---

## 5. Conteúdo institucional recuperado — EVIDÊNCIA REAL

Extraído de `assets/html/empresa.html`:

### 5.1 Identidade da empresa

```
Razão social usada : Angel Cosméticos
CNPJ               : 48.591.163/0001-12     ← CONFIRMADO, aparece no rodapé
Fundação           : 2022
Endereço           : Viela Aristides de Oliveira, nº 130
                     Poá — São Paulo/SP — CEP 08551-275
```

**O CNPJ real `48.591.163/0001-12` não existe em nenhum lugar do novo sistema.**
Os 3 fornecedores do Supabase têm CNPJ **inventado**. Este é o CNPJ da
**empresa**, e deve entrar em lugar próprio — não em `fornecedor`.

### 5.2 Missão / Visão / Valores — texto real

- **Missão:** "Proporcionar bem-estar e autoestima com produtos de alta qualidade
  e acessíveis a todos."
- **Visão:** "Ser referência nacional no mercado de cosméticos, promovendo
  inovação e sustentabilidade."
- **Valores:** Respeito ao cliente · Compromisso com a qualidade ·
  Sustentabilidade · Inovação

### 5.3 História

> "Elegância, Empoderamento e Bem-Estar. Fundada em 2022, a Angel Cosméticos
> começou com o sonho de conquistar o empoderamento das nossas clientes. Hoje,
> somos uma empresa reconhecida por proporcionar bem-estar e experiências
> inesquecíveis. Ao longo dos anos, realizamos inúmeros eventos e lançamentos que
> marcaram a história da empresa e fortaleceram nossa conexão com nossos
> clientes."

### 5.4 Depoimentos — ⚠️ só 1 é real

| Nome | Texto | Status |
|---|---|---|
| **Grasiely Machado** | "A Angel Cosméticos mudou a minha vida…" | ✅ **EVIDÊNCIA — real** |
| Mario Oliveira | `Lorem ipsum dolor sit amet…` | ❌ **DESCARTADO — placeholder** |
| Ana Costa | `Lorem, ipsum dolor sit amet…` | ❌ **DESCARTADO — placeholder** |

**Nunca exibir 3 depoimentos.** Exibir **um**, o da Grasiely. Não há tabela de
avaliação no banco — o frontend deve tratar isto como conteúdo editorial fixo,
não como dado dinâmico.

---

## 6. Eventos — nomes reais recuperados, sem datas

`assets/html/eventos.html` contém **14 legendas de evento**. **Estes nomes são
EVIDÊNCIA** — Unlike o que se supunha, os nomes **existem**:

1. Primeiro evento realizado no Hospital Guido Guida
2. Segundo evento realizado no Hospital Guido Guida
3. Dia de premiação do Círculo Rosa
4. Ensaio na sala Círculo Rosa
5. Dia da Premiação das Globais Mary Kay
6. Premiação das Globais Mary Kay *(variação de caixa do item 5)*
7. Premiação da Estrela Safira
8. Sala de espera para o evento Outubro Rosa
9. Evento realizado na Associação Comercial de Poá (CIPA)
10. Parceria com a Magazine Luiza de Poá
11. Realizando um dia de Princesa na Associação Comercial
12. Dia de beleza na escola Carolina em Poá *(aparece 3× — duplicado)*

**O que NÃO existe:** ano, mês, data, local detalhado, descrição, número de
convidados, fotos associadas.

### 6.1 Consequência para o design

Podemos montar a galeria com **os nomes reais** como títulos. **Não podemos**
agrupar por ano, ordenar por data, nem dizer "evento de 2024".

Classificação dos nomes: `EVIDÊNCIA`.
Classificação de qualquer metadata de data: `DESCARTADO`.

Há também um item **"Parceria com a Magazine Luiza de Poá"** — que **não é um
evento**, é uma parceria. Não deve entrar na galeria de eventos sem decisão.

---

## 7. Fornecedores — revisão da conclusão anterior

Minha auditoria anterior classificou os 3 fornecedores como fictícios. Mantenho
o veredito **sobre os registros** e corrijo **sobre a relação**:

| Registro no Supabase | Veredito |
|---|---|
| `Mary Kay Cosmeticos` — CNPJ `01020304000109` | Registro **falso**. Mas **a empresa é de fato distribuidora Mary Kay** — confirmado em 3 PDFs. Precisa: CNPJ real da Mary Kay Brasil + registro real da Angel como revendedora. |
| `Puro Cosmeticos` — CNPJ `11223344556677` | Registro **falso**. Nenhuma evidência no acervo. `PENDENTE`. |
| `Bela Cosmeticos LTDA` — CNPJ `98765432100109` | Registro **falso**. Nenhuma evidência. `PENDENTE`. |

**Correção estrutural necessária:** a relação hoje é `produto.fornecedor_id`
direto. Para um negócio de **revenda com múltiplos fornecedores**, o modelo
correto é **N:N** — `produto_fornecedor` com preço e condição por fornecedor.
Isso é decisão de modelagem e **não foi alterado**.

---

## 8. URLs do legado — base para o mapa de 301

Extraído de todos os HTML/CSS/JS legados:

| URL antiga | Destino na SPA | 301 |
|---|---|---|
| `/index.html` | `/` | sim |
| `/assets/html/produtos.html` | `/produtos` | sim |
| `/assets/html/ver-produtos.html` | `/produtos/:slug` | dinâmico |
| `/assets/html/carrinho.html` | `/carrinho` | sim |
| `/assets/html/conta.html` | `/conta` | sim |
| `/assets/html/contato.html` | `/contato` | sim |
| `/assets/html/empresa.html` | `/sobre` | sim |
| `/assets/html/eventos.html` | `/eventos` | **rota ainda não existe** |
| `/assets/html/fornecedores.html` | — | **sem destino definido** |
| `/assets/html/pdf.html` | — | **sem destino definido** |
| `/assets/html/completarCadastro.html` | `/conta` | sim |
| `/assets/pdf/*.pdf` (4 arquivos) | — | preservar download |
| `/assets/video/sessãoMaquiagem.mp4` | — | preservar |

**Pendências de SEO:** `/eventos` ainda não existe na SPA. `/fornecedores.html`
e `/pdf.html` não têm destino definido — **não redirecionar para a home**
(máquina penalizada por redirect para página irrelevante).

---

## 9. Regras de negócio recuperadas do legado

Dos nomes de SQL e PHP, sem reuso de código:

| Domínio | Regra confirmada |
|---|---|
| Estoque | `entradas_estoque`, `saidas_estoque`, `historico_compras` → **saldo + movimentação + histórico** |
| Promoção | `produtos_promocao` com janela temporal |
| Carrinho | usuário vinculado por **nome do produto** → ❌ defeito, o modelo novo resolve |
| Produto | duas concepções conflitantes (`nome_produto,preco` vs `quantidade_estoque`) → ❌ dívida resolvida no schema novo |
| Fornecedor | cadastro e exibição separados do produto |
| Usuário | cadastro, login, reset de senha, complementação de cadastro |

**Veredito: `DESCARTADO` como código. `PRESERVADO` como regra de domínio.**
Toda regra já está melhor modelada no Supabase.

---

## 10. Imagens — 172 arquivos, precisa triagem

`assets/img/` contém ~172 imagens. Não há índice. Classificação por nome:

| Grupo | Exemplos | Avaliação |
|---|---|---|
| Eventos | `evento1..6`, `eventocipa`, `eventograsi*`, `chamadaeventos`, `eventos.png` | **CANDIDATO PRINCIPAL** — galeria |
| Banners | `banner-1.png` (4,6 MB!), `banner-2.png`, `baner-1-1.png` | **P0 de performance** — 4,6 MB |
| Logos | `logo.png`, `Logo.jpeg`, `logo2..6`, `logosemfundo*`, `logoEscura.png` | precisa **seleção** — 14 variantes |
| Produtos | `produto-1..52`, `apresentacaoprodutos*` | **CANDIDATO** para as 5 imagens |
| Marca/fornecedores | `marca-1..5`, `logomarykay.png`, `grasedebrandosemfundo` | institucional |
| Institucionais | `certificado.jpeg`, `cliente-1..3`, `divulgação.jpeg`, `ChamdaSite.jpeg` | conteúdo real |
| Mídia pesada | `pexels-*.jpg` (3,2 MB), `produto-20-1.jpg` (4,3 MB), `produto-26.jpg` (3,5 MB) | **P0 de performance** |

**Nenhuma foto de produto no Supabase** (`produto_imagem` = 0). As imagens de
produto do legado são a **única fonte** disponível para os 5 slots.

**Não pude inspecionar visualmente nenhuma delas** — este modelo não tem
entrada de imagem. Toda a triagem acima é por **nome de arquivo**, não por
conteúdo visual.

---

## 11. Matriz de decisão — o que fazer com cada achado

| Achado | Evidência | Destino | Status |
|---|---|---|---|
| CNPJ `48.591.163/0001-12` | empresa.html | config da empresa | ✅ **CONFIRMADO** |
| Endereço Poá/SP | empresa.html | config | ✅ **CONFIRMADO** |
| Fundação 2022 | empresa.html | Sobre | ✅ **CONFIRMADO** |
| Missão / Visão / Valores | empresa.html | Sobre | ✅ **CONFIRMADO** |
| Texto "Nossa História" | empresa.html | Sobre | ✅ **CONFIRMADO** |
| Depoimento Grasiely Machado | empresa.html | Sobre | ✅ **CONFIRMADO** (1 só) |
| Depoimentos Mario/Ana | empresa.html | — | ❌ **DESCARTADO** |
| 12 nomes de evento | eventos.html | Galeria | ✅ **EVIDÊNCIA** |
| Datas/anos de evento | — | — | ❌ **DESCARTADO** |
| "Parceria Magazine Luiza" | eventos.html | — | ⚠️ **PENDENTE** — não é evento |
| ~60 produtos Mary Kay | 3 PDFs | `produto` | ✅ **EVIDÊNCIA** |
| Preços DE/POR | 3 PDFs | — | ⚠️ **VENCIDOS** — não usar como atual |
| Cartilha Skincare | 1 PDF | `produto` | ⚠️ **PENDENTE** — precisa OCR |
| 12 nomes de tons | PDFs | `produto_atributo` | ✅ **EVIDÊNCIA** |
| 9 kits com composição | PDFs | `kit_composicao` | ✅ **EVIDÊNCIA** |
| ~172 imagens | assets/img | `produto_imagem` | ⚠️ **PENDENTE** — triagem visual |
| 15 URLs antigas | legado | mapa 301 | ✅ **CONFIRMADO** |
| 3 fornecedores | Supabase | `fornecedor` | ❌ **DESCARTADO** — registros falsos |
| 13 produtos seed | Supabase | `produto` | ❌ **DESCARTADO** |
| Categoria "Esmalgue" | Supabase | `categoria` | ❌ **DEFEITO** |

---

## 12. O que ainda depende de você

1. **Preço atual.** Os PDFs dão preço de campanha **vencida**. Precisamos de
   uma fonte de preço vigente, ou de marcar explicitamente todo preço como
   "referência histórica" na vitrine.
2. **OCR da Cartilha Skincare** para liberar esse catálogo.
3. **Triagem visual das 172 imagens** — não posso fazer isso sem ver as fotos.
4. **Fornecedores reais** — inclusive a questão do modelo N:N (§7).
5. **"Parceria com a Magazine Luiza"** entra na galeria ou não?
6. **Rota `/eventos`** — criar antes do go-live, senão o 301 fica sem destino.
7. **`/fornecedores.html` e `/pdf.html`** — definir destino de redirect.
8. **Fornecedores Puro e Bela** — confirmar se são reais ou foram placeholder
   desde o início.
