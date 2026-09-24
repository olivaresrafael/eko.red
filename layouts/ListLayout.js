import Link from '@/components/Link'
import Image from '@/components/Image'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import { useState } from 'react'
import Pagination from '@/components/Pagination'
import Sidebar from '@/layouts/Sidebar'
import { formatDateTime } from '@/lib/utils/formatDate'

export default function ListLayout({
  posts,
  title,
  initialDisplayPosts = [],
  pagination,
  widgets = [],
}) {
  const [searchValue, setSearchValue] = useState('')
  const filteredBlogPosts = posts.filter((frontMatter) => {
    const searchContent = frontMatter.title + frontMatter.summary + frontMatter.tags.join(' ')
    return searchContent.toLowerCase().includes(searchValue.toLowerCase())
  })

  // If initialDisplayPosts exist, display it if no searchValue is specified
  const displayPosts =
    initialDisplayPosts.length > 0 && !searchValue ? initialDisplayPosts : filteredBlogPosts

  const showSidebar = widgets.length > 0 && !searchValue

  return (
    <>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="space-y-2 pt-6 pb-8 md:space-y-5">
          <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            {title}
          </h1>
          <div className="relative max-w-lg">
            <input
              aria-label="Search articles"
              type="text"
              onChange={(e) => setSearchValue(e.target.value)}
              value={searchValue}
              placeholder="Search articles"
              className="block w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-900 dark:bg-gray-800 dark:text-gray-100"
            />
            <svg
              className="absolute right-3 top-3 h-5 w-5 text-gray-400 dark:text-gray-300"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
        <div className="flex flex-wrap">
          {showSidebar && <Sidebar widgets={widgets} className="order-2 md:order-1" />}
          <div className={showSidebar ? 'order-1 w-full md:order-2 md:w-2/3' : 'w-full'}>
            <ul>
              {!filteredBlogPosts.length && 'No posts found.'}
              {displayPosts.map((frontMatter) => {
                const { slug, date, dateRaw, title, summary, tags, images } = frontMatter
                return (
                  <li key={slug} className="py-4">
                    <article className="flex flex-col space-y-3 sm:flex-row sm:space-x-4 sm:space-y-0">
                      {images && images[0] && (
                        <Link
                          href={`/blog/${slug}`}
                          aria-label={`Link to ${title}`}
                          className="w-full shrink-0 sm:w-48"
                        >
                          <Image
                            alt={title}
                            src={images[0]}
                            width={700}
                            height={466}
                            layout="responsive"
                            className="rounded-md border border-gray-200 object-cover dark:border-gray-700"
                          />
                        </Link>
                      )}
                      <div className="space-y-2">
                        <dl>
                          <dt className="sr-only">Published on</dt>
                          <dd className="text-base font-medium leading-6 text-gray-500 dark:text-gray-400">
                            <time dateTime={date}>{formatDateTime(date, dateRaw)}</time>
                          </dd>
                        </dl>
                        <div>
                          <h3 className="text-2xl font-bold leading-8 tracking-tight">
                            <Link
                              href={`/blog/${slug}`}
                              className="text-gray-900 dark:text-gray-100"
                            >
                              {title}
                            </Link>
                          </h3>
                          <div className="flex flex-wrap">
                            {tags.map((tag) => (
                              <Tag key={tag} text={tag} />
                            ))}
                          </div>
                        </div>
                        <div className="prose max-w-none text-gray-500 dark:text-gray-400">
                          {summary}
                        </div>
                      </div>
                    </article>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </div>
      {pagination && pagination.totalPages > 1 && !searchValue && (
        <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} />
      )}
    </>
  )
}
