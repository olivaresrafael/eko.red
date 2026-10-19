import { TagSEO } from '@/components/SEO'
import siteMetadata from '@/data/siteMetadata'
import ListLayout from '@/layouts/ListLayout'
import generateRss from '@/lib/generate-rss'
import { getAllFilesFrontMatter } from '@/lib/mdx'
import { getAllExternalFrontMatter, mergeWithExternal } from '@/lib/externalPosts'
import { getAllTags } from '@/lib/tags'
import kebabCase from '@/lib/utils/kebabCase'
import fs from 'fs'
import path from 'path'

const root = process.cwd()

export async function getStaticPaths() {
  const tags = await getAllTags('blog')

  // Tags de artículos externos (blogs hijo): la página del tag debe existir
  // aunque no haya contenido local con esa etiqueta (p. ej. /tags/kanaime).
  getAllExternalFrontMatter().forEach((post) => {
    ;(post.tags || []).forEach((tag) => {
      const formattedTag = kebabCase(tag)
      if (!(formattedTag in tags)) tags[formattedTag] = 1
    })
  })

  return {
    paths: Object.keys(tags).map((tag) => ({
      params: {
        tag,
      },
    })),
    fallback: false,
  }
}

export async function getStaticProps({ params }) {
  // Locales + externos (kanaime.org) mezclados por fecha; los stubs externos
  // solo traen metadata y linkean al portal hijo (pestaña nueva).
  const allPosts = mergeWithExternal(await getAllFilesFrontMatter('blog'))
  const filteredPosts = allPosts.filter(
    (post) => post.draft !== true && (post.tags || []).map((t) => kebabCase(t)).includes(params.tag)
  )

  // rss
  if (filteredPosts.length > 0) {
    const rss = generateRss(filteredPosts, `tags/${params.tag}/feed.xml`)
    const rssPath = path.join(root, 'public', 'tags', params.tag)
    fs.mkdirSync(rssPath, { recursive: true })
    fs.writeFileSync(path.join(rssPath, 'feed.xml'), rss)
  }

  return { props: { posts: filteredPosts, tag: params.tag } }
}

export default function Tag({ posts, tag }) {
  // Capitalize first letter and convert space to dash
  const title = tag[0].toUpperCase() + tag.split(' ').join('-').slice(1)
  return (
    <>
      <TagSEO
        title={`${tag} - ${siteMetadata.author}`}
        description={`${tag} tags - ${siteMetadata.author}`}
      />
      {/* Sin sidebar en páginas de tags (pedido del equipo) */}
      <ListLayout posts={posts} title={title} />
    </>
  )
}
