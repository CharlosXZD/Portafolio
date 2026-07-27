import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

const prefersReducedMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

function PhoneMockup({ screens }) {
  const list = Array.isArray(screens) ? screens : [screens]
  const [index, setIndex] = useState(0)
  const frameRef = useRef(null)

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 150, damping: 20 })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 150, damping: 20 })

  useEffect(() => {
    if (list.length < 2) return
    const id = setInterval(() => setIndex((i) => (i + 1) % list.length), 3800)
    return () => clearInterval(id)
  }, [list.length])

  function handlePointerMove(e) {
    if (prefersReducedMotion || !frameRef.current) return
    const rect = frameRef.current.getBoundingClientRect()
    x.set((e.clientX - rect.left) / rect.width - 0.5)
    y.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  function handlePointerLeave() {
    x.set(0)
    y.set(0)
  }

  return (
    <div className="flex flex-col items-center">
      <div style={{ perspective: 1200 }}>
        <motion.div
          ref={frameRef}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          style={{ rotateX, rotateY }}
          className="relative mx-auto w-[15.5rem] rounded-[2.6rem] border border-neutral-800 bg-gradient-to-b from-neutral-800 to-neutral-950 p-3 shadow-2xl shadow-black/30 dark:shadow-black/60"
        >
          {/* side buttons */}
          <span className="absolute -left-[3px] top-24 h-8 w-[3px] rounded-l-sm bg-neutral-700" />
          <span className="absolute -left-[3px] top-36 h-14 w-[3px] rounded-l-sm bg-neutral-700" />
          <span className="absolute -right-[3px] top-32 h-16 w-[3px] rounded-r-sm bg-neutral-700" />

          <div className="relative aspect-[9/19.5] w-full overflow-hidden rounded-[2rem] bg-black">
            {/* notch */}
            <div className="absolute left-1/2 top-0 z-10 h-5 w-24 -translate-x-1/2 rounded-b-2xl bg-neutral-950" />
            <AnimatePresence mode="sync">
              <motion.img
                key={list[index]}
                src={list[index]}
                alt=""
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 h-full w-full object-cover object-top"
              />
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {list.length > 1 && (
        <div className="mt-5 flex gap-1.5">
          {list.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Screen ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? 'w-5 bg-brand-500' : 'w-1.5 bg-neutral-300 dark:bg-neutral-700'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default PhoneMockup
