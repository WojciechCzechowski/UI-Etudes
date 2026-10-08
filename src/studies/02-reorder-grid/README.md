# Drag to reorder a thumbnail grid

Reorder photos in a grid by pointer, touch or keyboard. Every tile moves, not only the one you hold.

Run it with `pnpm dev` and open `/reorder-grid/`.

## The problem

Reordering images in a grid. A dragged tile that moves over static neighbours tells you nothing about the result. Here, the other tiles slide to their new places while you drag, so you see the whole new order before you let go.

The images are generated SVG placeholders (gradient, sun, horizon) from a seed. There are no third-party photos.

## What the motion communicates

- **Where it will land.** A dashed outline marks the slot the tile will drop into, and it glides as you cross from slot to slot.
- **What moved.** The tiles that make room slide to their new places.
- **That it is yours.** The dragged tile is lifted by a shadow and follows the pointer exactly. On release it settles into its slot.

## Try it

Drag any tile. With a mouse you can grab it anywhere. On touch, grab the grip in the corner, so touching the rest of the tile still scrolls the page.

For the keyboard:

1. Tab into the grid. It is one tab stop, and the arrow keys move focus between tiles.
2. Press Space or Enter to pick a tile up.
3. Move it with the arrow keys. Left and right follow reading order and wrap across rows, up and down keep the column. Home and End jump to the ends.
4. Space or Enter drops it. Escape puts it back where it was.

Open the gear in the top-right corner for the demo settings. While the panel is closed, a short text next to the gear lists every setting that differs from its default.

| Setting                               | What to check                                                                              |
| ------------------------------------- | ------------------------------------------------------------------------------------------ |
| Image loading (Instant, Normal, Slow) | Skeletons first, then images fade in with no layout shift. Changing it reloads the images. |
| Reload images                         | Watch the skeletons again.                                                                 |
| Make one image fail                   | The fourth tile shows "Could not load" in the same box. It can still be moved.             |
| Columns (Auto, 2, 4, 6)               | Keyboard movement in each layout. Up and down keep the column.                             |
| Preview reduced motion                | Tiles stop travelling. See below.                                                          |
| Theme, Slow down by                   | Shared by every study. Slow motion makes the neighbours' slide easy to watch.              |

Things worth trying without any setting:

- Hold a tile near the top or bottom edge of the grid. It scrolls, faster the closer you are to the edge.
- Pick a tile up, then press Tab or click elsewhere. The move is cancelled.
- Pick a tile up again right after dropping it, while it is still settling. It continues from where it is.
- Resize the window while holding a tile.
- Drag a tile out past the last row. It stays inside the list.
- Turn on a screen reader and move a tile with the keyboard.

## What is covered

- **Pointer and touch.** A drag threshold of `4px`, so a click or a wobble does not start a drag. A grip with a 40px target on touch.
- **Keyboard.** Roving focus, pick up, two-dimensional movement, drop and cancel.
- **Screen readers.** Each tile is named "Title, position N of M" with `aria-roledescription="sortable item"`, and `aria-pressed` while moving. One polite live region announces picking up, every step with its row and column, dropping and cancelling. A pointer drop is announced like a keyboard drop.
- **Auto-scroll.** Within `64px` of the top or bottom edge, up to `720px/s`.
- **Loading.** A fixed 4:3 box, so a skeleton, an error and an image cannot shift the layout.
- **Responsive columns.** `repeat(auto-fill, minmax(9rem, 1fr))`, read back from the computed style so the logic always matches what is on screen.
- **Reduced motion.** See below.

## Decisions

- **Hand-built on Motion layout animations, no new dependency.** Motion 14's `Reorder.Group` has `axis="xy"` for wrapped layouts, but no keyboard mode and no auto-scroll. dnd-kit (`@dnd-kit/react` 0.5.0, pre-1.0) would add a dependency and hide what the study is about. Both were evaluated and neither is used.
- **Structure.** A `ul` of `motion.li` tiles, each holding a real `button`, which is the pointer target, the focus target and the accessible name. Pure logic (slot from point, keyboard steps, auto-scroll speed, scroll to reveal) is in `reorder.ts` and unit tested.
- **Spring.** `{ type: 'spring', duration: 0.4, bounce: 0 }` for neighbours making room, the dropped tile settling and the marker. The same as study 01, so the studies move alike.
- **Drop target.** The slot whose centre is nearest the pointer, with a hysteresis of `8px`, so a pointer on the border of two slots does not swap them back and forth. The pointer, not the tile centre, because the pointer is what the eye follows.
- **Lift.** A shadow of `0 12px 24px rgb(0 0 0 / 0.25)` on a layer that fades in over `0.15s`, plus an accent border. No scale.
- **Touch.** Drag from a grip, not a long press. A long press needs a timer, fights text selection and the context menu, and hides how to drag.
- **Thumbnails.** The image fades in over `0.3s` ease-out. Loading is simulated at `300ms` to `1300ms` per tile (`1500ms` to `4500ms` when slow).

## Gotchas

**The order changes while you drag.** The order array updates live, so the dragged tile is always in the slot it will drop into and the neighbours show the result before the drop. Escape restores the order saved at pick up. This is what makes the whole study work, and it is also why the next gotcha exists.

**The dragged tile has to stay under the pointer while its slot changes.** The tile follows the pointer through motion values `x` and `y`, which are offsets from its current slot. The offset is `pointer - grab point - offsetLeft/offsetTop`, recomputed in a layout effect every time the slot changes, so it is right before paint. `offsetLeft` and `offsetTop` ignore transforms, so they stay correct while the neighbours are still animating.

**Motion must not animate the dragged tile's slot change.** Otherwise the layout animation plays on top of the pointer offset and the tile lags behind the pointer. The tile's layout transition is set to a duration of 0 from pick up until the settle ends. Toggling the `layout` prop off was tried first and replaced with this, so the prop never changes and nothing depends on how Motion handles a node whose `layout` prop flips.

**A transform counts as scrollable overflow.** Found in the first manual try. Dragging a tile past the last row made the scroller longer, auto-scroll followed it, and the tile ran away leaving empty space below. The dragged tile is now clamped to the list, while the slot still follows the unclamped pointer.

**Only transform and opacity animate.** The shadow is a separate layer that fades in, not an animated `box-shadow`. There is no scale on the lifted tile, because a scale on a layout-animated element distorts the image.

**Reordering the DOM blurs the focused tile.** A layout effect puts focus back after each keyboard move. Moving focus out of a picked up tile cancels the move, but that is checked after a `setTimeout(0)`, so the blur caused by the reorder itself is not mistaken for leaving.

**Scroll into view uses layout position.** After a keyboard move the scroll target is computed from the tile's layout position, not `scrollIntoView`, which would use the visual position that is still on its way.

**Auto-scroll is delta-time based.** A `requestAnimationFrame` loop with a sub-pixel remainder carried between frames, because some browsers round `scrollTop`. The scroller has `layoutScroll`, so Motion accounts for the scroll when it measures. The edge zone shrinks on a short scroller so the top and bottom zones never overlap.

**The drop marker is outside the list.** A `ul` may only contain list items, so the marker is a sibling, `aria-hidden`, placed before the list so tiles paint above it. It is positioned from the moving tile's layout offsets, so it is right while the tile is still travelling.

**Touch scrolling.** `touch-action: none` is on the grip only. The rest of the tile still scrolls the page.

## Reduced motion

No tile travels. Neighbours and the dropped tile change slot at once, and a tile that changed slot fades from `0.4` to `1` opacity over `0.15s`. The tile under the pointer still follows the pointer, because that is direct manipulation, and it drops without a settle. The marker does not glide. The skeleton does not pulse, and images crossfade over `0.15s`. Auto-scroll still runs. Slow motion never applies.

## Tried and dropped

- Motion `Reorder.Group` with `axis="xy"`.
- dnd-kit.
- A long press to start a drag on touch.
- Toggling the `layout` prop off for the dragged tile.
- Animating `box-shadow`.

## Limitations

- The pointer drag cannot be tested in jsdom. The logic is covered by the pure tests, and the keyboard flow by component tests.
- Auto-scroll is vertical and only for the grid's own scroller, not the window.
- A keyboard move scrolls instantly, even while the neighbours animate.
- Resizing while a tile is moving snaps instead of animating.
- A failed thumbnail has no retry.
- One pointer at a time: a second drag is ignored while one is running.
- The grip is a 40px target, under the 44px often recommended for touch.
