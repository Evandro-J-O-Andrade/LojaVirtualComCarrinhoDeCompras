-- Migration #3: produto_imagens
-- Gap: CONTRATO §11 Migration #9 | AUDITORIA_4 §332 (P3)
-- Images are hardcoded in frontend. Create a proper images table.

create table produto_imagens (
  id bigserial primary key,
  produto_id bigint not null references produtos(id) on delete cascade,
  url text not null,              -- Supabase Storage signed URL
  ordem integer default 0,        -- display order
  principal boolean default false,
  created_at timestamp default now()
);

create index idx_produto_imagens_produto on produto_imagens(produto_id);
create index idx_produto_imagens_principal on produto_imagens(produto_id) where principal = true;

-- Ensure only one principal image per product
create unique index idx_produto_imagem_unica_principal
  on produto_imagens(produto_id)
  where principal = true;
