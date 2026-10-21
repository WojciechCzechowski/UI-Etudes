import { ArrowUp, AtSign, ListFilterPlus, X, Image } from 'lucide-react'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import type { Transition } from 'motion/react'
import { Tabs } from 'radix-ui'
import { useEffect, useState } from 'react'
import {
  useReduceMotion,
  useScaleTransition,
} from '../../shared/demo-controls/DemoSettings'
import { crossfade, fadeIn, fadeOut } from '../../shared/motion'
import { ModeTabs } from './ModeTabs'
import { modes } from './modes'
import type { Mode } from './modes'
import {
  chipStagger,
  creditsPillTransition,
  creditsTextDelay,
  modeSwitchTransition,
  stripeLinger,
  stripePeriod,
  stripeSweep,
  suggestionsToggleTransition,
  tabPillSpring,
  textGrowTransition,
} from './motion'

type Cause = 'mode' | 'suggestions' | 'text'

const cardTransitions: Record<Cause, Transition> = {
  mode: modeSwitchTransition,
  suggestions: suggestionsToggleTransition,
  text: textGrowTransition,
}

const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]'
const pill = `border border-[var(--color-border)] bg-[var(--color-surface)] ${focusRing}`
const muted = 'bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]'

type PromptComposerProps = {
  /** Fake time the suggestions take to arrive. 0 shows them at once. */
  suggestionsDelayMs?: number
}

/**
 * One card for every mode. The mode picks what the card contains. There is no
 * component per tab, so a later animation has a single surface to morph.
 */
export function PromptComposer({
  suggestionsDelayMs = 0,
}: PromptComposerProps) {
  const [mode, setMode] = useState<Mode>('image')
  // Shared by all modes, so it survives a visit to one without a text field.
  const [prompt, setPrompt] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(true)
  // What last changed the card's height. It picks the card's transition and is
  // set in the same event as the change, so both land in one render.
  const [cause, setCause] = useState<Cause>('mode')
  const config = modes[mode]
  const reduceMotion = useReduceMotion()
  const scale = useScaleTransition()
  // Reduced motion: the card jumps to its new size and the rows jump with it.
  const rowLayout = reduceMotion ? false : 'position'
  // The credits pill stays mounted so it can slide out. It keeps the last
  // label while hidden, so the text is there to fade rather than gone.
  const [credits, setCredits] = useState(config.credits)
  if (config.credits && config.credits !== credits) setCredits(config.credits)
  const creditsVisible = config.credits !== null
  const suggestionsOpen = showSuggestions && config.suggestions.length > 0
  // The mode whose suggestions have arrived. Opening the bar clears it, and a
  // mode switch with the bar open makes it stale, so both start a new load.
  const [loadedMode, setLoadedMode] = useState<Mode | null>(null)
  const loading =
    suggestionsOpen && suggestionsDelayMs > 0 && loadedMode !== mode

  useEffect(() => {
    if (!loading) return
    const timeout = setTimeout(() => setLoadedMode(mode), suggestionsDelayMs)
    return () => clearTimeout(timeout)
  }, [loading, mode, suggestionsDelayMs])

  // The stripes outlast the load: they keep sweeping while the chips fade in
  // and stop `stripeLinger` after the last data arrived, so the bar still reads
  // as loading while it fills.
  const [settledMode, setSettledMode] = useState<Mode | null>(null)
  const striped =
    suggestionsOpen && suggestionsDelayMs > 0 && settledMode !== mode
  const stripeLingerMs = scale({ duration: stripeLinger }).duration! * 1000

  useEffect(() => {
    if (!striped || loading) return
    const timeout = setTimeout(() => setSettledMode(mode), stripeLingerMs)
    return () => clearTimeout(timeout)
  }, [striped, loading, mode, stripeLingerMs])

  // The card changes height by layout animation: the DOM jumps to the final
  // size once, and Motion plays the difference as a transform, so nothing is
  // laid out per frame. Radius and shadow are style values so Motion can
  // correct them while the card is scaled.
  // The card and everything inside it (the body, its rows, the bar) change
  // place on this one transition. Only the card had it before, and at slow
  // motion the rows ran on their own faster clock and drifted off the card.
  return (
    <MotionConfig transition={scale(cardTransitions[cause])}>
      <Tabs.Root
        value={mode}
        onValueChange={(value) => {
          setMode(value as Mode)
          setCause('mode')
        }}
        asChild
      >
        <motion.div
          layout={!reduceMotion}
          style={{
            borderRadius: 20,
            boxShadow: '0 20px 60px -20px rgb(0 0 0 / 0.3)',
          }}
          className="relative overflow-hidden border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface)_80%,transparent)] backdrop-blur-2xl"
        >
          {/* popLayout takes the leaving bar out of the flow, so the card starts
          shrinking at once while the bar fades out where it was. */}
          <AnimatePresence initial={false} mode="popLayout">
            {suggestionsOpen && (
              <motion.ul
                key="suggestions"
                aria-label="Suggestions"
                aria-busy={loading}
                layout={rowLayout}
                // Reduced motion: the bar appears and leaves at once, like the
                // card. A fading exit would hang over the rows that moved up.
                initial={reduceMotion ? false : { opacity: 0, y: '-100%' }}
                animate={{
                  y: '0%',
                  opacity: 1,
                  transition: {
                    opacity: scale({ duration: 0.5 }),
                    y: scale(tabPillSpring),
                  },
                }}
                exit={
                  reduceMotion
                    ? undefined
                    : {
                        opacity: 0,
                        y: '-100%',
                        transition: {
                          opacity: scale({ duration: 0.5 }),
                          y: scale(tabPillSpring),
                        },
                      }
                }
                className="relative flex min-h-[calc(2.25rem+1.5rem)] flex-wrap gap-2 overflow-hidden border-b border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] p-3"
              >
                {/* Stripes sweep across the bar while it loads and fade out as
                the chips fade in. Transform and opacity only. Reduced motion
                keeps them still. */}
                <motion.li
                  aria-hidden="true"
                  initial={false}
                  animate={{ opacity: striped ? 1 : 0 }}
                  transition={scale(striped ? fadeIn : fadeOut)}
                  className="pointer-events-none absolute inset-0 list-none"
                >
                  <motion.div
                    animate={
                      striped && !reduceMotion
                        ? { x: [0, stripePeriod] }
                        : undefined
                    }
                    transition={stripeSweep}
                    className="absolute inset-y-0 -left-[22.63px] w-[calc(100%+45.26px)] [background:repeating-linear-gradient(135deg,transparent_0_8px,color-mix(in_srgb,var(--color-text)_6%,transparent)_8px_16px)]"
                  />
                </motion.li>
                {loading && <li className="sr-only">Loading suggestions</li>}
                {!loading &&
                  config.suggestions.map(({ label, prompt }, index) => (
                    <motion.li
                      key={label}
                      className="relative"
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: 1,
                        transition: scale({
                          ...fadeIn,
                          delay: reduceMotion ? 0 : index * chipStagger,
                        }),
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setPrompt(prompt)
                          setCause('text')
                        }}
                        className={`${pill} flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium`}
                      >
                        <ListFilterPlus
                          aria-hidden="true"
                          className="size-4 text-[var(--color-text-muted)]"
                        />
                        {label}
                      </button>
                    </motion.li>
                  ))}
              </motion.ul>
            )}
          </AnimatePresence>

          {/* Each row that stays between modes has its own layout={rowLayout},
            so it travels from its old place to its new one. One wrapper for
            all of them moved by its top edge and left the footer floating
            above the bottom of the card while the card shrank. */}
          <motion.div layout={rowLayout} className="flex flex-col gap-2 p-2">
            <motion.div
              layout={rowLayout}
              className="flex items-center justify-between gap-3"
            >
              <ModeTabs activeMode={mode} />
              <div className={`flex gap-1 rounded-2xl p-1 ${muted}`}>
                {config.brandKit && (
                  <button
                    type="button"
                    className={`${pill} flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-medium`}
                  >
                    <AtSign aria-hidden="true" className="size-4" />
                    Brand Kit
                  </button>
                )}
                <button
                  type="button"
                  aria-label={
                    showSuggestions ? 'Hide suggestions' : 'Show suggestions'
                  }
                  onClick={() => {
                    setShowSuggestions((prev) => !prev)
                    setLoadedMode(null)
                    setSettledMode(null)
                    setCause('suggestions')
                  }}
                  disabled={!config.brandKit}
                  className={`${pill} grid size-8 place-items-center rounded-xl`}
                >
                  <span
                    className={`col-span-full row-span-full transition-[rotate,opacity] ${!config.brandKit ? 'opacity-0 rotate-90' : showSuggestions ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'}`}
                  >
                    <X aria-hidden="true" className="size-4" />
                  </span>
                  <span
                    className={`col-span-full row-span-full transition-[rotate,opacity] ${config.brandKit ? (showSuggestions ? 'opacity-0 -rotate-90' : 'opacity-100 rotate-0') : 'opacity-50'}`}
                  >
                    <ListFilterPlus aria-hidden="true" className="size-4" />
                  </span>
                </button>
              </div>
            </motion.div>

            <motion.ul
              aria-label="References"
              layout={rowLayout}
              className="flex flex-wrap gap-2"
            >
              {config.slots.map(({ label, Icon }) => (
                <li key={label}>
                  <button
                    type="button"
                    className={`flex h-[74px] flex-col items-center justify-center gap-1.5 rounded-2xl px-5 text-sm text-[var(--color-text-muted)] ${muted} ${focusRing}`}
                  >
                    <Icon aria-hidden="true" className="size-5" />
                    {label}
                  </button>
                </li>
              ))}
            </motion.ul>

            {config.placeholder && (
              <motion.textarea
                layout={rowLayout}
                aria-label="Prompt"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: scale({
                    ...fadeIn,
                    delay: reduceMotion ? 0 : 0.09,
                  }),
                }}
                value={prompt}
                onChange={(event) => {
                  setPrompt(event.target.value)
                  setCause('text')
                }}
                placeholder={config.placeholder}
                className="field-sizing-content max-h-[calc(8*1.75rem+1rem)] min-h-[calc(2*1.75rem+1rem)] w-full resize-none overflow-y-auto bg-transparent px-2 py-2 text-lg placeholder:text-[var(--color-text-muted)] focus-visible:outline-none"
              />
            )}
            <motion.div
              layout={rowLayout}
              className="flex items-center justify-between gap-3"
            >
              <ul
                aria-label="Settings"
                className="flex flex-wrap items-center gap-x-5 gap-y-2 px-2"
              >
                {config.settings.map(({ label, Icon, disabled }, index) => (
                  <li key={`${index}-${label}`}>
                    <button
                      type="button"
                      aria-disabled={disabled || undefined}
                      className={`flex items-center gap-2 rounded-md text-sm ${focusRing} ${
                        disabled
                          ? 'text-[var(--color-text-muted)] opacity-60'
                          : 'text-[var(--color-text)]'
                      }`}
                    >
                      <Icon
                        aria-hidden="true"
                        className="size-4 text-[var(--color-text-muted)]"
                      />
                      {label}
                    </button>
                  </li>
                ))}
              </ul>

              <div className="flex shrink-0 items-center p-0.5">
                {/* Hidden, it slides right behind the button. The wrapper clips it
                at the pill's resting right edge, which is under the button, so
                it never shows past the button. It keeps its place in the
                layout, so the row does not reflow. Reduced motion fades it
                instead. */}
                {credits && (
                  <span className="-mr-5 overflow-hidden">
                    <motion.span
                      aria-hidden={!creditsVisible || undefined}
                      initial={false}
                      animate={
                        reduceMotion
                          ? { opacity: creditsVisible ? 1 : 0, x: 0 }
                          : { x: creditsVisible ? 0 : '100%', opacity: 1 }
                      }
                      transition={scale(
                        reduceMotion ? crossfade : creditsPillTransition,
                      )}
                      className={`block rounded-l-full py-2 pr-8 pl-2.5 text-sm text-[var(--color-text-muted)] ${muted}`}
                    >
                      <motion.span
                        initial={false}
                        animate={{
                          opacity: reduceMotion || creditsVisible ? 1 : 0,
                        }}
                        transition={scale(
                          creditsVisible
                            ? {
                                ...fadeIn,
                                delay: reduceMotion ? 0 : creditsTextDelay,
                              }
                            : fadeOut,
                        )}
                        className="flex items-center gap-1"
                      >
                        <Image aria-hidden="true" className="size-4" />
                        {credits}
                      </motion.span>
                    </motion.span>
                  </span>
                )}
                <button
                  type="button"
                  aria-label="Generate"
                  className={`relative grid size-9 place-items-center rounded-full bg-[var(--color-text)] text-[var(--color-bg)] ${focusRing}`}
                >
                  <ArrowUp aria-hidden="true" className="size-4" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </Tabs.Root>
    </MotionConfig>
  )
}
