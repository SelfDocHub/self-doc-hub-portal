import type { Site } from '~/types/hub'

export default defineEventHandler(async (event) => {
  const site = await hubJson<Site>(event, '/site')
  // Branding URLs point at docs-hub; the browser must go through this portal instead.
  for (const image of Object.values(site.brand || {})) {
    if (image) image.url = image.url.replace('/public/v1/branding/', '/_hub/branding/')
  }
  setResponseHeader(event, 'cache-control', previewToken(event) ? 'private, no-store' : 'public, max-age=30')
  return site
})
