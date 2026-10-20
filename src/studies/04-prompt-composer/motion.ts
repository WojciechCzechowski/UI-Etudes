import type { Transition } from 'motion/react'

// Motion values specific to this study.

// The tab pill travelling to the selected tab. Duration-based, so slow motion
// is a multiplier on `duration`. It is the equivalent of stiffness 500,
// damping 38, mass 1 (angular frequency 22.4 rad/s, damping ratio 0.85), a
// slight overshoot. A critically damped alternative: bounce 0.
export const tabPillSpring: Transition = {
  type: 'spring',
  duration: 0.6,
  bounce: 0.15,
}

// The composer card changing height (suggestions open and close). The same
// spring as the tab pill, so both move with one feel. Alternatives to try:
// Softer: { type: 'spring', duration: 0.35, bounce: 0 }
export const composerSpring: Transition = tabPillSpring
