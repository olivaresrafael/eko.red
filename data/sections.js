// Secciones del sitio: barra de etiquetas en el header, barra fija con scroll
// y menú móvil. Cada sección apunta a /tags/<tag>.
//
// - tag: slug de la sección en /tags/<tag> (debe coincidir con el tag de los
//   artículos, sin tildes ni espacios: ej. LATINOAMÉRICA → latinoamerica)
// - requiresContent: la sección solo se muestra si existe ≥1 artículo (no
//   borrador) con esa etiqueta. Se calcula en next.config.js al iniciar el
//   build/dev server y se inyecta vía NEXT_PUBLIC_SECTIONS.
const sections = [
  { title: 'MUNDO', tag: 'mundo' },
  { title: 'LATINOAMÉRICA', tag: 'latinoamerica' },
  { title: 'CRIMEN', tag: 'crimen' },
  { title: 'CIBERSEGURIDAD', tag: 'ciberseguridad' },
  { title: 'CULTURA', tag: 'cultura' },
  // Turismo y naturaleza — oculta hasta publicar el primer artículo con tag 'kanaime'
  { title: 'KANAIME', tag: 'kanaime', requiresContent: true },
]

module.exports = sections
