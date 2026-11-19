<script setup lang="ts">
import type { Tokens } from '~/types/hub'

const { data: site, error } = await useSite()
if (error.value || !site.value) {
  throw createError({ statusCode: error.value?.statusCode || 502, statusMessage: error.value?.statusMessage || 'Unavailable', fatal: true })
}
const lang = useLang()
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
// underline: [normally, on hover]
const UNDERLINES: Record<string, [string, string]> = { none: ['none', 'none'], hover: ['none', 'underline'], always: ['underline', 'underline'] }
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
    ...(['header', 'footer'] as const).map((area) => {
      const [deco, decoHover] = UNDERLINES[(t as any)[`${area}_link_underline`]] || UNDERLINES.hover!
      const size = Math.min(24, Math.max(12, Number((t as any)[`${area}_link_size`]) || (area === 'header' ? 15 : 14)))
      const weight = WEIGHTS[(t as any)[`${area}_link_weight`]] || 400
      return `--${area}-link-deco:${deco};--${area}-link-deco-hover:${decoHover};--${area}-link-size:${size}px;--${area}-link-weight:${weight};`
    }),
    `--header-h:${Math.min(120, Math.max(40, Math.round(headerHeight || 64)))}px;`,
  ].join('')
  const light = scheme(t.light), dark = scheme(t.dark)
  return `:root{${base}${light}color-scheme:light}`
    + `@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){${dark}color-scheme:dark}}`
    + `:root[data-theme="dark"]{${dark}color-scheme:dark}`
    + `:root[data-theme="light"]{${light}color-scheme:light}`
}

const favicon = site.value.brand?.favicon
useHead(() => ({
  htmlAttrs: { lang: lang.value, 'data-theme': theme.value === 'auto' ? undefined : theme.value },
  style: [{ key: 'tokens', innerHTML: css(site.value!.tokens || {}, site.value!.header?.height) }],
  link: favicon ? [{ rel: 'icon', href: favicon.url, type: favicon.content_type }] : [],
}))
useSeoMeta({
  title: () => site.value!.name,
  description: () => site.value!.description || '',
  ogSiteName: () => site.value!.name,
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
