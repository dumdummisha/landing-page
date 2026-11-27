// Writes src/styles/tokens.css from src/styles/tokens.json, the design system's token file, keeping only the tokens
// the sources (every .astro and .css file under src except tokens.css) reference:
// - a custom property --name, when the sources contain --name not followed by another name character;
// - every custom property starting with a prefix the sources build a name from, such as --tilt-${tilt}; a name built
//   from --${...} with no prefix fails the script;
// - a type class, when its name appears in the sources as a whole word, so a common word such as body keeps its class;
// - the colour a kept colour token aliases.
// A token name built any other way is not seen and its token is dropped.
// Font families are not written here: astro.config.ts reads them for the fonts API.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

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
const CUSTOM_PROPERTY = /(?<![\w-])--([\w-]*)(\$\{)?/g

const tokens = JSON.parse(readFileSync(SOURCE, 'utf8')) as ITokens
if (tokens.color.themes.length !== 1) {
  throw new Error(`${SOURCE} has ${tokens.color.themes.length} colour themes; only one is supported`)
}

const sources = readdirSync('src', { recursive: true, withFileTypes: true })
  .filter((entry) => entry.isFile() && /\.(astro|css)$/.test(entry.name))
  .map((entry) => join(entry.parentPath, entry.name))
  .filter((file) => file !== TARGET)
  .map((file) => ({ file, text: readFileSync(file, 'utf8') }))

const names = new Set<string>()
const prefixes: string[] = []

for (const { file, text } of sources) {
  for (const [, name, template] of text.matchAll(CUSTOM_PROPERTY)) {
    if (template && !name) {
      throw new Error(`${file} builds a custom property name from --\${...} with no prefix; give it a fixed prefix`)
    }

    if (template) {
      prefixes.push(name)
    } else {
      names.add(name)
    }
  }
}

const allText = sources.map(({ text }) => text).join('\n')
const isReferenced = (name: string): boolean => names.has(name) || prefixes.some((prefix) => name.startsWith(prefix))
const isTypeClassReferenced = (name: string): boolean => new RegExp(`(?<![\\w-])${name}(?![\\w-])`).test(allText)

const colorValues = new Map(tokens.color.tokens.map(({ name, value }) => [name, value]))
const keptColors = new Set([...colorValues.keys()].filter(isReferenced))

// A Set's iteration visits names added during it, so an alias of an alias is kept too.
for (const name of keptColors) {
  const alias = ALIAS.exec(colorValues.get(name)!)
  if (alias) {
    keptColors.add(alias[1])
  }
}

const colors = tokens.color.tokens
  .filter(({ name }) => keptColors.has(name))
  .map(({ name, value }) => {
    const alias = ALIAS.exec(value)

    return `  --${name}: ${alias ? `var(--${alias[1]})` : value};`
  })

const lengths = LENGTH_FAMILIES.flatMap((family) =>
  (tokens[family] as { tokens: IToken[] }).tokens
    .filter(({ name }) => isReferenced(name))
    .map(({ name, value }) => `  --${name}: ${value};`)
)

const typeStyles = tokens.type.groups.flatMap(({ family, styles }) =>
  styles
    .filter(({ name }) => isTypeClassReferenced(name))
    .map(({ name, fontSize, lineHeight, fontWeight, letterSpacing, textTransform }) => {
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
