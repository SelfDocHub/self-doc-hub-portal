/**
 * $fetch for the portal's own /api routes. During SSR those calls are internal and do not carry the original Host or
 * the preview token of the page request, so they are passed explicitly.
 */
export function useApi() {
  if (import.meta.client) return $fetch
  const event = useRequestEvent()
  const requestFetch = useRequestFetch()
  const extra: Record<string, string> = {}
  if (event?.context.portalDomain) extra['x-portal-domain'] = event.context.portalDomain
  if (event?.context.portalPreview) extra['x-portal-preview'] = event.context.portalPreview
  return ((url: string, opts: any = {}) => requestFetch(url, { ...opts, headers: { ...opts.headers, ...extra } })) as typeof $fetch
}
