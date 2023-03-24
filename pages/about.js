import { MDXLayoutRenderer } from '@/components/MDXComponents'
import { getFileBySlug } from '@/lib/mdx'
import { PageSEO } from '@/components/SEO'

const DEFAULT_LAYOUT = 'AboutLayout'

export async function getStaticProps() {
  const Luis = await getFileBySlug('authors', ['default'])
  const Francisco = await getFileBySlug('authors', ['folivares'])
  const Rafael = await getFileBySlug('authors', ['olivaresrafael'])
  return { props: { Francisco, Rafael } }
}

export default function About({ Luis, Francisco, Rafael }) {
  return (
    <>
      <PageSEO title={`About`} description={`About`} />
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="space-y-2 pt-6 pb-8 md:space-y-5">
          <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            About
          </h1>
        </div>
        <div className="space-y-2 pt-6 pb-8 md:space-y-5">
          <MDXLayoutRenderer
            layout={Francisco.frontMatter.layout || DEFAULT_LAYOUT}
            mdxSource={Francisco.mdxSource}
            frontMatter={Francisco.frontMatter}
          />
        </div>
        <div className="space-y-2 pt-6 pb-8 md:space-y-5">
          <MDXLayoutRenderer
            layout={Rafael.frontMatter.layout || DEFAULT_LAYOUT}
            mdxSource={Rafael.mdxSource}
            frontMatter={Rafael.frontMatter}
          />
        </div>
      </div>
    </>
  )
}
