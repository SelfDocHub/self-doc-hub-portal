import type { Site, Manifest, ManifestNode } from '~/types/hub'

export function useSite() {
  return useFetch<Site>('/api/site', { key: 'site', $fetch: useApi() })
}

/** Current UI language: ?lang → cookie → site default, limited to the languages of the site. */
export function useLang() {
  const site = useNuxtData<Site>('site').data
  const cookie = useCookie<string>('lang', { maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' })
  return computed({
    get() {
      const langs = site.value?.languages?.length ? site.value.languages : ['en']
      if (cookie.value && langs.includes(cookie.value)) return cookie.value
      return site.value?.default_language || langs[0]!
    },
    set(v: string) { cookie.value = v },
  })
}

export function useTexts() {
  const lang = useLang()
  const { data } = useFetch<Record<string, string>>(() => `/api/i18n/${encodeURIComponent(lang.value)}`, {
    key: 'texts',
    $fetch: useApi(),
    watch: [lang],
    default: () => ({}),
  })
  // Falls back to the key's last segment so a missing text never shows as an empty hole.
  return (key: string, fallback?: string): string => data.value?.[key] ?? fallback ?? key.split('.').pop()!.replace(/_/g, ' ')
}

export function useTree(version: () => string) {
  const api = useApi()
  return useAsyncData<Manifest | null>(
    'tree',
    () => (version() ? api<Manifest>(`/api/tree/${encodeURIComponent(version())}`) : Promise.resolve(null)),
    { watch: [version] },
  )
}

/** Flattens a manifest into id → node (endpoints and pages only). */
export function flattenTree(manifest: Manifest | null | undefined) {
  const map = new Map<string, ManifestNode & { service: string }>()
  const walk = (nodes: ManifestNode[], service: string) => {
    for (const n of nodes) {
      if (n.kind === 'endpoint' || n.kind === 'page') map.set(n.id, { ...n, service })
      if (n.children?.length) walk(n.children, service)
    }
  }
  for (const s of manifest?.services || []) walk(s.tree, s.name)
  return map
}

/** Heading id from text; duplicates get a numeric suffix. */
export function slugify(text: string, used: Set<string>): string {
  const base = text.toLowerCase().trim().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '') || 'section'
  let id = base
  for (let i = 2; used.has(id); i++) id = `${base}-${i}`
  used.add(id)
  return id
}

export const inlinesText = (inlines?: { text: string }[]) => (inlines || []).map(i => i.text).join('')
