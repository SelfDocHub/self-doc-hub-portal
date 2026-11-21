<script setup lang="ts">
import type { ManifestNode } from '~/types/hub'
definePageMeta({ path: '/:lang([a-z]{2,3}|[a-z]{2,3}-[A-Za-z0-9]{2,8})?/:version([0-9a-f]{8,})' })
const route = useRoute()
const version = computed(() => route.params.version as string)
const { data: site } = useNuxtData('site')
const { data: tree, error } = await useTree(() => version.value)
if (error.value || !tree.value) throw createError({ statusCode: error.value?.statusCode || 404, fatal: true })
const t = useTexts()
const prefix = useLangPrefix()
const link = (n: ManifestNode) => nodeUrl(version.value, n, prefix.value)

// The first level of every service is shown as the landing page.
function leaves(nodes: ManifestNode[]): ManifestNode[] {
  return nodes.flatMap(n => (n.kind === 'folder' || n.kind === 'tag' ? leaves(n.children || []) : [n]))
}
usePageMeta(() => ({ title: tree.value?.name || undefined, description: site.value?.description }))
</script>

<template>
  <div class="content">
    <h1>{{ tree?.name || site?.name }}</h1>
    <p v-if="site?.description" class="lead">{{ site.description }}</p>
    <section v-for="s in tree?.services" :key="s.slug" class="service">
      <h2>{{ s.name }}</h2>
      <p v-if="s.spec_version || s.version_date" class="muted small">
        <span v-if="s.spec_version">{{ t('export.doc.version') }} {{ s.spec_version }}</span>
        <span v-if="s.version_date"> · {{ s.version_date }}</span>
      </p>
      <Blocks :blocks="s.description" :version="version" />
      <ul class="plain">
        <li v-for="n in leaves(s.tree).slice(0, 12)" :key="n.id">
          <NuxtLink :to="link(n)" class="row-link">
            <MethodBadge v-if="n.method" :method="n.method" small />
            <span>{{ n.title }}</span>
            <span v-if="n.path" class="muted mono small">{{ n.path }}</span>
          </NuxtLink>
        </li>
      </ul>
    </section>
  </div>
</template>
