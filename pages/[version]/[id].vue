<script setup lang="ts">
import type { PEndpoint, PPage } from '~/types/hub'

const route = useRoute()
const version = computed(() => route.params.version as string)
const id = computed(() => route.params.id as string)
const { data: site } = useNuxtData('site')
const { data: tree } = await useTree(() => version.value)
const api = useApi()

const meta = computed(() => flattenTree(tree.value).get(id.value))
if (!meta.value) throw createError({ statusCode: 404, statusMessage: 'Not Found', fatal: true })

const { data: node, error } = await useAsyncData<PEndpoint | PPage | null>(
  () => `node:${version.value}:${id.value}`,
  async () => {
    const m = meta.value
    if (!m) return null
    return await api<PEndpoint | PPage>(
      `/api/node/${encodeURIComponent(version.value)}/${encodeURIComponent(id.value)}`,
      { query: { kind: m.kind } },
    )
  },
  { watch: [version, id] },
)
if (error.value || !node.value) throw createError({ statusCode: error.value?.statusCode || 404, statusMessage: 'Not Found', fatal: true })

const isPage = computed(() => meta.value?.kind === 'page')
useSeoMeta({
  title: () => `${node.value?.title} — ${site.value?.name}`,
  description: () => node.value?.summary || '',
  ogTitle: () => node.value?.title,
  ogDescription: () => node.value?.summary || '',
})
</script>

<template>
  <PageView v-if="isPage && node" :page="node as PPage" :version="version" />
  <EndpointView v-else-if="node" :endpoint="node as PEndpoint" :version="version" />
</template>
