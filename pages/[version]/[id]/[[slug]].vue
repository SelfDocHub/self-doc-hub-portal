<script setup lang="ts">
import type { PEndpoint, PPage } from '~/types/hub'

definePageMeta({ path: '/:lang([a-z]{2,3}|[a-z]{2,3}-[A-Za-z0-9]{2,8})?/:version([0-9a-f]{8,})/:id/:slug?' })

const route = useRoute()
const version = computed(() => route.params.version as string)
const id = computed(() => route.params.id as string)
const { data: site } = useNuxtData('site')
const { data: tree } = await useTree(() => version.value)
const api = useApi()
const prefix = useLangPrefix()

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

// Canonical address: the decorative part is replaced when it is missing or differs (old links keep working).
{
  const m = meta.value!
  const slug = nodeSlug({ id: id.value, kind: m.kind, title: m.title, method: m.method, path: m.path })
  if ((route.params.slug as string | undefined || '') !== slug) {
    await navigateTo({ path: nodeUrl(version.value, { id: id.value, kind: m.kind, title: m.title, method: m.method, path: m.path }, prefix.value), query: route.query }, { redirectCode: 301, replace: true })
  }
}

const isPage = computed(() => meta.value?.kind === 'page')
usePageMeta(() => ({ title: node.value?.title, description: node.value?.summary }))
</script>

<template>
  <PageView v-if="isPage && node" :page="node as PPage" :version="version" />
  <EndpointView v-else-if="node" :endpoint="node as PEndpoint" :version="version" />
</template>
