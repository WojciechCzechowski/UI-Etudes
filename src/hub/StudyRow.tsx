import { ArrowRight } from 'lucide-react'
import { motion } from 'motion/react'
import type { Variants } from 'motion/react'
import type { StudyEntry } from '../studies/registry'
import { StudyGlyph } from './glyphs'

type StudyRowProps = {
  study: StudyEntry
  variants: Variants
}

// The whole row is the link. Title and summary are wired up as its name and
// description, so a screen reader hears "Title, link" and then the summary.
// The hover tint is a pseudo-element that fades in by opacity, so nothing has
// to interpolate between colours.
export function StudyRow({ study, variants }: StudyRowProps) {
  const number = study.dir.split('-')[0]
  const titleId = `${study.slug}-title`
  const summaryId = `${study.slug}-summary`

  return (
    <motion.li variants={variants}>
      <a
        href={`./${study.slug}/`}
        aria-labelledby={titleId}
        aria-describedby={summaryId}
        className="group relative isolate -mx-3 grid grid-cols-[1.5rem_auto_1fr_auto] items-center gap-x-3 rounded-[var(--radius-md)] px-3 py-5 before:absolute before:inset-0 before:-z-10 before:rounded-[inherit] before:bg-[var(--color-text)] before:opacity-0 before:transition-opacity before:duration-150 hover:before:opacity-[0.04] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] sm:gap-x-4"
      >
        <span
          aria-hidden="true"
          className="text-sm text-[var(--color-text-muted)] tabular-nums"
        >
          {number}
        </span>
        <span className="h-10 w-14 overflow-hidden rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] transition-colors duration-150 group-hover:border-[var(--color-accent)] group-focus-visible:border-[var(--color-accent)] sm:h-[52px] sm:w-[72px]">
          <StudyGlyph slug={study.slug} />
        </span>
        <span className="transition-transform duration-150 ease-out motion-safe:group-hover:translate-x-1 motion-safe:group-focus-visible:translate-x-1">
          <span id={titleId} className="block font-medium">
            {study.title}
          </span>
          <span
            id={summaryId}
            className="mt-0.5 block text-[var(--color-text-muted)]"
          >
            {study.summary}
          </span>
        </span>
        <ArrowRight
          aria-hidden="true"
          size={18}
          className="text-[var(--color-accent)] opacity-0 transition-[opacity,translate] duration-150 ease-out group-hover:opacity-100 group-focus-visible:opacity-100 motion-safe:-translate-x-2 motion-safe:group-hover:translate-x-0 motion-safe:group-focus-visible:translate-x-0"
        />
      </a>
    </motion.li>
  )
}
