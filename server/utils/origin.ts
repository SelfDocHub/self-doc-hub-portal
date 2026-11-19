import type { H3Event } from 'h3'
import { getHeader } from 'h3'

/** Public origin of the site (for sitemap and canonical links). */
export function siteOrigin(event: H3Event): string {
  const config = useRuntimeConfig(event)
  if (config.siteOrigin) return String(config.siteOrigin).replace(/\/+$/, '')
  const proto = (config.trustProxy && getHeader(event, 'x-forwarded-proto')) || 'http'
  return `${String(proto).split(',')[0]!.trim()}://${resolveDomain(event)}`
}
