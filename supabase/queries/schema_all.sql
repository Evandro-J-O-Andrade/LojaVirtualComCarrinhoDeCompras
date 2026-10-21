SELECT column_name, data_type, is_nullable, column_default, character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name IN ('categoria', 'fornecedor', 'produto_imagem', 'produto_categoria', 'produto_variante', 'produto_atributo', 'produto_atributo_valor', 'produto_opcao_compra', 'produto_opcao_valor', 'kit_composicao', 'promocao', 'estoque')
ORDER BY table_name, ordinal_position