import { MDXLayoutRenderer } from '@/components/MDXComponents'
import { getFileBySlug } from '@/lib/mdx'
import { PageSEO } from '@/components/SEO'

const DEFAULT_LAYOUT = 'AboutLayout'

export async function getStaticProps() {
  const Francisco = await getFileBySlug('authors', ['folivares'])
  const Rafael = await getFileBySlug('authors', ['olivaresrafael'])
  const Marcos = await getFileBySlug('authors', ['marcostarre'])
  const Tomas = await getFileBySlug('authors', ['tomaspaez'])
  const ObservatorioDiaspora = await getFileBySlug('organizations', [
    'observatorio-de-la-diaspora-venezolana',
  ])
  return {
    props: { authors: { Francisco, Rafael, Tomas }, organizations: { ObservatorioDiaspora } },
  }
}

export default function About({ authors, organizations }) {
  return (
    <>
      <PageSEO title={`Nosotros`} description={`Nosotros`} />
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="space-y-2 pt-6 pb-8 md:space-y-5">
          <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            Nosotros
          </h1>
        </div>
        {Object.keys(authors).map((key) => (
          <div className="space-y-2 pt-6 pb-8 md:space-y-5" key={key}>
            <MDXLayoutRenderer
              layout={authors[key].frontMatter.layout || DEFAULT_LAYOUT}
              mdxSource={authors[key].mdxSource}
              frontMatter={authors[key].frontMatter}
            />
          </div>
        ))}
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="space-y-2 pt-6 pb-8 md:space-y-5">
          <h1 className="text-6xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-4xl md:leading-14">
            Nuestros Aliados
          </h1>
        </div>
        {Object.keys(organizations).map((key) => (
          <div className="space-y-2 pt-6 pb-8 md:space-y-5" key={key}>
            <MDXLayoutRenderer
              layout={organizations[key].frontMatter.layout || 'OrganizationLayout'}
              mdxSource={organizations[key].mdxSource}
              frontMatter={organizations[key].frontMatter}
            />
          </div>
        ))}
      </div>
    </>
  )
}
