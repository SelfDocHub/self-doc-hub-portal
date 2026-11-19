// Pretty URLs of documentation nodes: /{version}/{id}/{slug}. Only {id} is looked up; the slug is decoration
// (method + path / RPC method / queue, or the title of a page) and is replaced by the canonical one when it differs.
export interface UrlNode { id: string; kind?: string; title?: string; method?: string; path?: string }

const slugOf = (text: string) =>
  text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '')

export function nodeSlug(n: UrlNode): string {
  const raw = n.kind === 'page' ? (n.title || '') : [n.method, n.path].filter(Boolean).join(' ') || n.title || ''
  return slugOf(raw).slice(0, 80).replace(/-+$/g, '')
}

export function nodeUrl(version: string, n: UrlNode): string {
  const slug = nodeSlug(n)
  return `/${encodeURIComponent(version)}/${encodeURIComponent(n.id)}${slug ? '/' + encodeURIComponent(slug) : ''}`
}
