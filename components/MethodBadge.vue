<script setup lang="ts">
const props = defineProps<{ method: string; small?: boolean }>()
const m = computed(() => props.method.toLowerCase())
const known = computed(() => ['get', 'post', 'put', 'patch', 'delete'].includes(m.value))
</script>

<template>
  <span class="method" :class="[small && 'small', known ? `m-${m}` : 'm-other']">{{ method }}</span>
</template>
