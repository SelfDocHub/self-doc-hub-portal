export default defineEventHandler((event) => {
  const v = getQuery(event).v
  return hubBinary(event, '/social-image', typeof v === 'string' ? { v } : undefined)
})
