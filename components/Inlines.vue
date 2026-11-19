<script setup lang="ts">
import type { PInline } from '~/types/hub'
defineProps<{ items?: PInline[] }>()
// Only http(s), mailto and relative links are rendered as links.
const safe = (u: string) => (/^(https?:\/\/|mailto:|\/|#)/i.test(u) ? u : '')
const external = (u: string) => /^https?:\/\//i.test(u)
</script>

<template>
  <template v-for="(i, k) in items || []" :key="k">
    <a v-if="i.link && safe(i.link)" :href="safe(i.link)" :target="external(i.link) ? '_blank' : undefined" rel="noopener noreferrer"
      :class="{ code: i.code }"><Fmt :i="i" /></a>
    <Fmt v-else :i="i" />
  </template>
</template>
