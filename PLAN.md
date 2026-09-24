# PLAN.md — Hoja de ruta eko.red

> Lista de tareas de mejora, ordenadas por prioridad. Marcar con `[x]` al completar.
> Fase = bloque de trabajo con esfuerzo estimado. Actualizado: 2026-09-23.

---

## Fase 1 — Crítico: seguridad y legal

- [x] **1.1 Rotar y externalizar el secret de NextAuth**
  - El secret estaba hardcodeado en `pages/api/auth/[...nextauth].js:11`.
  - Movido a variable de entorno `AUTH_SECRET`. **PENDIENTE MANUAL: rotar el secret expuesto** (quedó en el historial de git) — generar uno nuevo con `openssl rand -base64 32` y actualizarlo en Vercel.
- [x] **1.2 Secret de Google OAuth expuesto al navegador**
  - `NEXT_PUBLIC_GOOGLE_SECRET` se inyectaba en el bundle del cliente.
  - Renombrado a `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` (solo servidor) + `AUTH_SECRET` en `.env.example`. **PENDIENTE MANUAL: actualizar las env vars en Vercel.**
- [x] **1.3 Consentimiento de cookies (RGPD / LSSI)**
  - GTM/AdSense cargaban sin consentimiento.
  - Creado `components/CookieConsent.js` (banner aceptar/rechazar, persiste en localStorage) y hook `useCookieConsent`.
  - `components/analytics/index.js` solo renderiza scripts tras opt-in; `components/AdSense.js` solo carga AdSense tras opt-in.
- [x] **1.4 Alinear CSP con AdSense**
  - La CSP ya incluía `pagead2.googlesyndication.com` y `ep2.adtrafficquality.google` (hecho a mano).
  - El `<script>` de AdSense salió de `_document.js` → ahora vive en `components/AdSense.js` con consentimiento. El cliente se movió a `siteMetadata.analytics.adsenseClient`. **Pendiente de decidir: si no hay unidades `<ins class="adsbygoogle">`, eliminar componente + meta en `SEO.js`.**
- [x] **1.5 Blindar `/api/emailoctopus`**
  - Ahora: solo POST, rate limit (5/min por IP), validación de email, honeypot `website` (en `NewsletterForm`), mensajes de error genéricos (sin filtrar `error.message`) y log en servidor.

---

## Fase 2 — Desactivaciones temporales (pedido por el equipo)

- [x] **2.1 Ocultar la newsletter temporalmente** (la cuenta de EmailOctopus no funciona)
  - Interruptor agregado: `siteMetadata.newsletter.enabled = false` (poner `true` para reactivar).
  - Home (`pages/index.js`) ahora exige `enabled && provider !== ''`.
  - `NewsletterForm` retorna `null` si está deshabilitada → también oculta `<BlogNewsletterForm>` en posts MDX.
  - API `pages/api/emailoctopus.js` y config del provider **no se borraron** (reversión fácil).
- [x] **2.2 Desactivar el sistema de suscripciones de pago** (no hay cuentas disponibles)
  - Modal `Suscribe()` eliminado de `pages/blog/[...slug].js` (era código muerto; también sacó los imports rotos `signUp`/next-auth/headlessui).
  - `pages/login.js` eliminado (form no funcional) y link de Login comentado fuera de `headerNavLinks.js`.
  - `LayoutWrapper.js`: rama muerta de sesión/Logout eliminada (sin `useSession`/`signOut`).
  - Se conserva la infra de next-auth (`_app.js` + `api/auth/[...nextauth].js`) por si se retoma.
- [x] **2.3 Preparar slot para Buy Me a Coffee (futuro)**
  - `siteMetadata.support = { provider: 'buymeacoffee', url: '', text: 'Buy Me a Coffee' }`.
  - Nuevo `components/SupportButton.js` (no se renderiza si `url` está vacío), montado en `Footer.js` y al final del artículo en `layouts/PostLayout.js`. Para activarlo: poner la URL.

---

## Fase 3 — Sistema de fechas con hora

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

---

## Fase 4 — Sistema de sidebar con widgets

- [x] **4.1 Diseñar config de widgets** en `data/widgets.js`
  - Implementado: `[{ id, type: 'authors' | 'categories' | 'latest', title, enabled, limit, includeImg }]` — `enabled: false` oculta el widget sin borrarlo.
  - El contenido de cada widget se arma en build time desde `lib/widgets.js` (`buildWidgets()`).
- [x] **4.2 Crear `layouts/Sidebar.js`**
  - Adaptado de la referencia (panameconomics/visiontres): renderiza los widgets según config, con `Link` interno, fechas con `formatDateTime` y soporte de items con `href`+`count` (categorías) o `articles` (autores/últimos).
- [x] **4.3 Integrar layout de 2 columnas** — aplicado en home (`pages/index.js`), `/blog`, `/blog/page/[n]` y `/tags/*` vía `ListLayout` (`widgets` prop + `Sidebar` con `order` para que en móvil quede debajo). El sidebar se oculta mientras el usuario busca. `PostLayout` (posts) queda omitido a propósito: es opcional en el plan y en páginas de artículo el ancho conviene guardarlo para el contenido.
- [x] **4.4 Widget de autores**: avatar + nombre + sus últimos `limit` artículos (linking a `/authors/[id]` pendiente de crear esas rutas — Fase 7.2; por ahora solo los artículos enlazan).
- [x] **4.5 Widget de categorías**: conteo de artículos por sección (normaliza tags igual que `kebabCase`).

---

## Fase 5 — Nuevas secciones: Kanaime y Cultura

- [x] **5.1 Sección "Kanaime"** (turismo y naturaleza) — **oculta hasta tener contenido**
  - **Decisión**: mismo patrón tag-based que las secciones actuales (sin ruta propia) → `/tags/kanaime`, hereda layout, RSS y sitemap de `pages/tags/[tag].js`.
  - Config central en `data/sections.js`: `{ title: 'KANAIME', tag: 'kanaime', requiresContent: true }`.
  - **Visibilidad automática**: `next.config.js` lee `data/blog/*.mdx` al iniciar (build/dev) y filtra secciones con `requiresContent` sin artículos publicados; se inyecta como `NEXT_PUBLIC_SECTIONS` (server y client ven el mismo valor). No requiere tocar config al publicar el primer artículo (solo reiniciar dev/deploy).
- [x] **5.2 Sección "Cultura"** — habilitada
  - `{ title: 'CULTURA', tag: 'cultura' }` en `data/sections.js` (ya existía 1 artículo con ese tag).
- [x] **5.3 Home**: la barra de secciones es ahora **global en el header** (`LayoutWrapper`, visible en todas las páginas, `hidden sm:flex`) y también en el menú móvil (`MobileNav`) + barra fija con scroll. La barra duplicada del home se eliminó.
- [x] **5.4 SEO**: `/tags/<sección>` ya usa `TagSEO` + se genera `public/tags/<slug>/feed.xml` en build; el sitemap incluye `public/tags/**/*.xml`. Solo existen páginas/sitemaps de tags con contenido → Kanaime queda fuera automáticamente.
- [x] **5.5 `siteMetadata.pages` eliminado** (reemplazado por `data/sections.js` como única fuente de verdad). `headerNavLinks.js` no cambia (las secciones se renderizan desde `lib/sections.js`).

---

## Fase 6 — Portada controlada por variable

- [x] **6.1 Nueva variable de frontmatter**: `featured: true` (y opcional `featuredOrder: 1` para desempatar)
  - Hoy el home toma `posts[0]` (el más nuevo) como nota principal (`pages/index.js`).
  - Con la variable: **el artículo con `featured: true` sale en portada sin importar la fecha**.
  - `scripts/compose.js` pregunta por `featured` y solo escribe la línea si la respuesta es `yes` (frontmatter limpio).
- [x] **6.2 Lógica en `pages/index.js`**:
  - Hero = primer `featured` (ordenado por `featuredOrder`, menor primero; sin orden → después; empate → fecha) → fallback al más reciente si ninguno.
  - Slots siguientes (Card grid) = resto de `featured` primero, luego el resto por fecha. La lista se reordena en `getStaticProps` (`[hero, ...restFeatured, ...rest]`).
  - Bonus: hero/Card/Li ahora toleran posts sin `images` (fallback a bloque de texto / sin miniatura) — antes crasheaba con `images[0]`.
- [x] **6.3 Validación**: si un post es `draft: true`, ignorar `featured`.
  - Gratis: `getAllFilesFrontMatter` ya excluye `draft: true` antes de llegar al home.
- [x] **6.4 Documentar** el nuevo frontmatter en `AGENTS.md` (sección "Writing content").

---

## UI — Barra fixed panameconomics + composición de portada (2026-09)

- [x] **Barra fixed en todas las páginas** (`components/LayoutWrapper.js`): siempre visible arriba con `siteMetadata.topTags` (8 tags → `/tags/<slug>`), nav (Etiquetas/Nosotros), ThemeSwitch y menú móvil. El logo pequeño aparece en la barra al hacer scroll >200px (igual que la referencia: el header grande se va de vista). El header conserva solo el logo grande + barra de secciones; `pt-16` en el layout libera la barra. Los controles NO se duplican en el header (viven solo en la barra, como panameconomics). Menú móvil: pasa a `md:hidden` y agrega grupo de `topTags`.
- [x] **Composición de portada copiada de panameconomics** (`pages/index.js`): hero `Box` a todo el ancho → sidebar (izquierda en desktop) + columna de `Box` apilados (`slice(1, maxDisplay)`, inicial 12) + botón **"Mostrar más →"** (+4). Se eliminan las Cards y las filas `Li` del home.
- [x] **Proporciones alineadas a la referencia**: sidebar `md:w-1/3` + contenido `md:w-2/3` en home y `ListLayout` (corrige un desajuste `lg:w-3/4` + `lg:w-1/3` = 108% que rompía `/blog` en desktop).
- Fechas en el home: la lista ya no muestra fecha (como la referencia); siguen en `/blog`, tags y artículos.

> Nota: el botón "Mostrar más" es carga incremental manual (así lo hace panameconomics), **no** es el scroll infinito automático de la Fase 7, que sigue aplazado.

---

## UI — Ajustes de portada, tags y widgets (2026-09-24)

- [x] **Logo centrado** en el header (`components/LayoutWrapper.js`: `justify-center` en el header; el logo pequeño de la barra fixed al hacer scroll queda a la izquierda como en la referencia).
- [x] **Fotos en los listados de artículos** (`layouts/ListLayout.js`): miniatura con `images[0]` a la izquierda de cada fila (responsive, con fallback si el post no tiene imagen). Aplica a `/blog`, `/blog/page/[n]` y `/tags/*` (misma función).
- [x] **Páginas de tags sin sidebar** (`pages/tags/[tag].js`): ya no se pasa `widgets` a `ListLayout` (ListLayout ocupa el ancho completo). `/blog` conserva su sidebar.
- [x] **Botón de búsqueda global (lupa en la barra fixed)**: nuevo `components/SearchButton.js` + `pages/api/search.js` (GET, solo frontmatter liviano, `Cache-Control`). Abre un overlay con filtro instantáneo sobre título/resumen/tags; resultados con foto y fecha; cierra con Escape o el botón ✕; el índice se descarga una sola vez (caché en módulo del cliente).
- [x] **Widgets de portada genéricos** (`data/portadaWidgets.js` + `buildPortadaWidgets()` en `lib/widgets.js` + bloque en `pages/index.js`): reemplazan al bloque "Cultura" hardcodeado. Cada widget lleva `title` y se llena con **`tag`** (artículos con esa etiqueta, más recientes; excluye el hero actual para no repetirlo) **o `posts`** (lista manual de slugs, en el orden dado; gana sobre `tag`). Opcionales `limit` (default 3 en tag / todos en manual), `min` (default 1) y `href` (default `/tags/<tag>` en modo tag, `null` = sin enlace). El orden del array = orden de aparición; `enabled: false` oculta sin borrar. Se renderizan debajo de la nota principal, apilados con foto + título + resumen por fila.
  - Widget inicial: **Cultura** (`tag: cultura`, `min: 2`, `limit: 3`, `href: /tags/cultura`) — umbral ≥2 artículos confirmado por el usuario (resuelve la nota pendiente del ">1 vs >2"). Ejemplo con lista manual queda comentado en el config.
- [x] **Widget "Nuestros autores"**: espacio entre foto de perfil y nombre (el margen en el `<img>` de `next/image` no aplica porque va dentro del wrapper: ahora el `mr-4` vive en un `<span>` contenedor) y **orden fijo** vía `order` en `data/widgets.js`: Francisco Olivares → Marcos Tarre → Henry Alvarez → Rafael Olivares (autores fuera del orden, al final).
- [x] **Widget "Cultura"** inmediatamente después de "Nuestros autores": nuevo filtro `tag` en el tipo `latest` de `data/widgets.js`/`lib/widgets.js`; se oculta solo si no hay artículos con ese tag (el umbral de >2 aplica únicamente a la sección de portada).
- [x] **Variable `excludeHero`** (renombrada/re-acotada de `excludeHome`: el usuario pidió excluir **solo del layout del primer artículo**, no del home completo) (`pages/index.js`, prompt en `compose.js`, doc en `AGENTS.md`): el artículo no puede ser el hero aunque sea `featured` o el más nuevo, pero sí aparece en la lista del home, widgets de portada, `/blog`, tags, RSS, sitemap y búsqueda. Aplicada a `marcos-tarre-sobre-beltza.mdx` — motivo: `featured: false` no excluía, siendo el más nuevo ganaba el hero por fallback. La exclusión de `buildWidgets()` se revirtió (los widgets del sidebar vuelven a mostrar todos los artículos).
- Verificación: `yarn lint` limpio + `yarn build` OK; HTML comprobado (orden de autores, `/tags/*` sin `<aside>`, miniaturas presentes, lupa en home y posts, `/api/search` compilada, widgets de portada).

---

## Fase 7 — Paginación por scroll infinito

> **Aplazada** (decisión del usuario, 2026-09): el scroll infinito queda para el futuro.

- [ ] **7.1 Home y listados**: reemplazar la paginación tradicional por scroll infinito
  - Enfoque estático recomendado: enviar todos los `frontMatter` vía `getStaticProps` y renderizar de a N (ej. 10) con `IntersectionObserver`.
  - Componente `components/InfiniteScroll.js` reutilizable.
- [ ] **7.2 `/blog` y `/tags/[tag]`**: aplicar el mismo componente (hoy usan `ListLayout` con `Pagination.js`).
  - Mantener `Pagination.js` como fallback/SEO: incluir link a página 2 clásica o `<link rel="next">` para crawlers.
- [ ] **7.3 Estado de carga**: spinner/"Cargar más" accesible (botón como fallback si no hay soporte IntersectionObserver).
- [ ] **7.4 Medir**: verificar con `yarn analyze` que el payload inicial no crezca demasiado (considerar `slice` de datos livianos: title, slug, summary, images, tags, date).

---

## Fase 8 — Bugs y limpieza (tras las fases anteriores)

- [ ] **8.1** `<Html lang="en">` → `lang="es"` en `pages/_document.js`.
- [ ] **8.2** Textos en inglés restantes → español: `pages/404.js`, mensajes de `NewsletterForm`, "Discuss on Twitter"/"View on GitHub"/"Published on" en `layouts/PostLayout.js`.
- [ ] **8.3** Alt del logo: `alt="Picture of the author"` → `alt={siteMetadata.headerTitle}` en `LayoutWrapper.js`.
- [ ] **8.4** `ogImage.constructor.name === 'Array'` → `Array.isArray(ogImage)` en `components/SEO.js`.
- [ ] **8.5** RSS: proteger `posts[0].date` contra lista vacía (`lib/generate-rss.js`); agregar `content:encoded` (contenido completo).
- [ ] **8.6** Meta faltante: `og:locale` = `es_ES`.
- [ ] **8.7** Código muerto: rutas API de newsletters no usadas (mailchimp, buttondown, convertkit, klaviyo, revue), proveedores de comentarios no usados, `data/projectsData.js`.
- [ ] **8.8** Flash del logo al cambiar tema en `LayoutWrapper.js` (usar flag `mounted` de next-themes).

---

## Fase 9 — Rendimiento

- [ ] **9.1** Migrar Inter de `@fontsource/inter/variable-full.css` a `next/font` (subconjunto latin, sin CLS).
- [ ] **9.2** Optimizar `public/static/` (83 MB en git): convertir a WebP/AVIF, comprimir, evaluar Git LFS o CDN.
- [ ] **9.3** Baseline con `yarn analyze` antes/después de cambios grandes.

---

## Fase 10 — SEO editorial

- [ ] **10.1** Sitemap de Google News + publisher tag (somos medio de noticias).
- [ ] **10.2** Artículos relacionados por tag al final de cada post.
- [ ] **10.3** Buscador client-side (Fuse.js sobre frontmatter).
- [ ] **10.4** Página de archivo por año `/archivo`.
- [ ] **10.5** Structured data: `BreadcrumbList`, `NewsMediaOrganization`.

---

## Fase 11 — Infraestructura y calidad

- [ ] **11.1** CI en GitHub Actions: `yarn lint` + `yarn build` en PRs.
- [ ] **11.2** Tests smoke con Playwright (home, post, tags, 404).
- [ ] **11.3** Dependabot (`.github/dependabot.yml`).
- [ ] **11.4** Pin de Node: `.nvmrc` + `engines` en `package.json`.
- [ ] **11.5** Accesibilidad: contraste de links `primary-500` (amarillo sobre blanco falla WCAG → usar `primary-600/700`), skip-to-content.
- [ ] **11.6** Scripts npm: agregar `yarn compose` para `scripts/compose.js`.

---

## Fase 12 — Actualizaciones de dependencias (por último, en PRs separados)

- [ ] **12.1** Seguras ahora (minores dentro de semver): `next-auth` →4.24.15, `preact` →10.29, `prettier` →2.8.8, `@tailwindcss/typography` →0.5.20, `postcss`, `nodemailer`, `socket.io`, `sharp`.
- [ ] **12.2** Mayores escalonados: `next` 12→15+ y `react` 17→19 (revisar alias Preact en `next.config.js`), `tailwind` →3.4, `eslint`/`prettier`/`husky` modernos, `mdx-bundler`+`esbuild`.

---

## Orden recomendado

**1 → 2 → 3 → 6 → 5 → 4 → 7** (crítico + pedidos del equipo) → **8 → 9 → 10 → 11 → 12**

| Fase | Esfuerzo estimado |
|------|-------------------|
| 1 | ~medio día |
| 2 | ~2 horas |
| 3 | ~2–3 horas |
| 4 | ~1 día |
| 5 | ~medio día |
| 6 | ~2 horas |
| 7 | ~medio día |
| 8–10 | 1–2 días |
| 11–12 | 1–2 días |
