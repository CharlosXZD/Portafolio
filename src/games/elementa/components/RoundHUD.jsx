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
import KeeperSprite from './KeeperSprite.jsx'
import { shopTypeById } from '../data/shops.js'
import { currentNode, nodeById } from '../engine/map.js'
import BoonsList from './BoonsList.jsx'
import TriggerPulse from './TriggerPulse.jsx'
import { useTriggerPulses } from '../utils/useTriggerPulses.js'

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

function MiniIcon({ itemKey, item, openKey, onOpenChange, actions, armed = false, pulse = null }) {
  const isOpen = openKey === itemKey
  const body = (
    <>
      <ItemIcon
        size={48}
        glyph={item.glyph}
        icon={item.icon} sprite={item.sprite}
        color={item.color}
        rarity={item.rarity}
        title={item.name}
        armed={armed}
        onClick={() => onOpenChange(isOpen ? null : itemKey)}
      />
      <AnimatePresence>
        {isOpen && <ItemInspector item={item} actions={actions} onClose={() => onOpenChange(null)} placement="right" />}
      </AnimatePresence>
    </>
  )
  // Relics react while the score is added (P14): a stable hook for the
  // reveal to find the icon, and the bounce itself.
  if (item.kind === 'relic') {
    return (
      <TriggerPulse pulse={pulse} data-relic-id={item.id}>
        {body}
      </TriggerPulse>
    )
  }
  return <div className="relative">{body}</div>
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
export default function RoundHUD({ state, dispatch, armedConsumable, onArm }) {
  const { lang, t } = useLanguage()
  const [openKey, setOpenKey] = useState(null)
  const pulses = useTriggerPulses()
  const difficulty = state.difficulty ? localizeDifficulty(state.difficulty, lang) : null
  const hollow = Boolean(state.phase === 'rolling' && state.bossModifier?.effects?.sealAllRelics)
  const relicCap = selectors.relicCapFor(state)
  const consumableCap = selectors.consumableCapFor(state)
  const boss = Boolean(state.bossModifier)
  // The shop this round leads to (picked on the Road last shop).
  const node = state.map ? currentNode(state.map) : null
  const nextShop = node ? shopTypeById(node.type) : null
  // Blessing of Clarity: the other stops linked from the last shop.
  const rerouteTo =
    state.reroutes > 0 && node
      ? (nodeById(state.map, state.map.path[state.map.path.length - 2])?.next ?? []).filter((id) => id !== node.id)
      : []

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
        <span className="flex items-center gap-3">
          {/* Stardust (EXPANSION.md K2), once there is any. */}
          {state.stardust > 0 && (
            <span className="pixel-score inline-flex items-center gap-1 text-[11px] text-[#d6c4ff]" title={t('elementa.hud.stardust')}>
              <PixelIcon name="glimmer" size={10} color="#d6c4ff" hi="#ffffff" />
              {state.stardust}
            </span>
          )}
          <ShardCount value={state.shards} />
        </span>
      </div>

      {nextShop && (
        <div className="el-well flex items-center gap-3 px-3 py-2" title={nextShop.blurb[lang]}>
          <KeeperSprite id={nextShop.keeper} size={28} />
          <span className="flex flex-col leading-tight">
            <span className="el-label">{t('elementa.hud.nextStop')}</span>
            <span className="text-base" style={{ color: nextShop.color }}>
              {nextShop.name[lang]}
            </span>
          </span>
        </div>
      )}

      {/* Blessing of Clarity: swap the stop this round leads to. */}
      {nextShop && state.reroutes > 0 && state.phase === 'rolling' && rerouteTo.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-sm text-[var(--text-mute)]">{t('elementa.hud.rerouteHint').replace('{n}', state.reroutes)}</span>
          <div className="flex flex-wrap gap-2">
            {rerouteTo.map((id) => {
                const type = shopTypeById(nodeById(state.map, id).type)
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => dispatch({ type: 'REROUTE', nodeId: id })}
                    className="el-btn el-btn--sm"
                    title={type.blurb[lang]}
                  >
                    <KeeperSprite id={type.keeper} size={16} />
                    <span style={{ color: type.color }}>{type.name[lang]}</span>
                  </button>
                )
              })}
          </div>
        </div>
      )}

      <BoonsList state={state} icons />

      {/* The Hollow (EXPANSION.md H2) seals every relic and consumable. */}
      {hollow && (
        <p className="el-panel px-3 py-2 text-sm text-[#cdb4ff]" style={{ '--edge': '#6b5a8a' }}>
          {t('elementa.hud.sealedAll')}
        </p>
      )}

      <section className="flex flex-col gap-3" style={hollow ? { opacity: 0.4, filter: 'grayscale(0.7)' } : undefined}>
        <h3 className="el-label">
          {t('elementa.shop.relics')} {state.relics.length}/{relicCap}
        </h3>
        <div className="flex flex-wrap gap-3 p-1">
          {state.relics.map((r) => (
            <MiniIcon
              key={r.id}
              itemKey={`relic-${r.id}`}
              item={relicDescriptor(r, lang)}
              pulse={pulses[`relic:${r.id}`]}
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
          {t('elementa.shop.consumables')} {state.consumables.length}/{consumableCap}
        </h3>
        <div className="flex flex-wrap gap-3 p-1">
          {state.consumables.map((c) => {
            const shopOnly = selectors.shopOnlyConsumables.includes(c.type)
            const usable = dispatch && state.phase === 'rolling' && !shopOnly && !hollow
            return (
              <MiniIcon
                key={c.instanceId}
                itemKey={`consumable-${c.instanceId}`}
                item={consumableDescriptor(c, lang)}
                armed={armedConsumable === c.instanceId}
                actions={
                  dispatch && state.phase === 'rolling'
                    ? [
                        {
                          label: shopOnly ? t('elementa.hud.shopOnly') : t('elementa.shop.apply'),
                          disabled: !usable,
                          onClick: () => {
                            if (c.target === 'self') dispatch({ type: 'APPLY_CONSUMABLE', instanceId: c.instanceId, dieId: null })
                            else onArm?.(c.instanceId)
                            setOpenKey(null)
                          },
                        },
                      ]
                    : undefined
                }
                openKey={openKey}
                onOpenChange={setOpenKey}
              />
            )
          })}
          {Array.from({ length: Math.max(0, consumableCap - state.consumables.length) }).map((_, i) => (
            <EmptySlot key={i} />
          ))}
        </div>
      </section>
    </aside>
  )
}
