-- Seed de desenvolvimento - Angel Cosméticos
-- Dados explicitamente identificados como de desenvolvimento
-- NAO usar em producao

INSERT INTO fornecedor (nome, cnpj, telefone, email, ativo) VALUES
('Mary Kay Cosmeticos', '01020304000109', '11987654321', 'fornedor@marykay.com', true),
('Bela Cosmeticos LTDA', '98765432100109', '11987654322', 'contato@bela.com', true),
('Puro Cosmeticos', '11223344556677', '11987654323', 'vendas@puro.com', true)
ON CONFLICT (cnpj) DO NOTHING;

INSERT INTO categoria (nome, slug, ativo) VALUES
('Maquiagem', 'maquiagem', true),
('Cuidados com a Pele', 'cuidados-pele', true),
('Cabelos', 'cabelos', true),
('Corpo e Banho', 'corpo-banho', true),
('Acessorios', 'acessorios', true),
('Promocoes', 'promocoes', true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO produto (nome, slug,preco_base, fornecedor_id, ativo) VALUES
('Batom Matte Vermelho', 'batom-matte-vermelho', 89.90, 1, true),
('Base Liquida Clara', 'base-liquida-clara', 120.00, 1, true),
('Mascara de Cabelos', 'mascara-cabelos', 95.00, 2, true),
('Sabonete Liquido', 'sabonete-liquido', 45.00, 3, true),
('Esmalte Vermelho', 'esmalte-vermelho', 25.00, 1, true),
('Alcool Gel', 'alcool-gel', 32.00, 3, true),
('Protetor Solar', 'protetor-solar', 89.00, 2, true),
('Shampoo Antiresiduo', 'shampoo-antiresiduo', 65.00, 2, true),
('Hidratante Labial', 'hidratante-labial', 28.00, 1, true),
('Mascara Facial', 'mascara-facial', 55.00, 3, true),
('Oleo Capilar', 'oleo-capilar', 72.00, 2, true),
('Desodorante Roll-on', 'desodorante-rollon', 38.00, 3, true)
ON CONFLICT (slug) DO NOTHING;
