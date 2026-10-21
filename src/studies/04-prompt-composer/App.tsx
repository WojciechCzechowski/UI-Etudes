import { motion } from 'motion/react'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { PageShell } from '../../shared/PageShell'
import { DemoControls } from '../../shared/demo-controls/DemoControls'
import {
  useReduceMotion,
  useScaleTransition,
} from '../../shared/demo-controls/DemoSettings'
import { PromptComposer } from './PromptComposer'
import { composerEntrance } from './motion'
import {
  defaultPromptSettings,
  describePrompt,
  PromptControls,
} from './PromptControls'

// Stand-ins for the generations behind the composer: a gradient per card.
const cards = [
  { hues: [250, 320], height: 'h-64' },
  { hues: [20, 50], height: 'h-44' },
  { hues: [160, 200], height: 'h-56' },
  { hues: [290, 340], height: 'h-72' },
  { hues: [210, 260], height: 'h-48' },
  { hues: [40, 10], height: 'h-60' },
  { hues: [120, 170], height: 'h-52' },
  { hues: [330, 20], height: 'h-44' },
]

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-3 flex flex-col gap-3 leading-relaxed">{children}</div>
    </section>
  )
}

const list = 'list-disc space-y-2 pl-5'

export function App() {
  const [settings, setSettings] = useState(defaultPromptSettings)
  const reduceMotion = useReduceMotion()
  const scale = useScaleTransition()

  return (
    <>
      <PageShell
        title="Morphing prompt composer"
        floating={
          <>
            <DemoControls tweaks={describePrompt(settings)}>
              <PromptControls value={settings} onChange={setSettings} />
            </DemoControls>
          </>
        }
      >
        <div className="flex flex-col gap-3 leading-relaxed">
          <p>
            One composer card that changes what it holds when you switch between
            Image, Video and Lip sync. The card keeps its identity: the tabs,
            the prompt and the Generate button stay where they are, and the rest
            makes room around them.
          </p>
          <p>
            The composer is fixed to the bottom of the page. Everything on this
            page above it is explanation.
          </p>
        </div>

        <aside className="mt-6 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-sm leading-relaxed">
          <strong>Disclaimer.</strong> This study is based on the prompt
          composer in the{' '}
          <a
            href="https://elevenlabs.io/app/image-video"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 hover:text-[var(--color-accent)]"
          >
            Image &amp; Video app by ElevenLabs
          </a>
          . It is not affiliated with ElevenLabs. The study is only about
          performance, reduced motion and how the interaction feels. It is not
          about the visual design, which only stands in for the original.
        </aside>

        <Section title="What the motion communicates">
          <ul className={list}>
            <li>
              Which mode is active. A pill slides from one tab to the next
              instead of jumping.
            </li>
            <li>
              That it is the same card. When the mode or the suggestions change,
              the card grows or shrinks from its bottom edge, and the rows
              inside hold still instead of stretching with it.
            </li>
            <li>
              What belongs to a mode. The credits price slides out from behind
              the Generate button when a mode has one, and back behind it when
              it does not.
            </li>
            <li>
              That something is loading. Suggestions open with moving stripes,
              and the chips fade in one after another.
            </li>
          </ul>
        </Section>

        <Section title="What this study covers">
          <ul className={list}>
            <li>
              <strong>Three modes, one card.</strong> Suggestions, references,
              settings and credits change per mode. Lip sync has no text field.
            </li>
            <li>
              <strong>Suggestions.</strong> The bar above the card opens with
              the page and toggles with the button at the top right of the card.
              A chip fills the prompt.
            </li>
            <li>
              <strong>Growing prompt.</strong> The field grows with the text up
              to 8 lines, then scrolls inside itself. The card follows the text
              at once, without an animation.
            </li>
            <li>
              <strong>Interruption.</strong> Every change can be reversed while
              it moves. The card, the pill and the credits continue from where
              they are.
            </li>
            <li>
              <strong>Keyboard and screen readers.</strong> The tabs are a Radix
              tab list: arrow keys move between them. The suggestions are a
              list, announced as busy while they load.
            </li>
            <li>
              <strong>Reduced motion.</strong> The card changes size at once.
              The pill, the credits and the suggestions only fade.
            </li>
            <li>
              <strong>Small screens.</strong> The card takes the width of the
              screen and respects the safe area.
            </li>
          </ul>
        </Section>

        <Section title="How to try it and check it">
          <p>
            Open the gear in the top-right corner. While it is closed, a small
            text next to it lists every setting that differs from its default.
          </p>
          <ul className={list}>
            <li>
              <strong>Switch modes.</strong> Click Image, Video and Lip sync.
              Look at the pill, the credits price and the height of the card.
              Lip sync is shorter. The footer and the Generate button should
              stay put while the rest moves.
            </li>
            <li>
              <strong>Interrupt a switch.</strong> Click through the tabs
              quickly, or go to Lip sync and straight back. Nothing should jump
              or get stuck.
            </li>
            <li>
              <strong>Toggle the suggestions.</strong> Use the button at the top
              right of the card, also while the stripes are still moving. It is
              disabled in Lip sync, which has no suggestions.
            </li>
            <li>
              <strong>Suggestions loading time.</strong> 0.5 s, 1 s or 4 s to
              watch the stripes and the chips, or Off to show the chips at once.
              Switching modes with the bar open starts the load again.
            </li>
            <li>
              <strong>Pick a suggestion.</strong> It replaces the prompt. Then
              switch to Lip sync and back: the text is still there.
            </li>
            <li>
              <strong>Type a long prompt.</strong> Paste a few paragraphs.
              Growing is immediate, and past 8 lines the field scrolls.
            </li>
            <li>
              <strong>Keyboard.</strong> Tab to the tab list, then use the arrow
              keys. Tab on to the suggestions, the references, the prompt and
              the settings. The focus ring should be visible every time and
              hidden after a mouse click.
            </li>
            <li>
              <strong>Reload the page.</strong> The composer slides up after the
              page content has settled.
            </li>
            <li>
              <strong>Preview reduced motion, Slow motion.</strong> The shared
              settings. Slow motion makes it easy to see whether the rows keep
              up with the card. Check both themes too.
            </li>
          </ul>
        </Section>

        <Section title="Other things worth trying">
          <ul className={list}>
            <li>Switch modes while the prompt is several lines long.</li>
            <li>Hide the suggestions, switch modes, and show them again.</li>
            <li>Resize the window to phone width.</li>
            <li>Scroll the page behind the card to see the blur.</li>
          </ul>
        </Section>

        <p className="mt-10 text-sm text-[var(--color-text-muted)]">
          The settings, the references, Brand Kit and Generate do nothing. The
          gradients behind the composer stand in for generated images.
        </p>

        <div className="mt-6 columns-2 gap-3 [&>*]:mb-3">
          {cards.map(({ hues: [from, to], height }) => (
            <div
              key={from}
              aria-hidden="true"
              className={`${height} break-inside-avoid rounded-[var(--radius-md)]`}
              style={{
                background: `linear-gradient(135deg, oklch(0.75 0.14 ${from}), oklch(0.55 0.16 ${to}))`,
              }}
            />
          ))}
        </div>
        <div className="pb-[28rem]" />
      </PageShell>
      {/* Outside the page shell on purpose: the shell fades its floating
          children, and an ancestor with opacity below 1 breaks the card's
          backdrop blur for the length of the fade. The composer slides on
          transform only, after the page content has settled. */}
      <motion.div
        className="fixed inset-x-0 bottom-0 mx-auto w-full max-w-3xl px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
        initial={reduceMotion ? { visibility: 'hidden' } : { y: '100%' }}
        animate={reduceMotion ? { visibility: 'visible' } : { y: '0%' }}
        transition={
          reduceMotion
            ? { duration: 0, delay: composerEntrance.reducedDelay }
            : scale(composerEntrance.slide)
        }
      >
        <PromptComposer suggestionsDelayMs={settings.suggestionsMs} />
      </motion.div>
    </>
  )
}
