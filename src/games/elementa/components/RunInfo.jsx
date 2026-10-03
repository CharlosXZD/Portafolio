import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../../../i18n/LanguageContext.jsx'
import { localizeDeck, localizeDifficulty, localizeBossModifier } from '../data/i18n.js'
import { deckById } from '../data/decks.js'
import { isBossRound } from '../data/bossModifiers.js'
import { selectors } from '../engine/gameReducer.js'
import { playClick } from '../utils/sound.js'
import GalleryScreen from './GalleryScreen.jsx'
import BossAvatar from './BossAvatar.jsx'
import RoadMap from './RoadMap.jsx'
import BoonsList from './BoonsList.jsx'
import KeeperSprite from './KeeperSprite.jsx'
import PixelSprite from './PixelSprite.jsx'
import { SHOP_TYPES } from '../data/shops.js'
import { CONSTELLATIONS, LEVEL_CAP } from '../data/constellations.js'

function Row({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b-2 border-[var(--ink)] py-2 text-base last:border-0">
      <span className="text-[var(--text-dim)]">{label}</span>
      <span className="text-right">{children}</span>
    </div>
  )
}

/**
 * Balatro-style Run Info, opened from the in-run toolbar: the run's facts
 * (seed, loadout, stakes, caps, next boss) and the full Gallery.
 */
export default function RunInfo({ state, onClose, initialTab = 'run' }) {
  const { t, lang } = useLanguage()
  const [tab, setTab] = useState(typeof initialTab === 'string' ? initialTab : 'run')
  const difficulty = localizeDifficulty(state.difficulty, lang)
  const deck = localizeDeck(deckById(state.deckId), lang)
  const boss = localizeBossModifier(state.bossModifier, lang)
  let nextBoss = state.round + 1
  while (!isBossRound(nextBoss, state.difficulty) && nextBoss < state.round + 20) nextBoss++
  const foretold = state.map?.prophecy?.round === nextBoss ? localizeBossModifier(state.map.prophecy.boss, lang) : null

  useEffect(() => {
    function onKey(e) {
      if (e.key !== 'Escape') return
      e.stopImmediatePropagation()
      onClose()
    }
    window.addEventListener('keydown', onKey, { capture: true })
    return () => window.removeEventListener('keydown', onKey, { capture: true })
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex justify-center overflow-y-auto bg-[#07050c]/95 px-4 py-10"
      onClick={onClose}
    >
      <div className="flex w-full max-w-5xl flex-col items-center gap-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex gap-4">
          {['run', ...(state.map ? ['map'] : []), 'gallery'].map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                playClick()
                setTab(id)
              }}
              className={`el-btn el-btn--sm ${tab === id ? 'el-btn--gold' : ''}`}
            >
              {t(`elementa.runInfo.${id}`)}
            </button>
          ))}
          <button type="button" onClick={onClose} className="el-btn el-btn--sm el-btn--ghost">
            {t('elementa.options.close')}
            <span className="el-key">Esc</span>
          </button>
        </div>

        {tab === 'run' ? (
          <div className="el-panel flex w-full max-w-md flex-col p-5">
            <Row label={t('elementa.runInfo.seed')}>
              <span className="pixel-score text-xs tracking-widest text-[var(--gold-hi)]">{state.seed ?? '?'}</span>
            </Row>
            <Row label={t('elementa.title.chooseDeck')}>{deck.name}</Row>
            <Row label={t('elementa.title.chooseDifficulty')}>
              <span style={{ color: difficulty.color }}>{difficulty.name}</span>
            </Row>
            <Row label={t('elementa.hud.round')}>
              {state.round}
              {state.endless ? ` · ${t('elementa.runInfo.endless')}` : ` / ${selectors.finalRound(state)}`}
            </Row>
            <Row label={t('elementa.runInfo.bestCast')}>{(state.bestCast || 0).toLocaleString()}</Row>
            <Row label={t('elementa.runInfo.rerolls')}>{selectors.availableRerolls({ ...state, rerollsUsed: 0 })}</Row>
            <Row label={t('elementa.shop.relics')}>
              {state.relics.length} / {selectors.relicCapFor(state)}
            </Row>
            <Row label={t('elementa.shop.consumables')}>
              {state.consumables.length} / {selectors.consumableCapFor(state)}
            </Row>
            <Row label={boss ? t('elementa.runInfo.currentBoss') : t('elementa.runInfo.nextBoss')}>
              {boss ? (
                <span className="inline-flex items-center gap-2">
                  <BossAvatar id={boss.id} size={24} />
                  {boss.name}
                </span>
              ) : foretold ? (
                <span className="inline-flex items-center gap-2">
                  <BossAvatar id={foretold.id} size={24} />
                  {foretold.name} · {t('elementa.hud.round')} {nextBoss} ({t('elementa.runInfo.foretold')})
                </span>
              ) : (
                `${t('elementa.hud.round')} ${nextBoss}`
              )}
            </Row>
          </div>
        ) : null}

        {/* Constellations (EXPANSION.md J1): what has been levelled this run. */}
        {tab === 'run' && state.realm === 'firmament' && (
          <div className="el-panel w-full max-w-md p-5">
            <h3 className="el-label mb-3">{t('elementa.runInfo.constellations')}</h3>
            <ul className="flex flex-col gap-2">
              {CONSTELLATIONS.map((c) => {
                const level = state.constellations?.[c.target] || 0
                return (
                  <li key={c.id} className="flex items-center justify-between gap-3 text-base" style={{ opacity: level ? 1 : 0.5 }}>
                    <span>{lang === 'es' ? c.es : c.en}</span>
                    <span className="flex items-center gap-2">
                      <span className="flex gap-[2px]">
                        {Array.from({ length: LEVEL_CAP }, (_, i) => (
                          <span key={i} className="h-2 w-1.5" style={{ background: i < level ? 'var(--gold-1)' : '#2a2338' }} />
                        ))}
                      </span>
                      <span className="pixel-score w-12 text-right text-[9px] text-[var(--gold-1)]">
                        {t('elementa.cast.level').replace('{n}', level)}
                      </span>
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {tab === 'run' && (state.boons || []).length > 0 && (
          <div className="el-panel w-full max-w-md p-5">
            <BoonsList state={state} all />
          </div>
        )}

        {tab === 'run' ? null : tab === 'map' ? (
          <div className="flex w-full flex-col items-center gap-6 lg:flex-row lg:items-start lg:justify-center">
            <div className="el-panel max-h-[70vh] overflow-y-auto p-4">
              <RoadMap
                state={state}
                fromRound={1}
                toRound={Math.max(state.map.layers.length, state.round + 1)}
                width={300}
                rowHeight={64}
                nodeSize={42}
                scrollToCurrent
              />
            </div>
            <div className="el-panel flex max-w-sm flex-col gap-3 p-4">
              <h3 className="el-label">{t('elementa.map.legend')}</h3>
              {Object.values(SHOP_TYPES).map((type) => (
                <div key={type.id} className="flex items-center gap-3">
                  <span className="el-well flex h-10 w-10 shrink-0 items-center justify-center" style={{ boxShadow: `0 0 0 2px ${type.color}` }}>
                    {type.legendary ? (
                      <PixelSprite name="crown" color="#ffd166" accent="#e5533d" accent2="#3d8fe5" size={30} />
                    ) : (
                      <KeeperSprite id={type.keeper} size={30} />
                    )}
                  </span>
                  <span className="text-sm leading-snug">
                    <span style={{ color: type.color }}>{type.name[lang]}</span>
                    <span className="text-[var(--text-dim)]">: {type.blurb[lang]}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <GalleryScreen slot={state.activeSlot} onBack={() => setTab('run')} embedded />
        )}
      </div>
    </motion.div>
  )
}
