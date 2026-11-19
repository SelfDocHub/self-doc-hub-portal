<script setup lang="ts">
const { data: site } = useNuxtData('site')
// Only http(s), mailto and site-relative URLs become links.
const safe = (u: string) => (/^(https?:\/\/|mailto:|\/(?!\/))/i.test(u) ? u : '#')
const external = (u: string) => /^https?:\/\//i.test(u)
</script>

<template>
  <nav v-if="site?.header?.links?.length" aria-label="Links">
    <a
      v-for="(l, i) in site.header.links" :key="i" :href="safe(l.url)"
      :target="external(l.url) ? '_blank' : undefined" rel="noopener noreferrer"
    >{{ l.text }}</a>
  </nav>
</template>
