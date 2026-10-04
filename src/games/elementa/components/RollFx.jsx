import { memo } from 'react'
import { ELEMENTS } from '../data/elements.js'
import { useGameSettings } from '../utils/gameSettingsContext.jsx'
import { mix } from '../utils/color.js'

// One-shot effects on a die (EXPANSION.md P3, P11, P12): the landing burst
// of a roll, an explosion in a chain, a Drift gust and a lock closing. Like
// the looping element effects (ElementFx.jsx) every piece is a pixel <i> or
// <b> moved only with transform and opacity by CSS keyframes (`el-shot-*` in
// elementa.css), so no timer runs per particle. The parent keys the
// component to replay it. Positions come from the particle's index, never a
// random call, so the same event always looks the same. Reduced motion
// swaps every one of them for a single soft flash.

// A cheap deterministic 0..1 from an index: variation without Math.random.
const jitter = (i, salt = 1) => {
  const x = Math.sin((i + 1) * 12.9898 + salt * 78.233) * 43758.5453
  return x - Math.floor(x)
}

/**
 * Particles flying out from the die's center. `angle` and `spread` are in
 * degrees (-90 is straight up); `dist` is in die sizes; `gravity` makes them
 * fall after the throw; `grow` scales them up instead of down.
 */
function Burst({ n, colors, size, angle = 0, spread = 360, dist = 0.7, px, dur = 0.5, gravity = 0, grow = 0, spin = 0, delay = 0, long = false }) {
  const p = px ?? Math.max(3, Math.round(size / 16))
  return Array.from({ length: n }, (_, i) => {
    const a = ((angle + (n > 1 ? (i / (n - 1) - 0.5) * spread : 0) + (jitter(i, 2) - 0.5) * 18) * Math.PI) / 180
    const d = size * dist * (0.65 + jitter(i, 3) * 0.55)
    return (
      <i
        key={i}
        className={gravity ? 'el-shot-arc' : 'el-shot-fly'}
        style={{
          '--c': colors[i % colors.length],
          '--p': `${long ? p * 2 : p}px`,
          '--w': `${long ? p : p}px`,
          '--dx': `${Math.cos(a) * d}px`,
          '--dy': `${Math.sin(a) * d}px`,
          '--g': `${size * gravity}px`,
          '--r': `${spin * (jitter(i, 4) > 0.5 ? 1 : -1) * (180 + jitter(i, 5) * 180)}deg`,
          '--sc': grow ? grow : 0.35,
          '--t': `${dur * (0.8 + jitter(i, 6) * 0.4)}s`,
          '--d': `${delay + jitter(i, 7) * 0.06}s`,
        }}
      />
    )
  })
}

const Flash = ({ color, dur = 0.22, strength = 0.55 }) => (
  <b className="el-shot-flash" style={{ '--c': color, '--t': `${dur}s`, '--o': strength }} />
)
const Ring = ({ color, delay = 0, to = 1.7, dur = 0.5 }) => (
  <b className="el-shot-ring" style={{ '--c': color, '--d': `${delay}s`, '--to': to, '--t': `${dur}s` }} />
)

/** A zigzag bolt from above the die down through it, in pixel steps. */
function Bolt({ color = '#fff7c2', glow = '#ffe27a', size }) {
  return (
    <svg
      className="el-shot-bolt"
      viewBox="0 0 8 16"
      shapeRendering="crispEdges"
      style={{ '--c': color, '--glow': glow, width: size * 0.5, height: size * 1.15 }}
      aria-hidden
    >
      <path d="M5 0H3V3H1V6H4V8H2V11H4V13H3V16H6V12H5V10H7V7H4V5H6V2H5Z" fill="currentColor" />
    </svg>
  )
}

// --- Landing burst (P3): what a die kicks up when it lands. ---
// [mode, color, accent]
const LAND = {
  fire: ['embers', '#ff7a1a', '#ffd166'],
  water: ['splash', '#6fb6ff', '#9fd4ff'],
  earth: ['dust', '#c89a5c', '#7a5a34'],
  air: ['swirl', '#eef7fb', '#cfe0e8'],
  lightning: ['sparks', '#ffe27a', '#ffffff'],
  ice: ['crystals', '#bfefff', '#ffffff'],
  steam: ['puff', '#e8f0f2', '#b6c6cc'],
  mud: ['splash', '#8a6a4a', '#6b4f3a'],
  crystal: ['crystals', '#e9dcff', '#b28df2'],
  steel: ['sparks', '#ffffff', '#9aa0a6'],
  storm: ['sparks', '#c9d4ff', '#7f8ff0'],
  obsidian: ['shards', '#4a4458', '#b23a2a'],
  magma: ['splash', '#ff5a1a', '#ffd166'],
  monsoon: ['splash', '#5fb0c8', '#cfe6ee'],
  aether: ['ring', '#ffffff', '#ffe9a3'],
  comet: ['embers', '#8fd8ff', '#ffffff'],
  pulsar: ['ring', '#ff8fd0', '#ffffff'],
  satellite: ['swirl', '#b8c8e8', '#ffffff'],
  quasar: ['ring', '#c58cff', '#ffffff'],
  zenith: ['crystals', '#ffe08a', '#ffffff'],
  prism: ['ring', '#ff7ad9', '#ffffff'],
  gaea: ['dust', '#c89a5c', '#ffe9a3'],
  ognen: ['embers', '#ff5a1a', '#ffe27a'],
  varuna: ['splash', '#2f7fe0', '#9fd4ff'],
  zephyr: ['swirl', '#ffffff', '#dff3ff'],
  primordial_die: ['ring', '#ff4d6d', '#ffffff'],
  light: ['ring', '#fff2a8', '#ffffff'],
  darkness: ['dust', '#6a4fb8', '#2a1f40'],
  time: ['ring', '#b9a6ff', '#ffffff'],
  space: ['swirl', '#5a7cff', '#c9d4ff'],
  chaos: ['sparks', '#ff3fa4', '#ffd166'],
  void: ['puff', '#8a7aa8', '#3a3048'],
  entropy: ['ring', '#f0e8ff', '#ff4fd8'],
  glimmer: ['sparks', '#fff3b8', '#ffffff'],
  gloom: ['dust', '#6d5aa6', '#2a1f40'],
  moment: ['ring', '#cbbcff', '#ffffff'],
  reach: ['swirl', '#7d9bff', '#c9d4ff'],
  flux: ['sparks', '#ff74c0', '#ffd166'],
  nil: ['puff', '#9a8fb3', '#3a3048'],
  singularity: ['ring', '#e8e0ff', '#120c1a'],
  abyss: ['dust', '#4a3d6e', '#120c1a'],
  dead_star: ['dust', '#6b6378', '#3a3448'],
}

function LandBurstImpl({ elementId, size, heavy = 0 }) {
  const { reducedMotion } = useGameSettings()
  if (reducedMotion) return null
  const [mode, c1, accent] = LAND[elementId] ?? ['sparks', ELEMENTS[elementId]?.color ?? '#ffffff', '#ffffff']
  const colors = [c1, accent]
  const k = 1 + heavy * 0.5 // a d20 kicks up more
  let body
  switch (mode) {
    case 'embers':
      body = <Burst n={5} colors={colors} size={size} angle={-90} spread={110} dist={0.55 * k} dur={0.55} />
      break
    case 'splash':
      body = <Burst n={6} colors={colors} size={size} angle={-90} spread={150} dist={0.5 * k} gravity={0.35} dur={0.5} />
      break
    case 'dust':
      body = (
        <>
          <Burst n={4} colors={colors} size={size} angle={180} spread={30} dist={0.55 * k} grow={1.8} dur={0.6} />
          <Burst n={4} colors={colors} size={size} angle={0} spread={30} dist={0.55 * k} grow={1.8} dur={0.6} />
        </>
      )
      break
    case 'swirl':
      body = <Burst n={6} colors={colors} size={size} dist={0.6 * k} spin={0.5} long dur={0.55} />
      break
    case 'crystals':
      body = <Burst n={5} colors={colors} size={size} dist={0.5 * k} grow={1.3} dur={0.6} />
      break
    case 'puff':
      body = <Burst n={3} colors={colors} size={size} angle={-90} spread={60} dist={0.45 * k} px={Math.round(size / 9)} grow={2.2} dur={0.7} />
      break
    case 'shards':
      body = <Burst n={5} colors={colors} size={size} angle={-90} spread={140} dist={0.5 * k} gravity={0.4} spin={1} dur={0.55} />
      break
    case 'ring':
      body = (
        <>
          <Ring color={c1} to={1.5 * k} />
          <Burst n={4} colors={colors} size={size} dist={0.55 * k} dur={0.5} />
        </>
      )
      break
    default:
      body = <Burst n={7} colors={colors} size={size} dist={0.65 * k} dur={0.32} />
  }
  return (
    <span aria-hidden className="el-shot">
      {body}
    </span>
  )
}
export const LandBurst = memo(LandBurstImpl)

// --- Explosions (P11): one look per exploding die. ---
const BOOM = {
  fire: 'flame',
  lightning: 'bolt',
  steel: 'sparks',
  steam: 'puff',
  storm: 'storm',
  obsidian: 'shards',
  magma: 'lava',
  aether: 'ring',
  primordial_die: 'ring',
  ognen: 'pillar',
  comet: 'flame',
}

const BOOM_COLORS = {
  flame: ['#ff7a1a', '#ffd166', '#e5533d'],
  sparks: ['#ffffff', '#cfd4d8', '#ffd166'],
  puff: ['#f3f7f8', '#d8e8ec', '#b6c6cc'],
  shards: ['#2b2b33', '#4a4458', '#b23a2a'],
  lava: ['#ff5a1a', '#c94f2b', '#ffd166'],
  ring: ['#ffffff', '#ffe9a3', '#f2f2f2'],
  pillar: ['#ff5a1a', '#ff7a1a', '#ffe27a'],
}

/**
 * One explosion of a chain. `step` (1, 2, 3...) makes later ones bigger and
 * brighter, so the chain visibly builds.
 */
function ExplosionFxImpl({ elementId, size, step = 1 }) {
  const { reducedMotion } = useGameSettings()
  const kind = BOOM[elementId] ?? 'flame'
  if (reducedMotion) {
    return (
      <span aria-hidden className="el-shot">
        <Flash color="#ffd166" dur={0.3} strength={0.45} />
      </span>
    )
  }
  const grow = 1 + Math.min(step - 1, 5) * 0.14
  const n = 6 + Math.min(step, 4) * 2
  const colors = BOOM_COLORS[kind] ?? BOOM_COLORS.flame
  let body
  switch (kind) {
    case 'bolt':
      body = (
        <>
          <Flash color="#ffffff" dur={0.16} strength={0.8} />
          <Bolt size={size * grow} />
          <Burst n={6} colors={['#ffe27a', '#ffffff']} size={size} dist={0.8 * grow} dur={0.3} />
        </>
      )
      break
    case 'sparks':
      body = (
        <>
          <Flash color="#e8eef2" dur={0.14} strength={0.65} />
          <Burst n={n + 4} colors={colors} size={size} dist={0.95 * grow} long dur={0.32} />
        </>
      )
      break
    case 'puff':
      body = (
        <>
          <Burst n={4} colors={colors} size={size} angle={-90} spread={110} dist={0.5 * grow} px={Math.round(size / 7)} grow={2.4} dur={0.75} />
          <Burst n={4} colors={colors} size={size} angle={-90} spread={160} dist={0.8 * grow} dur={0.6} />
        </>
      )
      break
    case 'storm':
      body = (
        <>
          <Flash color="#c9d4ff" dur={0.2} strength={0.7} />
          <span className="el-shot-cloud" style={{ '--s': `${size}px` }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <i key={i} style={{ '--i': i }} />
            ))}
          </span>
          <Bolt size={size * grow} color="#ffffff" glow="#7f8ff0" />
        </>
      )
      break
    case 'shards':
      body = (
        <>
          <Flash color="#b23a2a" dur={0.18} strength={0.4} />
          <Burst n={n} colors={colors} size={size} angle={-90} spread={220} dist={0.75 * grow} gravity={0.5} spin={1} dur={0.6} />
        </>
      )
      break
    case 'lava':
      body = (
        <>
          <Flash color="#ff5a1a" dur={0.2} strength={0.45} />
          <Burst n={n} colors={colors} size={size} angle={-90} spread={150} dist={0.85 * grow} gravity={0.6} px={Math.round(size / 11)} dur={0.7} />
        </>
      )
      break
    case 'ring':
      body = (
        <>
          <Flash color="#fff3c9" dur={0.25} strength={0.6} />
          <Ring color="#ffffff" to={2 * grow} dur={0.55} />
          <Ring color="#ffe9a3" to={1.4 * grow} delay={0.1} dur={0.55} />
          <Burst n={6} colors={colors} size={size} dist={0.8 * grow} dur={0.5} />
        </>
      )
      break
    case 'pillar':
      body = (
        <>
          <Flash color="#ff5a1a" dur={0.2} strength={0.5} />
          <b className="el-shot-pillar" style={{ '--h': `${size * 2.1 * grow}px` }} />
          <Burst n={n} colors={colors} size={size} angle={-90} spread={70} dist={1.1 * grow} dur={0.7} />
        </>
      )
      break
    default:
      body = (
        <>
          <Flash color="#ffb36b" dur={0.2} strength={0.5} />
          <Ring color="#ffd166" to={1.5 * grow} dur={0.4} />
          <Burst n={n} colors={colors} size={size} angle={-90} spread={200} dist={0.85 * grow} dur={0.55} />
        </>
      )
  }
  return (
    <span aria-hidden className="el-shot">
      {body}
    </span>
  )
}
export const ExplosionFx = memo(ExplosionFxImpl)

// --- Drift (P12): a gust crosses the die; the number ticks with an arrow. ---
function PixelArrowSvg({ up, color }) {
  const rows = up ? ['..#..', '.###.', '#####', '..#..', '..#..'] : ['..#..', '..#..', '#####', '.###.', '..#..']
  return (
    <svg width={15} height={15} viewBox="0 0 5 5" shapeRendering="crispEdges" aria-hidden style={{ color }}>
      {rows.flatMap((row, y) =>
        [...row].map((c, x) => (c === '#' ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="currentColor" /> : null)),
      )}
    </svg>
  )
}

function DriftFxImpl({ elementId, size, dir = 1 }) {
  const { reducedMotion } = useGameSettings()
  if (reducedMotion) {
    return (
      <span aria-hidden className="el-shot">
        <Flash color="#dff3ff" dur={0.3} strength={0.4} />
      </span>
    )
  }
  const heavy = elementId === 'zephyr'
  const streaks = heavy ? 6 : 3
  const px = Math.max(2, Math.round(size / 30))
  return (
    <span aria-hidden className="el-shot">
      <b className="el-shot-gust-clip">
        <i className="el-shot-gust" style={heavy ? { '--w': '70%', '--o': 0.75 } : undefined} />
      </b>
      {Array.from({ length: streaks }, (_, i) => (
        <i
          key={i}
          className="el-shot-streak"
          style={{
            '--c': '#eef7fb',
            '--p': `${px}px`,
            '--len': `${size * (0.3 + jitter(i, 8) * 0.3)}px`,
            '--y': `${(0.18 + (i / streaks) * 0.64) * 100}%`,
            '--dx': `${size * (0.5 + jitter(i, 9) * 0.5)}px`,
            '--d': `${i * 0.04}s`,
          }}
        />
      ))}
      <span className="el-shot-arrow" style={{ '--dir': dir, right: -size * 0.28 }}>
        <PixelArrowSvg up={dir > 0} color={dir > 0 ? '#bfefff' : '#cfd4ff'} />
      </span>
      {elementId === 'lightning' && <Burst n={4} colors={['#ffe27a', '#ffffff']} size={size} dist={0.6} dur={0.3} delay={0.1} />}
      {elementId === 'crystal' && <Burst n={3} colors={['#ffffff', '#e9dcff']} size={size} dist={0.5} grow={1.4} dur={0.5} delay={0.12} />}
      {heavy && <Ring color="#ffffff" to={1.6} dur={0.5} />}
    </span>
  )
}
export const DriftFx = memo(DriftFxImpl)

// --- Locking (P12): chain links close around the die and a lock clicks. ---
const LINK_STYLE = {
  water: { color: '#9fd4ff', accent: '#3d8fe5', fx: 'ripple' },
  ice: { color: '#d9f6ff', accent: '#7dd3fc', fx: 'frost' },
  mud: { color: '#9a7a58', accent: '#4a3624', fx: 'clamp' },
  steel: { color: '#e8eef2', accent: '#7c838a', fx: 'clang' },
  monsoon: { color: '#8fd0e0', accent: '#2f6a7c', fx: 'swirl' },
}

// Eight link positions around the edge: [left%, top%, rotated?]
const LINKS = [
  [12, 4, 0], [50, 0, 0], [88, 4, 0], [100, 50, 1], [88, 96, 0], [50, 100, 0], [12, 96, 0], [0, 50, 1],
]

const LOCK_ROWS = ['.###.', '#...#', '#...#', '#####', '##.##', '##.##', '#####']

function LockFxImpl({ elementId, size }) {
  const { reducedMotion } = useGameSettings()
  const def = ELEMENTS[elementId]
  const style = LINK_STYLE[elementId] ?? { color: mix(def?.color ?? '#ffffff', '#ffffff', 0.55), accent: def?.color ?? '#9ca3af', fx: 'plain' }
  if (reducedMotion) {
    return (
      <span aria-hidden className="el-shot">
        <Flash color={style.accent} dur={0.35} strength={0.45} />
      </span>
    )
  }
  const thick = style.fx === 'clamp' ? 1.6 : 1
  const lp = Math.max(3, Math.round(size / 14)) * thick
  return (
    <span aria-hidden className={`el-shot el-shot-lock ${style.fx === 'swirl' ? 'el-shot-lock--swirl' : ''}`}>
      <span className="el-shot-links">
        {LINKS.map(([x, y, rot], i) => (
          <i
            key={i}
            className="el-shot-link"
            style={{
              '--c': style.color,
              '--edge': style.accent,
              '--lw': `${lp * 2.4}px`,
              '--lh': `${lp * 1.3}px`,
              left: `${x}%`,
              top: `${y}%`,
              '--rot': rot ? '90deg' : '0deg',
              '--d': `${i * 0.045}s`,
            }}
          />
        ))}
      </span>
      {style.fx === 'ripple' && (
        <>
          <Ring color="#9fd4ff" delay={0.3} to={1.5} dur={0.6} />
          <Ring color="#6fb6ff" delay={0.42} to={1.9} dur={0.6} />
        </>
      )}
      {style.fx === 'frost' && (
        <>
          <b className="el-shot-frost" />
          <Burst n={6} colors={['#ffffff', '#bfefff']} size={size} dist={0.5} grow={1.4} dur={0.6} delay={0.3} />
        </>
      )}
      {style.fx === 'clamp' && <b className="el-shot-clamp" />}
      {style.fx === 'clang' && (
        <>
          <Flash color="#ffffff" dur={0.14} strength={0.7} />
          <Burst n={8} colors={['#ffffff', '#cfd4d8', '#ffd166']} size={size} dist={0.8} long dur={0.3} delay={0.36} />
        </>
      )}
      <span className="el-shot-padlock" style={{ '--c': style.color, '--edge': style.accent }}>
        <svg width={size * 0.3} height={size * 0.3 * 1.15} viewBox="0 0 5 7" shapeRendering="crispEdges">
          {LOCK_ROWS.flatMap((row, y) =>
            [...row].map((c, x) => (c === '#' ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="currentColor" /> : null)),
          )}
        </svg>
      </span>
    </span>
  )
}
export const LockFx = memo(LockFxImpl)
