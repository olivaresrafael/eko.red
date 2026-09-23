import Script from 'next/script'
import siteMetadata from '@/data/siteMetadata'
import { useCookieConsent } from './CookieConsent'

// Solo carga el script de AdSense si el usuario aceptó las cookies.
// Nota: no hay unidades <ins class="adsbygoogle"> en el sitio aún; si en el
// futuro no se usan anuncios, eliminar este componente y
// siteMetadata.analytics.adsenseClient.
const AdSense = () => {
  const consentGranted = useCookieConsent()
  const client = siteMetadata?.analytics?.adsenseClient

  if (!consentGranted || !client) return null

  return (
    <Script
      strategy="lazyOnload"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
      crossOrigin="anonymous"
    />
  )
}

export default AdSense
