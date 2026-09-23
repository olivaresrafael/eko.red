import { useEffect, useState } from 'react'

const STORAGE_KEY = 'eko-cookie-consent'

// Devuelve 'granted' | 'denied' | null (null = aún no decidió)
export function getCookieConsent() {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(STORAGE_KEY)
}

// Hook que expone true solo si el usuario aceptó las cookies.
// Se re-evalúa cuando cambia el consentimiento (evento 'cookie-consent-changed').
export function useCookieConsent() {
  const [granted, setGranted] = useState(false)

  useEffect(() => {
    const update = () => setGranted(getCookieConsent() === 'granted')
    update()
    window.addEventListener('cookie-consent-changed', update)
    return () => window.removeEventListener('cookie-consent-changed', update)
  }, [])

  return granted
}

const decide = (value) => {
  window.localStorage.setItem(STORAGE_KEY, value)
  window.dispatchEvent(new Event('cookie-consent-changed'))
}

const CookieConsent = () => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Solo mostramos el banner si el usuario todavía no decidió
    if (!getCookieConsent()) setVisible(true)
  }, [])

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Aviso de cookies"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Usamos cookies de análisis (Google Analytics) y anuncios (AdSense) para mejorar el sitio.
          Puedes aceptarlas o rechazarlas.
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => {
              decide('granted')
              setVisible(false)
            }}
            className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            Aceptar
          </button>
          <button
            type="button"
            onClick={() => {
              decide('denied')
              setVisible(false)
            }}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-800"
          >
            Rechazar
          </button>
        </div>
      </div>
    </div>
  )
}

export default CookieConsent
