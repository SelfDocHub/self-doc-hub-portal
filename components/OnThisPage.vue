<script setup lang="ts">
defineProps<{ items: { id: string; text: string; level?: number }[] }>()
const t = useTexts()
</script>

<template>
  <aside v-if="items.length > 1" class="toc" :aria-label="t('site.on_this_page')">
    <h4>{{ t('site.on_this_page') }}</h4>
    <a v-for="i in items" :key="i.id" :href="`#${i.id}`" :style="{ paddingLeft: `${((i.level || 2) - 2) * 0.75}rem` }">{{ i.text }}</a>
  </aside>
</template>
