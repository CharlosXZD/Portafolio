import { Children, createContext, useContext, useEffect, useRef, useState } from 'react'
import { compactNumber } from '../utils/formatNumber.js'
import { SIGIL_FACES } from '../data/sigils.js'
import { AnimatePresence, motion, useDragControls } from 'framer-motion'
import { ELEMENTS } from '../data/elements.js'
import { relicById } from '../data/relics.js'
import { consumableById } from '../data/consumables.js'
import { relicDescriptor, consumableDescriptor, dieDescriptor } from '../data/itemDescriptors.js'
import ForgePanel from './ForgePanel.jsx'
import { localize, ELEMENTS_ES, localizeDifficulty, localizeBossModifier } from '../data/i18n.js'
import { selectors } from '../engine/gameReducer.js'
import { thresholdForRound } from '../engine/scoring.js'
import { useLanguage } from '../../../i18n/LanguageContext.jsx'
import RoundResult from './RoundResult.jsx'
import ItemIcon from './ItemIcon.jsx'
import ItemInspector from './ItemInspector.jsx'
import Tooltip from './Tooltip.jsx'
import { DieHoverCard, DieFullModal } from './DieInfo.jsx'
import { useLongPress } from '../utils/useLongPress.js'
import PriceTag from './PriceTag.jsx'
import PixelIcon from './PixelIcon.jsx'
import { Hearts, ShardCount, Stat } from './RoundHUD.jsx'
import KeeperSprite from './KeeperSprite.jsx'
import ShopPortrait from './visuals/ShopPortrait.jsx'
import { useVisualEnv } from './visuals/VisualEnv.jsx'
import { BellPull, Board, Counter, Drawer, HangTag, Lever, Plaque, Pouch, Shelf, Signboard, Slate } from './visuals/scene/objects.jsx'
import { sceneVars } from './visuals/scene/materials.js'
import { emitRoom, eventForAction } from './visuals/room/roomBus.js'
import RoadMap from './RoadMap.jsx'
import { playCoin, playClick, playSuccess } from '../utils/sound.js'
import { installRoomSounds } from './visuals/room/roomSounds.js'
import { useGameSettings } from '../utils/gameSettingsContext.jsx'
import { juicyHover } from '../utils/motionPresets.js'
import DieToken from './DieToken.jsx'
import BoonsList from './BoonsList.jsx'
import { shopNameIn } from '../data/realm3.js'
import { mix } from '../utils/color.js'
import { ArbiterSays } from './ArbiterParts.jsx'
import { useArbiter } from '../utils/useArbiter.js'
import { shopTypeById, dealById, blessingById, PROPHECY, ATLAS_SERVICES, MOTE_STAGES, MOTE_FULL } from '../data/shops.js'
import BossAvatar from './BossAvatar.jsx'
import { bossById } from '../data/bossModifiers.js'
import { nextChoices, nodeById } from '../engine/map.js'
import { tierById } from '../data/diceTiers.js'
import { runesOf } from '../data/runes.js'
import { visitKeeper, lineText } from '../utils/keepers.js'
import { useInscribe } from './useInscribe.jsx'
import { KEEPERS } from '../data/keepers.js'

/**
 * One shop/inventory slot: a persistent price tag (if `cost` is given), the
 * icon itself, a caption, and its own anchored inspector popover. Only one
 * slot's popover is open at a time (`openKey`/`onOpenChange`, lifted to
 * ShopScreen) so opening a new one closes whatever was open.
 */
// Where a slot stands decides how it is drawn: on a wall shelf or on the counter it is an object with a hang-tag (VISUALS.md V4).
const ShelfCtx = createContext('plain')

function IconSlot({ itemKey, item, caption, cost, actions, armed, onIconClick, openKey, onOpenChange, size = 72, placement, showCaption = true, affordable = true, renderIcon, fresh = false }) {
  const isOpen = openKey === itemKey
  // An item that lands in the inventory after the shop is already open (just bought) plays the rarity reveal once.
  const [reveal] = useState(fresh)
  // Dice (and the dice a forge recipe makes) get the three levels of detail
  // (EXPANSION.md P5 to P9): hover for the basics, click for the short text,
  // click and hold (or right-click, or the Info button) for everything.
  const dieId = item.kind === 'die' || item.kind === 'forge' ? item.id : null
  const [fullOpen, setFullOpen] = useState(false)
  const longPress = useLongPress(
    () => {
      onOpenChange(null)
      setFullOpen(true)
    },
    { enabled: Boolean(dieId) },
  )

  function handleClick() {
    if (onIconClick) {
      onIconClick()
      return
    }
    onOpenChange(isOpen ? null : itemKey)
  }

  const icon = renderIcon ? renderIcon(handleClick) : (
    <ItemIcon
      size={size}
      glyph={item.glyph}
      icon={item.icon} sprite={item.sprite}
      itemId={item.itemId}
      modelMotion={cost != null ? 'turn' : 'hover'}
      reveal={reveal}
      color={item.color}
      rarity={item.rarity}
      armed={armed}
      title={item.name}
      onClick={handleClick}
    />
  )

  const place = useContext(ShelfCtx)
  const onObject = (place === 'shelf' || place === 'counter') && typeof cost === 'number'
  const iconNode = dieId ? (
    <Tooltip
      disabled={isOpen}
      content={<DieHoverCard elementId={dieId} sides={item.sides} bonus={item.bonus || 0} edition={item.edition} runes={item.runes} weights={item.weights} socket={item.socket} />}
    >
      {/* A press that turned into a hold must not also click. */}
      <span
        {...longPress.handlers}
        onClickCapture={(e) => {
          if (longPress.consumed()) {
            e.stopPropagation()
            e.preventDefault()
          }
        }}
      >
        {icon}
      </span>
    </Tooltip>
  ) : (
    icon
  )
  const overlays = (
    <>
      <AnimatePresence>
        {isOpen && actions && (
          <ItemInspector
            item={{
              ...item,
              cost,
              onInfo: dieId
                ? () => {
                    onOpenChange(null)
                    setFullOpen(true)
                  }
                : undefined,
            }}
            actions={actions}
            placement={placement}
            onClose={() => onOpenChange(null)}
          />
        )}
      </AnimatePresence>
      {fullOpen && (
        <DieFullModal elementId={dieId} sides={item.sides} bonus={item.bonus || 0} edition={item.edition} runes={item.runes} weights={item.weights} socket={item.socket} onClose={() => setFullOpen(false)} />
      )}
    </>
  )

  if (onObject) {
    // On a shelf or the counter: the item stands (on its plank), a tag with its name and price hangs under it.
    return (
      <div className={`slot slot--${place}`} onPointerEnter={() => emitRoom('hover')}>
        <div className="slot__item">{iconNode}</div>
        {place === 'shelf' && <div className="slot__plank" aria-hidden="true" />}
        <HangTag name={caption ?? item.name} cost={cost} affordable={affordable} />
        {overlays}
      </div>
    )
  }

  return (
    <div className="relative flex flex-col items-center gap-2" style={{ width: showCaption ? size + 24 : size }}>
      <PriceTag cost={cost} affordable={affordable} />
      {iconNode}
      {showCaption && (
        <span className="text-center text-sm leading-tight text-[var(--text-dim)]">{caption ?? item.name}</span>
      )}
      {overlays}
    </div>
  )
}

/** Exactly `capacity` slots: real ones first, then empty wells, so the
 * remaining room is visible at a glance. */
function SlotGrid({ capacity, children, size = 48 }) {
  const filled = Array.isArray(children) ? children.filter(Boolean) : [children].filter(Boolean)
  const empties = Math.max(0, capacity - filled.length)
  return (
    <div className="flex flex-wrap gap-2 p-1">
      {filled}
      {Array.from({ length: empties }).map((_, i) => (
        <div key={`empty-${i}`} className="el-well shrink-0" style={{ width: size, height: size }} />
      ))}
    </div>
  )
}

// The dice inventory's geometry (SlotGrid: 48px wells, 12px gaps, 4px
// padding), used to turn a pointer position into a slot while dragging.
const DIE_CELL = 48
const DIE_GAP = 8
const GRID_PAD = 4

/**
 * The dice inventory (EXPANSION.md E5): pick a die up with the pointer and
 * it lifts, tilts and follows you while the others slide aside; drop it to
 * reorder. Framer's Reorder only works on one axis, so the target slot is
 * computed from the pointer over this wrapping grid, and `layout` animates
 * everyone else into place.
 */
function DiceGrid({ dice, capacity, onReorder, renderDie }) {
  const gridRef = useRef(null)
  const [order, setOrder] = useState(null) // ids while a drag is live
  const orderRef = useRef(null)
  const draggedRef = useRef(false)
  const byId = new Map(dice.map((d) => [d.id, d]))
  const ids = order ?? dice.map((d) => d.id)

  function slotAt(point) {
    const box = gridRef.current?.getBoundingClientRect()
    if (!box) return null
    const step = DIE_CELL + DIE_GAP
    const cols = Math.max(1, Math.floor((box.width - GRID_PAD * 2 + DIE_GAP) / step))
    const col = Math.min(cols - 1, Math.max(0, Math.floor((point.x - box.left - GRID_PAD) / step)))
    const row = Math.max(0, Math.floor((point.y - box.top - GRID_PAD) / step))
    return Math.min(dice.length - 1, row * cols + col)
  }

  function update(next) {
    orderRef.current = next
    setOrder(next)
  }

  return (
    <div ref={gridRef} className="flex flex-wrap gap-2 p-1">
      {ids.map((id) => {
        const die = byId.get(id)
        if (!die) return null
        return (
          <DiceGridItem
            key={id}
            onStart={() => {
              draggedRef.current = true
              update(dice.map((d) => d.id))
            }}
            onMove={(point) => {
              const cur = orderRef.current
              const to = slotAt(point)
              if (!cur || to == null || cur.indexOf(id) === to) return
              const next = cur.filter((x) => x !== id)
              next.splice(to, 0, id)
              update(next)
            }}
            onEnd={() => {
              const cur = orderRef.current
              update(null)
              if (cur && cur.some((x, i) => x !== dice[i]?.id)) onReorder(cur)
              // Swallow the click that follows the drop.
              setTimeout(() => (draggedRef.current = false), 80)
            }}
          >
            {renderDie(die, () => draggedRef.current)}
          </DiceGridItem>
        )
      })}
      {Array.from({ length: Math.max(0, capacity - dice.length) }).map((_, i) => (
        <div key={`empty-${i}`} className="el-well shrink-0" style={{ width: DIE_CELL, height: DIE_CELL }} />
      ))}
    </div>
  )
}

/** One die in the grid: lifts and tilts while held, wobbles on hover. */
function DiceGridItem({ onStart, onMove, onEnd, children }) {
  const { reducedMotion } = useGameSettings()
  const controls = useDragControls()
  return (
    <motion.div
      layout={!reducedMotion}
      drag
      dragControls={controls}
      // Only the die itself picks it up, never its open inspector.
      dragListener={false}
      onPointerDown={(e) => {
        if (e.target instanceof Element && e.target.closest('[data-tut-inspector]')) return
        controls.start(e)
      }}
      dragSnapToOrigin
      dragElastic={0.12}
      dragMomentum={false}
      whileHover={juicyHover(reducedMotion)}
      whileDrag={
        reducedMotion ? { scale: 1.08 } : { scale: 1.18, rotate: 7, filter: 'drop-shadow(4px 8px 0 rgba(0,0,0,0.55))' }
      }
      onDragStart={onStart}
      // Framer reports page coordinates; the grid box is in viewport ones.
      onDrag={(_, info) => onMove({ x: info.point.x - window.scrollX, y: info.point.y - window.scrollY })}
      onDragEnd={onEnd}
      // Stacking lives in CSS, not in animated styles: above the others
      // while hovered, held, or showing its inspector.
      className="relative z-0 cursor-grab touch-none hover:z-40 active:z-50 active:cursor-grabbing has-[[data-tut-inspector]]:z-[45]"
    >
      {children}
    </motion.div>
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

function OfferShelf({ title, hint, warning, children, tut, shuffleKey, place = 'board' }) {
  const { reducedMotion } = useGameSettings()
  // A bought item leaves a gap on the shelf until the shop restocks (VISUALS.md V4.1).
  const kids = shuffleKey == null ? null : Children.toArray(children)
  const seen = useRef({ key: shuffleKey, keys: [] })
  if (kids) {
    if (seen.current.key !== shuffleKey) seen.current = { key: shuffleKey, keys: [] }
    for (const c of kids) if (!seen.current.keys.includes(c.key)) seen.current.keys.push(c.key)
  }
  const byKey = kids ? new Map(kids.map((c) => [c.key, c])) : null
  const slots = kids && place !== 'board' ? seen.current.keys.map((k) => byKey.get(k) ?? <div key={k} className="slot__gap" aria-hidden="true" />) : kids
  const body = (
    <ShelfCtx.Provider value={place === 'board' ? 'counter' : place}>
      <motion.div
        key={shuffleKey}
        variants={shelfVariants}
        initial={reducedMotion || shuffleKey == null ? false : 'hidden'}
        animate="show"
        className={place === 'counter' ? 'contents' : place === 'shelf' ? 'contents' : 'flex flex-wrap items-end justify-center gap-x-6 gap-y-8 pt-2'}
        style={place === 'board' ? { perspective: 600 } : undefined}
      >
        {shuffleKey == null
          ? children
          : slots.map((c) =>
              c.key != null && byKey.has(c.key) ? (
                <motion.div key={c.key} variants={cardVariants}>
                  {c}
                </motion.div>
              ) : (
                c
              ),
            )}
      </motion.div>
    </ShelfCtx.Provider>
  )
  if (place === 'counter') {
    return (
      <Counter data-tut={tut} plate={title} hint={hint} warning={warning}>
        {body}
      </Counter>
    )
  }
  if (place === 'shelf') {
    return (
      <div data-tut={tut} className="flex max-w-full flex-col items-center">
        <Shelf plate={title} warning={warning}>
          {body}
        </Shelf>
      </div>
    )
  }
  return (
    <Board data-tut={tut} title={title} hint={hint} warning={warning}>
      {body}
    </Board>
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

// Allegiance lines (B3, B1): Aeris reacts to your Nix pacts, Nix to your
// blessings, and both to a strong lean of the Accord (4 or more either way).
function allegianceContext(state, keeper) {
  const pacts = state.nixPacts || 0
  const accord = state.accord || 0
  // Past the door, Tobb, Aeris and Nix speak in their true forms (H6).
  if (state.realm === 'firmament' && KEEPERS[keeper]?.special?.firmament) return { mood: 'firmament' }
  const lean = accord >= 4 ? 'leanPrimordial' : accord <= -4 ? 'leanSplit' : null
  if (keeper === 'aeris') return { urgent: pacts === 1 ? 'strange' : pacts === 2 ? 'shadow' : null, mood: lean }
  if (keeper === 'nix') {
    const claimed = selectors.aerisGone(state) ? 'claimed' : null
    return { urgent: state.shop?.betrayal ? 'betrayal' : null, mood: claimed ?? lean ?? (pacts > 0 ? 'more' : null) }
  }
  return {}
}

/** The shop's keeper and what they say this visit (they remember you). */
// A failed buy or use: the keeper's grumble (the 'broke' room event, which also plays the fail sound: roomSounds.js).
function playFail() {
  emitRoom('broke')
}

function KeeperGreeting({ state, type, second = false }) {
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
        ...allegianceContext(state, type.keeper),
      }),
    )
    // One greeting per shop visit.
  }, [state.activeSlot, state.seed, state.round, type.id])
  if (type.camp) return <CampGreeting state={state} type={type} />
  if (!visit) return null
  const { keeper, line, memory } = visit
  return (
    <>
      <div className="stage__keeper" data-k={second ? '2' : '1'}>
        <ShopPortrait id={keeper.id} size={72} lineLength={lineText(keeper, line, lang).length} stage />
      </div>
      <motion.div
        key={`${line.kind}-${line.index ?? ''}`}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="stage__sign"
        data-k={second ? '2' : '1'}
      >
        <Signboard
          foot={
            <>
              <span>
                <b>{keeper.name[lang]}</b> · {keeper.title[lang]}
              </span>
              <span>
                {line.kind === 'lore' && <span className="pixel-score mr-3 text-[7px] text-[var(--arcane-hi)]">{t('elementa.keepers.newLore')}</span>}
                {t('elementa.keepers.visits').replace('{n}', memory.visits)}
              </span>
            </>
          }
        >
          <p className="obj-sign__text">{lineText(keeper, line, lang)}</p>
        </Signboard>
      </motion.div>
    </>
  )
}

/** Tobb at the safety camp: his line and the Shards he hands over. */
function CampGreeting({ state, type }) {
  const { t, lang } = useLanguage()
  const keeper = KEEPERS[type.keeper]
  return (
    <>
      <div className="stage__keeper" data-k="1">
        <ShopPortrait id={keeper.id} size={72} lineLength={type.line[lang].length} stage />
      </div>
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="stage__sign" data-k="1">
        <Signboard
          foot={
            <>
              <span>
                <b>{keeper.name[lang]}</b> · {keeper.title[lang]}
              </span>
              {state.shop.campPay > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <PixelIcon name="shard" size={10} />
                  {t('elementa.camp.payout').replace('{n}', state.shop.campPay)}
                </span>
              )}
            </>
          }
        >
          <p className="obj-sign__text">{type.line[lang]}</p>
        </Signboard>
      </motion.div>
    </>
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
      className="obj-scroll relative flex w-56 flex-col items-center gap-3 px-4 py-5 text-center"
      style={{
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
      <span className="pixel-heading text-[9px]" style={{ color: mix(color, '#120c1a', 0.78) }}>
        {title}
      </span>
      <span className="text-base leading-snug text-[var(--text-dim)]">{body}</span>
      <button type="button" disabled={disabled} onClick={onClick} className="el-btn el-btn--sm mt-auto">
        {button}
      </button>
    </motion.div>
  )
}

export default function ShopScreen({ state, dispatch: gameDispatch }) {
  const openedAt = useRef(Date.now())
  const { t, lang } = useLanguage()
  const { reducedMotion } = useGameSettings()
  // Reduced motion and the low-end tier both still the scene's loops (the sign's sway, the tags, the lever).
  const calm = reducedMotion || useVisualEnv().quality === 'low'
  useEffect(() => installRoomSounds(), [])
  // The popovers (the item inspector) are drawn in a portal outside the scene, so the shop's materials are
  // also set on the body while a shop is open: the inspector is then a parchment tag, not a dark box.
  const shopTypeId = state.shop?.type
  useEffect(() => {
    if (!shopTypeId) return
    const t0 = shopTypeById(shopTypeId)
    const vars = sceneVars(t0.id, t0.color)
    const body = document.body
    Object.entries(vars).forEach(([k, v]) => body.style.setProperty(k, v))
    body.classList.add('scene-open')
    return () => {
      Object.keys(vars).forEach((k) => body.style.removeProperty(k))
      body.classList.remove('scene-open')
    }
  }, [shopTypeId])
  // An Arbiter has a word at every realm 3 shop (Part S).
  const arbiterShop = useArbiter(state, 'shop')
  const shop = state.shop
  const [openKey, setOpenKey] = useState(null)
  // What the shop does tells the room (V3.8): a buy, a sale, a restock or leaving.
  const dispatch = (action) => {
    const event = eventForAction(action.type)
    if (event) emitRoom(event)
    gameDispatch(action)
  }
  // Opening an item's inspector is a pick.
  useEffect(() => {
    if (openKey) emitRoom('pick')
  }, [openKey])
  const [armedConsumable, setArmedConsumable] = useState(null)
  // A shop consumable bought with "Buy & use" that still needs a die.
  const [armedPurchase, setArmedPurchase] = useState(null)
  // Runes and Grafts open the Inscribe screen (EXPANSION.md K3b, K6).
  const inscribe = useInscribe(state)

  // Escape cancels an armed consumable before it reaches the pause menu.
  useEffect(() => {
    if (!armedConsumable && !armedPurchase) return
    function onKey(e) {
      if (e.key !== 'Escape') return
      e.stopImmediatePropagation()
      setArmedConsumable(null)
      setArmedPurchase(null)
      inscribe.reset()
    }
    window.addEventListener('keydown', onKey, { capture: true })
    return () => window.removeEventListener('keydown', onKey, { capture: true })
  }, [armedConsumable, armedPurchase])

  if (!shop) return null

  const type = shopTypeById(shop.type)
  const choices = state.map ? nextChoices(state.map) : []
  const pending = state.map ? nodeById(state.map, state.map.pendingId) : null
  const finalShop = state.round >= selectors.finalRound(state) && !state.endless
  // The camp sits off the Road: no stop to pick, leaving retries the round.
  const camp = Boolean(type.camp)
  const needsPick = !camp && !finalShop && choices.length > 1 && !pending

  const shardsAbbr = t('elementa.shop.shardsAbbr')
  const buyLabel = (cost) => `${t('elementa.shop.buy')} ${cost}`
  // Mote buys for half again the sell value (H6).
  const pantry = Boolean(type.pantry)
  const sellLabel = (cost) =>
    pantry ? `${t('elementa.pantry.feed')} +${selectors.motePays(cost)}` : `${t('elementa.shop.sell')} +${cost}`

  const rerollShopCost = selectors.rerollShopOffersCost(state)
  // Between fights in the Unwritten the next target is the next boss's (T2).
  const convNext = selectors.convergenceNext(state)
  const nextTarget = convNext ? convNext.target : thresholdForRound(state.round + 1, state.difficulty)
  const difficulty = localizeDifficulty(state.difficulty, lang)

  const relicCap = selectors.relicCapFor(state)
  const consumableCap = selectors.consumableCapFor(state)
  const relicsFull = state.relics.length >= relicCap
  const consumablesFull = state.consumables.length >= consumableCap
  const diceCap = selectors.maxDiceFor(state)
  // Warp dice don't count toward the cap (EXPANSION.md H3).
  const diceCount = selectors.poolSize(state.dice)
  const diceFull = diceCount >= diceCap

  // Boards (the Forge, the Brew, deals, blessings, services, the Pantry, a sigil offer) stand beside the keeper, not below the counter.
  const hasBoards = Boolean(shop.sigilOffer || shop.forgeOpen || type.upgrades || type.brew || type.services || type.pantry || shop.deals?.length > 0 || shop.blessings?.length > 0)

  function buy(action) {
    // a BUY_ action rings the coin through the room's 'buy' event (visuals/room/roomSounds.js)
    if (!/^BUY_/.test(action.type)) playCoin()
    dispatch(action)
    setOpenKey(null)
  }

  return (
    <div className="shop-scene" style={sceneVars(type.id, type.color)} data-calm={calm ? '' : undefined}>
    <div className="mx-auto grid w-full max-w-[1600px] grid-cols-1 gap-8 pt-10 lg:grid-cols-[264px_minmax(0,1fr)_226px] lg:items-start lg:gap-6">
      {/* Left: your pouch (what you own). A drawer on a phone. */}
      <Drawer label={t('elementa.shop.pouch')} className="order-last lg:order-none lg:self-start">
      <Pouch data-tut="inventory" className="flex flex-col gap-5">
        <InventorySection label={t('elementa.shop.yourDice')} count={diceCount} cap={diceCap}>
          <p className="-mt-1 text-sm text-[var(--text-mute)]">{t('elementa.shop.dragToReorder')}</p>
          <DiceGrid
            dice={state.dice}
            capacity={diceCap}
            onReorder={(order) => {
              playClick()
              dispatch({ type: 'REORDER_DICE', order })
            }}
            renderDie={(die, wasDragged) => {
              const sellVal = selectors.sellValueForDie(die, selectors.isFusionElement(die.elementId))
              const elementName = localize(lang, ELEMENTS[die.elementId].name, ELEMENTS_ES, die.elementId, 'name')
              const base = dieDescriptor(die.elementId, lang)
              const item = {
                ...base,
                sides: die.sides,
                bonus: die.bonus || 0,
                edition: die.edition,
                runes: runesOf(die),
                weights: Boolean(die.weights),
                socket: Boolean(die.socket),
                name: `${elementName} d${die.sides}${die.bonus ? ` +${die.bonus}` : ''}`,
                description: die.bonus
                  ? `${base.description} ${t('elementa.shop.dieBonus').replace('{n}', die.bonus)}`
                  : base.description,
              }
              return (
                <IconSlot
                  renderIcon={(onClick) => (
                    <DieToken
                      die={die}
                      size={48}
                      // A drop is not a click: don't open the inspector.
                      onClick={() => !wasDragged() && onClick()}
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
                          // An impossible target (a d3 under a Chisel, a full pool
                          // for a split) says no and stays armed.
                          const held = state.consumables.find((c) => c.instanceId === armedConsumable)
                          // A Rune or a Graft picks its number on the Inscribe screen.
                          const routed = inscribe.route(held, die, (extra) => {
                            dispatch({ type: 'APPLY_CONSUMABLE', instanceId: armedConsumable, dieId: die.id, ...extra })
                            setArmedConsumable(null)
                          })
                          if (routed === 'fail') return playFail()
                          if (routed) return playClick()
                          if (held && !selectors.consumableTargetOk(state, held, die)) return playFail()
                          playClick()
                          dispatch({ type: 'APPLY_CONSUMABLE', instanceId: armedConsumable, dieId: die.id })
                          setArmedConsumable(null)
                        }
                      : armedPurchase
                        ? () => {
                            const bought = consumableById(armedPurchase)
                            const routed = inscribe.route(bought, die, (extra) => {
                              dispatch({ type: 'BUY_AND_APPLY_CONSUMABLE', consumableId: armedPurchase, dieId: die.id, ...extra })
                              setArmedPurchase(null)
                            })
                            if (routed === 'fail') return playFail()
                            if (routed) return playClick()
                            if (bought && !selectors.consumableTargetOk(state, bought, die)) return playFail()
                            dispatch({ type: 'BUY_AND_APPLY_CONSUMABLE', consumableId: armedPurchase, dieId: die.id })
                            setArmedPurchase(null)
                          }
                        : undefined
                  }
                  openKey={openKey}
                  onOpenChange={setOpenKey}
                />
              )
            }}
          />
        </InventorySection>

        <InventorySection label={t('elementa.shop.yourRelics')} count={state.relics.length} cap={relicCap}>
          <SlotGrid capacity={relicCap}>
            {state.relics.map((relic) => (
              <IconSlot
                key={relic.id}
                itemKey={`ownedrelic-${relic.id}`}
                fresh={Date.now() - openedAt.current > 900}
                item={relicDescriptor(relic, lang)}
                size={48}
                showCaption={false}
                placement="right"
                actions={[
                  {
                    label: sellLabel(selectors.relicSellValue(state, relic)),
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
                fresh={Date.now() - openedAt.current > 900}
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
      </Pouch>
      </Drawer>

      {/* Center: the room. The sign, the wall shelf, the keeper behind the counter and the counter; boards (the Forge and the rest) stand beside them. */}
      <div className="flex min-w-0 flex-col items-center gap-5 lg:self-start">
        <div className="flex w-full flex-col items-center gap-4 lg:flex-row lg:items-start lg:justify-center">
          <div className="obj-ticket w-full max-w-[230px] lg:order-first lg:w-[210px] lg:shrink-0">
            <RoundResult state={state} compact />
          </div>
        <ShopBanner label={shopNameIn(state, type, lang)} color={type.color} />
        </div>
        <div className={hasBoards ? 'grid w-full gap-6 lg:grid-cols-[minmax(0,350px)_minmax(0,1fr)] lg:items-start' : 'flex w-full flex-col items-center gap-5'}>
          <div className="flex min-w-0 flex-col items-center gap-5">
        {type.items > 0 && (
        <OfferShelf
          place="shelf"
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
          {shop.itemOffers.map((offer, idx) => {
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
                      disabled: state.shards < cost || (relicsFull && !relic.law),
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
            // Keyed by the offer and how many of it came before, not by position, so a bought neighbor leaves a gap and nothing shifts.
            const nth = shop.itemOffers.slice(0, idx).filter((o) => o.kind === offer.kind && o.id === offer.id).length
            return (
              <IconSlot
                key={`consumable-${offer.id}-${nth}`}
                itemKey={`consumableoffer-${offer.id}-${nth}`}
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
        <div className="stage">
          <div className="stage__row">
            <KeeperGreeting state={state} type={type} />
            {/* Vesper works beside Brasa past the door (EXPANSION.md K5). */}
            {selectors.vesperHere(state) && <KeeperGreeting second state={state} type={{ ...type, keeper: 'vesper', color: '#9fb8ff' }} />}
          </div>
        {type.dice > 0 && (
        <OfferShelf
          place="counter"
          tut="offers"
          shuffleKey={shop.restocks || 0}
          title={t('elementa.shop.buyADie')}
          warning={diceFull ? t('elementa.shop.dicePoolFull') : null}
        >
          {shop.buyableElements.map((elementId) => {
            // Every offer has its own size: mostly d3, sometimes bigger and pricier.
            const sizeId = selectors.shopDieSize(shop, elementId)
            const sides = tierById(sizeId).sides
            const cost = selectors.newDieCost(elementId, state.dice, state.relics, shop, sizeId)
            // A Warp offer skips the dice cap but not the Warp cap (H3).
            const edition = shop.dieWarp?.[elementId] ? 'warp' : null
            const offerDie = { id: `offer-${elementId}`, elementId, tierId: sizeId, sides, edition }
            const fits = selectors.fitsPool(state, [...state.dice, offerDie]) && !selectors.holdsKind(state.dice, elementId)
            return (
              <IconSlot
                key={elementId}
                itemKey={`dieoffer-${elementId}`}
                item={{
                  ...dieDescriptor(elementId, lang),
                  name: `${dieDescriptor(elementId, lang).name} ${sizeId}${edition ? ' WARP' : ''}`,
                  sides,
                  edition,
                }}
                renderIcon={(onClick) => (
                  <DieToken
                    die={offerDie}
                    size={sizeId === 'd20' ? 84 : 72}
                    onClick={onClick}
                    title={`${dieDescriptor(elementId, lang).name} ${sizeId}`}
                  />
                )}
                cost={cost}
                affordable={state.shards >= cost}
                actions={[
                  {
                    label: buyLabel(cost),
                    disabled: state.shards < cost || !fits,
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
          {!(type.dice > 0) && <Counter plate={shopNameIn(state, type, lang)} />}
        </div>
        {arbiterShop && <ArbiterSays text={arbiterShop.text} tone={arbiterShop.tone} />}
            {!hasBoards && (
              <>
        <AnimatePresence>
          {(armedConsumable || armedPurchase) && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="obj-ticket flex items-center gap-4"
            >
              <span className="text-base font-bold text-[var(--gold-hi)]">
                {inscribe.graftFrom ? t('elementa.inscribe.graftTo') : t('elementa.shop.chooseDieToApply')}
              </span>
              <button
                type="button"
                onClick={() => {
                  setArmedConsumable(null)
                  setArmedPurchase(null)
                  inscribe.reset()
                }}
                className="el-btn el-btn--sm"
              >
                {t('elementa.shop.cancel')}
                <span className="el-key">Esc</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* A keeper's sigil die (EXPANSION.md P3), about one visit in four. */}
        {shop.sigilOffer && (
          <OfferShelf title={t('elementa.shop.sigil')} hint={`${t(`elementa.shop.sigilKeeper_${ELEMENTS[shop.sigilOffer].sigilSet}`)} ${t('elementa.shop.sigilHint')}`}>
            {(() => {
              const elementId = shop.sigilOffer
              const cost = selectors.sigilCost(elementId, state.relics, shop)
              const sigilDie = { id: `offer-${elementId}`, elementId, tierId: 'sigil', sides: 6, symbol: ELEMENTS[elementId].sigilSet && SIGIL_FACES[ELEMENTS[elementId].sigilSet][0] }
              const fits = selectors.fitsPool(state, [...state.dice, sigilDie])
              const item = dieDescriptor(elementId, lang)
              return (
                <IconSlot
                  key={elementId}
                  itemKey={`sigiloffer-${elementId}`}
                  item={{ ...item, sides: 6 }}
                  renderIcon={(onClick) => <DieToken die={sigilDie} size={72} onClick={onClick} title={item.name} />}
                  cost={cost}
                  affordable={state.shards >= cost}
                  actions={[{ label: buyLabel(cost), disabled: state.shards < cost || !fits, onClick: () => buy({ type: 'BUY_SIGIL', elementId }) }]}
                  openKey={openKey}
                  onOpenChange={setOpenKey}
                />
              )
            })()}
          </OfferShelf>
        )}


        {/* The Forge's four slots (EXPANSION.md K3): any Forge, or a Fusion Spark. */}
        {shop.forgeOpen && <ForgePanel state={state} dispatch={dispatch} />}

        {type.upgrades && (
          <UpgradeShelf state={state} dispatch={dispatch} openKey={openKey} setOpenKey={setOpenKey} buy={buy} />
        )}

        {type.brew && <BrewShelf state={state} dispatch={dispatch} />}

        {type.services && <ServiceShelf state={state} dispatch={dispatch} />}

        {type.pantry && <PantryShelf state={state} dispatch={dispatch} />}

        {shop.deals?.length > 0 && <DealShelf state={state} dispatch={dispatch} />}

        {shop.blessings?.length > 0 && <BlessingShelf state={state} dispatch={dispatch} />}

              </>
            )}
          </div>
          {hasBoards && (
            <div className="flex min-w-0 flex-col items-center gap-6">
        <AnimatePresence>
          {(armedConsumable || armedPurchase) && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="obj-ticket flex items-center gap-4"
            >
              <span className="text-base font-bold text-[var(--gold-hi)]">
                {inscribe.graftFrom ? t('elementa.inscribe.graftTo') : t('elementa.shop.chooseDieToApply')}
              </span>
              <button
                type="button"
                onClick={() => {
                  setArmedConsumable(null)
                  setArmedPurchase(null)
                  inscribe.reset()
                }}
                className="el-btn el-btn--sm"
              >
                {t('elementa.shop.cancel')}
                <span className="el-key">Esc</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* A keeper's sigil die (EXPANSION.md P3), about one visit in four. */}
        {shop.sigilOffer && (
          <OfferShelf title={t('elementa.shop.sigil')} hint={`${t(`elementa.shop.sigilKeeper_${ELEMENTS[shop.sigilOffer].sigilSet}`)} ${t('elementa.shop.sigilHint')}`}>
            {(() => {
              const elementId = shop.sigilOffer
              const cost = selectors.sigilCost(elementId, state.relics, shop)
              const sigilDie = { id: `offer-${elementId}`, elementId, tierId: 'sigil', sides: 6, symbol: ELEMENTS[elementId].sigilSet && SIGIL_FACES[ELEMENTS[elementId].sigilSet][0] }
              const fits = selectors.fitsPool(state, [...state.dice, sigilDie])
              const item = dieDescriptor(elementId, lang)
              return (
                <IconSlot
                  key={elementId}
                  itemKey={`sigiloffer-${elementId}`}
                  item={{ ...item, sides: 6 }}
                  renderIcon={(onClick) => <DieToken die={sigilDie} size={72} onClick={onClick} title={item.name} />}
                  cost={cost}
                  affordable={state.shards >= cost}
                  actions={[{ label: buyLabel(cost), disabled: state.shards < cost || !fits, onClick: () => buy({ type: 'BUY_SIGIL', elementId }) }]}
                  openKey={openKey}
                  onOpenChange={setOpenKey}
                />
              )
            })()}
          </OfferShelf>
        )}


        {/* The Forge's four slots (EXPANSION.md K3): any Forge, or a Fusion Spark. */}
        {shop.forgeOpen && <ForgePanel state={state} dispatch={dispatch} />}

        {type.upgrades && (
          <UpgradeShelf state={state} dispatch={dispatch} openKey={openKey} setOpenKey={setOpenKey} buy={buy} />
        )}

        {type.brew && <BrewShelf state={state} dispatch={dispatch} />}

        {type.services && <ServiceShelf state={state} dispatch={dispatch} />}

        {type.pantry && <PantryShelf state={state} dispatch={dispatch} />}

        {shop.deals?.length > 0 && <DealShelf state={state} dispatch={dispatch} />}

        {shop.blessings?.length > 0 && <BlessingShelf state={state} dispatch={dispatch} />}

            </div>
          )}
        </div>
      </div>

      {/* Right: the map table. The Road on a slate, the purse, the plaques, the lever and the bell pull. A drawer on a phone. */}
      <Drawer label={t('elementa.map.roadAhead')} map className="lg:self-start">
      <aside className="obj-maptable obj-nails">
        <div className="obj-rail">
          <span className="pixel-score text-[8px] uppercase tracking-widest" style={{ color: difficulty.color }}>
            {difficulty.name}
          </span>
          <Hearts lives={state.lives} maxLives={state.maxLives} size={14} />
        </div>
        <div data-tut="shards" className="obj-purse">
          <span className="el-label">{t('elementa.hud.shards')}</span>
          <ShardCount value={state.shards} size={18} className="text-lg" />
        </div>
        <div className="obj-plaques">
          <Plaque label={t('elementa.shop.round')}>{state.round}</Plaque>
          {/* At camp you retry this round, so show its target. */}
          <Plaque label={camp ? t('elementa.hud.target') : t('elementa.shop.nextTarget')} accent="var(--gold-1)">
            {nextTarget == null ? '?' : compactNumber(camp ? state.threshold : nextTarget)}
          </Plaque>
        </div>

        {!finalShop && !camp && state.map && (
          <div data-tut="map" className="flex flex-col items-center gap-2">
            <h3 className="el-label w-full">{t('elementa.map.roadAhead')}</h3>
            <Slate>
              <RoadMap
                state={state}
                fromRound={state.round}
                toRound={state.round + 3 + (state.roadSight || 0)}
                onPick={(nodeId) => {
                  playClick()
                  dispatch({ type: 'CHOOSE_PATH', nodeId })
                }}
                width={168}
                rowHeight={42}
                nodeSize={30}
                expandable
              />
            </Slate>
            <p className="obj-ticket min-h-[3rem] w-full text-center text-sm leading-snug">
              {pending || choices.length === 1 ? (
                <>
                  <b>{shopNameIn(state, shopTypeById((pending ?? choices[0]).type), lang)}</b>
                  {': '}
                  {shopTypeById((pending ?? choices[0]).type).blurb[lang]}
                </>
              ) : (
                t('elementa.map.pickHint')
              )}
            </p>
          </div>
        )}

        <Lever
          disabled={needsPick}
          onClick={() => {
            playClick()
            emitRoom('bell')
            dispatch({ type: 'NEXT_ROUND' })
          }}
          data-tut="next"
        >
          {needsPick ? t('elementa.map.pickFirst') : camp ? t('elementa.roundResult.tryAgain') : convNext ? t('elementa.convergence.nextFight') : t('elementa.shop.nextRound')}
        </Lever>
        {type.reroll && (
          <BellPull
            onClick={() => {
              playCoin()
              dispatch({ type: 'REROLL_SHOP_OFFERS' })
            }}
            disabled={state.shards < rerollShopCost || shop.rerollLocked}
            title={`${rerollShopCost} ${shardsAbbr}`}
          >
            <PixelIcon name="reroll" size={12} />
            {t('elementa.shop.rerollOffers')}
            <span className="el-key inline-flex items-center gap-1">
              <PixelIcon name="shard" size={8} />
              {rerollShopCost}
            </span>
          </BellPull>
        )}
        {type.reroll && (
          <p className="obj-note -mt-2" style={{ color: state.shards < rerollShopCost || shop.rerollLocked ? '#ffb0b8' : undefined }}>
            {shop.rerollLocked
              ? t('elementa.shop.rerollPlenty')
              : (state.shards < rerollShopCost ? t('elementa.shop.rerollCantAfford') : t('elementa.shop.rerollCost'))
                  .replace('{n}', rerollShopCost)
                  .replace('{next}', rerollShopCost + 1)}
          </p>
        )}
      </aside>
      </Drawer>
      {inscribe.element}
    </div>
    </div>
  )
}

/** Forge and Bazaar: pay to grow one of your dice a size. */
function UpgradeShelf({ state, dispatch, openKey, setOpenKey, buy }) {
  const { t, lang } = useLanguage()
  const growable = state.dice.filter((d) => selectors.growTier(state, d))
  return (
    <OfferShelf title={t('elementa.shop.upgrades')} hint={t('elementa.shop.upgradesHint')}>
      {growable.length === 0 && <p className="text-base text-[var(--text-mute)]">{t('elementa.bossReward.diceMaxed')}</p>}
      {growable.map((die) => {
        const up = selectors.dieUpgradeCost(die, state.relics, state.shop, state.realm)
        const item = dieDescriptor(die.elementId, lang)
        return (
          <IconSlot
            key={die.id}
            itemKey={`upgrade-${die.id}`}
            item={{ ...item, sides: die.sides, name: `${item.name} d${die.sides} > d${up.next.sides}` }}
            caption={`d${die.sides} > d${up.next.sides}${up.apprentice ? ` · ${t('elementa.shop.apprentice')}` : ''}`}
            renderIcon={(onClick) => <DieToken die={die} size={56} onClick={onClick} title={item.name} />}
            cost={up.cost}
            affordable={state.shards >= up.cost}
            size={56}
            actions={[
              {
                label: `${t('elementa.shop.upgrade')} ${up.cost}${up.apprentice ? ` (${t('elementa.shop.apprentice')})` : ''}`,
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

/** Black Market (and Bazaar): risky deals, take one. A betrayal pact
 * (B3) joins them when you hold an Aeris blessing it can break. */
function DealShelf({ state, dispatch }) {
  const { t, lang } = useLanguage()
  const shop = state.shop
  const offers = [...shop.deals, ...(shop.betrayal ? [{ ...shop.betrayal, betrayal: true }] : [])]
  return (
    <OfferShelf title={t('elementa.shop.deals')} hint={t('elementa.shop.dealsHint')}>
      {offers.map((deal) => {
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
        if (deal.betrayal) {
          art = (
            <span className="flex items-center gap-1">
              <KeeperSprite id="nix" size={36} />
              <span className="pixel-score text-[10px] text-[#ff6b7a]">x</span>
              <KeeperSprite id="aeris" size={36} />
            </span>
          )
        }
        const taken = shop.dealTaken === deal.id
        const can = !shop.dealTaken && selectors.dealAvailable(state, deal)
        return (
          <OfferCard
            key={deal.id}
            title={deal.betrayal ? `${t('elementa.shop.betrayal')}: ${def.name[lang]}` : def.name[lang]}
            body={body}
            color={deal.betrayal ? '#ff6b7a' : '#8a5cff'}
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

/** Atlas's Cartography (EXPANSION.md H6): three map services, once each. */
function ServiceShelf({ state, dispatch }) {
  const { t, lang } = useLanguage()
  const shop = state.shop
  const peek = shop.peek ? localizeBossModifier(bossById(shop.peek.bossId), lang) : null
  return (
    <OfferShelf title={t('elementa.atlas.title')} hint={t('elementa.atlas.hint')}>
      {ATLAS_SERVICES.map((service) => {
        const used = shop.servicesUsed?.includes(service.id)
        const blocked = service.id === 'path' && selectors.unlinkedNext(state.map).length === 0
        const can = !used && !blocked && state.shards >= service.cost
        return (
          <OfferCard
            key={service.id}
            title={service.name[lang]}
            body={
              service.id === 'peek' && peek
                ? t('elementa.atlas.peeked').replace('{boss}', peek.name).replace('{round}', shop.peek.round)
                : service.body[lang]
            }
            color="#7ad1ff"
            art={service.id === 'peek' && peek ? <BossAvatar id={shop.peek.bossId} size={40} /> : <KeeperSprite id="atlas" size={40} />}
            done={used ? true : undefined}
            disabled={!can}
            button={
              used
                ? t('elementa.atlas.done')
                : blocked
                  ? t('elementa.atlas.noPath')
                  : `${t('elementa.atlas.use')} ${service.cost}`
            }
            onClick={() => {
              playCoin()
              dispatch({ type: 'USE_SERVICE', serviceId: service.id })
            }}
          />
        )
      })}
    </OfferShelf>
  )
}

/**
 * Mote's Pantry (H6): it buys your goods (sell them from the left), a meter
 * of everything it has eaten on this file, and the secret stock it opens.
 */
function PantryShelf({ state, dispatch }) {
  const { t, lang } = useLanguage()
  const { reducedMotion } = useGameSettings()
  const fed = state.moteFed || 0
  const stock = state.shop.moteStock || []
  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-9">
      <div className="obj-board obj-nails !items-stretch !gap-3 !px-5 !py-4">
        <div className="flex items-center justify-between">
          <span className="el-label text-[#cdb4ff]">{t('elementa.pantry.appetite')}</span>
          <span className="pixel-score text-[10px] text-[#cdb4ff]">
            {Math.min(fed, MOTE_FULL)} / {MOTE_FULL}
          </span>
        </div>
        <div className="relative h-3 w-full bg-[var(--stone-0)]" style={{ boxShadow: '0 0 0 2px var(--ink)' }}>
          <motion.div
            className="h-full bg-[#8a7aa8]"
            initial={false}
            animate={{ width: `${Math.min(100, (fed / MOTE_FULL) * 100)}%` }}
            transition={reducedMotion ? { duration: 0 } : { type: 'spring', bounce: 0.2, duration: 0.6 }}
          />
          {MOTE_STAGES.map((n) => (
            <span
              key={n}
              className="absolute top-[-4px] h-[20px] w-[2px]"
              style={{ left: `${(n / MOTE_FULL) * 100}%`, background: fed >= n ? '#ff4fd8' : 'var(--text-mute)' }}
              title={`${n}`}
            />
          ))}
        </div>
        <p className="text-sm text-[var(--text-dim)]">
          {fed >= MOTE_FULL ? t('elementa.pantry.full') : t('elementa.pantry.hint')}
        </p>
      </div>
      {stock.length > 0 && (
        <OfferShelf title={t('elementa.pantry.secret')} hint={t('elementa.pantry.secretHint')}>
          {stock.map((offer, i) => {
            const cost = selectors.moteOfferCost(state, offer)
            let title
            let body
            let art
            if (offer.kind === 'pact') {
              title = dealById('hollow_pact').name[lang]
              body = dealById('hollow_pact').body[lang]
              art = <KeeperSprite id="mote" size={40} />
            } else if (offer.kind === 'consumable') {
              const item = consumableDescriptor(consumableById(offer.id), lang)
              title = item.name
              body = item.description
              art = <ItemIcon {...item} size={44} static />
            } else {
              title = `${dieDescriptor(offer.elementId, lang).name} d6 WARP`
              body = t('elementa.pantry.warpDie')
              art = <DieToken die={{ id: `mote-${i}`, elementId: offer.elementId, tierId: 'd6', sides: 6, edition: 'warp' }} size={48} />
            }
            return (
              <OfferCard
                key={`${offer.kind}-${offer.id ?? offer.elementId}-${i}`}
                title={title}
                body={body}
                color="#ff4fd8"
                art={art}
                done={offer.sold ? true : undefined}
                disabled={offer.sold || state.shards < cost}
                button={offer.sold ? t('elementa.pantry.sold') : `${t('elementa.shop.buy')} ${cost}`}
                onClick={() => {
                  dispatch({ type: 'BUY_MOTE', index: i })
                }}
              />
            )
          })}
        </OfferShelf>
      )}
    </div>
  )
}

/** What Aeris asks for a blessing right now (B3), as a short line. */
function aerisPriceText(state, t, lang) {
  const cost = selectors.aerisCost(state)
  if (cost.kind === 'shards') return t('elementa.shop.aerisShards').replace('{n}', cost.amount)
  if (cost.kind === 'consumable') {
    const item = state.consumables.find((c) => c.instanceId === cost.instanceId)
    return t('elementa.shop.aerisItem').replace('{item}', consumableDescriptor(item, lang).name)
  }
  if (cost.kind === 'relic') {
    return t('elementa.shop.aerisItem').replace('{item}', relicDescriptor(relicById(cost.id), lang).name)
  }
  if (cost.kind === 'none') return t('elementa.shop.aerisNothing')
  return null
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
        available: selectors.blessingAvailable(state, id) && selectors.canPayAeris(state),
      }
    }),
    {
      id: 'prophecy',
      title: PROPHECY.name[lang],
      body: PROPHECY.body[lang].replace('{round}', bossRound),
      art: <KeeperSprite id="aeris" size={40} />,
      available: Boolean(bossRound) && selectors.canPayAeris(state),
    },
  ]
  // With Nix pacts, every blessing has a price (B3).
  const price = shop.blessingTaken ? null : aerisPriceText(state, t, lang)
  return (
    <OfferShelf
      title={t('elementa.shop.blessings')}
      hint={price ? t('elementa.shop.blessingsHintPaid') : t('elementa.shop.blessingsHint')}
      warning={price}
    >
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
