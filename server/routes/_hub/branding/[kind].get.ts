export default defineEventHandler((event) => {
  const kind = getRouterParam(event, 'kind') || ''
  if (!['logo_top', 'logo_bottom', 'favicon'].includes(kind)) throw createError({ statusCode: 404 })
  return hubBinary(event, `/branding/${kind}`)
})
