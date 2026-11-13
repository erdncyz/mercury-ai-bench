import { useState, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { AmbientBackground } from './AmbientBackground'
import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './SiteHeader'
import { pageEnter } from '../lib/motion'

export function PageShell({
  children,
  fetchedAt,
  source,
  wide = false,
}: {
  children: ReactNode
  fetchedAt?: string
  source?: string
  wide?: boolean
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  return (
    <div className={`relative flex min-h-dvh flex-col ${sidebarOpen ? 'xl:pl-64' : 'xl:pl-20'}`}>
      <AmbientBackground />
      <SiteHeader sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(open => !open)} />
      <motion.main
        className={`page-gutter relative z-10 mx-auto w-full min-w-0 flex-1 px-4 pb-20 pt-6 sm:pt-8 md:px-8 ${
          wide ? 'max-w-7xl' : 'max-w-6xl'
        }`}
        variants={pageEnter}
        initial="hidden"
        animate="show"
        exit="exit"
      >
        {children}
      </motion.main>
      <SiteFooter fetchedAt={fetchedAt} source={source} />
    </div>
  )
}

export function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`skeleton rounded-2xl ${className ?? 'h-40'}`} />
}
