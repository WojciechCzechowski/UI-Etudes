# Morphing button to dialog

A floating button that grows into a dialog and shrinks back into it.

Run it with `pnpm dev` and open `/morphing-dialog/`.

## The problem

A floating action button opens a small dialog. A dialog that appears from nowhere breaks the link between the action and its result. The user should see that the dialog grew out of the button and, on close, that it went back into it.

The dialog here is a small, realistic task: "Send feedback", one message field, Cancel and Send. The send is mocked and adds nothing to the page, because the study is about the button, not about what happens to the message.

## What the motion communicates

- **Where the dialog came from.** The surface starts as the button and ends as the dialog.
- **Where it went.** Closing runs the same path backwards, so the button is clearly where you return to.
- **When it is ready.** The content fades in once the surface is roughly half way, and fades out before the surface collapses, so the text never visibly scales or stretches.

## Try it

Press the round button in the bottom-right corner. The page behind it explains the study and scrolls, so you can open the dialog from any scroll position.

Open the gear in the top-right corner for the demo settings. While the panel is closed, a short text next to the gear lists every setting that differs from its default.

| Setting                               | What to check                                                                                                                                      |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Make sending fail                     | The dialog shows "Could not send your message. Try again.", grows by one line without jumping, keeps your message, and focus returns to the field. |
| Pending duration (400, 1200, 3000 ms) | At 3000 ms, press Escape while sending: the request is aborted and nothing is sent.                                                                |
| Preview reduced motion                | The morph becomes a short crossfade. Same as the OS setting.                                                                                       |
| Theme (System, Light, Dark)           | Check the dialog, the error text and the focus rings in both themes.                                                                               |
| Slow down by (2x, 4x, 8x)             | Watch the morph frame by frame. Look for stretched text and for the colour changing smoothly. Disabled with reduced motion.                        |

Things worth trying without any setting:

- Click the button and press Escape straight away, or click the button again while the dialog is closing. The surface reverses from where it is.
- Tab to the button, press Enter, type, Tab to Send, press Enter. Do it again with Escape.
- Send an empty message.
- Scroll the page before opening. Resize the window while the dialog is open.
- Narrow the window below 768px to get the bottom sheet.

The settings only change while the dialog is closed, because an open modal dialog makes the rest of the page inert.

## What is covered

- **Interruption.** Closing while opening, opening while closing and repeated clicks all reverse from the current state, with no jump and no stuck state.
- **Keyboard and focus.** Everything works without a pointer. Focus moves into the dialog, stays inside it, and returns to the button on close. Escape closes.
- **Screen readers.** The dialog has a title and a description. The pending state, both errors and "Message sent" are announced.
- **Reduced motion.** A crossfade replaces the morph. Slow motion never applies.
- **Small screens.** Below 768px the dialog is a bottom sheet, floating 16px in from the screen edges. The same morph applies.
- **Pending and errors.** Send stays focusable while pending, a failed send keeps the message, and closing while pending cancels the request.
- **Environment.** Scrolled page, resize while open, light and dark theme.

## Decisions

- **Shared element.** One `layoutId="surface"` is shared between a decorative span inside the trigger button and the dialog surface. Radix Dialog handles semantics, focus trap, Escape and the portal. Its content stays mounted until Motion finishes the exit (`AnimatePresence` with `forceMount`).
- **Spring.** `{ type: 'spring', duration: 0.4, bounce: 0 }`. It is duration based, so slow motion can scale it. Two alternatives are commented in the study's `motion.ts`: snappier (`0.3`, bounce `0.1`) and livelier (`0.45`, bounce `0.2`).
- **Content timing.** Fade in is `0.15s` ease-out with a `0.2s` delay (half the surface duration). Fade out is `0.1s` ease-in with no delay. A reopen during the closing fade skips the delay.
- **One radius.** The button is 48x48px with a `24px` radius (a circle) and the dialog uses the same `24px`. The radius never changes during the morph, so there is nothing to interpolate.
- **Overlay and error fades.** Overlay `0.2s` ease-out, error message `0.15s` ease-out.

## Gotchas

These are the things that went wrong or nearly did.

**The colour does not transition. Opacity does.** The button is accent coloured and the dialog is a surface colour, so the obvious move is to animate `backgroundColor`. It was tried and dropped for two reasons. It repaints on every frame, and the colour tokens are not plain colours in the built CSS: they use `light-dark()`, and Lightning CSS emits fallback strings that Motion cannot interpolate. Instead, the dialog surface carries an accent coloured layer that fades from 1 to 0, and the button span carries a surface coloured layer that fades from 1 to 0 on the way back. Both are opacity only, so there is no paint, and both colours stay as CSS tokens. The surface has `overflow: hidden` so the layer is clipped to the radius. One motion value (`morph`, 0 looks like the button, 1 looks like the dialog) drives both layers, so the colour is continuous through the hand-off, even when the morph is interrupted halfway.

**Layout animations distort children.** Scaling a container stretches its text. Counter-correcting every child was dropped. The surface morphs empty and the content only changes opacity, after the shape has mostly settled.

**Animating the radius broke the hand-off.** A radius going from 28px to 20px, driven by a shared motion value, left the button a rounded rectangle for the whole collapse and then snapped to a circle. One radius on both elements avoids the problem. It is set through `style`, so Motion corrects its distortion.

**Focus return.** With `layoutId`, the trigger is often hidden or unmounted while the dialog is open, and then Radix cannot return focus to it. Here the button never unmounts, only its decorative span does, and `onCloseAutoFocus` focuses the button explicitly with `preventScroll`.

**Closing is two steps.** A motion value fades the content out first, then `open` flips to false. A reopen during the fade cancels the close.

**Hover is colour only.** A scale on the button would distort the layout animation, so the hover colour is applied to the decorative span. Tailwind v4 applies `hover:` only on devices that support hover, so touch has no sticky hover. The hover colour is a token mixed 15% toward the text colour, which darkens in light theme and lightens in dark theme.

**Send uses `aria-disabled`, not `disabled`.** A native `disabled` moves focus out of the dialog to the page. With `aria-disabled` and clicks ignored in the submit handler, Send keeps focus while pending.

**The announcement lives outside the dialog.** The dialog content is unmounted after closing, so "Message sent" is read from a hidden `aria-live` region outside it. The region is cleared on the next open so the same text announces again.

**Fixed elements need `layoutRoot`.** Set on the fixed button and the fixed content wrapper, as the Motion docs describe for fixed positioning.

**Pending does not change the height.** The label and spinner replace the Send text at a fixed `min-w-28`. Only the error line changes the height, and that goes through `layout` on the surface and `layout="position"` on the content block.

## Reduced motion

There is no `layoutId` and no scaling. The button stays where it is, and the surface and overlay crossfade over `0.15s` and `0.2s`. The spinner is replaced by the "Sending..." label. The OS setting and the panel preview both switch this on, through `MotionConfig reducedMotion`.

## Tried and dropped

- A concentric inner radius for the dialog buttons. With the `24px` padding it came out as 0, and `16px` padding made the dialog feel narrow.
- Morphing the radius. See the gotchas.
- Animating `backgroundColor`. See the gotchas.
- Counter-correcting children during the morph.
- A folder dialog that added to a list on the page. The list needed state, a merge and a fake server that had nothing to do with the morph.
- A cycling theme button. It needed up to three clicks and showed its state only in a tooltip. A radio group in the settings replaced it.
- Native `disabled` on Send.
- A per-breakpoint border radius for the sheet. The floating sheet with one radius replaced it.

## Limitations

- The shadow is not morphed, so it changes abruptly at the hand-off. The `morph` value could drive it.
- Radix focuses the textarea on open while the content is still invisible, so early typing appears as the content fades in.
- Focus returns to the button when the surface starts collapsing, so the focus ring shows at the destination slightly before the surface arrives.
- On touch devices the keyboard opens during the morph.
- Resizing the window while open snaps instead of animating.
- The tests run in jsdom with reduced motion and do not cover the layout animation.
