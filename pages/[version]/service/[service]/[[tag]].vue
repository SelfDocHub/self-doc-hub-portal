<script setup lang="ts">
import type { ManifestNode, ManifestService } from '~/types/hub'

definePageMeta({ path: '/:lang([a-z]{2,3}|[a-z]{2,3}-[A-Za-z0-9]{2,8})?/:version([0-9a-f]{8,})/service/:service/:tag?' })

const route = useRoute()
const version = computed(() => route.params.version as string)
const { data: tree } = await useTree(() => version.value)
const prefix = useLangPrefix()

const service = computed<ManifestService | undefined>(() => tree.value?.services.find(s => s.slug === route.params.service))
function find(nodes: ManifestNode[], id: string): ManifestNode | undefined {
  for (const n of nodes) {
    if (n.id === id && (n.kind === 'tag' || n.kind === 'folder')) return n
    const r = n.children && find(n.children, id)
    if (r) return r
  }
}
const tagId = computed(() => route.params.tag as string | undefined)
const group = computed(() => (tagId.value && service.value ? find(service.value.tree, tagId.value) : undefined))
if (!service.value || (tagId.value && !group.value)) throw createError({ statusCode: 404, statusMessage: 'Not Found', fatal: true })

const title = computed(() => group.value?.title || service.value?.name || '')
const description = computed(() => (group.value ? group.value.description : service.value?.description) || [])
const children = computed(() => (group.value ? group.value.children : service.value?.tree) || [])
const link = (n: ManifestNode) =>
  n.kind === 'tag' || n.kind === 'folder' ? groupUrl(version.value, service.value!.slug, n.id, prefix.value) : nodeUrl(version.value, n, prefix.value)

const plain = (blocks: ManifestNode['description']) =>
  (blocks || []).find(b => b.kind === 'paragraph')?.inlines?.map(i => i.text).join('') || undefined
usePageMeta(() => ({ title: title.value, description: plain(description.value) }))
</script>

<template>
  <div class="content">
    <p v-if="group" class="muted small">
      <NuxtLink :to="groupUrl(version, service!.slug, undefined, prefix)">{{ service!.name }}</NuxtLink>
    </p>
    <h1>{{ title }}</h1>
    <Blocks :blocks="description" :version="version" />
    <ul class="plain">
      <li v-for="n in children" :key="n.id + n.kind">
        <NuxtLink :to="link(n)" class="row-link">
          <MethodBadge v-if="n.method" :method="n.method" small />
          <span>{{ n.title }}</span>
          <span v-if="n.path" class="muted mono small">{{ n.path }}</span>
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>
