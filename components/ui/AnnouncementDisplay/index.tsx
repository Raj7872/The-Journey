'use client'

import { useEffect, useState } from 'react'

import { announcementManager } from '@/engine/AnnouncementManager/AnnouncementManager'
import type { Announcement } from '@/engine/AnnouncementManager/AnnouncementManager'

/**
 * AnnouncementDisplay
 *
 * Renders station speaker announcements as subtle text at the bottom of the screen.
 * Fades in slowly, never interrupts reading or interaction.
 * No icon, no border — just the words, almost ghostlike.
 */
export function AnnouncementDisplay() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const unsubscribe = announcementManager.subscribe((ann) => {
      if (ann) {
        setAnnouncement(ann)
        // Slight delay before showing — like a crackle before the voice
        setTimeout(() => setVisible(true), 600)
      } else {
        setVisible(false)
        setTimeout(() => setAnnouncement(null), 1000)
      }
    })
    return unsubscribe
  }, [])

  if (!announcement) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 36,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 30,
        pointerEvents: 'none',
        textAlign: 'center',
        transition: 'opacity 1s ease',
        opacity: visible ? 1 : 0,
        maxWidth: 480,
        padding: '0 24px',
      }}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <p
        style={{
          fontFamily: 'var(--font-body, "Crimson Text", Georgia, serif)',
          fontStyle: 'italic',
          fontSize: 14,
          color: 'rgba(242,232,213,0.35)',
          letterSpacing: '0.04em',
          lineHeight: 1.7,
        }}
      >
        {announcement.text}
      </p>
    </div>
  )
}
