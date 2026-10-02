import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../../i18n/LanguageContext.jsx'
import { playClick } from '../utils/sound.js'
import { ElementOrbs } from './MainMenu.jsx'

const LINKS = {
  linkedin: 'https://linkedin.com/in/carlos-alberto-de-la-peña-gonzález',
  github: 'https://github.com/CharlosXZD',
}

export default function CreditsScreen({ dispatch }) {
  const { t } = useLanguage()
  const credits = [
    { role: t('elementa.credits.roleDesign'), name: 'Carlos A. de la Peña González' },
    { role: t('elementa.credits.roleTesters'), name: 'Ermal' },
    { role: t('elementa.credits.roleInspiration'), name: 'Balatro, Ultrapool, The Binding of Isaac' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
      className="el-panel flex w-full max-w-md flex-col items-center gap-8 px-8 py-10 text-center"
    >
      <h2 className="pixel-heading text-base text-[var(--gold-1)]">{t('elementa.menu.credits')}</h2>
      <ul className="flex flex-col gap-6">
        {credits.map((c) => (
          <li key={c.role} className="flex flex-col gap-2">
            <div className="el-label">{c.role}</div>
            <div className="text-lg">{c.name}</div>
          </li>
        ))}
      </ul>
      <ElementOrbs size={16} />

      <section className="flex w-full flex-col gap-3">
        <h3 className="el-label">{t('elementa.credits.links')}</h3>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/" className="el-btn el-btn--gold el-btn--sm">
            {t('elementa.credits.website')}
          </Link>
          <a href={LINKS.linkedin} target="_blank" rel="noreferrer" className="el-btn el-btn--sm">
            LinkedIn
          </a>
          <a href={LINKS.github} target="_blank" rel="noreferrer" className="el-btn el-btn--sm">
            GitHub
          </a>
        </div>
      </section>

      <button
        type="button"
        onClick={() => {
          playClick()
          dispatch({ type: 'BACK_TO_MENU' })
        }}
        className="el-btn el-btn--ghost"
      >
        {t('elementa.common.back')}
      </button>
    </motion.div>
  )
}
