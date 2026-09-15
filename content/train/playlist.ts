// ─────────────────────────────────────────────────────────────────────────────
// Train Music Player — Playlist
// Add your own songs: drop MP3 files into public/audio/train-player/ and
// list them below. Nothing else needs to change — the player reads this
// array directly. Leave the array empty to hide the player entirely.
// ─────────────────────────────────────────────────────────────────────────────

export interface TrainPlaylistTrack {
  id: string
  title: string
  /** Path relative to /public, e.g. '/audio/train-player/song-1.mp3' */
  src: string
}

export const TRAIN_PLAYLIST: TrainPlaylistTrack[] = [
  { id: 'co2', title: 'Co2', src: '/audio/train-player/Co2.mp3' },
  { id: 'collide', title: 'Collide', src: '/audio/train-player/Collide.mp3' },
  { id: 'kabisado', title: 'Kabisado', src: '/audio/train-player/Kabisado.mp3' },
  { id: 'tahanan', title: 'Tahanan', src: '/audio/train-player/Tahanan.mp3' },
]
