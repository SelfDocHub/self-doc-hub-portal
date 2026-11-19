<script setup lang="ts">
import type { PInline } from '~/types/hub'
defineProps<{ i: PInline }>()
</script>

<template>
  <code v-if="i.code" :class="{ b: i.bold, i: i.italic, s: i.strike }">{{ i.text }}</code>
  <strong v-else-if="i.bold"><em v-if="i.italic"><del v-if="i.strike">{{ i.text }}</del><template v-else>{{ i.text }}</template></em><del v-else-if="i.strike">{{ i.text }}</del><template v-else>{{ i.text }}</template></strong>
  <em v-else-if="i.italic"><del v-if="i.strike">{{ i.text }}</del><template v-else>{{ i.text }}</template></em>
  <del v-else-if="i.strike">{{ i.text }}</del>
  <template v-else>{{ i.text }}</template>
</template>
