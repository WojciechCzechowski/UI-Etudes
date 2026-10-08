# UI Études

Small, finished interaction studies in React.

An étude is a short piece of music written to practise one technical problem. The word is French for "study". The best ones, Chopin's among them, turned out to be worth performing in their own right.

Each étude here takes one real interaction problem from product work and solves it properly, including the parts that usually get skipped. Together they show how I approach the craft: motion that explains what changed, layouts that work from a phone to a desktop, full keyboard and screen reader support, and designed behaviour for interruption, reduced motion and errors.

This is not a component library. There is nothing to install. Every study is self-contained, small enough to read in one sitting and meant to be copied.

## Studies

| Study                                                                          | What it solves                                                    |
| ------------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| [Morphing button to dialog](src/studies/01-morphing-dialog/README.md)          | A floating button that grows into a dialog and back.              |
| [Drag to reorder a thumbnail grid](src/studies/02-reorder-grid/README.md)      | Reorder photos by pointer, touch or keyboard. Every tile moves.   |
| [Toast stack with interruption handling](src/studies/03-toast-stack/README.md) | Notifications that stack, update in place and get out of the way. |

## What every study covers

- **Interruptible motion.** Reversing mid-animation continues from the current state, with no jump.
- **Reduced motion.** `prefers-reduced-motion` gets a designed alternative, not a missing transition.
- **Keyboard and focus.** Everything works without a pointer, and focus goes where you expect.
- **Screen readers.** Correct roles, names and announcements.
- **Responsive and themed.** Works on touch and small screens, in light and dark theme.
- **Real states.** Loading, empty and error states are designed.

## Running it

```bash
pnpm install
pnpm dev
```

Other scripts: `pnpm test`, `pnpm typecheck`, `pnpm lint` and `pnpm build`.

## Stack

React 19 with the React Compiler, TypeScript, Vite, Tailwind CSS, Radix UI primitives and Motion. Tests use Vitest and Testing Library. The build is static and deploys to Cloudflare Pages.
