import Script from 'next/script'
import siteMetadata from '@/data/siteMetadata'

const GTMScript = () => {
  // Extraemos el ID con un fallback por si no existe
  const gtmId = siteMetadata?.analytics?.googleTagManagerId

  // Si no hay ID, no renderizamos nada para evitar errores
  if (!gtmId) return null

  return (
    <>
      <Script strategy="lazyOnload" id="gtm-script">
        {`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${gtmId}');
        `}
      </Script>
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
        />
      </noscript>
    </>
  )
}

export default GTMScript
