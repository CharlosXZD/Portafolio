import { memo } from 'react'
import { useGameSettings } from '../utils/gameSettingsContext.jsx'

// Element effects (EXPANSION.md E3): a placeholder layer of pixel particles
// per element, so dice with similar colors read apart at a glance. Pure
// CSS animations (elementa.css, `el-fx-*`): the browser runs one shared
// loop, there is no timer per die, and the root pauses them while the tab
// is hidden. Carlos will replace these with drawn sprite animations.
//
// Each element lists its layers; a layer is [kind, color, accent]. Kinds:
//   rise    flame pixels rising off the top       orbit   wind streaks circling
//   drip    drops falling off the bottom          ripple  a ring at the base
//   settle  pebbles and dust landing at the base  spark   pixels jumping around the edge
//   frost   crystals twinkling at the corners     puff    steam puffs rising
//   glint   star glints on the body               sheen   a light sweep across the body
//   halo    a soft glow cycling the four colors   leaf    a sprout on top
//   current a pulse running along the bottom      tick    a clock hand ticking
//   pulse   a light pulsing behind the die        rainbow a glow cycling every hue
const FX = {
  fire: [['rise', '#ff7a1a', '#ffd166']],
  water: [['drip', '#6fb6ff'], ['ripple', '#9fd4ff']],
  earth: [['settle', '#c89a5c', '#7a5a34']],
  air: [['orbit', '#eef7fb']],
  lightning: [['spark', '#ffe27a', '#ffffff']],
  ice: [['frost', '#bfefff', '#ffffff']],
  steam: [['puff', '#e8f0f2']],
  mud: [['drip', '#8a6a4a', 'slow']],
  crystal: [['glint', '#e9dcff', '#ffffff']],
  steel: [['sheen', '#ffffff']],
  storm: [['orbit', '#c9d4ff'], ['drip', '#7f8ff0']],
  obsidian: [['rise', '#b23a2a', '#ff7a45'], ['settle', '#4a4458', '#2b2b33']],
  magma: [['rise', '#ff5a1a', '#ffd166'], ['settle', '#c94f2b', '#7a2a14']],
  monsoon: [['drip', '#5fb0c8'], ['orbit', '#cfe6ee']],
  aether: [['halo']],
  midas: [['sheen', '#ffe9a3'], ['glint', '#ffe27a', '#ffffff']],
  sapling: [['leaf', '#6fbf4a', '#a6e57a']],
  mirror: [['sheen', '#eef3ff']],
  conduit: [['current', '#7ae0c8', '#ffffff']],
  chrono: [['tick', '#c9a0ff']],
  beacon: [['pulse', '#ffb347']],
  prism: [['rainbow', '#ff7ad9']],
  bullion: [['sheen', '#ffe9a3'], ['glint', '#ffd166', '#ffffff']],
  masquerade: [['sheen', '#f3d1ff'], ['glint', '#e9b0ff', '#ffffff']],
  chameleon: [['glint', '#a6e57a', '#e8ffd8']],
}

// Layers drawn behind the die body; every other kind goes in front.
const BEHIND = new Set(['halo', 'pulse', 'rainbow'])

// Particle positions as fractions of the die, fixed per index so every die
// of an element looks the same and nothing re-randomizes on re-render.
const SPREAD = [0.3, 0.62, 0.45, 0.76, 0.2, 0.55]

function Particles({ kind, color, accent, count, px }) {
  const items = Array.from({ length: count }, (_, i) => i)
  const style = (i, extra) => ({
    '--c': i % 2 && accent && accent !== 'slow' ? accent : color,
    '--p': `${px}px`,
    '--x': `${SPREAD[i % SPREAD.length] * 100}%`,
    animationDelay: `${(i / count) * (kind === 'drip' && accent === 'slow' ? 2.4 : 1.2)}s`,
    ...extra,
  })
  switch (kind) {
    case 'orbit':
      return items.slice(0, 2).map((i) => (
        <b key={i} className="el-fx-ring" style={{ animationDuration: `${2.2 + i * 0.9}s`, animationDirection: i ? 'reverse' : 'normal' }}>
          <i className="el-fx-streak" style={style(i, { animationDelay: '0s' })} />
        </b>
      ))
    case 'ripple':
      return <i className="el-fx-ripple" style={style(0)} />
    case 'sheen':
      return (
        <b className="el-fx-clip">
          <i className="el-fx-sheen" style={{ '--c': color }} />
        </b>
      )
    case 'halo':
      return <i className="el-fx-halo" />
    case 'rainbow':
      return <i className="el-fx-rainbow" style={{ '--c': color }} />
    case 'pulse':
      return <i className="el-fx-pulse" style={{ '--c': color }} />
    case 'tick':
      return (
        <b className="el-fx-clock" style={{ '--c': color }}>
          <i className="el-fx-hand" />
        </b>
      )
    case 'leaf':
      return <i className="el-fx-leaf" style={style(0, { '--c2': accent })} />
    default:
      return items.map((i) => <i key={i} className={`el-fx-${kind}${accent === 'slow' ? ' el-fx-slow' : ''}`} style={style(i)} />)
  }
}

/**
 * The effect layer for one die. Render it inside the die's positioned box,
 * once with `behind` before the body and once after it. `lite` (tiny dice,
 * the inventory) draws one layer with fewer particles.
 */
function ElementFx({ elementId, size, behind = false, lite = false }) {
  const { reducedMotion, display } = useGameSettings()
  if (reducedMotion || display.elementEffects === false) return null
  const layers = (FX[elementId] || []).filter(([kind]) => BEHIND.has(kind) === behind)
  if (layers.length === 0) return null
  const shown = lite ? layers.slice(0, 1) : layers
  const count = lite ? 2 : layers.length > 1 ? 3 : 5
  const px = Math.max(2, Math.round(size / (lite ? 18 : 15)))
  return (
    <span aria-hidden className={`el-fx ${behind ? 'el-fx--behind' : ''}`} style={{ '--s': `${size}px` }}>
      {shown.map(([kind, color, accent]) => (
        <Particles key={kind} kind={kind} color={color} accent={accent} count={count} px={px} />
      ))}
    </span>
  )
}

export default memo(ElementFx)
