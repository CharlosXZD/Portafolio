import { motion } from 'framer-motion'

function Reveal({ children, delay = 0, y = 24, className }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ type: 'spring', bounce: 0, duration: 0.7, delay }}
    >
      {children}
    </motion.div>
  )
}

export default Reveal
