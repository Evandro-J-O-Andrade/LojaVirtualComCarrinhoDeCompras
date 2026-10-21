-- Migration #1: itens_pedido (Order Items)
-- Gap: CONTRATO §11 Migration #1 | AUDITORIA_4 §311, §465 (P0)
-- The `pedidos` table exists but has no line items table.
-- This is the highest priority blocker for real checkout.

create table itens_pedido (
  id bigserial primary key,
  pedido_id bigint not null references pedidos(id) on delete cascade,
  produto_id bigint not null references produtos(id),
  variante_id bigint, -- nullable; populated when product uses variants
  nome_produto text not null,        -- snapshot at time of purchase
  atributos jsonb default '{}',     -- snapshot: {tamanho: 'G', cor: 'Rosa', ...}
  quantidade integer not null check (quantidade > 0),
  preco_unitario decimal(10,2) not null,  -- frozen at purchase time
  total decimal(10,2) not null,
  created_at timestamp default now()
);

create index idx_itens_pedido_pedido on itens_pedido(pedido_id);
create index idx_itens_pedido_produto on itens_pedido(produto_id);
