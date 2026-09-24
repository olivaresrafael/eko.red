import { getAllFilesFrontMatter } from '@/lib/mdx'
import widgetsConfig from '@/data/widgets'
import sections from '@/lib/sections'

// Normaliza tags para compararlos con los slugs de /tags/<slug>
// (mismo criterio de lib/utils/kebabCase: sin tildes, minúsculas, guiones)
const normalizeTag = (str) =>
  String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')

// Construye el contenido de los widgets del sidebar según data/widgets.js.
// Devuelve [{ id, title, content: [...], includeImg? }] listo para Sidebar.
export async function buildWidgets() {
  const posts = await getAllFilesFrontMatter('blog')
  const authors = await getAllFilesFrontMatter('authors')
  const widgets = []

  for (const conf of widgetsConfig) {
    if (!conf.enabled) continue

    if (conf.type === 'authors') {
      let authorList = authors.filter((author) => author.slug !== 'default' && author.name)

      // Orden fijo si el config lo define (autores fuera del orden → al final)
      if (Array.isArray(conf.order) && conf.order.length > 0) {
        const rank = (author) => {
          const index = conf.order.indexOf(author.slug)
          return index === -1 ? conf.order.length : index
        }
        authorList = [...authorList].sort((a, b) => rank(a) - rank(b))
      }

      const content = authorList
        .map((author) => ({
          title: author.name,
          imgSrc: author.avatar,
          articles: posts
            .filter((post) => (post.authors || []).includes(author.slug))
            .slice(0, conf.limit || 3),
        }))
        .filter((item) => item.articles.length > 0)
      if (content.length > 0) {
        widgets.push({ id: conf.id, title: conf.title, content })
      }
    }

    if (conf.type === 'categories') {
      const counts = {}
      posts.forEach((post) =>
        (post.tags || []).forEach((tag) => {
          const key = normalizeTag(tag)
          counts[key] = (counts[key] || 0) + 1
        })
      )
      const content = sections
        .filter((section) => counts[section.tag] > 0)
        .map((section) => ({
          title: section.title,
          href: `/tags/${section.tag}`,
          count: counts[section.tag],
        }))
      if (content.length > 0) {
        widgets.push({ id: conf.id, title: conf.title, content })
      }
    }

    if (conf.type === 'latest') {
      // Si el widget define tag, filtra solo artículos con esa etiqueta
      // (usado por el widget Cultura). Sin tag = últimas publicaciones.
      const matching = conf.tag
        ? posts.filter((post) =>
            (post.tags || []).some((tag) => normalizeTag(tag) === normalizeTag(conf.tag))
          )
        : posts

      // Un widget con tag vacío no se muestra (evita títulos sin contenido)
      if (conf.tag && matching.length === 0) continue

      widgets.push({
        id: conf.id,
        title: conf.title,
        content: [{ articles: matching.slice(0, conf.limit || 6) }],
        includeImg: !!conf.includeImg,
      })
    }
  }

  return widgets
}
