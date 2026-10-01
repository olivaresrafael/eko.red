# PLAN.md — Hoja de ruta eko.red

> Lista de tareas de mejora, ordenadas por prioridad. Marcar con `[x]` al completar.
> Fase = bloque de trabajo con esfuerzo estimado. Actualizado: 2026-09-24.
> **Numeración reiniciada**: Fases 1–3 = trabajo inmediato (ronda 2026-09-24);
> lo demás pendiente vive en "Tareas para mañana"; lo hecho, en "Historial".

---

## Fase 1 — Limpieza: login, comentarios e icono X ✅ (2026-09-24)

- [x] **1.1 Eliminar el código de login (next-auth)**
  - Hecho: borrado `pages/api/auth/[...nextauth].js` (y el directorio), el `SessionProvider` en `pages/_app.js`, la dependencia `next-auth` (también de `yarn.lock`) y las credenciales de `.env.example`.
  - Verificado: `grep next-auth` = 0 en código y en los bundles del build.
  - **PENDIENTE MANUAL (Vercel)**: borrar las env vars `AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXT_PUBLIC_GOOGLE_SECRET` y `NEXTAUTH_SECRET` (si existen) + redeploy. Rotar el secret expuesto deja de ser necesario salvo que ese valor se reutilice en otro servicio.
- [x] **1.2 Apagar los comentarios (giscus)**
  - Hecho: switch `siteMetadata.comment.enabled = false` (patrón newsletter, reversible); `components/comments/index.js` y `ScrollTopAndComment.js` no renderizan nada con el switch apagado.
  - Borrados `components/comments/Disqus.js`, `Utterances.js`, `disqusConfig`/`utterancesConfig` de `siteMetadata` y las ramas muertas del index de comentarios (cubre el "proveedores de comentarios no usados" del ex-8.7).
  - Verificado en el HTML de un artículo: sin `id="comment"`, sin script giscus.
  - **PENDIENTE MANUAL (Vercel)**: borrar las env vars `NEXT_PUBLIC_GISCUS_*` y `NEXT_PUBLIC_UTTERANCES_REPO`/`NEXT_PUBLIC_DISQUS_SHORTNAME` (si existen).
- [x] **1.3 Icono Twitter → X**
  - Hecho: nuevo `components/social-icons/x.svg` (borrado `twitter.svg`) y kind `twitter` → `x` en `components/social-icons/index.js` + consumidores (`Footer`, `AboutLayout`, `AuthorLayout`, `OrganizationLayout`).
  - `PostLayout.js`: texto → `"Comentar en X"`, búsqueda `mobile.twitter.com` → `x.com`, handle de autores acepta `twitter.com` y `x.com`, y botón de compartir con nuevo `components/XIcon.js` (next-share no trae componente X; se conserva `TwitterShareButton` como `XShareButton` — usa `twitter.com/intent`, el endpoint de X).
  - `siteMetadata.twitter` → `https://x.com/ekopuntored`. Metas `twitter:*` de `SEO.js` intactas (estándar de la tarjeta).
  - Verificado en el HTML: glifo X en footer y en el artículo, `"Comentar en X"`, link `x.com/ekopuntored`.

---

## Fase 2 — Portada: excludeFromFeed y márgenes ✅ (2026-09-24)

- [x] **2.1 Opción `excludeFromFeed` en widgets de portada** (`data/portadaWidgets.js`, `lib/widgets.js`, `pages/index.js`)
  - Hecho: `portadaFeedExclusions(posts)` en `lib/widgets.js` (lista manual → esos slugs; modo tag → los `limit` más recientes con la etiqueta) + filtrado en el `getStaticProps` del home **antes** de elegir hero y armar el feed (con salvaguarda si la config excluyera todo). Los widgets se siguen construyendo con la lista completa. Doc en `data/portadaWidgets.js` y AGENTS.md.
  - Verificado con prueba temporal (`excludeFromFeed: true` en Cultura): beltza/cadenas desaparecen del feed y del hero, siguen en el widget de portada, `/blog` y sidebar; luego revertido y reconstruido (vuelven al feed como primera Box).
- [x] **2.2 Aumentar el margen entre hero/widgets y el bloque siguiente**
  - Hecho en `pages/index.js`: hero `-m-4` → `-mx-4` (sangrado horizontal, margen vertical normal), widgets `mt-4` → `mt-6`, bloque sidebar+feed `-m-4` → `-mx-4 mt-8`. Verificado en el HTML del build.

---

## Fase 3 — Dependencias seguras (antes 12.1) ✅ (2026-09-24)

- [x] **3.1** Pasada de actualizaciones dentro de semver aplicada con `yarn upgrade` (con `yarn lint` + `yarn build` OK):
  - `tailwindcss` 3.2.4 → 3.4.19, `postcss` → 8.5.28, `autoprefixer` → 10.6.1, `preact` → 10.29.8, `@tailwindcss/typography` → 0.5.20, `prettier` → 2.8.8, `rehype-prism-plus`/`rehype-katex` (patches), `socket.io`/`socket.io-client` (dev) → 4.8.3 y demás pendientes dentro de rango (`yarn outdated` ahora solo muestra mayores).
  - ~~`next-auth`~~ → fuera de la lista (eliminado en Fase 1.1).

---

## Tareas para mañana (antes Fases 7–12)

> Renombradas: dejan de ser fases activas y quedan como backlog. Reorden sugerido:
> ex-8 → ex-9 → ex-10 → ex-11 → ex-12 (ex-7 sigue aplazada por decisión del usuario).

- [ ] **Scroll infinito — ex Fase 7 (aplazada)**
  - 7.1 Home y listados con `IntersectionObserver` (`components/InfiniteScroll.js` reutilizable, render de a N sobre los `frontMatter` de `getStaticProps`).
  - 7.2 `/blog` y `/tags/[tag]` con el mismo componente; conservar `Pagination.js` como fallback SEO (link a página 2 / `<link rel="next">`).
  - 7.3 Estado de carga accesible (spinner/"Cargar más" con botón de respaldo).
  - 7.4 Medir con `yarn analyze` que el payload inicial no crezca (frontmatter liviano: title, slug, summary, images, tags, date).
- [ ] **Bugs y limpieza — ex Fase 8**
  - 8.1 `<Html lang="en">` → `lang="es"` en `pages/_document.js`.
  - 8.2 Textos en inglés → español: `pages/404.js`, mensajes de `NewsletterForm`, "View on GitHub"/"Published on" en `layouts/PostLayout.js` ("Discuss on Twitter" lo cubre 1.3).
  - 8.3 Alt del logo: `alt="Picture of the author"` → `alt={siteMetadata.headerTitle}`.
  - 8.4 `ogImage.constructor.name === 'Array'` → `Array.isArray(ogImage)` en `components/SEO.js`.
  - 8.5 RSS: proteger `posts[0].date` contra lista vacía (`lib/generate-rss.js`); agregar `content:encoded`.
  - 8.6 Meta faltante: `og:locale` = `es_ES`.
  - 8.7 Código muerto restante: rutas API de newsletters no usadas (mailchimp, buttondown, convertkit, klaviyo, revue), `data/projectsData.js` (los proveedores de comentarios los cubre 1.2).
  - 8.8 Flash del logo al cambiar tema en `LayoutWrapper.js` (flag `mounted` de next-themes).
- [ ] **Rendimiento — ex Fase 9**
  - 9.1 Migrar Inter a `next/font` (subconjunto latin, sin CLS).
  - 9.2 Optimizar `public/static/` (83 MB en git): WebP/AVIF, compresión, Git LFS o CDN.
  - 9.3 Baseline con `yarn analyze` antes/después de cambios grandes.
- [ ] **SEO editorial — ex Fase 10**
  - 10.1 Sitemap de Google News + publisher tag.
  - 10.2 Artículos relacionados por tag al final de cada post.
  - 10.3 ~~Buscador client-side~~ — cubierto por el overlay + `/api/search`; opcional migrar a Fuse.js si se quiere fuzzy.
  - 10.4 Página de archivo por año `/archivo`.
  - 10.5 Structured data: `BreadcrumbList`, `NewsMediaOrganization`.
- [ ] **Infraestructura — ex Fase 11**
  - 11.1 CI en GitHub Actions: `yarn lint` + `yarn build` en PRs.
  - 11.2 Tests smoke con Playwright (home, post, tags, 404).
  - 11.3 Dependabot (`.github/dependabot.yml`).
  - 11.4 Pin de Node: `.nvmrc` + `engines` en `package.json`.
  - 11.5 Accesibilidad: contraste de links `primary-500` (usar `primary-600/700`), skip-to-content.
  - 11.6 Scripts npm: agregar `yarn compose`.
- [ ] **Mayores dependencias — ex Fase 12.2 (PRs separados, por último)**
  - Riesgo medio (probar aparte): `next-themes` 0.4, `next-share` 0.27, `@tailwindcss/forms` 0.5, `sharp` 0.35 (⚠️ `/_next/image` en Next 12), `github-slugger`, `reading-time`, `image-size`.
  - Mayores: `next` 12 → 16 + `react` 17 → 19 (revisar alias Preact en `next.config.js`), `eslint` 7 → 10, `prettier` 3 (reformatea todo) + plugin tailwind, `husky` 9 + `lint-staged` 17, `mdx-bundler` 10 + `esbuild` (riesgo en todo el pipeline MDX), `@fontsource/inter` 5 (o `next/font`, ex-9.1).
  - Orden: semver-safe (Fase 3) → tailwind 3.4 → tooling (eslint/prettier/husky) → next+react al final.

---

## Pendientes manuales (Vercel)

- [ ] Borrar env vars de auth: `AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXT_PUBLIC_GOOGLE_SECRET`, `NEXTAUTH_SECRET` (tras 1.1).
- [ ] Borrar env vars de comentarios: `NEXT_PUBLIC_GISCUS_*`, `NEXT_PUBLIC_UTTERANCES_REPO`, `NEXT_PUBLIC_DISQUS_SHORTNAME` (tras 1.2).
- [ ] Redeploy tras tocar env vars (las `NEXT_PUBLIC_*` se hornean en el build).

---

## Historial — completado (2026-09-23/24)

### Ex Fase 1 — Crítico: seguridad y legal

- [x] **1.1 Rotar y externalizar el secret de NextAuth**
  - El secret estaba hardcodeado en `pages/api/auth/[...nextauth].js:11`.
  - Movido a variable de entorno `AUTH_SECRET`. *(Obsoleto: next-auth se elimina en la nueva Fase 1.1 → borrar la env var en Vercel.)*
- [x] **1.2 Secret de Google OAuth expuesto al navegador**
  - `NEXT_PUBLIC_GOOGLE_SECRET` se inyectaba en el bundle del cliente.
  - Renombrado a `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` (solo servidor) + `AUTH_SECRET` en `.env.example`. *(Obsoleto: se elimina con next-auth en la nueva Fase 1.1.)*
- [x] **1.3 Consentimiento de cookies (RGPD / LSSI)**
  - GTM/AdSense cargaban sin consentimiento.
  - Creado `components/CookieConsent.js` (banner aceptar/rechazar, persiste en localStorage) y hook `useCookieConsent`.
  - `components/analytics/index.js` solo renderiza scripts tras opt-in; `components/AdSense.js` solo carga AdSense tras opt-in.
- [x] **1.4 Alinear CSP con AdSense**
  - La CSP ya incluía `pagead2.googlesyndication.com` y `ep2.adtrafficquality.google` (hecho a mano).
  - El `<script>` de AdSense salió de `_document.js` → ahora vive en `components/AdSense.js` con consentimiento. El cliente se movió a `siteMetadata.analytics.adsenseClient`. **Pendiente de decidir: si no hay unidades `<ins class="adsbygoogle">`, eliminar componente + meta en `SEO.js`.**
- [x] **1.5 Blindar `/api/emailoctopus`**
  - Ahora: solo POST, rate limit (5/min por IP), validación de email, honeypot `website` (en `NewsletterForm`), mensajes de error genéricos (sin filtrar `error.message`) y log en servidor.

### Ex Fase 2 — Desactivaciones temporales (pedido por el equipo)

- [x] **2.1 Ocultar la newsletter temporalmente** (la cuenta de EmailOctopus no funciona)
  - Interruptor agregado: `siteMetadata.newsletter.enabled = false` (poner `true` para reactivar).
  - Home (`pages/index.js`) ahora exige `enabled && provider !== ''`.
  - `NewsletterForm` retorna `null` si está deshabilitada → también oculta `<BlogNewsletterForm>` en posts MDX.
  - API `pages/api/emailoctopus.js` y config del provider **no se borraron** (reversión fácil).
- [x] **2.2 Desactivar el sistema de suscripciones de pago** (no hay cuentas disponibles)
  - Modal `Suscribe()` eliminado de `pages/blog/[...slug].js` (era código muerto; también sacó los imports rotos `signUp`/next-auth/headlessui).
  - `pages/login.js` eliminado (form no funcional) y link de Login comentado fuera de `headerNavLinks.js`.
  - `LayoutWrapper.js`: rama muerta de sesión/Logout eliminada (sin `useSession`/`signOut`).
  - Se conserva la infra de next-auth por si se retoma. *(Ahora sí se elimina: nueva Fase 1.1.)*
- [x] **2.3 Preparar slot para Buy Me a Coffee (futuro)**
  - `siteMetadata.support = { provider: 'buymeacoffee', url: '', text: 'Buy Me a Coffee' }`.
  - Nuevo `components/SupportButton.js` (no se renderiza si `url` está vacío), montado en `Footer.js` y al final del artículo en `layouts/PostLayout.js`. Para activarlo: poner la URL.

### Ex Fase 3 — Sistema de fechas con hora

- [x] **3.1 Frontmatter con fecha y hora** (para publicar 2 artículos el mismo día)
  - Formato ISO 8601: `date: '2026-09-23T14:30:00-04:00'` (con zona horaria).
  - Verificado: las cadenas ISO se normalizan a UTC en `lib/mdx.js` y `dateSortDesc` ordena bien mezclando con fechas antiguas (`YYYY-MM-DD` sin hora) — probado con Node.
  - Además se preserva `dateRaw` (fecha cruda del frontmatter) para el display.
- [x] **3.2 Actualizar `scripts/compose.js`** para pedir hora al crear un post (default: ahora)
  - Nuevo prompt "Hora de publicación (HH:MM, hora local)" con default = hora actual.
  - Escribe `date: 'YYYY-MM-DDTHH:mm±HH:MM'` con el offset local → la hora no depende del tz del servidor.
- [x] **3.3 Mostrar hora en el frontend**
  - `formatDate.js`: nuevo export `formatDateTime(date, dateRaw, extraOptions)`.
    - Posts con hora → fecha + hora en la tz del lector.
    - Posts legados sin hora → solo fecha, renderizada en **UTC**.
  - Aplicado en `PostLayout` (con día de la semana), `PostSimple`, home (`pages/index.js`) y `ListLayout` (`/blog`, tags, paginación).
  - **Bug corregido**: los posts legados mostraban el día anterior en zonas UTC-X (ej. "31 de mayo" en vez de "1 de junio") — verificado en el HTML del build.
- [x] **3.4 Ordenar por fecha+hora** donde se liste contenido (home, blog, tags, RSS, sitemap)
  - Todo fluye desde `getAllFilesFrontMatter`/`getFileBySlug` (normalizados a ISO UTC) → home, `/blog`, tags y RSS (`pubDate`) ordenan por fecha+hora. Sitemap no ordena por fecha (no aplica).
- [x] **3.5 Actualizar AGENTS.md** con el nuevo formato de fecha.

### Ex Fase 4 — Sistema de sidebar con widgets

- [x] **4.1 Diseñar config de widgets** en `data/widgets.js`
  - Implementado: `[{ id, type: 'authors' | 'categories' | 'latest', title, enabled, limit, includeImg }]` — `enabled: false` oculta el widget sin borrarlo.
  - El contenido de cada widget se arma en build time desde `lib/widgets.js` (`buildWidgets()`).
- [x] **4.2 Crear `layouts/Sidebar.js`**
  - Adaptado de la referencia (panameconomics/visiontres): renderiza los widgets según config, con `Link` interno, fechas con `formatDateTime` y soporte de items con `href`+`count` (categorías) o `articles` (autores/últimos).
- [x] **4.3 Integrar layout de 2 columnas** — aplicado en home (`pages/index.js`), `/blog`, `/blog/page/[n]` y `/tags/*` vía `ListLayout` (`widgets` prop + `Sidebar` con `order` para que en móvil quede debajo). El sidebar se oculta mientras el usuario busca. `PostLayout` (posts) queda omitido a propósito: es opcional en el plan y en páginas de artículo el ancho conviene guardarlo para el contenido.
- [x] **4.4 Widget de autores**: avatar + nombre + sus últimos `limit` artículos (linking a `/authors/[id]` pendiente de crear esas rutas — ver Tareas para mañana).
- [x] **4.5 Widget de categorías**: conteo de artículos por sección (normaliza tags igual que `kebabCase`).

### Ex Fase 5 — Nuevas secciones: Kanaime y Cultura

- [x] **5.1 Sección "Kanaime"** (turismo y naturaleza) — **oculta hasta tener contenido**
  - **Decisión**: mismo patrón tag-based que las secciones actuales (sin ruta propia) → `/tags/kanaime`, hereda layout, RSS y sitemap de `pages/tags/[tag].js`.
  - Config central en `data/sections.js`: `{ title: 'KANAIME', tag: 'kanaime', requiresContent: true }`.
  - **Visibilidad automática**: `next.config.js` lee `data/blog/*.mdx` al iniciar (build/dev) y filtra secciones con `requiresContent` sin artículos publicados; se inyecta como `NEXT_PUBLIC_SECTIONS` (server y client ven el mismo valor). No requiere tocar config al publicar el primer artículo (solo reiniciar dev/deploy).
- [x] **5.2 Sección "Cultura"** — habilitada
  - `{ title: 'CULTURA', tag: 'cultura' }` en `data/sections.js` (ya existía 1 artículo con ese tag).
- [x] **5.3 Home**: la barra de secciones es ahora **global en el header** (`LayoutWrapper`, visible en todas las páginas, `hidden sm:flex`) y también en el menú móvil (`MobileNav`) + barra fija con scroll. La barra duplicada del home se eliminó.
- [x] **5.4 SEO**: `/tags/<sección>` ya usa `TagSEO` + se genera `public/tags/<slug>/feed.xml` en build; el sitemap incluye `public/tags/**/*.xml`. Solo existen páginas/sitemaps de tags con contenido → Kanaime queda fuera automáticamente.
- [x] **5.5 `siteMetadata.pages` eliminado** (reemplazado por `data/sections.js` como única fuente de verdad). `headerNavLinks.js` no cambia (las secciones se renderizan desde `lib/sections.js`).

### Ex Fase 6 — Portada controlada por variable

- [x] **6.1 Nueva variable de frontmatter**: `featured: true` (y opcional `featuredOrder: 1` para desempatar)
  - Con la variable: **el artículo con `featured: true` sale en portada sin importar la fecha**.
  - `scripts/compose.js` pregunta por `featured` y solo escribe la línea si la respuesta es `yes` (frontmatter limpio).
- [x] **6.2 Lógica en `pages/index.js`**:
  - Hero = primer `featured` (ordenado por `featuredOrder`, menor primero; sin orden → después; empate → fecha) → fallback al más reciente si ninguno.
  - Slots siguientes = resto de `featured` primero, luego el resto por fecha.
  - Bonus: hero/Box ahora toleran posts sin `images` (fallback a bloque de texto / sin miniatura) — antes crasheaba con `images[0]`.
- [x] **6.3 Validación**: si un post es `draft: true`, ignorar `featured`.
  - Gratis: `getAllFilesFrontMatter` ya excluye `draft: true` antes de llegar al home.
- [x] **6.4 Documentar** el nuevo frontmatter en `AGENTS.md` (sección "Writing content").

### UI — Barra fixed panameconomics + composición de portada (2026-09)

- [x] **Barra fixed en todas las páginas** (`components/LayoutWrapper.js`): siempre visible arriba con `siteMetadata.topTags` (8 tags → `/tags/<slug>`), nav (Etiquetas/Nosotros), ThemeSwitch y menú móvil. El logo pequeño aparece en la barra al hacer scroll >200px (igual que la referencia: el header grande se va de vista). El header conserva solo el logo grande + barra de secciones; `pt-16` en el layout libera la barra. Los controles NO se duplican en el header (viven solo en la barra, como panameconomics). Menú móvil: pasa a `md:hidden` y agrega grupo de `topTags`.
- [x] **Composición de portada copiada de panameconomics** (`pages/index.js`): hero `Box` a todo el ancho → sidebar (izquierda en desktop) + columna de `Box` apilados (`slice(1, maxDisplay)`, inicial 12) + botón **"Mostrar más →"** (+4). Se eliminan las Cards y las filas `Li` del home.
- [x] **Proporciones alineadas a la referencia**: sidebar `md:w-1/3` + contenido `md:w-2/3` en home y `ListLayout` (corrige un desajuste `lg:w-3/4` + `lg:w-1/3` = 108% que rompía `/blog` en desktop).
- Fechas en el home: la lista ya no muestra fecha (como la referencia); siguen en `/blog`, tags y artículos.

> Nota: el botón "Mostrar más" es carga incremental manual (así lo hace panameconomics), **no** es el scroll infinito automático (ex-Fase 7), que sigue aplazado.

### UI — Ajustes de portada, tags y widgets (2026-09-24)

- [x] **Logo centrado** en el header (`components/LayoutWrapper.js`: `justify-center` en el header; el logo pequeño de la barra fixed al hacer scroll queda a la izquierda como en la referencia).
- [x] **Fotos en los listados de artículos** (`layouts/ListLayout.js`): miniatura con `images[0]` a la izquierda de cada fila (responsive, con fallback si el post no tiene imagen). Aplica a `/blog`, `/blog/page/[n]` y `/tags/*` (misma función).
- [x] **Páginas de tags sin sidebar** (`pages/tags/[tag].js`): ya no se pasa `widgets` a `ListLayout` (ListLayout ocupa el ancho completo). `/blog` conserva su sidebar.
- [x] **Botón de búsqueda global (lupa en la barra fixed)**: nuevo `components/SearchButton.js` + `pages/api/search.js` (GET, solo frontmatter liviano, `Cache-Control`). Abre un overlay con filtro instantáneo sobre título/resumen/tags; resultados con foto y fecha; cierra con Escape o el botón ✕; el índice se descarga una sola vez (caché en módulo del cliente).
- [x] **Widgets de portada genéricos** (`data/portadaWidgets.js` + `buildPortadaWidgets()` en `lib/widgets.js` + bloque en `pages/index.js`): reemplazan al bloque "Cultura" hardcodeado. Cada widget lleva `title` y se llena con **`tag`** (artículos con esa etiqueta, más recientes; excluye el hero actual para no repetirlo) **o `posts`** (lista manual de slugs, en el orden dado; gana sobre `tag`). Opcionales `limit` (default 3 en tag / todos en manual), `min` (default 1) y `href` (default `/tags/<tag>` en modo tag, `null` = sin enlace). El orden del array = orden de aparición; `enabled: false` oculta sin borrar. Se renderizan debajo de la nota principal, apilados con foto + título + resumen por fila.
  - Widget inicial: **Cultura** (`tag: cultura`, `min: 2`, `limit: 3`, `href: /tags/cultura`) — umbral ≥2 artículos confirmado por el usuario. Ejemplo con lista manual queda comentado en el config.
- [x] **Widget "Nuestros autores"**: espacio entre foto de perfil y nombre (el margen en el `<img>` de `next/image` no aplica porque va dentro del wrapper: ahora el `mr-4` vive en un `<span>` contenedor) y **orden fijo** vía `order` en `data/widgets.js`: Francisco Olivares → Marcos Tarre → Henry Alvarez → Rafael Olivares (autores fuera del orden, al final).
- [x] **Widget "Cultura"** inmediatamente después de "Nuestros autores": nuevo filtro `tag` en el tipo `latest` de `data/widgets.js`/`lib/widgets.js`; se oculta solo si no hay artículos con ese tag (el umbral ≥2 aplica únicamente a la sección de portada).
- [x] **Variable `excludeHero`** (renombrada/re-acotada de `excludeHome`: el usuario pidió excluir **solo del layout del primer artículo**, no del home completo) (`pages/index.js`, prompt en `compose.js`, doc en `AGENTS.md`): el artículo no puede ser el hero aunque sea `featured` o el más nuevo, pero sí aparece en la lista del home, widgets de portada, `/blog`, tags, RSS, sitemap y búsqueda. Aplicada a `marcos-tarre-sobre-beltza.mdx`. La exclusión de `buildWidgets()` se revirtió (los widgets del sidebar muestran todos los artículos). *(Su complemento, `excludeFromFeed` a nivel de widget, está en la nueva Fase 2.1.)*
- Verificación: `yarn lint` limpio + `yarn build` OK; HTML comprobado (orden de autores, `/tags/*` sin `<aside>`, miniaturas presentes, lupa en home y posts, `/api/search` compilada, widgets de portada).

---

## Orden recomendado

**Fase 1 → 2 → 3** (inmediato) → **Tareas para mañana** en orden: ex-8 → ex-9 → ex-10 → ex-11 → ex-12 (ex-7 aplazada).

| Bloque | Esfuerzo estimado |
|--------|-------------------|
| Fase 1 (limpieza) | ~2–3 horas |
| Fase 2 (portada) | ~1–2 horas |
| Fase 3 (deps seguras) | ~1 hora |
| Tareas para mañana (ex-7 a ex-12) | 3–5 días |
