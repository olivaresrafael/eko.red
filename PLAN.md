# PLAN.md — Hoja de ruta eko.red

> Lista de tareas de mejora, ordenadas por prioridad. Marcar con `[x]` al completar.
> Fase = bloque de trabajo con esfuerzo estimado. Actualizado: 2026-09-23.

---

## Fase 1 — Crítico: seguridad y legal

- [ ] **1.1 Rotar y externalizar el secret de NextAuth**
  - El secret está hardcodeado en `pages/api/auth/[...nextauth].js:11`.
  - Mover a variable de entorno `AUTH_SECRET` y **rotar el secret expuesto** (quedó en el historial de git).
- [ ] **1.2 Secret de Google OAuth expuesto al navegador**
  - `NEXT_PUBLIC_GOOGLE_SECRET` se inyecta en el bundle del cliente.
  - Renombrar a `GOOGLE_CLIENT_SECRET` (solo servidor) y actualizar Vercel/env local.
- [ ] **1.3 Consentimiento de cookies (RGPD / LSSI)**
  - GA (`G-35RZM39FET`), AdSense y giscus cargan sin consentimiento.
  - Agregar banner de consentimiento y cargar GA/AdSense solo tras opt-in.
- [ ] **1.4 Alinear CSP con AdSense**
  - `pagead2.googlesyndication.com` se carga en `_document.js` pero no está en `script-src` (`next.config.js`).
  - Decidir: ¿usamos AdSense de verdad? No hay ningún `<ins class="adsbygoogle">` en el código → **si no se usa, eliminar el `<script>` de `_document.js`** (también quita el `google-adsense-account` de `SEO.js`).
- [ ] **1.5 Blindar `/api/emailoctopus`**
  - Sin rate limit, sin honeypot y filtra `error.message` al cliente.
  - Agregar validación, límite de intentos y mensajes de error genéricos.

---

## Fase 2 — Desactivaciones temporales (pedido por el equipo)

- [ ] **2.1 Ocultar la newsletter temporalmente** (la cuenta de EmailOctopus no funciona)
  - Ocultar `NewsletterForm` / `BlogNewsletterForm` en home, posts y footer.
  - No borrar `pages/api/emailoctopus.js` ni la config en `siteMetadata.js` — solo ocultar la UI para reactivar fácilmente.
  - Marcar en `siteMetadata.js`: `newsletter.enabled = false` como interruptor.
- [ ] **2.2 Desactivar el sistema de suscripciones de pago** (no hay cuentas disponibles)
  - Eliminar el modal `Suscribe()` en `pages/blog/[...slug].js` (hoy es código muerto: nunca se renderiza e importa `signUp`, que no existe en next-auth).
  - Ocultar/eliminar `pages/login.js` (form no funcional, manda a `#`) y el link de Login comentado en `headerNavLinks.js`.
  - Dejar documentado: en el futuro se agregará un botón de **Buy Me a Coffee**.
- [ ] **2.3 Preparar slot para Buy Me a Coffee (futuro)**
  - Agregar en `siteMetadata.js`: `support: { provider: 'buymeacoffee', url: '' }`.
  - Dejar el botón oculto en footer/fin de article hasta que se defina la URL.

---

## Fase 3 — Sistema de fechas con hora

- [ ] **3.1 Frontmatter con fecha y hora** (para publicar 2 artículos el mismo día)
  - Formato ISO 8601: `date: '2026-09-23T14:30:00-04:00'` (con zona horaria).
  - Las cadenas ISO ya ordenan correctamente con `dateSortDesc` en `lib/mdx.js` — verificar compatibilidad con fechas antiguas (`YYYY-MM-DD` sin hora).
- [ ] **3.2 Actualizar `scripts/compose.js`** para pedir hora al crear un post (default: ahora).
- [ ] **3.3 Mostrar hora en el frontend**
  - `layouts/PostLayout.js` y `layouts/PostSimple.js`: cambiar `toLocaleDateString` por `toLocaleString` con hora y minutos (`siteMetadata.locale`).
  - `lib/utils/formatDate.js`: nueva opción `formatDateTime` y usarla en listados (home, `/blog`, tags).
- [ ] **3.4 Ordenar por fecha+hora** donde se liste contenido (home, blog, tags, RSS, sitemap).
- [ ] **3.5 Actualizar AGENTS.md** con el nuevo formato de fecha.

---

## Fase 4 — Sistema de sidebar con widgets

- [ ] **4.1 Diseñar config de widgets** en `data/widgets.js`:
  ```js
  // ej: lista de autores, categorías, archivo, soporte
  export default [
    { id: 'authors', type: 'authors', title: 'Autores', enabled: true },
    { id: 'categories', type: 'categories', title: 'Secciones', enabled: true },
    // ...
  ]
  ```
- [ ] **4.2 Crear `components/sidebar/`**
  - `Sidebar.js` (renderiza widgets según config) + `widgets/AuthorsList.js`, `widgets/CategoriesList.js`, `widgets/RecentPosts.js`.
- [ ] **4.3 Integrar layout de 2 columnas**
  - Aplicar en home y/o `/blog` (y opcionalmente en posts vía `PostLayout`): grid `lg:grid-cols-[1fr_300px]`.
  - Responsive: en móvil el sidebar va debajo del contenido.
- [ ] **4.4 Widget de autores**: lista con avatar + nombre, linking a `/authors/[id]` (ver Fase 7.2 si se crean esas rutas; si no, filtrando por tag/URL externa).
- [ ] **4.5 Widget de categorías**: conteo de artículos por tag/sección.

---

## Fase 5 — Nuevas secciones: Kanaime y Cultura

- [ ] **5.1 Sección "Kanaime"** (turismo y naturaleza) — **deshabilitada hasta tener contenido**
  - Agregar flag en `siteMetadata.js`: `sections: { kanaime: { enabled: false, ... }, cultura: { enabled: true } }`.
  - Ruta propia `/kanaime` (o tag dedicado como las actuales secciones — decidir; la ruta propia da más libertad de layout).
  - Mientras `enabled: false`: no aparece en el nav (`headerNavLinks.js`) ni en el home.
- [ ] **5.2 Sección "Cultura"** — habilitada
  - Ruta `/cultura` + entrada visible en nav y home.
  - Mantener el mismo patrón de datos que las secciones actuales (`siteMetadata.pages` / tags).
- [ ] **5.3 Home**: agregar Cultura a la barra de secciones; Kanaime oculto hasta activarse.
- [ ] **5.4 SEO**: `PageSEO` por sección, incluirlas en el sitemap (`scripts/generate-sitemap.js`) solo si están habilitadas.
- [ ] **5.5 Actualizar `data/headerNavLinks.js` y `siteMetadata.pages`** con el nuevo sistema de flags.

---

## Fase 6 — Portada controlada por variable

- [ ] **6.1 Nueva variable de frontmatter**: `featured: true` (y opcional `featuredOrder: 1` para desempatar)
  - Hoy el home toma `posts[0]` (el más nuevo) como nota principal (`pages/index.js`).
  - Con la variable: **el artículo con `featured: true` sale en portada sin importar la fecha**.
- [ ] **6.2 Lógica en `pages/index.js`**:
  - Hero = primer `featured` (ordenado por `featuredOrder` si hay varios) → fallback al más reciente si ninguno.
  - Slots siguientes (Card grid) = resto de `featured` primero, luego el resto por fecha.
- [ ] **6.3 Validación**: si un post es `draft: true`, ignorar `featured`.
- [ ] **6.4 Documentar** el nuevo frontmatter en `AGENTS.md` (sección "Writing content").

---

## Fase 7 — Paginación por scroll infinito

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
