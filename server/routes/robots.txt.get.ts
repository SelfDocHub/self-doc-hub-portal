// robots.txt comes from docs-hub (open or closed site, extra lines, the sitemap address).
export default defineEventHandler(event => hubText(event, '/robots', 'text/plain; charset=utf-8'))
