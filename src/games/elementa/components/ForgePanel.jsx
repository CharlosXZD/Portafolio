import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLanguage } from '../../../i18n/LanguageContext.jsx'
import { useGameSettings } from '../utils/gameSettingsContext.jsx'
import { playClick, playCoin, playFail, playSuccess } from '../utils/sound.js'
import { selectors } from '../engine/gameReducer.js'
import { ELEMENTS } from '../data/elements.js'
import { runeById } from '../data/runes.js'
import { KEEPERS } from '../data/keepers.js'
import { dieDescriptor } from '../data/itemDescriptors.js'
import DieToken from './DieToken.jsx'
import KeeperSprite from './KeeperSprite.jsx'
import PixelIcon from './PixelIcon.jsx'

const SLOT = 64

/**
 * The Forge, rebuilt (EXPANSION.md K3, K3b, K4): four open slots. Click a
 * die, then a slot (or drag it there); click a placed die to take it back.
 * The recipe is read from what sits in the slots, with a live preview of the
 * result, its size, its cost and what carries over. Rune clashes and
 * shrinks get a word from Brasa (and Vesper past the door) and the choice to
 * pay to superpose; a volatile fusion shows its collapse chance and takes a
 * Catalyst. Vesper also teaches element fusions and sells Stardust.
 */
export default function ForgePanel({ state, dispatch }) {
  const { t, lang } = useLanguage()
  const { reducedMotion } = useGameSettings()
  const [slots, setSlots] = useState([null, null, null, null])
  const [selected, setSelected] = useState(null)
  const [choice, setChoice] = useState(null)
  const [superpose, setSuperpose] = useState(false)
  const [useCatalyst, setUseCatalyst] = useState(true)
  const [taught, setTaught] = useState(null)
  const vesper = selectors.vesperHere(state)
  const keeper = vesper ? 'vesper' : 'brasa'

  // Dice that left the pool (sold, forged) leave their slot.
  const ids = slots.filter((id) => id && state.dice.some((d) => d.id === id))
  useEffect(() => {
    if (ids.length !== slots.filter(Boolean).length) setSlots((s) => s.map((id) => (id && state.dice.some((d) => d.id === id) ? id : null)))
  }, [state.dice]) // eslint-disable-line react-hooks/exhaustive-deps

  const hasCatalyst = state.consumables.some((c) => c.type === 'catalyst')
  const plan = useMemo(
    () => selectors.forgePlan(state, ids, { resultId: choice, superpose, catalyst: hasCatalyst && useCatalyst }),
    [state, ids.join(), choice, superpose, useCatalyst, hasCatalyst], // eslint-disable-line react-hooks/exhaustive-deps
  )

  // Vesper teaches an element fusion the first time its parents sit here (K4).
  useEffect(() => {
    if (!vesper) return
    const unknown = plan.matches?.find((m) => !m.known && ELEMENTS[m.id]?.cosmic)
    if (!unknown) return
    dispatch({ type: 'TEACH_FUSION', fusionElementId: unknown.id })
    setTaught(unknown.id)
  }, [vesper, plan.matches, dispatch])

  const name = (id) => dieDescriptor(id, lang).name
  const free = state.dice.filter((d) => !ids.includes(d.id))

  function place(slot, dieId) {
    if (!dieId) return
    playClick()
    setSlots((s) => s.map((id, i) => (i === slot ? dieId : id === dieId ? null : id)))
    setSelected(null)
    setChoice(null)
  }

  function clickSlot(i) {
    if (selected) return place(i, selected)
    if (slots[i]) {
      playClick()
      setSlots((s) => s.map((id, k) => (k === i ? null : id)))
      setChoice(null)
    }
  }

  function doForge() {
    if (!plan.result || plan.blocked) return playFail()
    if (plan.collapseChance > 0 || plan.clashes > 0) playClick()
    else playSuccess()
    playCoin()
    dispatch({ type: 'FORGE', dieIds: ids, resultId: plan.result, superpose, catalyst: hasCatalyst && useCatalyst })
    setSlots([null, null, null, null])
    setChoice(null)
    setSuperpose(false)
  }

  const last = state.shop.lastForge
  const resultDef = plan.result ? ELEMENTS[plan.result] : null
  const line = (key) => KEEPERS[keeper]?.forge?.[key]?.[lang] ?? ''

  return (
    <section data-tut="forge" className="el-panel--dark el-panel flex w-full flex-col gap-5 px-5 pb-6 pt-4">
      <div className="flex w-full flex-wrap items-baseline justify-between gap-3">
        <h3 className="pixel-heading text-[10px] text-[var(--gold-hi)]">{t('elementa.shop.fusionForge')}</h3>
        <span className="flex items-center gap-3 text-sm text-[var(--text-mute)]">
          {t('elementa.forge.hint')}
          {(vesper || state.stardust > 0) && (
            <span className="el-chip inline-flex items-center gap-1 bg-[#2a2338] text-[#d6c4ff]" title={t('elementa.hud.stardust')}>
              <PixelIcon name="glimmer" size={8} color="#d6c4ff" hi="#ffffff" />
              {state.stardust || 0}
            </span>
          )}
        </span>
      </div>

      {/* Your dice: pick one, then a slot (or drag it). */}
      <div className="flex flex-wrap justify-center gap-3">
        {free.map((die) => (
          <span
            key={die.id}
            draggable
            onDragStart={(e) => e.dataTransfer.setData('text/plain', die.id)}
            className="cursor-grab"
          >
            <DieToken
              die={die}
              size={44}
              onClick={() => {
                playClick()
                setSelected((s) => (s === die.id ? null : die.id))
              }}
              ringColor={selected === die.id ? '#ffd166' : null}
              title={`${name(die.elementId)} d${die.sides}`}
            />
          </span>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-6">
        <div className="flex gap-3">
          {slots.map((id, i) => {
            const die = id ? state.dice.find((d) => d.id === id) : null
            return (
              <button
                key={i}
                type="button"
                onClick={() => clickSlot(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  place(i, e.dataTransfer.getData('text/plain'))
                }}
                aria-label={die ? `${t('elementa.forge.takeBack')}: ${name(die.elementId)}` : `${t('elementa.forge.slot')} ${i + 1}`}
                className="el-well flex items-center justify-center"
                style={{
                  width: SLOT + 12,
                  height: SLOT + 12,
                  boxShadow: selected && !die ? '0 0 0 2px var(--gold-1)' : undefined,
                }}
              >
                {die ? <DieToken die={die} size={SLOT} /> : <span className="pixel-score text-[9px] text-[var(--text-mute)]">{i + 1}</span>}
              </button>
            )
          })}
        </div>

        <span className="pixel-score text-lg text-[var(--text-mute)]">→</span>

        {/* The live preview. */}
        <div className="el-well flex min-h-[9rem] w-72 flex-col items-center justify-center gap-2 px-4 py-3 text-center">
          {ids.length === 0 ? (
            <span className="text-sm text-[var(--text-mute)]">{t('elementa.forge.empty')}</span>
          ) : !plan.result ? (
            <span className="text-sm text-[var(--text-mute)]">{t('elementa.forge.noMatch')}</span>
          ) : (
            <>
              {plan.matches.length > 1 && (
                <div className="flex flex-wrap justify-center gap-1.5">
                  {plan.matches.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setChoice(m.id)}
                      className={`el-btn el-btn--sm ${plan.result === m.id ? 'el-btn--gold' : ''}`}
                    >
                      {m.known ? name(m.id) : '???'}
                    </button>
                  ))}
                </div>
              )}
              {plan.known ? (
                <DieToken die={{ id: 'forge-preview', elementId: plan.result, tierId: plan.tierId, sides: plan.sides, edition: plan.carry.warp ? 'warp' : null }} size={56} />
              ) : (
                <span className="pixel-heading text-2xl text-[var(--text-mute)]">?</span>
              )}
              <span className="pixel-heading text-[10px]" style={{ color: plan.known ? resultDef.color : 'var(--text-mute)' }}>
                {plan.known ? `${name(plan.result)} d${plan.sides}` : '???'}
              </span>
              {plan.known && (
                <span className="text-sm text-[var(--gold-1)]">
                  {t('elementa.forge.cost').replace('{n}', plan.cost)}
                  {plan.stardust > 0 && ` · ${t('elementa.forge.stardust').replace('{n}', plan.stardust)}`}
                </span>
              )}
              {plan.known && (plan.carry.bonus > 0 || plan.carry.warp || plan.carry.weights || plan.carry.socket || plan.runes.length > 0) && (
                <span className="text-xs leading-snug text-[var(--text-dim)]">
                  {t('elementa.forge.keeps')}{' '}
                  {[
                    plan.carry.bonus > 0 ? `+${plan.carry.bonus}` : null,
                    plan.carry.warp ? 'Warp' : null,
                    plan.carry.weights ? t('elementa.forge.weights') : null,
                    plan.carry.socket ? t('elementa.forge.socket') : null,
                    ...plan.runes.map((r) => `${runeById(r.id)?.short[lang]} ${r.face}`),
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </span>
              )}
              {plan.blocked && plan.blocked !== 'unknown' && (
                <span className="text-sm text-[var(--bad)]">{t(`elementa.forge.blocked.${plan.blocked}`)}</span>
              )}
              {!plan.known && <span className="text-sm text-[var(--text-mute)]">{t('elementa.forge.unknown')}</span>}
            </>
          )}
        </div>
      </div>

      {/* A word from the smith: a rune clash or shrink, a volatile fusion, a
          new recipe. */}
      <AnimatePresence>
        {plan.known && (plan.clashes > 0 || plan.movedRunes > 0 || plan.volatile || taught) && (
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0 }}
            className="flex w-full items-start gap-3"
          >
            <KeeperSprite id={keeper} size={44} />
            <div className="el-panel flex flex-1 flex-col gap-2 px-3 py-2 text-left" style={{ '--edge': vesper ? '#9fb8ff' : '#ff7a1a' }}>
              {taught && plan.result === taught && <p className="text-base text-[var(--text)]">{line('teach').replace('{die}', name(taught))}</p>}
              {plan.movedRunes > 0 && <p className="text-base text-[var(--text)]">{line('shrink').replace('{n}', plan.sides)}</p>}
              {plan.clashes > 0 && (
                <>
                  <p className="text-base text-[var(--text)]">{line('clash').replace('{fee}', plan.fee)}</p>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => setSuperpose(true)} className={`el-btn el-btn--sm ${superpose ? 'el-btn--gold' : ''}`}>
                      {t('elementa.forge.superpose').replace('{n}', plan.fee)}
                    </button>
                    <button type="button" onClick={() => setSuperpose(false)} className={`el-btn el-btn--sm ${!superpose ? 'el-btn--gold' : ''}`}>
                      {t('elementa.forge.asIs')}
                    </button>
                  </div>
                </>
              )}
              {plan.volatile && (
                <>
                  <p className="text-base text-[var(--text)]">
                    {line('volatile').replace('{chance}', Math.round((hasCatalyst && useCatalyst ? 0 : selectors.collapseChance) * 100))}
                  </p>
                  {hasCatalyst && (
                    <label className="flex items-center gap-2 text-sm text-[var(--text-dim)]">
                      <input type="checkbox" checked={useCatalyst} onChange={(e) => setUseCatalyst(e.target.checked)} />
                      {t('elementa.forge.useCatalyst')}
                    </label>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          type="button"
          onClick={doForge}
          disabled={!plan.result || Boolean(plan.blocked)}
          className="el-btn el-btn--gold el-btn--lg min-w-[220px]"
        >
          {t('elementa.shop.forge')} {plan.result && !plan.blocked ? plan.total : ''}
        </button>
        {vesper && (
          <button
            type="button"
            onClick={() => {
              playCoin()
              dispatch({ type: 'BUY_STARDUST' })
            }}
            disabled={state.shop.stardustBought || state.shards < selectors.stardustPrice}
            className="el-btn el-btn--arcane"
          >
            {state.shop.stardustBought ? t('elementa.forge.stardustBought') : t('elementa.forge.buyStardust').replace('{n}', selectors.stardustPrice)}
          </button>
        )}
      </div>

      {/* What the last forge made, and what it cost in runes. */}
      {last && (
        <p className="text-center text-sm" style={{ color: last.collapsed ? 'var(--bad)' : 'var(--good)' }}>
          {last.collapsed
            ? t('elementa.forge.collapsed').replace('{die}', name(last.wanted))
            : t('elementa.forge.made').replace('{die}', name(last.resultId))}
          {last.lost?.length > 0 && ` ${t('elementa.forge.lost').replace('{runes}', last.lost.map((id) => runeById(id)?.name[lang]).join(', '))}`}
          {last.superposed && ` ${t('elementa.forge.superposed')}`}
        </p>
      )}
    </section>
  )
}
