import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLanguage } from '../../../i18n/LanguageContext.jsx'
import { playClick } from '../utils/sound.js'
import { useGameSettings } from '../utils/gameSettingsContext.jsx'
import { DECKS } from '../data/decks.js'
import { DIFFICULTIES } from '../data/difficulty.js'
import { localizeDeck, localizeDifficulty } from '../data/i18n.js'
import { readProfile, isDeckUnlocked, isDifficultyUnlocked } from '../utils/profile.js'
import { cleanSeed } from '../engine/rng.js'
import DieToken from './DieToken.jsx'
import PixelIcon from './PixelIcon.jsx'

// Slide-and-tilt between loadouts; `dir` is +1 (next) or -1 (previous).
const slide = {
  enter: (dir) => ({ x: dir * 140, rotate: dir * 6, opacity: 0 }),
  center: { x: 0, rotate: 0, opacity: 1 },
  exit: (dir) => ({ x: dir * -140, rotate: dir * -6, opacity: 0 }),
}

function Arrow({ dir, onClick, label, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="el-btn el-btn--sm h-12 w-12 shrink-0 justify-center !px-0"
    >
      <span className="pixel-score text-xs">{dir < 0 ? '<' : '>'}</span>
    </button>
  )
}

/** One loadout, centered and large: its dice, its name, its tagline. */
function LoadoutCard({ index, profile }) {
  const { t, lang } = useLanguage()
  const deck = localizeDeck(DECKS[index], lang)
  const unlocked = isDeckUnlocked(deck.id, profile)
  const beaten = profile.decksBeaten.includes(deck.id)
  const prev = index > 0 ? localizeDeck(DECKS[index - 1], lang) : null
  return (
    <div className="flex flex-col items-center gap-5 text-center">
      {/* Locked loadouts are dark silhouettes. */}
      <div className="flex items-end justify-center gap-4" style={unlocked ? undefined : { filter: 'brightness(0) opacity(0.55)' }}>
        {deck.dice.map((elementId, j) => (
          <DieToken key={j} die={{ id: `${deck.id}-${j}`, elementId, tierId: 'd6', sides: 6 }} size={76} />
        ))}
      </div>
      <h3 className="el-logo text-2xl sm:text-3xl">{unlocked ? deck.name : '???'}</h3>
      <p className="min-h-[3rem] max-w-md text-lg leading-snug text-[var(--text-dim)]">
        {unlocked
          ? deck.tagline
          : isDeckUnlocked(DECKS[index - 1].id, profile)
            ? t('elementa.title.unlockHint').replace('{deck}', prev.name)
            : t('elementa.gallery.locked')}
      </p>
      {beaten && <span className="el-chip bg-[var(--good)] text-[var(--ink)]">{t('elementa.title.cleared')}</span>}
    </div>
  )
}

/** One difficulty at a time: a flame that grows with the stakes. */
function DifficultyCard({ index, profile }) {
  const { t, lang } = useLanguage()
  const diff = localizeDifficulty(DIFFICULTIES[index], lang)
  const unlocked = isDifficultyUnlocked(diff.id, profile)
  const beaten = profile.difficultiesBeaten.includes(diff.id)
  const prev = index > 0 ? localizeDifficulty(DIFFICULTIES[index - 1], lang) : null
  return (
    <div className="flex items-center gap-5" style={unlocked ? undefined : { opacity: 0.45 }}>
      <span
        className="flex h-24 w-24 shrink-0 items-center justify-center"
        style={{ filter: unlocked ? `drop-shadow(0 0 12px ${diff.color}aa)` : 'grayscale(1)' }}
      >
        <PixelIcon name="fire" size={36 + index * 14} color={diff.color} hi="#fff4d6" />
      </span>
      <div className="flex flex-col gap-2 text-left">
        <span className="pixel-heading text-sm" style={{ color: diff.color }}>
          {diff.name}
        </span>
        <span className="text-base leading-snug text-[var(--text-dim)]">
          {unlocked ? diff.tagline : t('elementa.title.difficultyHint').replace('{d}', prev.name)}
        </span>
        {beaten && <span className="el-chip w-fit bg-[var(--good)] text-[var(--ink)]">{t('elementa.title.cleared')}</span>}
      </div>
    </div>
  )
}

/**
 * New-run setup (EXPANSION.md E11): a loadout carousel and a one-at-a-time
 * difficulty picker, like Balatro's deck and stake selection, with the
 * seed tucked under "Advanced". Arrows, arrow keys or a swipe move through
 * them; Enter starts.
 */
export default function TitleScreen({ slot, dispatch }) {
  const { t, lang } = useLanguage()
  const { reducedMotion } = useGameSettings()
  const [profile] = useState(() => readProfile(slot))
  const [seed, setSeed] = useState('')
  const [advanced, setAdvanced] = useState(false)
  // Default to the newest loadout and difficulty the player has unlocked:
  // usually the one they want to try next.
  const [deckIndex, setDeckIndex] = useState(() => Math.max(0, DECKS.findLastIndex((d) => isDeckUnlocked(d.id, profile))))
  const [diffIndex, setDiffIndex] = useState(() =>
    Math.max(0, DIFFICULTIES.findLastIndex((d) => isDifficultyUnlocked(d.id, profile))),
  )
  const [dir, setDir] = useState(1)

  const deck = DECKS[deckIndex]
  const difficulty = DIFFICULTIES[diffIndex]
  const canStart = isDeckUnlocked(deck.id, profile) && isDifficultyUnlocked(difficulty.id, profile)

  const stepDeck = useCallback((d) => {
    playClick()
    setDir(d)
    setDeckIndex((i) => (i + d + DECKS.length) % DECKS.length)
  }, [])
  const stepDifficulty = useCallback((d) => {
    playClick()
    setDiffIndex((i) => Math.min(DIFFICULTIES.length - 1, Math.max(0, i + d)))
  }, [])

  const start = useCallback(() => {
    if (!canStart) return
    playClick()
    dispatch({ type: 'START_RUN', deckId: deck.id, difficultyId: difficulty.id, seed, recipes: profile.recipes })
  }, [canStart, dispatch, deck.id, difficulty.id, seed, profile.recipes])

  // Left/Right change the loadout, Up/Down the difficulty, Enter starts.
  useEffect(() => {
    function onKey(e) {
      if (e.target instanceof HTMLElement && e.target.closest('input, textarea, select')) return
      if (e.key === 'ArrowLeft') stepDeck(-1)
      else if (e.key === 'ArrowRight') stepDeck(1)
      else if (e.key === 'ArrowUp') stepDifficulty(1)
      else if (e.key === 'ArrowDown') stepDifficulty(-1)
      else if (e.key === 'Enter' && !(e.target instanceof HTMLElement && e.target.closest('button'))) start()
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [stepDeck, stepDifficulty, start])

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
      className="flex w-full max-w-3xl flex-col items-center gap-8 text-center"
    >
      <h2 className="pixel-heading text-xl text-[var(--gold-1)] sm:text-2xl">{t('elementa.title.newRun')}</h2>

      {/* Loadout carousel. */}
      <section className="flex w-full flex-col items-center gap-4">
        <h3 className="el-label">{t('elementa.title.chooseDeck')}</h3>
        <div className="flex w-full items-center gap-3">
          <Arrow dir={-1} onClick={() => stepDeck(-1)} label={t('elementa.title.prevDeck')} />
          <div className="el-panel relative flex min-h-[19rem] flex-1 items-center justify-center overflow-hidden px-4 py-6">
            <AnimatePresence mode="popLayout" custom={dir} initial={false}>
              <motion.div
                key={deckIndex}
                custom={dir}
                variants={reducedMotion ? undefined : slide}
                initial={reducedMotion ? false : 'enter'}
                animate="center"
                exit={reducedMotion ? undefined : 'exit'}
                transition={{ type: 'spring', bounce: 0.25, duration: 0.4 }}
                drag={reducedMotion ? false : 'x'}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.4}
                // A swipe past 60px moves to the next or previous loadout.
                onDragEnd={(_, info) => {
                  if (info.offset.x < -60) stepDeck(1)
                  else if (info.offset.x > 60) stepDeck(-1)
                }}
                className="w-full cursor-grab touch-pan-y active:cursor-grabbing"
              >
                <LoadoutCard index={deckIndex} profile={profile} />
              </motion.div>
            </AnimatePresence>
          </div>
          <Arrow dir={1} onClick={() => stepDeck(1)} label={t('elementa.title.nextDeck')} />
        </div>
        {/* Position dots: gold once that loadout has been beaten. */}
        <div className="flex items-center gap-2">
          {DECKS.map((d, i) => (
            <button
              key={d.id}
              type="button"
              aria-pressed={i === deckIndex}
              aria-label={isDeckUnlocked(d.id, profile) ? localizeDeck(d, lang).name : '???'}
              onClick={() => {
                playClick()
                setDir(i > deckIndex ? 1 : -1)
                setDeckIndex(i)
              }}
              className="h-3 w-3"
              style={{
                background:
                  i === deckIndex ? 'var(--gold-hi)' : profile.decksBeaten.includes(d.id) ? 'var(--gold-2)' : 'var(--stone-0)',
                boxShadow: '0 0 0 2px var(--ink)',
                transform: i === deckIndex ? 'scale(1.3)' : undefined,
              }}
            />
          ))}
        </div>
      </section>

      {/* Difficulty picker. */}
      <section className="flex w-full flex-col items-center gap-4">
        <h3 className="el-label">{t('elementa.title.chooseDifficulty')}</h3>
        <div className="flex w-full max-w-xl items-center gap-3">
          <Arrow dir={-1} onClick={() => stepDifficulty(-1)} disabled={diffIndex === 0} label={t('elementa.title.easier')} />
          <div className="el-panel--dark el-panel flex min-h-[8.5rem] flex-1 items-center justify-center px-5 py-4">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={diffIndex}
                initial={reducedMotion ? false : { opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reducedMotion ? undefined : { opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.15 }}
              >
                <DifficultyCard index={diffIndex} profile={profile} />
              </motion.div>
            </AnimatePresence>
          </div>
          <Arrow
            dir={1}
            onClick={() => stepDifficulty(1)}
            disabled={diffIndex === DIFFICULTIES.length - 1}
            label={t('elementa.title.harder')}
          />
        </div>
        <div className="flex items-center gap-2">
          {DIFFICULTIES.map((d, i) => (
            <span
              key={d.id}
              className="h-2.5 w-2.5"
              style={{ background: i <= diffIndex ? d.color : 'var(--stone-0)', boxShadow: '0 0 0 2px var(--ink)' }}
            />
          ))}
        </div>
      </section>

      {/* The seed, tucked away. */}
      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={() => {
            playClick()
            setAdvanced((a) => !a)
          }}
          aria-expanded={advanced}
          className="el-btn el-btn--sm el-btn--ghost"
        >
          {advanced ? '-' : '+'} {t('elementa.title.advanced')}
        </button>
        {advanced && (
          <label className="flex flex-col items-center gap-2">
            <span className="el-label">{t('elementa.title.seed')}</span>
            <input
              value={seed}
              onChange={(e) => setSeed(cleanSeed(e.target.value))}
              placeholder={t('elementa.title.seedPlaceholder')}
              maxLength={8}
              spellCheck={false}
              style={{ fontFamily: 'var(--small-font)' }}
              className="el-well w-56 px-3 py-2 text-center text-lg uppercase tracking-[0.3em] text-[var(--gold-hi)] outline-none placeholder:text-sm placeholder:normal-case placeholder:tracking-normal placeholder:text-[var(--text-mute)] focus:shadow-[0_0_0_2px_var(--gold-1)]"
            />
          </label>
        )}
      </div>

      <div className="flex items-center gap-6">
        <button
          type="button"
          onClick={() => {
            playClick()
            dispatch({ type: 'GO_TO_HUB' })
          }}
          className="el-btn el-btn--ghost"
        >
          {t('elementa.common.back')}
        </button>
        <button type="button" onClick={start} disabled={!canStart} className="el-btn el-btn--gold el-btn--lg min-w-[260px]">
          {t('elementa.title.startRun')}
          <span className="el-key">Enter</span>
        </button>
      </div>
    </motion.div>
  )
}
