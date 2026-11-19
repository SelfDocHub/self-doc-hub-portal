<script setup lang="ts">
import type { NuxtError } from '#app'
const props = defineProps<{ error: NuxtError }>()
const is404 = computed(() => props.error.statusCode === 404)
</script>

<template>
  <main class="error-page">
    <h1>{{ error.statusCode }}</h1>
    <p>{{ is404 ? 'Page not found' : 'The documentation is temporarily unavailable' }}</p>
    <a href="/" class="btn">Home</a>
  </main>
</template>

<style>
.error-page { min-height: 100vh; display: grid; place-content: center; gap: 12px; text-align: center; font-family: system-ui, sans-serif; }
.error-page h1 { font-size: 4rem; margin: 0; }
.error-page .btn { color: inherit; }
</style>
