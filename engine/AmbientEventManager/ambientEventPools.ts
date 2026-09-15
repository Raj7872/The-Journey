// ─────────────────────────────────────────────────────────────────────────────
// Ambient Event Pools
// Which ambient event types are plausible in which station scene.
// Registered once at startup — see AmbientEventProvider.
// ─────────────────────────────────────────────────────────────────────────────

import type { SceneId } from '@/types/scene'
import type { AmbientEventType } from './AmbientEventManager'

export const AMBIENT_EVENT_POOLS: Partial<Record<SceneId, AmbientEventType[]>> = {
  'outside-station': ['pigeons-fly', 'leaves-drift', 'train-horn'],
  'entrance-hall': ['lamp-sway'],
  'main-hall': ['lamp-sway', 'newspaper-flutter'],
  'platform-one': ['leaves-drift', 'train-horn'],
  'platform-cafe': ['cat-walk'],
  'memory-tunnel': ['lamp-sway'],
  'waiting-room': ['cat-walk'],
  'platform-eleven': ['train-horn'],
  'train-interior': ['train-horn', 'newspaper-flutter'],
  'final-carriage': ['train-horn'],
}
