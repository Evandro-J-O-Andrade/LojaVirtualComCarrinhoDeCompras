-- Migration #9: carrinho_sync + perfis_completos
-- Gap: CONTRATO §4.3 + AUDITORIA_4 §320 (P1)
-- Creates a server-side cart table for logged-in users (fase 2 sync)
-- and consolidates the fragmented user profile tables (Decisão 12: migrate).

-- Server-side cart (sync with localStorage, Supabase Realtime)
create table carrinho_itens (
  id bigserial primary key,
  usuario_id bigint references usuarios(id) on delete cascade,
  session_id text,                    -- for guest carts
  produto_id bigint not null references produtos(id),
  variante_id bigint references produto_variante(id),
  sku text not null,
  nome_produto text not null,
  atributos jsonb default '{}',
  preco_unitario decimal(10,2) not null,
  quantidade integer not null check (quantidade > 0),
  total decimal(10,2) not null,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create index idx_carrinho_usuario on carrinho_itens(usuario_id);
create index idx_carrinho_session on carrinho_itens(session_id);
create index idx_carrinho_sku on carrinho_itens(sku);

-- Consolidate usuarios_completo into usuarios (migration target)
-- usuarios_completo is a denormalized view/table; we add missing fields to usuarios
alter table usuarios
  add column telefone varchar(20),
  add column data_nascimento date,
  add column tipo enum('cliente','admin','vendedor') default 'cliente',
  add column ultimo_login timestamp,
  add column atualizado_em timestamp default now();

-- usuarios_completo FK already references usuarios.usuario_id
-- After migration, usuarios_completo becomes a view (managed in Edge Functions)
