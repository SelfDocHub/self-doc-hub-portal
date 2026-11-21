<script setup lang="ts">
import type { ManifestNode } from '~/types/hub'
const props = defineProps<{ nodes: ManifestNode[]; version: string; service: string }>()
const route = useRoute()
const prefix = useLangPrefix()
const activeId = computed(() => route.params.id as string | undefined)
const activeService = computed(() => route.params.service as string | undefined)
const activeTag = computed(() => route.params.tag as string | undefined)

function contains(n: ManifestNode, id?: string): boolean {
  return !!id && (n.id === id || !!n.children?.some(c => contains(c, id)))
}
const isOpen = (n: ManifestNode) =>
  contains(n, activeId.value) || (activeService.value === props.service && contains(n, activeTag.value))
const isActiveGroup = (n: ManifestNode) => activeService.value === props.service && activeTag.value === n.id

// The title is a link; when its page is already open, a click on it folds / unfolds the group instead.
function onGroupClick(e: MouseEvent, n: ManifestNode) {
  if (!isActiveGroup(n)) return
  e.preventDefault()
  const d = (e.currentTarget as HTMLElement).closest('details')
  if (d) d.open = !d.open
}
</script>

<template>
  <ul class="nav-list">
    <li v-for="n in props.nodes" :key="n.id + n.kind">
      <details v-if="n.kind === 'folder' || n.kind === 'tag'" :open="isOpen(n)" class="nav-group">
        <summary>
          <NuxtLink
            :to="groupUrl(version, service, n.id, prefix)"
            class="nav-group-link"
            :class="{ active: isActiveGroup(n) }"
            @click="onGroupClick($event, n)"
          >{{ n.title }}</NuxtLink>
        </summary>
        <NavNodes v-if="n.children?.length" :nodes="n.children" :version="version" :service="service" />
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
