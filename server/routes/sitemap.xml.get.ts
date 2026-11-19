import type { Site, SearchEntry } from '~/types/hub'
import { siteOrigin } from '../utils/origin'

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// Sitemap of the default version (hidden versions are never listed).
export default defineEventHandler(async (event) => {
  const site = await hubJson<Site>(event, '/site')
  const origin = siteOrigin(event)
  const version = site.versions.find(v => !v.hidden && v.id === site.default_version)
  let urls = ''
  if (version) {
    const map = await hubJson<{ updated_at: string; entries: SearchEntry[] }>(event, `/versions/${encodeURIComponent(version.id)}/sitemap`)
    const lastmod = map.updated_at ? `<lastmod>${esc(map.updated_at)}</lastmod>` : ''
    urls = map.entries
      .map(e => `<url><loc>${esc(`${origin}/${encodeURIComponent(version.id)}/${encodeURIComponent(e.id)}`)}</loc>${lastmod}</url>`)
      .join('')
  }
  setResponseHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`
})
