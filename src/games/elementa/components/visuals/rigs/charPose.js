// The pose of a character at a moment (VISUALS.md V7): a pure function, so a live rig
// (a shared 8 fps clock) and a cinematic (a frame number) draw the same thing. Everything
// moves in whole art pixels and in steps, never in between and never by rotating a part.
// Time is in milliseconds. A pose is { dx, dy, sx, sy, op, flash, sat, glow, blink, mouth,
// spark }, with dx and dy in art pixels (the rig multiplies by its pixel size).

export const STEP = 120

/** The reactions the game can emit, by who emits them. `hold` ones stay on their last step. */
export const REACTIONS = {
  // Bosses and gods
  enter: { dur: 840 },
  taunt: { dur: 720 },
  hit: { dur: 480 },
  defeat: { dur: 1080, hold: true },
  // Pip
  tip: { dur: 960 },
  cheer: { dur: 1080 },
  worry: { dur: 1200 },
  curious: { dur: 960 },
  // The Arbiter
  warn: { dur: 1200, hold: true },
  smite: { dur: 720 },
  favor: { dur: 1200 },
}
export const REACTION_NAMES = Object.keys(REACTIONS)

const at = (list, s) => list[Math.min(s, list.length - 1)]

/** The offset of a reaction `rt` ms after it began (null once it is over). */
function reaction(name, rt) {
  const def = REACTIONS[name]
  if (!def || rt < 0) return null
  if (rt >= def.dur && !def.hold) return null
  const s = Math.floor(rt / STEP)
  switch (name) {
    case 'enter':
      return { dy: at([8, 6, 4, 2, 1, 0], s), op: at([0.2, 0.5, 0.75, 1], s) }
    case 'taunt':
      return { dy: at([0, -1, -2, -2, -1, 0], s), sx: s >= 1 && s <= 4 ? 1.06 : 1, sy: s >= 1 && s <= 4 ? 1.06 : 1 }
    case 'hit':
      return { dx: at([2, -2, 1, -1], s), flash: s < 2 ? 1 : 0 }
    case 'defeat':
      return { dy: at([0, 1, 2, 3, 4, 5, 5, 6, 6], s), op: at([1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.5, 0.45], s), sat: s >= 3 ? 0.25 : 1, glow: 0 }
    case 'tip':
      return { dx: at([0, 1, 1, 1, 1, 0], s), dy: s % 2 ? -1 : 0 }
    case 'cheer':
      return { dy: at([0, -3, -4, -3, 0, -2, -3, -2, 0], s), glow: 1 }
    case 'worry':
      return { dx: at([0, -1, 0, 1, 0, -1, 0, 1, 0, -1], s) }
    case 'curious':
      return { dx: -1, dy: s === 2 ? -1 : 0 }
    case 'warn':
      return { dy: at([-1, -2, -3, -3], s), glow: 1 }
    case 'smite':
      return { dy: at([-3, 0, 0, 0, 0, 0], s), flash: s < 3 ? 1 : 0, glow: 1 }
    case 'favor':
      return { dy: -1, glow: 1 }
    default:
      return null
  }
}

/**
 * The pose of a character with traits `def` (float, flicker, aspects...) at time `t` ms,
 * `react` begun at `reactAt` ms, optionally `talking`, `still` (one frame, no motion).
 */
export function poseAt(def, { t = 0, react = null, reactAt = 0, talking = false, still = false }) {
  const pose = { dx: 0, dy: 0, sx: 1, sy: 1, op: 1, flash: 0, sat: 1, glow: 0.5, blink: false, mouth: false, spark: 0, aspect: 0 }
  if (still) return pose
  const s = Math.floor(t / STEP)
  // Idle: breathe one art pixel every 600 ms, or float on a four step cycle.
  pose.dy = def?.float ? at([0, -1, -2, -1], Math.floor(s / 3) % 4) : Math.floor(s / 5) % 2 ? -1 : 0
  // A blink every 3.4 s, one step long, out of phase per character.
  pose.blink = (s + (def?.id?.length ?? 0) * 3) % 28 === 0
  pose.mouth = talking && s % 2 === 0
  pose.glow = def?.flicker ? (s % 3 === 0 ? 0.4 : 0.7) : s % 8 < 4 ? 0.5 : 0.7
  pose.spark = Math.floor(s / 4) % 3
  pose.aspect = def?.aspects ? Math.floor(t / 2400) % def.aspects.length : 0
  const r = react ? reaction(react, t - reactAt) : null
  if (r) {
    pose.dx += r.dx ?? 0
    pose.dy += r.dy ?? 0
    pose.sx = r.sx ?? pose.sx
    pose.sy = r.sy ?? pose.sy
    pose.op = r.op ?? pose.op
    pose.flash = r.flash ?? pose.flash
    pose.sat = r.sat ?? pose.sat
    pose.glow = r.glow ?? pose.glow
  }
  return pose
}
