import Image from './Image'
import Link from './Link'
import Tag from '@/components/Tag'
import SourceBadge from '@/components/SourceBadge'
import ExternalLinkIcon from '@/components/ExternalLinkIcon'
import { sourceInfo } from '@/data/externalSources'

// Tarjeta de artículo de un blog hijo (p. ej. kanaime.org). Mismo esqueleto
// que Box con identidad propia: borde discontinuo en primary + sello de la
// fuente. `href` es la URL externa → Link abre en pestaña nueva con noopener.
export default function ExternalCard({ title, description, imgSrc, href, tags = [], source }) {
  const info = sourceInfo(source)
  return (
    <div className="md p-4 md:w-full" style={{ maxWidth: '100%' }}>
      <div
        className={`${
          imgSrc && 'h-full'
        } overflow-hidden rounded-md border-2 border-dashed border-primary-500 border-opacity-70 dark:border-primary-400 dark:border-opacity-50`}
      >
        {imgSrc && (
          <Link href={href} aria-label={`Link to ${title}`}>
            <Image
              alt={title}
              src={imgSrc}
              className="object-cover object-center md:h-36 lg:h-48"
              layout="responsive"
              width={700}
              height={300}
            />
          </Link>
        )}
        <div className="p-6">
          <SourceBadge source={source} className="mb-3" />
          <h2 className="mb-3 text-2xl font-bold leading-8 tracking-tight">
            <Link href={href} aria-label={`Link to ${title}`}>
              {title}
            </Link>
          </h2>
          <div className="flex flex-wrap">
            {tags.map((tag) => (
              <Tag key={tag} text={tag} />
            ))}
          </div>
          <p className="prose mb-3 max-w-none text-gray-500 dark:text-gray-400">{description}</p>
          <Link
            href={href}
            className="inline-flex items-center gap-1 text-base font-medium leading-6 text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
            aria-label={`Leer ${title} en ${info.domain}`}
          >
            Leer en {info.domain}
            <ExternalLinkIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
