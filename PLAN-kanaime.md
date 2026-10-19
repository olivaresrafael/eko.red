# PLAN-kanaime.md — Artículos de kanaime.org indexados en eko.red

> Modelo tipo Xataca: eko.red (blog padre) muestra metadata de artículos de sus
> blogs hijos. Artículo completo en el portal hijo (kanaime.org), en eko.red solo
> el frontmatter + link que abre en pestaña nueva, con diseño tarjeta diferenciado.
> Marcar con `[x]` al completar. Actualizado: 2026-10-19.

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

## Fase 2 — Componentes de diseño ⏳

- [ ] **2.1 Nuevo `components/ExternalCard.js`** (adaptado de `Box`): borde/
  acento Kanaime, badge "KANAIME.ORG" + icono enlace externo, CTA
  "Leer en kanaime.org →". `href={externalUrl}` → `Link` abre pestaña nueva.
- [ ] **2.2 `layouts/ListLayout.js`**: branch de fila externa (badge + icono)
  para `/blog` y `/tags/*`.
- [ ] **2.3 `layouts/Sidebar.js`**: branch por `article.externalUrl` en los
  enlaces (hoy hardcodean `/blog/${slug}`) + sello del dominio.

## Fase 3 — Integración en páginas ⏳

- [ ] **3.1 `pages/index.js`**: externos fusionados al pool pero excluidos de
  `featured`/hero → van en `rest` por fecha. Render
  `post.externalUrl ? <ExternalCard/> : <Box/>`.
- [ ] **3.2 `pages/blog.js`** y **`pages/blog/page/[page].js`**: fusión en
  `getStaticProps` → `ListLayout` con fila externa.
- [ ] **3.3 `pages/tags/[tag].js`**: fusiona externos del tag; `getStaticPaths`
  genera `/tags/kanaime` aunque no haya posts locales con ese tag.
- [ ] **3.4 Nunca en `pages/blog/[...slug].js`**: loader separado →
  `getStaticPaths` (fallback: false) no genera rutas externas.

## Fase 4 — Widgets Kanaime.org ⏳

- [ ] **4.1 Sidebar** (`data/widgets.js` + `lib/widgets.js` + `layouts/Sidebar.js`):
  campo `source` en el tipo `latest`
  (`{ id: 'kanaime', type: 'latest', source: 'kanaime', limit: 5, includeImg: true }`).
  `buildWidgets()` recibe los externos y solo los inyecta en el widget con
  `source`; el resto de widgets sigue 100% local.
- [ ] **4.2 Portada** (`data/portadaWidgets.js` + `lib/widgets.js` + `pages/index.js`):
  nuevo modo de llenado `source` en `buildPortadaWidgets()` (además de `tag`/
  `posts[]`), bloque renderizado con estilo Kanaime (no el markup genérico).
  Default `href: '/tags/kanaime'`.

## Fase 5 — Navegación y SEO ⏳

- [ ] **5.1 `next.config.js → getVisibleSections()`**: escanear también
  `data/external/*` para contar tags → sección KANAIME (`requiresContent: true`)
  visible en header/scroll/mobile en cuanto exista un stub (reiniciar dev server).
- [ ] **5.2 `lib/generate-rss.js`**: branch por `externalUrl` (guid/link = URL
  externa) para el feed de `/tags/kanaime`; feed global sigue solo-local.
- [ ] **5.3 `next.config.js` `images`**: añadir dominio `kanaime.org` si las
  miniaturas se sirven desde allí (CSP `img-src *` ya lo permite).

## Fase 6 — Verificación ⏳

- [ ] `yarn lint` + `yarn build` OK.
- [ ] Home: externos en el feed (nunca hero), bloque bajo hero, widget en sidebar.
- [ ] `/blog`: filas externas + widget sidebar. `/tags/kanaime` generada.
- [ ] Sección KANAIME en header. Enlaces en pestaña nueva (`rel=noopener`).
- [ ] Drafts excluidos. `public/tags/kanaime/feed.xml` con URLs externas.
- [ ] Documentar stubs y `source` en `AGENTS.md`.

---

| Bloque | Esfuerzo estimado |
|--------|-------------------|
| Fase 1 (datos) | ~1 hora |
| Fase 2 (diseño) | ~2–3 horas |
| Fase 3 (páginas) | ~2 horas |
| Fase 4 (widgets) | ~2 horas |
| Fase 5 (nav/SEO) | ~1 hora |
| Fase 6 (verificación) | ~1 hora |
