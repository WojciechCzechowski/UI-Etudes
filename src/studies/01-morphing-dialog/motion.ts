import type { Transition } from 'motion/react'

// Motion values specific to this study. The reasoning for each is in README.md.

// Surface morph (button to dialog and back). Duration-based, so slow motion
// is a multiplier on `duration`.
export const surfaceDuration = 0.4
export const surfaceSpring: Transition = {
  type: 'spring',
  duration: surfaceDuration,
  bounce: 0,
}
// Alternatives to try (change `surfaceDuration` to match):
// Snappy: { type: 'spring', duration: 0.3, bounce: 0.1 }
// Lively: { type: 'spring', duration: 0.45, bounce: 0.2 }

export const overlayFade: Transition = { duration: 0.2, ease: 'easeOut' }

// The error message inside the form appearing and disappearing.
export const stateFade: Transition = { duration: 0.15, ease: 'easeOut' }
