SELECT id, nome, slug, ativo FROM categoria ORDER BY id;
SELECT id, nome, cnpj, ativo FROM fornecedor ORDER BY id;
SELECT id, nome, slug, preco_base, ativo FROM produto ORDER BY id;
SELECT id, produto_id, url, principal, ordem FROM produto_imagem ORDER BY produto_id, ordem;