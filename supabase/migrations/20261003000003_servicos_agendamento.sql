-- ============================================================
-- 20261003000003 — Serviços + Agendamento (domínio operacional)
-- Fonte: SERVICOS_AGENDAMENTO_ANGEL_V1.0 (fechado).
-- Decisão arquitetural: agendamento NÃO depende de WhatsApp;
-- comunicação é efeito, não causa (eventos → Etapa 4).
-- Timezone: America/Sao_Paulo (§3). Timestamps absolutos
-- (timestamptz) são a autoridade; data/horário são campos
-- derivados de exibição.
-- Anti-double-booking: EXCLUSÃO PARCIAL no banco (§5) — a
-- autoridade de disponibilidade é o banco, não a UI.
-- btree_gist 1.7 confirmado instalado (read-only).
-- ============================================================

-- ------------------------------------------------------------
-- SERVICO (§1)
-- preco NULL = "sob consulta" (nenhum valor exibido).
-- Serviço inativo não aparece nem aceita agendamento.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS servico (
    id bigserial PRIMARY KEY,
    nome varchar(255) NOT NULL,
    slug varchar(255) NOT NULL,
    descricao text,
    duracao_minutos integer NOT NULL,
    preco decimal(10,2),
    ativo boolean NOT NULL DEFAULT true,
    imagem_capa text,
    video text,
    publico_alvo text,
    preparacao text,
    requer_agendamento boolean NOT NULL DEFAULT true,
    requer_confirmacao boolean NOT NULL DEFAULT true,
    buffer_minutos integer NOT NULL DEFAULT 15,
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT se_slug_unique UNIQUE (slug),
    CONSTRAINT se_duracao_check CHECK (duracao_minutos > 0),
    CONSTRAINT se_preco_check CHECK (preco IS NULL OR preco >= 0),
    CONSTRAINT se_buffer_check CHECK (buffer_minutos >= 0),
    CONSTRAINT se_ativo_check CHECK (ativo IN (true, false))
);

-- ------------------------------------------------------------
-- PROFISSIONAL (§2) — identidade reutilizada (regra dura)
-- Uma identidade auth.users → no máximo um perfil profissional.
-- Profissional NÃO é necessariamente cliente (perfis distintos,
-- mesma identidade possível).
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profissional (
    id bigserial PRIMARY KEY,
    user_id uuid NOT NULL,
    nome varchar(255) NOT NULL,
    telefone varchar(20),
    email varchar(255),
    ativo boolean NOT NULL DEFAULT true,
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT pr_user_unique UNIQUE (user_id),
    CONSTRAINT pr_ativo_check CHECK (ativo IN (true, false)),
    CONSTRAINT pr_user_fk FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Profissional público: apenas id/nome dos ativos, para
-- escolha no fluxo de agendamento (contatos internos ficam
-- restritos a authenticated). View criada pelo dono do schema,
-- que ignora RLS de profissional; projeta só id/nome.
CREATE VIEW profissional_publico (id, nome) AS
    SELECT id, nome FROM profissional WHERE ativo = true;

-- ------------------------------------------------------------
-- PROFISSIONAL_SERVICO (§2.3) — vínculo N:N
-- Serviço sem profissional ativo vinculado não é agendável.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profissional_servico (
    profissional_id bigint NOT NULL,
    servico_id bigint NOT NULL,
    criado_em timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT ps_pk PRIMARY KEY (profissional_id, servico_id),
    CONSTRAINT ps_profissional_fk FOREIGN KEY (profissional_id) REFERENCES profissional(id) ON DELETE CASCADE,
    CONSTRAINT ps_servico_fk FOREIGN KEY (servico_id) REFERENCES servico(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- AGENDA (§3.1) — janela semanal recorrente por profissional
-- dia_semana: 0=domingo .. 6=sábado
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS agenda (
    id bigserial PRIMARY KEY,
    profissional_id bigint NOT NULL,
    dia_semana integer NOT NULL,
    horario_inicio time NOT NULL,
    horario_fim time NOT NULL,
    ativo boolean NOT NULL DEFAULT true,
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT ag_dia_check CHECK (dia_semana BETWEEN 0 AND 6),
    CONSTRAINT ag_horario_check CHECK (horario_fim > horario_inicio),
    CONSTRAINT ag_ativo_check CHECK (ativo IN (true, false)),
    CONSTRAINT ag_unico UNIQUE (profissional_id, dia_semana, horario_inicio, horario_fim),
    CONSTRAINT ag_profissional_fk FOREIGN KEY (profissional_id) REFERENCES profissional(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- AGENDA_BLOQUEIO (§3.2) — exceções/feriados/indisponibilidade
-- profissional_id NULL = bloqueio global.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS agenda_bloqueio (
    id bigserial PRIMARY KEY,
    profissional_id bigint,
    data date NOT NULL,
    tipo varchar(20) NOT NULL,
    motivo varchar(255),
    criado_em timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT ab_tipo_check CHECK (tipo IN ('bloqueio', 'feriado', 'indisponibilidade')),
    CONSTRAINT ab_profissional_fk FOREIGN KEY (profissional_id) REFERENCES profissional(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- AGENDAMENTO (§4) — máquina de estados fechada
-- solicitado → confirmado → concluído
--     └─ cancelado | nao_compareceu | reagendado | expirado
--
-- `inicio`/`fim` (timestamptz) são a linha do tempo
-- absoluta; `data`/`horario_inicio`/`horario_fim` são
-- derivados de exibição em America/Sao_Paulo.
-- `periodo` é coluna GENERADA (tstzrange, imutável) e alimenta
-- a restrição de exclusão parcial.
-- `duracao_minutos` e `buffer_minutos` são snapshot (§9.5):
-- mudança futura de serviço não reescreve agendamento passado.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS agendamento (
    id bigserial PRIMARY KEY,
    cliente_id bigint,
    servico_id bigint NOT NULL,
    profissional_id bigint NOT NULL,
    data date NOT NULL,
    horario_inicio time NOT NULL,
    horario_fim time NOT NULL,
    inicio timestamptz NOT NULL,
    fim timestamptz NOT NULL,
    duracao_minutos integer NOT NULL,
    buffer_minutos integer NOT NULL DEFAULT 15,
    protocolo varchar(20) NOT NULL,
    status varchar(20) NOT NULL DEFAULT 'solicitado',
    origem varchar(10) NOT NULL DEFAULT 'site',
    observacao text,
    contato_nome varchar(255),
    contato_telefone varchar(20),
    contato_email varchar(255),
    agendamento_origem_id bigint,
    agendamento_substituto_id bigint,
    confirmado_em timestamptz,
    concluido_em timestamptz,
    cancelado_em timestamptz,
    motivo_cancelamento text,
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now(),
    periodo tstzrange GENERATED ALWAYS AS (
        tstzrange(inicio, fim, '[)')
    ) STORED,
    CONSTRAINT agm_status_check CHECK (status IN ('solicitado', 'confirmado', 'concluido', 'cancelado', 'nao_compareceu', 'reagendado', 'expirado')),
    CONSTRAINT agm_origem_check CHECK (origem IN ('site', 'whatsapp', 'admin')),
    CONSTRAINT agm_duracao_check CHECK (duracao_minutos > 0),
    CONSTRAINT agm_buffer_check CHECK (buffer_minutos >= 0),
    CONSTRAINT agm_horario_check CHECK (fim > inicio),
    CONSTRAINT agm_horario_dia_check CHECK (horario_fim > horario_inicio),
    CONSTRAINT agm_protocolo_unique UNIQUE (protocolo),
    CONSTRAINT agm_protocolo_formato_check CHECK (protocolo ~ '^AG-[0-9]{8}-[0-9]{6}$'),
    CONSTRAINT agm_cliente_fk FOREIGN KEY (cliente_id) REFERENCES cliente(id) ON DELETE SET NULL,
    CONSTRAINT agm_servico_fk FOREIGN KEY (servico_id) REFERENCES servico(id),
    CONSTRAINT agm_profissional_fk FOREIGN KEY (profissional_id) REFERENCES profissional(id),
    CONSTRAINT agm_origem_fk FOREIGN KEY (agendamento_origem_id) REFERENCES agendamento(id),
    CONSTRAINT agm_substituto_fk FOREIGN KEY (agendamento_substituto_id) REFERENCES agendamento(id),
    -- ANTI-DOUBLE-BOOKING (§5): o banco impede sobreposição de
    -- reservas do mesmo profissional. Válido apenas para estados
    -- que ocupam horário (solicitado reserva atomicamente; §5.3).
    -- Cancelado/reagendado/expirado/nao_compareceu/concluido
    -- liberam o horário imediatamente (§7.5).
    CONSTRAINT agendamento_sem_sobreposicao
        EXCLUDE USING gist (profissional_id WITH =, periodo WITH &&)
        WHERE (status IN ('solicitado', 'confirmado'))
);

-- ============================================================
-- RLS
-- ============================================================

-- SERVICO (catálogo público, como produto)
ALTER TABLE servico ENABLE ROW LEVEL SECURITY;
CREATE POLICY "servico_read_active" ON servico FOR SELECT TO anon
    USING (ativo = true);
CREATE POLICY "servico_write_admin" ON servico FOR ALL TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

-- PROFISSIONAL (dados internos: telefone/e-mail — leitura
-- autenticada; escolha pública via view profissional_publico)
ALTER TABLE profissional ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profissional_read_active" ON profissional FOR SELECT TO authenticated
    USING (ativo = true);
CREATE POLICY "profissional_write_admin" ON profissional FOR ALL TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());
GRANT SELECT ON profissional_publico TO anon, authenticated;

-- PROFISSIONAL_SERVICO (vinculo — leitura autenticada)
ALTER TABLE profissional_servico ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profissional_servico_read" ON profissional_servico FOR SELECT TO authenticated
    USING (true);
CREATE POLICY "profissional_servico_write_admin" ON profissional_servico FOR ALL TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

-- AGENDA (janela semanal — pública, como cardápio de horários)
ALTER TABLE agenda ENABLE ROW LEVEL SECURITY;
CREATE POLICY "agenda_read_active" ON agenda FOR SELECT TO anon
    USING (ativo = true);
CREATE POLICY "agenda_write_admin" ON agenda FOR ALL TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

-- AGENDA_BLOQUEIO (exceções — leitura autenticada; cálculo de
-- slots é feito server-side, nunca exposto diretamente)
ALTER TABLE agenda_bloqueio ENABLE ROW LEVEL SECURITY;
CREATE POLICY "agenda_bloqueio_read" ON agenda_bloqueio FOR SELECT TO authenticated
    USING (true);
CREATE POLICY "agenda_bloqueio_write_admin" ON agenda_bloqueio FOR ALL TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

-- AGENDAMENTO (dono ou admin; visitante lazy via Edge Function
-- com service_role — não há política de INSERT para anon,
-- impedindo spam direto na tabela)
ALTER TABLE agendamento ENABLE ROW LEVEL SECURITY;
CREATE POLICY "agendamento_read_owner_admin" ON agendamento FOR SELECT TO authenticated
    USING (
        EXISTS (SELECT 1 FROM cliente WHERE cliente.email = auth.jwt() ->> 'email' AND cliente.id = agendamento.cliente_id)
        OR is_admin()
    );
CREATE POLICY "agendamento_insert_owner" ON agendamento FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (SELECT 1 FROM cliente WHERE cliente.email = auth.jwt() ->> 'email' AND cliente.id = agendamento.cliente_id)
    );
CREATE POLICY "agendamento_update_owner" ON agendamento FOR UPDATE TO authenticated
    USING (
        EXISTS (SELECT 1 FROM cliente WHERE cliente.email = auth.jwt() ->> 'email' AND cliente.id = agendamento.cliente_id)
    )
    WITH CHECK (
        EXISTS (SELECT 1 FROM cliente WHERE cliente.email = auth.jwt() ->> 'email' AND cliente.id = agendamento.cliente_id)
        AND (
            status = 'solicitado'
            OR (status = 'cancelado' AND inicio > now() + interval '24 hours')
        )
    );
CREATE POLICY "agendamento_update_admin" ON agendamento FOR UPDATE TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());
-- DELETE: nenhuma política — cancelamento é transição de
-- status, nunca apagamento (histórico em cadeia, §7.4).
