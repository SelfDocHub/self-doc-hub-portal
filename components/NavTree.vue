<script setup lang="ts">
import type { Manifest } from '~/types/hub'
defineProps<{ manifest: Manifest; version: string }>()
</script>

<template>
  <nav class="nav">
    <section v-for="s in manifest.services" :key="s.slug" class="nav-service">
      <h3>{{ s.name }}</h3>
      <NavNodes :nodes="s.tree" :version="version" />
    </section>
  </nav>
</template>
