import type { Transition } from 'motion/react'

// Motion values specific to this study.

// The tab pill travelling to the selected tab. Duration-based, so slow motion
// is a multiplier on `duration`. It is the equivalent of stiffness 500,
// damping 38, mass 1 (angular frequency 22.4 rad/s, damping ratio 0.85), a
// slight overshoot. A critically damped alternative: bounce 0.
export const tabPillSpring: Transition = {
  type: 'tween',
  duration: 0.3,
  ease: 'easeInOut',
}

// The composer card changing height. The timing depends on what caused the
// change. Both start from the tab pill's transition, so the card, the pill and
// the bar move with one feel until they are tuned apart.

// A tab switch: the whole card changes shape.
export const modeSwitchTransition: Transition = tabPillSpring

// The suggestions bar opening or closing.
export const suggestionsToggleTransition: Transition = tabPillSpring

// The text growing or shrinking the textarea: the card follows at once.
export const textGrowTransition: Transition = { duration: 0 }
