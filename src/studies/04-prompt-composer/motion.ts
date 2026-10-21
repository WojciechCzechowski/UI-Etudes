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

// The credits pill sliding right behind the Generate button on a mode switch,
// so it moves with the card.
export const creditsPillTransition: Transition = modeSwitchTransition

// The label inside it fades out at once (shared `fadeOut`, 0.1s) and fades in
// after this delay, once the pill is wide enough not to squash it.
export const creditsTextDelay = 0.1

// The loading stripes in the suggestions bar. They sweep sideways by one
// period of the pattern (16px along the gradient is 22.63px across at 135deg),
// so the loop has no jump. `stripeSweep` is the time of one period.
export const stripePeriod = 22.63
export const stripeSweep: Transition = {
  duration: 0.6,
  ease: 'linear',
  repeat: Infinity,
}

// Delay between one suggestion chip fading in and the next.
export const chipStagger = 0.05

// How long the stripes keep sweeping after the chips start to appear. One
// sweep, so they leave on a whole loop.
export const stripeLinger = 0.6
