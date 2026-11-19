<script setup lang="ts">
import type { PBlock, PPage } from '~/types/hub'
const props = defineProps<{ page: PPage; version: string }>()

// Ids for headings (shared with the "on this page" list). The page title is the h1, so a leading h1 block is shown as h2.
const model = computed(() => {
  const used = new Set<string>()
  const ids = new Map<PBlock, string>()
  const toc: { id: string; text: string; level: number }[] = []
  const blocks = props.page.blocks.map((b) => {
    if (b.kind !== 'heading') return b
    const copy = { ...b, level: Math.max(2, b.level || 2) }
    const id = slugify(inlinesText(b.inlines), used)
    ids.set(copy, id)
    if (copy.level <= 3) toc.push({ id, text: inlinesText(b.inlines), level: copy.level })
    return copy
  })
  return { blocks, ids, toc }
})
</script>

<template>
  <div class="doc-grid">
    <article class="content">
      <p class="muted small">{{ page.service }}</p>
      <h1>{{ page.title }}</h1>
      <Blocks :blocks="model.blocks" :ids="model.ids" :version="version" />
    </article>
    <OnThisPage :items="model.toc" />
  </div>
</template>
