// Metadatos de las fuentes externas (blogs hijos indexados en eko.red).
// Fuente única de verdad para el sello visual (label/dominio) en componentes
// cliente — no importar lib/externalPosts.js en el cliente (usa fs, solo servidor).
const externalSources = {
  kanaime: { label: 'KANAIME.ORG', domain: 'kanaime.org' },
}

// Info de una fuente; fallback razonable para fuentes sin configurar.
export function sourceInfo(source) {
  return externalSources[source] || { label: String(source || '').toUpperCase(), domain: source }
}

export default externalSources
