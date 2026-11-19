export default defineEventHandler((event) => {
  const version = encodeURIComponent(getRouterParam(event, 'version') || '')
  const asset = encodeURIComponent(getRouterParam(event, 'asset') || '')
  return hubBinary(event, `/versions/${version}/assets/${asset}`)
})
