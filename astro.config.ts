import { defineConfig, fontProviders } from 'astro/config'
import tokens from './src/styles/tokens.json' with { type: 'json' }

// Google serves a range as one variable font and a single weight as a smaller static one; each entry covers every
// weight tokens.json and the components use for that family.
const WEIGHTS: Record<string, [string | number, ...(string | number)[]]> = {
  display: [600],
  sans: ['400 800'],
  mono: ['400 700'],
  hand: [600],
}

// A family in tokens.json is a CSS font stack: the first face comes from Google Fonts, the rest are its fallbacks.
const googleFonts = Object.entries(tokens.type.families)
  .filter(([family]) => family !== 'hand')
  .map(([family, stack]) => {
    const [name, ...fallbacks] = stack.split(',').map((face) => face.trim().replaceAll('"', ''))

    if (!WEIGHTS[family]) {
      throw new Error(`No weights configured for the "${family}" font family`)
    }

    return {
      provider: fontProviders.google(),
      name,
      cssVariable: `--font-${family}`,
      fallbacks,
      weights: WEIGHTS[family],
    }
  })

const handOptions = {
  variants: [{ src: ['./src/assets/fonts/caveat.woff2'], weight: 600, style: 'normal' }],
} satisfies { variants: [{ src: [string]; weight: number; style: 'normal' }] }

const [handName, ...handFallbacks] = tokens.type.families.hand.split(',').map((face) => face.trim().replaceAll('"', ''))

const handFont = {
  provider: fontProviders.local(),
  name: handName,
  cssVariable: '--font-hand',
  fallbacks: handFallbacks,
  weights: WEIGHTS.hand,
  options: handOptions,
}

export default defineConfig({
  output: 'static',
  fonts: [handFont, ...googleFonts],
})
