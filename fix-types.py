import re

with open('D:/LojaVirtualComCarrinhoDeCompras/web/src/types/index.ts', 'r') as f:
    content = f.read()

# Remove the "7" prefix from field names
content = re.sub(r'7(preco|nome|product|valor|preco_unitario|descricao)', r'\1', content)

with open('D:/LojaVirtualComCarrinhoDeCompras/web/src/types/index.ts', 'w') as f:
    f.write(content)

print("Fixed!")