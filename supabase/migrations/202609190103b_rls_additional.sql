-- Gate 6.3A — RLS Policies (additional tables)
-- For tables missing from initial RLS migration
-- Created: 2026-09-19

-- PRODUTO_ATRIBUTO
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'produto_atributo' AND relrowsecurity = true) THEN
        ALTER TABLE produto_atributo ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polrelid = 'produto_atributo'::regclass AND polname = 'produto_atributo_read_admin') THEN
        CREATE POLICY "produto_atributo_read_admin" ON produto_atributo FOR SELECT TO authenticated USING (is_admin());
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polrelid = 'produto_atributo'::regclass AND polname = 'produto_atributo_write_admin') THEN
        CREATE POLICY "produto_atributo_write_admin" ON produto_atributo FOR ALL TO authenticated USING (is_admin());
    END IF;
END $$;

-- PRODUTO_ATRIBUTO_VALOR
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'produto_atributo_valor' AND relrowsecurity = true) THEN
        ALTER TABLE produto_atributo_valor ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polrelid = 'produto_atributo_valor'::regclass AND polname = 'produto_atributo_valor_read_admin') THEN
        CREATE POLICY "produto_atributo_valor_read_admin" ON produto_atributo_valor FOR SELECT TO authenticated USING (is_admin());
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polrelid = 'produto_atributo_valor'::regclass AND polname = 'produto_atributo_valor_write_admin') THEN
        CREATE POLICY "produto_atributo_valor_write_admin" ON produto_atributo_valor FOR ALL TO authenticated USING (is_admin());
    END IF;
END $$;

-- PRODUTO_CATEGORIA
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'produto_categoria' AND relrowsecurity = true) THEN
        ALTER TABLE produto_categoria ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polrelid = 'produto_categoria'::regclass AND polname = 'produto_categoria_read_admin') THEN
        CREATE POLICY "produto_categoria_read_admin" ON produto_categoria FOR SELECT TO authenticated USING (is_admin());
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polrelid = 'produto_categoria'::regclass AND polname = 'produto_categoria_write_admin') THEN
        CREATE POLICY "produto_categoria_write_admin" ON produto_categoria FOR ALL TO authenticated USING (is_admin());
    END IF;
END $$;

-- PRODUTO_IMAGEM
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'produto_imagem' AND relrowsecurity = true) THEN
        ALTER TABLE produto_imagem ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polrelid = 'produto_imagem'::regclass AND polname = 'produto_imagem_read_admin') THEN
        CREATE POLICY "produto_imagem_read_admin" ON produto_imagem FOR SELECT TO authenticated USING (is_admin());
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polrelid = 'produto_imagem'::regclass AND polname = 'produto_imagem_write_admin') THEN
        CREATE POLICY "produto_imagem_write_admin" ON produto_imagem FOR ALL TO authenticated USING (is_admin());
    END IF;
END $$;

-- PRODUTO_VARIANTE_ATRIBUTO
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'produto_variante_atributo' AND relrowsecurity = true) THEN
        ALTER TABLE produto_variante_atributo ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polrelid = 'produto_variante_atributo'::regclass AND polname = 'produto_variante_atributo_read_admin') THEN
        CREATE POLICY "produto_variante_atributo_read_admin" ON produto_variante_atributo FOR SELECT TO authenticated USING (is_admin());
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polrelid = 'produto_variante_atributo'::regclass AND polname = 'produto_variante_atributo_write_admin') THEN
        CREATE POLICY "produto_variante_atributo_write_admin" ON produto_variante_atributo FOR ALL TO authenticated USING (is_admin());
    END IF;
END $$;
