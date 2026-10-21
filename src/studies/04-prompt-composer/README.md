# Morphing prompt composer

One composer card that changes what it holds when you switch between Image, Video and Lip sync, and stays the same card while it does.

Run it with `pnpm dev` and open `/prompt-composer/`.

> **Disclaimer.** This study is based on the prompt composer in the [Image & Video app by ElevenLabs](https://elevenlabs.io/app/image-video). It is not affiliated with ElevenLabs. The study is only about performance, reduced motion and how the interaction feels. It is not about the visual design, which only stands in for the original.

## The problem

A generation tool has several modes, and each needs a different set of controls: suggestions, references, a text field or none, settings, a price. The easy version swaps one panel for another, and the card jumps. The harder version keeps one card, lets its height change with the mode, and makes sure the tabs, the footer and the Generate button do not slide around while it does. Add a suggestions bar that opens and closes, a prompt that grows as you type, and every one of those changes can interrupt another.

## What the motion communicates

- **Which mode is active.** A pill travels from one tab to the next instead of jumping.
- **That it is the same card.** When the mode or the suggestions change, the card grows or shrinks from its bottom edge. The rows inside hold still instead of stretching with it.
- **What belongs to a mode.** The credits price slides out from behind the Generate button when a mode has one, and back behind it when it does not.
- **That something is loading.** The suggestions bar opens with diagonal stripes sweeping sideways. The chips then fade in one after another.
- **Where the composer lives.** On page load it slides up from the bottom edge, after the page content has settled.

## Try it

Open the gear in the top-right corner for the demo settings. While the panel is closed, a short text next to the gear lists every setting that differs from its default.

| Setting                                     | What to check                                                                                         |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Suggestions loading time (Off, 0.5, 1, 4 s) | Watch the stripes and the chips. Off shows the chips at once. A long load gives time to interrupt it. |
| Preview reduced motion, Theme, Slow down by | Shared by every study. Slow motion shows whether the rows keep up with the card. Check both themes.   |

Things worth trying:

- **Switch modes.** Look at the pill, the credits price and the card height. Lip sync is shorter. The footer and Generate button should stay put while the rest moves.
- **Interrupt a switch.** Click through the tabs quickly, or go to Lip sync and straight back. Nothing should jump or get stuck.
- **Toggle the suggestions.** Use the button at the top right of the card, also while the stripes are still moving. It is disabled in Lip sync.
- **Pick a suggestion.** It replaces the prompt. Switch to Lip sync and back: the text is still there.
- **Type a long prompt.** Paste a few paragraphs. The card follows at once, and past 8 lines the field scrolls inside itself.
- **Keyboard.** Tab to the tab list and use the arrow keys, then Tab on through the suggestions, references, prompt and settings.
- **Reload.** The composer slides up after the page content.
- **Small screens.** Resize to phone width.

## What is covered

- **Three modes, one card.** A per-mode config (`modes.ts`) drives suggestions, Brand Kit or a prompts button, reference slots, placeholder, settings and credits. One component, so the animations have one surface to work on.
- **Suggestions.** The bar opens with the page and toggles from the card. A chip fills the prompt. The load is fake, a timeout set in the demo settings (default `0.5s`).
- **Growing prompt.** A plain `textarea` with `field-sizing: content`, between 2 and 8 lines.
- **Shared prompt.** The text belongs to the composer, not to a mode. Lip sync has no field, and the text survives a visit to it.
- **Credits.** The label stays mounted with its last value, so it can animate out.
- **Keyboard and screen readers.** See below.
- **Reduced motion.** See below.

## Decisions

- **Radix Tabs for the tab list.** `Root`, `List` and `Trigger` give the roles and the arrow keys. `Tabs.Content` is not used, the card is the panel.
- **Pill.** One `motion.span` behind the labels, animating `x` and `width` to the active tab's `offsetLeft` and `offsetWidth`, measured in a layout effect and a `ResizeObserver`. Transition: tween, `0.3s`, `easeInOut` (`tabPillSpring`). Label colour is a CSS transition of `150ms`.
- **Card height by FLIP.** Motion `layout` on the card: the DOM jumps to the final height once and Motion plays the difference as `scaleY` and `translateY` from the bottom edge. Chosen over animating `height` (layout every frame), a bar tucked under the card (not one surface) and `clip-path` (clips the border and shadow).
- **Counter-correction in two levels.** The body is a `layout="position"` node and so is each row inside it. Wrapper only left the footer hanging above the card bottom on a switch to a shorter mode. Rows only left all but the first row scaled with the card. With both, every row holds still on a toggle, and on a mode switch the footer and Generate button stay put.
- **Timing by cause.** `cause` (`mode`, `suggestions` or `text`) is set in the same event as the change and picks the card's transition. Mode switch and suggestions toggle both start from the pill's transition. Text growth is `duration: 0`. A change that interrupts another uses its own cause's timing from the current state.
- **One transition for the whole card.** `MotionConfig` wraps the card, so body, rows and bar share timing. Without it, at 8x slow motion the rows finished long before the card and drifted off it.
- **Credits pill.** Slides `x` from `0` to `100%` of its own width behind the Generate button, clipped by a wrapper at its resting right edge. It uses the mode switch transition so it moves with the card. The label fades separately: out with `fadeOut` (`0.1s`), in with `fadeIn` (`0.15s`) after `0.1s`.
- **Loading stripes.** A `repeating-linear-gradient(135deg)` with `8px` bands at 6% of the text colour, on an oversized layer that moves in `x` by one period (`22.63px`) every `0.6s`, linear, so the loop has no jump. They keep sweeping for one more sweep (`0.6s`) after the chips start to appear. The bar keeps its single-row height while loading, so the card does not jump when the chips arrive.
- **Chips.** `fadeIn`, staggered `0.05s`.
- **Page entrance.** The wrapper slides `y` from `100%` to `0%` over `0.5s` with a `0.2s` delay and the same expo-out ease as the shared page entrance.
- **Textarea, not contenteditable.** Paste, IME, undo, roles and the placeholder would all need handling, and it only pays off with inline `@` mention chips, which are out of scope.

## Interruption

Every change can be reversed while it moves. The card, the pill and the credits continue from their current state with no jump. A new cause of change uses its own timing from where the card is. One exception by design: if the text grows right after a suggestions toggle, the toggle's animation is cut short, because text growth has no animation.

## Accessibility

- Tabs are a Radix tab list: roles, names and arrow keys come from Radix.
- The suggestions are a list labelled "Suggestions". While loading it has `aria-busy` and a hidden "Loading suggestions" item.
- The suggestions toggle is labelled "Hide suggestions" or "Show suggestions".
- The credits pill is `aria-hidden` while it is slid away.
- Lip sync 1080p is shown muted with `aria-disabled`.
- The focus ring is hidden after a pointer press and visible for keyboard use.

## Reduced motion

No travel and no scale. The card changes size at once. The pill fades out of the old tab and into the new one (`150ms` crossfade). The credits pill crossfades. The suggestions bar fades in and leaves at once, the stripes stay still and the chips appear without a stagger. On page load the composer does not slide and does not fade: it is hidden and becomes visible after `0.15s`, right after the page's own fade. A fade is out because opacity on an ancestor makes the card's backdrop blur glitch.

## Tried and dropped

- Motion `layoutId` for the pill. It measures positions on the page, and the card changes height between modes, so leaving Lip sync made the pill travel diagonally. Measuring inside the tab strip animates only the horizontal move.
- Animating `height` for the card. Layout on every frame.
- A bar tucked under the card, and `clip-path` on the card.
- Counter-correction on the wrapper only, or on the rows only.
- A separate transition on the card only. The rows drifted at slow motion.
- `scaleX` to 0 for the credits pill. It squashed the rounded ends and read as shrinking, not as sliding behind the button.
- Contenteditable for the prompt.
- A fade for the composer on page load. It glitches the backdrop blur.

## Limitations

- Pixel fidelity, blur and touch layout are unchecked against the original.
- The pill animates `width` on the main thread and is not profiled. If it stutters, switch to `scaleX` with a rounded inner layer.
- Motion does not correct the 1px card border, so it can look thicker or thinner while the card scales.
- Any change of the card's height animates, including a mode switch to a shorter mode. Text growth is the exception.
- Settings, references, Brand Kit and Generate do nothing, and the load is a timeout.
- The recording shows an undo button and a scroll chevron for overflowing chips. Both are left out.
- Icons are the nearest Lucide matches, not the originals.
- The card has no max height and the settings wrap on narrow screens.
- jsdom has no layout, so tests cover behaviour (`PromptComposer.test.tsx`), not the animation.
