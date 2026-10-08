import { useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { PageShell } from '../../shared/PageShell'
import { DemoControls } from '../../shared/demo-controls/DemoControls'
import {
  burst,
  errorMessage,
  longMessage,
  nextMessage,
  startUpload,
} from './demoToasts'
import {
  defaultToastSettings,
  describeToasts,
  ToastControls,
} from './ToastControls'
import { createToastStore } from './toastStore'
import { ToastViewport } from './ToastViewport'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-3 flex flex-col gap-3 leading-relaxed">{children}</div>
    </section>
  )
}

const list = 'list-disc space-y-2 pl-5'

function TriggerButton({
  onClick,
  children,
}: {
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 font-medium hover:bg-[var(--color-border)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
    >
      {children}
    </button>
  )
}

export function App() {
  const [store] = useState(() => createToastStore())
  const [settings, setSettings] = useState(defaultToastSettings)
  // An upload that is still running when the settings change keeps the values
  // it started with.
  const uploads = useRef(new Set<() => void>())

  function upload() {
    uploads.current.add(
      startUpload(store, {
        durationMs: settings.uploadMs,
        fail: settings.failUploads,
      }),
    )
  }

  return (
    <PageShell title="Toast stack with interruption handling">
      <div className="flex flex-col gap-3 leading-relaxed">
        <p>
          Notifications that arrive in bursts, change while they are on screen,
          and get out of the way. Toasts collapse into a compact pile and open
          up when you hover over them or move the keyboard focus into them.
        </p>
        <p>
          Press F8 to move the focus to the notifications from anywhere on the
          page. Toasts never take the focus themselves.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <TriggerButton onClick={upload}>Upload 3 files</TriggerButton>
        <TriggerButton onClick={() => store.show(nextMessage())}>
          Save a draft
        </TriggerButton>
        <TriggerButton onClick={() => store.show(errorMessage)}>
          Show an error
        </TriggerButton>
        <TriggerButton onClick={() => store.show(longMessage)}>
          Show a long message
        </TriggerButton>
        <TriggerButton onClick={() => burst(store)}>
          Send 8 notifications
        </TriggerButton>
      </div>

      <Section title="What the motion communicates">
        <ul className={list}>
          <li>
            What is new. A toast rises into the front of the pile, and the ones
            behind it make room.
          </li>
          <li>
            How many there are. The pile shows a strip of each toast behind the
            front one, so you can count them without reading them.
          </li>
          <li>
            That it is the same notification. When an upload finishes, its icon
            and words change in place. A new toast would look like a new event.
          </li>
          <li>
            Where it went. A dismissed toast sinks and fades. A swiped toast
            leaves in the direction of the swipe.
          </li>
        </ul>
      </Section>

      <Section title="What this study covers">
        <ul className={list}>
          <li>
            <strong>Stacking.</strong> The pile opens on hover and on keyboard
            focus. On touch, the first tap opens it.
          </li>
          <li>
            <strong>Update in place.</strong> One toast goes from
            &ldquo;Uploading 3 files…&rdquo; to &ldquo;3 files uploaded&rdquo;
            or to an error.
          </li>
          <li>
            <strong>Timers.</strong> They stop while the pile is open, while
            something in it has the focus, and while the tab is hidden. They
            resume with the time that was left.
          </li>
          <li>
            <strong>Bursts.</strong> At most 3 toasts are on screen. The others
            wait, and a count shows how many. An error goes to the front of the
            queue.
          </li>
          <li>
            <strong>Dismissal.</strong> With the close button, by swiping right
            on touch, or with Escape while a toast has the focus.
          </li>
          <li>
            <strong>Screen readers.</strong> Information is announced politely,
            errors assertively. A toast that changes in place is announced
            again. Nothing moves the focus.
          </li>
          <li>
            <strong>Reduced motion.</strong> Toasts change place at once and
            only fade. Slow motion does not apply to it.
          </li>
          <li>
            <strong>Small screens.</strong> The stack takes the width of the
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
            <strong>Upload 3 files.</strong> One toast follows the upload. Look
            at the icon, the words and the bar change without a second toast.
            Turn on <em>Make uploads fail</em> to see it become an error.
            Dismiss the toast mid-upload and the result still appears in a new
            one.
          </li>
          <li>
            <strong>Send 8 notifications.</strong> Three are shown, the rest
            wait. Dismiss one and the next moves in. The error jumps the queue.
          </li>
          <li>
            <strong>Hover.</strong> Move the pointer onto the pile, wait longer
            than 5 seconds, and move away. The toasts are still there and each
            has its full time left. Enter and leave quickly to interrupt the
            animation in the middle.
          </li>
          <li>
            <strong>Keyboard.</strong> Press F8, then Tab through the toasts.
            Escape dismisses the one with the focus and moves the focus to the
            next one. When the last one is gone, the focus returns to where it
            was.
          </li>
          <li>
            <strong>Hidden tab.</strong> Show a toast, switch to another tab for
            ten seconds, and come back. It is still there and closes after the
            time it had left.
          </li>
          <li>
            <strong>Upload duration.</strong> 1.5, 4 or 10 seconds, to watch the
            update or to interrupt it.
          </li>
          <li>
            <strong>Preview reduced motion, Theme, Slow motion.</strong> The
            shared settings. Check the pile, the icons and the error colour in
            both themes.
          </li>
        </ul>
      </Section>

      <Section title="Other things worth trying">
        <ul className={list}>
          <li>Show a long message and open the pile.</li>
          <li>Send a burst while the pile is open.</li>
          <li>Swipe a toast to the right on a touch screen.</li>
          <li>Resize the window to phone width.</li>
        </ul>
        <p className="text-[var(--color-text-muted)]">
          Decisions, values and known limitations are in the study&apos;s
          NOTES.md.
        </p>
      </Section>

      <div className="pb-48" />
      <ToastViewport store={store} />
      <DemoControls tweaks={describeToasts(settings)}>
        <ToastControls
          value={settings}
          onChange={setSettings}
          onDismissAll={() => {
            uploads.current.forEach((stop) => stop())
            uploads.current.clear()
            store.dismissAll()
          }}
        />
      </DemoControls>
    </PageShell>
  )
}
