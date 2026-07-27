import { Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from './Navbar.jsx'
import Footer from './Footer.jsx'
import ScrollToTop from './ScrollToTop.jsx'

function Layout() {
  const { pathname } = useLocation()

  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Navbar />
      <motion.main
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="flex-1"
      >
        <Outlet />
      </motion.main>
      <Footer />
    </div>
  )
}

export default Layout
