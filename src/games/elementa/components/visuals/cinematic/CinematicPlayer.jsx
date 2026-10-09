import { Profiler, useCallback, useEffect, useRef, useState } from 'react'
import { Player } from '@remotion/player'
import { useVisualEnv } from '../VisualEnv.jsx'
import TitleCard from './TitleCard.jsx'
import { TITLE_CARD } from './titleCardConfig.js'

// Every composition the CinematicPlayer can play. V5 adds the story scenes here.
const COMPOSITIONS = {
  title_card: { component: TitleCard, ...TITLE_CARD },
}

const T = {
  skip: { en: 'Skip', es: 'Saltar' },
  replay: { en: 'Replay', es: 'Repetir' },
  pause: { en: 'Pause', es: 'Pausa' },
  play: { en: 'Play', es: 'Reproducir' },
}

/**
 * Plays a Remotion composition inside the game (VISUALS.md V1 spike 1).
 * Skip jumps to the last frame, Replay starts again, language comes from
 * the visual environment and re-renders the text live, and Reduced motion
 * shows the finished last frame and never plays. `onStats` receives the
 * average and worst React commit time of the player while it runs.
 */
export default function CinematicPlayer({ composition = 'title_card', onDone, onStats, className = '' }) {
  const { lang, reduced } = useVisualEnv()
  const def = COMPOSITIONS[composition]
  const ref = useRef(null)
  const [playing, setPlaying] = useState(!reduced)
  const [finished, setFinished] = useState(reduced)
  const prof = useRef({ sum: 0, count: 0, max: 0 })
  const doneRef = useRef(onDone)
  doneRef.current = onDone
  const last = def.durationInFrames - 1

  useEffect(() => {
    const p = ref.current
    if (!p) return
    const onEnded = () => {
      setPlaying(false)
      setFinished(true)
      doneRef.current?.(false)
    }
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    p.addEventListener('ended', onEnded)
    p.addEventListener('play', onPlay)
    p.addEventListener('pause', onPause)
    return () => {
      p.removeEventListener('ended', onEnded)
      p.removeEventListener('play', onPlay)
      p.removeEventListener('pause', onPause)
    }
  }, [reduced])

  const skip = useCallback(() => {
    const p = ref.current
    if (!p) return
    p.seekTo(last)
    p.pause()
    setFinished(true)
    doneRef.current?.(true)
  }, [last])

  const replay = useCallback(() => {
    const p = ref.current
    if (!p) return
    setFinished(false)
    p.seekTo(0)
    if (!reduced) p.play()
  }, [reduced])

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
    <div className={`v-cinematic ${className}`} data-reduced={reduced ? '' : undefined}>
      <div className="v-cinematic__screen">
        {/* Remounting on Reduced motion changes where the player starts. */}
        <Profiler id="cinematic" onRender={onRender}>
          <Player
            key={reduced ? 'still' : 'live'}
            ref={ref}
            component={def.component}
            inputProps={{ lang }}
            durationInFrames={def.durationInFrames}
            fps={def.fps}
            compositionWidth={def.width}
            compositionHeight={def.height}
            initialFrame={reduced ? last : 0}
            autoPlay={!reduced}
            controls={false}
            clickToPlay={false}
            acknowledgeRemotionLicense
            style={{ width: '100%', imageRendering: 'pixelated' }}
          />
        </Profiler>
      </div>
      <div className="v-cinematic__bar">
        <button type="button" className="el-btn el-btn--sm" onClick={skip} disabled={finished}>
          {T.skip[lang]}
        </button>
        <button type="button" className="el-btn el-btn--sm" onClick={replay}>
          {T.replay[lang]}
        </button>
        {!reduced && !finished && (
          <button type="button" className="el-btn el-btn--sm" onClick={() => (playing ? ref.current?.pause() : ref.current?.play())}>
            {playing ? T.pause[lang] : T.play[lang]}
          </button>
        )}
      </div>
    </div>
  )
}
