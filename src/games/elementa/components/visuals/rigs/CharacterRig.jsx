import { memo, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { mix } from '../../../utils/color.js'
import BossAvatar from '../../BossAvatar.jsx'
import { ArbiterHand } from '../../ArbiterHand.jsx'
import { useVisualEnv } from '../VisualEnv.jsx'
import { CHAR_SPRITES } from './charData.js'
import { findImageOverride } from '../../../data/visualRegistry.js'
import { STEP, poseAt } from './charPose.js'

// One rig for every character that had none (VISUALS.md V7). It has three bodies behind one
// API: a layered pixel sprite (Pip, the four gods, the Primordial, You: charData.js), the
// Arbiter's open hand, and any boss avatar (the generated creature) wrapped in the same
// motion. Every one has: idle (breathe or float), blink or an equivalent, talking, and the
// reactions of charPose.js. All motion is stepped and moves whole art pixels; nothing rotates.
//
// Time comes from `t` (milliseconds, a cinematic passes its frame) or, when `t` is not given,
// from one shared 8 fps clock that only runs while a rig is live on screen. Reduced motion
// and the low-end tier draw one still pose. `reactKey` replays a reaction: bump it to run
// `react` again. A hand-drawn replacement is looked up by id elsewhere (the swap rule).

// --- the shared clock ---------------------------------------------------------------------
let step = 0
let timer = null
const listeners = new Set()
function subscribe(fn) {
  listeners.add(fn)
  if (!timer) timer = setInterval(() => {
    step++
    listeners.forEach((l) => l())
  }, STEP)
  return () => {
    listeners.delete(fn)
    if (listeners.size === 0 && timer) {
      clearInterval(timer)
      timer = null
    }
  }
}
const getStep = () => step
const noopSub = () => () => {}

/** Stepped time in ms: the shared clock while `active`, 0 otherwise. */
function useClock(active) {
  return useSyncExternalStore(active ? subscribe : noopSub, getStep, getStep) * STEP
}

// --- sprites ------------------------------------------------------------------------------
const rowCache = new Map()
/** The rows of a sprite in one state (open or blinking eyes, mouth shut or open). */
function rowsFor(def, blink, mouth) {
  const key = `${def.id}${blink ? 'b' : ''}${mouth ? 'm' : ''}`
  if (rowCache.has(key)) return rowCache.get(key)
  let rows = def.rows
  if (blink && def.eyes) rows = rows.map((r) => [...r].map((ch) => def.eyes[ch] ?? ch).join(''))
  if (mouth && def.mouth != null && def.mouthRow != null) rows = rows.map((r, y) => (y === def.mouthRow || y === def.mouthRow + 1 ? [...r].map((ch) => (ch === def.mouth ? 'k' : ch)).join('') : r))
  rowCache.set(key, rows)
  return rows
}

function rects(rows, palette) {
  const out = []
  rows.forEach((row, y) => {
    let x = 0
    while (x < row.length) {
      const ch = row[x]
      let end = x + 1
      while (end < row.length && row[end] === ch) end++
      const fill = palette[ch]
      if (fill) out.push(<rect key={`${x}-${y}`} x={x} y={y} width={end - x} height="1.02" fill={fill} />)
      x = end
    }
  })
  return out
}

/** The palette of a sprite at a moment (the Primordial's aspect changes it). */
function paletteFor(def, aspect) {
  if (!def.aspects) return def.palette
  const c = def.aspects[aspect]
  return { ...def.palette, a: mix(c, '#ffffff', 0.15), b: mix(c, '#120c1a', 0.38), c: '#ffd166' }
}

function Sprite({ def, pose, size }) {
  const rows = rowsFor(def, pose.blink, pose.mouth)
  const palette = paletteFor(def, pose.aspect)
  const sparks = def.sparks
  return (
    <svg viewBox={`0 0 ${def.grid} ${def.grid}`} width={size} height={size} shapeRendering="crispEdges" aria-hidden="true" overflow="visible">
      {rects(rows, palette)}
      {sparks && sparks.map(([x, y], i) => (i === pose.spark ? <rect key={i} x={x} y={y} width="1" height="1" fill={palette.c} /> : null))}
    </svg>
  )
}

// --- the rig ------------------------------------------------------------------------------

/** The kind of body an id has. */
export function rigKind(id) {
  return CHAR_SPRITES[id] ? 'sprite' : id === 'arbiter' ? 'arbiter' : 'boss'
}

function CharacterRig({ id, size = 112, t, react = null, reactKey = 0, reactAt: reactAtProp, talking = false, still: stillProp, silhouette = false, flash = true, className = '', style }) {
  const { reduced, quality } = useVisualEnv()
  const driven = typeof t === 'number'
  const still = stillProp ?? (reduced || quality === 'low')
  const now = useClock(!driven && !still)
  const time = driven ? t : now
  // A reaction begins when its key changes (live) or at `reactAt` (driven).
  const started = useRef({ key: null, at: -1e9 })
  useEffect(() => {
    if (!driven && react && started.current.key !== reactKey) started.current = { key: reactKey, at: getStep() * STEP }
  }, [driven, react, reactKey])
  const reactAt = driven ? (reactAtProp ?? 0) : started.current.at
  // The swap rule: a file named `rig.<id>` in public/elementa/visuals/ (png, webp or svg) replaces the body.
  const [swap, setSwap] = useState(null)
  useEffect(() => {
    let live = true
    findImageOverride(`rig.${id}`).then((u) => live && setSwap(u))
    return () => {
      live = false
    }
  }, [id])
  const kind = rigKind(id)
  const def = kind === 'sprite' ? CHAR_SPRITES[id] : null
  const pose = useMemo(() => poseAt(def, { t: time, react, reactAt, talking, still }), [def, time, react, reactAt, talking, still])
  const grid = def?.grid ?? (kind === 'arbiter' ? 32 : 12)
  const unit = size / grid
  const aura = def?.aura ?? (kind === 'arbiter' ? '#d8d2e8' : null)
  const glow = aura ? `drop-shadow(0 0 ${Math.round(6 + pose.glow * 10)}px ${aura}${pose.glow > 0.55 ? 'aa' : '66'})` : ''
  const filter = [silhouette ? 'brightness(0)' : '', pose.flash && flash ? 'brightness(2.2)' : '', pose.sat !== 1 ? `saturate(${pose.sat})` : '', glow].filter(Boolean).join(' ')
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        lineHeight: 0,
        width: size,
        height: size,
        opacity: pose.op,
        transform: `translate(${pose.dx * unit}px, ${pose.dy * unit}px) scale(${pose.sx}, ${pose.sy})`,
        transformOrigin: '50% 100%',
        filter: filter || undefined,
        ...style,
      }}
    >
      {swap ? <img src={swap} alt="" width={size} height={size} style={{ imageRendering: 'pixelated', objectFit: 'contain' }} /> : kind === 'sprite' ? <Sprite def={def} pose={pose} size={size} /> : kind === 'arbiter' ? <ArbiterHand size={size} /> : <BossAvatar id={id} size={size} />}
    </span>
  )
}

export default memo(CharacterRig)
