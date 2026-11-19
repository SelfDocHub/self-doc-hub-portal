<script setup lang="ts">
import type { PEndpoint } from '~/types/hub'
const props = defineProps<{ endpoint: PEndpoint; version: string }>()
const t = useTexts()
const e = computed(() => props.endpoint)

const inLabel = (v?: string) => (v ? t(`export.doc.in_${v}`, v) : '')
const hasBody = computed(() => !!(e.value.request_body && (e.value.request_body.fields?.length || e.value.request_body.description?.length)))
const sections = computed(() => {
  const s: { id: string; text: string }[] = []
  if (e.value.description?.length) s.push({ id: 'description', text: t('export.doc.col_description') })
  if (e.value.parameters?.length) s.push({ id: 'parameters', text: t(e.value.parameters_label || 'site.parameters') })
  if (hasBody.value) s.push({ id: 'request-body', text: t('site.request_body') })
  if (e.value.responses?.length) s.push({ id: 'responses', text: t(e.value.response_label || 'site.responses') })
  if (e.value.errors?.length) s.push({ id: 'errors', text: t('site.errors') })
  if (e.value.request_example) s.push({ id: 'request-example', text: t('site.example_request') })
  if (e.value.response_example) s.push({ id: 'response-example', text: t('site.example_response') })
  return s
})
const codeClass = (code: string) => (/^2/.test(code) ? 's2' : /^4/.test(code) ? 's4' : /^5/.test(code) ? 's5' : '')
</script>

<template>
  <div class="doc-grid">
    <article class="content">
      <p class="muted small">{{ endpoint.service }}</p>
      <h1>
        {{ endpoint.title }}
        <span v-if="endpoint.deprecated" class="badge-deprecated">{{ t('site.deprecated') }}</span>
      </h1>
      <div v-if="endpoint.method || endpoint.path" class="endpoint-line">
        <MethodBadge v-if="endpoint.method" :method="endpoint.method" />
        <code class="path">{{ endpoint.path }}</code>
      </div>

      <section v-if="endpoint.description?.length" id="description">
        <Blocks :blocks="endpoint.description" :version="version" />
      </section>

      <section v-if="endpoint.parameters?.length" id="parameters">
        <h2>{{ t(endpoint.parameters_label || 'site.parameters') }}</h2>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{{ t('export.doc.col_name') }}</th><th>{{ t('export.doc.col_in') }}</th><th>{{ t('export.doc.col_type') }}</th>
                <th>{{ t('export.doc.col_required') }}</th><th>{{ t('export.doc.col_description') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(p, i) in endpoint.parameters" :key="i">
                <td class="mono">{{ p.name }}</td><td>{{ inLabel(p.in) }}</td><td class="mono muted">{{ p.type }}</td>
                <td>{{ p.required ? t('export.doc.yes') : '' }}</td><td>{{ p.description }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section v-if="hasBody" id="request-body">
        <h2>{{ t('site.request_body') }}</h2>
        <p v-if="endpoint.request_body?.content_type" class="muted mono small">{{ endpoint.request_body.content_type }}</p>
        <Blocks :blocks="endpoint.request_body?.description" :version="version" />
        <FieldsTable v-if="endpoint.request_body?.fields?.length" :fields="endpoint.request_body.fields" />
      </section>

      <section v-if="endpoint.responses?.length" id="responses">
        <h2>{{ t(endpoint.response_label || 'site.responses') }}</h2>
        <div v-for="(r, i) in endpoint.responses" :key="i" class="response">
          <h3><span class="status" :class="codeClass(r.code)">{{ r.code }}</span> <span class="resp-desc">{{ r.description }}</span></h3>
          <p v-if="r.content_type" class="muted mono small">{{ r.content_type }}</p>
          <FieldsTable v-if="r.fields?.length" :fields="r.fields" />
        </div>
      </section>

      <section v-if="endpoint.errors?.length" id="errors">
        <h2>{{ t('site.errors') }}</h2>
        <div class="table-wrap">
          <table>
            <thead>
              <tr><th>{{ t('export.doc.col_code') }}</th><th>{{ t('export.doc.col_message') }}</th><th>{{ t('export.doc.col_description') }}</th></tr>
            </thead>
            <tbody>
              <tr v-for="(er, i) in endpoint.errors" :key="i">
                <td class="mono">{{ er.code }}</td><td>{{ er.message }}</td><td>{{ er.description }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section v-if="endpoint.request_example" id="request-example">
        <h2>{{ t('site.example_request') }}</h2>
        <CodeBlock :code="endpoint.request_example" />
      </section>
      <section v-if="endpoint.response_example" id="response-example">
        <h2>{{ t('site.example_response') }}</h2>
        <CodeBlock :code="endpoint.response_example" />
      </section>
    </article>
    <OnThisPage :items="sections" />
  </div>
</template>
