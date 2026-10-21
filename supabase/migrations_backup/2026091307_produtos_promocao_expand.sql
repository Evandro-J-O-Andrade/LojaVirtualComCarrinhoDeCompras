-- Migration #7: Expand produtos_promocao
-- Gap: CONTRATO §11 Migration #5 | AUDITORIA_4 §313 (P1), §213
-- The current desconto decimal(5,2) is ambiguous (% or fixed value).
-- This adds tipo_desconto for clarity (Decisão 3c: ambos).

alter table produtos_promocao
  add column tipo_desconto text not null default 'percentual'
    check (tipo_desconto in ('percentual', 'fixo')),
  add column valor_desconto decimal(10,2) not null default 0,
  add column ativo boolean default true,
  add column variante_id bigint references produto_variante(id) on delete cascade,
  add column created_at timestamp default now(),
  add column updated_at timestamp default now();

-- Backfill: existing desconto values are treated as percentual
update produtos_promocao
  set tipo_desconto = 'percentual', valor_desconto = desconto
  where valor_desconto = 0;

create index idx_promocao_produto on produtos_promocao(produto_id);
create index idx_promocao_ativa on produtos_promocao(ativo) where ativo = true;
create index idx_promocao_datas on produtos_promocao(data_inicio, data_fim);
