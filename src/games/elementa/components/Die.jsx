import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ELEMENTS, FLAGS, describeElement, rarityForElement } from '../data/elements.js'
import { RARITY, RARITY_GLOW } from '../data/relics.js'
import { playClick, playLock, playFreeze } from '../utils/sound.js'
import { useGameSettings } from '../utils/gameSettingsContext.jsx'
import { juicyHover, juicyTap } from '../utils/motionPresets.js'
import { useLanguage } from '../../../i18n/LanguageContext.jsx'
import { localize, ELEMENTS_ES } from '../data/i18n.js'
import Tooltip from './Tooltip.jsx'
import PixelIcon from './PixelIcon.jsx'
import DieSprite, { dieNumberY } from './DieSprite.jsx'
import { mix } from '../utils/color.js'
import { dieColors } from './DieToken.jsx'

const FLICKER_TICK_MS = 45
const FLICKER_TICKS = 7

// Three distinct "committed" states, each with its own feel:
//  - held:   reversible, weightless. Lifts up, no color change.
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
}) {
  const { reducedMotion } = useGameSettings()
  const { lang, t } = useLanguage()
  const def = ELEMENTS[die.elementId]
  const elementName = localize(lang, def.name, ELEMENTS_ES, die.elementId, 'name')
  const canFreeLock = def.flags[FLAGS.FREE_LOCK] && !die.locked && !lockBlocked
  const isLocked = die.locked && die.lockedVia === 'lock'
  const isFrozen = die.locked && die.lockedVia === 'freeze'
  const description = describeElement(die.elementId, lang)
  // Which element families this die belongs to (pure: itself, fusion: its
  // parents), the same notion relic text uses ("Water-family die").
  const families = (def.tier === 'pure' ? [die.elementId] : def.parents).map((f) =>
    localize(lang, ELEMENTS[f].name, ELEMENTS_ES, f, 'name'),
  )
  const rarity = rarityForElement(die.elementId)
  const rarityGlow = rarity !== RARITY.COMMON ? RARITY_GLOW[rarity] : null

  const mountedRollId = useRef(die.rollId)
  const [rolling, setRolling] = useState(false)
  const [displayValue, setDisplayValue] = useState(die.value)
  const [settleKey, setSettleKey] = useState(0)

  const mountedLockedVia = useRef(die.lockedVia)
  const [lockEventKey, setLockEventKey] = useState(0)

  useEffect(() => {
    if (die.rollId === mountedRollId.current) return
    mountedRollId.current = die.rollId

    setRolling(true)
    let ticks = 0
    const interval = setInterval(() => {
      ticks += 1
      setDisplayValue(1 + Math.floor(Math.random() * die.sides))
      if (ticks >= FLICKER_TICKS) {
        clearInterval(interval)
        setDisplayValue(die.value)
        setRolling(false)
        setSettleKey((k) => k + 1)
      }
    }, FLICKER_TICK_MS)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [die.rollId])

  useEffect(() => {
    if (die.lockedVia && die.lockedVia !== mountedLockedVia.current) {
      setLockEventKey((k) => k + 1)
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
  const extra = (die.growth || 0) + (die.bonus || 0)

  return (
    <div className="flex flex-col items-center gap-5">
      <Tooltip
        content={
          <div>
            <div className="pixel-heading mb-2 text-[10px]" style={{ color: colors.rim }}>
              {elementName} <span className="text-[var(--text-mute)]">d{die.sides}</span>
            </div>
            <p className="mb-2 text-[var(--text)]">{description.tagline}</p>
            {families.length > 0 && (
              <p className="mb-2 text-[var(--arcane-hi)]">
                {t('elementa.gallery.families')}: {families.join(', ')}
              </p>
            )}
            <ul className="flex list-none flex-col gap-1">
              {description.flagLines.map((line) => (
                <li key={line} className="before:mr-1.5 before:text-[var(--gold-2)] before:content-['+']">
                  {line}
                </li>
              ))}
            </ul>
            {typeof contribution === 'number' && showFace && (
              <p className="mt-2 text-[var(--gold-1)]">
                {lang === 'es' ? `Anota ${contribution} esta tirada` : `Scores ${contribution} this roll`}
              </p>
            )}
          </div>
        }
      >
        <motion.button
          type="button"
          onClick={() => {
            if (revealing || isDragging?.()) return
            playClick()
            onToggleHeld(die.id)
          }}
          disabled={(die.locked && !targeting) || revealing}
          whileTap={die.locked || revealing ? {} : juicyTap(reducedMotion)}
          whileHover={die.locked || revealing ? {} : juicyHover(reducedMotion)}
          animate={pose}
          transition={{ type: 'spring', bounce: 0.35, duration: 0.3 }}
          aria-pressed={die.held}
          aria-label={`${elementName} d${die.sides}: ${showFace ? displayValue : '?'}`}
          className={`pixel-score relative block ${die.locked || revealing ? 'cursor-default' : 'cursor-pointer'}`}
          style={{
            width: size,
            height: size,
            filter: rarityGlow && !die.held && !die.locked ? `drop-shadow(0 0 10px ${rarityGlow}66)` : undefined,
          }}
        >
          <DieSprite tier={die.tierId} size={size} {...colors} ringColor={ringColor} />

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
          {die.explosions > 0 && !rolling && showFace && (
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
      </Tooltip>
      {!revealing && (
        <div className="flex h-6 items-center gap-2">
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
          {isLocked && (
            <span
              className="el-chip text-[var(--ink)]"
              style={{ backgroundColor: def.color }}
            >
              {t('elementa.die.locked')}
            </span>
          )}
          {isFrozen && (
            <span className="el-chip bg-[#7dd3fc] text-[var(--ink)]">
              {t('elementa.die.frozen')}
            </span>
          )}
          {die.held && !die.locked && <span className="el-chip bg-[var(--gold-1)] text-[var(--ink)]">{t('elementa.die.held')}</span>}
          {showHotkey && !die.held && !die.locked && !canFreeLock && !canFreeze && hotkey != null && (
            <span className="pixel-score text-[8px] text-[var(--text-mute)]">{hotkey}</span>
          )}
        </div>
      )}
    </div>
  )
}
