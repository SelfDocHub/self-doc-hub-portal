<script setup lang="ts">
import type { PBlock } from '~/types/hub'
const props = defineProps<{ blocks?: PBlock[]; version: string; ids?: Map<PBlock, string> }>()

// Consecutive list items are grouped so they read as one list.
type Item = { block: PBlock } | { list: PBlock[] }
const items = computed<Item[]>(() => {
  const out: Item[] = []
  for (const b of props.blocks || []) {
    const last = out[out.length - 1]
    if (b.kind === 'list_item') {
      if (last && 'list' in last) last.list.push(b)
      else out.push({ list: [b] })
    } else out.push({ block: b })
  }
  return out
})
const quote = (b: PBlock) => (b.quote ? { marginLeft: `${b.quote * 0.75}rem`, borderLeft: '3px solid var(--c-border)', paddingLeft: '0.75rem' } : undefined)
const heading = (b: PBlock) => `h${Math.min(6, Math.max(1, b.level || 2))}`
</script>

<template>
  <div class="blocks">
    <template v-for="(it, n) in items" :key="n">
      <div v-if="'list' in it" class="list">
        <div v-for="(li, k) in it.list" :key="k" class="li" :style="{ paddingLeft: `${(li.depth || 0) * 1.25}rem`, ...quote(li) }">
          <span class="marker">{{ li.ordered ? `${li.number ?? k + 1}.` : '•' }}</span>
          <span><Inlines :items="li.inlines" /></span>
        </div>
      </div>
      <template v-else>
        <component :is="heading(it.block)" v-if="it.block.kind === 'heading'" :id="ids?.get(it.block)"><Inlines :items="it.block.inlines" /></component>
        <p v-else-if="it.block.kind === 'paragraph'" :style="{ ...quote(it.block), marginLeft: it.block.indent ? `${it.block.indent * 1.25}rem` : quote(it.block)?.marginLeft }"><Inlines :items="it.block.inlines" /></p>
        <CodeBlock v-else-if="it.block.kind === 'code'" :code="it.block.code || ''" />
        <div v-else-if="it.block.kind === 'table'" class="table-wrap">
          <table>
            <thead v-if="it.block.rows?.length">
              <tr><th v-for="(c, j) in it.block.rows[0]" :key="j"><Inlines :items="c" /></th></tr>
            </thead>
            <tbody>
              <tr v-for="(row, r) in (it.block.rows || []).slice(1)" :key="r">
                <td v-for="(c, j) in row" :key="j"><Inlines :items="c" /></td>
              </tr>
            </tbody>
          </table>
        </div>
        <figure v-else-if="it.block.kind === 'image' && it.block.image">
          <img
            :src="`/_hub/assets/${encodeURIComponent(version)}/${encodeURIComponent(it.block.image.asset)}`"
            :alt="it.block.image.alt || ''" :width="it.block.image.width || undefined" :height="it.block.image.height || undefined" loading="lazy"
          >
        </figure>
        <p v-else-if="it.block.inlines?.length"><Inlines :items="it.block.inlines" /></p>
      </template>
    </template>
  </div>
</template>
