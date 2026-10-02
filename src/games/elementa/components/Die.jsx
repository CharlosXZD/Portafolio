import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useAnimationControls } from 'framer-motion'
import { ELEMENTS, FLAGS, rarityForElement } from '../data/elements.js'
import { RARITY, RARITY_GLOW } from '../data/relics.js'
import { playClick, playLock, playFreeze, playLand, playBoom, playGust, playClank } from '../utils/sound.js'
import { useGameSettings } from '../utils/gameSettingsContext.jsx'
import { juicyHover, juicyTap } from '../utils/motionPresets.js'
import { useLanguage } from '../../../i18n/LanguageContext.jsx'
import { localize, ELEMENTS_ES } from '../data/i18n.js'
import Tooltip from './Tooltip.jsx'
import ItemInspector from './ItemInspector.jsx'
import { DieHoverCard, DieFullModal } from './DieInfo.jsx'
import { dieDescriptor } from '../data/itemDescriptors.js'
import { useLongPress } from '../utils/useLongPress.js'
import ElementFx from './ElementFx.jsx'
import { LandBurst, ExplosionFx, DriftFx, LockFx } from './RollFx.jsx'
import PixelIcon from './PixelIcon.jsx'
import DieSprite, { dieNumberY } from './DieSprite.jsx'
import { mix } from '../utils/color.js'
import { dieColors } from './DieToken.jsx'

// Classic: the face flickers in place. Tumble (EXPANSION.md P3): a toss arc
// with real 3D rotation, two diminishing bounces, a shadow on the ground and
// a face that ticks slower and slower before it lands. Roughly the same
// total time as before so rerolls don't slow down; a d20 takes a little
// longer to settle and a d3 a little less.
const FLICKER_TICK_MS = 45
const FLICKER_TICKS = 7
const TUMBLE_BASE_SECONDS = 0.46
const TUMBLE_TICKS = 8
const LAND_AT = 0.62 // fraction of the toss where it first touches down
const CASCADE_MS = 40 // each die starts this much after the one on its left
// An explosion chain replays in at most about this long (P11).
const CHAIN_BUDGET_MS = 1000
const clamp01 = (x) => Math.min(1, Math.max(0, x))

/** A 5x3 pixel arrow for the Drift buttons. */
function PixelArrow({ up }) {
  const rows = up ? ['..#..', '.###.', '#####'] : ['#####', '.###.', '..#..']
  return (
    <svg width={10} height={6} viewBox="0 0 5 3" shapeRendering="crispEdges" aria-hidden>
      {rows.flatMap((row, y) =>
        [...row].map((c, x) => (c === '#' ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="currentColor" /> : null)),
      )}
    </svg>
  )
}

// Three distinct "committed" states, each with its own feel:
//  - held:   reversible, weightless. A gold ring and a tag above the die.
//  - locked: the die's own element sealing itself in place. Grounded,
//            a bounce-in glow in the element's color (a "rune settling").
//  - frozen: a universal relic effect, not tied to any element. Clamps the
//            die down and in, with an icy blue crack-in shake, unlike a lock.
export default function Die({
  die,
  onToggleHeld,
  onLock,
  onFreeze,
  canFreeze,
  scoring = false,
  revealing = false,
  contribution = null,
  hotkey = null,
  size = 84,
  hidden = false,
  lockBlocked = false,
  linkColors = null,
  linkGap = 24,
  targeting = false,
  isDragging,
  showHotkey = true,
  canDrift = false,
  onNudge,
  actingAs = null,
  tideLock = false,
  index = 0,
}) {
  const { reducedMotion, display, screenShake } = useGameSettings()
  const { lang, t } = useLanguage()
  const tumble = display.rollAnimation !== 'classic' && !reducedMotion
  const tumbleControls = useAnimationControls()
  const def = ELEMENTS[die.elementId]
  const elementName = localize(lang, def.name, ELEMENTS_ES, die.elementId, 'name')
  // Masquerade and Chameleon use the abilities of the die they act as.
  const acting = ELEMENTS[actingAs ?? die.elementId]
  const canFreeLock = (acting.flags[FLAGS.FREE_LOCK] || tideLock) && !die.locked && !lockBlocked
  const isLocked = die.locked && die.lockedVia === 'lock'
  const isFrozen = die.locked && die.lockedVia === 'freeze'
  const rarity = rarityForElement(die.elementId)
  const rarityGlow = rarity !== RARITY.COMMON ? RARITY_GLOW[rarity] : null

  const mountedRollId = useRef(die.rollId)
  const [rolling, setRolling] = useState(false)
  const [displayValue, setDisplayValue] = useState(die.value)
  const [settleKey, setSettleKey] = useState(0)

  // One-shot effects (components/RollFx.jsx): a landing burst, the step of
  // an explosion chain being replayed, a Drift gust and a lock closing.
  const shadowControls = useAnimationControls()
  const timers = useRef([])
  const driftDir = useRef(0)
  const [landKey, setLandKey] = useState(0)
  const [chainStep, setChainStep] = useState(null)
  const [boom, setBoom] = useState(null)
  const [driftFx, setDriftFx] = useState(null)
  const [lockFxKey, setLockFxKey] = useState(0)
  const after = (ms, fn) => timers.current.push(setTimeout(fn, ms))
  const clearTimers = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }
  useEffect(() => clearTimers, [])

  // Detail levels (EXPANSION.md P5 to P9): the click popover and the
  // click-and-hold dialog. Hold never toggles the die.
  const [infoOpen, setInfoOpen] = useState(false)
  const [fullOpen, setFullOpen] = useState(false)
  const longPress = useLongPress(
    () => {
      setInfoOpen(false)
      setFullOpen(true)
    },
    { enabled: !revealing },
  )
  // A new roll or a cast closes the popover: it describes the old state.
  useEffect(() => {
    setInfoOpen(false)
  }, [die.rollId, revealing])

  const mountedLockedVia = useRef(die.lockedVia)
  const [lockEventKey, setLockEventKey] = useState(0)

  // A face can change without a new roll (Drift): show it right away, with
  // a gust and an arrow when the player nudged it. Runs before the roll
  // effect, so a real roll still flickers first.
  useEffect(() => {
    if (die.rollId !== mountedRollId.current) return
    setDisplayValue(die.value)
    if (driftDir.current) {
      setDriftFx({ key: Date.now(), dir: driftDir.current })
      setSettleKey((k) => k + 1)
      playGust()
      driftDir.current = 0
    }
  }, [die.value, die.rollId])

  // Replays the explosion chain face by face (P11): a burst, the face
  // re-rolling into the next value, a "+N" and a growing "xK". Reduced
  // motion gets one flash. Gameplay never reads any of it.
  function replayChain() {
    if (!die.explosions || die.explosions < 1) return
    if (reducedMotion) {
      setBoom({ key: Date.now(), step: 1 })
      return
    }
    // Older saves have no recorded chain: spread the total over the steps.
    const rest = die.total - die.value
    const chain =
      Array.isArray(die.chain) && die.chain.length === die.explosions + 1
        ? die.chain
        : [die.value, ...Array.from({ length: die.explosions }, () => Math.max(1, Math.round(rest / die.explosions)))]
    const steps = chain.length - 1
    const gap = Math.min(260, Math.max(90, CHAIN_BUDGET_MS / steps))
    // What each step adds (Fire-family relics can double it).
    const rawSum = chain.slice(1).reduce((a, b) => a + b, 0)
    const factor = rawSum > 0 ? (die.total - die.value) / rawSum : 1
    for (let k = 1; k <= steps; k++) {
      after(120 + (k - 1) * gap, () => {
        setChainStep({ k, add: Math.round(chain[k] * factor * 10) / 10 })
        setDisplayValue(chain[k])
        setSettleKey((n) => n + 1)
        setBoom({ key: Date.now() + k, step: k })
        playBoom(k)
        if (screenShake) tumbleControls.start({ x: [0, -2 - k, 2 + k, 0], transition: { duration: 0.16 } })
      })
    }
    after(120 + steps * gap + 160, () => {
      setChainStep(null)
      setDisplayValue(die.value)
      setSettleKey((n) => n + 1)
    })
  }

  useEffect(() => {
    if (die.rollId === mountedRollId.current) return
    mountedRollId.current = die.rollId
    clearTimers()
    setChainStep(null)
    setBoom(null)
    setRolling(true)

    const land = () => {
      setDisplayValue(die.value)
      setRolling(false)
      setSettleKey((k) => k + 1)
      replayChain()
    }

    if (!tumble) {
      let ticks = 0
      const interval = setInterval(() => {
        ticks += 1
        setDisplayValue(1 + Math.floor(Math.random() * die.sides))
        if (ticks >= FLICKER_TICKS) {
          clearInterval(interval)
          land()
        }
      }, FLICKER_TICK_MS)
      timers.current.push(interval)
      return
    }

    // Heavier dice (more sides) settle longer, stand a little lower, cast a
    // bigger shadow, and a d20 nudges the table. Each die also starts a
    // beat after the one on its left, so the pool ripples.
    const heavy = clamp01((die.sides - 3) / 17)
    const seconds = TUMBLE_BASE_SECONDS + heavy * 0.16
    const wait = Math.min(index ?? 0, 9) * CASCADE_MS
    const landMs = seconds * LAND_AT * 1000
    // Each die picks its own spin direction and hop height from its roll
    // id, so a pool doesn't move in lockstep. Purely visual.
    const spin = die.rollId * 1000 % 1 < 0.5 ? -1 : 1
    const hop = size * (0.62 - heavy * 0.2) * (0.85 + ((die.rollId * 7919) % 1) * 0.3)
    const times = [0, 0.31, LAND_AT, 0.73, 0.83, 0.91, 1]
    const ease = ['easeOut', 'easeIn', 'easeOut', 'easeIn', 'easeOut', 'easeIn']
    after(wait, () => {
      tumbleControls
        .start({
          y: [0, -hop, 0, -hop * 0.32, 0, -hop * 0.1, 0],
          // A full turn each way in the air; the last keyframes are whole
          // turns, so the die lands face-up.
          rotateX: [0, spin * 200, spin * 360, spin * 360, spin * 360, spin * 360, spin * 360],
          rotateY: [0, spin * -330, spin * -720, spin * -720, spin * -720, spin * -720, spin * -720],
          rotate: [0, spin * 40, spin * -14, spin * 6, 0, 0, 0],
          scaleX: [1, 1, 1.1 + heavy * 0.06, 0.98, 1.04, 1, 1],
          scaleY: [1, 1.04, 0.88 - heavy * 0.04, 1.03, 0.95, 1.01, 1],
          transition: { duration: seconds, times, ease },
        })
        .then(() => tumbleControls.set({ rotateX: 0, rotateY: 0, rotate: 0, y: 0 }))
      // The shadow shrinks and fades as the die rises, and grows as it falls.
      shadowControls.start({
        scaleX: [1, 0.55, 1.08, 0.8, 1, 0.9, 1].map((v) => v * (1 + heavy * 0.25)),
        opacity: [0.4, 0.12, 0.5, 0.22, 0.42, 0.28, 0],
        transition: { duration: seconds, times, ease },
      })
      // The face ticks fast, then slower and slower, and lands on the real
      // value the moment the die touches down.
      for (let i = 1; i < TUMBLE_TICKS; i++) {
        after(landMs * Math.pow(i / TUMBLE_TICKS, 1.7), () => setDisplayValue(1 + Math.floor(Math.random() * die.sides)))
      }
      after(landMs, () => {
        setLandKey((k) => k + 1)
        playLand(die.sides)
        if (heavy > 0.9) window.dispatchEvent(new CustomEvent('elementa:nudge', { detail: { amp: 3 } }))
        land()
      })
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [die.rollId])

  useEffect(() => {
    if (die.lockedVia && die.lockedVia !== mountedLockedVia.current) {
      setLockEventKey((k) => k + 1)
      // Chain links wrap the die and a lock clicks shut (P12). A freeze
      // keeps its own icy effect.
      if (die.lockedVia === 'lock') {
        setLockFxKey((k) => k + 1)
        after(300, () => playClank())
      }
    }
    mountedLockedVia.current = die.lockedVia
  }, [die.lockedVia])

  // Every die stays on the same baseline: held/locked/frozen read through
  // the colored ring and the tag underneath, not by moving the die (a lift
  // made mixed rows look misaligned).
  const pose = { y: 0, scale: 1, rotate: 0 }

  // Die body colors come from the element, darkened toward the night
  // palette so pale elements (Air, Steam) still carry a light number.
  const colors = dieColors(die.elementId, isFrozen)
  const ringColor = targeting
    ? '#b89cff'
    : scoring
    ? '#ffd166'
    : die.held && !die.locked
      ? '#ffd166'
      : isLocked
        ? def.color
        : isFrozen
          ? '#7dd3fc'
          : null
  const numberY = dieNumberY(die.tierId)
  const showFace = !hidden || revealing
  // Sapling growth, Patience (Earth family) and permanent bonuses share one chip.
  const extra = (die.growth || 0) + (die.patience || 0) + (die.bonus || 0)

  return (
    <div className="flex flex-col items-center gap-4">
      {/* State tags sit above the die (EXPANSION.md E7), in a fixed-height
          row, so a tag appearing never moves anything. */}
      <div className="flex h-6 items-center justify-center whitespace-nowrap" style={{ width: size }}>
        {!revealing && isLocked && (
          <span className="el-chip text-[var(--ink)]" style={{ backgroundColor: def.color }}>
            {t('elementa.die.locked')}
          </span>
        )}
        {!revealing && isFrozen && <span className="el-chip bg-[#7dd3fc] text-[var(--ink)]">{t('elementa.die.frozen')}</span>}
        {!revealing && die.held && !die.locked && (
          <span className="el-chip bg-[var(--gold-1)] text-[var(--ink)]">{t('elementa.die.held')}</span>
        )}
      </div>
      <Tooltip
        disabled={infoOpen}
        content={
          <DieHoverCard
            elementId={die.elementId}
            sides={die.sides}
            bonus={die.bonus || 0}
            score={!showFace ? '?' : typeof contribution === 'number' ? Math.round(contribution * 10) / 10 : null}
          />
        }
      >
        <motion.button
          type="button"
          {...longPress.handlers}
          onClick={() => {
            if (revealing || isDragging?.()) return
            if (longPress.consumed()) return
            // A locked die can't be held, but it can still be read.
            if (die.locked && !targeting) {
              setInfoOpen(true)
              return
            }
            playClick()
            onToggleHeld(die.id)
            if (!targeting) setInfoOpen(true)
          }}
          disabled={revealing}
          whileTap={die.locked || revealing ? {} : juicyTap(reducedMotion)}
          whileHover={die.locked || revealing ? {} : juicyHover(reducedMotion)}
          animate={pose}
          transition={{ type: 'spring', bounce: 0.35, duration: 0.3 }}
          aria-pressed={die.held}
          aria-label={`${elementName} d${die.sides}: ${showFace ? displayValue : '?'}`}
          className={`pixel-score relative isolate block ${die.locked || revealing ? 'cursor-default' : 'cursor-pointer'}`}
          style={{
            width: size,
            height: size,
            filter: rarityGlow && !die.held && !die.locked ? `drop-shadow(0 0 10px ${rarityGlow}66)` : undefined,
          }}
        >
          <ElementFx elementId={die.elementId} size={size} behind />
          {/* The body, mark and face tumble together; chips and bars don't. */}
          {/* The ground shadow (P3): only drawn while a die is tossed. */}
          <motion.span
            aria-hidden
            initial={{ opacity: 0 }}
            animate={shadowControls}
            className="pointer-events-none absolute bottom-[-7%] left-[14%] right-[14%] -z-10 h-[7%] bg-black/70"
            style={{ borderRadius: '50%' }}
          />
          <motion.span
            animate={tumbleControls}
            style={{ transformPerspective: 520 }}
            className="pointer-events-none absolute inset-0 block"
          >
          <DieSprite tier={die.tierId} size={size} {...colors} ringColor={ringColor} />
          <span className="pointer-events-none absolute left-[18%] top-[16%]" style={die.tierId === 'd3' ? { left: '43%', top: '26%' } : undefined}>
            <PixelIcon name={die.elementId} size={size >= 90 ? 14 : 7} color="#fffaf0" hi={def.color} />
          </span>
          <motion.span
            key={settleKey}
            initial={rolling ? false : { scale: 1.3, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', bounce: 0.5, duration: 0.35 }}
            className="pointer-events-none absolute left-1/2 -translate-x-1/2 -translate-y-1/2 leading-none"
            style={{
              top: `${numberY * 100}%`,
              fontSize: Math.round(size * (die.tierId === 'd3' ? 0.22 : 0.27)),
              color: '#fffaf0',
              textShadow: '3px 3px 0 var(--ink)',
            }}
          >
            {showFace ? displayValue : '?'}
          </motion.span>
          </motion.span>
          {!isFrozen && <ElementFx elementId={die.elementId} size={size} />}

          {/* One-shot effects: landing, explosion step, Drift, lock. */}
          {landKey > 0 && <LandBurst key={`land-${landKey}`} elementId={die.elementId} size={size} heavy={clamp01((die.sides - 3) / 17)} />}
          {boom && <ExplosionFx key={`boom-${boom.key}`} elementId={die.elementId} size={size} step={boom.step} />}
          {driftFx && <DriftFx key={`drift-${driftFx.key}`} elementId={die.elementId} size={size} dir={driftFx.dir} />}
          {lockFxKey > 0 && <LockFx key={`lockfx-${lockFxKey}`} elementId={die.elementId} size={size} />}

          {/* Reaction bar in the gap to the right neighbor: one segment per
              reaction on this link, centered in the gap so bars never overlap. */}
          {linkColors && (
            <span
              className="pointer-events-none absolute top-1/4 flex h-1/2 w-1.5 flex-col"
              style={{
                right: -(linkGap / 2) - 3,
                boxShadow: `0 0 10px 2px ${linkColors[0]}`,
              }}
            >
              {linkColors.map((c) => (
                <span key={c} className="flex-1" style={{ background: c }} />
              ))}
            </span>
          )}

          {/* The chain being replayed: what this step adds, and a counter
              that grows hotter with every explosion. */}
          {chainStep && !reducedMotion && (
            <>
              <motion.span
                key={`chain-add-${chainStep.k}`}
                initial={{ opacity: 0, y: 0, scale: 0.6 }}
                animate={{ opacity: [0, 1, 1, 0], y: -Math.round(size * 0.7), scale: 1 + Math.min(chainStep.k, 6) * 0.08 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className="pixel-score pointer-events-none absolute left-1/2 top-0 z-20 -translate-x-1/2 whitespace-nowrap text-sm text-[#ffd166]"
                style={{ textShadow: '2px 2px 0 var(--ink), -1px 0 0 var(--ink), 0 -1px 0 var(--ink)' }}
              >
                +{chainStep.add}
              </motion.span>
              <motion.span
                key={`chain-x-${chainStep.k}`}
                initial={{ scale: 0.3 }}
                animate={{ scale: 1 + Math.min(chainStep.k, 6) * 0.12 }}
                transition={{ type: 'spring', bounce: 0.6, duration: 0.3 }}
                className="el-chip pointer-events-none absolute -right-3 -top-3 z-20 text-[var(--ink)]"
                style={{ backgroundColor: mix('#ff9a45', '#ff3a3a', Math.min(1, (chainStep.k - 1) / 4)) }}
              >
                x{chainStep.k + 1}
              </motion.span>
            </>
          )}
          {die.explosions > 0 && !rolling && !chainStep && showFace && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.6, duration: 0.3 }}
              className="el-chip absolute -right-3 -top-3 bg-[#ff7a45] text-[var(--ink)]"
            >
              +{die.explosions}
            </motion.span>
          )}
          {extra > 0 && (
            <span className="el-chip absolute -left-3 -top-3 bg-[#6fbf4a] text-[var(--ink)]">+{extra}</span>
          )}
          {/* Kindling: a fizzled Fire-family die pays back a reroll. */}
          <AnimatePresence>
            {die.kindled && !rolling && showFace && !revealing && (
              <motion.span
                key={`kindle-${die.rollId}`}
                initial={{ opacity: 0, y: 0, scale: 0.6 }}
                animate={{ opacity: [0, 1, 1, 0], y: -Math.round(size * 0.6), scale: 1.1 }}
                transition={{ duration: reducedMotion ? 0.01 : 1.1, ease: 'easeOut' }}
                className="pixel-score pointer-events-none absolute left-1/2 top-0 z-20 flex -translate-x-1/2 items-center gap-1 whitespace-nowrap text-xs text-[#ffb36b]"
                style={{ textShadow: '2px 2px 0 var(--ink)' }}
              >
                +1 <PixelIcon name="reroll" size={9} />
              </motion.span>
            )}
          </AnimatePresence>
          {isFrozen && (
            <motion.span
              key={`freeze-${lockEventKey}`}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1, x: [0, -3, 3, -2, 0] }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="pointer-events-none absolute -right-2 -top-2"
            >
              <PixelIcon name="ice" size={14} color="#bfefff" hi="#ffffff" />
            </motion.span>
          )}

          {/* Floating "+N" that rises off the die as it scores during the
              reveal; zero-scoring dice (fizzles, banned) pop a dim "+0". */}
          <AnimatePresence>
            {scoring && typeof contribution === 'number' && (
              <motion.span
                key="score-pop"
                initial={{ opacity: 0, y: 0, scale: 0.6 }}
                animate={{ opacity: 1, y: -Math.round(size * 0.75), scale: contribution > 0 ? 1.25 : 1 }}
                exit={{ opacity: 0, y: -Math.round(size * 1.1), scale: 1 }}
                transition={{ type: 'spring', bounce: 0.45, duration: 0.35 }}
                className="pixel-score pointer-events-none absolute left-1/2 top-0 z-20 -translate-x-1/2 whitespace-nowrap text-lg"
                style={{
                  color: contribution > 0 ? 'var(--gold-1)' : 'var(--text-mute)',
                  textShadow: '3px 3px 0 var(--ink), -2px 0 0 var(--ink), 0 -2px 0 var(--ink)',
                }}
              >
                +{Math.round(contribution * 10) / 10}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
        <AnimatePresence>
          {infoOpen && (
            <ItemInspector
              item={{
                ...dieDescriptor(die.elementId, lang),
                name: `${elementName} d${die.sides}`,
                footnote:
                  acting.id !== die.elementId
                    ? t('elementa.die.actingAs').replace('{die}', localize(lang, acting.name, ELEMENTS_ES, acting.id, 'name'))
                    : undefined,
                onInfo: () => {
                  setInfoOpen(false)
                  setFullOpen(true)
                },
              }}
              onClose={() => setInfoOpen(false)}
            />
          )}
        </AnimatePresence>
      </Tooltip>
      {fullOpen && (
        <DieFullModal
          elementId={die.elementId}
          sides={die.sides}
          bonus={die.bonus || 0}
          score={!showFace ? '?' : typeof contribution === 'number' ? Math.round(contribution * 10) / 10 : null}
          onClose={() => setFullOpen(false)}
        />
      )}
      {/* Actions and the hotkey below. Fixed size, centered on the die:
          buttons appearing or vanishing never widen the column or move the
          dice, and the row keeps its height during the cast. */}
      <div className="relative h-6" style={{ width: size }}>
        {!revealing && (
        <div className="absolute left-1/2 top-0 flex h-6 -translate-x-1/2 items-center gap-1.5 whitespace-nowrap">
          {canFreeLock && (
            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                playLock()
                onLock(die.id)
              }}
              className="el-btn el-btn--sm"
              style={{ '--face': mix(def.color, '#1d1829', 0.55) }}
            >
              {t('elementa.die.lock')}
            </motion.button>
          )}
          {canFreeze && !die.locked && (
            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                playFreeze()
                onFreeze(die.id)
              }}
              className="el-btn el-btn--sm"
              style={{ '--face': '#2c5f86', '--lit': '#5fa8d8', '--lip': '#173a57' }}
            >
              {t('elementa.die.freeze')}
            </motion.button>
          )}
          {canDrift && (
            <span className="flex items-center gap-0.5" title={t('elementa.die.driftHint')}>
              {[1, -1].map((delta) => (
                <motion.button
                  key={delta}
                  type="button"
                  whileTap={{ scale: 0.85 }}
                  disabled={delta === 1 ? die.value >= die.sides : die.value <= 1}
                  onClick={() => {
                    playClick()
                    driftDir.current = delta
                    onNudge?.(die.id, delta)
                  }}
                  aria-label={t(delta === 1 ? 'elementa.die.driftUp' : 'elementa.die.driftDown')}
                  className="el-btn el-btn--sm !px-1.5 text-[#e8f4fa]"
                  style={{ '--face': '#3d5866', '--lit': '#6f93a3', '--lip': '#1f323b' }}
                >
                  <PixelArrow up={delta === 1} />
                </motion.button>
              ))}
            </span>
          )}
          {showHotkey && !die.locked && !canFreeLock && !canFreeze && !canDrift && hotkey != null && (
            <span className="pixel-score text-[8px] text-[var(--text-mute)]">{hotkey}</span>
          )}
        </div>
        )}
      </div>
    </div>
  )
}
