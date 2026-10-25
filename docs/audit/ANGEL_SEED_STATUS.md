# ANGEL COSMÉTICOS — STATUS DE SEEDS E CATÁLOGO

## 1. Arquivos de seed localizados

| Arquivo | Tipo | Conteúdo | Status |
|---|---|---|---|
| `seed-dev.sql` | SQL (raiz) | 12 produtos, 3 fornecedores, 6 categorias | Dev only, marcado "NAO usar em producao" |
| `supabase/seeds/20261015_angel_catalogo_seed_v2.sql` | SQL | 60 produtos rascunho (ativo=false, preco_base=0), 7 categorias | Rascunho inativo, sem imagens |
| `assets/sql/angelcosmeticos_*.sql` (14 arquivos) | SQL | Dados legados (produtos, categorias, estoque, pedidos, etc.) | Legado MySQL/PHP |
| `supabase-backup-*.sql` (4 arquivos) | SQL | Backups do schema remoto | Backup |
| `temp_*.sql` (4 arquivos) | SQL | Schemas temporários remotos | Temporário |
| `backup-pre-migrations-p17.sql` | SQL | Backup pré-migração | Backup |

## 2. Detalhamento dos seeds

### 2.1 seed-dev.sql (raiz)

- **Fornecedores:** Mary Kay (CNPJ 01020304000109), Bela Cosméticos (98765432100109), Puro Cosméticos (11223344556677)
- **Categorias:** Maquiagem, Cuidados com a Pele, Cabelos, Corpo e Banho, Acessórios, Promoções
- **Produtos:** 12 (Batom Matte Vermelho, Base Líquida Clara, Máscara de Cabelos, Sabonete Líquido, Esmalte Vermelho, Álcool Gel, Protetor Solar, Shampoo Antiresíduo, Hidratante Labial, Máscara Facial, Óleo Capilar, Desodorante Roll-on)
- **Marcado como:** "NAO usar em producao"
- **Status:** Existente no repositório, não confirmado como executado no banco remoto

### 2.2 20261015_angel_catalogo_seed_v2.sql

- **Fornecedor:** Mary Kay (CNPJ 01020304000109) — localizado por CNPJ, sem ID fixo
- **Categorias:** 7 existentes (acessorios, cabelos, corpo-banho, cuidados-pele, esmalhe, maquiagem, promocoes)
- **Produtos:** 60 rascunhos (ativo=false, preco_base=0)
- **Imagens:** Nenhuma (produto_imagem.url é NOT NULL; sem placeholders)
- **ON CONFLICT DO NOTHING** — idempotente
- **Status:** Rascunho inativo, não executado (presumido)

### 2.3 Dados legados (assets/sql/)

14 arquivos SQL do sistema legado (PHP/MySQL):

| Arquivo | Conteúdo |
|---|---|
| angelcosmeticos_cadastro.sql | Cadastro de clientes |
| angelcosmeticos_carrinho.sql | Carrinho |
| angelcosmeticos_categorias_produtos.sql | Categorias e produtos |
| angelcosmeticos_enderecos.sql | Endereços |
| angelcosmeticos_entradas_estoque.sql | Entradas de estoque |
| angelcosmeticos_estoque.sql | Estoque |
| angelcosmeticos_fornecedores.sql | Fornecedores |
| angelcosmeticos_historico_compras.sql | Histórico de compras |
| angelcosmeticos_pedidos.sql | Pedidos |
| angelcosmeticos_produtos_categoria.sql | Relação produto-categoria |
| angelcosmeticos_produtos_promocao.sql | Promoções |
| angelcosmeticos_produtos.sql | Produtos |
| angelcosmeticos_routines.sql | Rotinas/procedures |
| angelcosmeticos_saidas_estoque.sql | Saídas de estoque |
| angelcosmeticos_usuarios.sql | Usuários |
| angelcosmeticos_usuarios_completo.sql | Usuários completo |

**Status:** Legado MySQL/PHP. Não deve ser importado diretamente. Conteúdo pode ser usado como referência para migração de dados.

## 3. Classificação dos artefatos

| Artefato | Existente no repo | Aparentemente executável | Historicamente aplicado | Confirmado no banco |
|---|---|---|---|---|
| `seed-dev.sql` | Sim | Sim | Não confirmado | Não verificado |
| `20261015_angel_catalogo_seed_v2.sql` | Sim | Sim | Não confirmado | Não verificado |
| `assets/sql/*.sql` | Sim | Parcial (MySQL) | Provavelmente (legado) | Não verificado |
| Backups SQL | Sim | N/A | N/A | N/A |
| Temp schemas | Sim | N/A | N/A | N/A |

## 4. Correspondência com registros remotos

Não foi possível verificar o estado real do banco remoto nesta auditoria (sem acesso direto). A verificação deve ser feita com:

```sql
SELECT count(*) FROM produto;
SELECT count(*) FROM categoria;
SELECT count(*) FROM fornecedor;
SELECT count(*) FROM produto_imagem;
SELECT count(*) FROM produto_variante;
```

### Produtos do seed-dev.sql vs schema real

Os 12 produtos do `seed-dev.sql` referenciam fornecedores por ID (1, 2, 3) e categorias implícitas. O schema real usa `fornecedor_id` (FK para `fornecedor`) e `produto_categoria` (tabela de junção). A correspondência precisa ser verificada.

### Produtos do seed v2 vs schema real

Os 60 produtos do seed v2 são rascunhos (`ativo=false`, `preco_base=0`) e referenciam categorias por slug. A correspondência de slugs precisa ser verificada contra as categorias reais no banco.

## 5. Riscos identificados

1. **Seed dev marcado como não produção** — pode ter sido executado inadvertidamente
2. **Seed v2 com 60 produtos rascunho** — se executado, criaria 60 produtos inativos sem imagens
3. **Dados legados MySQL** — estrutura diferente do schema Supabase; importação direta causaria erros
4. **Backups e temp schemas** — podem conter dados sensíveis ou desatualizados
5. **Nomenclatura inconsistente** — `criado_em` vs `created_at` pode causar erros em seeds

## 6. Recomendação

- Não executar nenhum seed sem revisão humana
- Verificar estado real do banco antes de qualquer importação
- Usar o seed v2 apenas como ponto de partida para revisão manual
- Migrar dados legados apenas após mapeamento completo de campos
- Criar um seed de produção revisado e aprovado antes de popular o catálogo real
