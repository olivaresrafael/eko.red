import { useState } from 'react'
import Link from '@/components/Link'
import Image from '@/components/Image'
import { PageSEO } from '@/components/SEO'
import Tag from '@/components/Tag'
import Box from '@/components/Box'
import siteMetadata from '@/data/siteMetadata'
import { dateSortDesc, getAllFilesFrontMatter } from '@/lib/mdx'
import { buildWidgets } from '@/lib/widgets'
import kebabCase from '@/lib/utils/kebabCase'
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

  // Hero = primer featured (o el más reciente si no hay); el resto de
  // featured va en los slots siguientes y después el resto por fecha
  const hero = featured[0] || posts[0]
  const restFeatured = featured.filter((post) => post.slug !== hero.slug)
  const rest = posts.filter(
    (post) => post.slug !== hero.slug && !restFeatured.some((f) => f.slug === post.slug)
  )
  const ordered = [hero, ...restFeatured, ...rest]

  // Sección Cultura bajo la nota principal: solo se muestra con más de 2
  // artículos publicados con tag 'cultura' (pedido del equipo, 2026-09).
  const culturaPosts = ordered.filter((post) =>
    (post.tags || []).some((tag) => kebabCase(tag) === 'cultura')
  )
  const showCultura = culturaPosts.length > 2
  const culturaFeatured = showCultura ? culturaPosts[0] : null

  return {
    props: { posts: ordered, widgets, showCultura, culturaFeatured },
  }
}

export default function Home({ posts, widgets, showCultura, culturaFeatured }) {
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
          {/* Sección Cultura (solo con >2 artículos de cultura): 1 destacado
              con foto + link a la sección /tags/cultura */}
          {showCultura && culturaFeatured && (
            <div className="mt-4 rounded-md border-2 border-gray-200 border-opacity-60 p-4 dark:border-gray-700">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-xl font-bold uppercase tracking-wide text-gray-900 dark:text-gray-100">
                  Cultura
                </h2>
                <Link
                  href="/tags/cultura"
                  className="text-sm font-medium text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-500"
                >
                  Ver toda la sección &rarr;
                </Link>
              </div>
              <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-4 sm:space-y-0">
                {culturaFeatured.images && culturaFeatured.images[0] && (
                  <Link
                    href={`/blog/${culturaFeatured.slug}`}
                    aria-label={`Link to ${culturaFeatured.title}`}
                    className="w-full shrink-0 sm:w-64"
                  >
                    <Image
                      alt={culturaFeatured.title}
                      src={culturaFeatured.images[0]}
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
                      href={`/blog/${culturaFeatured.slug}`}
                      className="text-gray-900 dark:text-gray-100"
                    >
                      {culturaFeatured.title}
                    </Link>
                  </h3>
                  <p className="prose mt-2 max-w-none text-gray-500 dark:text-gray-400">
                    {culturaFeatured.summary}
                  </p>
                </div>
              </div>
            </div>
          )}
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
