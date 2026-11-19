<script setup lang="ts">
const { data: site } = useNuxtData('site')
const year = new Date().getFullYear()
const f = computed(() => site.value?.footer)
const copyright = computed(() => (f.value?.copyright || '').replace(/\{year\}/g, String(year)))
// Footer links are plain data from docs-hub; only http(s), mailto and site-relative URLs become links.
const safe = (u: string) => (/^(https?:\/\/|mailto:|\/(?!\/))/i.test(u) ? u : '#')
const hasContent = computed(() => !!(f.value && (f.value.text || f.value.columns?.length || f.value.copyright || f.value.links?.length || site.value?.brand?.logo_bottom)))
</script>

<template>
  <footer v-if="hasContent" class="footer">
    <div class="footer-inner">
      <div class="footer-top">
        <div class="footer-about">
          <component :is="site?.brand?.logo_bottom?.link ? 'a' : 'div'" v-if="site?.brand?.logo_bottom" :href="site.brand.logo_bottom.link" rel="noopener">
            <img :src="site.brand.logo_bottom.url" :alt="site.name" class="logo-bottom">
          </component>
          <p v-if="f?.text">{{ f.text }}</p>
        </div>
        <nav v-for="(col, i) in f?.columns || []" :key="i" class="footer-col">
          <h4>{{ col.title }}</h4>
          <a v-for="(l, j) in col.links" :key="j" :href="safe(l.url)" rel="noopener">{{ l.text }}</a>
        </nav>
      </div>
      <div v-if="copyright || f?.links?.length" class="footer-bottom">
        <span>{{ copyright }}</span>
        <nav><a v-for="(l, j) in f?.links || []" :key="j" :href="safe(l.url)" rel="noopener">{{ l.text }}</a></nav>
      </div>
    </div>
  </footer>
</template>
