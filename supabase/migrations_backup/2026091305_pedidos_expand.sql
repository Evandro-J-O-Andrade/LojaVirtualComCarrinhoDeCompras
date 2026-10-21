-- Migration #5: Expand pedidos table
-- Gap: CONTRATO §11 Migration #8 | AUDITORIA_4 §311 (P0), §317 (P1), §318 (P1)
-- The current pedidos table only has (id, usuario_id, data_pedido, status).
-- This adds all missing fields for the real order model.

alter table pedidos
  add column numero text unique,                 -- AC-YYYYMMDD-XXXX
  add column origem text not null default 'site' check (origem in ('site', 'whatsapp')),
  add column status text not null default 'rascunho'
    check (status in (
      'rascunho', 'aguardando_pagamento', 'pagamento_aprovado',
      'em_separacao', 'enviado', 'entregue',
      'cancelado', 'devolvido', 'aguardando_whatsapp'
    )),
  add column metodo_pagamento text
    check (metodo_pagamento in ('whatsapp', 'pix', 'cartao', 'boleto', 'entrega')),
  add column status_pagamento text
    check (status_pagamento in ('pendente', 'aprovado', 'recusado', 'estornado', 'aguardando_entrega')),
  add column endereco_entrega_id bigint,          -- references enderecos (after FK fix)
  add column frete_valor decimal(10,2) default 0,
  add column subtotal decimal(10,2) default 0,
  add column desconto_total decimal(10,2) default 0,
  add column total decimal(10,2) default 0,
  add column observacoes text,
  add column pago_em timestamp,
  add column enviado_em timestamp,
  add column entregue_em timestamp,
  add column atualizado_em timestamp default now(),
  add column cliente_id bigint;                    -- references clientes (if separate from usuarios)

-- Drop old status column (now replaced by expanded enum above)
alter table pedidos drop column if exists status;

-- Add FK for endereco_entrega after FK fix migration
-- (this migration runs before #6 which fixes enderecos FK)
create index idx_pedidos_usuario on pedidos(usuario_id);
create index idx_pedidos_status on pedidos(status);
create index idx_pedidos_numero on pedidos(numero);
