import { ArrowUp, AtSign, ListFilterPlus, X } from 'lucide-react'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import type { Transition } from 'motion/react'
import { Tabs } from 'radix-ui'
import { useState } from 'react'
import {
  useReduceMotion,
  useScaleTransition,
} from '../../shared/demo-controls/DemoSettings'
import { fadeIn } from '../../shared/motion'
import { ModeTabs } from './ModeTabs'
import { modes } from './modes'
import type { Mode } from './modes'
import {
  modeSwitchTransition,
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

/**
 * One card for every mode. The mode picks what the card contains. There is no
 * component per tab, so a later animation has a single surface to morph.
 */
export function PromptComposer() {
  const [mode, setMode] = useState<Mode>('image')
  // Shared by all modes, so it survives a visit to one without a text field.
  const [prompt, setPrompt] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  // What last changed the card's height. It picks the card's transition and is
  // set in the same event as the change, so both land in one render.
  const [cause, setCause] = useState<Cause>('mode')
  const config = modes[mode]
  const reduceMotion = useReduceMotion()
  const scale = useScaleTransition()
  const suggestionsOpen = showSuggestions && config.suggestions.length > 0

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
            borderRadius: 28,
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
                layout="position"
                initial={{ opacity: 0, y: '-100%' }}
                animate={{
                  y: '0%',
                  opacity: 100,
                  transition: {
                    opacity: scale({ duration: .5 }),
                    y: scale(tabPillSpring)},
                }}
                exit={{
                  opacity: 0,
                  y: '-100%',
                  transition: {
                    opacity: scale({ duration: .5 }),
                    y: scale(tabPillSpring)
                  },
                }}
                className="flex flex-wrap gap-2 border-b border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] px-4 py-3"
              >
                {config.suggestions.map((suggestion) => (
                  <li key={suggestion}>
                    <button
                      type="button"
                      onClick={() => {
                        setPrompt(suggestion)
                        setCause('text')
                      }}
                      className={`${pill} flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium`}
                    >
                      <ListFilterPlus
                        aria-hidden="true"
                        className="size-4 text-[var(--color-text-muted)]"
                      />
                      {suggestion}
                    </button>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>

          {/* Each row that stays between modes has its own layout="position",
            so it travels from its old place to its new one. One wrapper for
            all of them moved by its top edge and left the footer floating
            above the bottom of the card while the card shrank. */}
          <motion.div
            layout="position"
            className="flex flex-col gap-3 p-3 sm:p-4"
          >
            <motion.div
              layout="position"
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
              layout="position"
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
                layout="position"
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
                className="field-sizing-content max-h-[calc(8*1.75rem+1rem)] min-h-[calc(2*1.75rem+1rem)] w-full resize-none overflow-y-auto bg-transparent px-1 py-2 text-lg placeholder:text-[var(--color-text-muted)] focus-visible:outline-none"
              />
            )}

            <motion.div
              layout="position"
              className="flex items-end justify-between gap-3"
            >
              <ul
                aria-label="Settings"
                className="flex flex-wrap items-center gap-x-5 gap-y-2"
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

              <div className="flex shrink-0 items-center">
                {config.credits && (
                  <span
                    className={`-mr-5 rounded-full py-2.5 pr-8 pl-4 text-sm text-[var(--color-text-muted)] ${muted}`}
                  >
                    {config.credits}
                  </span>
                )}
                <button
                  type="button"
                  aria-label="Generate"
                  className={`relative grid size-11 place-items-center rounded-full bg-[var(--color-text)] text-[var(--color-bg)] ${focusRing}`}
                >
                  <ArrowUp aria-hidden="true" className="size-5" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </Tabs.Root>
    </MotionConfig>
  )
}
