const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const fs = require('fs')
const path = require('path')
const matter = require('gray-matter')
const sectionsConfig = require('./data/sections')

// Mismo criterio de slug que lib/utils/kebabCase (sin tildes, minúsculas)
const normalizeTag = (str) =>
  String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')

// Filtra las secciones con requiresContent que aún no tienen artículos
// (ej. Kanaime oculta hasta publicar el primer artículo con tag 'kanaime').
// Cuenta también los stubs externos (data/external/<fuente>/, blogs hijo):
// basta un artículo indexado para que la sección aparezca en la navegación.
// Se ejecuta al iniciar el build/dev server y el resultado se inyecta al
// bundle como NEXT_PUBLIC_SECTIONS (server y client ven el mismo valor).
function getVisibleSections() {
  const usedTags = new Set()

  const collectTags = (dir) => {
    let files = []
    try {
      files = fs.readdirSync(dir).filter((file) => /\.mdx?$/.test(file))
    } catch (error) {
      return
    }
    for (const file of files) {
      try {
        const { data } = matter(fs.readFileSync(path.join(dir, file), 'utf8'))
        if (data.draft === true) continue
        ;(Array.isArray(data.tags) ? data.tags : []).forEach((tag) =>
          usedTags.add(normalizeTag(tag))
        )
      } catch (error) {
        // Frontmatter inválido: ignorar el archivo
      }
    }
  }

  collectTags(path.join(__dirname, 'data', 'blog'))

  // Fuentes externas (blogs hijo): cada subdirectorio de data/external/
  let sources = []
  try {
    sources = fs
      .readdirSync(path.join(__dirname, 'data', 'external'), { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
  } catch (error) {
    // Sin data/external/ no hay nada que añadir
  }
  sources.forEach((source) => collectTags(path.join(__dirname, 'data', 'external', source)))

  return sectionsConfig.filter(
    (section) => !section.requiresContent || usedTags.has(section.tag)
  )
}


// You might need to insert additional domains in script-src if you are using external services
const ContentSecurityPolicy = `
  default-src 'self' https://vitals.vercel-insights.com/v1/vitals;
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://fastly.jsdelivr.net/ https://vitals.vercel-insights.com/v1/vitals https://giscus.app  https://www.google-analytics.com https://www.googletagmanager.com https://google-analytics.com https://pagead2.googlesyndication.com https://ep2.adtrafficquality.google;
  style-src 'self' 'unsafe-inline';
  img-src * blob: data:;
  child-src 'none';
  media-src 'none';
  connect-src *;
  font-src 'self';
  frame-src 'self' *;
`

const securityHeaders = [
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\n/g, ''),
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-DNS-Prefetch-Control
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Feature-Policy
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
]

module.exports = withBundleAnalyzer({
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_SECTIONS: JSON.stringify(getVisibleSections()),
  },
  pageExtensions: ['js', 'jsx', 'md', 'mdx'],
  // Miniaturas de blogs hijo: si un stub usa una URL de kanaime.org en
  // `images`, next/image necesita el dominio aquí (el CSP ya permite img-src *).
  images: {
    domains: ['kanaime.org'],
  },
  eslint: {
    dirs: ['pages', 'components', 'lib', 'layouts', 'scripts'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
  webpack: (config, { dev, isServer }) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    })

    if (!dev && !isServer) {
      // Replace React with Preact only in client production build
      Object.assign(config.resolve.alias, {
        'react/jsx-runtime.js': 'preact/compat/jsx-runtime',
        react: 'preact/compat',
        'react-dom/test-utils': 'preact/test-utils',
        'react-dom': 'preact/compat',
      })
    }

    return config
  },
})
