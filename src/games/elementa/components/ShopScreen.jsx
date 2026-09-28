import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ELEMENTS } from '../data/elements.js'
import { relicById } from '../data/relics.js'
import { consumableById } from '../data/consumables.js'
import { relicDescriptor, consumableDescriptor, dieDescriptor, forgeDescriptor } from '../data/itemDescriptors.js'
import { localize, ELEMENTS_ES, localizeDifficulty } from '../data/i18n.js'
import { selectors } from '../engine/gameReducer.js'
import { thresholdForRound } from '../engine/scoring.js'
import { useLanguage } from '../../../i18n/LanguageContext.jsx'
import RoundResult from './RoundResult.jsx'
import ItemIcon from './ItemIcon.jsx'
import ItemInspector from './ItemInspector.jsx'
import PriceTag from './PriceTag.jsx'
import PixelIcon from './PixelIcon.jsx'
import { Hearts, ShardCount, Stat } from './RoundHUD.jsx'
import { playCoin, playClick } from '../utils/sound.js'

/**
 * One shop/inventory slot: a persistent price tag (if `cost` is given), the
 * icon itself, a caption, and its own anchored inspector popover. Only one
 * slot's popover is open at a time (`openKey`/`onOpenChange`, lifted to
 * ShopScreen) so opening a new one closes whatever was open.
 */
function IconSlot({ itemKey, item, caption, cost, actions, armed, onIconClick, openKey, onOpenChange, size = 72, placement, showCaption = true, affordable = true }) {
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

function OfferShelf({ title, hint, warning, children, tut }) {
  return (
    <section data-tut={tut} className="el-panel--dark el-panel flex w-full flex-col items-center gap-5 px-5 pb-6 pt-4">
      <div className="flex w-full items-baseline justify-between gap-3">
        <h3 className="pixel-heading text-[10px] text-[var(--gold-hi)]">{title}</h3>
        {hint && <span className="text-sm text-[var(--text-mute)]">{hint}</span>}
      </div>
      {warning && <p className="text-base text-[var(--gold-2)]">{warning}</p>}
      <div className="flex flex-wrap justify-center gap-x-8 gap-y-12 pt-7">{children}</div>
    </section>
  )
}

/** Hanging wooden shop sign: two ropes and a plank, CSS only for now. */
function ShopBanner({ label }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex w-44 justify-between px-6">
        <span className="h-5 w-[3px] bg-[var(--wood-0)]" />
        <span className="h-5 w-[3px] bg-[var(--wood-0)]" />
      </div>
      <div className="el-panel--wood el-panel px-12 py-4">
        <span className="pixel-heading text-xl tracking-widest text-[var(--gold-hi)]">{label}</span>
      </div>
    </div>
  )
}

export default function ShopScreen({ state, dispatch }) {
  const { t, lang } = useLanguage()
  const shop = state.shop
  const [openKey, setOpenKey] = useState(null)
  const [armedConsumable, setArmedConsumable] = useState(null)

  // Escape cancels an armed consumable before it reaches the pause menu.
  useEffect(() => {
    if (!armedConsumable) return
    function onKey(e) {
      if (e.key !== 'Escape') return
      e.stopImmediatePropagation()
      setArmedConsumable(null)
    }
    window.addEventListener('keydown', onKey, { capture: true })
    return () => window.removeEventListener('keydown', onKey, { capture: true })
  }, [armedConsumable])

  if (!shop) return null

  const shardsAbbr = t('elementa.shop.shardsAbbr')
  const buyLabel = (cost) => `${t('elementa.shop.buy')} ${cost}`
  const sellLabel = (cost) => `${t('elementa.shop.sell')} +${cost}`
  const forgeLabel = (cost) => `${t('elementa.shop.forge')} ${cost}`

  const rerollShopCost = selectors.rerollShopOffersCost(state)
  const nextTarget = thresholdForRound(state.round + 1, state.difficulty)
  const difficulty = localizeDifficulty(state.difficulty, lang)

  const relicCap = state.difficulty.relicCap
  const relicsFull = state.relics.length >= relicCap
  const consumablesFull = state.consumables.length >= selectors.maxConsumables
  const diceCap = selectors.maxDiceFor(state.difficulty)
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
          <SlotGrid capacity={diceCap}>
            {state.dice.map((die) => {
              const sellVal = selectors.sellValueForDie(die, selectors.isFusionElement(die.elementId))
              const elementName = localize(lang, ELEMENTS[die.elementId].name, ELEMENTS_ES, die.elementId, 'name')
              const item = { ...dieDescriptor(die.elementId, lang), name: `${elementName} d${die.sides}` }
              return (
                <IconSlot
                  key={die.id}
                  itemKey={`die-${die.id}`}
                  item={item}
                  size={48}
                  showCaption={false}
                  placement="right"
                  armed={Boolean(armedConsumable)}
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
                      : undefined
                  }
                  openKey={openKey}
                  onOpenChange={setOpenKey}
                />
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
          cap={selectors.maxConsumables}
        >
          <SlotGrid capacity={selectors.maxConsumables}>
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
      </aside>

      {/* Center: everything for sale. */}
      <div className="flex flex-col items-center gap-6">
        <ShopBanner label={t('elementa.shop.shop')} />

        <AnimatePresence>
          {armedConsumable && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="el-panel flex items-center gap-4 px-4 py-2"
              style={{ '--edge': 'var(--gold-1)' }}
            >
              <span className="text-base text-[var(--gold-hi)]">{t('elementa.shop.chooseDieToApply')}</span>
              <button type="button" onClick={() => setArmedConsumable(null)} className="el-btn el-btn--sm">
                {t('elementa.shop.cancel')}
                <span className="el-key">Esc</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <OfferShelf
          tut="offers"
          title={t('elementa.shop.buyADie')}
          warning={diceFull ? t('elementa.shop.dicePoolFull') : null}
        >
          {shop.buyableElements.map((elementId) => {
            const cost = selectors.newDieCost(elementId, state.dice, state.relics)
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

        <OfferShelf
          title={t('elementa.shop.relicsAndItems')}
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
              const cost = selectors.relicCost(relic, state.relics)
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
            const cost = selectors.consumableCost(def, state.relics)
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
                    disabled: state.shards < cost || consumablesFull,
                    onClick: () => buy({ type: 'BUY_CONSUMABLE', consumableId: offer.id }),
                  },
                ]}
                openKey={openKey}
                onOpenChange={setOpenKey}
              />
            )
          })}
        </OfferShelf>
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
          <Stat label={t('elementa.shop.nextTarget')} accent="var(--gold-1)">
            {nextTarget}
          </Stat>
        </div>

        <button
          type="button"
          onClick={() => {
            playClick()
            dispatch({ type: 'NEXT_ROUND' })
          }}
          data-tut="next"
          className="el-btn el-btn--green el-btn--lg w-full"
        >
          {t('elementa.shop.nextRound')}
        </button>
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
            {rerollShopCost}
          </span>
        </button>
      </aside>
    </div>
  )
}
