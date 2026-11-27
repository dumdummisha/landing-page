# Dumdum Misha website

The website at [dumdummisha.ai](https://dumdummisha.ai): the landing page for Dumdum Misha, a personal AI assistant that takes routine work off its user in Slack and runs on their own computer. The details live in the public docs at [docs.dumdummisha.ai](https://docs.dumdummisha.ai) (`dumdummisha/docs`), which the landing page links to. The app itself lives in `dumdummisha/desktop`. This repository is only the website, a static Astro build with no server, no database and no client-side JavaScript of its own.

It has two pages and one redirect:

- `/` (`src/pages/index.astro`): the landing page, one component per section in `src/components/landing/`. It has two calls to action: "Ask for an invite", an email to Michal (`src/components/landing/InviteButton.astro`), since Misha is invite only, and the hero's "Book a call with Michal", a link to his Calendly booking page (`src/components/landing/Hero.astro`).
- `/privacy`: a permanent redirect (`vercel.json`) to the canonical policy at [docs.dumdummisha.ai/privacy](https://docs.dumdummisha.ai/privacy).
- `404.html` (`src/pages/404.astro`): the page for any address that doesn't exist.

## Layout

- `src/components/`: one folder per part of the design system (`actions`, `band`, `chat`, `marketing`, `mascot`, `navigation`, `quirks`, `shell`, `status`), `Icon.astro` with the icon set in `icons.json`, and `landing/`, where each section holds its own copy.
- `src/layouts/`: `Base` (the head, Open Graph tags, favicons and fonts) and `Canvas` (the yellow page the not-found page sits on).
- `src/styles/`: `tokens.json`, a copy of the design system's tokens, and `site.css`, the styles every page shares. Each component's own styles are a `<style>` in its `.astro` file.
- `scripts/`: `tokens.ts` writes the tokens from `tokens.json` that the components and styles reference into `src/styles/tokens.css` (gitignored).
- `public/`: the favicons, the web manifest, the Open Graph image and Caveat's OFL license.

The design system is an artifact on claude.ai. `tokens.json`, `icons.json` and the favicons are copies of it and are never edited here.

## Fonts

The display, sans and mono families come from Google Fonts through Astro's fonts API (`astro.config.ts`), which downloads them at build time, so a build needs network access to Google Fonts. Caveat, the handwriting font, is local and only draws the hand notes (`src/components/quirks/Scribble.astro`). `src/assets/fonts/caveat.woff2` is a fixed subset of Caveat SemiBold (OFL) holding printable ASCII (U+0020-007E) and the no-break space (U+00A0). A hand note with any other character fails the build in `Scribble.astro`. The subset was made from Google Fonts' Caveat SemiBold WOFF2 (`caveat-original.woff2` below) with this command, which needs [uv](https://docs.astral.sh/uv/) to fetch the pinned FontTools and Brotli:

```sh
uvx --from fonttools==4.67.0 --with brotli==1.2.1 pyftsubset caveat-original.woff2 \
  --output-file=src/assets/fonts/caveat.woff2 --flavor=woff2 --unicodes=U+0020-007E,U+00A0 \
  --layout-features=kern,liga --name-IDs=0,1,2,3,4,5,6,13,14
```

## Run it locally

You need Node 24 (`.node-version`) and pnpm 11.

```sh
pnpm install
pnpm dev        # http://localhost:4321
```

- `pnpm build` writes the site to `dist/`.
- `pnpm check` typechecks the `.astro` and TypeScript files.
- `pnpm format` formats the TypeScript, JSON, YAML and CSS (oxfmt leaves `.astro` files alone), and `pnpm format:check` checks it without changing anything.

## Deploying

The site deploys to Vercel as a static site, under the `mjarnots-projects` scope, through Vercel's Git integration: framework preset Astro, install command `pnpm install`, build command `pnpm build`, output directory `dist`, Node.js 24. Nothing in this repository deploys it.

The domain is in Cloudflare, which is both the registrar and the DNS host for `dumdummisha.ai` and `dumdummisha.com`. `dumdummisha.com` redirects to `https://dumdummisha.ai` through a Cloudflare redirect rule.
