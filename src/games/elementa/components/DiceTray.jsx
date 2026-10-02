import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, Reorder, motion, useAnimationControls } from 'framer-motion'
import Die from './Die.jsx'
import CastLedger from './CastLedger.jsx'
import { evaluatePool } from '../engine/scoring.js'
import { selectors } from '../engine/gameReducer.js'
import { ELEMENTS } from '../data/elements.js'
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
import { readProfile } from '../utils/profile.js'
import { playRoll, playClick, playCoin, playBossRound } from '../utils/sound.js'

// Per game-speed timings for the score reveal (Options -> Scoring speed).
const TIMING = {
  normal: { step: 260, line: 380, pause: 700 },
  fast: { step: 110, line: 160, pause: 380 },
  instant: { step: 0, line: 0, pause: 300 },
}

/** Balatro-style score box: a colored block with a big number inside. */
function ScoreBox({ label, value, color, pulseKey }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="el-label">{label}</span>
      <motion.div
        key={pulseKey}
        initial={pulseKey ? { scale: 1.3, rotate: -4 } : false}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', bounce: 0.6, duration: 0.4 }}
        className="flex h-12 min-w-[64px] items-center justify-center px-3 sm:h-14 sm:min-w-[92px] sm:px-4"
        style={{
          background: color,
          boxShadow:
            '0 -3px 0 0 var(--ink), 0 3px 0 0 var(--ink), -3px 0 0 0 var(--ink), 3px 0 0 0 var(--ink), inset 0 3px 0 0 rgba(255,255,255,0.3), inset 0 -4px 0 0 rgba(0,0,0,0.3)',
        }}
      >
        <span className="pixel-score text-lg text-white [text-shadow:2px_2px_0_var(--ink)]">{value}</span>
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

/**
 * Builds the reveal script from a scoring result: each die adds to Base,
 * then each extra Base line, then each Mult line. `order` lists the ledger
 * lines in the order they light up.
 */
function buildReveal(result) {
  const steps = []
  result.dice.forEach((d) => steps.push({ section: 'base', index: 0, dieId: d.id, value: d.contribution || 0, op: 'add' }))
  result.baseLines.forEach((line, i) => {
    if (i > 0) steps.push({ section: 'base', index: i, value: line.value, op: line.op })
  })
  result.multLines.forEach((line, i) => steps.push({ section: 'mult', index: i, value: line.value, op: line.op }))
  const order = []
  steps.forEach((s) => {
    if (!order.some((o) => o.section === s.section && o.index === s.index)) order.push({ section: s.section, index: s.index })
  })
  return { result, steps, order, index: 0, base: 0, mult: 1 }
}

function applyStep(r) {
  const step = r.steps[r.index]
  const next = { ...r, index: r.index + 1 }
  if (step.section === 'base') next.base = step.op === 'mul' ? r.base * step.value : r.base + step.value
  else next.mult = step.op === 'mul' ? r.mult * step.value : r.mult + step.value
  return next
}

function finishReveal(r) {
  let cur = r
  while (cur.index < cur.steps.length) cur = applyStep(cur)
  return cur
}

export default function DiceTray({ state, dispatch, availableRerolls, paused = false, armedConsumable = null, onArmedDone }) {
  const { t, lang } = useLanguage()
  const { gameSpeed, screenShake, reducedMotion, display, updateDisplay } = useGameSettings()
  const shake = useAnimationControls()
  const [flash, setFlash] = useState(null)
  const timing = TIMING[gameSpeed] ?? TIMING.normal
  const effectiveRelics = selectors.effectiveRelics(state)
  const preview = evaluatePool(state.dice, effectiveRelics, { rerollsLeft: availableRerolls })
  const fx = effectiveRelics.reduce((acc, r) => ({ ...acc, ...r.effects }), {})
  const freezeCharges = fx.freezeChargePerRound || 0
  const canFreeze = state.freezeChargesUsed < freezeCharges
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

  // Escape cancels a consumable waiting for its target die.
  useEffect(() => {
    if (!armedConsumable) return
    function onKey(e) {
      if (e.key !== 'Escape') return
      e.stopImmediatePropagation()
      onArmedDone?.()
    }
    window.addEventListener('keydown', onKey, { capture: true })
    return () => window.removeEventListener('keydown', onKey, { capture: true })
  }, [armedConsumable, onArmedDone])

  useEffect(() => {
    if (boss) playBossRound()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    const id = setTimeout(
      () => {
        if (step.value) playCoin()
        setReveal((r) => (r ? applyStep(r) : r))
      },
      step.dieId ? timing.step : timing.line,
    )
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reveal])

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
    setReveal((r) => (r && r.index < r.steps.length ? finishReveal(r) : r))
  }, [])

  const handleReroll = useCallback(() => {
    if (!canReroll || revealing) return
    playRoll()
    dispatch({ type: 'REROLL_UNHELD' })
  }, [canReroll, revealing, dispatch])

  const handleSubmit = useCallback(() => {
    if (revealing) return
    playClick()
    const script = buildReveal(preview)
    setReveal(gameSpeed === 'instant' ? finishReveal(script) : script)
  }, [revealing, preview, gameSpeed])

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

  // Eclipse hides every face (and so the score) until you cast.
  const hidden = Boolean(fx.hideFaces) && !revealing
  const shown = revealing ? reveal.result : preview
  const currentStep = revealing && !revealDone ? reveal.steps[reveal.index] : null
  const baseShown = hidden ? '?' : fmt(revealing ? reveal.base : preview.baseValue)
  const multShown = hidden ? '?' : fmt(revealing ? reveal.mult : preview.multiplier)
  const liveScore = revealing ? Math.round(reveal.base * reveal.mult) : preview.roundScore

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
                  {boss.id === 'primordial' ? t('elementa.diceTray.finalBoss') : t('elementa.diceTray.bossRound')}
                </span>
                <div className="text-left">
                  <div className="pixel-heading text-[10px] text-[#ffb0b0]">{bossTitle}</div>
                  <div className="text-base text-[#ffd0d0]/80">{bossLine}</div>
                </div>
              </motion.div>
            )}

            {/* Base x Mult = Score, live while you play and during the cast. */}
            <div data-tut="score" className="flex items-end justify-center gap-2 sm:gap-4">
              <ScoreBox label={t('elementa.diceTray.base')} value={baseShown} color="#2f6fc4" />
              <span className="pixel-score pb-4 text-sm text-[var(--text-mute)] sm:text-lg">x</span>
              <ScoreBox
                label={t('elementa.diceTray.mult')}
                value={multShown}
                color="#c4412f"
                pulseKey={currentStep?.section === 'mult' ? `m${reveal.index}` : undefined}
              />
              <span className="pixel-score pb-4 text-sm text-[var(--text-mute)] sm:text-lg">=</span>
              <div className="flex flex-col items-center gap-2">
                <span className="el-label">{t('elementa.diceTray.score')}</span>
                <div className="flex h-12 min-w-[72px] items-center justify-center sm:h-14 sm:min-w-[110px]">
                  {hidden ? (
                    <span className="pixel-score text-xl text-[var(--gold-1)] sm:text-3xl">?</span>
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

            <div data-tut="target" className="flex w-full justify-center">
              <TargetBar score={hidden ? 0 : liveScore} target={state.threshold} />
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
            {armedConsumable && (
              <div className="el-panel flex items-center gap-4 px-4 py-2" style={{ '--edge': 'var(--arcane-hi)' }}>
                <span className="text-base text-[var(--arcane-hi)]">{t('elementa.shop.chooseDieToApply')}</span>
                <button type="button" onClick={() => onArmedDone?.()} className="el-btn el-btn--sm">
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
                return (
                  <Reorder.Item
                    key={die.id}
                    value={die.id}
                    as="div"
                    dragListener={!revealing}
                    onDragStart={() => (draggingRef.current = true)}
                    onDragEnd={() => setTimeout(() => (draggingRef.current = false), 80)}
                    className="touch-none"
                  >
                    <Die
                      die={die}
                      hotkey={i < 9 ? i + 1 : null}
                      size={size}
                      hidden={hidden}
                      lockBlocked={Boolean(fx.noFreeLock)}
                      linkColors={links[i] ?? null}
                      linkGap={gap}
                      targeting={Boolean(armedConsumable)}
                      isDragging={() => draggingRef.current}
                      showHotkey={display.keyHints}
                      onToggleHeld={(id) => {
                        if (armedConsumable) {
                          dispatch({ type: 'APPLY_CONSUMABLE', instanceId: armedConsumable, dieId: id })
                          onArmedDone?.()
                          return
                        }
                        dispatch({ type: 'TOGGLE_HELD', dieId: id })
                      }}
                      onLock={(id) => dispatch({ type: 'LOCK_DIE', dieId: id })}
                      onFreeze={(id) => dispatch({ type: 'FREEZE_DIE', dieId: id })}
                      canFreeze={canFreeze}
                      revealing={revealing}
                      scoring={currentStep?.dieId === die.id}
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
            target={state.threshold}
            discovered={discovered}
            open={display.ledgerOpen}
            onToggle={() => updateDisplay({ ledgerOpen: !display.ledgerOpen })}
          />
        </div>
      </motion.div>
    </>
  )
}
