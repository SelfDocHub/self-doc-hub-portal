import type { Site } from '~/types/hub'
import { siteOrigin } from '../utils/origin'

export default defineEventHandler(async (event) => {
  const site = await hubJson<Site>(event, '/site', { lang: cleanLang(getQuery(event).lang) })
  // Picture URLs point at docs-hub; the browser must go through this portal instead.
  for (const image of Object.values(site.brand || {})) {
    if (image) image.url = image.url.replace('/public/v1/branding/', '/_hub/branding/')
  }
  if (site.social?.image) site.social.image.url = site.social.image.url.replace('/public/v1/social-image', '/_hub/social-image')
  site.origin = siteOrigin(event)
  setResponseHeader(event, 'cache-control', previewToken(event) ? 'private, no-store' : 'public, max-age=30')
  return site
})
