// ─────────────────────────────────────────────────────────────────────────────
// Asset Pipeline Types
// Central registry for all static assets.
// Components reference assets by key, not by path.
// Paths live only in the asset manifest.
// ─────────────────────────────────────────────────────────────────────────────

export type AssetType = 'image' | 'audio' | 'font' | 'texture' | 'model'
export type AssetStatus = 'pending' | 'loading' | 'loaded' | 'error'
export type ImageFormat = 'webp' | 'png' | 'jpg' | 'svg'

export interface AssetDescriptor {
  key: string
  type: AssetType
  src: string
  /** Whether this asset is needed before the experience can begin */
  critical: boolean
  /** Whether to preload at app start (vs. lazy load) */
  preload: boolean
}

export interface ImageAsset extends AssetDescriptor {
  type: 'image'
  format: ImageFormat
  width?: number
  height?: number
  /** BlurDataURL for Next.js Image placeholder */
  blurDataUrl?: string
  alt: string
}

export interface AudioAsset extends AssetDescriptor {
  type: 'audio'
  format: 'mp3' | 'ogg' | 'wav'
  duration?: number
}

export interface FontAsset extends AssetDescriptor {
  type: 'font'
  family: string
  weight: string
  style: 'normal' | 'italic'
  format: 'woff2' | 'woff'
}

export type Asset = ImageAsset | AudioAsset | FontAsset

export interface AssetLoadState {
  key: string
  status: AssetStatus
  error?: string
}

export interface AssetPipelineState {
  totalAssets: number
  loadedAssets: number
  criticalAssetsLoaded: boolean
  isComplete: boolean
  loadProgress: number  // 0–1
  errors: Array<{ key: string; error: string }>
}
