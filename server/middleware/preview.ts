import { getQuery, setCookie } from 'h3'
import { PREVIEW_COOKIE, previewToken, resolveDomain } from '../utils/hub'

// Resolves the domain and preview token once per request. `?preview=<token>` opens a hidden version: the token is
// kept in a cookie for the (one-hour) lifetime of the token, and handed to SSR data calls through the context.
export default defineEventHandler((event) => {
  const query = getQuery(event).preview
  if (typeof query === 'string' && query && query.length < 2048) {
    setCookie(event, PREVIEW_COOKIE, query, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 3600 })
  }
  event.context.portalDomain = resolveDomain(event)
  event.context.portalPreview = previewToken(event)
})
