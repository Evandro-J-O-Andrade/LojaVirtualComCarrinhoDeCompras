with open('D:/LojaVirtualComCarrinhoDeCompras/seed-dev.sql', 'r') as f:
    content = f.read()

# Fix the column names
content = content.replace('7preco_base,7fornedor_id', 'preco_base, fornecedor_id')

with open('D:/LojaVirtualComCarrinhoDeCompras/seed-dev.sql', 'w') as f:
    f.write(content)

print("Fixed!")