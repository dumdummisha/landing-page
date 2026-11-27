# Dumdum Misha website

The landing page at [dumdummisha.ai](https://dumdummisha.ai) for Dumdum Misha, a personal AI assistant that runs on its user's own computer. This repository is only the website: a static Astro build with no server, no database and no client-side JavaScript of its own. It is for whoever changes the page's copy or design.

To see the site locally, run `pnpm install` and `pnpm dev`. What Misha does is in the public docs at [docs.dumdummisha.ai](https://docs.dumdummisha.ai) (`dumdummisha/docs`), and the app itself lives in `dumdummisha/desktop`.

## Pages

- `/` is the landing page (`src/pages/index.astro`). Its calls to action are "Ask for an invite", an email to Michal, and "Book a call with Michal", a link to his Calendly page.
- `/privacy` redirects permanently (`vercel.json`) to the [privacy policy](https://docs.dumdummisha.ai/privacy) in the docs.
- `404.html` (`src/pages/404.astro`) serves any address that doesn't exist.

## Run it locally

You need Node 24 (`.node-version`) and pnpm 11.

```sh
pnpm install
pnpm dev        # http://localhost:4321
```

| Command             | What it does                                                                     |
| ------------------- | -------------------------------------------------------------------------------- |
| `pnpm build`        | Writes the site to `dist/`                                                       |
| `pnpm check`        | Typechecks the `.astro` and TypeScript files                                     |
| `pnpm format`       | Formats the TypeScript, JSON, YAML, CSS and Markdown; oxfmt skips `.astro` files |
| `pnpm format:check` | Checks the formatting without changing anything                                  |

A build downloads the display, sans and mono fonts from Google Fonts, so it needs network access.

## Deploy

Vercel's Git integration deploys the site as a static site, under the `mjarnots-projects` scope. Nothing in this repository deploys it. The project's settings in Vercel are:

- Framework preset: Astro
- Install command: `pnpm install`
- Build command: `pnpm build`
- Output directory: `dist`
- Node.js: 24

Cloudflare is the registrar and DNS host for `dumdummisha.ai` and `dumdummisha.com`. A Cloudflare redirect rule sends `dumdummisha.com` to `https://dumdummisha.ai`.

## Content and assets

| Folder                    | What lives there                                                                                                |
| ------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `src/components/landing/` | One component per section of the landing page, each holding its own copy                                        |
| `src/components/`         | The design system's components, one folder per part, and `Icon.astro` with its icon set in `icons.json`         |
| `src/layouts/`            | `Base` (the head, Open Graph tags, favicons and fonts) and `Canvas` (the yellow page behind the not-found page) |
| `src/styles/`             | `tokens.json` and `site.css`, the styles every page shares. A component's own styles sit in its `.astro` file   |
| `src/assets/fonts/`       | `caveat.woff2`, the handwriting font's subset                                                                   |
| `scripts/`                | `tokens.ts` writes the tokens the components and styles reference into `src/styles/tokens.css`                  |
| `public/`                 | The favicons, the web manifest, the Open Graph image and Caveat's OFL license                                   |

The design system is an artifact on claude.ai. `tokens.json`, `icons.json` and the favicons are copies of it, so change them there and never here.

## The handwriting font

Caveat only draws the hand notes (`src/components/quirks/Scribble.astro`). `src/assets/fonts/caveat.woff2` is a fixed subset of Caveat SemiBold (OFL) that holds printable ASCII (U+0020-007E) and the no-break space (U+00A0). A hand note with any other character fails the build.

The subset was made from Google Fonts' Caveat SemiBold WOFF2, named `caveat-original.woff2` here. The command needs [uv](https://docs.astral.sh/uv/) to fetch the pinned FontTools and Brotli:

```sh
uvx --from fonttools==4.67.0 --with brotli==1.2.1 pyftsubset caveat-original.woff2 \
  --output-file=src/assets/fonts/caveat.woff2 --flavor=woff2 --unicodes=U+0020-007E,U+00A0 \
  --layout-features=kern,liga --name-IDs=0,1,2,3,4,5,6,13,14
```
