import type { ReactElement } from 'react'

// One small drawing per study, keyed by slug. Each shows the idea of the
// study, not a screenshot of it. Colours come from the theme tokens, so the
// glyphs follow light and dark without extra work.
const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5 }
const accent = 'var(--color-accent)'

// A circle, a medium surface and a dialog, all anchored in one corner.
const morphingDialog = (
  <>
    <rect x="12" y="8" width="46" height="32" rx="7" {...stroke} />
    <rect
      x="34"
      y="24"
      width="24"
      height="16"
      rx="8"
      fill="none"
      stroke={accent}
      strokeWidth="1.5"
      strokeOpacity="0.6"
    />
    <circle cx="52" cy="34" r="6" fill={accent} />
  </>
)

// A grid of tiles with one lifted out of its slot.
const reorderGrid = (
  <>
    {[6, 50].map((x) => (
      <rect
        key={`${x}-top`}
        x={x}
        y="9"
        width="16"
        height="14"
        rx="3"
        {...stroke}
      />
    ))}
    {[6, 28, 50].map((x) => (
      <rect
        key={`${x}-bottom`}
        x={x}
        y="29"
        width="16"
        height="14"
        rx="3"
        {...stroke}
      />
    ))}
    <rect
      x="28"
      y="9"
      width="16"
      height="14"
      rx="3"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeDasharray="3 3"
      strokeOpacity="0.5"
    />
    <rect
      x="31"
      y="15"
      width="16"
      height="14"
      rx="3"
      fill={accent}
      transform="rotate(-5 39 22)"
    />
  </>
)

// A front toast with two more behind it, each showing a thin strip.
const toastStack = (
  <>
    <rect
      x="22"
      y="6"
      width="28"
      height="12"
      rx="4"
      fill="var(--color-surface)"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeOpacity="0.35"
    />
    <rect
      x="16"
      y="13"
      width="40"
      height="14"
      rx="5"
      fill="var(--color-surface)"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeOpacity="0.6"
    />
    <rect
      x="10"
      y="22"
      width="52"
      height="22"
      rx="6"
      fill="var(--color-surface)"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <circle cx="21" cy="33" r="3.5" fill={accent} />
    <path
      d="M29 30h23M29 36h14"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </>
)

const glyphs: Record<string, ReactElement> = {
  'morphing-dialog': morphingDialog,
  'reorder-grid': reorderGrid,
  'toast-stack': toastStack,
}

export function StudyGlyph({ slug }: { slug: string }) {
  return (
    <svg
      viewBox="0 0 72 52"
      aria-hidden="true"
      className="size-full text-[var(--color-text-muted)]"
    >
      {glyphs[slug]}
    </svg>
  )
}
