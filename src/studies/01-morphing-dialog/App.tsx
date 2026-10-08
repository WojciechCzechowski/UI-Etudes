import { useState } from 'react'
import type { ReactNode } from 'react'
import { PageShell } from '../../shared/PageShell'
import { DemoControls } from '../../shared/demo-controls/DemoControls'
import { MorphingDialog } from './MorphingDialog'
import { fakeSendMessage } from './sendMessage'
import {
  defaultSending,
  describeSending,
  SendingControls,
} from './SendingControls'

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
  const [sending, setSending] = useState(defaultSending)

  return (
    <PageShell
      title="Morphing button to dialog"
      floating={
        <>
          <MorphingDialog
            sendMessage={fakeSendMessage({
              pendingMs: sending.pendingMs,
              fail: sending.fail,
            })}
          />
          <DemoControls tweaks={describeSending(sending)}>
            <SendingControls value={sending} onChange={setSending} />
          </DemoControls>
        </>
      }
    >
      <div className="flex flex-col gap-3 leading-relaxed">
        <p>
          A floating button opens a small dialog. The dialog grows out of the
          button, and on close it shrinks back into it. The shared shape ties
          the action to its result.
        </p>
        <p>
          Press the round button in the bottom-right corner to try it. The page
          you are reading is the backdrop: it scrolls, so you can open the
          dialog from any scroll position.
        </p>
      </div>

      <Section title="What the motion communicates">
        <ul className={list}>
          <li>
            Where the dialog came from. The surface starts as the button and
            ends as the dialog.
          </li>
          <li>
            Where it went. Closing runs the same path backwards, so the button
            is clearly where you return to.
          </li>
          <li>
            When it is ready. The content fades in as the surface settles and
            fades out before it collapses, so the text barely scales with it.
          </li>
        </ul>
      </Section>

      <Section title="What this study covers">
        <ul className={list}>
          <li>
            <strong>Interruption.</strong> Close the dialog while it opens, or
            press the button while it closes. The surface reverses from where it
            is, with no jump and no stuck state.
          </li>
          <li>
            <strong>Keyboard and focus.</strong> Everything works without a
            pointer. Focus moves into the dialog, stays inside it, and returns
            to the button on close. Escape closes the dialog.
          </li>
          <li>
            <strong>Screen readers.</strong> The dialog has a title and a
            description. Sending, a failed send and a sent message are
            announced.
          </li>
          <li>
            <strong>Reduced motion.</strong> With{' '}
            <code>prefers-reduced-motion</code> the morph is replaced by a short
            crossfade, and slow motion never applies to it.
          </li>
          <li>
            <strong>Small screens.</strong> Below 768px the dialog becomes a
            bottom sheet. The same morph applies.
          </li>
          <li>
            <strong>Pending and errors.</strong> Send shows a pending state and
            keeps focus. A failed send keeps your message and grows the dialog
            by one line. Closing while sending cancels the request.
          </li>
          <li>
            <strong>Environment.</strong> A scrolled page, a window resized
            while the dialog is open, and light and dark themes.
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
            <strong>Make sending fail.</strong> Send a message and the dialog
            shows an error and stays open. Check that it grows without jumping,
            that focus returns to the message field, and that a screen reader
            announces the error. Sending an empty message shows a different
            error.
          </li>
          <li>
            <strong>Pending duration.</strong> How long sending takes: 400, 1200
            or 3000 ms. At 3000 ms, press Escape while sending to see the
            request cancelled.
          </li>
          <li>
            <strong>Preview reduced motion.</strong> Switches to the crossfade
            without changing your operating system setting. The operating system
            setting has the same effect.
          </li>
          <li>
            <strong>Theme.</strong> System, Light or Dark, in one click. System
            follows your operating system. Check the dialog, the error text and
            the focus rings in both themes.
          </li>
          <li>
            <strong>Slow motion.</strong> Runs the morph 2x, 4x or 8x slower so
            you can watch it. Look for stretched text, and for the colour
            changing smoothly. Not available with reduced motion.
          </li>
        </ul>
        <p>
          Settings change only while the dialog is closed, because an open
          dialog blocks the rest of the page.
        </p>
      </Section>

      <Section title="Other things worth trying">
        <ul className={list}>
          <li>
            Tab to the button, press Enter, type a message, Tab to Send and
            press Enter. Do it again with Escape instead of Send.
          </li>
          <li>Scroll down before opening the dialog.</li>
          <li>Resize the window while the dialog is open.</li>
          <li>Switch the theme in the settings while the dialog is closed.</li>
        </ul>
      </Section>

      <div className="pb-32" />
    </PageShell>
  )
}
