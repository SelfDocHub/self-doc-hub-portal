<script setup lang="ts">
// Addresses of the llms files: /endpoints/<id> and /pages/<id> (under /{lang}/ for other languages). They are
// redirected to the canonical address of the node in the default version.
definePageMeta({ path: '/:lang([a-z]{2,3}|[a-z]{2,3}-[A-Za-z0-9]{2,8})?/:kind(endpoints|pages)/:id' })
const route = useRoute()
const { data: site } = useNuxtData('site')
const prefix = useLangPrefix()
const api = useApi()
const version = site.value?.default_version
if (!version) throw createError({ statusCode: 404, statusMessage: 'Not Found', fatal: true })
const tree = await api<any>(`/api/tree/${encodeURIComponent(version)}`).catch(() => null)
const node = flattenTree(tree).get(route.params.id as string)
if (!node) throw createError({ statusCode: 404, statusMessage: 'Not Found', fatal: true })
await navigateTo(nodeUrl(version, node, prefix.value), { redirectCode: 301, replace: true })
</script>

<template><div /></template>
