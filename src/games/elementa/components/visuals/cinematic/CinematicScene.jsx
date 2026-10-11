import { Profiler, forwardRef, memo, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Player, Thumbnail } from '@remotion/player'
import strings from '../../../../../i18n/strings.js'
import { sceneById } from '../../../data/story.js'
import { playClank, playClick, playGust, playTick } from '../../../utils/sound.js'
import { useVisualEnv } from '../VisualEnv.jsx'
import StoryComposition from './StoryComposition.jsx'
import { directionFor } from './direction.js'
import { FPS, H, W, layoutScene, pageAt, typedAt } from './sceneLayout.js'

// Plays a story scene (VISUALS.md V5): the composition in a Remotion Player, the
// words live beside it, advance on press, skip, and a path to show all the text.
// This file and everything it imports is one lazy chunk: the first load never
// holds Remotion. Reduced motion keeps the composition but never plays it: each
// press jumps to the next page's finished shot, text and all.

const tx = (key, lang) => strings[key]?.[lang] ?? strings[key]?.en ?? key

/** The scene's frame slots, direction and Player props, built once per scene. */
function useScene(id, sceneProp) {
  const scene = useMemo(() => sceneProp ?? sceneById(id), [id, sceneProp])
  const layout = useMemo(() => (scene ? layoutScene(scene) : null), [scene])
  const direction = useMemo(() => (scene ? directionFor(id ?? scene.id ?? '', scene) : null), [id, scene])
  return { scene, layout, direction }
}

/** The current frame of a Player, as state (the caption and the buttons follow it). */
function usePlayerFrame(playerRef, initial) {
  const [frame, setFrame] = useState(initial)
  useEffect(() => {
    const p = playerRef.current
    if (!p) return
    const onFrame = (e) => setFrame(e.detail.frame)
    p.addEventListener('frameupdate', onFrame)
    return () => p.removeEventListener('frameupdate', onFrame)
  }, [playerRef])
  return frame
}

/**
 * The Player and its timeline driver: it loops a page's wait (the page's last
 * frames repeat until a press), plays the sound hooks (scene start, a beat at
 * each new page, a hit where the direction says) and reports React commit times.
 */
const Stage = memo(function Stage({ playerRef, scene, layout, direction, reduced, onStats, sounds = true, onReady }) {
  const prof = useRef({ sum: 0, count: 0, max: 0 })
  const input = useMemo(() => ({ scene, direction, layout }), [scene, direction, layout])
  const initialFrame = reduced ? layout.pages[0].typeEnd : 0

  useEffect(() => {
    const p = playerRef.current
    if (!p) return
    let last = initialFrame
    let lastPage = 0
    if (sounds && !reduced) playGust()
    const onFrame = (e) => {
      const f = e.detail.frame
      const i = pageAt(layout, f)
      const slot = layout.pages[i]
      if (!reduced && f >= slot.end - 1) {
        p.seekTo(slot.typeEnd)
        last = slot.typeEnd
        return
      }
      if (sounds) {
        if (i !== lastPage && !reduced) playTick()
        for (const h of direction.pages[i].hits) {
          const at = slot.start + h
          if (f >= at && f - last <= 3 && last < at) playClank()
        }
      }
      lastPage = i
      last = f
    }
    p.addEventListener('frameupdate', onFrame)
    onReady?.()
    return () => p.removeEventListener('frameupdate', onFrame)
  }, [playerRef, layout, direction, reduced, sounds, initialFrame, onReady])

  const onRender = useCallback(
    (_id, phase, actual) => {
      if (phase !== 'update') return
      const s = prof.current
      s.sum += actual
      s.count++
      s.max = Math.max(s.max, actual)
      if (s.count % 30 === 0) onStats?.({ avgMs: s.sum / s.count, maxMs: s.max, commits: s.count })
    },
    [onStats],
  )

  return (
    <Profiler id="story" onRender={onRender}>
      <Player
        ref={playerRef}
        component={StoryComposition}
        inputProps={input}
        durationInFrames={layout.total}
        fps={FPS}
        compositionWidth={W}
        compositionHeight={H}
        initialFrame={initialFrame}
        autoPlay={!reduced}
        controls={false}
        clickToPlay={false}
        acknowledgeRemotionLicense
        style={{ width: '100%', imageRendering: 'pixelated' }}
      />
    </Profiler>
  )
})

/** The speaker, the typed lines and the page dots. The full text is always there for a screen reader. */
function Caption({ playerRef, scene, layout, lang, reduced, still }) {
  const frame = usePlayerFrame(playerRef, reduced ? layout.pages[0].typeEnd : 0)
  const i = pageAt(layout, frame)
  const page = scene.pages[i]
  const text = page.lines.map((l) => l[lang] ?? l.en)
  let budget = typedAt(layout.pages[i], frame, still || reduced)
  const shown = text.map((line) => {
    const part = line.slice(0, Math.max(0, budget))
    budget -= line.length
    return part
  })
  return (
    <div className="flex w-full flex-col items-center gap-3 text-center">
      <span className="pixel-heading text-sm" style={{ color: scene.color }}>
        {page.speaker[lang]}
      </span>
      <div className="el-panel flex min-h-[8rem] w-full flex-col gap-2 px-6 py-4 text-left" style={{ '--edge': scene.color }}>
        <span className="sr-only">{text.join(' ')}</span>
        <div aria-hidden="true" className="flex flex-col gap-2">
          {shown.map((line, k) => (line ? <p key={k} className="text-lg leading-snug text-[var(--text)]">{line}</p> : null))}
        </div>
      </div>
      {scene.pages.length > 1 && (
        <div className="flex items-center gap-3">
          {scene.pages.map((_, k) => (
            <span key={k} className="h-2.5 w-2.5" style={{ background: k <= i ? scene.color : 'var(--stone-0)', boxShadow: '0 0 0 2px var(--ink)' }} />
          ))}
        </div>
      )}
    </div>
  )
}

/** The button row: it says "More" while the page is typing, "Next" between pages and "Continue" on the last. */
function Controls({ playerRef, scene, layout, lang, reduced, onNext, onSkip }) {
  const frame = usePlayerFrame(playerRef, reduced ? layout.pages[0].typeEnd : 0)
  const i = pageAt(layout, frame)
  const typing = frame < layout.pages[i].typeEnd
  const key = typing ? 'elementa.story.more' : i < scene.pages.length - 1 ? 'elementa.story.next' : 'elementa.story.continue'
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <button type="button" onClick={onSkip} className="el-btn el-btn--ghost">
        {tx('elementa.story.skip', lang)}
        <span className="el-key">Esc</span>
      </button>
      <button type="button" onClick={onNext} className="el-btn el-btn--gold el-btn--lg min-w-[200px]">
        {tx(key, lang)}
        <span className="el-key">Enter</span>
      </button>
    </div>
  )
}

/**
 * A story scene in the game (a full-screen overlay) or in the Visual Lab (`inline`).
 * `onDone(skipped)` closes it. `playerRef` exposes the Player (seekTo, getCurrentFrame, ...).
 */
const CinematicScene = forwardRef(function CinematicScene({ id, scene: sceneProp, onDone, onStats, inline = false }, outerRef) {
  const { lang, reduced } = useVisualEnv()
  const { scene, layout, direction } = useScene(id, sceneProp)
  const playerRef = useRef(null)
  useImperativeHandle(outerRef, () => ({ player: playerRef, layout }), [layout])
  const doneRef = useRef(onDone)
  doneRef.current = onDone

  const next = useCallback(() => {
    const p = playerRef.current
    if (!p || !scene) return
    playClick()
    const f = p.getCurrentFrame()
    const i = pageAt(layout, f)
    const slot = layout.pages[i]
    if (f < slot.typeEnd) {
      p.seekTo(slot.typeEnd)
    } else if (i < layout.pages.length - 1) {
      p.seekTo(reduced ? layout.pages[i + 1].typeEnd : layout.pages[i + 1].start)
      if (!reduced) p.play()
    } else {
      doneRef.current?.(false)
    }
  }, [layout, scene, reduced])

  const skip = useCallback(() => {
    playClick()
    doneRef.current?.(true)
  }, [])

  // Enter or Space moves on, Esc skips. Captured, so the table and the pause menu underneath never see them.
  useEffect(() => {
    if (inline) return
    function onKey(e) {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation()
        e.preventDefault()
        skip()
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.stopImmediatePropagation()
        e.preventDefault()
        next()
      }
    }
    window.addEventListener('keydown', onKey, { capture: true })
    return () => window.removeEventListener('keydown', onKey, { capture: true })
  }, [inline, next, skip])

  if (!scene) return null
  const body = (
    <div className={`flex w-full max-w-4xl flex-col items-center gap-4 ${inline ? '' : 'px-4'}`} onClick={(e) => e.stopPropagation()}>
      <span className="el-label" style={{ color: scene.color }}>
        {scene.title[lang] ?? scene.title.en}
      </span>
      <div className="v-cinematic__screen w-full" style={inline ? undefined : { width: 'min(100%, calc((100dvh - 330px) * 16 / 9))' }} onClick={next}>
        <Stage key={reduced ? 'stage-still' : 'stage-live'} playerRef={playerRef} scene={scene} layout={layout} direction={direction} reduced={reduced} onStats={onStats} sounds={!inline} />
      </div>
      <Caption key={reduced ? 'caption-still' : 'caption-live'} playerRef={playerRef} scene={scene} layout={layout} lang={lang} reduced={reduced} />
      <Controls key={reduced ? 'controls-still' : 'controls-live'} playerRef={playerRef} scene={scene} layout={layout} lang={lang} reduced={reduced} onNext={next} onSkip={skip} />
    </div>
  )
  if (inline) return body
  const root = typeof document !== 'undefined' ? document.querySelector('.elementa-root') : null
  if (!root) return null
  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto"
      style={{ background: '#07050cf5' }}
      onClick={next}
      role="dialog"
      aria-modal="true"
      data-story-scene=""
      aria-label={scene.title[lang] ?? scene.title.en}
    >
      {body}
    </div>,
    root,
  )
})

export default CinematicScene

/** An ending card (V5): a still with a slow push, the title and the text under it. Embedded, no controls. */
export function CinematicCard({ scene }) {
  const { lang, reduced } = useVisualEnv()
  const layout = useMemo(() => layoutScene(scene), [scene])
  const direction = useMemo(() => directionFor(scene.id, scene), [scene])
  const playerRef = useRef(null)
  const page = scene.pages[0]
  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-4 text-center">
      <span className="el-label">{scene.label}</span>
      <div className="v-cinematic__screen w-full">
        <Stage key={reduced ? 'stage-still' : 'stage-live'} playerRef={playerRef} scene={scene} layout={layout} direction={direction} reduced={reduced} sounds={false} />
      </div>
      <h3 className="pixel-heading text-base" style={{ color: scene.color }}>
        {page.speaker[lang]}
      </h3>
      <p className="max-w-xl text-lg leading-snug text-[var(--text-dim)]">{page.lines[0][lang]}</p>
    </div>
  )
}

/** One frame of a scene, no playback (the Lab's contact sheet). */
export function SceneFrame({ id, frame, width = 320 }) {
  const { scene, layout, direction } = useScene(id)
  const input = useMemo(() => ({ scene, direction, layout }), [scene, direction, layout])
  if (!scene) return null
  return (
    <Thumbnail
      component={StoryComposition}
      inputProps={input}
      compositionWidth={W}
      compositionHeight={H}
      frameToDisplay={frame}
      durationInFrames={layout.total}
      fps={FPS}
      style={{ width, imageRendering: 'pixelated' }}
    />
  )
}
