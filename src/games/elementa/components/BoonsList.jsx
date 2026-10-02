import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../../i18n/LanguageContext.jsx'
import { blessingById, dealById, PROPHECY } from '../data/shops.js'
import { bossById, PRIMORDIAL } from '../data/bossModifiers.js'
import { localizeBossModifier } from '../data/i18n.js'
import KeeperSprite from './KeeperSprite.jsx'
import BossAvatar from './BossAvatar.jsx'
import ItemInspector from './ItemInspector.jsx'
import { playClick } from '../utils/sound.js'

const SOURCE_COLOR = { nix: '#8a5cff', aeris: '#9fd8ff' }
const STATUS_COLOR = { active: '#5fd38a', pending: '#ffd166' }

// Blessings and deals that keep working for the rest of the run.
const PERMANENT = ['gale', 'hollow_pact', 'hollow_crown', 'shadow_twin', 'severed_grace', 'bound_tongue', 'clarity']
// Taken in a shop, they pay off in the round right after it.
const NEXT_ROUND = ['tide', 'loan', 'ember_ward', 'communion']
// Waiting on your next clear (B3), and which effect they left there.
const NEXT_CLEAR = { gamble: 'gamble', plenty: 'double', stolen_breath: 'double' }

/** Where a boon stands right now: 'active', 'pending' (next round), or 'spent'. */
export function boonStatus(boon, state) {
  // A betrayal pact broke it (B3).
  if (boon.broken) return 'spent'
  if (PERMANENT.includes(boon.id)) return 'active'
  if (NEXT_CLEAR[boon.id]) return (state.clearEffects || []).includes(NEXT_CLEAR[boon.id]) ? 'pending' : 'spent'
  if (boon.id === 'long_night') {
    if ((state.nextBossEffects || []).includes('long_night')) return 'pending'
    return state.longNightActive ? 'active' : 'spent'
  }
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
 * The round HUD and shop sidebar version (EXPANSION.md E1): one icon per
 * live boon (Aeris or Nix, or the foretold boss for a Prophecy) with a
 * status dot; clicking one opens the same anchored popover relics use.
 */
function BoonIcons({ state, boons }) {
  const { t, lang } = useLanguage()
  const [open, setOpen] = useState(null)
  return (
    <section className="flex flex-col gap-2">
      <h3 className="el-label">{t('elementa.boons.title')}</h3>
      <div className="flex flex-wrap gap-2 p-1">
        {boons.map((b, i) => {
          const key = `${b.id}-${b.round}-${i}`
          const { name, body, bossId } = boonText(b, lang, t)
          const status = boonStatus(b, state)
          const color = SOURCE_COLOR[b.source] ?? SOURCE_COLOR.aeris
          return (
            <div key={key} className="relative">
              <button
                type="button"
                title={name}
                aria-label={`${name}: ${t(`elementa.boons.${status}`)}`}
                onClick={() => {
                  playClick()
                  setOpen(open === key ? null : key)
                }}
                className="el-well relative flex h-11 w-11 items-center justify-center"
                style={{ boxShadow: `inset 0 -3px 0 ${color}` }}
              >
                {bossId ? <BossAvatar id={bossId} size={28} /> : <KeeperSprite id={b.source === 'nix' ? 'nix' : 'aeris'} size={28} />}
                <span
                  className="absolute -right-1 -top-1 h-2.5 w-2.5"
                  style={{ background: STATUS_COLOR[status], boxShadow: '0 0 0 2px var(--ink)' }}
                />
              </button>
              <AnimatePresence>
                {open === key && (
                  <ItemInspector
                    placement="right"
                    item={{
                      name,
                      description: body,
                      badge: { label: t(`elementa.boons.${status}`), color },
                      footnote: t('elementa.boons.round').replace('{n}', b.round),
                    }}
                    onClose={() => setOpen(null)}
                  />
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </section>
  )
}

/**
 * Aeris's blessings and Nix's deals. `all` lists every one taken (the run
 * summary); otherwise only the ones still doing something, so a
 * Prophecy or a Blessing of Wind is always one glance away. `icons` shows
 * them as a row of inspectable icons (round HUD, shop sidebar).
 */
export default function BoonsList({ state, all = false, compact = false, summary = false, icons = false }) {
  const { t, lang } = useLanguage()
  const boons = (state.boons || []).filter((b) => all || boonStatus(b, state) !== 'spent')
  if (boons.length === 0) return null
  if (icons) return <BoonIcons state={state} boons={boons} />
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
