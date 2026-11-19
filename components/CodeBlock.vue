<script setup lang="ts">
const props = defineProps<{ code: string }>()
const copied = ref(false)
async function copy() {
  try {
    await navigator.clipboard.writeText(props.code)
    copied.value = true
    setTimeout(() => (copied.value = false), 1500)
  } catch { /* clipboard may be unavailable (http, old browser) */ }
}
</script>

<template>
  <div class="code-block">
    <ClientOnly><button class="copy" type="button" @click="copy">{{ copied ? '✓' : 'copy' }}</button></ClientOnly>
    <pre><code>{{ code }}</code></pre>
  </div>
</template>
