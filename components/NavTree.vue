<script setup lang="ts">
import type { Manifest } from '~/types/hub'
defineProps<{ manifest: Manifest; version: string }>()
const route = useRoute()
const prefix = useLangPrefix()
const isActive = (slug: string) => route.params.service === slug && !route.params.tag
</script>

<template>
  <nav class="nav">
    <section v-for="s in manifest.services" :key="s.slug" class="nav-service">
      <h3>
        <NuxtLink :to="groupUrl(version, s.slug, undefined, prefix)" class="nav-service-link" :class="{ active: isActive(s.slug) }">{{ s.name }}</NuxtLink>
      </h3>
      <NavNodes :nodes="s.tree" :version="version" :service="s.slug" />
    </section>
  </nav>
</template>
