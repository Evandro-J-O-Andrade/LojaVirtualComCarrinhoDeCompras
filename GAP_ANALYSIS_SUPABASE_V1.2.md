# GAP ANALYSIS — CORREÇÃO DO INVENTÁRIO DE DADOS v1.2

**Status:** Adendo corretivo ao `GAP_ANALYSIS_SUPABASE_V1.1.md`. **Read-only.**
**Data:** 2026-10-03 · **Supabase ref:** `bmqxgibhuzekxpcgosap`
**Método:** SQL read-only (driver `pg`, `DIRECT_URL`, `BEGIN TRANSACTION READ ONLY`, Postgres 17.6).
**Motivo:** a v1.1 afirmou "apenas 4 tabelas têm linhas" (§1.2/§4.1). A verificação complementar da Etapa 6 provou que **8 tabelas** têm dados. Nenhuma conclusão de segurança mudou; o inventário de dados é que estava incompleto.

---

## 1. Inventário de dados corrigido (2026-10-03)

| Tabela | Linhas | v1.1 | Conteúdo confirmado |
|---|---|---|---|
| `produto` | 13 | 13 ✅ | seed de desenvolvimento (Esmalte Cristal Vermelho R$ 29,90 … Desodorante Roll-on R$ 38,00) |
| `categoria` | 7 | 7 ✅ | id=1 **defeituosa** (`Esmalgue`/`esmalhe`); ids 20–25: Maquiagem, Cuidados com a Pele, Cabelos, Corpo e Banho, Acessorios, Promocoes |
| `fornecedor` | 3 | 3 ✅ | Puro Cosmeticos, **Mary Kay Cosmeticos** (marca, não fornecedor), Bela Cosmeticos LTDA — CNPJs/telefones fictícios |
| `produto_variante` | 1 | 1 ✅ | `ESM-001`, R$ 29,90, produto 1 |
| `produto_imagem` | **14** | **0** ❌ | **13× `placehold.co/400x400/FF6B9D/white?text=<slug>` (placeholders falsos, paleta rosa antiga) + 1× `kolicosmeticos.vtexassets.com/.../esmalte-cristal-vermelho.jpg` (hotlink para CDN de terceiro)**. Produto 1 tem **duas linhas `principal=true`** (ids 1 e 2, ordem 0 e 1) |
| `produto_opcao_compra` | **1** | n/c | `Unidade`, `tipo='quantidade'`, produto 1, `preco_proprio` NULL |
| `produto_categoria` | **1** | **0** ❌ | produto 1 ↔ categoria 1 (criado 2026-09-21) |
| `estoque` | **14** | **0** ❌ | 100 físicas / 0 reservadas cada; **produto 1 tem DUAS linhas** (ids 2 e 3) — duplicata viola a intenção de `est_no_maximo_um` (a constraint não tem UNIQUE, então não impede) |
| `storage.objects` (product-images) | 0 | 0 ✅ | bucket vazio; as 14 URLs de `produto_imagem` são todas externas/falsas |
| `supabase_migrations.schema_migrations` | 0 | 0 ✅ | backfill na migration `20261003000001` |

**n/c** = não citado na v1.1.

## 2. Consequências para as conclusões da v1.1

| Conclusão v1.1 | Veredicto |
|---|---|
| "Dados atuais são seed de desenvolvimento, não patrimônio" | **MANTIDA** — os 14 registros de imagem são placeholders/hotlink, não fotos reais |
| "Bucket `product-images` existe, público, 0 objetos" | **MANTIDA** ✅ |
| "Contrato de até 5 imagens sem fonte" | **MANTIDA E AGRAVADA** — há linhas de imagem, mas com URLs falsas/externas; fotos reais continuam sem fonte |
| "`produto_opcao_compra` mecanismo não previsto no contrato → avaliar (etapa 6)" | **Decidido na Etapa 6** (migration 6): kit=produto; `tipo` fica `('quantidade','custom')` — seguro, a única linha é `quantidade` |
| Riscos de segurança (§2.3): storage amplas, role em metadata, zero admins | **MANTIDOS** — tratados na migration `20261003000007` |

## 3. Novos defeitos de dados descobertos (para limpeza autorizada, não estrutural)

1. **L1 — URLs falsas em `produto_imagem`** (13 placehold.co + 1 vtexassets.com): violam REGRA_DE_DESIGN §7/§8 ("nunca URL falsa gravada no banco"). Limpeza proposta no ETAPA_6_SQL_PROPOSTO §5 (DML, autorização explícita).
2. **L2 — `principal` duplicado** (produto 1, ids 1 e 2): a aplicação deve garantir unicidade; trigger futuro opcional.
3. **L3 — `estoque` duplicado** (produto 1, ids 2 e 3): a constraint `est_no_maximo_um` não é UNIQUE — não impede duplicatas. Correção de dados proposta (§5 do proposto); considerar UNIQUE parcial `(produto_id) WHERE produto_variante_id IS NULL` em revisão.

## 4. Evidência de método

Scripts `_s6verify.cjs` … `_s6verify5.cjs` (raiz, temporários): `pg` + `DIRECT_URL`, `BEGIN TRANSACTION READ ONLY` + `SET default_transaction_read_only=on`, consultas a `pg_constraint`, `pg_policies`, `pg_proc`, `information_schema.columns`, `storage.buckets`, `storage.objects`, `auth.users`. Zero escrita. (Removidos após registro deste adendo; as consultas estão reproduzíveis a partir deste documento.)

> **Nenhuma alteração no Supabase foi realizada para produzir este documento.**
