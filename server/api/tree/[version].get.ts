import type { Manifest } from '~/types/hub'

export default defineEventHandler((event) => {
  const version = encodeURIComponent(getRouterParam(event, 'version') || '')
  return hubJson<Manifest>(event, `/versions/${version}/tree`)
})
