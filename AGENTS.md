# AGENTS.md

## Overview

EKO.RED is a Spanish-language digital news magazine (economy, politics, crime,
cybersecurity) built with Next.js. It is a customized fork of the Tailwind
Next.js Starter Blog. Content lives in Markdown/MDX files; there is no CMS or
database. Site language and locale: `es`.

## Commands

- `yarn dev` — dev server (Next.js)
- `yarn start` — dev server with file-watching over `./data` + client auto-reload
- `yarn build` — production build + `scripts/generate-sitemap.js`
- `yarn serve` — serve the production build
- `yarn lint` — ESLint with `--fix` over `pages`, `components`, `lib`, `layouts`, `scripts`
- `yarn analyze` — bundle analysis build
- `node scripts/compose.js` — interactive scaffolder for a new blog post

Install dependencies with `yarn` (yarn.lock is authoritative; do not use npm).

## Tech stack

- **Next.js 12** (Pages Router) with **React 17**, plain **JavaScript** — no TypeScript
- In client production builds, React is aliased to **Preact** (`next.config.js` webpack)
- **Tailwind CSS 3** — `darkMode: 'class'`, custom `primary` color (yellow), Inter font
- **MDX** content compiled with `mdx-bundler` (remark/rehype pipeline in `lib/mdx.js`)
- `next-themes` (dark mode), `giscus` (comments — disabled via
  `siteMetadata.comment.enabled = false`; no login/auth), Google Analytics,
  `emailoctopus` (newsletter), `next-share` (social buttons)

## Project structure

- `pages/` — routes (Pages Router): `index.js`, `blog/[...slug].js`, `tags/`,
  `about.js`, `404.js`, `api/` (newsletter providers + `api/search.js`
  = índice liviano del buscador client-side)
- `components/` — shared UI (`Card`, `Box`, `SEO`, `LayoutWrapper`, `MDXComponents`, ...)
- `layouts/` — page templates: `PostLayout`, `PostSimple`, `ListLayout`,
  `AboutLayout`, `AuthorLayout`, `OrganizationLayout`, `Sidebar`
- `lib/` — MDX pipeline (`mdx.js`), custom remark plugins, `utils/`,
  `generate-rss.js`, `sections.js` (visible sections), `widgets.js` (builds
  sidebar widget content from posts/authors)
- `data/` — all site content and config:
  - `siteMetadata.js` — site title, nav pages, analytics/comments/newsletter
    config; `topTags` = tags of the fixed top bar and the mobile menu
    (each must link to an existing `/tags/<slug>`, i.e. ≥1 published post)
  - `headerNavLinks.js` — header navigation
  - `sections.js` — sections bar (header, scroll bar, mobile menu): entries are
    `{ title, tag, requiresContent? }` → `/tags/<tag>`. Entries with
    `requiresContent: true` (Kanaime) are hidden until ≥1 non-draft post uses
    that tag; `next.config.js` computes this at build/dev start and injects it
    as `NEXT_PUBLIC_SECTIONS` (restart the server after publishing the first
    post of a new section — it also counts external stubs, see below)
  - `widgets.js` — sidebar widget config (`id`, `type`, `title`, `enabled`,
    `limit`, `includeImg`; `tag` filtra el tipo `latest` a una etiqueta,
    `source` lo llena con solo artículos del blog hijo de esa fuente,
    `order` fija el orden del tipo `authors` por slug; array order = display
    order; rendered by `layouts/Sidebar.js` — used on home and `/blog` only,
    never on `/tags/*`)
  - `portadaWidgets.js` — widgets under the home hero (`id`, `title`,
    `enabled`, `limit`, `min`; fill with `tag`, a manual `posts` slug list, or
    `source` = blog hijo (external stubs); `href` = "Ver toda la sección"
    link; `excludeFromFeed: true` keeps the widget's articles out of the home
    feed and the hero; array order = display order; built by
    `buildPortadaWidgets()` in `lib/widgets.js`, rendered only by
    `pages/index.js`)
  - `externalSources.js` — label/dominio por fuente externa (sello visual)
  - `blog/*.mdx` — posts
  - `authors/*.md` — author profiles
  - `external/<fuente>/*.md` — stubs de blogs hijo (ver abajo)
- `scripts/` — `compose.js` (new post), `generate-sitemap.js`, `next-remote-watch.js`
- `public/static/` — images and static assets (posts reference `/static/images/...`)

## Conventions

- **Path aliases** (jsconfig.json): `@/components/*`, `@/data/*`, `@/layouts/*`,
  `@/lib/*`, `@/css/*` — use them instead of relative paths.
- **Formatting** (Prettier): no semicolons, single quotes, 2-space indent,
  print width 100, trailing commas (`es5`). Prettier sorts Tailwind classes.
- **Lint**: ESLint with `next` + `next/core-web-vitals` + Prettier integration.
  A Husky pre-commit hook runs lint-staged (eslint --fix + prettier --write).
- **Styling**: use Tailwind utility classes directly; dark-mode variants
  (`dark:`) are required for anything color-related. Semantic colors:
  `primary` (yellow), `gray` (neutral).
- **SEO**: pages use `PageSEO` / `BlogSEO` from `@/components/SEO` with
  `siteMetadata`.

## Writing content

New posts: run `node scripts/compose.js`, or create `data/blog/<slug>.mdx`.
Posts are statically generated from frontmatter; the slug is the filename
without extension.

Required frontmatter:

```yaml
---
title: 'Post title'
date: '2026-09-23T14:30:00-04:00' # hora local con offset (permite 2 posts el mismo día)
# date legado aceptado: 'YYYY-MM-DD' (se muestra en UTC, sin hora)
tags: ['tag1', 'tag2']
draft: false
summary: 'Short description used in lists and meta description'
images: ['/static/images/blog/cover.jpeg']
authors: ['author-id'] # matches data/authors/<author-id>.md
layout: PostLayout # optional; defaults to PostLayout
featured: true # optional; homepage hero regardless of date (ignored if draft: true)
featuredOrder: 1 # optional; tie-break between multiple featured (lower = first)
excludeHero: true # optional; published but never shown as the home hero
canonicalUrl: '' # optional
---
```

- `featured: true` makes the post the homepage main note even if it is not the
  newest: hero = first `featured` (by `featuredOrder`, then date), the rest of
  `featured` follow in the card slots, then the rest chronologically. If no
  post is featured, the newest is the hero. Drafts are always ignored.
  `node scripts/compose.js` prompts for it.

- `excludeHero: true` keeps the post out of the home hero (the first-article
  layout) even if it is featured or the newest, but it still appears in the
  home lists, portada widgets, `/blog`, tags, RSS, sitemap and search.
  `node scripts/compose.js` prompts for it.

- Author profiles: `data/authors/<id>.md` with frontmatter
  `name`, `avatar`, `occupation`, `twitter`, `email`, `linkedin`, `github`.
- Images live in `public/static/images/` and are referenced as
  `/static/images/...` (no `public/` prefix in content).
- `draft: true` excludes the post from lists, RSS, and the sitemap.

### Artículos de blogs hijo (índice externo, p. ej. kanaime.org)

`eko.red` indexa metadata de artículos de sus blogs hijo (modelo Xataca): en
eko.red solo vive el frontmatter; el artículo completo está en el portal hijo
y se abre en pestaña nueva con diseño diferenciado (borde discontinuo + sello
del dominio).

- Un artículo externo = un stub con solo frontmatter en
  `data/external/<fuente>/<slug>.md` (fuente: `kanaime` → kanaime.org; ver
  `lib/externalPosts.js` y `data/externalSources.js`). Frontmatter:
  `title`, `date`, `summary`, `images`, `tags`, `draft` y **`externalUrl`
  (obligatorio** — sin ella el stub se ignora con warning en build).
- Aparecen en: feed de la portada (mezclados por fecha, **nunca hero ni
  featured**), `/blog`, `/tags/<tag>`, el widget/bloque Kanaime de portada y
  sidebar (configs con `source: 'kanaime'` en `data/widgets.js` y
  `data/portadaWidgets.js`) y el feed de `/tags/kanaime`.
- NO aparecen en: el feed global `public/feed.xml`, el sitemap (vive en el
  hijo), el buscador, ni generan ruta propia (`/blog/<slug>` no existe para
  externos).
- La sección KANAIME de la navegación se activa con el primer stub no-borrador
  (locales + externos); reiniciar el dev server tras añadirlo.
- `node scripts/compose.js` es solo para posts locales; los stubs se crean a
  mano copiando `data/external/kanaime/_ejemplo.md`.

## Configuration notes

- **Site config**: `data/siteMetadata.js` controls title, description, nav,
  analytics IDs, comments (`comment.enabled`, off by default) and newsletter
  provider. Change it there, not in components.
- **Environment**: copy `.env.example` to `.env.local`. Newsletter and comment
  integrations need API keys (`NEXT_PUBLIC_GISCUS_*` only if comments are
  enabled, `EMAILOCTOPUS_*`, ...).
- **Security headers / CSP**: defined in `next.config.js`. If you add an
  external script or iframe (analytics, comments), you must extend the CSP
  there or it will be blocked.
- **Editing content in dev**: use `yarn start` so changes under `data/`
  reload without restarting the server.

## Things to watch out for

- Do not assume full React in production client builds — React is swapped for
  Preact via webpack aliases.
- The MDX pipeline (`lib/mdx.js`) is shared by every post; plugin changes
  affect all content.
- `pages/blog/[...slug].js` writes `public/feed.xml` at build time — it is
  generated, don't edit by hand. Same for `public/sitemap.xml`.
