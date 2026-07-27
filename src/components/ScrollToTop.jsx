import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const id = hash.slice(1)
      // wait a tick for the route's content (and the page-transition animation) to lay out first
      const id2 = setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ block: 'start' })
      }, 300)
      return () => clearTimeout(id2)
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])

  return null
}

export default ScrollToTop
