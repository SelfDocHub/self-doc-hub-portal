// Shapes of the docs-hub public API (docs/public-swagger.json).
export interface PInline { text: string; bold?: boolean; italic?: boolean; strike?: boolean; code?: boolean; link?: string }
export interface PImage { asset: string; content_type: string; alt?: string; width?: number; height?: number }
export interface PBlock {
  kind: 'paragraph' | 'heading' | 'code' | 'list_item' | 'table' | 'image' | string
  level?: number; inlines?: PInline[]; code?: string; depth?: number; ordered?: boolean; number?: number
  quote?: number; indent?: number; rows?: PInline[][][]; image?: PImage
}
export interface PParameter { name: string; in?: string; type?: string; required?: boolean; description?: string }
export interface PField { name: string; type?: string; required?: boolean; description?: string; depth?: number }
export interface PRequestBody { content_type?: string; description?: PBlock[]; fields?: PField[] }
export interface PResponse { code: string; description?: string; content_type?: string; fields?: PField[] }
export interface PError { code?: string; message?: string; description?: string }
export interface PEndpoint {
  id: string; service: string; title: string; summary?: string; format: string; method?: string; path?: string
  deprecated?: boolean; description?: PBlock[]; parameters?: PParameter[]; request_body?: PRequestBody
  responses?: PResponse[]; errors?: PError[]; request_example?: string; response_example?: string
  parameters_label?: string; response_label?: string
}
export interface PPage { id: string; service: string; title: string; summary?: string; blocks: PBlock[] }
export interface ManifestNode {
  id: string; kind: 'folder' | 'tag' | 'endpoint' | 'page' | string; title: string; method?: string; path?: string
  format?: string; deprecated?: boolean; description?: PBlock[]; children?: ManifestNode[]
}
export interface ManifestService {
  slug: string; name: string; description?: PBlock[]; spec_version?: string; version_date?: string; tree: ManifestNode[]
}
export interface Manifest { format: number; name: string; built_at: string; services: ManifestService[] }
export interface SiteImage { url: string; content_type: string; link?: string }
export interface SiteVersion { id: string; name: string; updated_at: string; hidden?: boolean }
export interface FooterLink { text: string; url: string }
export interface Footer { text?: string; columns?: { title: string; links: FooterLink[] }[]; copyright?: string; links?: FooterLink[] }
export interface Header { height: number; links: FooterLink[] }
export interface Tokens {
  light?: Record<string, string>; dark?: Record<string, string>; font?: string; font_size?: number
  radius?: string; density?: string; content_width?: number
  // Link style of the top bar / footer: normal state and hover (underline: none | underline, weight: normal | medium | bold).
  header_link_underline?: string; header_link_weight?: string; header_link_size?: number
  header_link_hover_underline?: string; header_link_hover_weight?: string; header_link_hover_size?: number
  footer_link_underline?: string; footer_link_weight?: string; footer_link_size?: number
  footer_link_hover_underline?: string; footer_link_hover_weight?: string; footer_link_hover_size?: number
}
export interface Language { code: string; name: string }
export interface SiteSocial { title: string; description: string; card_type: string; twitter_site: string; image: SiteImage | null }
export interface Site {
  domain: string
  /** Language of the texts, header links and footer of this response; `languages` lists every language of the site. */
  language: string; languages: Language[]; default_language: string
  name: string; title_template: string; description: string; keywords: string[]
  tokens: Tokens; brand: { logo_top?: SiteImage; logo_bottom?: SiteImage; favicon?: SiteImage }
  header: Header; footer: Footer; versions: SiteVersion[]; default_version: string
  social: SiteSocial
  verification: { google: string; yandex: string; bing: string }
  analytics: { google_analytics: string; yandex_metrika: string }
  noindex: boolean
  /** Public origin of the portal (added by the portal's own /api/site). */
  origin?: string
}
export interface SearchEntry { id: string; kind: string; service: string; title: string; method?: string; path?: string; summary?: string }
export interface SearchResponse { query: string; total: number; results: SearchEntry[] }
export interface SitemapResponse {
  updated_at: string; default_language: string; languages: { code: string; prefix: string }[]; entries: SearchEntry[]
}
