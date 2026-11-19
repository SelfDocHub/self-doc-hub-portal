import type { SearchResponse } from '~/types/hub'

export default defineEventHandler((event) => {
  const version = encodeURIComponent(getRouterParam(event, 'version') || '')
  const q = String(getQuery(event).q || '').trim().slice(0, 200)
  if (q.length < 2) return { query: q, total: 0, results: [] } satisfies SearchResponse
  return hubJson<SearchResponse>(event, `/versions/${version}/search`, { q, limit: 20 })
})
