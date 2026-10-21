-- Migration #2: produto_variante + produto_variante_atributo
-- Gap: CONTRATO §11 Migration #3 | AUDITORIA_4 §318, §325 (P2)
-- The database only has simple products. Variants (tamanho, cor, volume)
-- exist only in frontend mock (verprodutos.js). This migration creates
-- the real variant table with JSONB attributes (Decisão 1: atributos livres).

create table produto_variante (
  id bigserial primary key,
  produto_id bigint not null references produtos(id) on delete cascade,
  sku text,                       -- unique SKU for this variant combination
  atributos jsonb default '{}',   -- {tamanho: 'G', cor: 'Rosa', volume: '100ml'}
  preco decimal(10,2) not null,   -- Decisão 2: variant has its own price
  ativo boolean default true,
  created_at timestamp default now(),
  unique(produto_id, atributos)
);

create index idx_variante_produto on produto_variante(produto_id);

-- Stock per variant (Decisão 4: mixed — variant-level stock when variants exist)
alter table estoque add column variante_id bigint references produto_variante(id) on delete cascade;
create index idx_estoque_variante on estoque(variante_id);

-- Ensure: if a product has active variants, stock should be at the variant level
-- (enforced by application logic in Supabase Edge Functions)
