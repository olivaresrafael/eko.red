import staticSections from '@/data/sections'

// Secciones visibles calculadas en next.config.js al iniciar el build/dev
// server (lee data/blog y filtra las secciones con requiresContent que aún no
// tienen artículos). Se inyecta al bundle server + client como literal, así
// que ambos ven el mismo valor (sin hydration mismatch).
const sections = (() => {
  if (process.env.NEXT_PUBLIC_SECTIONS) {
    try {
      return JSON.parse(process.env.NEXT_PUBLIC_SECTIONS)
    } catch (error) {
      // Si el JSON no se parsea, caemos a la lista estática sin secciones
      // que requieren contenido (Kanaime queda oculto, que es lo seguro)
    }
  }
  return staticSections.filter((s) => !s.requiresContent)
})()

export default sections
