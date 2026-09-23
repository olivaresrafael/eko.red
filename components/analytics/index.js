import GTM from './GoogleTagManager'
import GoogleAnalytics from './GoogleAnalytics'
import Plausible from './Plausible'
import SimpleAnalytics from './SimpleAnalytics'
import Umami from './Umami'
import siteMetadata from '@/data/siteMetadata'
import { useCookieConsent } from '@/components/CookieConsent'

const isProduction = process.env.NODE_ENV === 'production'

const Analytics = () => {
  const consentGranted = useCookieConsent()

  // No cargamos ningún script de análisis sin consentimiento previo (RGPD)
  if (!isProduction || !consentGranted) return null

  return (
    <>
      {siteMetadata.analytics.plausibleDataDomain && <Plausible />}
      {siteMetadata.analytics.simpleAnalytics && <SimpleAnalytics />}
      {siteMetadata.analytics.umamiWebsiteId && <Umami />}
      {siteMetadata.analytics.googleTagManagerId && <GTM />}
      {siteMetadata.analytics.googleAnalyticsId && <GoogleAnalytics />}
    </>
  )
}

export default Analytics
