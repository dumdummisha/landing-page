// Writes src/styles/tokens.css from src/styles/tokens.json, the design system's token file.
// Font families are not written here: astro.config.ts reads them for the fonts API.
import { readFileSync, writeFileSync } from 'node:fs'

interface IToken {
  name: string
  value: string
}

interface ITypeStyle {
  name: string
  fontSize: string
  lineHeight: string
  fontWeight: number
  letterSpacing?: string
  textTransform?: string
}

interface ITokens {
  color: { themes: { id: string }[]; tokens: IToken[] }
  type: { groups: { family: string; styles: ITypeStyle[] }[] }
  [family: string]: unknown
}

const SOURCE = 'src/styles/tokens.json'
const TARGET = 'src/styles/tokens.css'
const LENGTH_FAMILIES = ['spacing', 'radius', 'tilt', 'size']
const ALIAS = /^\{(.+)\}$/

const tokens = JSON.parse(readFileSync(SOURCE, 'utf8')) as ITokens

if (tokens.color.themes.length !== 1) {
  throw new Error(`${SOURCE} has ${tokens.color.themes.length} colour themes; only one is supported`)
}

const colors = tokens.color.tokens.map(({ name, value }) => {
  const alias = ALIAS.exec(value)

  return `  --${name}: ${alias ? `var(--${alias[1]})` : value};`
})

const lengths = LENGTH_FAMILIES.flatMap((family) =>
  (tokens[family] as { tokens: IToken[] }).tokens.map(({ name, value }) => `  --${name}: ${value};`)
)

const typeStyles = tokens.type.groups.flatMap(({ family, styles }) =>
  styles.map(({ name, fontSize, lineHeight, fontWeight, letterSpacing, textTransform }) => {
    const spacing = letterSpacing ? ` letter-spacing: ${letterSpacing};` : ''
    const transform = textTransform ? ` text-transform: ${textTransform};` : ''

    return `.${name} { font: ${fontWeight} ${fontSize}/${lineHeight} var(--font-${family});${spacing}${transform} }`
  })
)

const css = [
  `/* Generated from ${SOURCE} by scripts/tokens.ts. */`,
  ':root {',
  ...colors,
  ...lengths,
  '}',
  ...typeStyles,
]

writeFileSync(TARGET, `${css.join('\n')}\n`)
