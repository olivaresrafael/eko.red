import { useEffect, useState } from 'react'
import siteMetadata from '@/data/siteMetadata'
import headerNavLinks from '@/data/headerNavLinks'
import sections from '@/lib/sections'
import kebabCase from '@/lib/utils/kebabCase'
import Image from 'next/image'
import Link from './Link'
import SectionContainer from './SectionContainer'
import Footer from './Footer'
import MobileNav from './MobileNav'
import SearchButton from './SearchButton'
import ThemeSwitch from './ThemeSwitch'
import { useTheme } from 'next-themes'

const LayoutWrapper = ({ children }) => {
  const { resolvedTheme } = useTheme()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop
      setScrolled(scrollY > 200)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      {/* Barra fixed en todas las páginas (estilo panameconomics): tags + nav.
          El logo pequeño aparece aquí cuando el header grande ya se fue de vista */}
      <div className="fixed top-0 left-0 z-40 flex w-full items-center justify-between border-b-2 border-gray-200 border-opacity-60 bg-white p-1 dark:border-gray-700 dark:bg-gray-900">
        {scrolled && (
          <Link href="/" aria-label={siteMetadata.headerTitle} className="pl-3 pt-1">
            <Image
              src={`/static/images/logo_${resolvedTheme}.svg`}
              alt={siteMetadata.headerTitle}
              width={120}
              height={40}
            />
          </Link>
        )}
        <div className="hidden flex-1 items-center justify-center px-5 md:flex">
          {siteMetadata.topTags.map((tag) => (
            <Link
              key={tag}
              href={`/tags/${kebabCase(tag)}`}
              className="px-3 text-center text-sm font-semibold text-gray-900 hover:text-primary-600 dark:text-gray-100 dark:hover:text-primary-500"
            >
              {tag}
            </Link>
          ))}
        </div>
        <div className="ml-auto flex items-center text-base leading-5">
          <div className="hidden md:block">
            {headerNavLinks.map((link) => (
              <Link
                key={link.title}
                href={link.href}
                className="p-1 font-medium text-gray-900 dark:text-gray-100 sm:p-4"
              >
                {link.title}
              </Link>
            ))}
          </div>
          <SearchButton />
          <ThemeSwitch />
          <MobileNav />
        </div>
      </div>

      <SectionContainer>
        {/* pt-16 deja libre la barra fixed (~60px) */}
        <div className="flex h-screen flex-col justify-between pt-16">
          <header className="flex items-center justify-center">
            <div>
              <Link href="/" aria-label={siteMetadata.headerTitle}>
                <div className="flex items-center justify-center">
                  <div>
                    <Image
                      src={`/static/images/logo_${resolvedTheme}.svg`}
                      alt={siteMetadata.headerTitle}
                      width={300}
                      height={100}
                    />
                  </div>
                </div>
              </Link>
            </div>
          </header>
          {/* Barra de secciones (todas las páginas) */}
          {sections.length > 0 && (
            <nav
              aria-label="Secciones"
              className="mt-4 hidden border-y border-gray-200 dark:border-gray-700 sm:flex"
            >
              {sections.map((section) => (
                <Link
                  key={section.tag}
                  href={`/tags/${section.tag}`}
                  className="flex-1 border-r border-gray-200 p-2 text-center text-sm font-semibold uppercase tracking-wide text-gray-900 last:border-r-0 hover:text-primary-600 dark:border-gray-700 dark:text-gray-100 dark:hover:text-primary-500"
                >
                  {section.title}
                </Link>
              ))}
            </nav>
          )}
          <main className="mb-auto">{children}</main>
          <Footer />
        </div>
      </SectionContainer>
    </>
  )
}

export default LayoutWrapper
