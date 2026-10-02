import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLanguage } from '../../../i18n/LanguageContext.jsx'
import { playClick } from '../utils/sound.js'
import ItemIcon from './ItemIcon.jsx'
import ItemInspector from './ItemInspector.jsx'
import DieToken from './DieToken.jsx'
import RoadMap from './RoadMap.jsx'
import BoonsList from './BoonsList.jsx'
import BossAvatar from './BossAvatar.jsx'
import KeeperSprite from './KeeperSprite.jsx'
import { Hearts, ShardCount, Stat } from './RoundHUD.jsx'
import { dieDescriptor, relicDescriptor, consumableDescriptor } from '../data/itemDescriptors.js'
import { localizeDifficulty, localizeDeck, localizeBossModifier } from '../data/i18n.js'
import { deckById } from '../data/decks.js'
import { bossById, PRIMORDIAL, isBossRound } from '../data/bossModifiers.js'
import { shopTypeById } from '../data/shops.js'
import { currentNode, nodeById } from '../engine/map.js'
import { selectors } from '../engine/gameReducer.js'

/** One inspectable thing in the center column: click for its popover. */
function Inspectable({ id, open, onOpen, item, children }) {
  return (
    <div className="relative">
      <button type="button" onClick={() => onOpen(open ? null : id)} title={item.name} className="block">
        {children}
      </button>
      <AnimatePresence>{open && <ItemInspector item={item} onClose={() => onOpen(null)} />}</AnimatePresence>
    </div>
  )
}

function Shelf({ label, children, empty }) {
  const { t } = useLanguage()
  return (
    <section className="flex w-full flex-col items-center gap-4">
      <h3 className="el-label">{label}</h3>
      {empty ? (
        <p className="text-base text-[var(--text-mute)]">{t('elementa.common.noneYet')}</p>
      ) : (
        <div className="flex flex-wrap justify-center gap-5">{children}</div>
      )}
    </section>
  )
}

/** Rounds 1 to 15 (or the current stretch of 15 in Endless), bosses marked. */
function RoundStrip({ state }) {
  const { t } = useLanguage()
  const span = selectors.winRound
  const start = Math.floor((state.round - 1) / span) * span + 1
  const rounds = Array.from({ length: span }, (_, i) => start + i)
  return (
    <section className="flex flex-col gap-2">
      <h3 className="el-label">{t('elementa.runPreview.progress')}</h3>
      <div className="grid grid-cols-5 gap-1.5">
        {rounds.map((r) => {
          const boss = isBossRound(r, state.difficulty)
          const done = r < state.round
          const now = r === state.round
          return (
            <span
              key={r}
              title={`${t('elementa.hud.round')} ${r}`}
              className="pixel-score flex h-8 items-center justify-center text-[8px]"
              style={{
                background: now ? 'var(--gold-1)' : done ? '#2f7a4a' : 'var(--stone-0)',
                color: now ? 'var(--ink)' : done ? '#d7f5df' : 'var(--text-mute)',
                boxShadow: `0 0 0 2px ${boss ? '#ff5a5a' : 'var(--ink)'}`,
              }}
            >
              {r}
            </span>
          )
        })}
      </div>
      <p className="flex items-center gap-2 text-sm text-[var(--text-mute)]">
        <span className="inline-block h-2.5 w-2.5" style={{ boxShadow: '0 0 0 2px #ff5a5a' }} />
        {t('elementa.runPreview.bossRounds')}
      </p>
    </section>
  )
}

/**
 * "Here's where you left off" (EXPANSION.md E9): the whole screen, before
 * resuming a saved run. Left: stakes and progress. Center: the dice, relics
 * and consumables, each inspectable. Right: the Road, boons, and bosses.
 */
export default function RunPreview({ state, dispatch }) {
  const { lang, t } = useLanguage()
  const [open, setOpen] = useState(null)
  const difficulty = localizeDifficulty(state.difficulty, lang)
  const deck = state.deckId ? localizeDeck(deckById(state.deckId), lang) : null
  // The next stop: mid-round it's the shop this round leads to; saved in a
  // shop, it's the one already picked on the Road (if any).
  const node = !state.map
    ? null
    : state.resumePhase === 'shop'
      ? state.shop?.type === 'camp'
        ? currentNode(state.map)
        : nodeById(state.map, state.map.pendingId)
      : currentNode(state.map)
  const stop = node ? shopTypeById(node.type) : null
  const bosses = (state.chronicle?.bosses || [])
    .map((id) => (id === PRIMORDIAL.id ? PRIMORDIAL : bossById(id)))
    .filter(Boolean)
    .map((b) => localizeBossModifier(b, lang))

  // Where exactly the save stopped.
  const where =
    state.resumePhase === 'shop'
      ? state.shop?.type === 'camp'
        ? t('elementa.runPreview.whereCamp')
        : t('elementa.runPreview.whereShop').replace('{shop}', shopTypeById(state.shop?.type).name[lang])
      : t(`elementa.runPreview.where.${state.resumePhase}`)

  function resume() {
    playClick()
    dispatch({ type: 'RESUME_RUN' })
  }

  // Enter continues, like the old card's button.
  useEffect(() => {
    function onKey(e) {
      if (e.key !== 'Enter' || (e.target instanceof HTMLElement && e.target.closest('button'))) return
      e.preventDefault()
      playClick()
      dispatch({ type: 'RESUME_RUN' })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [dispatch])

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
      className="flex min-h-[calc(100vh-5rem)] w-full max-w-[1500px] flex-col gap-6"
    >
      <h2 className="pixel-heading text-center text-base text-[var(--gold-1)] sm:text-xl">{t('elementa.runPreview.title')}</h2>

      <div className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-[280px_1fr_280px] lg:items-start">
        {/* Left: stakes and progress. */}
        <aside className="el-panel flex flex-col gap-5 p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="pixel-score text-[9px] uppercase tracking-widest" style={{ color: difficulty.color }}>
              {difficulty.name}
            </span>
            {state.endless && <span className="el-chip bg-[var(--arcane-hi)] text-[var(--ink)]">{t('elementa.runInfo.endless')}</span>}
          </div>
          {deck && (
            <div className="flex flex-col gap-1">
              <span className="el-label">{t('elementa.title.chooseDeck')}</span>
              <span className="text-base text-[var(--text)]">{deck.name}</span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Stat label={t('elementa.runPreview.round')}>{state.round}</Stat>
            <Stat label={t('elementa.hud.target')} accent="var(--gold-1)">
              {state.threshold}
            </Stat>
          </div>
          <div className="el-well flex items-center justify-between px-3 py-3">
            <Hearts lives={state.lives} maxLives={state.maxLives} size={16} />
            <ShardCount value={state.shards} size={16} className="text-base" />
          </div>
          <p className="text-base leading-snug text-[var(--text-dim)]">{where}</p>
          <RoundStrip state={state} />
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--text-mute)]">{t('elementa.runInfo.seed')}</span>
            <span className="pixel-score text-[9px] tracking-widest text-[var(--gold-hi)]">{state.seed ?? '?'}</span>
          </div>
        </aside>

        {/* Center: what you carry. */}
        <section className="el-panel--dark el-panel flex flex-col items-center gap-8 px-5 py-8">
          <Shelf label={t('elementa.runPreview.diceLoadout')} empty={state.dice.length === 0}>
            {state.dice.map((die) => {
              const base = dieDescriptor(die.elementId, lang)
              const item = { ...base, name: `${base.name} d${die.sides}${die.bonus ? ` +${die.bonus}` : ''}` }
              return (
                <Inspectable key={die.id} id={`die-${die.id}`} open={open === `die-${die.id}`} onOpen={setOpen} item={item}>
                  <DieToken die={die} size={72} title={item.name} />
                </Inspectable>
              )
            })}
          </Shelf>
          <Shelf label={t('elementa.runPreview.relics')} empty={state.relics.length === 0}>
            {state.relics.map((r) => {
              const item = relicDescriptor(r, lang)
              return (
                <Inspectable key={r.id} id={`relic-${r.id}`} open={open === `relic-${r.id}`} onOpen={setOpen} item={item}>
                  <ItemIcon static size={52} {...item} title={item.name} />
                </Inspectable>
              )
            })}
          </Shelf>
          <Shelf label={t('elementa.runPreview.consumables')} empty={state.consumables.length === 0}>
            {state.consumables.map((c) => {
              const item = consumableDescriptor(c, lang)
              return (
                <Inspectable key={c.instanceId} id={`c-${c.instanceId}`} open={open === `c-${c.instanceId}`} onOpen={setOpen} item={item}>
                  <ItemIcon static size={52} {...item} title={item.name} />
                </Inspectable>
              )
            })}
          </Shelf>
        </section>

        {/* Right: the Road, boons, and the bosses behind you. */}
        <aside className="el-panel flex flex-col gap-5 p-4">
          {stop && (
            <div className="el-well flex items-center gap-3 px-3 py-2" title={stop.blurb[lang]}>
              <KeeperSprite id={stop.keeper} size={28} />
              <span className="flex flex-col leading-tight">
                <span className="el-label">{t('elementa.hud.nextStop')}</span>
                <span className="text-base" style={{ color: stop.color }}>
                  {stop.name[lang]}
                </span>
              </span>
            </div>
          )}
          {state.map && (
            <div className="flex flex-col items-center gap-2">
              <h3 className="el-label w-full">{t('elementa.map.roadAhead')}</h3>
              <RoadMap state={state} fromRound={state.round} toRound={state.round + 3} width={240} rowHeight={56} nodeSize={36} />
            </div>
          )}
          <BoonsList state={state} icons />
          <section className="flex flex-col gap-2">
            <h3 className="el-label">{t('elementa.runPreview.bosses')}</h3>
            {bosses.length === 0 ? (
              <p className="text-sm text-[var(--text-mute)]">{t('elementa.common.noneYet')}</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {bosses.map((b) => (
                  <li key={b.id} className="flex items-center gap-2 text-sm" title={b.description}>
                    <BossAvatar id={b.id} size={24} />
                    <span className="text-[#ffb0b0]">{b.name}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>

      <div className="flex items-center justify-center gap-6 pb-2">
        <button
          type="button"
          onClick={() => {
            playClick()
            dispatch({ type: 'BACK_TO_SLOTS_FROM_PREVIEW' })
          }}
          className="el-btn el-btn--ghost"
        >
          {t('elementa.common.back')}
        </button>
        <button type="button" onClick={resume} className="el-btn el-btn--gold el-btn--lg min-w-[260px]">
          {t('elementa.runPreview.continue')}
          <span className="el-key">Enter</span>
        </button>
      </div>
    </motion.div>
  )
}
