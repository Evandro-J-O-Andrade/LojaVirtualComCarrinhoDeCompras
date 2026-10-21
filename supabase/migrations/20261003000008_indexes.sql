-- ============================================================
-- 20261003000008 — Índices das tabelas novas (Etapa 6)
-- Convenção do projeto: índices em migration separada
-- (como 202609190102_indexes.sql). FKs não são indexados
-- automaticamente pelo Postgres — cada FK de consulta
-- frequente recebe índice.
-- idx_evento_idempotency (índice único parcial) JÁ EXISTE
-- no remoto (Gap Analysis §4.2) — não recriar.
-- O EXCLUDE de agendamento cria seu próprio índice gist.
-- ============================================================

-- ORCAMENTO
CREATE INDEX IF NOT EXISTS idx_orcamento_cliente ON orcamento (cliente_id);
CREATE INDEX IF NOT EXISTS idx_orcamento_status ON orcamento (status);
CREATE INDEX IF NOT EXISTS idx_orcamento_validade ON orcamento (validade);
CREATE INDEX IF NOT EXISTS idx_orcamento_pedido ON orcamento (pedido_id);

-- ORCAMENTO_ITEM
CREATE INDEX IF NOT EXISTS idx_orcamento_item_orcamento ON orcamento_item (orcamento_id);
CREATE INDEX IF NOT EXISTS idx_orcamento_item_produto ON orcamento_item (produto_id);

-- ORCAMENTO_STATUS_HISTORICO
CREATE INDEX IF NOT EXISTS idx_orcamento_historico_orcamento ON orcamento_status_historico (orcamento_id);

-- DESCONTO_COMERCIAL
CREATE INDEX IF NOT EXISTS idx_desconto_orcamento ON desconto_comercial (orcamento_id);
CREATE INDEX IF NOT EXISTS idx_desconto_pedido ON desconto_comercial (pedido_id);
CREATE INDEX IF NOT EXISTS idx_desconto_concedido_por ON desconto_comercial (concedido_por);

-- SERVICO (slug já é UNIQUE — índice implícito)

-- PROFISSIONAL_SERVICO (busca reversa: serviço → profissionais)
CREATE INDEX IF NOT EXISTS idx_profissional_servico_servico ON profissional_servico (servico_id);

-- AGENDA (agenda semanal por profissional)
CREATE INDEX IF NOT EXISTS idx_agenda_profissional ON agenda (profissional_id);
CREATE INDEX IF NOT EXISTS idx_agenda_profissional_dia ON agenda (profissional_id, dia_semana);

-- AGENDA_BLOQUEIO (consulta por data)
CREATE INDEX IF NOT EXISTS idx_agenda_bloqueio_data ON agenda_bloqueio (data);
CREATE INDEX IF NOT EXISTS idx_agenda_bloqueio_profissional_data ON agenda_bloqueio (profissional_id, data);

-- AGENDAMENTO
CREATE INDEX IF NOT EXISTS idx_agendamento_cliente ON agendamento (cliente_id);
CREATE INDEX IF NOT EXISTS idx_agendamento_profissional_data ON agendamento (profissional_id, data);
CREATE INDEX IF NOT EXISTS idx_agendamento_status ON agendamento (status);
-- varredura de expiração (solicitado não confirmado no prazo)
CREATE INDEX IF NOT EXISTS idx_agendamento_expirar ON agendamento (criado_em)
    WHERE status = 'solicitado';

-- NOTIFICACAO (inbox do destinatário + fila do dispatcher)
CREATE INDEX IF NOT EXISTS idx_notificacao_destinatario ON notificacao (destinatario_tipo, destinatario_cliente_id);
CREATE INDEX IF NOT EXISTS idx_notificacao_fila ON notificacao (status, proxima_tentativa)
    WHERE status IN ('pendente', 'falhou');

-- NOTIFICACAO_TEMPLATE (evento_nome já é UNIQUE com canal)

-- MIMO (janela de publicação)
CREATE INDEX IF NOT EXISTS idx_mimo_janela ON mimo (ativo, inicio, fim);

-- MIMO_PRODUTO (busca reversa)
CREATE INDEX IF NOT EXISTS idx_mimo_produto_produto ON mimo_produto (produto_id);

-- PAGAMENTO_ESTORNO
CREATE INDEX IF NOT EXISTS idx_estorno_pagamento ON pagamento_estorno (pagamento_id);
CREATE INDEX IF NOT EXISTS idx_estorno_pedido ON pagamento_estorno (pedido_id);

-- AUDITORIA (observabilidade por entidade + linha do tempo)
CREATE INDEX IF NOT EXISTS idx_auditoria_entidade ON auditoria (entidade_tipo, entidade_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_criado_em ON auditoria (criado_em);

-- ============================================================
-- ÍNDICES ÚNICOS DE INTEGRIDADE (regras de negócio fechadas)
-- ============================================================

-- KIT: componente não se repete no mesmo kit. Expressão
-- COALESCE(variante_id, 0) porque UNIQUE de tabela trata
-- NULL como distinto (componente avulso = variante NULL).
CREATE UNIQUE INDEX IF NOT EXISTS idx_kit_componente_unique
    ON kit_composicao (kit_produto_id, produto_id, COALESCE(variante_id, 0));

-- DESCONTO COMERCIAL: no máximo UM por orçamento e por
-- pedido (MODELO_COMERCIAL §5.5 — não acumula).
CREATE UNIQUE INDEX IF NOT EXISTS idx_desconto_unico_orcamento
    ON desconto_comercial (orcamento_id) WHERE orcamento_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_desconto_unico_pedido
    ON desconto_comercial (pedido_id) WHERE pedido_id IS NOT NULL;

-- ORÇAMENTO → PEDIDO: conversão 1:1 — um pedido é a
-- conversão de no máximo um orçamento (§8.12).
CREATE UNIQUE INDEX IF NOT EXISTS idx_orcamento_conversao
    ON orcamento (pedido_id) WHERE pedido_id IS NOT NULL;
