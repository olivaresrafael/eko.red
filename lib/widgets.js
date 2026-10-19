import { getAllFilesFrontMatter } from '@/lib/mdx'
import { getAllExternalFrontMatter } from '@/lib/externalPosts'
import widgetsConfig from '@/data/widgets'
import portadaWidgetsConfig from '@/data/portadaWidgets'
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
  // Artículos de blogs hijo (kanaime.org): solo se usan en widgets con `source`
  const externalPosts = getAllExternalFrontMatter()
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
      // `source` → widget de un blog hijo (p. ej. kanaime.org): solo sus
      // artículos externos; se oculta si la fuente no tiene ninguno.
      if (conf.source) {
        const matching = externalPosts.filter((post) => post.source === conf.source)
        if (matching.length === 0) continue
        widgets.push({
          id: conf.id,
          title: conf.title,
          content: [{ articles: matching.slice(0, conf.limit || 6) }],
          includeImg: !!conf.includeImg,
          source: conf.source,
        })
        continue
      }

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

// Construye los widgets de portada (bloques bajo la nota principal) según
// data/portadaWidgets.js. Devuelve [{ id, title, href, articles, source? }]
// solo con los widgets activos que alcanzan su `min`; listo para pages/index.js.
//  - Lista manual (`posts`): se respeta el orden dado y se muestran todos
//    (slugs inexistentes se ignoran); el hero NO se filtra (es elección
//    explícita del editor).
//  - Modo tag: artículos con esa etiqueta (más recientes primero), excluyendo
//    el hero actual para no repetirlo justo debajo de sí mismo.
//  - Modo fuente (`source`, p. ej. kanaime): artículos externos de ese blog
//    hijo (getAllExternalFrontMatter), más recientes primero; el widget lleva
//    `source` para que el render lo pinte con la identidad del portal hijo.
export function buildPortadaWidgets(posts, heroSlug) {
  const externalPosts = getAllExternalFrontMatter()
  const built = []

  for (const conf of portadaWidgetsConfig) {
    if (!conf.enabled) continue

    let articles = []
    let source = null
    if (Array.isArray(conf.posts) && conf.posts.length > 0) {
      articles = conf.posts.map((slug) => posts.find((post) => post.slug === slug)).filter(Boolean)
    } else if (conf.source) {
      articles = externalPosts.filter((post) => post.source === conf.source)
      source = conf.source
    } else if (conf.tag) {
      articles = posts.filter(
        (post) =>
          post.slug !== heroSlug &&
          (post.tags || []).some((tag) => normalizeTag(tag) === normalizeTag(conf.tag))
      )
    } else {
      continue // sin lista ni tag ni fuente no hay cómo llenarlo
    }

    // Mínimo de artículos disponibles (antes de aplicar `limit`)
    if (articles.length < (conf.min ?? 1)) continue

    const limit = conf.limit ?? (conf.tag || source ? 3 : articles.length)
    const href =
      conf.href !== undefined
        ? conf.href
        : source
        ? `/tags/${normalizeTag(source)}`
        : conf.tag
        ? `/tags/${normalizeTag(conf.tag)}`
        : null

    built.push({
      id: conf.id,
      title: conf.title,
      href,
      articles: articles.slice(0, limit),
      source,
    })
  }

  return built
}

// Slugs que un widget con `excludeFromFeed: true` se reserva: en el home no
// aparecen en el feed regular ni como hero — solo se ven dentro de su widget
// (/blog, tags, RSS, sitemap y sidebar siguen mostrándolos).
//  - Lista manual: exactamente esos slugs.
//  - Modo tag: los `limit` más recientes con la etiqueta (los que verá el
//    widget). Se calcula ANTES de elegir hero; la deduplicación hero/widget
//    la hace buildPortadaWidgets después.
export function portadaFeedExclusions(posts) {
  const excluded = new Set()

  for (const conf of portadaWidgetsConfig) {
    if (!conf.enabled || conf.excludeFromFeed !== true) continue

    if (Array.isArray(conf.posts)) {
      conf.posts.forEach((slug) => excluded.add(slug))
    } else if (conf.tag) {
      posts
        .filter((post) =>
          (post.tags || []).some((tag) => normalizeTag(tag) === normalizeTag(conf.tag))
        )
        .slice(0, conf.limit ?? 3)
        .forEach((post) => excluded.add(post.slug))
    }
  }

  return excluded
}
