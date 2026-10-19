import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { dateSortDesc, formatSlug } from '@/lib/mdx'

// Artículos de blogs hijos (kanaime.org) indexados en eko.red: solo metadata.
// Cada fuente es un subdirectorio de data/external/ con stubs .md que llevan
// frontmatter + `externalUrl` al portal hijo (el artículo completo vive allí).
// El loader es independiente de lib/mdx getAllFilesFrontMatter: los stubs
// NUNCA deben mezclarse en getStaticPaths de pages/blog/[...slug].js.
const root = process.cwd()

// Fuentes externas soportadas. Para indexar otro blog hijo: añadir su
// slug aquí y crear data/external/<slug>/.
export const EXTERNAL_SOURCES = ['kanaime']

// Frontmatter de los stubs de una fuente, con la misma normalización que
// getAllFilesFrontMatter (drafts fuera, date en ISO UTC + dateRaw para display).
// Reglas: sin `externalUrl` el stub se ignora (se avisa en build); `tags`
// default [] (los .map de tarjetas/listados son sin guardar).
export function getExternalFrontMatter(source) {
  const prefixPaths = path.join(root, 'data', 'external', source)
  if (!fs.existsSync(prefixPaths)) return []

  const allFrontMatter = []

  fs.readdirSync(prefixPaths).forEach((fileName) => {
    if (path.extname(fileName) !== '.md' && path.extname(fileName) !== '.mdx') return

    const content = fs.readFileSync(path.join(prefixPaths, fileName), 'utf8')
    const { data: frontmatter } = matter(content)

    if (frontmatter.draft === true) return
    if (!frontmatter.externalUrl) {
      console.warn(`[externalPosts] data/external/${source}/${fileName} sin externalUrl: ignorado`)
      return
    }

    allFrontMatter.push({
      ...frontmatter,
      tags: frontmatter.tags || [],
      slug: formatSlug(fileName),
      date: frontmatter.date ? new Date(frontmatter.date).toISOString() : null,
      dateRaw: frontmatter.date || null,
      externalUrl: frontmatter.externalUrl,
      source,
    })
  })

  return allFrontMatter.sort((a, b) => dateSortDesc(a.date, b.date))
}

// Frontmatter de todas las fuentes externas, ordenado por fecha.
export function getAllExternalFrontMatter() {
  const all = EXTERNAL_SOURCES.reduce(
    (acc, source) => [...acc, ...getExternalFrontMatter(source)],
    []
  )
  return all.sort((a, b) => dateSortDesc(a.date, b.date))
}
