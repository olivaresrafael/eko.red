import '@/css/tailwind.css'
import '@/css/prism.css'
import 'katex/dist/katex.css'

import '@fontsource/inter/variable-full.css'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'
import Head from 'next/head'

import siteMetadata from '@/data/siteMetadata'
import AdSense from '@/components/AdSense'
import Analytics from '@/components/analytics'
import CookieConsent from '@/components/CookieConsent'
import LayoutWrapper from '@/components/LayoutWrapper'
import { ClientReload } from '@/components/ClientReload'

const isDevelopment = process.env.NODE_ENV === 'development'
const isSocket = process.env.SOCKET

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <ThemeProvider attribute="class" defaultTheme={siteMetadata.theme}>
      <Head>
        <meta content="width=device-width, initial-scale=1" name="viewport" />
      </Head>
      {isDevelopment && isSocket && <ClientReload />}
      <Analytics />
      <AdSense />
      <CookieConsent />
      <SessionProvider session={session}>
        <LayoutWrapper>
          <Component {...pageProps} />
        </LayoutWrapper>
      </SessionProvider>
    </ThemeProvider>
  )
}
