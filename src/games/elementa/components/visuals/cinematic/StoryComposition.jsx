import { interpolate, useCurrentFrame } from 'remotion'
import { mix } from '../../../utils/color.js'
import { Character } from './characters.jsx'
import { Backdrop, Effect, INK, Orbs, Piece, cameraAt, flashAt } from './shots.jsx'
import { H, INTRO, W, pageAt, pageTime } from './sceneLayout.js'

// A whole story scene as one Remotion composition (VISUALS.md V5). It is a pure
// function of the frame and of the scene's data: `scene` (its pages and
// colour), `direction` (data/sceneDirections.js merged with the standard
// grammar) and `layout` (the frame slots, sceneLayout.js). The words are not
// drawn here: they stay live DOM beside the picture (CinematicScene), so both
// languages, the fonts, the reading size and "show all text" work as everywhere
// else in the game.
//
// Layers, back to front: backdrop, set piece, effects (these three ride the
// camera at half speed, for parallax), the character (full camera), the light
// (a vignette in the scene's colour), a page-change dip, and a flash.

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }

export default function StoryComposition({ scene, direction, layout }) {
  const frame = useCurrentFrame()
  const index = pageAt(layout, frame)
  const slot = layout.pages[index]
  const dir = direction.pages[index]
  const t = pageTime(slot, frame)
  const tEnd = slot.typeEnd - slot.start
  const color = scene.color
  const page = scene.pages[index]
  const prev = index > 0 ? scene.pages[index - 1].portrait : null
  const cam = cameraAt(dir.cam, t, tEnd, dir.hits)
  const fx = dir.fx ?? direction.fx
  const flash = flashAt(t, dir.flash)
  // The scene fades in from black; each later page dips briefly.
  const dip = index === 0 ? interpolate(frame, [0, 16], [1, 0], clamp) : interpolate(t, [0, INTRO], [0.7, 0], clamp)
  const back = `translate(${-cam.x * 0.5}px, ${-cam.y * 0.5}px) scale(${1 + (cam.scale - 1) * 0.5})`

  return (
    <div style={{ width: W, height: H, position: 'relative', overflow: 'hidden', background: INK }}>
      <div style={{ position: 'absolute', inset: 0, transform: back, transformOrigin: '50% 60%' }}>
        <Backdrop kind={direction.backdrop} color={color} t={t} />
        <Piece piece={direction.piece} color={color} t={t} tEnd={tEnd} pageIndex={index} />
        {fx.map((kind) => (
          <Effect key={kind} kind={kind} color={color} t={t} />
        ))}
        {direction.piece?.kind === 'orbs' && <Orbs color={color} t={t} tEnd={tEnd} />}
      </div>
      <div style={{ position: 'absolute', inset: 0, transform: `translate(${cam.x}px, ${cam.y}px) scale(${cam.scale})`, transformOrigin: '50% 60%' }}>
        {direction.piece?.kind === 'mirror' && (
          <Character portrait={page.portrait} color="#7ad8ff" t={t} pageIndex={index} opts={dir.char} hits={dir.hits} flip tint="hue-rotate(160deg) saturate(1.4)" x0={Math.round(Math.sin(t / 9) * 6) + 190} />
        )}
        <Character portrait={page.portrait} prev={prev} color={color} t={t} pageIndex={index} opts={dir.char} hits={dir.hits} talking={frame < slot.typeEnd} x0={direction.piece?.kind === 'mirror' ? -190 : 0} />
      </div>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at center, transparent 50%, ${mix(INK, color, 0.1)}f0 100%)` }} />
      <div style={{ position: 'absolute', inset: 0, background: INK, opacity: dip }} />
      {flash > 0 && <div style={{ position: 'absolute', inset: 0, background: '#fff6d6', opacity: flash * 0.8 }} />}
    </div>
  )
}
