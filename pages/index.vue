<script setup lang="ts">
const { data: site } = useNuxtData('site')
const t = useTexts()
const target = site.value?.default_version
if (target) await navigateTo(`/${encodeURIComponent(target)}`, { redirectCode: 302, replace: true })
</script>

<template>
  <div class="content narrow">
    <h1>{{ site?.name }}</h1>
    <p v-if="site?.description">{{ site.description }}</p>
    <p class="muted">{{ t('site.not_found') }}</p>
  </div>
</template>
