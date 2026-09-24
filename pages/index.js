import { useState } from 'react'
import Link from '@/components/Link'
import Image from '@/components/Image'
import { PageSEO } from '@/components/SEO'
import Tag from '@/components/Tag'
import Box from '@/components/Box'
import siteMetadata from '@/data/siteMetadata'
import { dateSortDesc, getAllFilesFrontMatter } from '@/lib/mdx'
import { buildWidgets, buildPortadaWidgets } from '@/lib/widgets'
import Sidebar from '@/layouts/Sidebar'

import NewsletterForm from '@/components/NewsletterForm'

export async function getStaticProps() {
  // getAllFilesFrontMatter ya excluye borradores → un `featured: true`
  // con `draft: true` nunca llega aquí (Fase 6.3)
  const posts = await getAllFilesFrontMatter('blog')
  const widgets = await buildWidgets()

  // Portada (Fase 6): los artículos con `featured: true` encabezan el home
  // aunque no sean los más nuevos. Orden entre ellos por `featuredOrder`
  // (menor primero; si falta, después) y, en empate, por fecha. Sin ninguno,
  // manda lo más reciente (orden cronológico normal).
  const featured = posts
    .filter((post) => post.featured === true)
    .sort((a, b) => {
      const orderA = a.featuredOrder ?? Infinity
      const orderB = b.featuredOrder ?? Infinity
      if (orderA !== orderB) return orderA - orderB
      return dateSortDesc(a.date, b.date)
    })

  // Hero = primer featured (o el más reciente) SIN `excludeHero`. Esa marca
  // solo evita el layout del primer artículo: el post sigue en la lista del
  // home, sus widgets y las secciones (2026-09-24).
  const hero =
    featured.find((post) => post.excludeHero !== true) ||
    posts.find((post) => post.excludeHero !== true) ||
    posts[0]
  const restFeatured = featured.filter((post) => post.slug !== hero.slug)
  const rest = posts.filter(
    (post) => post.slug !== hero.slug && !restFeatured.some((f) => f.slug === post.slug)
  )
  const ordered = [hero, ...restFeatured, ...rest]

  // Widgets de portada (data/portadaWidgets.js): bloques bajo la nota principal
  const portadaWidgets = buildPortadaWidgets(posts, hero.slug)

  return {
    props: { posts: ordered, widgets, portadaWidgets },
  }
}

export default function Home({ posts, widgets, portadaWidgets }) {
  const [maxDisplay, setMaxDisplay] = useState(12)

  return (
    <>
      <PageSEO title={siteMetadata.title} description={siteMetadata.description} />
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="container py-8">
          {/* Nota principal (Box a todo el ancho) */}
          <div className="-m-4 flex flex-wrap">
            {posts[0].images && posts[0].images.length > 0 ? (
              <Box
                title={posts[0].title}
                description={posts[0].summary}
                imgSrc={posts[0].images[0]}
                href={`/blog/${posts[0].slug}`}
                tags={posts[0].tags}
              />
            ) : (
              <div className="md p-4 md:w-full" style={{ maxWidth: '100%' }}>
                <div className="rounded-md border-2 border-gray-200 border-opacity-60 p-6 dark:border-gray-700">
                  <div className="flex flex-wrap">
                    {posts[0].tags.map((tag) => (
                      <Tag key={tag} text={tag} />
                    ))}
                  </div>
                  <h2 className="mb-3 text-2xl font-bold leading-8 tracking-tight">
                    <Link href={`/blog/${posts[0].slug}`} aria-label={`Link to ${posts[0].title}`}>
                      {posts[0].title}
                    </Link>
                  </h2>
                  <p className="prose mb-3 max-w-none text-gray-500 dark:text-gray-400">
                    {posts[0].summary}
                  </p>
                </div>
              </div>
            )}
          </div>
          {/* Widgets de portada (data/portadaWidgets.js): bloques bajo la
              nota principal, en el orden del config; cada uno se llena por
              tag o por lista manual de artículos */}
          {portadaWidgets.map((widget) => (
            <div
              key={widget.id}
              className="mt-4 rounded-md border-2 border-gray-200 border-opacity-60 p-4 dark:border-gray-700"
            >
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-xl font-bold uppercase tracking-wide text-gray-900 dark:text-gray-100">
                  {widget.title}
                </h2>
                {widget.href && (
                  <Link
                    href={widget.href}
                    className="text-sm font-medium text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-500"
                  >
                    Ver toda la sección &rarr;
                  </Link>
                )}
              </div>
              <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-700">
                {widget.articles.map((article) => (
                  <div
                    key={article.slug}
                    className="flex flex-col space-y-3 py-3 first:py-0 sm:flex-row sm:space-x-4 sm:space-y-0"
                  >
                    {article.images && article.images[0] && (
                      <Link
                        href={`/blog/${article.slug}`}
                        aria-label={`Link to ${article.title}`}
                        className="w-full shrink-0 sm:w-64"
                      >
                        <Image
                          alt={article.title}
                          src={article.images[0]}
                          width={700}
                          height={466}
                          layout="responsive"
                          className="rounded-md object-cover"
                        />
                      </Link>
                    )}
                    <div>
                      <h3 className="text-2xl font-bold leading-8 tracking-tight">
                        <Link
                          href={`/blog/${article.slug}`}
                          className="text-gray-900 dark:text-gray-100"
                        >
                          {article.title}
                        </Link>
                      </h3>
                      <p className="prose mt-2 max-w-none text-gray-500 dark:text-gray-400">
                        {article.summary}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {/* Sidebar (izquierda en desktop) + lista de artículos en Box —
              composición idéntica a panameconomics */}
          <div className="-m-4 flex flex-wrap">
            <Sidebar widgets={widgets} className="order-2 md:order-1" />
            <div className="order-1 w-full py-4 md:order-2 md:w-2/3">
              {posts.slice(1, maxDisplay).map((d) => (
                <Box
                  key={d.slug}
                  title={d.title}
                  description={d.summary}
                  imgSrc={d.images && d.images.length > 0 ? d.images[0] : null}
                  href={`/blog/${d.slug}`}
                  tags={d.tags}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      {posts.length > maxDisplay && (
        <div className="flex justify-end text-base font-medium leading-6">
          <button
            type="button"
            onClick={() => setMaxDisplay(maxDisplay + 4)}
            className="text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-500"
            aria-label="Mostrar más artículos"
          >
            Mostrar más &rarr;
          </button>
        </div>
      )}
      {siteMetadata.newsletter.enabled && siteMetadata.newsletter.provider !== '' && (
        <div className="flex items-center justify-center pt-4">
          <NewsletterForm title={siteMetadata.newsletter.title} />
        </div>
      )}
    </>
  )
}
