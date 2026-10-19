// Configuración del sidebar (layouts/Sidebar.js). El contenido de cada widget
// se construye en build time con lib/widgets.js a partir de los artículos.
//
// Tipos disponibles:
//  - 'authors'   → lista de autores con avatar y sus últimos artículos
//                  (order = orden de muestra por slug de autor)
//  - 'categories'→ secciones del sitio con conteo de artículos
//  - 'latest'    → últimas publicaciones (includeImg agrega la miniatura;
//                  tag = filtra solo artículos con ese tag)
//
// Pon enabled: false para ocultar un widget sin borrarlo.
// El orden del array es el orden de visualización en el sidebar.
const widgets = [
  {
    id: 'authors',
    type: 'authors',
    title: 'Nuestros autores',
    enabled: true,
    limit: 3,
    // Orden fijo pedido por el equipo (2026-09)
    order: ['folivares', 'marcostarre', 'henryalvarez', 'olivaresrafael'],
  },
  {
    id: 'cultura',
    type: 'latest',
    title: 'Cultura',
    enabled: true,
    tag: 'cultura',
    limit: 4,
    includeImg: true,
  },
  // Widget del blog hijo kanaime.org: solo artículos externos (stubs de
  // data/external/kanaime/), con diseño diferenciado (sello + borde
  // discontinuo). Se oculta solo si la fuente no tiene artículos.
  {
    id: 'kanaime',
    type: 'latest',
    title: 'Kanaime.org',
    enabled: true,
    source: 'kanaime',
    limit: 5,
    includeImg: true,
  },
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
