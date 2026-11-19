import { siteOrigin } from '../utils/origin'

export default defineEventHandler((event) => {
  setResponseHeader(event, 'content-type', 'text/plain; charset=utf-8')
  return `User-agent: *\nAllow: /\nSitemap: ${siteOrigin(event)}/sitemap.xml\n`
})
