import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { useReduceMotion } from './demo-controls/DemoSettings'
import { entrance } from './motion'

type PageShellProps = {
  title: string
  children: ReactNode
  /**
   * Controls that are position: fixed (a floating button, the demo settings,
   * a toast viewport). They fade in with the page but never travel, and stay
   * outside the content so no transform sits above them.
   */
  floating?: ReactNode
}

export function PageShell({ title, children, floating }: PageShellProps) {
  const { container, item, fade } = entrance(useReduceMotion())

  return (
    <motion.div
      className="mx-auto min-h-dvh max-w-2xl px-5 py-10"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Plain elements pass the entrance on to the motion children inside,
          so the title and the content still rise one after the other. */}
      <main>
        <motion.h1 variants={item} className="text-2xl font-semibold">
          {title}
        </motion.h1>
        <motion.div variants={item} className="mt-6">
          {children}
        </motion.div>
      </main>
      {floating && <motion.div variants={fade}>{floating}</motion.div>}
    </motion.div>
  )
}
