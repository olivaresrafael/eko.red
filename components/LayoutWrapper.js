import siteMetadata from '@/data/siteMetadata'
import headerNavLinks from '@/data/headerNavLinks'
import Image from 'next/image'
import Link from './Link'
import SectionContainer from './SectionContainer'
import Footer from './Footer'
import MobileNav from './MobileNav'
import ThemeSwitch from './ThemeSwitch'
import { useSession, signIn, signOut } from 'next-auth/react'

const LayoutWrapper = ({ children }) => {
  const { data: session } = useSession()

  return (
    <SectionContainer>
      <div className="flex h-screen flex-col justify-between">
        <header className="flex items-center justify-between py-10">
          <div>
            <Link href="/" aria-label={siteMetadata.headerTitle}>
              <div className="flex items-center justify-between">
                <div className="mr-3">
                  <Image
                    src="/static/images/logo.png"
                    alt="Picture of the author"
                    width={300}
                    height={100}
                  />
                </div>
              </div>
            </Link>
          </div>
          <div className="flex items-center text-base leading-5">
            <div className="hidden sm:block">
              {headerNavLinks.map((link) => {
                if (session && link.title == 'Login') {
                  return (
                    <Link
                      key={link.title}
                      onClick={() => signOut()}
                      href="#"
                      className="p-1 font-medium text-gray-900 dark:text-gray-100 sm:p-4"
                    >
                      {'Logout'}
                    </Link>
                  )
                } else {
                  return (
                    <Link
                      key={link.title}
                      href={link.href}
                      className="p-1 font-medium text-gray-900 dark:text-gray-100 sm:p-4"
                    >
                      {link.title}
                    </Link>
                  )
                }
              })}
            </div>
            <ThemeSwitch />
            <MobileNav />
          </div>
        </header>
        <main className="mb-auto">{children}</main>
        <Footer />
      </div>
    </SectionContainer>
  )
}

export default LayoutWrapper
