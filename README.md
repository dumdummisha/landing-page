# Dumdum Misha website

The website at [dumdummisha.ai](https://dumdummisha.ai): the landing page for Dumdum Misha, a Slack clone of a developer that runs on the user's Mac, in the Misha app, on their own Claude Code. The app itself lives in `dumdummisha/misha-desktop`. This repository is only the website, a static Astro build with no server, no database and no client-side JavaScript of its own.

It has three pages:

- `/` (`src/pages/index.astro`): the landing page, one component per section in `src/components/landing/`. Its call to action, "Ask for an invite", is an email to Michal (`src/components/landing/InviteButton.astro`), since Misha is invite only.
- `/privacy` (`src/pages/privacy.astro`): what the Misha app keeps on the user's Mac and who else is involved.
- `404.html` (`src/pages/404.astro`): the page for any address that doesn't exist.

## Layout

- `src/components/`: one folder per part of the design system (`actions`, `band`, `chat`, `marketing`, `mascot`, `navigation`, `quirks`, `shell`, `status`), `Icon.astro` with the icon set in `icons.json`, and `landing/`, where each section holds its own copy.
- `src/layouts/`: `Base` (the head, Open Graph tags, favicons and fonts) and `Canvas` (the yellow page the privacy and not-found pages sit on).
- `src/styles/`: `tokens.json`, a copy of the design system's tokens, and `site.css`, the styles every page shares. Each component's own styles are a `<style>` in its `.astro` file.
- `scripts/`: `tokens.ts` writes `src/styles/tokens.css` (gitignored) from `tokens.json`; `fonts.ts` keeps the handwriting font in step with the site's characters.
- `public/`: the favicons, the web manifest, the Open Graph image and Caveat's OFL license.

The design system is an artifact on claude.ai. `tokens.json`, `icons.json` and the favicons are copies of it and are never edited here.

## Fonts

The display, sans and mono families come from Google Fonts through Astro's fonts API (`astro.config.ts`), which downloads them at build time, so a build needs network access to Google Fonts. Caveat, the handwriting font, is local: `src/assets/fonts/` holds its original WOFF2 and a subset with printable ASCII plus every non-ASCII character in the `.astro` sources. `dev`, `build` and `check` fail when that character set changes. `pnpm fonts` regenerates the subset and its manifest; it needs [uv](https://docs.astral.sh/uv/), which fetches the pinned FontTools and Brotli versions.

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
