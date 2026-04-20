import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = 'https://angelcosmeticos.netlify.app';

const PAGES = [
    { loc: '/', priority: '1.0', changefreq: 'daily', lastmod: new Date().toISOString().split('T')[0] },
    { loc: '/index.html', priority: '1.0', changefreq: 'weekly' },
    { loc: '/assets/html/produtos.html', priority: '0.9', changefreq: 'weekly' },
    { loc: '/assets/html/eventos.html', priority: '0.8', changefreq: 'monthly' },
    { loc: '/assets/html/empresa.html', priority: '0.7', changefreq: 'monthly' },
    { loc: '/assets/html/contato.html', priority: '0.7', changefreq: 'monthly' },
    { loc: '/assets/html/conta.html', priority: '0.6', changefreq: 'yearly' },
    { loc: '/assets/html/carrinho.html', priority: '0.6', changefreq: 'monthly' },
    { loc: '/assets/html/completarCadastro.html', priority: '0.6', changefreq: 'monthly' },
    { loc: '/assets/html/fornecedores.html', priority: '0.5', changefreq: 'monthly' },
    { loc: '/assets/html/ver-produtos.html', priority: '0.8', changefreq: 'weekly' },
    { loc: '/assets/html/pdf.html', priority: '0.5', changefreq: 'yearly' },
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${PAGES.map(page => `  <url>
    <loc>${BASE_URL}${page.loc}</loc>
    <lastmod>${page.lastmod || new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;

fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), sitemap);
console.log('sitemap.xml gerado com sucesso!');
console.log(`${PAGES.length} páginas encontradas.`);