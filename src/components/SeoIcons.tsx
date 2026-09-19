import { useLayoutEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'

function keepLast(selector: string, key: (el: Element) => string) {
  const nodes = [...document.head.querySelectorAll(selector)]
  const last = new Map<string, Element>()
  for (const node of nodes) last.set(key(node), node)
  for (const node of nodes) {
    if (last.get(key(node)) !== node) node.remove()
  }
}

function collapseHead() {
  keepLast('meta[name="description"]', () => 'description')
  keepLast('meta[property="og:description"]', () => 'og:description')
  keepLast('meta[name="twitter:description"]', () => 'twitter:description')
  keepLast('meta[property="og:title"]', () => 'og:title')
  keepLast('meta[name="twitter:title"]', () => 'twitter:title')
  keepLast('meta[property="og:url"]', () => 'og:url')
  keepLast('link[rel="canonical"]', () => 'canonical')
  keepLast('link[rel="alternate"][hreflang]', el => el.getAttribute('hreflang') || '')
  keepLast('link[rel="icon"]', el => `${el.getAttribute('type') || ''}|${el.getAttribute('sizes') || ''}`)
  keepLast('link[rel="apple-touch-icon"]', () => 'apple-touch-icon')
}

/** A-arrow mark only — never the old MB or funnel tile. Also collapse SPA duplicate meta/hreflang. */
export default function SeoIcons() {
  const { pathname } = useLocation()

  useLayoutEffect(() => {
    collapseHead()
    const ids = [0, 50].map(ms => window.setTimeout(collapseHead, ms))
    return () => ids.forEach(id => window.clearTimeout(id))
  }, [pathname])

  return (
    <Helmet>
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    </Helmet>
  )
}
