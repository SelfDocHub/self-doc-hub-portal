import type { Site, SitemapResponse } from '~/types/hub'
import { siteOrigin } from '../utils/origin'
import { nodeUrl } from '~/utils/nodeUrl'

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// Sitemap of the default version: one <url> per page and language, each with hreflang alternates and x-default
// (the address without a prefix). Hidden versions are never listed.
export default defineEventHandler(async (event) => {
  const site = await hubJson<Site>(event, '/site')
  const origin = siteOrigin(event)
  const version = site.versions.find(v => !v.hidden && v.id === site.default_version)
  let urls = ''
  if (version) {
    const map = await hubJson<SitemapResponse>(event, `/versions/${encodeURIComponent(version.id)}/sitemap`)
    const languages = map.languages?.length ? map.languages : [{ code: map.default_language || site.default_language, prefix: '' }]
    const lastmod = map.updated_at ? `<lastmod>${esc(map.updated_at)}</lastmod>` : ''
    for (const e of map.entries) {
      const path = nodeUrl(version.id, e)
      const alternates = languages.length > 1
        ? languages.map(l => `<xhtml:link rel="alternate" hreflang="${esc(l.code)}" href="${esc(origin + l.prefix + path)}"/>`).join('')
          + `<xhtml:link rel="alternate" hreflang="x-default" href="${esc(origin + path)}"/>`
        : ''
      for (const l of languages) urls += `<url><loc>${esc(origin + l.prefix + path)}</loc>${lastmod}${alternates}</url>`
    }
  }
  setResponseHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls}</urlset>`
})
