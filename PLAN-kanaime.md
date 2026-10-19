# PLAN-kanaime.md — Artículos de kanaime.org indexados en eko.red

> **COMPLETADO (2026-10-19)** — todas las fases verificadas con build.
> Modelo tipo Xataca: eko.red (blog padre) muestra metadata de artículos de sus
> blogs hijos. Artículo completo en el portal hijo (kanaime.org), en eko.red solo
> el frontmatter + link que abre en pestaña nueva, con diseño tarjeta diferenciado.

## Decisiones (confirmadas)

- **Fuente**: stubs locales en el repo (`data/external/kanaime/*.md`, solo frontmatter).
- **Dónde se ven**: feed de la portada (mezclados por fecha, **nunca hero ni featured**),
  `/blog`, `/tags/kanaime`, widget en sidebar (home + `/blog`) y bloque bajo el hero.
- **Diseño**: tarjeta con identidad Kanaime (borde/acento propio, badge
  "KANAIME.ORG", icono de enlace externo, CTA "Leer en kanaime.org →").
- **Fuera de alcance**: buscador (`/api/search`), feed global RSS, sitemap
  (el sitemap de kanaime es el suyo), sidebar "Últimas publicaciones"/"Secciones".

---

## Fase 1 — Capa de datos (stubs + loader) ✅ (2026-10-19)

- [x] **1.1 Directorio `data/external/kanaime/`** con stub de ejemplo
      (`_ejemplo.md`, `draft: true` para que nunca se publique).
      Frontmatter: `title`, `date` (ISO con offset), `summary`, `images`, `tags`
      (default `['kanaime']`), `externalUrl` (obligatorio), `draft`.
- [x] **1.2 Nuevo `lib/externalPosts.js`**:
  - `getExternalFrontMatter(source)` — espejo de `getAllFilesFrontMatter`
    (gray-matter, filtra `draft`, normaliza `date`/`dateRaw`, añade `slug`,
    `externalUrl`, `source`). Tolerante a directorio inexistente. Sin
    `externalUrl` el stub se ignora (con warning en build).
  - `getAllExternalFrontMatter()` — todas las fuentes fusionadas.
  - `EXTERNAL_SOURCES = ['kanaime']` (futuras fuentes = añadir entrada).
  - `tags: []` por defecto (los `.map` de tarjetas son sin guardar).
  - Verificado con prueba real (fuente temporal): draft excluido, stub sin
    `externalUrl` → warning + ignorado, stub válido → normalizado
    (`date` ISO UTC, `dateRaw`, `slug`, `source`, `tags: []`). ESLint limpio.

## Fase 2 — Componentes de diseño ✅ (2026-10-19)

- [x] **2.1 Nuevo `components/ExternalCard.js`** (adaptado de `Box`): borde
      discontinuo en primary + `SourceBadge` "KANAIME.ORG" + icono enlace
      externo, CTA "Leer en kanaime.org →". `href={externalUrl}` → `Link`
      abre pestaña nueva.
      - Apoyos: `components/SourceBadge.js` (sello con label + icono),
        `components/ExternalLinkIcon.js` (heroicons external-link) y
        `data/externalSources.js` (label/dominio por fuente — los componentes
        cliente no importan `lib/externalPosts.js`, que usa `fs`).
- [x] **2.2 `layouts/ListLayout.js`**: branch de fila externa (badge junto a
      la fecha, icono junto al título, miniatura con borde discontinuo) para
      `/blog` y `/tags/*`.
- [x] **2.3 `layouts/Sidebar.js`**: branch por `article.externalUrl` en los
      enlaces (antes hardcodeaban `/blog/${slug}`) + icono, badge y miniatura
      con borde discontinuo en filas externas.
- Verificado: ESLint limpio + Prettier aplicado en todos los archivos.

## Fase 3 — Integración en páginas ✅ (2026-10-19)

- [x] **3.1 `pages/index.js`**: externos fusionados al pool pero excluidos de
      `featured`/hero → van en `rest` por fecha (comparación por referencia
      para evitar falsos positivos de slug). Render
      `post.externalUrl ? <ExternalCard/> : <Box/>`.
- [x] **3.2 `pages/blog.js`** y **`pages/blog/page/[page].js`**: fusión vía
      `mergeWithExternal()` en `getStaticProps` **y** en el conteo de
      `getStaticPaths` (la paginación cuadra).
- [x] **3.3 `pages/tags/[tag].js`**: `getStaticPaths` añade los tags de los
      externos (se genera `/tags/kanaime` sin contenido local); `getStaticProps`
      fusiona por fecha. Además `(post.tags || [])` (defensa en el filtro).
- [x] **3.4 Nunca en `pages/blog/[...slug].js`**: verificado — sigue usando
      `getFiles('blog')` (solo locales), `fallback: false` intacto.
- [x] **Helper `mergeWithExternal(localPosts)`** en `lib/externalPosts.js`.
- [x] **`lib/generate-rss.js`**: guid/link externo para posts de blogs hijo
      (cubre el feed de `/tags/kanaime`; el global `public/feed.xml` solo
      recibe locales).
- Verificado con build completo usando un stub publicado temporal (borrado
  después): `/tags/kanaime` generado con fila externa (badge + borde
  discontinuo + `target="_blank"`/`rel="noopener noreferrer"`), home con
  ExternalCard en el feed y hero local, `/blog` con fila externa,
  `public/tags/kanaime/feed.xml` apuntando a kanaime.org y feed global sin
  kanaime. Segundo build sin stubs: degrada bien (sin `/tags/kanaime`).

## Fase 4 — Widgets Kanaime.org ✅ (2026-10-19)

- [x] **4.1 Sidebar** (`data/widgets.js` + `lib/widgets.js` + `layouts/Sidebar.js`):
      campo `source` en el tipo `latest`
      (`{ id: 'kanaime', type: 'latest', source: 'kanaime', limit: 5, includeImg: true }`).
      `buildWidgets()` carga los externos y solo los inyecta en el widget con
      `source` (se oculta si la fuente no tiene artículos); el resto de widgets
      sigue 100% local. `Widget` con `source` lleva header con sello + borde
      discontinuo; el sello por fila se suprime en widgets de fuente (ruido).
- [x] **4.2 Portada** (`data/portadaWidgets.js` + `lib/widgets.js` + `pages/index.js`):
      nuevo modo de llenado `source` en `buildPortadaWidgets()` (además de
      `tag`/`posts[]`; `href` default `/tags/<fuente>`), devuelve `source` en
      cada widget. Bloque renderizado con identidad Kanaime: borde discontinuo
      + sello en el header; filas con link externo (pestaña nueva), icono y
      miniatura con borde discontinuo.
- Verificado con build + 2 stubs temporales (borrados): bloque de portada y
      widget sidebar visibles en home y `/blog` con enlaces externos; segundo
      build sin stubs: ambos widgets se ocultan solos.

## Fase 5 — Navegación y SEO ✅ (2026-10-19)

- [x] **5.1 `next.config.js → getVisibleSections()`**: refactorizado con
      `collectTags(dir)` — escanea `data/blog` **y** cada subdirectorio de
      `data/external/` → la sección KANAIME (`requiresContent: true`) aparece
      en header/scroll/mobile en cuanto exista un stub no-borrador.
- [x] **5.2 `lib/generate-rss.js`**: branch por `externalUrl` (guid/link = URL
      externa) para el feed de `/tags/kanaime`; feed global sigue solo-local.
      *(Hecho adelantado en la Fase 3.)*
- [x] **5.3 `next.config.js` `images.domains: ['kanaime.org']`** — permite
      miniaturas hotlinkadas desde el portal hijo con `next/image` (el CSP
      `img-src *` ya lo permitía).

## Fase 6 — Verificación ✅ (2026-10-19)

- [x] `yarn lint` limpio + `yarn build` OK (múltiples builds con/sin stubs).
- [x] Home: externos en el feed (nunca hero), bloque bajo hero con enlace
      "Ver toda la sección → /tags/kanaime", widget en sidebar (home + /blog).
- [x] `/blog`: filas externas + widget sidebar. `/tags/kanaime` generada.
- [x] Sección KANAIME en header/scroll/mobile (verificado en HTML del build
      y por node contra `NEXT_PUBLIC_SECTIONS`, con y sin stubs; el stub
      draft `_ejemplo.md` NO la activa).
- [x] Enlaces en pestaña nueva (`target="_blank"` + `rel="noopener noreferrer"`).
- [x] Drafts excluidos. `public/tags/kanaime/feed.xml` con URLs externas;
      feed global sin kanaime.
- [x] Documentado en `AGENTS.md`: estructura `data/external/`, `source` en
      widgets/portadaWidgets, `externalSources.js` y sección nueva
      "Artículos de blogs hijo".

---

| Bloque                | Esfuerzo estimado |
| --------------------- | ----------------- |
| Fase 1 (datos)        | ~1 hora           |
| Fase 2 (diseño)       | ~2–3 horas        |
| Fase 3 (páginas)      | ~2 horas          |
| Fase 4 (widgets)      | ~2 horas          |
| Fase 5 (nav/SEO)      | ~1 hora           |
| Fase 6 (verificación) | ~1 hora           |
