// Widgets de portada: bloques debajo de la nota principal (hero) del home.
// Renderizados solo por pages/index.js; el contenido se construye en build
// time con buildPortadaWidgets() (lib/widgets.js) a partir de los artículos.
//
// Cada widget se llena con UNO de estos campos:
//  - tag: 'cultura'                → artículos con esa etiqueta (más recientes
//                                    primero; el actual hero se omite para no
//                                    repetirlo justo debajo)
//  - posts: ['slug-1', 'slug-2']   → lista manual de artículos (se respeta el
//                                    orden dado y se muestran todos; los slugs
//                                    inexistentes se ignoran)
//  - source: 'kanaime'             → artículos externos del blog hijo de esa
//                                    fuente (data/external/<fuente>/); el
//                                    bloque se renderiza con la identidad del
//                                    portal hijo (sello + borde discontinuo)
//  Si define `posts`, se usa la lista manual y el resto se ignora.
//
// Campos opcionales:
//  - limit   → cuántos artículos mostrar (default 3 en modo tag; en lista
//              manual se muestran todos salvo que se indique)
//  - min     → mínimo de artículos disponibles para mostrar el widget
//              (default 1)
//  - href    → enlace "Ver toda la sección →" (default en modo tag:
//              /tags/<tag>; con `href: null` no se muestra enlace)
//  - excludeFromFeed → true = los artículos del widget NO aparecen en el feed
//              regular del home ni como hero; en el home solo se ven dentro
//              de este widget (/blog, tags, RSS y sidebar sin cambios)
//
// Pon enabled: false para ocultar un widget sin borrarlo.
// El orden del array es el orden de aparición en la portada.
const portadaWidgets = [
  {
    id: 'cultura',
    title: 'Cultura',
    tag: 'cultura',
    enabled: true,
    limit: 3,
    min: 2,
    href: '/tags/cultura',
  },
  // Blog hijo kanaime.org: se llena con los artículos externos de la fuente
  // (data/external/kanaime/) y se renderiza con la identidad del portal hijo
  // (borde discontinuo + sello). Se oculta solo si la fuente no tiene
  // artículos.
  {
    id: 'kanaime',
    title: 'Kanaime.org',
    source: 'kanaime',
    enabled: true,
    limit: 3,
    href: '/tags/kanaime',
  },
  // Ejemplo con lista manual:
  // {
  //   id: 'especiales',
  //   title: 'Especiales',
  //   posts: ['mi-primer-post', 'otro-post'],
  //   enabled: true,
  //   href: null,
  //   excludeFromFeed: true, // opcional: fuera del feed y del hero del home
  // },
]

module.exports = portadaWidgets
