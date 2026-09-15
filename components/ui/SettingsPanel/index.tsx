'use client'

import { useState } from 'react'

import { useSave } from '@/engine/SaveManager/SaveContext'
import { useAudio } from '@/engine/AudioManager/AudioContext'
import { useAnimationManager } from '@/engine/AnimationManager/AnimationContext'
import { Z_INDEX } from '@/lib/constants/zIndex'
import { COLORS } from '@/lib/constants/colors'

/**
 * SettingsPanel
 *
 * A small, always-available settings affordance — same "always there, never
 * in the way" philosophy as the notebook tab. Holds volume/motion controls
 * and the only real (non-debug) way to restart the whole story, gated
 * behind a confirmation step since it clears all progress.
 */
export function SettingsPanel() {
  const { save, updateSettings, resetJourney } = useSave()
  const { setMusicVolume, setSfxVolume } = useAudio()
  const { setReducedMotion } = useAnimationManager()
  const [expanded, setExpanded] = useState(false)
  const [confirmingReset, setConfirmingReset] = useState(false)

  function handleRestart() {
    resetJourney()
    window.location.reload()
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: Z_INDEX.SETTINGS,
        fontFamily: 'var(--font-mono, "Special Elite", monospace)',
      }}
    >
      <button
        onClick={() => setExpanded((v) => !v)}
        aria-label={expanded ? 'Close settings' : 'Open settings'}
        style={{
          all: 'unset',
          cursor: 'none',
          width: 34,
          height: 34,
          borderRadius: '50%',
          background: 'rgba(8,9,14,0.6)',
          border: `1px solid ${COLORS.BRASS_DIM}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(212,132,58,0.7)',
          fontSize: 14,
        }}
      >
        ⚙
      </button>

      {expanded && (
        <div
          style={{
            marginTop: 8,
            width: 240,
            background: 'rgba(8,9,14,0.95)',
            border: `1px solid ${COLORS.BRASS_DIM}`,
            borderRadius: 4,
            padding: 16,
            boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-display, "IM Fell English", Georgia, serif)',
              fontSize: 15,
              color: COLORS.PAPER_CREAM,
              marginBottom: 14,
              opacity: 0.9,
            }}
          >
            Settings
          </div>

          <label style={{ display: 'block', marginBottom: 12 }}>
            <div style={{ fontSize: 9, letterSpacing: '1px', color: 'rgba(242,232,213,0.6)', marginBottom: 4 }}>
              MUSIC
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={save.settings.musicVolume}
              onChange={(e) => {
                const value = Number(e.target.value)
                setMusicVolume(value)
                updateSettings({ musicVolume: value })
              }}
              style={{ width: '100%', cursor: 'none' }}
            />
          </label>

          <label style={{ display: 'block', marginBottom: 14 }}>
            <div style={{ fontSize: 9, letterSpacing: '1px', color: 'rgba(242,232,213,0.6)', marginBottom: 4 }}>
              SOUND EFFECTS
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={save.settings.sfxVolume}
              onChange={(e) => {
                const value = Number(e.target.value)
                setSfxVolume(value)
                updateSettings({ sfxVolume: value })
              }}
              style={{ width: '100%', cursor: 'none' }}
            />
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'none', marginBottom: 16 }}>
            <input
              type="checkbox"
              checked={save.settings.reducedMotion}
              onChange={(e) => {
                setReducedMotion(e.target.checked)
                updateSettings({ reducedMotion: e.target.checked })
              }}
            />
            <span style={{ fontSize: 10, letterSpacing: '1px', color: 'rgba(242,232,213,0.7)' }}>
              Reduce motion
            </span>
          </label>

          <div style={{ borderTop: `1px solid ${COLORS.BRASS_DIM}`, paddingTop: 14 }}>
            {!confirmingReset ? (
              <button
                onClick={() => setConfirmingReset(true)}
                style={{
                  all: 'unset',
                  cursor: 'none',
                  display: 'block',
                  width: '100%',
                  textAlign: 'center',
                  padding: '10px 0',
                  border: '1px solid rgba(212,132,58,0.3)',
                  borderRadius: 3,
                  fontSize: 10,
                  letterSpacing: '1px',
                  color: 'rgba(212,132,58,0.7)',
                }}
              >
                Restart the Story
              </button>
            ) : (
              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontFamily: 'var(--font-body, "Crimson Text", Georgia, serif)',
                    fontStyle: 'italic',
                    color: 'rgba(242,232,213,0.75)',
                    marginBottom: 10,
                    textAlign: 'center',
                  }}
                >
                  This clears everything you&rsquo;ve found. Are you sure?
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => setConfirmingReset(false)}
                    style={{
                      all: 'unset',
                      cursor: 'none',
                      flex: 1,
                      textAlign: 'center',
                      padding: '10px 0',
                      border: '1px solid rgba(242,232,213,0.25)',
                      borderRadius: 3,
                      fontSize: 10,
                      letterSpacing: '1px',
                      color: 'rgba(242,232,213,0.65)',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRestart}
                    style={{
                      all: 'unset',
                      cursor: 'none',
                      flex: 1,
                      textAlign: 'center',
                      padding: '10px 0',
                      border: '1px solid rgba(212,80,58,0.5)',
                      borderRadius: 3,
                      background: 'rgba(212,80,58,0.12)',
                      fontSize: 10,
                      letterSpacing: '1px',
                      color: 'rgba(232,140,120,0.9)',
                    }}
                  >
                    Restart
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
