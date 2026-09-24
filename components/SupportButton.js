import siteMetadata from '@/data/siteMetadata'

// Botón de apoyo al sitio (futuro: Buy Me a Coffee).
// No se renderiza mientras siteMetadata.support.url esté vacío.
const SupportButton = () => {
  const { url, text } = siteMetadata.support || {}

  if (!url) return null

  return (
    <div className="flex justify-center py-6">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-md bg-primary-500 px-5 py-2 font-medium text-white shadow-sm hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
      >
        ☕ {text || 'Buy Me a Coffee'}
      </a>
    </div>
  )
}

export default SupportButton
