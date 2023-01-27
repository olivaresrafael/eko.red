import Link from '@/components/Link'
import { PageSEO } from '@/components/SEO'
import Tag from '@/components/Tag'
import Card from '@/components/Card'
import Box from '@/components/Box'
import Image from '@/components/Image'
import siteMetadata from '@/data/siteMetadata'
import { getAllFilesFrontMatter } from '@/lib/mdx'
import formatDate from '@/lib/utils/formatDate'

import NewsletterForm from '@/components/NewsletterForm'

const MAX_DISPLAY = 8

export async function getStaticProps() {
  const posts = await getAllFilesFrontMatter('blog')

  return { props: { posts } }
}

export default function Home({ posts }) {
  return (
    <>
      <PageSEO title={siteMetadata.title} description={siteMetadata.description} />
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="grid grid-cols-3 justify-items-center gap-3">
          {siteMetadata.description.map((line) => (
            <a
              key={line}
              href="#"
              className="w-64 p-1 text-center text-xl font-semibold text-gray-900 dark:text-gray-100 sm:p-4"
            >
              {line}
            </a>
          ))}
        </div>
        <div className="container py-12">
          <div className="-m-4 flex flex-wrap">
            <Box
              title={posts[0].title}
              description={posts[0].summary}
              imgSrc={posts[0].images[0]}
              href={`/blog/${posts[0].slug}`}
              tags={posts[0].tags}
            />
          </div>
          <div className="-m-4 flex flex-wrap">
            {posts.slice(1, 3).map((d) => (
              <Card
                key={d.title}
                title={d.title}
                description={d.summary}
                imgSrc={d.images[0]}
                href={`/blog/${d.slug}`}
                tags={d.tags}
              />
            ))}
          </div>
        </div>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {!posts.length && 'No posts found.'}
          {posts.slice(3, MAX_DISPLAY).map((frontMatter) => {
            const { slug, date, title, summary, tags, images } = frontMatter
            return (
              <Li
                key={slug}
                slug={slug}
                date={date}
                title={title}
                summary={summary}
                tags={tags}
                image={images[0]}
              />
            )
          })}
        </ul>
      </div>
      {posts.length > MAX_DISPLAY && (
        <div className="flex justify-end text-base font-medium leading-6">
          <Link
            href="/blog"
            className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
            aria-label="all posts"
          >
            Todos los posts &rarr;
          </Link>
        </div>
      )}
      {siteMetadata.newsletter.provider !== '' && (
        <div className="flex items-center justify-center pt-4">
          <NewsletterForm title={siteMetadata.newsletter.title} />
        </div>
      )}
    </>
  )
}

function Li({ slug, date, title, summary, tags, image }) {
  return (
    <li key={slug} className="py-12">
      <article>
        <div className="space-y-2 xl:grid xl:grid-cols-4 xl:items-baseline xl:space-y-0">
          <div className="mx-3">
            <Link href={`/blog/${slug}`} aria-label={`Link to ${title}`}>
              <Image
                alt={title}
                src={image}
                className="object-cover object-center md:h-36 lg:h-48"
                layout="responsive"
                width={250}
                height={180}
              />
            </Link>
          </div>

          <div className="space-y-5 xl:col-span-3">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold leading-8 tracking-tight">
                  <Link href={`/blog/${slug}`} className="text-gray-900 dark:text-gray-100">
                    {title}
                  </Link>
                </h2>
                <dl className="mt-0">
                  <dt className="sr-only">Published on</dt>
                  <dd className="text-xs font-light leading-6 text-gray-300 dark:text-gray-100">
                    <time dateTime={date}>{formatDate(date)}</time>
                  </dd>
                </dl>
                <div className="flex flex-wrap">
                  {tags.map((tag) => (
                    <Tag key={tag} text={tag} />
                  ))}
                </div>
              </div>

              <div className="prose max-w-none text-gray-500 dark:text-gray-400">{summary}</div>
            </div>

            <div className="text-base font-medium leading-6">
              <Link
                href={`/blog/${slug}`}
                className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                aria-label={`Read "${title}"`}
              >
                Leer más &rarr;
              </Link>
            </div>
          </div>
        </div>
      </article>
    </li>
  )
}
