-- Migration #6: Fix enderecos FK
-- Gap: CONTRATO §11 Migration #2 | AUDITORIA_4 §317 (P1), §231-234
-- The enderecos table has tipo_endereco (Usuario/Fornecedor) but FK
-- only references usuarios. Fix to support both entity types properly.

-- Add new columns for cleaner FK structure
alter table enderecos
  add column usuario_id bigint references usuarios(id) on delete cascade,
  add column fornecedor_id bigint references fornecedores(id) on delete cascade;

-- Ensure only one of usuario_id/fornecedor_id is set (matching tipo_endereco)
-- This constraint is checked by application logic

-- Add delivery address flag
alter table enderecos
  add column tipo text default 'entrega' check (tipo in ('entrega', 'cobranca'));

-- FK from pedidos to enderecos
alter table pedidos
  add constraint fk_pedidos_endereco
  foreign (endereco_entrega_id) references enderecos(id);

create index idx_enderecos_usuario on enderecos(usuario_id);
create index idx_enderecos_fornecedor on enderecos(fornecedor_id);
