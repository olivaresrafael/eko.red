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
- `next-themes` (dark mode), `next-auth`, `giscus` (comments), Google Analytics,
  `emailoctopus` (newsletter), `next-share` (social buttons)

## Project structure

- `pages/` — routes (Pages Router): `index.js`, `blog/[...slug].js`, `tags/`,
  `about.js`, `login.js`, `404.js`, `api/` (newsletter providers + `api/auth/[...nextauth].js`)
- `components/` — shared UI (`Card`, `Box`, `SEO`, `LayoutWrapper`, `MDXComponents`, ...)
- `layouts/` — page templates: `PostLayout`, `PostSimple`, `ListLayout`,
  `AboutLayout`, `AuthorLayout`, `OrganizationLayout`
- `lib/` — MDX pipeline (`mdx.js`), custom remark plugins, `utils/`, `generate-rss.js`
- `data/` — all site content and config:
  - `siteMetadata.js` — site title, nav pages, analytics/comments/newsletter config
  - `headerNavLinks.js` — header navigation
  - `blog/*.mdx` — posts
  - `authors/*.md` — author profiles
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
date: 'YYYY-MM-DD'
tags: ['tag1', 'tag2']
draft: false
summary: 'Short description used in lists and meta description'
images: ['/static/images/blog/cover.jpeg']
authors: ['author-id'] # matches data/authors/<author-id>.md
layout: PostLayout # optional; defaults to PostLayout
canonicalUrl: '' # optional
---
```

- Author profiles: `data/authors/<id>.md` with frontmatter
  `name`, `avatar`, `occupation`, `twitter`, `email`, `linkedin`, `github`.
- Images live in `public/static/images/` and are referenced as
  `/static/images/...` (no `public/` prefix in content).
- `draft: true` excludes the post from lists, RSS, and the sitemap.

## Configuration notes

- **Site config**: `data/siteMetadata.js` controls title, description, nav,
  analytics IDs, comment provider, and newsletter provider. Change it there,
  not in components.
- **Environment**: copy `.env.example` to `.env.local`. Newsletter and comment
  integrations need API keys (`NEXT_PUBLIC_GISCUS_*`, `EMAILOCTOPUS_*`, ...).
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
