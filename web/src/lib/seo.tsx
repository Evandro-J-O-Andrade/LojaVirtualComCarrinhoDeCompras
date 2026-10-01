export interface SEOConfig {
  title?: string
  description?: string
  canonical?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  ogType?: string
  twitterCard?: string
  robots?: string
  jsonLd?: Record<string, any> | Record<string, any>[]
}

const DEFAULTS = {
  siteName: 'ANGEL Cosméticos',
  siteUrl: 'https://angelcosmeticos.com.br',
  description: 'Beleza, moda e casa. Produtos selecionados para realçar sua beleza e o seu lar.',
  ogImage: '/images/hero-beauty.jpg',
}

function escapeAttr(s: string): string {
  return String(s ?? '').replace(/"/g, '&quot;')
}

export function buildTitle(title?: string): string {
  if (!title) return DEFAULTS.siteName
  if (title.includes('ANGEL')) return title
  return `${title} | ANGEL Cosméticos`
}

export function SeoHead({
  title,
  description,
  canonical,
  ogTitle,
  ogDescription,
  ogImage,
  ogType = 'website',
  twitterCard = 'summary_large_image',
  robots,
  jsonLd,
}: SEOConfig) {
  const fullTitle = buildTitle(title)
  const metaDescription = description || DEFAULTS.description
  const ogUrl = canonical || DEFAULTS.siteUrl
  const metaOgTitle = ogTitle || fullTitle
  const metaOgDescription = ogDescription || metaDescription
  const metaOgImage = ogImage || DEFAULTS.ogImage

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={escapeAttr(metaDescription)} />
      {robots && <meta name="robots" content={robots} />}

      <link rel="canonical" href={ogUrl} />

      <meta property="og:title" content={escapeAttr(metaOgTitle)} />
      <meta property="og:description" content={escapeAttr(metaOgDescription)} />
      <meta property="og:image" content={escapeAttr(metaOgImage)} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={DEFAULTS.siteName} />
      <meta property="og:url" content={ogUrl} />

      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={escapeAttr(metaOgTitle)} />
      <meta name="twitter:description" content={escapeAttr(metaOgDescription)} />
      <meta name="twitter:image" content={escapeAttr(metaOgImage)} />

      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </>
  )
}

export function productJsonLd(p: {
  name: string
  image?: string
  price?: number
  slug?: string
  category?: string
  brand?: string
  availability?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    image: p.image ? [p.image] : undefined,
    brand: { '@type': 'Brand', name: p.brand || 'ANGEL Cosméticos' },
    category: p.category,
    offers: {
      '@type': 'Offer',
      url: `${DEFAULTS.siteUrl}/produtos/${p.slug || ''}`,
      priceCurrency: 'BRL',
      price: p.price,
      availability: p.availability || 'https://schema.org/InStock',
    },
  }
}

export function breadcrumbJsonLd(items: Array<{ name: string; href: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    breadcrumbListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.href,
    })),
  }
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ANGEL Cosméticos',
    url: DEFAULTS.siteUrl,
    logo: `${DEFAULTS.siteUrl}/images/logo.png`,
    sameAs: [
      'https://www.instagram.com/angelcosmeticos',
      'https://www.facebook.com/angelcosmeticos',
    ],
  }
}

export const SEO_DEFAULTS = DEFAULTS