import { motion } from 'framer-motion'
import { useLanguage } from '../../../i18n/LanguageContext.jsx'
import { playClick } from '../utils/sound.js'
import { dieDescriptor } from '../data/itemDescriptors.js'
import ItemIcon from './ItemIcon.jsx'
import { Stat } from './RoundHUD.jsx'
import BackupReminder from './BackupReminder.jsx'

export default function GameOverScreen({ state, dispatch, victory = false }) {
  const { t, lang } = useLanguage()
  const roundsSurvived = victory ? state.round - 1 : state.round

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', bounce: 0.3, duration: 0.6 }}
      className="el-panel flex w-full max-w-md flex-col items-center gap-7 px-8 py-10 text-center"
    >
      <h2
        className={victory ? 'el-logo text-xl' : 'pixel-heading text-xl'}
        style={victory ? undefined : { color: 'var(--bad)' }}
      >
        {victory ? t('elementa.gameOver.victory') : t('elementa.gameOver.outOfLives')}
      </h2>

      <div className="grid w-full grid-cols-2 gap-3">
        <Stat label={t('elementa.gameOver.rounds')}>{roundsSurvived}</Stat>
        {state.lastResult ? (
          <Stat label={t('elementa.gameOver.lastScore')} accent="var(--gold-1)">
            {state.lastResult.roundScore}
          </Stat>
        ) : (
          <Stat label={t('elementa.hud.shards')} accent="var(--gold-1)">
            {state.shards}
          </Stat>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {state.dice.map((die) => {
          const item = dieDescriptor(die.elementId, lang)
          return <ItemIcon key={die.id} static size={32} icon={item.icon} sprite={item.sprite} glyph={item.glyph} color={item.color} rarity={item.rarity} title={item.name} />
        })}
      </div>

      {victory && <BackupReminder />}

      <button
        type="button"
        onClick={() => {
          playClick()
          dispatch({ type: 'RETURN_HOME' })
        }}
        className="el-btn el-btn--gold el-btn--lg"
      >
        {t('elementa.gameOver.returnHome')}
      </button>
    </motion.div>
  )
}
