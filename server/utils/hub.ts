import type { H3Event } from 'h3'
import { createError, getCookie, getHeader, getQuery } from 'h3'

export const PREVIEW_COOKIE = 'docs_preview'

/** Strips the scheme-less default ports; docs-hub normalizes the domain the same way. */
function normalizeHost(raw: string): string {
  const host = raw.split(',')[0]!.trim().toLowerCase()
  return host.replace(/:(80|443)$/, '')
}

/** The domain this request is for: the override, X-Forwarded-Host (when trusted) or Host. */
export function resolveDomain(event: H3Event): string {
  const config = useRuntimeConfig(event)
  if (config.domainOverride) return normalizeHost(String(config.domainOverride))
  // Internal SSR calls lose Host (h3 drops it), so the page request passes its domain in this header.
  // The data is public per domain anyway; the header only selects which public site is read.
  const internal = getHeader(event, 'x-portal-domain')
  if (internal) return normalizeHost(internal)
  const forwarded = config.trustProxy ? getHeader(event, 'x-forwarded-host') : undefined
  return normalizeHost(forwarded || getHeader(event, 'host') || '')
}

/** Preview token of the request: `?preview=` (set as a cookie by the middleware) or the cookie itself. */
export function previewToken(event: H3Event): string {
  const internal = getHeader(event, 'x-portal-preview')
  if (internal) return internal
  const query = getQuery(event).preview
  if (typeof query === 'string' && query) return query
  return getCookie(event, PREVIEW_COOKIE) || ''
}

export function hubHeaders(event: H3Event, extra: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { 'X-Public-Domain': resolveDomain(event), Accept: 'application/json', ...extra }
  const token = previewToken(event)
  if (token) headers['X-Preview-Token'] = token
  return headers
}

function hubUrl(event: H3Event, path: string): string {
  return String(useRuntimeConfig(event).docsHubUrl).replace(/\/+$/, '') + '/public/v1' + path
}

/** Calls the docs-hub public API and returns parsed JSON; maps upstream errors to the same status codes. */
export async function hubJson<T>(event: H3Event, path: string, query?: Record<string, string | number | undefined>): Promise<T> {
  try {
    return (await $fetch(hubUrl(event, path), { headers: hubHeaders(event), query, timeout: 10_000 })) as T
  } catch (e: any) {
    const status = e?.response?.status || e?.statusCode
    if (status && status >= 400 && status < 500) {
      throw createError({ statusCode: status, statusMessage: status === 404 ? 'Not Found' : 'Bad Request' })
    }
    console.error('[docs-hub]', path, e?.message || e)
    throw createError({ statusCode: 502, statusMessage: 'Documentation service unavailable' })
  }
}

/** Streams a binary file (logo, picture) from docs-hub to the client, keeping its type and cache headers. */
export async function hubBinary(event: H3Event, path: string, query?: Record<string, string>) {
  let res: Response
  try {
    res = await fetch(hubUrl(event, path) + (query ? '?' + new URLSearchParams(query) : ''), {
      headers: hubHeaders(event, { Accept: '*/*' }),
      signal: AbortSignal.timeout(10_000),
    })
  } catch (e: any) {
    console.error('[docs-hub]', path, e?.message || e)
    throw createError({ statusCode: 502, statusMessage: 'Documentation service unavailable' })
  }
  if (!res.ok) throw createError({ statusCode: res.status === 404 ? 404 : 502, statusMessage: res.status === 404 ? 'Not Found' : 'Bad Gateway' })
  for (const h of ['content-type', 'cache-control', 'etag', 'content-security-policy', 'x-content-type-options']) {
    const v = res.headers.get(h)
    if (v) event.node.res.setHeader(h, v)
  }
  if (!res.headers.get('x-content-type-options')) event.node.res.setHeader('x-content-type-options', 'nosniff')
  // Preview content must never be cached by shared caches.
  if (previewToken(event)) event.node.res.setHeader('cache-control', 'private, no-store')
  return new Uint8Array(await res.arrayBuffer())
}

/** Fetches a text file (robots.txt, llms.txt) from docs-hub and answers with it, keeping the 404 of a disabled file. */
export async function hubText(event: H3Event, path: string, contentType: string, query?: Record<string, string | undefined>): Promise<string> {
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(query || {})) if (v) params.set(k, v)
  let res: Response
  try {
    res = await fetch(hubUrl(event, path) + (params.size ? '?' + params : ''), {
      headers: hubHeaders(event, { Accept: 'text/plain, text/markdown, */*' }),
      signal: AbortSignal.timeout(15_000),
    })
  } catch (e: any) {
    console.error('[docs-hub]', path, e?.message || e)
    throw createError({ statusCode: 502, statusMessage: 'Documentation service unavailable' })
  }
  if (!res.ok) throw createError({ statusCode: res.status === 404 ? 404 : 502, statusMessage: res.status === 404 ? 'Not Found' : 'Bad Gateway' })
  event.node.res.setHeader('content-type', contentType)
  event.node.res.setHeader('cache-control', previewToken(event) ? 'private, no-store' : 'public, max-age=60, stale-while-revalidate=300')
  return await res.text()
}

/** A language code of a request (?lang= or a path prefix); anything else is ignored so docs-hub uses the default. */
export function cleanLang(value: unknown): string | undefined {
  return typeof value === 'string' && /^[a-z]{2,3}(-[A-Za-z0-9]{2,8})?$/.test(value) ? value : undefined
}
