<script setup lang="ts">
const route = useRoute()
const t = useTexts()
const { data: site } = useNuxtData('site')
const version = computed(() => (route.params.version as string) || '')
const menuOpen = ref(false)
watch(() => route.fullPath, () => { menuOpen.value = false })
const tree = await useTree(() => version.value)
</script>

<template>
  <div class="shell">
    <AppHeader v-model:menu="menuOpen" :version="version" :has-menu="!!version" />
    <div v-if="site?.versions?.find((v: any) => v.hidden)" class="preview-banner">{{ t('site.preview_banner') }}</div>
    <div class="body">
      <aside v-if="version" class="sidebar" :class="{ open: menuOpen }" :aria-label="t('site.menu')">
        <HeaderLinks class="header-links-mobile" />
        <NavTree v-if="tree.data.value" :manifest="tree.data.value" :version="version" />
      </aside>
      <div v-if="menuOpen" class="scrim" @click="menuOpen = false" />
      <main class="main"><slot /></main>
    </div>
    <AppFooter />
  </div>
</template>
