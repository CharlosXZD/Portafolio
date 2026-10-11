import { Easing, interpolate } from 'remotion'
import { ELEMENTS } from '../../../data/elements.js'
import BossAvatar from '../../BossAvatar.jsx'
import KeeperSprite from '../../KeeperSprite.jsx'
import PixelIcon from '../../PixelIcon.jsx'
import { PipSprite } from '../../Tutorial.jsx'
import { INTRO, LOOP, W } from './sceneLayout.js'

// The character slot of a story scene (VISUALS.md V5). `CharacterArt` is the
// one place that decides what a portrait looks like on the cinematic stage:
// today the existing sprites (boss avatars, keeper sprites, Pip, a die's icon),
// scaled up. Phase V7 gives the characters real rigs and expressions: swap the
// body of `CharacterArt` (or add a kind) and every scene picks it up, because
// the motion, light and entrance below only ever ask it to draw a portrait at
// a size.

const SIZE = 300

/** What a portrait looks like, drawn at `size` pixels of the 960 by 540 stage. */
export function CharacterArt({ portrait, size = SIZE }) {
  if (!portrait) return null
  if (portrait.kind === 'boss') return <BossAvatar id={portrait.id} size={size} />
  if (portrait.kind === 'keeper') return <KeeperSprite id={portrait.id} size={size} />
  if (portrait.kind === 'pip') return <PipSprite size={size * 0.85} glow={false} />
  if (portrait.kind === 'ending') return <EndingFigure portrait={portrait} size={size} />
  const color = ELEMENTS[portrait.id]?.color ?? '#ffffff'
  return <PixelIcon name={portrait.id} size={size * 0.7} color={color} hi="#fffaf0" />
}

// The ending cards' art, as in EndingCards (the Primordial asleep, the four kept apart, the die made whole).
function EndingFigure({ portrait, size }) {
  if (portrait.id === 'split') {
    return (
      <span style={{ display: 'flex', gap: size / 12, alignItems: 'center', lineHeight: 0 }}>
        {['fire', 'water', 'earth', 'air'].map((id) => (
          <PixelIcon key={id} name={id} size={size / 3} color={id === 'earth' ? '#c89a5c' : ELEMENTS[id].color} hi="#fffaf0" />
        ))}
      </span>
    )
  }
  if (portrait.id === 'primordial') return <PixelIcon name="primordial_die" size={size * 0.7} color={ELEMENTS.primordial_die.color} hi="#fffaf0" />
  return <BossAvatar id={portrait.boss ?? 'primordial'} size={size} />
}

/**
 * The character on stage: it rises and fades in over the page's intro, bobs one
 * art pixel at a time, stands in a glow of the scene's colour and casts a
 * shadow. `prev` is the previous page's portrait, which fades out over the
 * first frames of this one. `tone: 'shadow'` draws a silhouette.
 */
export function Character({ portrait, prev, color, t, pageIndex, opts = {}, flip = false, tint = null, x0 = 0 }) {
  const enter = interpolate(t, [0, INTRO], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.34, 1.3, 0.64, 1) })
  const fade = interpolate(t, [0, INTRO * 0.7], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  // One art pixel (three stage pixels) at a time.
  const bob = Math.round(Math.sin((t / LOOP) * Math.PI * 2)) * 3
  const scale = opts.scale ?? 1
  const cx = W / 2 + (opts.x ?? 0) + x0
  const baseY = 232 + (opts.y ?? 0)
  const size = SIZE * scale
  const glow = 0.92 + 0.08 * Math.sin((t / LOOP) * Math.PI * 4)
  const shadow = opts.tone === 'shadow'
  const same = prev && portrait && prev.kind === portrait.kind && prev.id === portrait.id
  const outgoing = prev && !same && pageIndex > 0 ? interpolate(t, [0, INTRO * 0.6], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 0
  return (
    <>
      <div style={{ position: 'absolute', left: cx - 280, top: baseY - 140, width: 560, height: 560, background: `radial-gradient(circle, ${color}55 0%, ${color}22 38%, transparent 68%)`, opacity: glow * fade }} />
      <div style={{ position: 'absolute', left: cx - size * 0.45, top: baseY + size * 0.5 + 8, width: size * 0.9, height: 18, background: '#000000', opacity: 0.4 * fade, borderRadius: '50%' }} />
      {outgoing > 0 && (
        <span style={{ position: 'absolute', left: cx - size / 2, top: baseY - size / 2, lineHeight: 0, opacity: outgoing, filter: `drop-shadow(0 0 22px ${color}88)` }}>
          <CharacterArt portrait={prev} size={size} />
        </span>
      )}
      <span
        style={{
          position: 'absolute',
          left: cx - size / 2,
          top: baseY - size / 2 + (1 - enter) * 26 + bob,
          lineHeight: 0,
          opacity: fade * (tint ? 0.6 : 1),
          transform: flip ? 'scaleX(-1)' : undefined,
          filter: shadow ? 'brightness(0.12) drop-shadow(0 0 16px #ffffff44)' : tint ? `${tint} drop-shadow(0 0 22px ${color}88)` : `drop-shadow(0 0 22px ${color}88)`,
        }}
      >
        <CharacterArt portrait={portrait} size={size} />
      </span>
    </>
  )
}
