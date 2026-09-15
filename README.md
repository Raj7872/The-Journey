# The Last Train Home

> *Every destination tells a story. This one ends with a question.*

An interactive cinematic experience built as a love story told through an old railway station at midnight. The player explores the station, discovers memories scattered through the world, boards the last train, and arrives at a sunrise field where a proposal awaits.

---

## Table of Contents

- [Quick Start](#quick-start)
- [Development](#development)
- [Build & Deploy](#build--deploy)
- [Project Architecture](#project-architecture)
- [Folder Structure](#folder-structure)
- [How to Customize](#how-to-customize)
- [How to Add New Memories](#how-to-add-new-memories)
- [How to Replace Assets](#how-to-replace-assets)
- [System Architecture](#system-architecture)
- [Environment Variables](#environment-variables)

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env.local

# 3. Edit .env.local — set the recipient's name
# NEXT_PUBLIC_RECIPIENT_NAME="Her Name"

# 4. Start development server
npm run dev

# 5. Open http://localhost:3000
```

**Node.js 22+ required. npm 10+ required.**

---

## Development

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run type-check   # TypeScript check — must pass with zero errors
npm run lint         # ESLint — must pass with zero warnings
npm run format       # Prettier format
npm run format:check # Check formatting without writing
```

Never run `npm run build` while `npm run dev` is running — both write to the
same `.next` folder and can corrupt it. Stop the dev server first.

---

## Build & Deploy

### Local Build

```bash
npm run build   # Produces /out directory (static export)
npm run start   # Preview the built output locally
```

### Cloudflare Pages

1. Connect your repository to Cloudflare Pages
2. Set build command: `npm run build`
3. Set output directory: `out`
4. Set `NEXT_PUBLIC_RECIPIENT_NAME` in the Cloudflare Pages dashboard
5. Deploy

Because this is a static export, `NEXT_PUBLIC_RECIPIENT_NAME` is baked in at
**build time** — changing it in the dashboard requires a new deploy (push a
commit, or trigger a manual redeploy) before it takes effect.

---

## Project Architecture

The project is split into two layers:

### `/engine` — The Engine
Generic, story-agnostic systems. Contains zero relationship-specific content.

**Systems:**
| System | Responsibility |
|--------|---------------|
| `EmotionDirector` | Central emotional state. All atmosphere systems subscribe to this. |
| `SceneManager` | Current act/scene, transitions, unlock state |
| `SaveManager` | Versioned localStorage save/restore |
| `AudioManager` | Howler.js wrapper — music, ambient, SFX, crossfade |
| `NotebookManager` | Collection state, notebook open/close, page navigation |
| `WeatherManager` | Rain, fog, wind — derived from EmotionDirector |
| `LightingManager` | Color temperature, brightness — writes CSS variables |
| `CameraManager` | CSS-transform camera movement with ambient float |
| `AnimationManager` | Reduced motion detection, duration gating |
| `CursorManager` | Custom cursor state machine |
| `AnnouncementManager` | Context-aware, non-repeating station announcements |
| `AssetPipeline` | Asset registration, preloading, load state |
| `TimelineDirector` | Per-scene lighting/particle/music profiles, clock progression |

### `/content` — The Story
Everything specific to *The Last Train Home*. No engine logic.
Swapping content creates a completely different story on the same engine.

```
content/
  memories/      ← All discoverable collectibles + the 100 hidden letters
  announcements/ ← Station announcement text pools
  proposal/      ← Proposal text, question, credits, secret ending
  train/         ← Train interior music playlist
  assets/        ← Asset manifest (paths and metadata for all files)
```

---

## Folder Structure

```
/
├── app/                    Next.js App Router
│   ├── layout.tsx          Root layout, metadata, font preloads
│   ├── page.tsx            Entry point → <Experience />
│   ├── icon.svg             Favicon (App Router auto-detected)
│   ├── loading.tsx         App-level Suspense fallback
│   └── not-found.tsx       404 page
│
├── engine/                 Reusable engine systems (no story content)
│   ├── EmotionDirector/    Central atmosphere state machine
│   ├── TimelineDirector/   Per-scene lighting/particle/music profiles
│   ├── SceneManager/       Scene and act management
│   ├── SaveManager/        Versioned save/restore
│   ├── AudioManager/       Howler.js audio wrapper
│   ├── NotebookManager/    Collection and notebook state
│   ├── WeatherManager/     Weather state (derived from emotion)
│   ├── LightingManager/    Lighting state + CSS variables
│   ├── CameraManager/      Camera movement and float
│   ├── AnimationManager/   Reduced motion and duration gating
│   ├── CursorManager/      Custom cursor state
│   ├── AnnouncementManager/Station announcements
│   ├── AssetPipeline/      Asset registration and preloading
│   └── ErrorBoundaries/    Scoped error boundaries
│
├── content/                Story content (no engine logic)
│   ├── memories/           All collectibles by category
│   │   ├── letters/        6 handwritten letters, scattered through the station + train
│   │   ├── postcards/      4 postcards (3 past destinations + 1 forward-looking)
│   │   ├── tickets/        3 tickets (2 on the journey + 1 secret, post-proposal)
│   │   ├── polaroids/      2 developing photographs
│   │   ├── receipts/       1 café receipt
│   │   ├── flowers/        1 pressed flower
│   │   ├── doodles/        1 sketch
│   │   ├── bookmarks/      1 bookmark
│   │   ├── cassettes/      1 cassette (display-only prop, no audio playback wired)
│   │   └── hidden/         100 "Hidden" tab letters — unlock silently, 5 at a time,
│   │                       each time one of the 20 real collectibles above is found
│   ├── announcements/      Announcement text pools
│   ├── proposal/           Proposal text configuration — the actual climax script
│   ├── train/              Train interior music player playlist
│   └── assets/             Asset manifest
│
├── features/
│   ├── experience/         Root orchestrator component
│   ├── actI-arrival/       Outside Station, Entrance Hall
│   ├── actII-exploration/  Main Hall, Platform One, Café, Tunnel, Waiting Room
│   ├── actIII-boarding/    Platform Eleven, Train Arrival
│   ├── actIV-journey/      Train Interior (the ride + final carriage)
│   ├── actV-sunrise/       Field, Bench, Gift, Silence, Question
│   ├── actVI-ending/       World Changes, Credits
│   └── world/              Scene routing, memory reveal popup
│
├── components/             Shared UI components
│   ├── world/               WorldObject (collectibles), ScaledStage (responsive scaling)
│   ├── station/              StationObject (nav hotspots), Clock, DepartureBoard
│   ├── notebook/             Notebook UI, per-category renderers
│   └── background/           Particle/fog/rain systems (Three.js)
├── hooks/                  React hooks
├── lib/
│   ├── constants/          timing, colors, z-index, breakpoints
│   └── utils/              math, time, storage, array helpers
├── types/                  All TypeScript type definitions
├── styles/
│   └── globals.css         CSS variables, resets, atmosphere system
└── public/
    ├── images/             All image assets (real photos + illustrated scenes)
    ├── audio/              All audio assets
    └── fonts/              All font files
```

---

## How to Customize

Everything you'd actually want to personalize lives in `content/`. None of it
requires touching engine code or UI components.

### Change the recipient's name

Edit `.env.local`:
```bash
NEXT_PUBLIC_RECIPIENT_NAME="Emma"
```

This name appears on the final ticket and in the proposal. Requires a rebuild
to take effect (see [Build & Deploy](#build--deploy)).

### Edit the proposal / climax content

`content/proposal/proposal.ts` — the entire climax script: the final letter
(`finalLetterLines`, `finalLetterPause`), the question and subtext, the Yes
button label, the gift-box ticket, the credits, and the secret ending text.

### Edit discoverable memories

Each category has its own file under `content/memories/` — e.g.
`content/memories/letters/letters.ts`, `postcards/postcards.ts`, etc. Edit
the `body`/`caption`/`backText`/etc. fields directly.

### Edit the 100 hidden letters

`content/memories/hidden/hiddenLetters.ts` — a flat array of 100 strings
(`HIDDEN_LETTER_LINES`). Edit any line directly; everything else (IDs,
unlock order, notebook wiring) is generated from that array automatically.
`content/memories/hidden/unlockMap.ts` controls which 5 letters unlock with
which real collectible — only needs editing if you add/remove a collectible.

### Edit the Memory Tunnel wall photos

`features/actII-exploration/MemoryTunnel/index.tsx` — the `MEMORY_POSTERS`
array near the top of the file. Each entry has a `label` (the caption shown
under/below the photo) and an optional `image` path. Drop photos in
`public/images/memories/tunnel/` and point `image` at them; leave `image`
unset to fall back to a placeholder frame.

### Edit the train interior music

`content/train/playlist.ts` — drop MP3s in `public/audio/train-player/` and
list them in the `TRAIN_PLAYLIST` array. Leave the array empty to hide the
music player entirely.

---

## How to Add New Memories

### 1. Add content to the appropriate category file

Example — adding a new letter (`content/memories/letters/letters.ts`):

```typescript
{
  id: 'letter-007',              // Must be unique across ALL memories
  category: 'letter',
  title: 'The Museum',
  location: {
    scene: 'waiting-room',       // Which scene the object appears in
    description: 'Under the reading lamp on the side table',
    visualHint: { x: 75, y: 60 }, // Approximate visual position (0–100%)
  },
  animation: { type: 'unfold', duration: 800, reversible: true },
  audio: { sfx: 'paper-unfold', closeSfx: 'paper-rustle' },
  unlockCondition: { type: 'free' }, // or 'act-reached', etc.
  notebookSection: 1,            // Letters = section 1
  notebookOrder: 7,              // Position within the section
  date: 'October 22nd — fourteen months ago',
  body: `Your letter body here. Supports <em>italic</em> and <br> tags.`,
  signature: '— R',
  inkVariation: 'medium',
  paperRotation: -0.8,
}
```

You'll also need to wire it into its scene component as a `<WorldObject>`
with `onInteract={() => { collect(memory); reveal(memory) }}` — see any
existing scene file for the pattern. Pass `isCollectible` so it participates
in the periodic hint-pulse glow (see below).

### 2. The memory appears automatically

- The `NotebookManager` registers all memories from `content/memories/index.ts`
- The save system tracks collection state by ID
- The notebook fills itself — no notebook UI changes needed

### Unlock Conditions

```typescript
// Always available
{ type: 'free' }

// After a specific memory is collected
{ type: 'after-memory', memoryId: 'letter-001' }

// After collecting N memories in a category
{ type: 'after-category-count', category: 'letter', count: 5 }

// Only after all other memories collected (final letter only)
{ type: 'all-other-collected' }

// After reaching a specific act/scene
{ type: 'act-reached', actId: 'act-journey' }
```

### The hint-pulse glow

Real, findable collectibles (as opposed to purely decorative `WorldObject`s
with no memory behind them) get a soft, periodic glow while unfound — every
5 seconds, for about a second, synced across every collectible on screen.
Pass `isCollectible` on the `<WorldObject>` to opt in:

```tsx
<WorldObject
  isCollected={memory ? isCollected(memory.id) : false}
  isCollectible={!!memory}
  ...
>
```

Leave it unset for decorative objects, or deliberately omit it for a
no-hints-given secret (see the hidden bonus ticket in `WorldChanges`).

---

## How to Replace Assets

### Fonts

Replace files in `/public/fonts/`. File names must match exactly:
```
IMFellEnglish-Regular.woff2
IMFellEnglish-Italic.woff2
CrimsonText-Regular.woff2
CrimsonText-Italic.woff2
CrimsonText-SemiBold.woff2
SpecialElite-Regular.woff2
```

### Images

Real photos (postcards, polaroids, tunnel wall photos) are plain `.png`/`.jpg`
files referenced directly by path in their content file — no manifest entry
needed. Illustrated station backgrounds are `.svg`. **Filenames are
case-sensitive on deploy** even though Windows won't warn you locally —
double-check the exact case matches between the content file and the file on
disk before pushing.

Recommended dimensions for real photos:
- Polaroids / tunnel wall photos: ~900×1000px, roughly square/slightly portrait
- Postcards (front): ~800×560px

### Audio

Replace/add files in `/public/audio/`. All audio should be `.mp3` format.

```
/public/audio/
  music/          ← Background music tracks (loop-ready)
  ambient/        ← Ambient layers (seamless loops)
  sfx/            ← Sound effects (one-shots)
  voice/          ← Cassette voice recordings (not currently played back — see below)
  train-player/   ← Train interior music player playlist (see content/train/playlist.ts)
```

To add a new SFX, add its key to `types/audio.ts`, then add its path in
`AudioManager.ts`'s `resolveAudioPath` method.

### Cassette

The cassette (`content/memories/cassettes/cassettes.ts`) is currently a
**display-only prop** — it shows tape art and a label, but nothing plays
`audioSrc` on click. If you want it to actually play back a recording,
that playback wiring (a play button + `AudioManager` hookup) still needs to
be built.

---

## System Architecture

### Emotion Flow

```
Player action (scene change, discovery)
    ↓
EmotionDirector.transitionTo(newEmotion)
    ↓
Interpolates AtmosphereConfig over time
    ↓
Subscribers react:
  WeatherManager   → rain intensity, fog, wind
  LightingManager  → color temperature, CSS variables
  AudioManager     → music crossfade, ambient layer sync
  AnnouncementManager → pool selection, frequency
```

### Save Flow

```
Player collects memory
    ↓
NotebookManager.collect(memory)
    ↓
SaveManager.collectMemory(id)  [debounced 500ms write]
    ↓
localStorage persisted
    ↓
Page refresh → SaveManager.hydrate() restores all state
```

### Provider Hierarchy

```
<SaveProvider>
  <SceneProvider>
    <EmotionProvider>
      <AnimationProvider>
        <LightingProvider>
          <WeatherProvider>
            <CameraProvider>
              <AudioProvider>
                <NotebookProvider>
                  <CursorProvider>
                    {scenes and UI}
                  </CursorProvider>
                </NotebookProvider>
              </AudioProvider>
            </CameraProvider>
          </WeatherProvider>
        </LightingProvider>
      </AnimationProvider>
    </EmotionProvider>
  </SceneProvider>
</SaveProvider>
```

### Responsive scaling

Every scene is a fixed 1440×900 composition (`components/world/ScaledStage`)
that's uniformly scaled (never reflowed) to fit the real window — tablet and
laptop are the supported/tuned targets; phone-sized screens work but are not
the focus. The custom cursor, notebook, and debug/settings panels intentionally
live outside this scaled layer since they track real screen pixels.

---

## Environment Variables

Only two variables are actually read by the app. The rest exist in
`.env.example` for future use but aren't wired to any code yet — setting
them currently does nothing.

| Variable | Default | Wired? | Description |
|----------|---------|--------|-------------|
| `NEXT_PUBLIC_RECIPIENT_NAME` | `"You"` | ✅ | Name shown on the final ticket and in the proposal |
| `NEXT_PUBLIC_ASSET_BASE_URL` | `""` | ✅ | CDN base URL override for assets |
| `NEXT_PUBLIC_DEBUG_SCENES` | `false` | — | Documented, not yet wired |
| `NEXT_PUBLIC_SKIP_PRELOADER` | `false` | — | Documented, not yet wired |
| `NEXT_PUBLIC_VERBOSE_LOGGING` | `false` | — | Documented, not yet wired |
| `NEXT_PUBLIC_START_AT_PROPOSAL` | `false` | — | Documented, not yet wired |
| `NEXT_PUBLIC_AUDIO_ENABLED` | `true` | — | Documented, not yet wired |
| `NEXT_PUBLIC_ENABLE_WEBGL` | `true` | — | Documented, not yet wired |
| `NEXT_PUBLIC_ENABLE_CUSTOM_CURSOR` | `true` | — | Documented, not yet wired |

The in-app debug panel (bottom-left, dev only) covers scene teleporting,
notebook unlock/reset, and weather/time overrides without needing any of
these flags.

---

*Built for one person. Discovered by one person. Remembered forever.*
