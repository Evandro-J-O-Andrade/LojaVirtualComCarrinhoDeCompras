-- Migration #4: frete_regra
-- Gap: CONTRATO §11 Migration #6 | AUDITORIA_4 §263 (P2)
-- Freight is currently hardcoded with 3 conflicting implementations.
-- This creates an admin-manageable freight rules table (Decisão 5: fase 1).

create table frete_regra (
  id bigserial primary key,
  cep_inicio varchar(8),
  cep_fim varchar(8),
  uf char(2),
  regiao varchar(50),
  tipo varchar(20) not null default 'fixo',   -- fixo | por_kg | percentual_subtotal
  valor decimal(10,2) not null default 0,
  subtotal_minimo decimal(10,2) default 0,    -- for free shipping threshold
  ativo boolean default true,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create index idx_frete_regra_cep on frete_regra(cep_inicio, cep_fim);
create index idx_frete_regra_uf on frete_regra(uf) where ativo;
create index idx_frete_regra_regiao on frete_regra(regiao) where ativo;

-- Trigger: ensure cep_inicio <= cep_fim
