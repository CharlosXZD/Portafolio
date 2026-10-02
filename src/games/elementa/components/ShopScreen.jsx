import { Children, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ELEMENTS } from '../data/elements.js'
import { relicById } from '../data/relics.js'
import { consumableById } from '../data/consumables.js'
import { relicDescriptor, consumableDescriptor, dieDescriptor, forgeDescriptor } from '../data/itemDescriptors.js'
import { localize, ELEMENTS_ES, localizeDifficulty, localizeBossModifier } from '../data/i18n.js'
import { selectors } from '../engine/gameReducer.js'
import { thresholdForRound } from '../engine/scoring.js'
import { useLanguage } from '../../../i18n/LanguageContext.jsx'
import RoundResult from './RoundResult.jsx'
import ItemIcon from './ItemIcon.jsx'
import ItemInspector from './ItemInspector.jsx'
import PriceTag from './PriceTag.jsx'
import PixelIcon from './PixelIcon.jsx'
import { Hearts, ShardCount, Stat } from './RoundHUD.jsx'
import KeeperSprite from './KeeperSprite.jsx'
import RoadMap from './RoadMap.jsx'
import { playCoin, playClick, playSuccess } from '../utils/sound.js'
import { useGameSettings } from '../utils/gameSettingsContext.jsx'
import DieToken from './DieToken.jsx'
import BoonsList from './BoonsList.jsx'
import { shopTypeById, dealById, blessingById, PROPHECY } from '../data/shops.js'
import { nextChoices, nodeById } from '../engine/map.js'
import { nextTier } from '../data/diceTiers.js'
import { visitKeeper, lineText } from '../utils/keepers.js'
import { KEEPERS } from '../data/keepers.js'

/**
 * One shop/inventory slot: a persistent price tag (if `cost` is given), the
 * icon itself, a caption, and its own anchored inspector popover. Only one
 * slot's popover is open at a time (`openKey`/`onOpenChange`, lifted to
 * ShopScreen) so opening a new one closes whatever was open.
 */
function IconSlot({ itemKey, item, caption, cost, actions, armed, onIconClick, openKey, onOpenChange, size = 72, placement, showCaption = true, affordable = true, renderIcon }) {
  const isOpen = openKey === itemKey

  function handleClick() {
    if (onIconClick) {
      onIconClick()
      return
    }
    onOpenChange(isOpen ? null : itemKey)
  }

  return (
    <div className="relative flex flex-col items-center gap-2" style={{ width: showCaption ? size + 24 : size }}>
      <PriceTag cost={cost} affordable={affordable} />
      {renderIcon ? renderIcon(handleClick) : (
      <ItemIcon
        size={size}
        glyph={item.glyph}
        icon={item.icon} sprite={item.sprite}
        color={item.color}
        rarity={item.rarity}
        armed={armed}
        title={item.name}
        onClick={handleClick}
      />
      )}
      {showCaption && (
        <span className="text-center text-sm leading-tight text-[var(--text-dim)]">{caption ?? item.name}</span>
      )}
      <AnimatePresence>
        {isOpen && actions && (
          <ItemInspector item={{ ...item, cost }} actions={actions} placement={placement} onClose={() => onOpenChange(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}

/** Exactly `capacity` slots: real ones first, then empty wells, so the
 * remaining room is visible at a glance. */
function SlotGrid({ capacity, children, size = 48 }) {
  const filled = Array.isArray(children) ? children.filter(Boolean) : [children].filter(Boolean)
  const empties = Math.max(0, capacity - filled.length)
  return (
    <div className="flex flex-wrap gap-3 p-1">
      {filled}
      {Array.from({ length: empties }).map((_, i) => (
        <div key={`empty-${i}`} className="el-well shrink-0" style={{ width: size, height: size }} />
      ))}
    </div>
  )
}

function InventorySection({ label, count, cap, children }) {
  const { t } = useLanguage()
  return (
    <section className="flex flex-col gap-3">
      <h3 className="el-label flex items-center justify-between">
        <span>{label}</span>
        <span className={count >= cap ? 'text-[var(--gold-2)]' : ''}>
          {count >= cap ? t('elementa.shop.full') : `${count}/${cap}`}
        </span>
      </h3>
      {children}
    </section>
  )
}

// Offers deal in like cards: re-keyed on every restock (reroll, Loom of
// Fate), so a restock visibly shuffles the shelf instead of just swapping.
const shelfVariants = { show: { transition: { staggerChildren: 0.06 } } }
const cardVariants = {
  hidden: { opacity: 0, y: -14, rotateY: 90, scale: 0.9 },
  show: { opacity: 1, y: 0, rotateY: 0, scale: 1, transition: { type: 'spring', bounce: 0.35, duration: 0.45 } },
}

function OfferShelf({ title, hint, warning, children, tut, shuffleKey }) {
  const { reducedMotion } = useGameSettings()
  return (
    <section data-tut={tut} className="el-panel--dark el-panel flex w-full flex-col items-center gap-5 px-5 pb-6 pt-4">
      <div className="flex w-full items-baseline justify-between gap-3">
        <h3 className="pixel-heading text-[10px] text-[var(--gold-hi)]">{title}</h3>
        {hint && <span className="text-sm text-[var(--text-mute)]">{hint}</span>}
      </div>
      {warning && <p className="text-base text-[var(--gold-2)]">{warning}</p>}
      <motion.div
        key={shuffleKey}
        variants={shelfVariants}
        initial={reducedMotion || shuffleKey == null ? false : 'hidden'}
        animate="show"
        className="flex flex-wrap justify-center gap-x-8 gap-y-12 pt-7"
        style={{ perspective: 600 }}
      >
        {shuffleKey == null
          ? children
          : Children.toArray(children).map((c) => (
              <motion.div key={c.key} variants={cardVariants}>
                {c}
              </motion.div>
            ))}
      </motion.div>
    </section>
  )
}

/** Hanging wooden shop sign: two ropes and a plank, CSS only for now. */
function ShopBanner({ label, color }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex w-44 justify-between px-6">
        <span className="h-5 w-[3px] bg-[var(--wood-0)]" />
        <span className="h-5 w-[3px] bg-[var(--wood-0)]" />
      </div>
      <div className="el-panel--wood el-panel px-12 py-4" style={color ? { '--edge': color } : undefined}>
        <span className="pixel-heading text-xl tracking-widest" style={{ color: color ?? 'var(--gold-hi)' }}>
          {label}
        </span>
      </div>
    </div>
  )
}

/** The shop's keeper and what they say this visit (they remember you). */
function KeeperGreeting({ state, type }) {
  const { t, lang } = useLanguage()
  const [visit, setVisit] = useState(null)
  useEffect(() => {
    // The camp isn't a real visit: Tobb just says his camp line.
    if (type.camp) {
      setVisit(null)
      return
    }
    setVisit(
      visitKeeper(state.activeSlot, type.keeper, `${state.seed}-${state.round}-${type.id}`, {
        afterBoss: Boolean(state.shop?.afterBoss),
        lowLives: state.lives === 1,
      }),
    )
    // One greeting per shop visit.
  }, [state.activeSlot, state.seed, state.round, type.id])
  if (type.camp) return <CampGreeting state={state} type={type} />
  if (!visit) return null
  const { keeper, line, memory } = visit
  return (
    <div className="flex w-full max-w-2xl items-end gap-4">
      <div className="flex shrink-0 flex-col items-center gap-1">
        <KeeperSprite id={keeper.id} size={72} />
        <span className="pixel-score text-[8px] text-[var(--gold-hi)]">{keeper.name[lang]}</span>
      </div>
      <motion.div
        key={`${line.kind}-${line.index ?? ''}`}
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        className="el-panel relative mb-4 flex-1 px-4 py-3 text-left"
        style={{ '--edge': type.color }}
      >
        <p className="text-base leading-snug text-[var(--text)]">{lineText(keeper, line, lang)}</p>
        <div className="mt-2 flex items-center justify-between gap-3 text-sm text-[var(--text-mute)]">
          <span>{keeper.title[lang]}</span>
          <span>
            {line.kind === 'lore' && (
              <span className="pixel-score mr-3 text-[7px] text-[var(--arcane-hi)]">{t('elementa.keepers.newLore')}</span>
            )}
            {t('elementa.keepers.visits').replace('{n}', memory.visits)}
          </span>
        </div>
      </motion.div>
    </div>
  )
}

/** Tobb at the safety camp: his line and the Shards he hands over. */
function CampGreeting({ state, type }) {
  const { t, lang } = useLanguage()
  const keeper = KEEPERS[type.keeper]
  return (
    <div className="flex w-full max-w-2xl items-end gap-4">
      <div className="flex shrink-0 flex-col items-center gap-1">
        <KeeperSprite id={keeper.id} size={72} />
        <span className="pixel-score text-[8px] text-[var(--gold-hi)]">{keeper.name[lang]}</span>
      </div>
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        className="el-panel relative mb-4 flex-1 px-4 py-3 text-left"
        style={{ '--edge': type.color }}
      >
        <p className="text-base leading-snug text-[var(--text)]">{type.line[lang]}</p>
        <div className="mt-2 flex items-center justify-between gap-3 text-sm text-[var(--text-mute)]">
          <span>{keeper.title[lang]}</span>
          {state.shop.campPay > 0 && (
            <span className="inline-flex items-center gap-1.5 text-[var(--gold-1)]">
              <PixelIcon name="shard" size={10} />
              {t('elementa.camp.payout').replace('{n}', state.shop.campPay)}
            </span>
          )}
        </div>
      </motion.div>
    </div>
  )
}

/** A card for a one-off deal or blessing: title, body, one button. */
// A burst of pixel sparks flying out of a card when it is taken.
const SPARKS = Array.from({ length: 12 }, (_, i) => {
  const a = (i / 12) * Math.PI * 2
  return { x: Math.cos(a) * (70 + (i % 3) * 18), y: Math.sin(a) * (60 + (i % 2) * 22) }
})

function OfferCard({ title, body, color, button, disabled, done, onClick, art }) {
  const { reducedMotion } = useGameSettings()
  const taken = done === true
  return (
    <motion.div
      animate={taken && !reducedMotion ? { scale: [1, 1.1, 1], y: [0, -10, 0] } : { scale: 1 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      className="el-panel relative flex w-56 flex-col items-center gap-3 p-4 text-center"
      style={{
        '--edge': color,
        opacity: done === false ? 0.45 : 1,
        filter: taken ? `drop-shadow(0 0 16px ${color})` : undefined,
      }}
    >
      {taken && !reducedMotion && (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
          {SPARKS.map((p, i) => (
            <motion.span
              key={i}
              className="absolute block h-2 w-2"
              style={{ background: i % 2 ? color : '#ffe8a3' }}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{ x: p.x, y: p.y, opacity: 0, scale: 0.4 }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: (i % 4) * 0.03 }}
            />
          ))}
        </span>
      )}
      {art}
      <span className="pixel-heading text-[9px]" style={{ color }}>
        {title}
      </span>
      <span className="text-base leading-snug text-[var(--text-dim)]">{body}</span>
      <button type="button" disabled={disabled} onClick={onClick} className="el-btn el-btn--sm mt-auto">
        {button}
      </button>
    </motion.div>
  )
}

export default function ShopScreen({ state, dispatch }) {
  const { t, lang } = useLanguage()
  const shop = state.shop
  const [openKey, setOpenKey] = useState(null)
  const [armedConsumable, setArmedConsumable] = useState(null)
  // A shop consumable bought with "Buy & use" that still needs a die.
  const [armedPurchase, setArmedPurchase] = useState(null)

  // Escape cancels an armed consumable before it reaches the pause menu.
  useEffect(() => {
    if (!armedConsumable && !armedPurchase) return
    function onKey(e) {
      if (e.key !== 'Escape') return
      e.stopImmediatePropagation()
      setArmedConsumable(null)
      setArmedPurchase(null)
    }
    window.addEventListener('keydown', onKey, { capture: true })
    return () => window.removeEventListener('keydown', onKey, { capture: true })
  }, [armedConsumable, armedPurchase])

  if (!shop) return null

  const type = shopTypeById(shop.type)
  const choices = state.map ? nextChoices(state.map) : []
  const pending = state.map ? nodeById(state.map, state.map.pendingId) : null
  const finalShop = state.round >= selectors.winRound && !state.endless
  // The camp sits off the Road: no stop to pick, leaving retries the round.
  const camp = Boolean(type.camp)
  const needsPick = !camp && !finalShop && choices.length > 1 && !pending

  const shardsAbbr = t('elementa.shop.shardsAbbr')
  const buyLabel = (cost) => `${t('elementa.shop.buy')} ${cost}`
  const sellLabel = (cost) => `${t('elementa.shop.sell')} +${cost}`
  const forgeLabel = (cost) => `${t('elementa.shop.forge')} ${cost}`

  const rerollShopCost = selectors.rerollShopOffersCost(state)
  const nextTarget = thresholdForRound(state.round + 1, state.difficulty)
  const difficulty = localizeDifficulty(state.difficulty, lang)

  const relicCap = selectors.relicCapFor(state)
  const consumableCap = selectors.consumableCapFor(state)
  const relicsFull = state.relics.length >= relicCap
  const consumablesFull = state.consumables.length >= consumableCap
  const diceCap = selectors.maxDiceFor(state)
  const diceFull = state.dice.length >= diceCap
  const forgeable = selectors.forgeableRecipes(state).filter((r) => r.canForge)

  function buy(action) {
    playCoin()
    dispatch(action)
    setOpenKey(null)
  }

  return (
    <div className="mx-auto grid w-full max-w-[1600px] grid-cols-1 gap-6 pt-12 lg:grid-cols-[260px_1fr_240px] lg:items-start lg:gap-8">
      {/* Left: what you own. */}
      <aside data-tut="inventory" className="el-panel flex flex-col gap-6 p-4">
        <RoundResult state={state} compact />

        <InventorySection label={t('elementa.shop.yourDice')} count={state.dice.length} cap={diceCap}>
          <p className="-mt-1 text-sm text-[var(--text-mute)]">{t('elementa.shop.dragToReorder')}</p>
          <SlotGrid capacity={diceCap}>
            {state.dice.map((die) => {
              const sellVal = selectors.sellValueForDie(die, selectors.isFusionElement(die.elementId))
              const elementName = localize(lang, ELEMENTS[die.elementId].name, ELEMENTS_ES, die.elementId, 'name')
              const base = dieDescriptor(die.elementId, lang)
              const item = {
                ...base,
                name: `${elementName} d${die.sides}${die.bonus ? ` +${die.bonus}` : ''}`,
                description: die.bonus
                  ? `${base.description} ${t('elementa.shop.dieBonus').replace('{n}', die.bonus)}`
                  : base.description,
              }
              return (
                <div
                  key={die.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', die.id)
                    e.dataTransfer.effectAllowed = 'move'
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault()
                    const from = e.dataTransfer.getData('text/plain')
                    if (!from || from === die.id) return
                    const ids = state.dice.map((d) => d.id).filter((id) => id !== from)
                    const at = ids.indexOf(die.id)
                    const movingRight = state.dice.findIndex((d) => d.id === from) < state.dice.findIndex((d) => d.id === die.id)
                    ids.splice(movingRight ? at + 1 : at, 0, from)
                    playClick()
                    dispatch({ type: 'REORDER_DICE', order: ids })
                  }}
                  className="cursor-grab active:cursor-grabbing"
                >
                <IconSlot
                  renderIcon={(onClick) => (
                    <DieToken
                      die={die}
                      size={48}
                      onClick={onClick}
                      title={item.name}
                      ringColor={armedConsumable || armedPurchase ? '#ffd166' : null}
                    />
                  )}
                  itemKey={`die-${die.id}`}
                  item={item}
                  size={48}
                  showCaption={false}
                  placement="right"
                  armed={Boolean(armedConsumable || armedPurchase)}
                  actions={[
                    {
                      label: sellLabel(sellVal),
                      variant: 'danger',
                      disabled: state.dice.length <= 1,
                      onClick: () => dispatch({ type: 'SELL_DIE', dieId: die.id }),
                    },
                  ]}
                  onIconClick={
                    armedConsumable
                      ? () => {
                          playClick()
                          dispatch({ type: 'APPLY_CONSUMABLE', instanceId: armedConsumable, dieId: die.id })
                          setArmedConsumable(null)
                        }
                      : armedPurchase
                        ? () => {
                            playCoin()
                            dispatch({ type: 'BUY_AND_APPLY_CONSUMABLE', consumableId: armedPurchase, dieId: die.id })
                            setArmedPurchase(null)
                          }
                        : undefined
                  }
                  openKey={openKey}
                  onOpenChange={setOpenKey}
                />
                </div>
              )
            })}
          </SlotGrid>
        </InventorySection>

        <InventorySection label={t('elementa.shop.yourRelics')} count={state.relics.length} cap={relicCap}>
          <SlotGrid capacity={relicCap}>
            {state.relics.map((relic) => (
              <IconSlot
                key={relic.id}
                itemKey={`ownedrelic-${relic.id}`}
                item={relicDescriptor(relic, lang)}
                size={48}
                showCaption={false}
                placement="right"
                actions={[
                  {
                    label: sellLabel(selectors.sellValueForRelic(relic)),
                    variant: 'danger',
                    onClick: () => dispatch({ type: 'SELL_RELIC', relicId: relic.id }),
                  },
                ]}
                openKey={openKey}
                onOpenChange={setOpenKey}
              />
            ))}
          </SlotGrid>
        </InventorySection>

        <InventorySection
          label={t('elementa.shop.yourConsumables')}
          count={state.consumables.length}
          cap={consumableCap}
        >
          <SlotGrid capacity={consumableCap}>
            {state.consumables.map((item) => (
              <IconSlot
                key={item.instanceId}
                itemKey={`ownedconsumable-${item.instanceId}`}
                item={consumableDescriptor(item, lang)}
                size={48}
                showCaption={false}
                placement="right"
                armed={armedConsumable === item.instanceId}
                actions={[
                  {
                    label: t('elementa.shop.apply'),
                    onClick: () => {
                      if (item.target === 'self') {
                        dispatch({ type: 'APPLY_CONSUMABLE', instanceId: item.instanceId, dieId: null })
                      } else {
                        setArmedConsumable(item.instanceId)
                      }
                    },
                  },
                  {
                    label: sellLabel(selectors.sellValueForConsumable(item)),
                    variant: 'danger',
                    onClick: () => dispatch({ type: 'SELL_CONSUMABLE', instanceId: item.instanceId }),
                  },
                ]}
                openKey={openKey}
                onOpenChange={setOpenKey}
              />
            ))}
          </SlotGrid>
        </InventorySection>

        <BoonsList state={state} icons />
      </aside>

      {/* Center: everything for sale. */}
      <div className="flex flex-col items-center gap-6">
        <ShopBanner label={type.name[lang]} color={type.color} />
        <KeeperGreeting state={state} type={type} />

        <AnimatePresence>
          {(armedConsumable || armedPurchase) && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="el-panel flex items-center gap-4 px-4 py-2"
              style={{ '--edge': 'var(--gold-1)' }}
            >
              <span className="text-base text-[var(--gold-hi)]">{t('elementa.shop.chooseDieToApply')}</span>
              <button
                type="button"
                onClick={() => {
                  setArmedConsumable(null)
                  setArmedPurchase(null)
                }}
                className="el-btn el-btn--sm"
              >
                {t('elementa.shop.cancel')}
                <span className="el-key">Esc</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {type.dice > 0 && (
        <OfferShelf
          tut="offers"
          shuffleKey={shop.restocks || 0}
          title={t('elementa.shop.buyADie')}
          warning={diceFull ? t('elementa.shop.dicePoolFull') : null}
        >
          {shop.buyableElements.map((elementId) => {
            const cost = selectors.newDieCost(elementId, state.dice, state.relics, shop)
            return (
              <IconSlot
                key={elementId}
                itemKey={`dieoffer-${elementId}`}
                item={dieDescriptor(elementId, lang)}
                cost={cost}
                affordable={state.shards >= cost}
                actions={[
                  {
                    label: buyLabel(cost),
                    disabled: state.shards < cost || diceFull,
                    onClick: () => buy({ type: 'BUY_DIE', elementId }),
                  },
                ]}
                openKey={openKey}
                onOpenChange={setOpenKey}
              />
            )
          })}
        </OfferShelf>
        )}

        {type.forge && forgeable.length === 0 && (
          <p className="text-center text-base text-[var(--text-mute)]">{t('elementa.shop.forgeNothing')}</p>
        )}

        {forgeable.length > 0 && (
          <OfferShelf tut="forge" title={t('elementa.shop.fusionForge')} hint={t('elementa.shop.fusionForgeHint')}>
            {forgeable.map((recipe) => (
              <IconSlot
                key={recipe.fusionElementId}
                itemKey={`forge-${recipe.fusionElementId}`}
                item={forgeDescriptor(recipe, lang)}
                cost={recipe.cost}
                affordable={state.shards >= recipe.cost}
                actions={[
                  {
                    label: forgeLabel(recipe.cost),
                    disabled: state.shards < recipe.cost,
                    onClick: () => buy({ type: 'FUSE_DICE', fusionElementId: recipe.fusionElementId }),
                  },
                ]}
                openKey={openKey}
                onOpenChange={setOpenKey}
              />
            ))}
          </OfferShelf>
        )}

        {type.upgrades && (
          <UpgradeShelf state={state} dispatch={dispatch} openKey={openKey} setOpenKey={setOpenKey} buy={buy} />
        )}

        {type.brew && <BrewShelf state={state} dispatch={dispatch} />}

        {shop.deals?.length > 0 && <DealShelf state={state} dispatch={dispatch} />}

        {shop.blessings?.length > 0 && <BlessingShelf state={state} dispatch={dispatch} />}

        {type.items > 0 && (
        <OfferShelf
          tut={type.dice > 0 ? undefined : 'offers'}
          shuffleKey={shop.restocks || 0}
          title={
            type.itemKinds.length === 1
              ? t(type.itemKinds[0] === 'relic' ? 'elementa.shop.relics' : 'elementa.shop.consumables')
              : t('elementa.shop.relicsAndItems')
          }
          warning={
            relicsFull ? t('elementa.shop.relicSlotsFull') : consumablesFull ? t('elementa.shop.consumablesFull') : null
          }
        >
          {shop.itemOffers.length === 0 && (
            <p className="text-base text-[var(--text-mute)]">{t('elementa.shop.nothingToOffer')}</p>
          )}
          {shop.itemOffers.map((offer) => {
            if (offer.kind === 'relic') {
              const relic = relicById(offer.id)
              const cost = selectors.relicCost(relic, state.relics, shop)
              return (
                <IconSlot
                  key={`relic-${offer.id}`}
                  itemKey={`relic-${offer.id}`}
                  item={relicDescriptor(relic, lang)}
                  cost={cost}
                  affordable={state.shards >= cost}
                  actions={[
                    {
                      label: buyLabel(cost),
                      disabled: state.shards < cost || relicsFull,
                      onClick: () => buy({ type: 'BUY_RELIC', relicId: offer.id }),
                    },
                  ]}
                  openKey={openKey}
                  onOpenChange={setOpenKey}
                />
              )
            }
            const def = consumableById(offer.id)
            const cost = selectors.consumableCost(def, state.relics, shop)
            return (
              <IconSlot
                key={`consumable-${offer.id}`}
                itemKey={`consumableoffer-${offer.id}`}
                item={consumableDescriptor(def, lang)}
                cost={cost}
                affordable={state.shards >= cost}
                actions={[
                  {
                    label: buyLabel(cost),
                    variant: 'neutral',
                    disabled: state.shards < cost || consumablesFull,
                    onClick: () => buy({ type: 'BUY_CONSUMABLE', consumableId: offer.id }),
                  },
                  {
                    // Use it on the spot: no inventory slot needed.
                    label: `${t('elementa.shop.buyAndUse')} ${cost}`,
                    disabled: state.shards < cost || (def.type === 'clone' && diceFull) || (def.type === 'spark' && shop.forgeOpen),
                    onClick: () => {
                      if (def.target === 'self') buy({ type: 'BUY_AND_APPLY_CONSUMABLE', consumableId: offer.id })
                      else setArmedPurchase(offer.id)
                    },
                  },
                ]}
                openKey={openKey}
                onOpenChange={setOpenKey}
              />
            )
          })}
        </OfferShelf>
        )}
      </div>

      {/* Right: run status plus the two round-transition actions. */}
      <aside className="el-panel flex flex-col gap-5 p-4 lg:sticky lg:top-16">
        <div className="flex items-center justify-between">
          <span className="pixel-score text-[8px] uppercase tracking-widest" style={{ color: difficulty.color }}>
            {difficulty.name}
          </span>
          <Hearts lives={state.lives} maxLives={state.maxLives} size={14} />
        </div>
        <div data-tut="shards" className="el-well flex items-center justify-between px-3 py-3">
          <span className="el-label">{t('elementa.hud.shards')}</span>
          <ShardCount value={state.shards} size={18} className="text-lg" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Stat label={t('elementa.shop.round')}>{state.round}</Stat>
          {/* At camp you retry this round, so show its target. */}
          <Stat label={camp ? t('elementa.hud.target') : t('elementa.shop.nextTarget')} accent="var(--gold-1)">
            {camp ? state.threshold : nextTarget}
          </Stat>
        </div>

        {!finalShop && !camp && state.map && (
          <div data-tut="map" className="flex flex-col items-center gap-2">
            <h3 className="el-label w-full">{t('elementa.map.roadAhead')}</h3>
            <RoadMap
              state={state}
              fromRound={state.round}
              toRound={state.round + 3}
              onPick={(nodeId) => {
                playClick()
                dispatch({ type: 'CHOOSE_PATH', nodeId })
              }}
              width={208}
              rowHeight={58}
              nodeSize={38}
            />
            <p className="min-h-[3rem] text-center text-sm leading-snug text-[var(--text-dim)]">
              {pending || choices.length === 1 ? (
                <>
                  <span style={{ color: shopTypeById((pending ?? choices[0]).type).color }}>
                    {shopTypeById((pending ?? choices[0]).type).name[lang]}
                  </span>
                  {': '}
                  {shopTypeById((pending ?? choices[0]).type).blurb[lang]}
                </>
              ) : (
                t('elementa.map.pickHint')
              )}
            </p>
          </div>
        )}

        <button
          type="button"
          disabled={needsPick}
          onClick={() => {
            playClick()
            dispatch({ type: 'NEXT_ROUND' })
          }}
          data-tut="next"
          className="el-btn el-btn--green el-btn--lg w-full"
        >
          {needsPick ? t('elementa.map.pickFirst') : camp ? t('elementa.roundResult.tryAgain') : t('elementa.shop.nextRound')}
        </button>
        {type.reroll && (
          <button
            type="button"
            onClick={() => {
              playCoin()
              dispatch({ type: 'REROLL_SHOP_OFFERS' })
            }}
            disabled={state.shards < rerollShopCost}
            className="el-btn el-btn--arcane w-full"
            title={`${rerollShopCost} ${shardsAbbr}`}
          >
            <PixelIcon name="reroll" size={12} />
            {t('elementa.shop.rerollOffers')}
            <span className="el-key inline-flex items-center gap-1">
              <PixelIcon name="shard" size={8} />
              {rerollShopCost}
            </span>
          </button>
        )}
        {type.reroll && (
          <p className="-mt-3 text-center text-sm" style={{ color: state.shards < rerollShopCost ? 'var(--bad)' : 'var(--text-mute)' }}>
            {(state.shards < rerollShopCost ? t('elementa.shop.rerollCantAfford') : t('elementa.shop.rerollCost'))
              .replace('{n}', rerollShopCost)
              .replace('{next}', rerollShopCost + 1)}
          </p>
        )}
      </aside>
    </div>
  )
}

/** Forge and Bazaar: pay to grow one of your dice a size. */
function UpgradeShelf({ state, dispatch, openKey, setOpenKey, buy }) {
  const { t, lang } = useLanguage()
  const growable = state.dice.filter((d) => nextTier(d.tierId))
  return (
    <OfferShelf title={t('elementa.shop.upgrades')} hint={t('elementa.shop.upgradesHint')}>
      {growable.length === 0 && <p className="text-base text-[var(--text-mute)]">{t('elementa.bossReward.diceMaxed')}</p>}
      {growable.map((die) => {
        const up = selectors.dieUpgradeCost(die, state.relics, state.shop)
        const item = dieDescriptor(die.elementId, lang)
        return (
          <IconSlot
            key={die.id}
            itemKey={`upgrade-${die.id}`}
            item={{ ...item, name: `${item.name} d${die.sides} > d${up.next.sides}` }}
            caption={`d${die.sides} > d${up.next.sides}`}
            renderIcon={(onClick) => <DieToken die={die} size={56} onClick={onClick} title={item.name} />}
            cost={up.cost}
            affordable={state.shards >= up.cost}
            size={56}
            actions={[
              {
                label: `${t('elementa.shop.upgrade')} ${up.cost}`,
                disabled: state.shards < up.cost,
                onClick: () => buy({ type: 'UPGRADE_DIE', dieId: die.id }),
              },
            ]}
            openKey={openKey}
            onOpenChange={setOpenKey}
          />
        )
      })}
    </OfferShelf>
  )
}

/** Alchemist and Bazaar: brew two consumables into a rarer one. */
function BrewShelf({ state, dispatch }) {
  const { t, lang } = useLanguage()
  const [picked, setPicked] = useState([])
  const cost = selectors.brewCost(state)
  const owned = state.consumables
  const valid = picked.filter((id) => owned.some((c) => c.instanceId === id))
  const last = state.shop.lastBrew ? consumableById(state.shop.lastBrew) : null
  return (
    <OfferShelf title={t('elementa.shop.brew')} hint={t('elementa.shop.brewHint')}>
      {owned.length < 2 ? (
        <p className="text-base text-[var(--text-mute)]">{t('elementa.shop.brewNeedTwo')}</p>
      ) : (
        <div className="flex flex-col items-center gap-5">
          <div className="flex flex-wrap justify-center gap-4">
            {owned.map((c) => {
              const on = valid.includes(c.instanceId)
              const item = consumableDescriptor(c, lang)
              return (
                <ItemIcon
                  key={c.instanceId}
                  {...item}
                  size={52}
                  armed={on}
                  title={item.name}
                  onClick={() => {
                    playClick()
                    setPicked((p) =>
                      p.includes(c.instanceId) ? p.filter((x) => x !== c.instanceId) : [...p.slice(-1), c.instanceId],
                    )
                  }}
                />
              )
            })}
          </div>
          <button
            type="button"
            disabled={valid.length !== 2 || state.shards < cost}
            onClick={() => {
              playCoin()
              dispatch({ type: 'BREW', a: valid[0], b: valid[1] })
              setPicked([])
            }}
            className="el-btn el-btn--arcane"
          >
            {t('elementa.shop.brewButton')}
            <span className="el-key">{cost}</span>
          </button>
        </div>
      )}
      {last && (
        <p className="w-full text-center text-base text-[var(--arcane-hi)]">
          {t('elementa.shop.brewed').replace('{item}', consumableDescriptor(last, lang).name)}
        </p>
      )}
    </OfferShelf>
  )
}

/** Black Market (and Bazaar): risky deals, take one. */
function DealShelf({ state, dispatch }) {
  const { t, lang } = useLanguage()
  const shop = state.shop
  return (
    <OfferShelf title={t('elementa.shop.deals')} hint={t('elementa.shop.dealsHint')}>
      {shop.deals.map((deal) => {
        const def = dealById(deal.id)
        let body = def.body[lang].replace('{shards}', deal.shards)
        let art = <KeeperSprite id="nix" size={40} />
        if (deal.relicId) {
          const item = relicDescriptor(relicById(deal.relicId), lang)
          body = `${body} (${item.name})`
          art = <ItemIcon {...item} size={44} static />
        }
        if (deal.elementId) {
          const item = dieDescriptor(deal.elementId, lang)
          body = `${body} (${item.name})`
          art = <ItemIcon {...item} size={44} static />
        }
        const taken = shop.dealTaken === deal.id
        const can = !shop.dealTaken && selectors.dealAvailable(state, deal)
        return (
          <OfferCard
            key={deal.id}
            title={def.name[lang]}
            body={body}
            color="#8a5cff"
            art={art}
            done={shop.dealTaken ? taken : undefined}
            disabled={!can}
            button={
              taken
                ? t('elementa.shop.dealTaken')
                : can || shop.dealTaken
                  ? t('elementa.shop.takeDeal')
                  : t('elementa.shop.cantAfford')
            }
            onClick={() => {
              playSuccess()
              dispatch({ type: 'TAKE_DEAL', dealId: deal.id })
            }}
          />
        )
      })}
    </OfferShelf>
  )
}

/** Shrine: one free blessing, or a prophecy of the next boss. */
function BlessingShelf({ state, dispatch }) {
  const { t, lang } = useLanguage()
  const shop = state.shop
  const bossRound = selectors.nextBossRound(state)
  const prophecy = state.map?.prophecy
  const cards = [
    ...shop.blessings.map((id) => {
      const def = blessingById(id)
      return {
        id,
        title: def.name[lang],
        body: def.body[lang],
        art: <PixelIcon name={def.element} size={32} />,
        available: selectors.blessingAvailable(state, id),
      }
    }),
    {
      id: 'prophecy',
      title: PROPHECY.name[lang],
      body: PROPHECY.body[lang].replace('{round}', bossRound),
      art: <KeeperSprite id="aeris" size={40} />,
      available: Boolean(bossRound),
    },
  ]
  return (
    <OfferShelf title={t('elementa.shop.blessings')} hint={t('elementa.shop.blessingsHint')}>
      {cards.map((c) => {
        const taken = shop.blessingTaken === c.id
        return (
          <OfferCard
            key={c.id}
            title={c.title}
            body={c.body}
            color="#9fd8ff"
            art={c.art}
            done={shop.blessingTaken ? taken : undefined}
            disabled={Boolean(shop.blessingTaken) || !c.available}
            button={taken ? t('elementa.shop.blessed') : t('elementa.shop.receive')}
            onClick={() => {
              playSuccess()
              dispatch({ type: 'TAKE_BLESSING', blessingId: c.id })
            }}
          />
        )
      })}
      {shop.blessingTaken === 'prophecy' && prophecy && (
        <p className="w-full text-center text-base text-[var(--arcane-hi)]">
          {t('elementa.shop.prophecySays')
            .replace('{round}', prophecy.round)
            .replace('{boss}', localizeBossModifier(prophecy.boss, lang).name)}
        </p>
      )}
    </OfferShelf>
  )
}
