// Keeps Caveat limited to the characters the site can render. Regeneration needs uv; dev, check and build only compare
// the manifest, so the generated font and the production image need no Python or FontTools.
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const SOURCE = 'src/assets/fonts/caveat-original.woff2'
const TARGET = 'src/assets/fonts/caveat.woff2'
const MANIFEST = 'src/assets/fonts/caveat-unicodes.txt'

const astroFiles = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)

    if (entry.isDirectory()) {
      return astroFiles(path)
    }

    return entry.isFile() && path.endsWith('.astro') ? [path] : []
  })

const codepoints = new Set<number>()

for (let codepoint = 0x20; codepoint <= 0x7e; codepoint += 1) {
  codepoints.add(codepoint)
}

codepoints.add(0xa0)

for (const file of astroFiles('src')) {
  for (const character of readFileSync(file, 'utf8')) {
    const codepoint = character.codePointAt(0)
    if (codepoint !== undefined && codepoint > 0x7f) {
      codepoints.add(codepoint)
    }
  }
}

const unicodes = [...codepoints]
  .sort((left, right) => left - right)
  .map((codepoint) => `U+${codepoint.toString(16).toUpperCase().padStart(4, '0')}`)

const manifest = `${unicodes.join('\n')}\n`

if (process.argv[2] === '--write') {
  execFileSync(
    'uvx',
    [
      '--from',
      'fonttools==4.67.0',
      '--with',
      'brotli==1.2.1',
      'pyftsubset',
      SOURCE,
      `--output-file=${TARGET}`,
      '--flavor=woff2',
      `--unicodes=${unicodes.join(',')}`,
      '--layout-features=kern,liga',
      '--name-IDs=0,1,2,3,4,5,6,13,14',
    ],
    { stdio: 'inherit' }
  )

  writeFileSync(MANIFEST, manifest)
} else if (process.argv[2] !== undefined) {
  throw new Error(`Unknown argument ${process.argv[2]}; use --write to regenerate the font`)
} else if (!existsSync(MANIFEST) || readFileSync(MANIFEST, 'utf8') !== manifest) {
  throw new Error('The site characters changed without regenerating Caveat; run pnpm fonts')
}
