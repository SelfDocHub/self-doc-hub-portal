<script setup lang="ts">
import type { PField } from '~/types/hub'
defineProps<{ fields: PField[] }>()
const t = useTexts()
</script>

<template>
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>{{ t('export.doc.col_field') }}</th><th>{{ t('export.doc.col_type') }}</th>
          <th>{{ t('export.doc.col_required') }}</th><th>{{ t('export.doc.col_description') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(f, i) in fields" :key="i">
          <td><span class="mono" :style="{ paddingLeft: `${(f.depth || 0) * 1.1}rem` }">{{ f.name }}</span></td>
          <td class="mono muted">{{ f.type }}</td>
          <td>{{ f.required ? t('export.doc.yes') : '' }}</td>
          <td>{{ f.description }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
