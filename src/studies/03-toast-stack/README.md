# Toast stack with interruption handling

Notifications that arrive in bursts, update in place and get out of the way, without stealing focus or getting lost.

Run it with `pnpm dev` and open `/toast-stack/`.

## The problem

Toasts are easy to build and hard to get right. Several arrive at once, one needs to change while it is on screen (an upload that finishes), timers must not close something you are reading, and a screen reader user needs to hear all of it without losing their place.

Prior art includes Sonner, which popularised the collapsed pile that expands on hover. The implementation here is written from scratch, with Radix Toast used for structure only.

## What the motion communicates

- **What is new.** A toast rises `16px` into the front of the pile while it fades in, and the ones behind it make room.
- **How many there are.** The collapsed pile shows a `10px` strip of each toast behind the front one, so you can count them without reading them.
- **That it is the same notification.** When an upload finishes, its icon and words crossfade in place. A new toast would look like a new event.
- **Where it went.** A dismissed toast sinks `8px` and fades. A swiped toast leaves in the direction of the swipe.

## Try it

The page has five buttons: **Upload 3 files**, **Save a draft**, **Show an error**, **Show a long message** and **Send 8 notifications**. Open the gear in the top-right corner for the demo settings. While the panel is closed, a short text next to the gear lists every setting that differs from its default.

| Setting                                     | What to check                                                                         |
| ------------------------------------------- | ------------------------------------------------------------------------------------- |
| Make uploads fail                           | The upload toast stops at 70% and becomes an error in the same toast.                 |
| Upload duration (1.5, 4, 10 s)              | A long upload gives you time to hover, dismiss or tab away mid-upload.                |
| Dismiss all toasts                          | Clears the active toasts, the queue and any running upload.                           |
| Preview reduced motion, Theme, Slow down by | Shared by every study. Check the pile, the icons and the error colour in both themes. |

Things worth trying:

- **Update in place.** Press Upload 3 files. Watch the icon, the words and the bar change without a second toast. Turn on Make uploads fail to see it become an error. Dismiss the toast mid-upload and the result still appears in a new one, so an error is never lost.
- **Bursts.** Press Send 8 notifications. Three are shown and the rest wait ("N more waiting"). Dismiss one and the next moves in. The error in the burst jumps the queue.
- **Timers.** Move the pointer onto the pile, wait longer than 5 seconds, then move away. Every toast is still there with its full time left. Enter and leave quickly to interrupt the animation in the middle.
- **Keyboard.** Press F8 from anywhere to move focus to the notifications, then Tab through them. The pile opens while focus is inside. Escape dismisses the focused toast and moves focus to the next one. When the last one is gone, focus returns to where it was.
- **Hidden tab.** Show a toast, switch to another tab for ten seconds and come back. It is still there and closes after the time it had left.
- **Touch.** The first tap on a collapsed pile of two or more opens it and does nothing else. Swipe a toast to the right to dismiss it. Tap outside to close the pile.
- **Long message.** Show one and open the pile.
- **Small screens.** Resize to phone width. The stack takes the width of the screen and respects the safe area.

## What is covered

- **Stacking.** Collapsed pile, expanded on pointer hover, on keyboard focus (`:focus-visible` only) and on a tap on touch.
- **Update in place.** One toast goes from "Uploading 3 files…" to "3 files uploaded" or to an error. A change of kind, title or description restarts the timer for the new kind. A change of progress alone does not.
- **Timers.** Info and success `5000ms`, error `8000ms`, progress none. They pause while the pile is open, while something in it has focus, on touch taps and while the tab is hidden. They resume with the time that was left.
- **Bursts.** At most 3 toasts are active. The rest wait in a first in, first out queue, except that an error goes ahead of everything that is not an error.
- **Dismissal.** The close button, a swipe to the right (threshold `50px`), or Escape on a focused toast.
- **Screen readers.** Two always-mounted live regions: polite for information and success, assertive for errors only. A toast is announced when it becomes active and again when its kind, title or description changes. Progress is not announced. Toasts never take focus.
- **Reduced motion.** See below.

## Decisions

- **Radix Toast for structure only.** From Radix: `Provider`, `Viewport` (a labelled region that F8 focuses), `Root` (the list item, swipe, Escape) and `Close`. Written in the study: timers, announcements, stacking and motion. A plain `ol` without Radix was considered and dropped, because swipe, Escape, F8 and close handling would have had to be written again.
- **State outside React.** `toastStore.ts` is a pure reducer (`show`, `update`, `dismiss`, `dismissAll`, `pause`, `resume`) that takes the time as an argument, with a small store around it that owns the timeouts and announcements. React reads it with `useSyncExternalStore`.
- **Spring.** `{ type: 'spring', duration: 0.4, bounce: 0 }` for position, scale, enter and exit. The same as studies 01 and 02.
- **Enter and exit.** Enter is `fadeIn` (`0.15s`), exit is `fadeOut` (`0.1s`), with `AnimatePresence` and Radix `forceMount`, as in study 01.
- **Collapsed pile.** The front card is at `y = 0`. A card behind is scaled in X by `1 - depth * 0.05` and stretched in Y so its top edge shows `10px` per level, whatever its own height. Its content fades to 0.
- **Expanded pile.** Every card at scale 1, offset by the summed height of the newer cards. Each card has `12px` of top padding that counts as part of its height.
- **Close button.** Icon only, `aria-label` "Dismiss: <title>", `40px` target, always visible. A hover-only button would be invisible on touch and add a state for no gain.
- **Colour is never the only signal.** Info (accent), success (green), error (danger) and progress (spinner) each have their own icon.

## Gotchas

**Radix timers and announcements were turned off.** Radix timers pause on `pointermove`, `focusin` and window `blur` only, cannot be paused from outside (a touch tap that opens the pile, a hidden tab), and each toast keeps its own clock. Every Root gets `duration={Infinity}`, which disables Radix's timer, and the store owns the clocks. Radix also reads a toast's text once, when it mounts, so a toast updated in place would be silent. Its announcer is redirected to a hidden, `aria-hidden` container, and the study's own live regions say everything.

**Toasts live in a portal, so React events do not bubble to the viewport.** A first version used `onPointerEnter` and `onFocus` on the viewport and silently never fired. A test caught it. Hover, focus and tap state now come from native listeners on the viewport element.

**The collapsed pile is a stretch, not an offset.** The first plan was a `y` offset of `10px` per level. A card behind is hidden by the front one anyway, so the offset showed nothing reliable. Stretching each card in Y gives an exact strip of `10px` regardless of height. Side effect: when heights differ a lot, the corner radius of a stretched card becomes slightly elliptical.

**Only transform and opacity animate, and nothing in the page moves.** Cards are `position: absolute` from the bottom of a viewport that has no height. Stacking is a pure function (`stackLayout.ts`) from ids, measured heights and the expanded flag to a transform per card. Heights are read with `offsetHeight`, which ignores transforms, in a layout effect and a `ResizeObserver`.

**No dead gap between cards.** If there were a real gap, the pointer would fall through it and collapse the pile in the middle of a move. The gap is padding inside each card's list item.

**The pile must not collapse under a timer.** Pointer, keyboard focus and touch all pause the timers, so an open pile never loses a toast while you are looking at it. Pause reasons are a set (`hover`, `focus`, `touch`, `hidden`), and the clocks run only while the set is empty. A toast that arrives or is promoted from the queue while paused starts stopped.

**Focus ring from a click.** Expansion on focus uses `:focus-visible` only, so a mouse click that focuses a toast does not keep the pile open and the timers stopped.

**Hidden tab uses `visibilitychange`, not `blur`.** Radix uses window `blur`, which also fires when the window only loses focus, for example when you click into devtools.

**Swipe offset is read, not applied.** Radix writes the swipe offset to CSS variables meant for a CSS transform. The study ignores them and reads `onSwipeMove` into a motion value `x` on an inner element, so it does not collide with the stack transform on the list item. A cancelled swipe animates back with the stack spring.

**Escape closes everything in Radix.** Radix closes every toast on an Escape pressed anywhere. Each Root cancels it unless the event target is inside the viewport.

**Focus after a dismiss.** When the toast that has focus goes away, focus moves to the newest toast that is left, or back to the element that had it before it entered the viewport. Radix moves focus to the viewport before calling the study, so the study checks for that too.

**Announce each sentence as a new node.** Every sentence is a new paragraph in the live region and is removed after `10s`. A repeated sentence is announced again because it is a new node, and a burst queues in the screen reader instead of overwriting itself. The "N more waiting" caption is visible text only, because adding it to the live region during a burst would repeat it for every toast.

**The card does not change height when an upload ends.** The progress bar stays after the upload finishes (full and green, or stopped and red), so the headline case does not shift the cards above it.

## Reduced motion

No travel. Cards change slot at once, enter and exit are opacity only (`0.15s` crossfade), and the pile still switches between collapsed and expanded, but at once. Swipe still follows the finger, because that is direct manipulation, and a completed swipe fades. The spinner stops. Slow motion never applies.

## Tried and dropped

- Radix timers and the Radix announcer.
- A `y` offset per level in the collapsed pile.
- React props on the viewport for hover and focus.
- Evicting the oldest toast, or a "+N" chip, for bursts. Eviction loses messages, and a chip hides what is waiting.
- A close button that only appears on hover.

## Limitations

- Screen reader behaviour is untested. The risk is a doubled announcement if some reader does not skip the hidden Radix announcer. A test checks that only one `status` role is exposed.
- jsdom has no layout, no `:focus-visible` and no pointer capture, so springs, heights and swipe are not covered by tests. The pure logic is (`toastStore.test.ts`, `stackLayout.test.ts`), and the flow by `ToastStack.test.tsx`.
- A card that changes height in place changes at once, while the cards above spring to their new places, so for about `0.4s` it can overlap the one above.
- The stack does not scroll: three tall toasts open on a short screen can run off the top.
- Swipe is to the right only.
- `Date.now()` is the clock, so a change of system time while a toast is paused can shift its remaining time.
- Radix gives every toast a document level Escape layer. A toast that mounts after another Radix layer (such as the demo settings popover) is the highest layer, so Escape reaches the toast first.
