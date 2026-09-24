// Configuración del sidebar (layouts/Sidebar.js). El contenido de cada widget
// se construye en build time con lib/widgets.js a partir de los artículos.
//
// Tipos disponibles:
//  - 'authors'   → lista de autores con avatar y sus últimos artículos
//  - 'categories'→ secciones del sitio con conteo de artículos
//  - 'latest'    → últimas publicaciones (includeImg agrega la miniatura)
//
// Pon enabled: false para ocultar un widget sin borrarlo.
const widgets = [
  { id: 'authors', type: 'authors', title: 'Nuestros autores', enabled: true, limit: 3 },
  { id: 'categories', type: 'categories', title: 'Secciones', enabled: true },
  {
    id: 'latest',
    type: 'latest',
    title: 'Últimas publicaciones',
    enabled: true,
    limit: 6,
    includeImg: true,
  },
]

module.exports = widgets
