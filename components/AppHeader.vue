<script setup lang="ts">
defineProps<{ version: string; hasMenu: boolean }>()
const menu = defineModel<boolean>('menu', { default: false })
const { data: site } = useNuxtData('site')
const t = useTexts()
const lang = useLang()
const theme = inject<Ref<'auto' | 'light' | 'dark'>>('theme')!
const route = useRoute()

function setVersion(e: Event) {
  navigateTo('/' + encodeURIComponent((e.target as HTMLSelectElement).value))
}
function setLang(e: Event) {
  lang.value = (e.target as HTMLSelectElement).value
}
function toggleTheme() {
  const dark = document.documentElement.dataset.theme === 'dark'
    || (!document.documentElement.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches)
  theme.value = dark ? 'light' : 'dark'
}
</script>

<template>
  <header class="header">
    <button v-if="hasMenu" class="icon-btn menu-btn" :aria-label="t('site.menu')" @click="menu = !menu">☰</button>
    <NuxtLink to="/" class="brand">
      <img v-if="site?.brand?.logo_top" :src="site.brand.logo_top.url" :alt="site.name" class="logo">
      <span v-else class="brand-name">{{ site?.name }}</span>
    </NuxtLink>
    <a v-if="site?.brand?.logo_top?.link" :href="site.brand.logo_top.link" class="brand-ext" rel="noopener" :title="site.brand.logo_top.link">↗</a>
    <div class="spacer" />
    <SearchBox v-if="version" :version="version" />
    <label v-if="site && site.versions.length > 1" class="select-wrap">
      <span class="sr-only">{{ t('site.version') }}</span>
      <select :value="route.params.version" @change="setVersion">
        <option v-for="v in site.versions" :key="v.id" :value="v.id">{{ v.name }}</option>
      </select>
    </label>
    <label v-if="site && site.languages.length > 1" class="select-wrap">
      <span class="sr-only">{{ t('site.language') }}</span>
      <select :value="lang" @change="setLang">
        <option v-for="l in site.languages" :key="l" :value="l">{{ l.toUpperCase() }}</option>
      </select>
    </label>
    <ClientOnly>
      <button class="icon-btn" :title="theme === 'dark' ? t('site.theme_light') : t('site.theme_dark')" @click="toggleTheme">◐</button>
    </ClientOnly>
  </header>
</template>
