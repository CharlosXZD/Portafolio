import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../../../i18n/LanguageContext.jsx'
import { playClick } from '../utils/sound.js'
import { ELEMENTS, describeElement } from '../data/elements.js'
import { RELICS, RARITY_ORDER, RARITY_GLOW } from '../data/relics.js'
import { CONSUMABLES } from '../data/consumables.js'
import { DECKS } from '../data/decks.js'
import { dieDescriptor, relicDescriptor, consumableDescriptor } from '../data/itemDescriptors.js'
import { localize, ELEMENTS_ES, localizeDeck, localizeReaction } from '../data/i18n.js'
import { REACTIONS } from '../data/reactions.js'
import PixelIcon from './PixelIcon.jsx'
import { readProfile, completion, isDeckUnlocked, TOTALS } from '../utils/profile.js'
import ItemIcon from './ItemIcon.jsx'

const RARITY_LABEL = {
  en: { common: 'Common', uncommon: 'Uncommon', rare: 'Rare', epic: 'Epic', legendary: 'Legendary' },
  es: { common: 'Común', uncommon: 'Poco común', rare: 'Raro', epic: 'Épico', legendary: 'Legendario' },
}

const byRarity = (a, b) => RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity)

function ProgressBar({ pct }) {
  const segments = 25
  const lit = Math.round((pct / 100) * segments)
  return (
    <div
      className="flex w-full gap-[3px] bg-[var(--stone-0)] p-[3px]"
      style={{ boxShadow: '0 -3px 0 0 var(--ink), 0 3px 0 0 var(--ink), -3px 0 0 0 var(--ink), 3px 0 0 0 var(--ink)' }}
    >
      {Array.from({ length: segments }).map((_, i) => (
        <span key={i} className="h-3 flex-1" style={{ background: i < lit ? 'var(--gold-2)' : '#2a2338' }} />
      ))}
    </div>
  )
}

/** A locked, undiscovered tile: same footprint as an item, no details. */
function MysteryTile({ size = 56 }) {
  return <ItemIcon static size={size} glyph="?" color="#6e6480" />
}

function Detail({ entry, lang, t }) {
  if (!entry) {
    return <p className="text-base text-[var(--text-mute)]">{t('elementa.gallery.pickOne')}</p>
  }
  if (!entry.seen) {
    return (
      <div className="flex flex-col gap-3">
        <div className="pixel-heading text-[10px] text-[var(--text-mute)]">???</div>
        <p className="text-base text-[var(--text-dim)]">{t('elementa.gallery.undiscovered')}</p>
      </div>
    )
  }
  const { item, extra } = entry
  const glow = RARITY_GLOW[item.rarity] || RARITY_GLOW.common
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <ItemIcon static size={72} icon={item.icon} sprite={item.sprite} glyph={item.glyph} color={item.color} rarity={item.rarity} />
        <div className="flex flex-col gap-2">
          <h3 className="pixel-heading text-[10px] leading-relaxed">{item.name}</h3>
          <span className="el-chip self-start text-[var(--ink)]" style={{ background: glow }}>
            {RARITY_LABEL[lang][item.rarity]}
          </span>
        </div>
      </div>
      <p className="text-base leading-snug text-[var(--text)]">{item.description}</p>
      {extra}
    </div>
  )
}

export default function GalleryScreen({ onBack }) {
  const { t, lang } = useLanguage()
  const [profile] = useState(readProfile)
  const [tab, setTab] = useState('dice')
  const [selectedKey, setSelectedKey] = useState(null)
  const { pct, parts } = completion(profile)

  const entries = useMemo(() => {
    const seen = {
      dice: new Set(profile.seen.dice),
      relics: new Set(profile.seen.relics),
      consumables: new Set(profile.seen.consumables),
    }
    if (tab === 'dice') {
      return Object.keys(ELEMENTS).map((id) => {
        const def = ELEMENTS[id]
        const { flagLines } = describeElement(id, lang)
        const parents = def.parents
          .map((p) => localize(lang, ELEMENTS[p].name, ELEMENTS_ES, p, 'name'))
          .join(' + ')
        return {
          key: id,
          seen: seen.dice.has(id),
          item: dieDescriptor(id, lang),
          extra: (
            <div className="flex flex-col gap-2">
              {parents && (
                <div className="text-base text-[var(--gold-1)]">
                  {t('elementa.gallery.fusionOf')} {parents}
                </div>
              )}
              <ul className="flex flex-col gap-1 text-base text-[var(--text-dim)]">
                {flagLines.map((line) => (
                  <li key={line} className="before:mr-1.5 before:text-[var(--gold-2)] before:content-['+']">
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          ),
        }
      })
    }
    if (tab === 'relics') {
      return [...RELICS].sort(byRarity).map((r) => ({ key: r.id, seen: seen.relics.has(r.id), item: relicDescriptor(r, lang) }))
    }
    return [...CONSUMABLES]
      .sort(byRarity)
      .map((c) => ({ key: c.id, seen: seen.consumables.has(c.id), item: consumableDescriptor(c, lang) }))
  }, [tab, lang, profile, t])

  const selected = entries.find((e) => e.key === selectedKey) ?? null

  const TABS = [
    { id: 'dice', label: t('elementa.gallery.dice'), count: parts.dice, total: TOTALS.dice },
    { id: 'relics', label: t('elementa.gallery.relics'), count: parts.relics, total: TOTALS.relics },
    { id: 'consumables', label: t('elementa.gallery.consumables'), count: parts.consumables, total: TOTALS.consumables },
    { id: 'loadouts', label: t('elementa.gallery.loadouts'), count: parts.decks, total: TOTALS.decks },
    { id: 'reactions', label: t('elementa.gallery.reactions') },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
      className="flex w-full max-w-5xl flex-col gap-8"
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <h2 className="pixel-heading text-xl text-[var(--gold-1)] sm:text-2xl">{t('elementa.menu.gallery')}</h2>
        <div className="flex w-full max-w-md flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="el-label">{t('elementa.gallery.completion')}</span>
            <span className="pixel-score text-xs text-[var(--gold-1)]">{pct}%</span>
          </div>
          <ProgressBar pct={pct} />
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        {TABS.map((tb) => (
          <button
            key={tb.id}
            type="button"
            onClick={() => {
              playClick()
              setTab(tb.id)
              setSelectedKey(null)
            }}
            aria-pressed={tab === tb.id}
            className={`el-btn el-btn--sm ${tab === tb.id ? 'el-btn--gold' : ''}`}
          >
            {tb.label}
            {tb.total != null && (
              <span className="el-key">
                {tb.count}/{tb.total}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === 'reactions' ? (
        <div className="flex flex-col gap-5">
          <p className="text-center text-base text-[var(--text-dim)]">{t('elementa.gallery.reactionsIntro')}</p>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {REACTIONS.map((raw) => {
              const r = localizeReaction(raw, lang)
              return (
                <div key={r.id} className="el-panel flex flex-col gap-3 p-4" style={{ '--edge': r.color }}>
                  <div className="flex items-center gap-3">
                    {r.elements ? (
                      r.elements.map((el, j) => (
                        <span key={el} className="flex items-center gap-3">
                          {j > 0 && <span className="pixel-score text-[10px] text-[var(--text-mute)]">+</span>}
                          <PixelIcon name={el} size={21} color={el === 'earth' ? '#c89a5c' : ELEMENTS[el].color} hi="#fff4d6" />
                        </span>
                      ))
                    ) : (
                      <span className="text-base text-[var(--text-dim)]">{t('elementa.gallery.sameKind')}</span>
                    )}
                  </div>
                  <div className="pixel-heading text-[10px]" style={{ color: r.color }}>
                    {r.name}
                  </div>
                  <div className="text-base leading-snug text-[var(--text)]">{r.description}</div>
                </div>
              )
            })}
          </div>
        </div>
      ) : tab === 'loadouts' ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {DECKS.map((raw, i) => {
            const deck = localizeDeck(raw, lang)
            const unlocked = isDeckUnlocked(deck.id, profile)
            const beaten = profile.decksBeaten.includes(deck.id)
            return (
              <div key={deck.id} className={`el-panel flex flex-col gap-3 p-4 ${unlocked ? '' : 'el-panel--dark opacity-50'}`}>
                <div className="flex items-center justify-between">
                  <span className="el-label">#{i + 1}</span>
                  <span
                    className="el-chip text-[var(--ink)]"
                    style={{ background: beaten ? 'var(--good)' : unlocked ? 'var(--gold-2)' : 'var(--stone-3)' }}
                  >
                    {beaten ? t('elementa.title.cleared') : unlocked ? t('elementa.gallery.unlocked') : t('elementa.gallery.locked')}
                  </span>
                </div>
                <div className="flex gap-2">
                  {deck.dice.map((id, j) => {
                    const item = dieDescriptor(id, lang)
                    return unlocked ? (
                      <ItemIcon key={j} static size={24} icon={item.icon} sprite={item.sprite} glyph={item.glyph} color={item.color} rarity={item.rarity} />
                    ) : (
                      <MysteryTile key={j} size={24} />
                    )
                  })}
                </div>
                <div className="pixel-heading text-[10px]">{unlocked ? deck.name : '???'}</div>
                <div className="text-base leading-snug text-[var(--text-dim)]">{unlocked ? deck.tagline : ''}</div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
          <div className="el-panel--dark el-panel flex flex-wrap content-start gap-4 p-5">
            {entries.map((e) =>
              e.seen ? (
                <div key={e.key} className={selectedKey === e.key ? 'outline outline-2 outline-offset-4 outline-[var(--gold-1)]' : ''}>
                  <ItemIcon
                    size={56}
                    icon={e.item.icon} sprite={e.item.sprite}
                    glyph={e.item.glyph}
                    color={e.item.color}
                    rarity={e.item.rarity}
                    title={e.item.name}
                    onClick={() => {
                      playClick()
                      setSelectedKey(e.key)
                    }}
                  />
                </div>
              ) : (
                <button
                  key={e.key}
                  type="button"
                  onClick={() => setSelectedKey(e.key)}
                  aria-label={t('elementa.gallery.undiscovered')}
                  className={selectedKey === e.key ? 'outline outline-2 outline-offset-4 outline-[var(--text-mute)]' : ''}
                >
                  <MysteryTile />
                </button>
              ),
            )}
          </div>
          <aside className="el-panel p-5 lg:sticky lg:top-4 lg:self-start">
            <Detail entry={selected} lang={lang} t={t} />
          </aside>
        </div>
      )}

      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => {
            playClick()
            onBack()
          }}
          className="el-btn el-btn--ghost"
        >
          {t('elementa.common.back')}
        </button>
      </div>
    </motion.div>
  )
}
