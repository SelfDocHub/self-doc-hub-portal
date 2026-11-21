<script setup lang="ts">
import type { ManifestNode } from '~/types/hub'
const props = defineProps<{ nodes: ManifestNode[]; version: string }>()
const route = useRoute()
const prefix = useLangPrefix()
const activeId = computed(() => route.params.id as string | undefined)

function contains(n: ManifestNode, id?: string): boolean {
  return !!id && (n.id === id || !!n.children?.some(c => contains(c, id)))
}
</script>

<template>
  <ul class="nav-list">
    <li v-for="n in props.nodes" :key="n.id + n.kind">
      <details v-if="n.kind === 'folder' || n.kind === 'tag'" :open="contains(n, activeId)" class="nav-group">
        <summary>{{ n.title }}</summary>
        <NavNodes v-if="n.children?.length" :nodes="n.children" :version="version" />
      </details>
      <NuxtLink
        v-else
        :to="nodeUrl(version, n, prefix)"
        class="nav-link"
        :class="{ active: n.id === activeId, deprecated: n.deprecated }"
      >
        <MethodBadge v-if="n.kind === 'endpoint' && n.method" :method="n.method" small />
        <span class="nav-title">{{ n.title }}</span>
      </NuxtLink>
    </li>
  </ul>
</template>
