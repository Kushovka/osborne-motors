import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect } from 'react'
import { useLocation, useOutlet } from 'react-router'
import { Header } from './Header'
import { Footer } from './Footer'
import { ScrollToTop } from './ScrollToTop'
import { initMetaPixel, trackPageView } from '../utils/metaPixel'

export const Layout = () => {
  const location = useLocation()
  const outlet = useOutlet()
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    initMetaPixel()
    trackPageView()
  }, [location.pathname, location.search])

  return (
    <div className={location.pathname === '/warranty' ? 'warranty-layout' : undefined}>
      <ScrollToTop />
      <Header />
      <div className="page-transition">
        <AnimatePresence mode="sync" initial={false}>
          <motion.main
            key={location.pathname}
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: -8 }}
            transition={{ duration: prefersReducedMotion ? 0.12 : 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {outlet}
          </motion.main>
        </AnimatePresence>
      </div>
      <Footer />
    </div>
  )
}
