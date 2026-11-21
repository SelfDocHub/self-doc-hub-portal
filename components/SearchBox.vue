<script setup lang="ts">
import type { SearchResponse } from '~/types/hub'
import type { UrlNode } from '~/utils/nodeUrl'
const props = defineProps<{ version: string }>()
const t = useTexts()
const q = ref('')
const open = ref(false)
const results = ref<SearchResponse['results']>([])
const searched = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined
let seq = 0

watch(q, (value) => {
  clearTimeout(timer)
  if (value.trim().length < 2) { results.value = []; searched.value = false; return }
  timer = setTimeout(async () => {
    const mine = ++seq
    try {
      const res = await $fetch<SearchResponse>(`/api/search/${encodeURIComponent(props.version)}`, { query: { q: value.trim() } })
      if (mine === seq) { results.value = res.results; searched.value = true }
    } catch {
      if (mine === seq) { results.value = []; searched.value = true }
    }
  }, 250)
})
watch(() => useRoute().fullPath, () => { open.value = false; q.value = '' })
const prefix = useLangPrefix()
const link = (r: UrlNode) => nodeUrl(props.version, r, prefix.value)
</script>

<template>
  <div class="search" @focusout="(e: FocusEvent) => { if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) open = false }">
    <input
      v-model="q" type="search" :placeholder="t('site.search_placeholder')" :aria-label="t('site.search_placeholder')"
      autocomplete="off" @focus="open = true" @keydown.esc="open = false"
    >
    <div v-if="open && searched" class="search-results">
      <p v-if="!results.length" class="muted">{{ t('site.search_no_results') }}</p>
      <NuxtLink v-for="r in results" :key="r.id" :to="link(r)" class="search-item">
        <span class="search-head">
          <MethodBadge v-if="r.method" :method="r.method" small />
          <strong>{{ r.title }}</strong>
        </span>
        <span v-if="r.path" class="muted mono">{{ r.path }}</span>
        <span v-else-if="r.summary" class="muted">{{ r.summary }}</span>
        <span class="muted small">{{ r.service }}</span>
      </NuxtLink>
    </div>
  </div>
</template>
