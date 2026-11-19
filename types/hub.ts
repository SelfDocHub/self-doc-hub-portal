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
export interface Tokens {
  light?: Record<string, string>; dark?: Record<string, string>; font?: string; font_size?: number
  radius?: string; density?: string; content_width?: number
}
export interface Site {
  domain: string; name: string; description?: string; languages: string[]; default_language: string
  tokens: Tokens; brand: { logo_top?: SiteImage; logo_bottom?: SiteImage; favicon?: SiteImage }
  footer: Footer; versions: SiteVersion[]; default_version: string
}
export interface SearchEntry { id: string; kind: string; service: string; title: string; method?: string; path?: string; summary?: string }
export interface SearchResponse { query: string; total: number; results: SearchEntry[] }
