import { motion, useReducedMotion } from 'motion/react'
import { studies } from '../studies/registry'
import { entrance } from './motion'
import { StudyRow } from './StudyRow'

const muted = 'text-[var(--color-text-muted)]'

export function Hub() {
  const reduceMotion = useReducedMotion()
  const { container, item } = entrance(Boolean(reduceMotion))

  return (
    <motion.div
      className="mx-auto min-h-dvh max-w-3xl px-5 py-12 sm:py-20"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <header>
        <motion.h1
          variants={item}
          className="text-[length:clamp(2.25rem,6vw,3.5rem)] leading-[1.05] font-semibold tracking-[-0.03em]"
        >
          UI{' '}
          <span className="font-serif font-normal tracking-[-0.02em] italic">
            Études
          </span>
        </motion.h1>
        <motion.p variants={item} className={`mt-3 text-lg ${muted}`}>
          Small, finished interaction studies in React.
        </motion.p>
      </header>

      <main>
        <motion.div
          variants={item}
          className="mt-8 max-w-[60ch] space-y-4 leading-relaxed"
        >
          <p className="text-lg">
            An étude is a short piece of music written to practise one technical
            problem. The word is French for &ldquo;study&rdquo;. The best ones,
            Chopin&rsquo;s among them, turned out to be worth performing in
            their own right.
          </p>
          <p className={muted}>
            Each étude here takes one real interaction problem from product work
            and solves it properly, including the parts that usually get
            skipped. Together they show how I approach the craft: motion that
            explains what changed, layouts that work from a phone to a desktop,
            full keyboard and screen reader support, and designed behaviour for
            interruption, reduced motion and errors.
          </p>
          <p className={muted}>
            This is not a component library. There is nothing to install. Every
            study is self-contained, small enough to read in one sitting and
            meant to be copied.
          </p>
        </motion.div>

        <motion.div variants={item} className="mt-14">
          <h2
            className={`text-xs font-medium tracking-widest uppercase ${muted}`}
          >
            Studies
          </h2>
        </motion.div>
        <ul className="mt-2">
          {studies.map((study) => (
            <StudyRow key={study.slug} study={study} variants={item} />
          ))}
        </ul>
      </main>

      {/* TODO(wojciech): link the source repository here once it is public. */}
      <motion.footer variants={item} className={`mt-16 text-sm ${muted}`}>
        Built with React, TypeScript, Tailwind CSS, Radix UI and Motion.
      </motion.footer>
    </motion.div>
  )
}
