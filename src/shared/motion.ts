import type { Transition } from 'motion/react'

// Motion tokens shared by every study. A value is added only when a study
// needs it. The reasoning for each value lives in that study's NOTES.md.

// Surface morph (button to dialog and back). Duration-based, so slow motion
// is a multiplier on `duration`.
export const surfaceSpring: Transition = {
  type: 'spring',
  duration: 0.4,
  bounce: 0,
}
// Alternatives to try:
// Snappy: { type: 'spring', duration: 0.3, bounce: 0.1 }
// Lively: { type: 'spring', duration: 0.45, bounce: 0.2 }

// Content fades in after the surface has settled, and out before it collapses.
export const contentFadeIn: Transition = {
  duration: 0.15,
  delay: 0.15,
  ease: 'easeOut',
}
export const contentFadeOut: Transition = { duration: 0.1, ease: 'easeIn' }

export const overlayFade: Transition = { duration: 0.2, ease: 'easeOut' }

// Small state changes inside a surface, for example an error message.
export const stateFade: Transition = { duration: 0.15, ease: 'easeOut' }

// Replaces the morph when reduced motion is on.
export const crossfade: Transition = { duration: 0.15, ease: 'easeOut' }

// Multiplies the time based parts of a transition. Used by slow motion.
export function scaleTransition(
  transition: Transition,
  factor: number,
): Transition {
  if (factor === 1) return transition
  const scaled = { ...transition } as Record<string, unknown>
  if (typeof scaled.duration === 'number') scaled.duration *= factor
  if (typeof scaled.delay === 'number') scaled.delay *= factor
  return scaled as Transition
}
