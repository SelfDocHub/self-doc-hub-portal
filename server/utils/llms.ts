import type { H3Event } from 'h3'

/** llms.txt / llms-full.txt: Markdown for language models; ?version= picks a version, the language is a path prefix. */
export function llmsFile(event: H3Event, file: 'llms.txt' | 'llms-full.txt') {
  const query = getQuery(event)
  const lang = cleanLang(getRouterParam(event, 'lang')) || cleanLang(query.lang)
  const version = typeof query.version === 'string' && /^[A-Za-z0-9_-]{1,64}$/.test(query.version) ? query.version : undefined
  return hubText(event, `/${file}`, 'text/markdown; charset=utf-8', { version, lang })
}
