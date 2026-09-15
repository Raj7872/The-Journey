// ─────────────────────────────────────────────────────────────────────────────
// AssetPipeline
// Central registry for all static assets. Components reference assets
// by key, never by path. Manages preloading and load state.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  Asset,
  AssetLoadState,
  AssetPipelineState,
  AudioAsset,
  FontAsset,
  ImageAsset,
} from '@/types/assets'

type PipelineListener = (state: AssetPipelineState) => void

export class AssetPipeline {
  private registry: Map<string, Asset> = new Map()
  private loadStates: Map<string, AssetLoadState> = new Map()
  private listeners: Set<PipelineListener> = new Set()

  private pipelineState: AssetPipelineState = {
    totalAssets: 0,
    loadedAssets: 0,
    criticalAssetsLoaded: false,
    isComplete: false,
    loadProgress: 0,
    errors: [],
  }

  // ── Registration ─────────────────────────────────────────────────────────

  register(asset: Asset): void {
    this.registry.set(asset.key, asset)
    this.loadStates.set(asset.key, { key: asset.key, status: 'pending' })
    this.updatePipelineState()
  }

  registerMany(assets: Asset[]): void {
    assets.forEach((a) => this.register(a))
  }

  // ── Asset Resolution ──────────────────────────────────────────────────────

  getImage(key: string): ImageAsset | null {
    const asset = this.registry.get(key)
    if (!asset || asset.type !== 'image') return null
    return asset
  }

  getAudio(key: string): AudioAsset | null {
    const asset = this.registry.get(key)
    if (!asset || asset.type !== 'audio') return null
    return asset
  }

  getFont(key: string): FontAsset | null {
    const asset = this.registry.get(key)
    if (!asset || asset.type !== 'font') return null
    return asset
  }

  /** Get src path for any asset by key */
  getSrc(key: string): string | null {
    return this.registry.get(key)?.src ?? null
  }

  // ── Preloading ────────────────────────────────────────────────────────────

  /** Preload all critical assets before experience begins */
  async preloadCritical(): Promise<void> {
    const criticalAssets = Array.from(this.registry.values()).filter((a) => a.critical)
    await Promise.allSettled(criticalAssets.map((a) => this.loadAsset(a)))
    this.updatePipelineState()
  }

  /** Preload all assets marked for preload */
  async preloadAll(): Promise<void> {
    const preloadAssets = Array.from(this.registry.values()).filter((a) => a.preload)
    await Promise.allSettled(preloadAssets.map((a) => this.loadAsset(a)))
  }

  getPipelineState(): Readonly<AssetPipelineState> {
    return this.pipelineState
  }

  subscribe(fn: PipelineListener): () => void {
    this.listeners.add(fn)
    fn(this.pipelineState)
    return () => this.listeners.delete(fn)
  }

  // ── Private ────────────────────────────────────────────────────────────────

  private async loadAsset(asset: Asset): Promise<void> {
    this.loadStates.set(asset.key, { key: asset.key, status: 'loading' })
    this.updatePipelineState()

    try {
      if (asset.type === 'image') {
        await this.loadImage(asset.src)
      } else if (asset.type === 'font') {
        await this.loadFont(asset as FontAsset)
      }
      // Audio preloading is handled by AudioManager (Howler)

      this.loadStates.set(asset.key, { key: asset.key, status: 'loaded' })
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Unknown error'
      this.loadStates.set(asset.key, { key: asset.key, status: 'error', error })
      this.pipelineState = {
        ...this.pipelineState,
        errors: [...this.pipelineState.errors, { key: asset.key, error }],
      }
      console.warn(`[AssetPipeline] Failed to load "${asset.key}": ${error}`)
    }

    this.updatePipelineState()
    this.notify()
  }

  private loadImage(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve()
      img.onerror = () => reject(new Error(`Image failed: ${src}`))
      img.src = src
    })
  }

  private loadFont(asset: FontAsset): Promise<void> {
    if (typeof FontFace === 'undefined') return Promise.resolve()
    const font = new FontFace(asset.family, `url(${asset.src})`, {
      weight: asset.weight,
      style: asset.style,
    })
    return font.load().then((loaded) => {
      document.fonts.add(loaded)
    })
  }

  private updatePipelineState(): void {
    const states = Array.from(this.loadStates.values())
    const loaded = states.filter((s) => s.status === 'loaded').length
    const total = this.registry.size

    const criticalKeys = Array.from(this.registry.values())
      .filter((a) => a.critical)
      .map((a) => a.key)

    const criticalLoaded = criticalKeys.every(
      (key) => this.loadStates.get(key)?.status === 'loaded'
    )

    this.pipelineState = {
      ...this.pipelineState,
      totalAssets: total,
      loadedAssets: loaded,
      criticalAssetsLoaded: criticalLoaded,
      isComplete: loaded === total && total > 0,
      loadProgress: total > 0 ? loaded / total : 0,
    }
  }

  private notify(): void {
    this.listeners.forEach((fn) => fn(this.pipelineState))
  }
}

export const assetPipeline = new AssetPipeline()
