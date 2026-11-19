export default defineEventHandler((event) => {
  const lang = encodeURIComponent(getRouterParam(event, 'lang') || '')
  return hubJson<Record<string, string>>(event, `/i18n/${lang}`)
})
