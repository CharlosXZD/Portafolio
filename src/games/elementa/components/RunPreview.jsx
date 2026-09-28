import { motion } from 'framer-motion'
import { useLanguage } from '../../../i18n/LanguageContext.jsx'
import { playClick } from '../utils/sound.js'
import ItemIcon from './ItemIcon.jsx'
import { Hearts, ShardCount, Stat } from './RoundHUD.jsx'
import { dieDescriptor, relicDescriptor, consumableDescriptor } from '../data/itemDescriptors.js'
import { localizeDifficulty } from '../data/i18n.js'

function IconRow({ label, items }) {
  const { t } = useLanguage()
  return (
    <section className="flex flex-col gap-3">
      <h3 className="el-label">{label}</h3>
      {items.length > 0 ? (
        <div className="flex flex-wrap justify-center gap-3">
          {items.map(({ key, item, size = 32 }) => (
            <ItemIcon
              key={key}
              static
              size={size}
              icon={item.icon} sprite={item.sprite}
              glyph={item.glyph}
              color={item.color}
              rarity={item.rarity}
              title={item.name}
            />
          ))}
        </div>
      ) : (
        <div className="text-base text-[var(--text-mute)]">{t('elementa.common.noneYet')}</div>
      )}
    </section>
  )
}

/** "Here's where you left off" card shown before resuming a saved run. */
export default function RunPreview({ state, dispatch }) {
  const { lang, t } = useLanguage()
  const difficulty = localizeDifficulty(state.difficulty, lang)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
      className="el-panel flex w-full max-w-lg flex-col items-center gap-6 px-8 py-8 text-center"
    >
      <span className="pixel-score text-[9px] uppercase tracking-widest" style={{ color: difficulty.color }}>
        {difficulty.name}
      </span>

      <div className="grid w-full grid-cols-2 gap-3">
        <Stat label={t('elementa.runPreview.round')}>{state.round}</Stat>
        <Stat label={t('elementa.hud.target')} accent="var(--gold-1)">
          {state.threshold}
        </Stat>
      </div>

      <div className="flex items-center gap-6">
        <Hearts lives={state.lives} maxLives={state.maxLives} />
        <ShardCount value={state.shards} />
      </div>

      <IconRow
        label={t('elementa.runPreview.diceLoadout')}
        items={state.dice.map((die) => ({ key: die.id, item: dieDescriptor(die.elementId, lang), size: 40 }))}
      />
      <IconRow
        label={t('elementa.runPreview.relics')}
        items={state.relics.map((r) => ({ key: r.id, item: relicDescriptor(r, lang) }))}
      />
      {state.consumables.length > 0 && (
        <IconRow
          label={t('elementa.runPreview.consumables')}
          items={state.consumables.map((c) => ({ key: c.instanceId, item: consumableDescriptor(c, lang) }))}
        />
      )}

      <div className="mt-2 flex items-center gap-6">
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
        <button
          type="button"
          onClick={() => {
            playClick()
            dispatch({ type: 'RESUME_RUN' })
          }}
          className="el-btn el-btn--gold el-btn--lg"
        >
          {t('elementa.runPreview.continue')}
        </button>
      </div>
    </motion.div>
  )
}
