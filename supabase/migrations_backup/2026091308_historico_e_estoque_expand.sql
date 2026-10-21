-- Migration #8: pedido_status_historico + saidas_estoque_expandida
-- Gap: CONTRATO §11 | AUDITORIA_4 §204 (P1), §322 (P2)
-- Creates audit trail for order status changes and stock movement
-- (Decisão 10: 9 statuses with state machine transitions).

create table pedido_status_historico (
  id bigserial primary key,
  pedido_id bigint not null references pedidos(id) on delete cascade,
  status_anterior text,
  status_novo text not null,
  usuario_id bigint references usuarios(id),
  criado_em timestamp default now()
);

create index idx_status_historico_pedido on pedido_status_historico(pedido_id);

-- Add variante_id to saidas_estoque for stock-level tracking per variant
-- (Decisão 4: estoque por variante quando o produto tem variantes)
alter table saidas_estoque
  add column variante_id bigint references produto_variante(id) on delete set null;

create index idx_saidas_variante on saidas_estoque(variante_id);

-- Add variante_id to entradas_estoque as well
alter table entradas_estoque
  add column variante_id bigint references produto_variante(id) on delete set null;

create index idx_entradas_variante on entradas_estoque(variante_id);
