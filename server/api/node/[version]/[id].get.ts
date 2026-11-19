import type { PEndpoint, PPage } from '~/types/hub'

// kind=endpoint|page is decided by the caller from the tree.
export default defineEventHandler((event) => {
  const version = encodeURIComponent(getRouterParam(event, 'version') || '')
  const id = encodeURIComponent(getRouterParam(event, 'id') || '')
  const kind = getQuery(event).kind === 'page' ? 'pages' : 'endpoints'
  return hubJson<PEndpoint | PPage>(event, `/versions/${version}/${kind}/${id}`)
})
