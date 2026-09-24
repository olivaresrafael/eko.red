import { getAllFilesFrontMatter } from '@/lib/mdx'
import siteMetadata from '@/data/siteMetadata'
import ListLayout from '@/layouts/ListLayout'
import { PageSEO } from '@/components/SEO'
import { buildWidgets } from '@/lib/widgets'

export const POSTS_PER_PAGE = 15

export async function getStaticProps() {
  const posts = await getAllFilesFrontMatter('blog')
  const widgets = await buildWidgets()
  const initialDisplayPosts = posts.slice(0, POSTS_PER_PAGE)
  const pagination = {
    currentPage: 1,
    totalPages: Math.ceil(posts.length / POSTS_PER_PAGE),
  }

  return { props: { initialDisplayPosts, posts, pagination, widgets } }
}

export default function Blog({ posts, initialDisplayPosts, pagination, widgets }) {
  return (
    <>
      <PageSEO
        title={`Todos los articulos - ${siteMetadata.author}`}
        description={siteMetadata.description}
      />
      <ListLayout
        posts={posts}
        initialDisplayPosts={initialDisplayPosts}
        pagination={pagination}
        widgets={widgets}
        title="Todos los articulos"
      />
    </>
  )
}
