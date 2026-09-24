import siteMetadata from '@/data/siteMetadata'

// El frontmatter puede traer:
//  - solo fecha (legado): '2023-06-01'
//  - fecha y hora con zona: '2026-09-23T14:30:00-04:00' (o sin zona: '2026-09-23T14:30')
const hasTime = (dateRaw) => typeof dateRaw === 'string' && dateRaw.includes('T')

const DATE_OPTIONS = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
}

// Fecha larga en español: '23 de septiembre de 2026'
// - Posts con hora → se muestra en la zona horaria del lector (instante real).
// - Posts sin hora (legado) → se muestra en UTC para conservar el día
//   calendario editorial (corrige el desfase de un día en zonas UTC-X).
export const formatDate = (date, dateRaw) => {
  if (!date) return ''
  const options = hasTime(dateRaw) ? DATE_OPTIONS : { ...DATE_OPTIONS, timeZone: 'UTC' }
  return new Date(date).toLocaleDateString(siteMetadata.locale, options)
}

// Fecha y hora: '23 de septiembre de 2026, 14:30'
// - Posts sin hora en el frontmatter muestran solo la fecha (no hay hora que mostrar).
// - `extraOptions` permite personalizar el formato (ej. incluir el día de la semana).
export const formatDateTime = (date, dateRaw, extraOptions = {}) => {
  if (!date) return ''
  if (!hasTime(dateRaw)) return formatDate(date, dateRaw)
  return new Date(date).toLocaleString(siteMetadata.locale, {
    ...DATE_OPTIONS,
    hour: '2-digit',
    minute: '2-digit',
    ...extraOptions,
  })
}

export default formatDate
