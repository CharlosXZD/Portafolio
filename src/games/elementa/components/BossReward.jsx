import { useState } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../../../i18n/LanguageContext.jsx'
import { localizeBossModifier } from '../data/i18n.js'
import { dieDescriptor } from '../data/itemDescriptors.js'
import { selectors } from '../engine/gameReducer.js'
import { playClick, playCoin } from '../utils/sound.js'
import DieSprite from './DieSprite.jsx'
import PixelSprite from './PixelSprite.jsx'
import BossAvatar from './BossAvatar.jsx'
import DieToken from './DieToken.jsx'

const DIE_COLORS = { top: '#9a7cf0', bottom: '#6a4fd6', rim: '#d6c8ff', shade: '#2f2168', facet: '#5a41c0' }

/**
 * After beating a boss the player gets two things: one die of their choice
 * grows a size, and one slot of their choice (dice, relics or consumables).
 * Then the shop opens.
 */
export default function BossReward({ state, dispatch }) {
  const { t, lang } = useLanguage()
  const boss = localizeBossModifier(state.bossModifier, lang)
  const [dieId, setDieId] = useState(null)
  const [slot, setSlot] = useState(null)
  const canGrow = state.dice.some((d) => selectors.growTier(state, d))
  const ready = slot && (dieId || !canGrow)

  const caps = {
    dice: selectors.maxDiceFor(state),
    relics: selectors.relicCapFor(state),
    consumables: selectors.consumableCapFor(state),
  }
  const slots = [
    {
      id: 'dice',
      art: (
        <span className="relative block h-12 w-12">
          <DieSprite tier="d6" size={48} {...DIE_COLORS} />
        </span>
      ),
    },
    { id: 'relics', art: <PixelSprite name="crown" color="#ffd166" accent="#e5533d" accent2="#3d8fe5" size={48} /> },
    { id: 'consumables', art: <PixelSprite name="bag" color="#8a5a34" accent="#ffd166" size={48} /> },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', bounce: 0.25, duration: 0.5 }}
      className="mx-auto flex w-full max-w-4xl flex-col items-center gap-8 pt-10 text-center"
    >
      <div className="flex flex-col items-center gap-3">
        {boss && <BossAvatar id={boss.id} size={72} />}
        <h2 className="pixel-heading text-lg text-[var(--gold-1)]">{t('elementa.bossReward.title')}</h2>
        <p className="text-lg text-[var(--text-dim)]">
          {boss ? t('elementa.bossReward.subtitle').replace('{boss}', boss.name) : ''}
        </p>
      </div>

      <section className="el-panel flex w-full flex-col items-center gap-5 p-6" style={{ '--edge': 'var(--gold-2)' }}>
        <div className="flex flex-col items-center gap-1">
          <span className="pixel-heading text-[11px] text-[var(--gold-hi)]">1. {t('elementa.bossReward.dieTitle')}</span>
          <span className="text-base text-[var(--text-dim)]">
            {canGrow ? t('elementa.bossReward.dieBody') : t('elementa.bossReward.diceMaxed')}
          </span>
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          {state.dice.map((die) => {
            const next = selectors.growTier(state, die)
            const item = dieDescriptor(die.elementId, lang)
            const chosen = dieId === die.id
            return (
              <div key={die.id} className="flex flex-col items-center gap-2">
                <DieToken
                  die={die}
                  size={64}
                  ringColor={chosen ? '#ffd166' : null}
                  dimmed={!next}
                  title={`${item.name} d${die.sides}`}
                  onClick={() => {
                    if (!next) return
                    playClick()
                    setDieId(die.id)
                  }}
                />
                <span
                  className={`pixel-score text-[8px] ${chosen ? 'text-[var(--gold-hi)]' : 'text-[var(--text-mute)]'}`}
                >
                  {next ? (chosen ? `d${die.sides} > d${next.sides}` : `d${die.sides}`) : 'MAX'}
                </span>
              </div>
            )
          })}
        </div>
      </section>

      <section className="flex w-full flex-col items-center gap-4">
        <span className="pixel-heading text-[11px] text-[var(--gold-hi)]">2. {t('elementa.bossReward.slotTitle')}</span>
        <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-3">
          {slots.map((o, i) => (
            <motion.button
              key={o.id}
              type="button"
              aria-pressed={slot === o.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.08 }}
              whileHover={{ y: -6 }}
              onClick={() => {
                playClick()
                setSlot(o.id)
              }}
              className="el-panel flex flex-col items-center gap-3 p-5 text-center"
              style={{
                '--edge': slot === o.id ? 'var(--gold-1)' : 'var(--gold-3)',
                outline: slot === o.id ? '3px solid var(--gold-1)' : undefined,
                outlineOffset: 4,
                filter: slot === o.id ? 'drop-shadow(0 0 10px #ffd16688)' : undefined,
              }}
            >
              <span className="flex h-14 items-center justify-center">{o.art}</span>
              <span className="pixel-heading text-[10px] text-[var(--gold-hi)]">
                {t(`elementa.bossReward.${o.id}Title`)}
              </span>
              <span className="text-base leading-snug text-[var(--text-dim)]">
                {t('elementa.bossReward.slotBody')
                  .replace('{kind}', t(`elementa.bossReward.${o.id}Kind`))
                  .replace('{from}', caps[o.id])
                  .replace('{to}', caps[o.id] + 1)}
              </span>
            </motion.button>
          ))}
        </div>
      </section>

      <button
        type="button"
        disabled={!ready}
        onClick={() => {
          playCoin()
          dispatch({ type: 'CHOOSE_BOSS_REWARD', dieId, slot })
        }}
        className="el-btn el-btn--green el-btn--lg"
      >
        {ready ? t('elementa.bossReward.claim') : t('elementa.bossReward.pickBoth')}
      </button>
    </motion.div>
  )
}
