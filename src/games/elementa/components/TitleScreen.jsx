import { useState } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../../../i18n/LanguageContext.jsx'
import { playClick } from '../utils/sound.js'
import { DECKS } from '../data/decks.js'
import { DIFFICULTIES } from '../data/difficulty.js'
import { localizeDeck, localizeDifficulty } from '../data/i18n.js'
import { dieDescriptor } from '../data/itemDescriptors.js'
import ItemIcon from './ItemIcon.jsx'
import { readProfile, isDeckUnlocked, isDifficultyUnlocked } from '../utils/profile.js'
import { cleanSeed } from '../engine/rng.js'

function OptionCard({ selected, onClick, children, accent, disabled = false }) {
  return (
    <motion.button
      type="button"
      whileTap={disabled ? undefined : { scale: 0.97 }}
      whileHover={disabled ? undefined : { y: -3 }}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={`el-panel flex w-full flex-col gap-3 p-4 text-left ${
        selected ? '' : disabled ? 'el-panel--dark cursor-not-allowed opacity-50' : 'el-panel--dark opacity-80 hover:opacity-100'
      }`}
      style={selected ? { '--edge': accent ?? 'var(--gold-1)', background: 'var(--stone-2)' } : undefined}
    >
      {children}
    </motion.button>
  )
}

/** New-run setup: pick starting dice and stakes, then begin. */
export default function TitleScreen({ slot, dispatch }) {
  const { t, lang } = useLanguage()
  const [profile] = useState(() => readProfile(slot))
  const [seed, setSeed] = useState('')
  // Default to the newest loadout the player has unlocked: that's usually
  // the one they want to try next.
  const [deckId, setDeckId] = useState(
    () => [...DECKS].reverse().find((d) => isDeckUnlocked(d.id, profile))?.id ?? DECKS[0].id,
  )
  const [difficultyId, setDifficultyId] = useState(
    () => [...DIFFICULTIES].reverse().find((d) => isDifficultyUnlocked(d.id, profile))?.id ?? DIFFICULTIES[0].id,
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
      className="flex w-full max-w-4xl flex-col items-center gap-10 text-center"
    >
      <h2 className="pixel-heading text-xl text-[var(--gold-1)] sm:text-2xl">{t('elementa.title.newRun')}</h2>

      <section className="flex w-full flex-col items-center gap-4">
        <h3 className="el-label">{t('elementa.title.chooseDeck')}</h3>
        <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {DECKS.map((rawDeck, i) => {
            const deck = localizeDeck(rawDeck, lang)
            const unlocked = isDeckUnlocked(deck.id, profile)
            const beaten = profile.decksBeaten.includes(deck.id)
            const prevName = i > 0 ? localizeDeck(DECKS[i - 1], lang).name : ''
            return (
              <OptionCard
                key={deck.id}
                selected={deckId === deck.id}
                disabled={!unlocked}
                onClick={() => {
                  playClick()
                  setDeckId(deck.id)
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex gap-2">
                    {deck.dice.map((elementId, j) => {
                      const item = dieDescriptor(elementId, lang)
                      return unlocked ? (
                        <ItemIcon key={j} static size={24} icon={item.icon} sprite={item.sprite} glyph={item.glyph} color={item.color} rarity={item.rarity} />
                      ) : (
                        <ItemIcon key={j} static size={24} glyph="?" color="#6e6480" />
                      )
                    })}
                  </div>
                  {beaten && <span className="el-chip bg-[var(--good)] text-[var(--ink)]">{t('elementa.title.cleared')}</span>}
                </div>
                <div className="pixel-heading text-[10px] text-[var(--text)]">{unlocked ? deck.name : '???'}</div>
                <div className="text-base leading-snug text-[var(--text-dim)]">
                  {unlocked
                    ? deck.tagline
                    : isDeckUnlocked(DECKS[i - 1].id, profile)
                      ? t('elementa.title.unlockHint').replace('{deck}', prevName)
                      : t('elementa.gallery.locked')}
                </div>
              </OptionCard>
            )
          })}
        </div>
      </section>

      <section className="flex w-full flex-col items-center gap-4">
        <h3 className="el-label">{t('elementa.title.chooseDifficulty')}</h3>
        <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {DIFFICULTIES.map((rawDiff, i) => {
            const diff = localizeDifficulty(rawDiff, lang)
            const unlocked = isDifficultyUnlocked(diff.id, profile)
            const beaten = profile.difficultiesBeaten.includes(diff.id)
            const prev = i > 0 ? localizeDifficulty(DIFFICULTIES[i - 1], lang) : null
            return (
              <OptionCard
                key={diff.id}
                selected={difficultyId === diff.id}
                disabled={!unlocked}
                accent={diff.color}
                onClick={() => {
                  playClick()
                  setDifficultyId(diff.id)
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {/* Flame pips: one per tier, a quick read of the stakes. */}
                    {Array.from({ length: i + 1 }).map((_, j) => (
                      <span key={j} className="h-2.5 w-2.5" style={{ background: diff.color, boxShadow: '0 0 0 2px var(--ink)' }} />
                    ))}
                  </div>
                  {beaten && <span className="el-chip bg-[var(--good)] text-[var(--ink)]">{t('elementa.title.cleared')}</span>}
                </div>
                <div className="pixel-heading text-[10px]" style={{ color: diff.color }}>
                  {diff.name}
                </div>
                <div className="text-base leading-snug text-[var(--text-dim)]">
                  {unlocked ? diff.tagline : t('elementa.title.difficultyHint').replace('{d}', prev.name)}
                </div>
              </OptionCard>
            )
          })}
        </div>
      </section>

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
        <button
          type="button"
          onClick={() => {
            playClick()
            dispatch({ type: 'START_RUN', deckId, difficultyId, seed })
          }}
          className="el-btn el-btn--gold el-btn--lg min-w-[220px]"
        >
          {t('elementa.title.startRun')}
        </button>
      </div>
    </motion.div>
  )
}
