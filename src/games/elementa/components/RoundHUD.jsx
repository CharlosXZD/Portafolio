import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../../i18n/LanguageContext.jsx'
import AnimatedNumber from './AnimatedNumber.jsx'
import ItemIcon from './ItemIcon.jsx'
import ItemInspector from './ItemInspector.jsx'
import PixelIcon from './PixelIcon.jsx'
import { relicDescriptor, consumableDescriptor } from '../data/itemDescriptors.js'
import { localizeDifficulty } from '../data/i18n.js'
import { selectors } from '../engine/gameReducer.js'

export function Hearts({ lives, maxLives, size = 14 }) {
  const { lang } = useLanguage()
  return (
    <div
      className="flex items-center gap-1"
      role="img"
      aria-label={lang === 'es' ? `${lives} de ${maxLives} vidas` : `${lives} of ${maxLives} lives`}
    >
      {Array.from({ length: maxLives }).map((_, i) => (
        <PixelIcon key={i} name={i < lives ? 'heart' : 'heartEmpty'} size={size} />
      ))}
    </div>
  )
}

export function ShardCount({ value, size = 14, className = 'text-[11px]' }) {
  const { t } = useLanguage()
  return (
    <span className="inline-flex items-center gap-1.5" title={t('elementa.hud.shards')}>
      <PixelIcon name="shard" size={size} />
      <AnimatedNumber value={value} className={`pixel-score text-[var(--gold-1)] ${className}`} />
    </span>
  )
}

/** A labeled stat block: tiny caps label over a big pixel number. */
export function Stat({ label, children, accent }) {
  return (
    <div className="el-well flex flex-col gap-2 px-3 py-2.5">
      <span className="el-label">{label}</span>
      <span className="pixel-score text-base leading-none" style={accent ? { color: accent } : undefined}>
        {children}
      </span>
    </div>
  )
}

function MiniIcon({ itemKey, item, openKey, onOpenChange }) {
  const isOpen = openKey === itemKey
  return (
    <div className="relative">
      <ItemIcon
        size={48}
        glyph={item.glyph}
        icon={item.icon} sprite={item.sprite}
        color={item.color}
        rarity={item.rarity}
        title={item.name}
        onClick={() => onOpenChange(isOpen ? null : itemKey)}
      />
      <AnimatePresence>
        {isOpen && <ItemInspector item={item} onClose={() => onOpenChange(null)} placement="right" />}
      </AnimatePresence>
    </div>
  )
}

/** Empty slot outline, so capacity is visible without a "2 / 5" caption. */
function EmptySlot({ size = 48 }) {
  return <div className="el-well shrink-0" style={{ width: size, height: size }} />
}

/**
 * Left sidebar during a round: where you are in the run (difficulty,
 * round, target), your resources (lives, Shards), and your relics and
 * consumables, each inspectable. Replaces the old one-line strip that
 * floated above the dice.
 */
export default function RoundHUD({ state }) {
  const { lang, t } = useLanguage()
  const [openKey, setOpenKey] = useState(null)
  const difficulty = state.difficulty ? localizeDifficulty(state.difficulty, lang) : null
  const relicCap = state.difficulty?.relicCap ?? state.relics.length
  const boss = Boolean(state.bossModifier)

  return (
    <aside data-tut="hud" className="el-panel flex flex-col gap-5 p-4 lg:sticky lg:top-4 lg:self-start">
      <div className="flex items-center justify-between gap-2">
        {difficulty && (
          <span className="pixel-score text-[8px] uppercase tracking-widest" style={{ color: difficulty.color }}>
            {difficulty.name}
          </span>
        )}
        {boss && (
          <span className="el-chip bg-[#a8323a] text-white">{t('elementa.diceTray.bossRound')}</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Stat label={t('elementa.hud.round')}>{state.round}</Stat>
        <Stat label={t('elementa.hud.target')} accent="var(--gold-1)">
          {state.threshold}
        </Stat>
      </div>

      <div className="flex items-center justify-between">
        <Hearts lives={state.lives} maxLives={state.maxLives} />
        <ShardCount value={state.shards} />
      </div>

      <section className="flex flex-col gap-3">
        <h3 className="el-label">
          {t('elementa.shop.relics')} {state.relics.length}/{relicCap}
        </h3>
        <div className="flex flex-wrap gap-3 p-1">
          {state.relics.map((r) => (
            <MiniIcon
              key={r.id}
              itemKey={`relic-${r.id}`}
              item={relicDescriptor(r, lang)}
              openKey={openKey}
              onOpenChange={setOpenKey}
            />
          ))}
          {Array.from({ length: Math.max(0, relicCap - state.relics.length) }).map((_, i) => (
            <EmptySlot key={i} />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="el-label">
          {t('elementa.shop.consumables')} {state.consumables.length}/{selectors.maxConsumables}
        </h3>
        <div className="flex flex-wrap gap-3 p-1">
          {state.consumables.map((c) => (
            <MiniIcon
              key={c.instanceId}
              itemKey={`consumable-${c.instanceId}`}
              item={consumableDescriptor(c, lang)}
              openKey={openKey}
              onOpenChange={setOpenKey}
            />
          ))}
          {Array.from({ length: Math.max(0, selectors.maxConsumables - state.consumables.length) }).map((_, i) => (
            <EmptySlot key={i} />
          ))}
        </div>
      </section>
    </aside>
  )
}
