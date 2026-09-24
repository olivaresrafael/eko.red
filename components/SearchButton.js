import { useEffect, useRef, useState } from 'react'
import Link from './Link'
import Image from './Image'
import { formatDateTime } from '@/lib/utils/formatDate'

// Caché del índice de búsqueda en el módulo: se descarga una sola vez
// (/api/search) y se reutiliza al reabrir el buscador.
let searchIndexCache = null

export default function SearchButton() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [posts, setPosts] = useState(searchIndexCache || [])
  const inputRef = useRef(null)

  useEffect(() => {
    if (open && !searchIndexCache) {
      fetch('/api/search')
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          searchIndexCache = Array.isArray(data) ? data : []
          setPosts(searchIndexCache)
        })
        .catch(() => setPosts([]))
    }
    if (open && inputRef.current) {
      inputRef.current.focus()
    }
  }, [open])

  // Bloquear scroll del body mientras el buscador está abierto
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
      setQuery('')
    }
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [open])

  // Escape cierra el buscador
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const trimmed = query.trim().toLowerCase()
  const results = trimmed
    ? posts
        .filter((post) => {
          const searchContent =
            post.title + (post.summary || '') + ' ' + (post.tags || []).join(' ')
          return searchContent.toLowerCase().includes(trimmed)
        })
        .slice(0, 20)
    : []

  return (
    <>
      <button
        type="button"
        aria-label="Buscar artículos"
        className="ml-1 mr-1 h-8 w-8 rounded p-1 sm:ml-4"
        onClick={() => setOpen(true)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="text-gray-900 dark:text-gray-100"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-white dark:bg-gray-900"
          role="dialog"
          aria-modal="true"
          aria-label="Buscar artículos"
        >
          <div className="mx-auto max-w-2xl px-4 pt-16 pb-10">
            <div className="relative">
              <input
                ref={inputRef}
                aria-label="Buscar artículos"
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar artículos..."
                className="block w-full rounded-md border border-gray-300 bg-white py-3 pl-10 pr-10 text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              />
              <svg
                className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 dark:text-gray-300"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <button
                type="button"
                aria-label="Cerrar búsqueda"
                className="absolute right-2 top-2.5 h-7 w-7 rounded p-1"
                onClick={() => setOpen(false)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="text-gray-500 dark:text-gray-400"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
            {trimmed && results.length === 0 && (
              <p className="mt-6 text-gray-500 dark:text-gray-400">No se encontraron resultados.</p>
            )}
            <ul className="mt-4 divide-y divide-gray-200 dark:divide-gray-700">
              {results.map((post) => (
                <li key={post.slug}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="flex space-x-3 py-3 hover:text-primary-600"
                    onClick={() => setOpen(false)}
                  >
                    {post.images && post.images[0] && (
                      <Image
                        alt={post.title}
                        src={post.images[0]}
                        width={72}
                        height={54}
                        className="rounded object-cover"
                      />
                    )}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{post.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDateTime(post.date, post.dateRaw)}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  )
}
