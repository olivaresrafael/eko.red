// Límite simple en memoria: 5 intentos de suscripción por IP cada minuto.
// Nota: en serverless (Vercel) cada instancia tiene su propio contador.
// Para un límite global se puede migrar a Upstash Redis o similar.
const RATE_LIMIT = 5
const RATE_WINDOW_MS = 60 * 1000
const attempts = new Map()

function isRateLimited(ip) {
  const now = Date.now()
  const list = attempts.get(ip) || []
  const recent = list.filter((t) => now - t < RATE_WINDOW_MS)
  if (recent.length >= RATE_LIMIT) {
    attempts.set(ip, recent)
    return true
  }
  recent.push(now)
  attempts.set(ip, recent)
  return false
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Método no permitido' })
  }

  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown'
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Demasiados intentos. Inténtalo en un minuto.' })
  }

  const { email, website } = req.body || {}

  // Honeypot: los bots rellenan el campo oculto "website" → no procesamos
  if (website) {
    return res.status(201).json({ error: '' })
  }

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
    return res.status(400).json({ error: 'Ingresa un correo válido.' })
  }

  try {
    const API_URL = process.env.EMAILOCTOPUS_API_URL
    const API_KEY = process.env.EMAILOCTOPUS_API_KEY
    const LIST_ID = process.env.EMAILOCTOPUS_LIST_ID

    if (!API_URL || !API_KEY || !LIST_ID) {
      // No exponemos qué falta exactamente
      return res.status(500).json({ error: 'Servicio no disponible temporalmente.' })
    }

    const data = { email_address: email, api_key: API_KEY }

    const API_ROUTE = `${API_URL}lists/${LIST_ID}/contacts`
    const response = await fetch(API_ROUTE, {
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })

    if (response.status >= 400) {
      return res.status(500).json({ error: 'No se pudo completar la suscripción.' })
    }

    return res.status(201).json({ error: '' })
  } catch (error) {
    // Log solo en servidor; nunca devolvemos el detalle del error al cliente
    console.error('emailoctopus subscription failed:', error)
    return res.status(500).json({ error: 'No se pudo completar la suscripción.' })
  }
}

export default handler
