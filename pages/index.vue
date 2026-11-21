<script setup lang="ts">
// "/" (and "/{lang}") open the default version of the site.
definePageMeta({ path: '/:lang([a-z]{2,3}|[a-z]{2,3}-[A-Za-z0-9]{2,8})?' })
const { data: site } = useNuxtData('site')
const prefix = useLangPrefix()
const t = useTexts()
const target = site.value?.default_version
if (target) await navigateTo(`${prefix.value}/${encodeURIComponent(target)}`, { redirectCode: 302, replace: true })
</script>

<template>
  <div class="content narrow">
    <h1>{{ site?.name }}</h1>
    <p v-if="site?.description">{{ site.description }}</p>
    <p class="muted">{{ t('site.not_found') }}</p>
  </div>
</template>
