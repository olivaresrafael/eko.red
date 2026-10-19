import Image from '@/components/Image'
import Link from '@/components/Link'
import SourceBadge from '@/components/SourceBadge'
import ExternalLinkIcon from '@/components/ExternalLinkIcon'
import { formatDateTime } from '@/lib/utils/formatDate'

// Sidebar de widgets (configuración en data/widgets.js, contenido en
// lib/widgets.js). Estructura adaptada de panameconomics/visiontres.
export default function Sidebar({ widgets = [], className = '' }) {
  if (!widgets.length) return null

  return (
    <aside className={`w-full px-4 pb-10 md:w-1/3 ${className}`}>
      {widgets.map((widget, index) => (
        <Widget key={widget.id || index} widget={widget} />
      ))}
    </aside>
  )
}

function Widget({ widget }) {
  // Widgets de blogs hijo (p. ej. Kanaime.org): título con sello de la fuente
  // y borde discontinuo en primary para diferenciarlos de los locales.
  const external = !!widget.source
  return (
    <div className="pb-8">
      <h2
        className={`pb-2 pt-4 text-xl font-light text-gray-900 dark:text-gray-100 ${
          external
            ? 'flex items-center gap-2 border-b-2 border-dashed border-primary-500 dark:border-primary-400'
            : 'border-b border-gray-200 dark:border-gray-700'
        }`}
      >
        {widget.title}
        {external && <SourceBadge source={widget.source} />}
      </h2>
      {widget.content.map((item, index) => (
        <div key={item.href || item.title || index} className="w-full pt-4">
          <div className="flex items-center">
            {/* Espacio explícito entre avatar y nombre (next/image ignora
                el margen puesto en el img: va en el contenedor) */}
            {item.imgSrc && (
              <span className="mr-4 inline-flex shrink-0">
                <Image
                  src={item.imgSrc}
                  alt={item.title || 'avatar'}
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-full object-cover"
                />
              </span>
            )}
            {item.href ? (
              <Link
                href={item.href}
                className="text-lg font-medium text-gray-900 hover:text-primary-600 dark:text-gray-100 dark:hover:text-primary-500"
              >
                {item.title}
              </Link>
            ) : (
              item.title && (
                <p className="text-lg font-medium text-gray-900 dark:text-gray-100">{item.title}</p>
              )
            )}
            {typeof item.count === 'number' && (
              <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">
                ({item.count})
              </span>
            )}
          </div>
          <ul>
            {(item.articles || []).map((article) => {
              // Artículos de blogs hijos: link a la URL externa (pestaña nueva)
              // + sello de la fuente; los locales conservan /blog/<slug>.
              const external = !!article.externalUrl
              const href = article.externalUrl || `/blog/${article.slug}`
              return (
                <li
                  key={article.slug}
                  className="border-b border-gray-100 py-2 last:border-b-0 dark:border-gray-700"
                >
                  {widget.includeImg && article.images && article.images[0] && (
                    <Link href={href} aria-label={`Link to ${article.title}`}>
                      <Image
                        src={article.images[0]}
                        alt={article.title}
                        width={320}
                        height={180}
                        className={`mb-2 w-full rounded object-cover ${
                          external
                            ? 'border border-dashed border-primary-500 dark:border-primary-400'
                            : ''
                        }`}
                      />
                    </Link>
                  )}
                  <Link
                    href={href}
                    className="text-sm font-medium text-gray-800 hover:text-primary-600 dark:text-gray-200 dark:hover:text-primary-500"
                  >
                    {article.title}
                  </Link>
                  {external && (
                    <ExternalLinkIcon className="ml-1 inline h-3.5 w-3.5 text-primary-500" />
                  )}
                  {/* Sello por fila solo en widgets mixtos; en el widget de
                      la fuente (header con sello) sería ruido */}
                  {external && !widget.source && (
                    <SourceBadge source={article.source} className="mt-1" />
                  )}
                  {article.date && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      <time dateTime={article.date}>
                        {formatDateTime(article.date, article.dateRaw)}
                      </time>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </div>
  )
}
