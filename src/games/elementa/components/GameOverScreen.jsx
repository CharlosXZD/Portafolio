import { useState } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../../../i18n/LanguageContext.jsx'
import { playClick } from '../utils/sound.js'
import { relicDescriptor, consumableDescriptor, dieDescriptor } from '../data/itemDescriptors.js'
import { localizeBossModifier } from '../data/i18n.js'
import { bossById, PRIMORDIAL } from '../data/bossModifiers.js'
import { shopTypeById } from '../data/shops.js'
import { KEEPERS } from '../data/keepers.js'
import ItemIcon from './ItemIcon.jsx'
import DieToken from './DieToken.jsx'
import KeeperSprite from './KeeperSprite.jsx'
import BossAvatar from './BossAvatar.jsx'
import BoonsList from './BoonsList.jsx'
import { Stat } from './RoundHUD.jsx'
import BackupReminder from './BackupReminder.jsx'
import EndingCards from './EndingCards.jsx'
import { endingById } from '../data/endings.js'

function Section({ title, children, delay = 0 }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="flex w-full flex-col gap-3"
    >
      <h3 className="el-label">{title}</h3>
      {children}
    </motion.section>
  )
}

/**
 * The run summary, shown the moment the final boss falls (or the last life
 * goes): the dice as they looked on the table, every item, who you met on
 * the Road, and every pact with Nix and blessing from Aeris.
 */
export default function GameOverScreen({ state, dispatch, victory = false, ending = null, visions = false, onScene }) {
  const { t, lang } = useLanguage()
  // A win first plays its ending (B2), then the summary.
  const [showCards, setShowCards] = useState(victory)
  const chronicle = state.chronicle ?? { bosses: [], shops: [] }
  const endingDef = victory ? endingById(ending ?? state.ending ?? 'neutral') : null

  // Keepers met this run, with how many of their shops you visited.
  const keeperVisits = new Map()
  chronicle.shops.forEach(({ type }) => {
    const id = shopTypeById(type).keeper
    keeperVisits.set(id, (keeperVisits.get(id) || 0) + 1)
  })
  const bosses = chronicle.bosses
    .map((id) => (id === 'primordial' ? PRIMORDIAL : bossById(id)))
    .filter(Boolean)
    .map((b) => localizeBossModifier(b, lang))

  if (showCards) {
    return <EndingCards ending={endingDef?.id ?? 'neutral'} visions={visions} onScene={onScene} onDone={() => setShowCards(false)} />
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', bounce: 0.3, duration: 0.6 }}
      className="el-panel flex w-full max-w-4xl flex-col items-center gap-7 px-6 py-8 text-center sm:px-10"
    >
      <h2
        className={victory ? 'el-logo text-xl' : 'pixel-heading text-xl'}
        style={victory ? undefined : { color: 'var(--bad)' }}
      >
        {victory ? t('elementa.gameOver.victory') : t('elementa.gameOver.outOfLives')}
      </h2>
      {endingDef && (
        <p className="pixel-heading -mt-3 text-[10px]" style={{ color: endingDef.color }}>
          {endingDef.name[lang]}
        </p>
      )}

      <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label={t('elementa.gameOver.rounds')}>{victory ? state.round : state.round - 1}</Stat>
        <Stat label={t('elementa.runInfo.bestCast')} accent="var(--gold-1)">
          {(state.bestCast || 0).toLocaleString()}
        </Stat>
        <Stat label={t('elementa.hud.shards')} accent="var(--gold-1)">
          {state.shards}
        </Stat>
        <Stat label={t('elementa.runInfo.seed')}>{state.seed ?? '?'}</Stat>
      </div>

      <Section title={t('elementa.summary.dice')} delay={0.1}>
        <div className="flex flex-wrap justify-center gap-5">
          {state.dice.map((die) => {
            const item = dieDescriptor(die.elementId, lang)
            return (
              <div key={die.id} className="flex flex-col items-center gap-1">
                <DieToken die={die} size={64} face={die.value} title={`${item.name} d${die.sides}`} />
                <span className="text-sm text-[var(--text-dim)]">
                  {item.name} d{die.sides}
                </span>
              </div>
            )
          })}
        </div>
      </Section>

      {(state.relics.length > 0 || state.consumables.length > 0) && (
        <Section title={t('elementa.summary.items')} delay={0.2}>
          <div className="flex flex-wrap justify-center gap-3">
            {state.relics.map((r) => {
              const item = relicDescriptor(r, lang)
              return <ItemIcon key={r.id} static size={44} {...item} title={`${item.name}: ${item.description}`} />
            })}
            {state.consumables.map((c) => {
              const item = consumableDescriptor(c, lang)
              return <ItemIcon key={c.instanceId} static size={36} {...item} title={`${item.name}: ${item.description}`} />
            })}
          </div>
        </Section>
      )}

      <div className="grid w-full grid-cols-1 gap-7 text-left md:grid-cols-2">
        <Section title={t('elementa.summary.met')} delay={0.3}>
          <div className="flex flex-col gap-2">
            {[...keeperVisits.entries()].map(([id, n]) => (
              <div key={id} className="el-well flex items-center gap-3 px-3 py-2">
                <KeeperSprite id={id} size={id === 'conclave' ? 40 : 32} />
                <span className="flex flex-col leading-tight">
                  <span className="text-base text-[var(--gold-hi)]">{KEEPERS[id].name[lang]}</span>
                  <span className="text-sm text-[var(--text-mute)]">
                    {t('elementa.summary.visits').replace('{n}', n)}
                  </span>
                </span>
              </div>
            ))}
            {bosses.map((b) => (
              <div key={b.id} className="el-well flex items-center gap-3 px-3 py-2">
                <BossAvatar id={b.id} size={32} />
                <span className="flex flex-col leading-tight">
                  <span className="text-base text-[#ffb0b0]">{b.name}</span>
                  <span className="text-sm text-[var(--text-mute)]">{b.description}</span>
                </span>
              </div>
            ))}
            {keeperVisits.size === 0 && bosses.length === 0 && (
              <p className="text-base text-[var(--text-mute)]">{t('elementa.summary.nobody')}</p>
            )}
          </div>
        </Section>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          {(state.boons || []).length > 0 ? (
            <BoonsList state={state} all summary />
          ) : (
            <section className="flex flex-col gap-3">
              <h3 className="el-label">{t('elementa.boons.title')}</h3>
              <p className="text-base text-[var(--text-mute)]">{t('elementa.summary.noBoons')}</p>
            </section>
          )}
        </motion.div>
      </div>

      {victory && <BackupReminder />}

      <div className="flex flex-wrap justify-center gap-4">
        {/* Endless only follows the Neutral ending; the others close the run. */}
        {victory && (endingDef?.id ?? 'neutral') === 'neutral' && (
          <button
            type="button"
            onClick={() => {
              playClick()
              dispatch({ type: 'CONTINUE_ENDLESS' })
            }}
            className="el-btn el-btn--arcane el-btn--lg"
          >
            {t('elementa.gameOver.endless')}
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            playClick()
            dispatch({ type: 'GO_TO_HUB' })
          }}
          className="el-btn el-btn--gold el-btn--lg"
        >
          {t('elementa.gameOver.returnHome')}
        </button>
      </div>
      {victory && <p className="text-sm text-[var(--text-mute)]">{t('elementa.gameOver.endlessHint')}</p>}
    </motion.div>
  )
}
