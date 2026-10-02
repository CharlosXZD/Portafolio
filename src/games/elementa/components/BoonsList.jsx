import { useLanguage } from '../../../i18n/LanguageContext.jsx'
import { blessingById, dealById, PROPHECY } from '../data/shops.js'
import { bossById, PRIMORDIAL } from '../data/bossModifiers.js'
import { localizeBossModifier } from '../data/i18n.js'
import KeeperSprite from './KeeperSprite.jsx'
import BossAvatar from './BossAvatar.jsx'

// Blessings and deals that keep working for the rest of the run.
const PERMANENT = ['gale', 'hollow_pact']
// Taken in a shop, they pay off in the round right after it.
const NEXT_ROUND = ['tide', 'loan']

/** Where a boon stands right now: 'active', 'pending' (next round), or 'spent'. */
export function boonStatus(boon, state) {
  if (PERMANENT.includes(boon.id)) return 'active'
  if (NEXT_ROUND.includes(boon.id)) {
    if (state.round === boon.round) return 'pending'
    if (state.round === boon.round + 1 && state.phase !== 'shop') return 'active'
    return 'spent'
  }
  if (boon.id === 'prophecy') {
    const at = boon.detail?.round
    if (state.round < at || (state.round === at && state.phase !== 'shop' && state.phase !== 'bossReward')) return 'pending'
    return 'spent'
  }
  return 'spent'
}

function boonText(boon, lang, t) {
  if (boon.id === 'prophecy') {
    const raw = boon.detail?.bossId === 'primordial' ? PRIMORDIAL : bossById(boon.detail?.bossId)
    const boss = raw ? localizeBossModifier(raw, lang) : null
    return {
      name: PROPHECY.name[lang],
      body: t('elementa.shop.prophecySays')
        .replace('{round}', boon.detail?.round)
        .replace('{boss}', boss?.name ?? '?'),
      bossId: boss?.id,
    }
  }
  const def = blessingById(boon.id) ?? dealById(boon.id)
  if (!def) return { name: boon.id, body: '' }
  return { name: def.name[lang], body: def.body[lang].replace('{shards}', boon.detail ?? '') }
}

/**
 * Aeris's blessings and Nix's deals. `all` lists every one taken (the run
 * summary); otherwise only the ones still doing something, so a
 * Prophecy or a Blessing of Wind is always one glance away.
 */
export default function BoonsList({ state, all = false, compact = false, summary = false }) {
  const { t, lang } = useLanguage()
  const boons = (state.boons || []).filter((b) => all || boonStatus(b, state) !== 'spent')
  if (boons.length === 0) return null
  return (
    <section className="flex flex-col gap-2">
      <h3 className="el-label">{t('elementa.boons.title')}</h3>
      <ul className="flex flex-col gap-2">
        {boons.map((b, i) => {
          const { name, body, bossId } = boonText(b, lang, t)
          const status = boonStatus(b, state)
          return (
            <li
              key={`${b.id}-${b.round}-${i}`}
              className="el-well flex items-start gap-2 px-2 py-2"
              style={{ boxShadow: `inset 3px 0 0 ${b.source === 'nix' ? '#8a5cff' : '#9fd8ff'}` }}
            >
              <span className="mt-0.5 shrink-0">
                {bossId ? <BossAvatar id={bossId} size={22} /> : <KeeperSprite id={b.source === 'nix' ? 'nix' : 'aeris'} size={22} />}
              </span>
              <span className="flex min-w-0 flex-col leading-snug">
                <span className="text-sm" style={{ color: b.source === 'nix' ? '#b89cff' : '#9fd8ff' }}>
                  {name}
                  {!summary && status !== 'spent' && (
                    <span className="ml-2 text-[var(--text-mute)]">{t(`elementa.boons.${status}`)}</span>
                  )}
                </span>
                {!compact && <span className="text-sm text-[var(--text-dim)]">{body}</span>}
                {all && <span className="text-sm text-[var(--text-mute)]">{t('elementa.boons.round').replace('{n}', b.round)}</span>}
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
