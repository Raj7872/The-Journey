// ─────────────────────────────────────────────────────────────────────────────
// Asset Manifest — Single Source of Truth
//
// RULE: No component, hook, or system may reference an asset path directly.
//       All assets are referenced by KEY only.
//       To replace an asset, change its `src` here — zero application code changes.
//
// Usage:
//   import { ASSET_KEYS, getSrc } from '@/content/assets/assetManifest'
//   const src = getSrc(ASSET_KEYS.IMG_OUTSIDE_STATION)
// ─────────────────────────────────────────────────────────────────────────────

import type { Asset, AudioAsset, FontAsset, ImageAsset } from '@/types/assets'

const base = process.env['NEXT_PUBLIC_ASSET_BASE_URL'] ?? ''

// ── Typed Key Registry ────────────────────────────────────────────────────
// All valid asset keys as a const object.
// Import ASSET_KEYS and use these — never write a key string inline.

export const ASSET_KEYS = {
  // Fonts
  FONT_IM_FELL_REGULAR:    'font-im-fell-regular',
  FONT_IM_FELL_ITALIC:     'font-im-fell-italic',
  FONT_CRIMSON_REGULAR:    'font-crimson-regular',
  FONT_CRIMSON_ITALIC:     'font-crimson-italic',
  FONT_CRIMSON_SEMIBOLD:   'font-crimson-semibold',
  FONT_SPECIAL_ELITE:      'font-special-elite',

  // Textures
  TEX_PAPER_CREAM:         'tex-paper-cream',
  TEX_PAPER_AGED:          'tex-paper-aged',
  TEX_LEATHER_DARK:        'tex-leather-dark',
  TEX_WOOD_DARK:           'tex-wood-dark',
  TEX_BRASS:               'tex-brass',
  TEX_NOISE:               'tex-noise',
  TEX_STONE_FLOOR:         'tex-stone-floor',

  // Station images
  IMG_OUTSIDE_STATION:     'img-outside-station',
  IMG_ENTRANCE_HALL:       'img-entrance-hall',
  IMG_MAIN_HALL:           'img-main-hall',
  IMG_PLATFORM_ONE:        'img-platform-one',
  IMG_PLATFORM_CAFE:       'img-platform-cafe',
  IMG_MEMORY_TUNNEL:       'img-memory-tunnel',
  IMG_WAITING_ROOM:        'img-waiting-room',
  IMG_PLATFORM_ELEVEN:     'img-platform-eleven',

  // Train images
  IMG_TRAIN_EXTERIOR:      'img-train-exterior',
  IMG_TRAIN_INTERIOR:      'img-train-interior',
  IMG_TRAIN_WINDOW_FRAME:  'img-train-window-frame',
  IMG_TRAIN_SCENERY_RAIN:  'img-train-scenery-rain',
  IMG_TRAIN_SCENERY_FOREST:'img-train-scenery-forest',
  IMG_TRAIN_SCENERY_MOUNTAINS: 'img-train-scenery-mountains',
  IMG_TRAIN_SCENERY_VILLAGE: 'img-train-scenery-village',
  IMG_TRAIN_SCENERY_RIVER: 'img-train-scenery-river',
  IMG_TRAIN_SCENERY_NIGHT: 'img-train-scenery-night',
  IMG_TRAIN_SCENERY_SUNRISE: 'img-train-scenery-sunrise',

  // Field / sunrise
  IMG_SUNRISE_FIELD:       'img-sunrise-field',
  IMG_WILDFLOWERS:         'img-wildflowers',
  IMG_SINGLE_TREE:         'img-single-tree',
  IMG_WOODEN_BENCH:        'img-wooden-bench',
  IMG_GIFT_BOX:            'img-gift-box',
  IMG_MORNING_MIST:        'img-morning-mist',

  // Memory postcards
  IMG_POSTCARD_TOKYO:      'img-postcard-tokyo',
  IMG_POSTCARD_PARIS:      'img-postcard-paris',
  IMG_POSTCARD_KYOTO:      'img-postcard-kyoto',
  IMG_POSTCARD_VENICE:     'img-postcard-venice',

  // Memory polaroids
  IMG_POLAROID_PLACEHOLDER_1: 'img-polaroid-placeholder-1',
  IMG_POLAROID_PLACEHOLDER_2: 'img-polaroid-placeholder-2',

  // Music
  AUD_PIANO_ENTRANCE:      'aud-piano-entrance',
  AUD_STRINGS_MAIN_HALL:   'aud-strings-main-hall',
  AUD_JAZZ_CAFE:           'aud-jazz-cafe',
  AUD_AMBIENT_TUNNEL:      'aud-ambient-tunnel',
  AUD_SILENCE_WAITING:     'aud-silence-waiting-room',
  AUD_PIANO_TRAIN:         'aud-piano-train',
  AUD_PIANO_SUNRISE:       'aud-piano-sunrise',
  AUD_ENDING_UPLIFTING:    'aud-ending-uplifting',

  // Ambient
  AUD_AMB_RAIN_EXT:        'aud-amb-rain-exterior',
  AUD_AMB_RAIN_INT:        'aud-amb-rain-interior',
  AUD_AMB_RAIN_WINDOW:     'aud-amb-rain-window',
  AUD_AMB_WIND_PLATFORM:   'aud-amb-wind-platform',
  AUD_AMB_STATION:         'aud-amb-station-atmosphere',
  AUD_AMB_CAFE:            'aud-amb-cafe-background',
  AUD_AMB_TRAIN_MOVING:    'aud-amb-train-moving',
  AUD_AMB_BIRDS:           'aud-amb-birds-morning',
  AUD_AMB_FIELD:           'aud-amb-field-ambient',
  AUD_AMB_VINYL:           'aud-amb-vinyl-crackle',
  AUD_AMB_FIREPLACE:       'aud-amb-fireplace',

  // SFX
  AUD_SFX_PAPER_UNFOLD:    'aud-sfx-paper-unfold',
  AUD_SFX_WAX_SEAL:        'aud-sfx-wax-seal-break',
  AUD_SFX_PAGE_TURN:       'aud-sfx-page-turn',
  AUD_SFX_NOTEBOOK_OPEN:   'aud-sfx-notebook-open',
  AUD_SFX_NOTEBOOK_CLOSE:  'aud-sfx-notebook-close',
  AUD_SFX_POLAROID:        'aud-sfx-polaroid-develop',
  AUD_SFX_TICKET_STAMP:    'aud-sfx-ticket-stamp',
  AUD_SFX_CASSETTE_INSERT: 'aud-sfx-cassette-insert',
  AUD_SFX_BOX_OPEN:        'aud-sfx-box-open',
  AUD_SFX_BOX_LATCH:       'aud-sfx-box-latch',
  AUD_SFX_PAPER_RUSTLE:    'aud-sfx-paper-rustle',
  AUD_SFX_MEMORY_COLLECT:  'aud-sfx-memory-collect',
  AUD_SFX_POSTCARD_FLIP:   'aud-sfx-postcard-flip',
  AUD_SFX_FLOWER_RUSTLE:   'aud-sfx-flower-rustle',
  AUD_SFX_TRAIN_WHISTLE:   'aud-sfx-train-whistle',
  AUD_SFX_TRAIN_BRAKE:     'aud-sfx-train-brake',
  AUD_SFX_TRAIN_DOOR:      'aud-sfx-train-door',
  AUD_SFX_ANNOUNCEMENT:    'aud-sfx-announcement-static',
  AUD_SFX_COFFEE_CUP:      'aud-sfx-coffee-cup',
  AUD_SFX_CLOCK_TICK:      'aud-sfx-clock-tick',
  AUD_SFX_BIRDS_FLY:       'aud-sfx-birds-fly',

  // Voice
  AUD_VOICE_CASSETTE_A:    'aud-voice-cassette-a',
  AUD_VOICE_CASSETTE_B:    'aud-voice-cassette-b',
  AUD_VOICE_CASSETTE_C:    'aud-voice-cassette-c',
} as const

export type AssetKey = (typeof ASSET_KEYS)[keyof typeof ASSET_KEYS]

// ── Font Assets ───────────────────────────────────────────────────────────

const FONTS: FontAsset[] = [
  { key: ASSET_KEYS.FONT_IM_FELL_REGULAR, type: 'font', src: `${base}/fonts/IMFellEnglish-Regular.woff2`, family: 'IM Fell English', weight: '400', style: 'normal', format: 'woff2', critical: true, preload: true },
  { key: ASSET_KEYS.FONT_IM_FELL_ITALIC, type: 'font', src: `${base}/fonts/IMFellEnglish-Italic.woff2`, family: 'IM Fell English', weight: '400', style: 'italic', format: 'woff2', critical: true, preload: true },
  { key: ASSET_KEYS.FONT_CRIMSON_REGULAR, type: 'font', src: `${base}/fonts/CrimsonText-Regular.woff2`, family: 'Crimson Text', weight: '400', style: 'normal', format: 'woff2', critical: true, preload: true },
  { key: ASSET_KEYS.FONT_CRIMSON_ITALIC, type: 'font', src: `${base}/fonts/CrimsonText-Italic.woff2`, family: 'Crimson Text', weight: '400', style: 'italic', format: 'woff2', critical: false, preload: true },
  { key: ASSET_KEYS.FONT_CRIMSON_SEMIBOLD, type: 'font', src: `${base}/fonts/CrimsonText-SemiBold.woff2`, family: 'Crimson Text', weight: '600', style: 'normal', format: 'woff2', critical: false, preload: false },
  { key: ASSET_KEYS.FONT_SPECIAL_ELITE, type: 'font', src: `${base}/fonts/SpecialElite-Regular.woff2`, family: 'Special Elite', weight: '400', style: 'normal', format: 'woff2', critical: true, preload: true },
]

// ── Texture Assets ────────────────────────────────────────────────────────
// Placeholder dimensions: 400×400 tiles

const TEXTURES: ImageAsset[] = [
  { key: ASSET_KEYS.TEX_PAPER_CREAM, type: 'image', src: `${base}/images/textures/paper-cream.svg`, format: 'svg', width: 400, height: 400, alt: '', critical: false, preload: true },
  { key: ASSET_KEYS.TEX_PAPER_AGED, type: 'image', src: `${base}/images/textures/paper-aged.svg`, format: 'svg', width: 400, height: 400, alt: '', critical: false, preload: true },
  { key: ASSET_KEYS.TEX_LEATHER_DARK, type: 'image', src: `${base}/images/textures/leather-dark.svg`, format: 'svg', width: 400, height: 400, alt: '', critical: false, preload: false },
  { key: ASSET_KEYS.TEX_WOOD_DARK, type: 'image', src: `${base}/images/textures/wood-dark.svg`, format: 'svg', width: 400, height: 400, alt: '', critical: false, preload: false },
  { key: ASSET_KEYS.TEX_NOISE, type: 'image', src: `${base}/images/textures/noise.svg`, format: 'svg', width: 200, height: 200, alt: '', critical: false, preload: true },
]

// ── Station Images ────────────────────────────────────────────────────────
// Placeholder dimensions: 1920×1080

const STATION_IMAGES: ImageAsset[] = [
  { key: ASSET_KEYS.IMG_OUTSIDE_STATION, type: 'image', src: `${base}/images/station/outside-station.svg`, format: 'svg', width: 1920, height: 1080, alt: 'The station at night — rain falling, warm light within', critical: true, preload: true },
  { key: ASSET_KEYS.IMG_ENTRANCE_HALL, type: 'image', src: `${base}/images/station/entrance-hall.svg`, format: 'svg', width: 1920, height: 1080, alt: 'Station entrance hall with flickering lamps', critical: false, preload: true },
  { key: ASSET_KEYS.IMG_MAIN_HALL, type: 'image', src: `${base}/images/station/main-hall.svg`, format: 'svg', width: 1920, height: 1080, alt: 'Station main hall with high ceilings', critical: false, preload: true },
  { key: ASSET_KEYS.IMG_PLATFORM_ONE, type: 'image', src: `${base}/images/station/platform-one.svg`, format: 'svg', width: 1920, height: 1080, alt: 'Empty platform with rain outside and steam drifting', critical: false, preload: false },
  { key: ASSET_KEYS.IMG_PLATFORM_CAFE, type: 'image', src: `${base}/images/station/platform-cafe.svg`, format: 'svg', width: 1920, height: 1080, alt: 'Warm café interior with soft yellow lighting', critical: false, preload: false },
  { key: ASSET_KEYS.IMG_MEMORY_TUNNEL, type: 'image', src: `${base}/images/station/memory-tunnel.svg`, format: 'svg', width: 1920, height: 1080, alt: 'Underground tunnel lined with glowing memory posters', critical: false, preload: false },
  { key: ASSET_KEYS.IMG_WAITING_ROOM, type: 'image', src: `${base}/images/station/waiting-room.svg`, format: 'svg', width: 1920, height: 1080, alt: 'Quiet waiting room with fireplace and large windows', critical: false, preload: false },
  { key: ASSET_KEYS.IMG_PLATFORM_ELEVEN, type: 'image', src: `${base}/images/station/platform-eleven.svg`, format: 'svg', width: 1920, height: 1080, alt: 'Platform 11 — empty, foggy, one train waiting', critical: false, preload: false },
]

// ── Train Images ──────────────────────────────────────────────────────────

const TRAIN_IMAGES: ImageAsset[] = [
  { key: ASSET_KEYS.IMG_TRAIN_EXTERIOR, type: 'image', src: `${base}/images/train/train-exterior.svg`, format: 'svg', width: 1920, height: 1080, alt: 'Vintage sleeper train arriving', critical: false, preload: false },
  { key: ASSET_KEYS.IMG_TRAIN_INTERIOR, type: 'image', src: `${base}/images/train/train-interior.svg`, format: 'svg', width: 1920, height: 1080, alt: 'Warm train interior with wood panels and curtains', critical: false, preload: false },
  { key: ASSET_KEYS.IMG_TRAIN_WINDOW_FRAME, type: 'image', src: `${base}/images/train/window-frame.svg`, format: 'svg', width: 800, height: 600, alt: 'Train window frame', critical: false, preload: false },
  { key: ASSET_KEYS.IMG_TRAIN_SCENERY_RAIN, type: 'image', src: `${base}/images/train/scenery-rain.svg`, format: 'svg', width: 2400, height: 800, alt: 'Rainy night scenery from train window', critical: false, preload: false },
  { key: ASSET_KEYS.IMG_TRAIN_SCENERY_FOREST, type: 'image', src: `${base}/images/train/scenery-forest.svg`, format: 'svg', width: 2400, height: 800, alt: 'Forest scenery from train window', critical: false, preload: false },
  { key: ASSET_KEYS.IMG_TRAIN_SCENERY_MOUNTAINS, type: 'image', src: `${base}/images/train/scenery-mountains.svg`, format: 'svg', width: 2400, height: 800, alt: 'Mountain scenery from train window', critical: false, preload: false },
  { key: ASSET_KEYS.IMG_TRAIN_SCENERY_VILLAGE, type: 'image', src: `${base}/images/train/scenery-village.svg`, format: 'svg', width: 2400, height: 800, alt: 'Village lights from train window', critical: false, preload: false },
  { key: ASSET_KEYS.IMG_TRAIN_SCENERY_RIVER, type: 'image', src: `${base}/images/train/scenery-river.svg`, format: 'svg', width: 2400, height: 800, alt: 'River reflections from train window', critical: false, preload: false },
  { key: ASSET_KEYS.IMG_TRAIN_SCENERY_NIGHT, type: 'image', src: `${base}/images/train/scenery-night.svg`, format: 'svg', width: 2400, height: 800, alt: 'Night sky and stars from train window', critical: false, preload: false },
  { key: ASSET_KEYS.IMG_TRAIN_SCENERY_SUNRISE, type: 'image', src: `${base}/images/train/scenery-sunrise.svg`, format: 'svg', width: 2400, height: 800, alt: 'Sunrise horizon from train window', critical: false, preload: false },
]

// ── Field / Sunrise Images ────────────────────────────────────────────────

const FIELD_IMAGES: ImageAsset[] = [
  { key: ASSET_KEYS.IMG_SUNRISE_FIELD, type: 'image', src: `${base}/images/field/sunrise-field.svg`, format: 'svg', width: 1920, height: 1080, alt: 'Open meadow at sunrise with wildflowers and morning mist', critical: false, preload: false },
  { key: ASSET_KEYS.IMG_WILDFLOWERS, type: 'image', src: `${base}/images/field/wildflowers.svg`, format: 'svg', width: 1920, height: 600, alt: 'Wildflowers in morning light', critical: false, preload: false },
  { key: ASSET_KEYS.IMG_SINGLE_TREE, type: 'image', src: `${base}/images/field/single-tree.svg`, format: 'svg', width: 800, height: 1200, alt: 'Single tree in open field', critical: false, preload: false },
  { key: ASSET_KEYS.IMG_WOODEN_BENCH, type: 'image', src: `${base}/images/field/wooden-bench.svg`, format: 'svg', width: 600, height: 400, alt: 'Wooden bench under a tree', critical: false, preload: false },
  { key: ASSET_KEYS.IMG_GIFT_BOX, type: 'image', src: `${base}/images/field/gift-box.svg`, format: 'svg', width: 400, height: 300, alt: 'Small wooden gift box with brass latch', critical: false, preload: false },
  { key: ASSET_KEYS.IMG_MORNING_MIST, type: 'image', src: `${base}/images/field/morning-mist.svg`, format: 'svg', width: 1920, height: 400, alt: 'Morning mist over the field', critical: false, preload: false },
]

// ── Memory Postcards ──────────────────────────────────────────────────────
// Placeholder dimensions: 800×560

const POSTCARD_IMAGES: ImageAsset[] = [
  { key: ASSET_KEYS.IMG_POSTCARD_TOKYO, type: 'image', src: `${base}/images/memories/postcards/tokyo.svg`, format: 'svg', width: 800, height: 560, alt: 'Tokyo illustration — postcard front', critical: false, preload: false },
  { key: ASSET_KEYS.IMG_POSTCARD_PARIS, type: 'image', src: `${base}/images/memories/postcards/paris.svg`, format: 'svg', width: 800, height: 560, alt: 'Paris illustration — postcard front', critical: false, preload: false },
  { key: ASSET_KEYS.IMG_POSTCARD_KYOTO, type: 'image', src: `${base}/images/memories/postcards/kyoto.svg`, format: 'svg', width: 800, height: 560, alt: 'Kyoto illustration — postcard front', critical: false, preload: false },
  { key: ASSET_KEYS.IMG_POSTCARD_VENICE, type: 'image', src: `${base}/images/memories/postcards/venice.svg`, format: 'svg', width: 800, height: 560, alt: 'Venice illustration — postcard front', critical: false, preload: false },
]

// ── Memory Polaroids ──────────────────────────────────────────────────────
// Placeholder dimensions: 500×600 (square photo + bottom caption border)

const POLAROID_IMAGES: ImageAsset[] = [
  { key: ASSET_KEYS.IMG_POLAROID_PLACEHOLDER_1, type: 'image', src: `${base}/images/memories/polaroids/polaroid-001.svg`, format: 'svg', width: 500, height: 600, alt: 'Placeholder polaroid photo', critical: false, preload: false },
  { key: ASSET_KEYS.IMG_POLAROID_PLACEHOLDER_2, type: 'image', src: `${base}/images/memories/polaroids/polaroid-002.svg`, format: 'svg', width: 500, height: 600, alt: 'Placeholder polaroid photo', critical: false, preload: false },
]

// ── Audio Assets ──────────────────────────────────────────────────────────

const AUDIO_ASSETS: AudioAsset[] = [
  // Music
  { key: ASSET_KEYS.AUD_PIANO_ENTRANCE, type: 'audio', src: `${base}/audio/music/piano-entrance.mp3`, format: 'mp3', critical: false, preload: true },
  { key: ASSET_KEYS.AUD_STRINGS_MAIN_HALL, type: 'audio', src: `${base}/audio/music/strings-main-hall.mp3`, format: 'mp3', critical: false, preload: false },
  { key: ASSET_KEYS.AUD_JAZZ_CAFE, type: 'audio', src: `${base}/audio/music/jazz-cafe.mp3`, format: 'mp3', critical: false, preload: false },
  { key: ASSET_KEYS.AUD_AMBIENT_TUNNEL, type: 'audio', src: `${base}/audio/music/ambient-tunnel.mp3`, format: 'mp3', critical: false, preload: false },
  { key: ASSET_KEYS.AUD_SILENCE_WAITING, type: 'audio', src: `${base}/audio/music/silence-waiting-room.mp3`, format: 'mp3', critical: false, preload: false },
  { key: ASSET_KEYS.AUD_PIANO_TRAIN, type: 'audio', src: `${base}/audio/music/piano-train.mp3`, format: 'mp3', critical: false, preload: false },
  { key: ASSET_KEYS.AUD_PIANO_SUNRISE, type: 'audio', src: `${base}/audio/music/piano-sunrise.mp3`, format: 'mp3', critical: false, preload: false },
  { key: ASSET_KEYS.AUD_ENDING_UPLIFTING, type: 'audio', src: `${base}/audio/music/ending-uplifting.mp3`, format: 'mp3', critical: false, preload: false },
  // Ambient
  { key: ASSET_KEYS.AUD_AMB_RAIN_EXT, type: 'audio', src: `${base}/audio/ambient/rain-exterior.mp3`, format: 'mp3', critical: true, preload: true },
  { key: ASSET_KEYS.AUD_AMB_RAIN_INT, type: 'audio', src: `${base}/audio/ambient/rain-interior.mp3`, format: 'mp3', critical: false, preload: true },
  { key: ASSET_KEYS.AUD_AMB_RAIN_WINDOW, type: 'audio', src: `${base}/audio/ambient/rain-window.mp3`, format: 'mp3', critical: false, preload: false },
  { key: ASSET_KEYS.AUD_AMB_WIND_PLATFORM, type: 'audio', src: `${base}/audio/ambient/wind-platform.mp3`, format: 'mp3', critical: false, preload: false },
  { key: ASSET_KEYS.AUD_AMB_STATION, type: 'audio', src: `${base}/audio/ambient/station-atmosphere.mp3`, format: 'mp3', critical: false, preload: false },
  { key: ASSET_KEYS.AUD_AMB_CAFE, type: 'audio', src: `${base}/audio/ambient/cafe-background.mp3`, format: 'mp3', critical: false, preload: false },
  { key: ASSET_KEYS.AUD_AMB_TRAIN_MOVING, type: 'audio', src: `${base}/audio/ambient/train-moving.mp3`, format: 'mp3', critical: false, preload: false },
  { key: ASSET_KEYS.AUD_AMB_BIRDS, type: 'audio', src: `${base}/audio/ambient/birds-morning.mp3`, format: 'mp3', critical: false, preload: false },
  { key: ASSET_KEYS.AUD_AMB_FIELD, type: 'audio', src: `${base}/audio/ambient/field-ambient.mp3`, format: 'mp3', critical: false, preload: false },
  { key: ASSET_KEYS.AUD_AMB_VINYL, type: 'audio', src: `${base}/audio/ambient/vinyl-crackle.mp3`, format: 'mp3', critical: false, preload: false },
  { key: ASSET_KEYS.AUD_AMB_FIREPLACE, type: 'audio', src: `${base}/audio/ambient/fireplace.mp3`, format: 'mp3', critical: false, preload: false },
  // SFX
  { key: ASSET_KEYS.AUD_SFX_PAPER_UNFOLD, type: 'audio', src: `${base}/audio/sfx/paper-unfold.mp3`, format: 'mp3', critical: false, preload: true },
  { key: ASSET_KEYS.AUD_SFX_WAX_SEAL, type: 'audio', src: `${base}/audio/sfx/wax-seal-break.mp3`, format: 'mp3', critical: false, preload: false },
  { key: ASSET_KEYS.AUD_SFX_PAGE_TURN, type: 'audio', src: `${base}/audio/sfx/page-turn.mp3`, format: 'mp3', critical: false, preload: true },
  { key: ASSET_KEYS.AUD_SFX_NOTEBOOK_OPEN, type: 'audio', src: `${base}/audio/sfx/notebook-open.mp3`, format: 'mp3', critical: false, preload: true },
  { key: ASSET_KEYS.AUD_SFX_NOTEBOOK_CLOSE, type: 'audio', src: `${base}/audio/sfx/notebook-close.mp3`, format: 'mp3', critical: false, preload: false },
  { key: ASSET_KEYS.AUD_SFX_POLAROID, type: 'audio', src: `${base}/audio/sfx/polaroid-develop.mp3`, format: 'mp3', critical: false, preload: false },
  { key: ASSET_KEYS.AUD_SFX_TICKET_STAMP, type: 'audio', src: `${base}/audio/sfx/ticket-stamp.mp3`, format: 'mp3', critical: false, preload: false },
  { key: ASSET_KEYS.AUD_SFX_CASSETTE_INSERT, type: 'audio', src: `${base}/audio/sfx/cassette-insert.mp3`, format: 'mp3', critical: false, preload: false },
  { key: ASSET_KEYS.AUD_SFX_BOX_OPEN, type: 'audio', src: `${base}/audio/sfx/box-open.mp3`, format: 'mp3', critical: false, preload: false },
  { key: ASSET_KEYS.AUD_SFX_BOX_LATCH, type: 'audio', src: `${base}/audio/sfx/box-latch.mp3`, format: 'mp3', critical: false, preload: false },
  { key: ASSET_KEYS.AUD_SFX_PAPER_RUSTLE, type: 'audio', src: `${base}/audio/sfx/paper-rustle.mp3`, format: 'mp3', critical: false, preload: false },
  { key: ASSET_KEYS.AUD_SFX_MEMORY_COLLECT, type: 'audio', src: `${base}/audio/sfx/memory-collect.mp3`, format: 'mp3', critical: false, preload: false },
  { key: ASSET_KEYS.AUD_SFX_POSTCARD_FLIP, type: 'audio', src: `${base}/audio/sfx/postcard-flip.mp3`, format: 'mp3', critical: false, preload: false },
  { key: ASSET_KEYS.AUD_SFX_FLOWER_RUSTLE, type: 'audio', src: `${base}/audio/sfx/flower-rustle.mp3`, format: 'mp3', critical: false, preload: false },
  { key: ASSET_KEYS.AUD_SFX_TRAIN_WHISTLE, type: 'audio', src: `${base}/audio/sfx/train-whistle.mp3`, format: 'mp3', critical: false, preload: false },
  { key: ASSET_KEYS.AUD_SFX_TRAIN_BRAKE, type: 'audio', src: `${base}/audio/sfx/train-brake.mp3`, format: 'mp3', critical: false, preload: false },
  { key: ASSET_KEYS.AUD_SFX_TRAIN_DOOR, type: 'audio', src: `${base}/audio/sfx/train-door.mp3`, format: 'mp3', critical: false, preload: false },
  { key: ASSET_KEYS.AUD_SFX_ANNOUNCEMENT, type: 'audio', src: `${base}/audio/sfx/announcement-static.mp3`, format: 'mp3', critical: false, preload: false },
  { key: ASSET_KEYS.AUD_SFX_COFFEE_CUP, type: 'audio', src: `${base}/audio/sfx/coffee-cup.mp3`, format: 'mp3', critical: false, preload: false },
  { key: ASSET_KEYS.AUD_SFX_CLOCK_TICK, type: 'audio', src: `${base}/audio/sfx/clock-tick.mp3`, format: 'mp3', critical: false, preload: false },
  { key: ASSET_KEYS.AUD_SFX_BIRDS_FLY, type: 'audio', src: `${base}/audio/sfx/birds-fly.mp3`, format: 'mp3', critical: false, preload: false },
  // Voice
  { key: ASSET_KEYS.AUD_VOICE_CASSETTE_A, type: 'audio', src: `${base}/audio/voice/cassette-a.mp3`, format: 'mp3', critical: false, preload: false },
  { key: ASSET_KEYS.AUD_VOICE_CASSETTE_B, type: 'audio', src: `${base}/audio/voice/cassette-b.mp3`, format: 'mp3', critical: false, preload: false },
  { key: ASSET_KEYS.AUD_VOICE_CASSETTE_C, type: 'audio', src: `${base}/audio/voice/cassette-c.mp3`, format: 'mp3', critical: false, preload: false },
]

// ── Combined Manifest ─────────────────────────────────────────────────────

export const ASSET_MANIFEST: Asset[] = [
  ...FONTS,
  ...TEXTURES,
  ...STATION_IMAGES,
  ...TRAIN_IMAGES,
  ...FIELD_IMAGES,
  ...POSTCARD_IMAGES,
  ...POLAROID_IMAGES,
  ...AUDIO_ASSETS,
]

// ── Lookup helpers ────────────────────────────────────────────────────────

/** Build a key→src lookup at startup for O(1) resolution */
const _srcMap = new Map<string, string>(
  ASSET_MANIFEST.map((a) => [a.key, a.src])
)

/**
 * Resolve an asset key to its src path.
 * This is the only function that should return a path string.
 */
export function getSrc(key: AssetKey): string {
  const src = _srcMap.get(key)
  if (!src) {
    console.warn(`[AssetManifest] Unknown asset key: "${key}"`)
    return ''
  }
  return src
}

/**
 * Get the full asset descriptor for a key.
 */
export function getAsset(key: AssetKey): Asset | undefined {
  return ASSET_MANIFEST.find((a) => a.key === key)
}

export { FONTS, TEXTURES, STATION_IMAGES, TRAIN_IMAGES, FIELD_IMAGES, POLAROID_IMAGES, AUDIO_ASSETS }
