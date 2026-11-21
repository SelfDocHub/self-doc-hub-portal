export default defineEventHandler((event) => {
  if (!cleanLang(getRouterParam(event, 'lang'))) throw createError({ statusCode: 404 })
  return llmsFile(event, 'llms.txt')
})
