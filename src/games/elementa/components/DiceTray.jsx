import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, Reorder, motion, useAnimationControls } from 'framer-motion'
import Die from './Die.jsx'
import CastLedger from './CastLedger.jsx'
import { buildCastScript, applyCastStep, finishCastScript } from '../utils/castScript.js'
import CastStage, { CastCaption, useStepCaption } from './CastStage.jsx'
import { TRIGGER_EVENT } from '../utils/useTriggerPulses.js'
import { evaluatePool, lightFloor } from '../engine/scoring.js'
import { selectors } from '../engine/gameReducer.js'
import { ELEMENTS, inFamily, actingElementIds } from '../data/elements.js'
import { reactionById } from '../data/reactions.js'
import { bossById } from '../data/bossModifiers.js'
import { useLanguage } from '../../../i18n/LanguageContext.jsx'
import { localize, ELEMENTS_ES, RELICS_ES, localizeBossModifier, localizeReaction } from '../data/i18n.js'
import { relicById } from '../data/relics.js'
import { useGameSettings } from '../utils/gameSettingsContext.jsx'
import AnimatedNumber from './AnimatedNumber.jsx'
import TargetBar from './TargetBar.jsx'
import PixelIcon from './PixelIcon.jsx'
import BossAvatar from './BossAvatar.jsx'
import { Pip } from './Tutorial.jsx'
import { tideLocks } from '../engine/gods.js'
import { readProfile } from '../utils/profile.js'
import { useInscribe } from './useInscribe.jsx'
import { playRoll, playClick, playScoreStep, playBossRound, playFail } from '../utils/sound.js'

// Per game-speed timings for the score reveal (Options -> Scoring speed), in
// ms: a die adds to Base, a group of ledger lines adds to Base or Mult.
// Each is the time its number takes to pop and fly into its box (Q5), and the
// box takes it when the time is up. Instant skips the choreography.
const TIMING = {
  normal: { step: 330, line: 620, pause: 750 },
  fast: { step: 130, line: 250, pause: 380 },
  instant: { step: 0, line: 0, pause: 300 },
}

/** A number that counts up to its new value in a blink, like a ticking meter. */
function TickValue({ value, instant }) {
  const [shown, setShown] = useState(value)
  useEffect(() => {
    if (instant || typeof value !== 'number' || typeof shown !== 'number' || value === shown) {
      setShown(value)
      return
    }
    const from = shown
    const start = performance.now()
    let raf
    const frame = (now) => {
      const k = Math.min(1, (now - start) / 220)
      setShown(k >= 1 ? value : Math.round((from + (value - from) * k) * 100) / 100)
      if (k < 1) raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])
  return shown
}

/**
 * Balatro-style score box: a colored block with a big number inside. When a
 * cast step lands (`pulse`, EXPANSION.md Q5) it pulses and ticks up; a
 * multiplier (`pulse.strong`) also shakes and flashes. Reduced motion keeps
 * a brief brightening and the ticking number, and drops the movement.
 */
function ScoreBox({ label, value, color, pulse, which, reducedMotion }) {
  const strong = pulse?.strong
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="el-label">{label}</span>
      <motion.div
        key={pulse?.key}
        data-score-box={which}
        initial={
          pulse
            ? reducedMotion
              ? { filter: 'brightness(1.6)' }
              : { scale: strong ? 1.55 : 1.22, rotate: strong ? -5 : -3, filter: 'brightness(1.5)' }
            : false
        }
        animate={{ scale: 1, rotate: 0, x: strong && !reducedMotion ? [0, -7, 7, -5, 5, -2, 0] : 0, filter: 'brightness(1)' }}
        transition={{ type: 'spring', bounce: 0.6, duration: strong ? 0.55 : 0.35, x: { duration: 0.4 }, filter: { duration: 0.35 } }}
        className="relative flex h-12 min-w-[64px] items-center justify-center px-3 sm:h-14 sm:min-w-[92px] sm:px-4"
        style={{
          background: color,
          boxShadow:
            '0 -3px 0 0 var(--ink), 0 3px 0 0 var(--ink), -3px 0 0 0 var(--ink), 3px 0 0 0 var(--ink), inset 0 3px 0 0 rgba(255,255,255,0.3), inset 0 -4px 0 0 rgba(0,0,0,0.3)',
        }}
      >
        <span className="pixel-score text-lg text-white [text-shadow:2px_2px_0_var(--ink)]">
          <TickValue value={value} instant={reducedMotion && !pulse} />
        </span>
        {strong && (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-white"
            initial={{ opacity: reducedMotion ? 0.35 : 0.8 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          />
        )}
      </motion.div>
    </div>
  )
}

// Dice shrink on phones so a 3-5 die pool still fits on one row.
function useNarrow() {
  const [narrow, setNarrow] = useState(() => typeof window !== 'undefined' && window.innerWidth < 640)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)')
    const onChange = () => setNarrow(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return narrow
}

const fmt = (n) => Math.round(n * 100) / 100

/** The Clockwork's countdown (H2): big, hard to miss, red near the end. */
function ClockworkTimer({ left, total, paused, reducedMotion }) {
  const { t } = useLanguage()
  const secs = Math.ceil(left)
  const urgent = secs <= 15
  const color = urgent ? '#ff5a5a' : '#c9a46b'
  return (
    <div className="el-panel flex w-full items-center gap-4 px-4 py-2" style={{ '--edge': color }} role="timer" aria-live="off">
      <PixelIcon name="time" size={22} color={color} hi="#fffaf0" />
      <div className="flex flex-1 flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="el-label" style={{ color }}>
            {t('elementa.clockwork.label')}
            {paused ? ` (${t('elementa.clockwork.paused')})` : ''}
          </span>
          <motion.span
            key={urgent && !reducedMotion ? secs : 'steady'}
            initial={urgent && !reducedMotion ? { scale: 1.25 } : false}
            animate={{ scale: 1 }}
            className="pixel-score text-xl [text-shadow:2px_2px_0_var(--ink)]"
            style={{ color }}
          >
            {Math.floor(secs / 60)}:{String(secs % 60).padStart(2, '0')}
          </motion.span>
        </div>
        <div className="h-2 w-full bg-[var(--stone-0)]" style={{ boxShadow: '0 0 0 2px var(--ink)' }}>
          <div className="h-full" style={{ width: `${(left / total) * 100}%`, background: color, transition: reducedMotion ? 'none' : 'width 0.2s linear' }} />
        </div>
      </div>
    </div>
  )
}

export default function DiceTray({ state, dispatch, availableRerolls, paused = false, armedConsumable = null, onArmedDone }) {
  const { t, lang } = useLanguage()
  const { gameSpeed, screenShake, reducedMotion, display, updateDisplay } = useGameSettings()
  const shake = useAnimationControls()
  const [flash, setFlash] = useState(null)
  const timing = TIMING[gameSpeed] ?? TIMING.normal
  const effectiveRelics = selectors.effectiveRelics(state)
  const preview = evaluatePool(state.dice, effectiveRelics, selectors.scoreContext(state))
  const fx = effectiveRelics.reduce((acc, r) => ({ ...acc, ...r.effects }), {})
  const freezeCharges = fx.freezeChargePerRound || 0
  const canFreeze = state.freezeChargesUsed < freezeCharges
  // Drift (Air family) and Gust (relic): one free move each per round.
  const driftLeft = selectors.driftChargesLeft(state)
  const canDrift = driftLeft > 0
  const canGust = Boolean(fx.freeSingleReroll) && !state.gustUsed
  // Gust arms like a consumable: press it, then click the die to reroll.
  const [gustArmed, setGustArmed] = useState(false)
  const targeting = Boolean(armedConsumable) || gustArmed
  const actingIds = actingElementIds(state.dice)
  // Varuna's power: any die locks for free (B4).
  const tide = tideLocks(state.dice)
  const rerollTax = fx.rerollShardCost || 0
  const canReroll = availableRerolls > 0 && state.shards >= rerollTax
  const boss = localizeBossModifier(state.bossModifier, lang)
  const showHint = state.round === 1 && state.rerollsUsed === 0
  const narrow = useNarrow()
  const draggingRef = useRef(false)
  // Secret reactions this save file has discovered; others show as "???".
  const discovered = useMemo(
    () => new Set(readProfile(state.activeSlot).seen.reactions || []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.activeSlot, state.round, state.lastResult],
  )

  // Runes and Grafts used mid-round pick their number on the Inscribe
  // screen (EXPANSION.md K3b, K6).
  const inscribe = useInscribe(state)

  // Escape cancels a consumable (or Gust) waiting for its target die.
  useEffect(() => {
    if (!armedConsumable && !gustArmed) return
    function onKey(e) {
      if (e.key !== 'Escape') return
      e.stopImmediatePropagation()
      onArmedDone?.()
      setGustArmed(false)
      inscribe.reset()
    }
    window.addEventListener('keydown', onKey, { capture: true })
    return () => window.removeEventListener('keydown', onKey, { capture: true })
  }, [armedConsumable, gustArmed, onArmedDone])

  useEffect(() => {
    if (boss) playBossRound()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // A heavy die (d20) landing nudges the table a little (P3). Shares the
  // screen-shake option and is skipped with reduced motion.
  useEffect(() => {
    function onNudge(e) {
      if (!screenShake || reducedMotion) return
      const amp = e.detail?.amp ?? 3
      shake.start({ y: [0, amp, -amp * 0.4, 0], transition: { duration: 0.22, ease: 'easeOut' } })
    }
    window.addEventListener('elementa:nudge', onNudge)
    return () => window.removeEventListener('elementa:nudge', onNudge)
  }, [screenShake, reducedMotion, shake])

  // The cast reveal: a snapshot of the score is replayed step by step (each
  // die, then each Base bonus, then each Mult source), the ledger lighting
  // up as it goes, then the final score lands and the round submits. Purely
  // theatrical: the reducer computes the real outcome on SUBMIT_ROUND.
  const [reveal, setReveal] = useState(null)
  const revealing = Boolean(reveal)
  const revealDone = revealing && reveal.index >= reveal.steps.length

  useEffect(() => {
    if (!reveal) return
    if (reveal.index >= reveal.steps.length) {
      celebrate(reveal.result.roundScore / state.threshold)
      const id = setTimeout(() => dispatch({ type: 'SUBMIT_ROUND' }), timing.pause)
      return () => clearTimeout(id)
    }
    const step = reveal.steps[reveal.index]
    announceTrigger(step)
    const id = setTimeout(
      () => {
        // The number lands: a tick that climbs through the cast, a heavier
        // hit for a multiplier, then the box takes the step.
        if (step.total || step.op === 'mul') playScoreStep(reveal.index, step.op === 'mul' ? 'mul' : step.section)
        setReveal((r) => (r ? applyCastStep(r) : r))
      },
      step.dieId ? timing.step : timing.line,
    )
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reveal])

  // Relics and pacts react while the score is added (P14): when a ledger
  // group from a relic or a boon lights up, its icon in the HUD plays its
  // trigger, once per group, with the group's total.
  function announceTrigger(step) {
    if (!step || step.dieId) return
    let target = null
    let value = step.total
    if (step.kind === 'relic' && step.id) target = { kind: 'relic', id: step.id }
    else if (step.kind === 'boon' && step.id) target = { kind: 'boon', id: step.id }
    else if (step.kind === 'reaction' && step.section === 'mult' && state.roundBuffs?.communion) {
      // Blessing of Communion: +0.5 Mult on every reaction that has a Mult.
      target = { kind: 'boon', id: 'communion' }
      value = 0.5 * step.count
    }
    if (!target) return
    window.dispatchEvent(new CustomEvent(TRIGGER_EVENT, { detail: { ...target, section: step.section, op: step.op, value } }))
  }

  // Impact when the final score lands: the whole table shakes, harder the
  // further past the target you went (a miss gets a short red thud), and a
  // 2x+ overkill also flashes the screen gold. Screen shake has its own
  // toggle in Options and is skipped with reduced motion.
  function celebrate(ratio) {
    const passed = ratio >= 1
    const amp = !passed ? 5 : ratio >= 3 ? 16 : ratio >= 2 ? 11 : 6
    if (screenShake && !reducedMotion) {
      shake.start({
        x: [0, -amp, amp, -amp * 0.7, amp * 0.7, -amp * 0.35, 0],
        y: passed ? [0, amp * 0.4, -amp * 0.4, amp * 0.2, 0, 0, 0] : 0,
        transition: { duration: 0.45, ease: 'easeOut' },
      })
    }
    if (!passed) setFlash({ key: Date.now(), color: '#ff3a3a', strength: 0.18 })
    else if (ratio >= 2) setFlash({ key: Date.now(), color: '#ffd166', strength: ratio >= 3 ? 0.45 : 0.3 })
  }

  const skipReveal = useCallback(() => {
    setReveal((r) => (r && r.index < r.steps.length ? finishCastScript(r) : r))
  }, [])

  const handleReroll = useCallback(() => {
    if (!canReroll || revealing) return
    playRoll()
    dispatch({ type: 'REROLL_UNHELD' })
  }, [canReroll, revealing, dispatch])

  const handleSubmit = useCallback(() => {
    if (revealing) return
    playClick()
    const script = buildCastScript(preview)
    setReveal(gameSpeed === 'instant' ? finishCastScript(script) : script)
  }, [revealing, preview, gameSpeed])

  // The Clockwork (EXPANSION.md H2): a real countdown, running only while
  // the table is live (not paused, not casting, the tab visible). At 0 the
  // table is cast as it stands.
  const countdown = fx.countdown || 0
  const [timeLeft, setTimeLeft] = useState(countdown)
  const submitRef = useRef(handleSubmit)
  submitRef.current = handleSubmit
  const timerLive = countdown > 0 && !paused && !revealing && timeLeft > 0
  useEffect(() => {
    if (!timerLive) return
    let last = performance.now()
    const id = setInterval(() => {
      const now = performance.now()
      const dt = (now - last) / 1000
      last = now
      if (document.hidden) return
      setTimeLeft((v) => Math.max(0, v - dt))
    }, 200)
    return () => clearInterval(id)
  }, [timerLive])
  useEffect(() => {
    if (countdown > 0 && timeLeft <= 0 && !revealing) submitRef.current()
  }, [countdown, timeLeft, revealing])

  // Keyboard: 1-9 hold/release a die, R rerolls, Enter/Space casts. Any key
  // during the reveal skips to the result.
  useEffect(() => {
    function onKey(e) {
      if (paused || e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return
      if (e.target instanceof HTMLElement && e.target.closest('input, textarea, select')) return
      if (revealing) {
        if (e.key !== 'Escape') skipReveal()
        return
      }
      if (/^[1-9]$/.test(e.key)) {
        const die = state.dice[Number(e.key) - 1]
        if (die && !die.locked) {
          playClick()
          dispatch({ type: 'TOGGLE_HELD', dieId: die.id })
        }
      } else if (e.key === 'r' || e.key === 'R') {
        handleReroll()
      } else if (e.key === 'Enter' || e.key === ' ') {
        // A focused button already activates itself on Enter/Space.
        if (e.target instanceof HTMLElement && e.target.closest('button')) return
        e.preventDefault()
        handleSubmit()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [paused, revealing, state.dice, dispatch, handleReroll, handleSubmit, skipReveal])

  // Eclipse hides every face (and so the score) until you cast. Light keeps
  // them visible (EXPANSION.md H3).
  const hidden = Boolean(fx.hideFaces) && !revealing && lightFloor(state.dice) === 0
  // Time's Rewind (H3), and how often Chrono rewound the last roll (H4).
  const canRewind = selectors.canRewind(state) && !revealing
  const shown = revealing ? reveal.result : preview
  const currentStep = revealing && !revealDone ? reveal.steps[reveal.index] : null
  // The step that just landed makes its box pulse; a multiplier hits harder.
  const landed = revealing && reveal.index > 0 ? reveal.steps[reveal.index - 1] : null
  const pulseFor = (section) =>
    landed && landed.section === section && (landed.total || landed.op === 'mul')
      ? { key: `${section}${reveal.index}`, strong: landed.op === 'mul' }
      : undefined
  const stepCaption = useStepCaption(discovered)
  const caption = currentStep ? stepCaption(currentStep, reveal.result.dice) : null
  const dwell = currentStep ? (currentStep.dieId ? timing.step : timing.line) : 0
  const litDice = new Set(currentStep?.lit ?? [])
  const baseShown = hidden ? '?' : fmt(revealing ? reveal.base : preview.baseValue)
  const multShown = hidden ? '?' : fmt(revealing ? reveal.mult : preview.multiplier)
  const liveScore = revealing ? Math.round(reveal.base * reveal.mult) : preview.roundScore
  // P10: before the cast the Score reads "?" unless the player turned
  // "Show live total" on. Base, Mult and the ledger stay visible.
  const scoreHidden = hidden || (!display.liveTotal && !revealing)

  // Neighbor links: one bar in the gap between two reacting neighbors,
  // split into one segment per reaction on that link.
  const links = {}
  if (!hidden && display.glows) {
    shown.reactions.forEach((r) => {
      if (Math.abs(r.a - r.b) !== 1) return
      const l = Math.min(r.a, r.b)
      const color = reactionById(r.id).color
      links[l] = [...new Set([...(links[l] || []), color])]
    })
  }

  let bossTitle = boss?.name
  let bossLine = boss?.description
  if (boss?.id === 'primordial' && boss.twistId) {
    const twist = localizeBossModifier(bossById(boss.twistId), lang)
    bossTitle = `${boss.name}: ${twist.name}`
    bossLine = twist.description
  } else if (boss?.effects.bannedElementId) {
    const name = localize(lang, ELEMENTS[boss.effects.bannedElementId].name, ELEMENTS_ES, boss.effects.bannedElementId, 'name')
    bossLine = lang === 'es' ? `${name} no anota nada esta ronda.` : `${name} scores nothing this round.`
  } else if (boss?.effects.sealedRelicId) {
    const relic = relicById(boss.effects.sealedRelicId)
    const name = relic ? localize(lang, relic.name, RELICS_ES, relic.id, 'name') : '?'
    bossLine = lang === 'es' ? `${name} está sellada esta ronda.` : `${name} is sealed this round.`
  }
  // The final battles (B1): Primordial Unbound on the Split path, the
  // gods' gauntlet on the Primordial path.
  if (boss?.variant === 'unbound') {
    bossTitle = `${t('elementa.boss.unbound')}: ${localizeBossModifier(bossById(boss.twistId), lang).name}`
    bossLine = `${bossLine} ${t('elementa.boss.unboundLine')}`
  }
  const stageLabel = state.gauntlet ? t('elementa.boss.stage').replace('{n}', state.gauntlet.stage + 1) : null
  // What the Primordial says in round 15, a hint at the path (B1).
  const primordialSays = state.round === 15 && state.path && !state.endless ? t(`elementa.boss.say.${state.path}`) : null
  const fallen = state.gauntlet?.fallen ? localizeBossModifier(bossById(state.gauntlet.fallen), lang).name : null
  // Pip's hint at round 14, once the paths are open (B1).
  const pipSays = state.round === 14 && selectors.knowsGods(state) ? t(`elementa.pip.say.${selectors.projectedPath(state)}`) : null
  // The Long Night (B3): a second twist rides along this boss round.
  if (boss && state.extraTwist) {
    const extra = localizeBossModifier(state.extraTwist, lang)
    bossTitle = `${bossTitle} + ${extra.name}`
    bossLine = `${bossLine} ${extra.description}`
  }

  // Bigger pools get smaller dice, but always a gap wide enough for the
  // reaction bar, and one row (wrapping broke drag-to-reorder).
  const n = state.dice.length
  const size = narrow ? 56 : n <= 5 ? 96 : n <= 7 ? 76 : 60
  const gap = narrow ? 18 : n <= 5 ? 40 : n <= 7 ? 28 : 20

  // Reaction chips: 'full' lists every trigger, 'compact' groups repeats
  // ("Kindle x3 +4.5 Mult"), 'off' hides them (the ledger still lists them).
  const reactionChips = []
  if (!hidden && display.reactions !== 'off') {
    if (display.reactions === 'full') {
      shown.reactions.forEach((r, i) => reactionChips.push({ key: `${r.id}-${r.a}-${r.b}-${i}`, id: r.id, count: 1, base: r.base, mult: r.mult }))
    } else {
      const byId = new Map()
      shown.reactions.forEach((r) => {
        const g = byId.get(r.id) ?? { key: r.id, id: r.id, count: 0, base: 0, mult: 0 }
        g.count += 1
        g.base += r.base
        g.mult += r.mult
        byId.set(r.id, g)
      })
      reactionChips.push(...byId.values())
    }
  }

  return (
    <>
      {/* Outside the shaking container: a transformed parent would turn
          this `fixed` overlay into one that only covers the column. */}
      <AnimatePresence>
        {flash && (
          <motion.div
            key={flash.key}
            initial={{ opacity: flash.strength }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            onAnimationComplete={() => setFlash(null)}
            className="pointer-events-none fixed inset-0 z-40"
            style={{ background: flash.color, mixBlendMode: 'screen' }}
          />
        )}
      </AnimatePresence>
      {currentStep && (
        <CastStage
          key={reveal.index}
          step={currentStep}
          dwell={dwell}
          setLabel={currentStep.kind === 'set' ? caption?.who : null}
        />
      )}
      <motion.div
        animate={shake}
        data-casting={revealing ? '' : undefined}
        className="grid grid-cols-1 gap-6 py-2 xl:grid-cols-[1fr_16rem] xl:items-start"
        onClick={revealing ? skipReveal : undefined}
      >
        {/* Its own fixed height, so a longer or shorter ledger next to it
            can never stretch the row and move the dice. */}
        <div className="flex min-h-[calc(100vh-3rem)] flex-col items-center justify-between gap-6">
          <div className="flex w-full max-w-2xl flex-col items-center gap-5">
            {boss && (
              <motion.div
                key={bossTitle}
                data-tut="boss"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="el-panel flex w-full items-center gap-4 px-4 py-3"
                style={{ background: '#3a0f18', '--edge': '#ff5a5a' }}
              >
                <BossAvatar id={boss.id} size={48} />
                <span className="el-chip shrink-0 bg-[#ff5a5a] text-[var(--ink)]">
                  {stageLabel ??
                    (boss.tier === 4
                      ? t('elementa.diceTray.warden')
                      : boss.tier >= 3
                        ? t('elementa.diceTray.finalBoss')
                        : t('elementa.diceTray.bossRound'))}
                </span>
                <div className="text-left">
                  <div className="pixel-heading text-[10px] text-[#ffb0b0]">{bossTitle}</div>
                  <div className="text-base text-[#ffd0d0]/80">{bossLine}</div>
                  {primordialSays && <div className="mt-1 text-base italic text-[#ffe0e0]">{primordialSays}</div>}
                </div>
              </motion.div>
            )}

            {countdown > 0 && (
              <ClockworkTimer left={timeLeft} total={countdown} paused={!timerLive && timeLeft > 0 && !revealing} reducedMotion={reducedMotion} />
            )}

            {fallen && (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="el-panel px-4 py-2 text-base text-[var(--gold-hi)]"
                style={{ '--edge': 'var(--gold-1)' }}
              >
                {t('elementa.boss.fallen').replace('{god}', fallen)}
              </motion.p>
            )}
            {pipSays && (
              <div className="el-panel flex items-center gap-3 px-4 py-2 text-left" style={{ '--edge': '#c8b6ff' }}>
                <Pip size={36} />
                <span className="text-base text-[var(--text)]">{pipSays}</span>
              </div>
            )}

            {/* Base x Mult = Score, live while you play and during the cast. */}
            <div data-tut="score" className="flex items-end justify-center gap-2 sm:gap-4">
              <ScoreBox
                label={t('elementa.diceTray.base')}
                value={baseShown}
                color="#2f6fc4"
                which="base"
                pulse={pulseFor('base')}
                reducedMotion={reducedMotion}
              />
              <span className="pixel-score pb-4 text-sm text-[var(--text-mute)] sm:text-lg">x</span>
              <ScoreBox
                label={t('elementa.diceTray.mult')}
                value={multShown}
                color="#c4412f"
                which="mult"
                pulse={pulseFor('mult')}
                reducedMotion={reducedMotion}
              />
              <span className="pixel-score pb-4 text-sm text-[var(--text-mute)] sm:text-lg">=</span>
              <div className="flex flex-col items-center gap-2">
                <span className="el-label">{t('elementa.diceTray.score')}</span>
                <div className="flex h-12 min-w-[72px] items-center justify-center sm:h-14 sm:min-w-[110px]">
                  {scoreHidden ? (
                    <span className="pixel-score text-xl text-[var(--gold-1)] [text-shadow:3px_3px_0_var(--ink)] sm:text-3xl">?</span>
                  ) : (
                    <AnimatedNumber
                      key={revealing ? 'cast' : 'preview'}
                      value={liveScore}
                      className="pixel-score text-xl text-[var(--gold-1)] [text-shadow:3px_3px_0_var(--ink)] sm:text-3xl"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Who is doing what, step by step (Q5). */}
            <CastCaption caption={caption} stepKey={reveal?.index} section={currentStep?.section} />

            <div data-tut="target" className="flex w-full justify-center">
              <TargetBar score={scoreHidden ? 0 : liveScore} target={state.threshold} unknown={scoreHidden} />
            </div>

            {/* The verdict slams in once the math is done. */}
            <div className="flex h-8 items-center">
              <AnimatePresence>
                {revealDone && (
                  <motion.div
                    initial={{ opacity: 0, scale: 2.2, rotate: -6 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', bounce: 0.5, duration: 0.45 }}
                    className="pixel-heading text-base"
                    style={{ color: liveScore >= state.threshold ? 'var(--good)' : 'var(--bad)' }}
                  >
                    {liveScore >= state.threshold ? t('elementa.cast.cleared') : t('elementa.cast.missed')}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* The table. Drag dice to reorder: neighbors react. */}
          <div data-tut="dice" className="flex flex-1 flex-col items-center justify-center gap-6">
            {targeting && (
              <div className="el-panel flex items-center gap-4 px-4 py-2" style={{ '--edge': 'var(--arcane-hi)' }}>
                <span className="text-base text-[var(--arcane-hi)]">
                  {gustArmed
                    ? t('elementa.diceTray.gustPick')
                    : inscribe.graftFrom
                      ? t('elementa.inscribe.graftTo')
                      : t('elementa.shop.chooseDieToApply')}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onArmedDone?.()
                    setGustArmed(false)
                    inscribe.reset()
                  }}
                  className="el-btn el-btn--sm"
                >
                  {t('elementa.shop.cancel')}
                  <span className="el-key">Esc</span>
                </button>
              </div>
            )}
            <Reorder.Group
              as="div"
              axis="x"
              data-backdrop-anchor
              values={state.dice.map((d) => d.id)}
              onReorder={(order) => dispatch({ type: 'REORDER_DICE', order })}
              className={`flex items-center justify-center gap-y-6 px-2 ${narrow ? 'flex-wrap' : 'flex-nowrap'}`}
              style={{ columnGap: gap }}
            >
              {state.dice.map((die, i) => {
                const dieResult = shown.dice.find((d) => d.id === die.id)
                const actingAs = actingIds[i]
                return (
                  <Reorder.Item
                    key={die.id}
                    value={die.id}
                    data-die-index={i}
                    as="div"
                    dragListener={!revealing}
                    onDragStart={() => (draggingRef.current = true)}
                    onDragEnd={() => setTimeout(() => (draggingRef.current = false), 80)}
                    className="touch-none"
                  >
                    <Die
                      die={die}
                      hotkey={i < 9 ? i + 1 : null}
                      index={i}
                      size={size}
                      hidden={hidden}
                      lockBlocked={Boolean(fx.noFreeLock)}
                      linkColors={links[i] ?? null}
                      linkGap={gap}
                      targeting={targeting && !(gustArmed && die.locked)}
                      isDragging={() => draggingRef.current}
                      showHotkey={display.keyHints}
                      onToggleHeld={(id) => {
                        if (gustArmed) {
                          playRoll()
                          dispatch({ type: 'GUST_REROLL', dieId: id })
                          setGustArmed(false)
                          return
                        }
                        if (armedConsumable) {
                          // An impossible target says no and stays armed.
                          const held = state.consumables.find((c) => c.instanceId === armedConsumable)
                          const target = state.dice.find((d) => d.id === id)
                          const routed = inscribe.route(held, target, (extra) => {
                            dispatch({ type: 'APPLY_CONSUMABLE', instanceId: armedConsumable, dieId: id, ...extra })
                            onArmedDone?.()
                          })
                          if (routed === 'fail') return playFail()
                          if (routed) return playClick()
                          if (held && !selectors.consumableTargetOk(state, held, target)) return playFail()
                          dispatch({ type: 'APPLY_CONSUMABLE', instanceId: armedConsumable, dieId: id })
                          onArmedDone?.()
                          return
                        }
                        dispatch({ type: 'TOGGLE_HELD', dieId: id })
                      }}
                      onLock={(id) => dispatch({ type: 'LOCK_DIE', dieId: id })}
                      onFreeze={(id) => dispatch({ type: 'FREEZE_DIE', dieId: id })}
                      canFreeze={canFreeze}
                      actingAs={actingAs}
                      tideLock={tide}
                      canDrift={canDrift && inFamily(actingIds[i], 'air') && die.lockedVia !== 'freeze'}
                      onNudge={(id, delta) => dispatch({ type: 'NUDGE_DIE', dieId: id, delta })}
                      revealing={revealing}
                      lit={litDice.has(i)}
                      contribution={dieResult?.contribution ?? null}
                    />
                  </Reorder.Item>
                )
              })}
            </Reorder.Group>

            {/* Active reactions, named (see Options -> Display). A fixed-height
                box, so reactions appearing or vanishing never shift the dice. */}
            <div className="flex h-[4.5rem] max-w-3xl flex-wrap content-start justify-center gap-3 overflow-hidden">
              {reactionChips.map((c) => {
                const raw = reactionById(c.id)
                const def = localizeReaction(raw, lang)
                const secretName = raw.secret && !discovered.has(raw.id) ? '???' : def.name
                const parts = []
                if (c.base > 0) parts.push(`+${fmt(c.base)} ${t('elementa.diceTray.base')}`)
                if (c.mult > 0) parts.push(`+${fmt(c.mult)} ${t('elementa.diceTray.mult')}`)
                return (
                  <span
                    key={c.key}
                    title={secretName === '???' ? t('elementa.gallery.secretHint') : def.description}
                    className="el-chip text-[var(--ink)]"
                    style={{ background: def.color }}
                  >
                    {secretName}
                    {c.count > 1 ? ` x${c.count}` : ''} {parts.join(' ')}
                  </span>
                )
              })}
            </div>
          </div>

          <div className="flex w-full max-w-2xl flex-col items-center gap-4">
            <div className="flex h-5 items-center">
              {revealing ? (
                <span className="text-base text-[var(--text-mute)]">{t('elementa.diceTray.skipHint')}</span>
              ) : showHint ? (
                <span className="text-base text-[var(--text-dim)]">{t('elementa.diceTray.hint')}</span>
              ) : (
                <span className="hidden text-base text-[var(--text-mute)] sm:inline">{t('elementa.diceTray.dragHint')}</span>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6">
              <button
                type="button"
                data-tut="reroll"
                onClick={handleReroll}
                disabled={!canReroll || revealing}
                className="el-btn el-btn--arcane el-btn--lg min-w-[150px] sm:min-w-[200px]"
              >
                {t('elementa.diceTray.reroll')}
                <span className="el-key">{availableRerolls}</span>
                {rerollTax > 0 && (
                  <span className="el-key inline-flex items-center gap-1">
                    <PixelIcon name="shard" size={7} />
                    {rerollTax}
                  </span>
                )}
              </button>
              <button
                type="button"
                data-tut="cast"
                onClick={handleSubmit}
                disabled={revealing}
                className="el-btn el-btn--gold el-btn--lg min-w-[150px] sm:min-w-[200px]"
              >
                {t('elementa.diceTray.submit')}
                <span className="el-key">Enter</span>
              </button>
            </div>
            {(canRewind || (selectors.holdsTime(state.dice) && !revealing)) && (
              <button
                type="button"
                onClick={() => {
                  playRoll()
                  dispatch({ type: 'REWIND' })
                }}
                disabled={!canRewind}
                title={t('elementa.diceTray.rewindHint')}
                className="el-btn el-btn--sm"
              >
                <PixelIcon name="time" size={9} color="#b9a6ff" />
                {t('elementa.diceTray.rewind')}
              </button>
            )}
            {state.chronoLoops > 0 && !revealing && (
              <span className="text-base text-[#b9a6ff]">{t('elementa.diceTray.chronoLoops').replace('{n}', state.chronoLoops)}</span>
            )}
            {canGust && (
              <button
                type="button"
                onClick={() => {
                  playClick()
                  setGustArmed((g) => !g)
                }}
                disabled={revealing}
                aria-pressed={gustArmed}
                title={t('elementa.die.gustHint')}
                className={`el-btn el-btn--sm ${gustArmed ? 'el-btn--gold' : ''}`}
              >
                <PixelIcon name="air" size={9} />
                {t('elementa.diceTray.gust')}
              </button>
            )}
            {freezeCharges > 0 && (
              <span className="text-base text-[#9fe3ff]">
                {t('elementa.diceTray.freeze')} {freezeCharges - state.freezeChargesUsed}
              </span>
            )}
            {display.keyHints && (
              <span className="hidden text-sm text-[var(--text-mute)] sm:inline">{t('elementa.diceTray.keys')}</span>
            )}
          </div>
        </div>

        <div data-tut="ledger" className="xl:sticky xl:top-16 xl:max-h-[calc(100vh-5rem)] xl:self-start xl:overflow-y-auto">
          <CastLedger
            result={shown}
            reveal={reveal}
            hidden={hidden}
            scoreHidden={scoreHidden}
            target={state.threshold}
            discovered={discovered}
            expanded={display.ledgerExpanded}
            onToggleExpanded={() => updateDisplay({ ledgerExpanded: !display.ledgerExpanded })}
            open={display.ledgerOpen}
            onToggle={() => updateDisplay({ ledgerOpen: !display.ledgerOpen })}
          />
        </div>
      </motion.div>
      {inscribe.element}
    </>
  )
}
