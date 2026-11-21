<script setup lang="ts">
import type { Tokens } from '~/types/hub'

const route = useRoute()
const { data: site, error } = await useSite()
if (error.value || !site.value) {
  throw createError({ statusCode: error.value?.statusCode || 502, statusMessage: error.value?.statusMessage || 'Unavailable', fatal: true })
}

// The language prefix of the address: the default language lives without one (its prefixed address is redirected),
// a language the site does not have is a 404 (docs-hub would answer with the default one).
const urlLang = route.params.lang as string | undefined
if (urlLang) {
  if (urlLang === site.value.default_language) {
    await navigateTo(route.fullPath.replace(/^\/[^/?#]+/, '') || '/', { redirectCode: 301, replace: true })
  } else if (urlLang !== site.value.language) {
    throw createError({ statusCode: 404, statusMessage: 'Not Found', fatal: true })
  }
}
// Back/forward between languages is a client navigation; reload so the texts are those of the new language.
if (import.meta.client) {
  watch(() => route.params.lang, (value) => {
    if (((value as string) || site.value!.default_language) !== site.value!.language) reloadNuxtApp({ path: route.fullPath, persistState: false })
  })
}

const lang = useLang()
const prefix = useLangPrefix()
const theme = useCookie<'auto' | 'light' | 'dark'>('theme', { default: () => 'auto', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' })
provide('theme', theme)

const FONTS: Record<string, string> = {
  system: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  inter: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  roboto: 'Roboto, system-ui, -apple-system, "Segoe UI", Arial, sans-serif',
  'source-sans': '"Source Sans 3", "Source Sans Pro", system-ui, "Segoe UI", sans-serif',
  serif: 'Georgia, "Times New Roman", Times, serif',
}
const RADII: Record<string, string> = { none: '0', small: '3px', medium: '6px', large: '12px' }
const WEIGHTS: Record<string, number> = { normal: 400, medium: 500, bold: 700 }
const underline = (v?: string) => (v === 'underline' ? 'underline' : 'none')
const COLOR = /^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/

function scheme(colors?: Record<string, string>) {
  return Object.entries(colors || {})
    .filter(([k, v]) => /^[a-z0-9_]+$/.test(k) && COLOR.test(v))
    .map(([k, v]) => `--c-${k.replace(/_/g, '-')}:${v};`)
    .join('')
}

function css(t: Tokens, headerHeight?: number) {
  const base = [
    `--font:${FONTS[t.font || 'system'] || FONTS.system};`,
    `--radius:${RADII[t.radius || 'medium'] ?? '6px'};`,
    `--space:${t.density === 'compact' ? 0.75 : 1};`,
    `--content-width:${Math.min(1800, Math.max(880, t.content_width || 1200))}px;`,
    `--font-size:${Math.min(20, Math.max(13, t.font_size || 16))}px;`,
    // Link styles of the top bar and the footer: normal state and hover; an unset hover value repeats the normal one.
    ...(['header', 'footer'] as const).map((area) => {
      const get = (name: string) => (t as any)[`${area}_link_${name}`]
      const size = (v: unknown, fallback: number) => Math.min(24, Math.max(12, Number(v) || fallback))
      const normal = { deco: underline(get('underline') ?? 'none'), weight: WEIGHTS[get('weight')] || (area === 'header' ? 500 : 400), size: size(get('size'), area === 'header' ? 15 : 14) }
      const hover = {
        deco: get('hover_underline') ? underline(get('hover_underline')) : normal.deco,
        weight: WEIGHTS[get('hover_weight')] || normal.weight,
        size: get('hover_size') ? size(get('hover_size'), normal.size) : normal.size,
      }
      return `--${area}-link-deco:${normal.deco};--${area}-link-weight:${normal.weight};--${area}-link-size:${normal.size}px;`
        + `--${area}-link-hover-deco:${hover.deco};--${area}-link-hover-weight:${hover.weight};--${area}-link-hover-size:${hover.size}px;`
    }),
    `--header-h:${Math.min(120, Math.max(40, Math.round(headerHeight || 64)))}px;`,
  ].join('')
  const light = scheme(t.light), dark = scheme(t.dark)
  return `:root{${base}${light}color-scheme:light}`
    + `@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){${dark}color-scheme:dark}}`
    + `:root[data-theme="dark"]{${dark}color-scheme:dark}`
    + `:root[data-theme="light"]{${light}color-scheme:light}`
}

// Counters: only identifiers come from docs-hub, the scripts are the portal's own; ids are checked before use.
const GA = /^(G|GT|AW|UA)-[A-Z0-9-]{4,24}$/
const YM = /^\d{4,12}$/
function counters() {
  const s = site.value!
  // A hidden version opened with a preview token is not counted.
  if (s.versions.some(v => v.hidden)) return []
  const out: any[] = []
  const ga = s.analytics?.google_analytics?.trim()
  if (ga && GA.test(ga)) {
    out.push({ key: 'ga', src: `https://www.googletagmanager.com/gtag/js?id=${ga}`, async: true })
    out.push({ key: 'ga-init', innerHTML: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${ga}');` })
  }
  const ym = s.analytics?.yandex_metrika?.trim()
  if (ym && YM.test(ym)) {
    out.push({
      key: 'ym',
      innerHTML: `(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,'script','https://mc.yandex.ru/metrika/tag.js','ym');ym(${ym},'init',{clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:false});`,
    })
  }
  return out
}

/** Address of the current page in another language (or without a prefix for the default one). */
function pageUrl(origin: string, code: string | null) {
  const s = site.value!
  const cur = prefix.value
  const path = cur && route.path.startsWith(cur) ? route.path.slice(cur.length) || '/' : route.path
  return origin + (code && code !== s.default_language ? `/${code}` : '') + (path === '/' && code && code !== s.default_language ? '' : path)
}

const favicon = site.value.brand?.favicon
useHead(() => {
  const s = site.value!
  const origin = s.origin || ''
  const multi = s.languages.length > 1
  return {
    htmlAttrs: { lang: lang.value, 'data-theme': theme.value === 'auto' ? undefined : theme.value },
    style: [{ key: 'tokens', innerHTML: css(s.tokens || {}, s.header?.height) }],
    link: [
      ...(favicon ? [{ rel: 'icon', href: favicon.url, type: favicon.content_type }] : []),
      { rel: 'canonical', href: pageUrl(origin, s.language) },
      ...(multi
        ? [...s.languages.map(l => ({ rel: 'alternate', hreflang: l.code, href: pageUrl(origin, l.code) })), { rel: 'alternate', hreflang: 'x-default', href: pageUrl(origin, null) }]
        : []),
    ],
    meta: [
      ...(s.noindex ? [{ name: 'robots', content: 'noindex, nofollow' }] : []),
      ...(s.keywords?.length ? [{ name: 'keywords', content: s.keywords.join(', ') }] : []),
      ...(s.verification?.google ? [{ name: 'google-site-verification', content: s.verification.google }] : []),
      ...(s.verification?.yandex ? [{ name: 'yandex-verification', content: s.verification.yandex }] : []),
      ...(s.verification?.bing ? [{ name: 'msvalidate.01', content: s.verification.bing }] : []),
    ],
    script: counters(),
  }
})

const social = site.value.social
const imageUrl = (origin: string) => (social?.image ? origin + social.image.url : undefined)
useSeoMeta({
  title: () => formatTitle(site.value),
  description: () => site.value!.description || '',
  ogSiteName: () => site.value!.name,
  ogType: 'website',
  ogLocale: () => site.value!.language.replace('-', '_'),
  ogUrl: () => pageUrl(site.value!.origin || '', site.value!.language),
  ogTitle: () => site.value!.social?.title || site.value!.name,
  ogDescription: () => site.value!.social?.description || site.value!.description || '',
  ogImage: () => imageUrl(site.value!.origin || ''),
  ogImageType: () => site.value!.social?.image?.content_type as 'image/png' | 'image/jpeg' | 'image/gif' | undefined,
  twitterCard: () => (site.value!.social?.image && site.value!.social.card_type !== 'summary' ? 'summary_large_image' : 'summary'),
  twitterSite: () => site.value!.social?.twitter_site || undefined,
  twitterTitle: () => site.value!.social?.title || site.value!.name,
  twitterDescription: () => site.value!.social?.description || site.value!.description || '',
  twitterImage: () => imageUrl(site.value!.origin || ''),
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
