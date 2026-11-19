// Public documentation portal: renders the docs-hub public API (/public/v1/...) for the domain it is opened on.
export default defineNuxtConfig({
  compatibilityDate: '2025-07-01',
  devtools: { enabled: false },
  ssr: true,
  css: ['~/assets/main.css'],
  runtimeConfig: {
    // Server-only values; override with NUXT_* environment variables.
    // Base URL of docs-hub (no trailing slash).
    docsHubUrl: 'http://localhost:8080',
    // Domain sent in X-Public-Domain when set; otherwise the Host of the request is used.
    domainOverride: '',
    // Read X-Forwarded-Host (set it to true only behind a reverse proxy you control).
    trustProxy: false,
    // Public origin used in sitemap.xml / canonical links; empty = derived from the request.
    siteOrigin: '',
  },
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
    },
  },
  typescript: { strict: true },
})
