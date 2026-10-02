import { useLanguage } from '../../../i18n/LanguageContext.jsx'
import { ACHIEVEMENTS, localizeAchievement } from '../data/achievements.js'
import PixelSprite from './PixelSprite.jsx'

/** Every achievement for a save file: unlocked ones in color, locked ones
 * dimmed, secret ones fully hidden until earned. */
export default function AchievementsList({ profile }) {
  const { t, lang } = useLanguage()
  const unlocked = new Set(profile.achievements)
  const publicCount = ACHIEVEMENTS.filter((a) => !a.secret).length
  const done = ACHIEVEMENTS.filter((a) => !a.secret && unlocked.has(a.id)).length

  return (
    <div className="flex flex-col gap-5">
      <p className="text-center text-base text-[var(--text-dim)]">
        {t('elementa.achievements.progress').replace('{n}', done).replace('{total}', publicCount)}
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ACHIEVEMENTS.map((raw) => {
          const a = localizeAchievement(raw, lang)
          const got = unlocked.has(a.id)
          const hidden = a.secret && !got
          return (
            <div
              key={a.id}
              className={`el-panel flex items-center gap-3 p-3 ${got ? '' : 'el-panel--dark opacity-60'}`}
              style={got ? { '--edge': 'var(--gold-1)' } : undefined}
            >
              <span className="el-well flex h-12 w-12 shrink-0 items-center justify-center">
                {hidden ? (
                  <span className="pixel-score text-sm text-[var(--text-mute)]">?</span>
                ) : (
                  <span style={got ? undefined : { filter: 'grayscale(1) brightness(0.6)' }}>
                    <PixelSprite name={a.sprite[0]} color={a.sprite[1]} accent={a.sprite[2]} accent2={a.sprite[3]} size={36} />
                  </span>
                )}
              </span>
              <div className="flex min-w-0 flex-col gap-1">
                <span className="pixel-heading text-[9px] leading-relaxed">{hidden ? '???' : a.name}</span>
                <span className="text-sm leading-snug text-[var(--text-dim)]">
                  {hidden ? t('elementa.achievements.secret') : a.description}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
