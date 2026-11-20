// Bakes every public route into its own HTML file after `vite build`.
//
// Each page gets its own title, description, canonical, hreflang, social tags
// and JSON-LD in the HTML that crawlers and link previews (WhatsApp, LinkedIn,
// X) read, instead of every URL serving the homepage's tags. The browser
// bundle still takes over as a normal single-page app once it loads.
//
// Routes come from public/sitemap.xml, the bare "/" homepage and NOINDEX_PATHS below.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const serverDir = join(root, 'dist-server')

const template = readFileSync(join(dist, 'index.html'), 'utf8')

// Unmatched routes (private pilots, typos) fall back to the plain shell, never to a pre-rendered page.
writeFileSync(join(dist, 'app-shell.html'), template)

const sitemap = readFileSync(join(root, 'public', 'sitemap.xml'), 'utf8')
// Pages left out of the sitemap on purpose (they carry noindex) still get their own HTML.
const NOINDEX_PATHS = [
  '/en/demo/lashes',
  '/ar/demo/lashes',
  '/en/dentist-websites',
  '/en/salon-websites',
  '/en/restaurant-booking-websites',
  '/en/gym-websites',
  '/en/website-design-cairo',
  '/en/website-design-dubai',
]
const paths = [
  '/',
  ...[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => new URL(m[1]).pathname),
  ...NOINDEX_PATHS,
]

const { render } = await import(pathToFileURL(join(serverDir, 'entry-server.js')).href)

const headTags = helmet =>
  [helmet.title, helmet.priority, helmet.meta, helmet.link, helmet.script]
    .map(part => part.toString())
    .filter(Boolean)
    .join('\n    ')

let count = 0
for (const path of [...new Set(paths)]) {
  const { html, helmet } = await render(path)
  const fallbackAttrs = path.startsWith('/ar') ? 'lang="ar" dir="rtl"' : 'lang="en" dir="ltr"'
  const htmlAttrs = helmet.htmlAttributes.toString() || fallbackAttrs

  const rootRe = /<div id="root">[\s\S]*<\/div>(\s*<\/body>)/
  if (!rootRe.test(template)) throw new Error('index.html is missing <div id="root"> before </body>')

  const page = template
    .replace(/<html[^>]*>/, () => `<html ${htmlAttrs} class="scroll-smooth">`)
    .replace('</head>', () => `    ${headTags(helmet)}\n  </head>`)
    .replace(rootRe, (_match, end) => `<div id="root">${html}</div>${end}`)

  const file = path === '/' ? join(dist, 'index.html') : join(dist, path, 'index.html')
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, page)
  count += 1
}

rmSync(serverDir, { recursive: true, force: true })
console.log(`Pre-rendered ${count} pages.`)
