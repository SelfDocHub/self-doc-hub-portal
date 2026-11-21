import type { Site, Manifest, ManifestNode } from '~/types/hub'

/**
 * The site in the language of the address (/ru/... → ru; no prefix → the default language). The language is part of the
 * URL, so it only changes with a full page load (see the language picker).
 */
export function useSite() {
  const route = useRoute()
  return useFetch<Site>('/api/site', { key: 'site', $fetch: useApi(), query: { lang: route.params.lang || undefined } })
}

/** Language of the current page (the `language` of the site response). */
export function useLang() {
  const site = useNuxtData<Site>('site').data
  return computed(() => site.value?.language || 'en')
}

/** "" for the default language, "/ru" for the others: the prefix of every address of the current language. */
export function useLangPrefix() {
  const site = useNuxtData<Site>('site').data
  return computed(() => (site.value && site.value.language !== site.value.default_language ? `/${site.value.language}` : ''))
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

/** Title of a page by the site's template ({page}, {site}); without a page it is the name of the site. */
export function formatTitle(site: Site | null | undefined, page?: string): string {
  const name = site?.name || ''
  if (!page) return name
  const template = site?.title_template
  return template && /\{(page|site)\}/.test(template) ? template.replace(/\{page\}/g, page).replace(/\{site\}/g, name) : `${page} — ${name}`
}

/** Title, description and the previews of a page (Open Graph, Twitter/X); the site-wide tags are set in app.vue. */
export function usePageMeta(page: () => { title?: string; description?: string }) {
  const site = useNuxtData<Site>('site').data
  const title = () => formatTitle(site.value, page().title)
  const description = () => page().description || site.value?.description || ''
  useSeoMeta({
    title, description, ogTitle: () => page().title || site.value?.social?.title || site.value?.name, ogDescription: description,
    twitterTitle: () => page().title || site.value?.social?.title || site.value?.name, twitterDescription: description,
  })
}
