import ExternalLinkIcon from '@/components/ExternalLinkIcon'
import { sourceInfo } from '@/data/externalSources'

// Sello de fuente externa: badge con el dominio del portal hijo + icono de
// enlace externo. Identidad Kanaime en tarjetas, filas de listado y sidebar.
export default function SourceBadge({ source, className = '' }) {
  const info = sourceInfo(source)
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-primary-500 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-gray-900 ${className}`}
    >
      {info.label}
      <ExternalLinkIcon className="h-3 w-3" />
    </span>
  )
}
