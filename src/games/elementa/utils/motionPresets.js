// Shared "juicy" interaction presets (Balatro's springy card-physics feel:
// squash on press, a little wobble on hover) so every interactive piece
// gets the same handling instead of each component inventing its own
// spring constants. `reducedMotion` (from useGameSettings) strips all of it
// back to the plain, motionless defaults for anyone who wants that off.
export function juicyHover(reducedMotion) {
  if (reducedMotion) return {}
  return { scale: 1.06, rotate: [0, -2, 2, 0], transition: { rotate: { duration: 0.35 } } }
}

export function juicyTap(reducedMotion) {
  if (reducedMotion) return { scale: 0.97 }
  return { scale: [1, 0.88, 1.04, 1], transition: { duration: 0.28, ease: 'easeOut' } }
}

export const juicySpring = { type: 'spring', stiffness: 400, damping: 12 }
