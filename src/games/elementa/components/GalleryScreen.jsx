import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../../../i18n/LanguageContext.jsx'
import { playClick } from '../utils/sound.js'
import { ELEMENTS, PURE_ELEMENT_IDS, COSMIC_BASE_IDS, rarityForElement, familiesOf } from '../data/elements.js'
import { RELICS, RARITY_ORDER, RARITY_GLOW } from '../data/relics.js'
import { CONSUMABLES, CONSUMABLE_FAMILIES, consumableFamily } from '../data/consumables.js'
import { DECKS } from '../data/decks.js'
import { REACTIONS, FIRMAMENT_REACTION_IDS, CLASSIC_SECRET_IDS } from '../data/reactions.js'
import { BOSS_MODIFIERS, PRIMORDIAL, GOD_TRIALS, WARDENS } from '../data/bossModifiers.js'
import { ENDINGS, visibleEndingIds } from '../data/endings.js'
import CompletionMarks from './CompletionMarks.jsx'
import { EndingCard, EndingArt } from './EndingCards.jsx'
import { dieDescriptor, relicDescriptor, consumableDescriptor } from '../data/itemDescriptors.js'
import { localize, ELEMENTS_ES, localizeDeck, localizeReaction, localizeBossModifier } from '../data/i18n.js'
import { readProfile, completion, isDeckUnlocked, knowsRecipe, crossedDoor, TOTALS } from '../utils/profile.js'
import ItemIcon from './ItemIcon.jsx'
import PixelIcon from './PixelIcon.jsx'
import BossAvatar from './BossAvatar.jsx'
import AchievementsList from './AchievementsList.jsx'
import KeeperSprite from './KeeperSprite.jsx'
import FamilyTags from './FamilyTag.jsx'
import RichText from './RichText.jsx'
import StarSticker from './StarSticker.jsx'
import { DieDetails } from './DieInfo.jsx'
import { KEEPERS, KEEPER_IDS } from '../data/keepers.js'
import { keeperMemory } from '../utils/keepers.js'
import { SCENES, SCENE_IDS } from '../data/story.js'
import StoryScene from './StoryScene.jsx'

const RARITY_LABEL = {
  en: { common: 'Common', uncommon: 'Uncommon', rare: 'Rare', epic: 'Epic', legendary: 'Legendary', divine: 'Divine', mythic: 'Mythic' },
  es: { common: 'Común', uncommon: 'Poco común', rare: 'Raro', epic: 'Épico', legendary: 'Legendario', divine: 'Divino', mythic: 'Mítico' },
}

// An element "family" is the pure element plus every fusion made from it.
// Relic text like "Water-family die" means any die in that family.
const FAMILY_TEXT = {
  en: {
    fire: 'Fire and every fusion made with Fire. They explode on their max face; the ones that fizzle on a 1 refund a reroll when they do (Kindling).',
    water: 'Water and every fusion made with Water. They can lock for free, and locking refunds a reroll. A locked one also sends half its score to Mult (Tide).',
    earth: 'Earth and every fusion made with Earth. Steady value with no downside, +2 for every reroll they sit out this round (Patience).',
    air: 'Air and every fusion made with Air. They switch on set bonuses, and once per round you can nudge one up or down by 1, or to its top face (Drift).',
    arcane: 'No element and no family. Arcane dice care about where they sit in your row.',
    neutral: 'Not tied to any element.',
    mythic: 'The Firmament\'s dice: no element, one of each per run, each the prize of a Warden.',
    poker: 'Faces 9 to Ace. Poker dice together make poker hands, and a Joker is wild. Sold in Elementa too.',
    celestial: 'Dice of the Firmament sky: no element, sold only past the door. Each bends the rules around it.',
  },
  es: {
    fire: 'Fuego y toda fusión hecha con Fuego. Explotan en su cara máxima; los que se apagan con un 1 devuelven un reroll al hacerlo (Yesca).',
    water: 'Agua y toda fusión hecha con Agua. Se bloquean gratis, y bloquear devuelve un reroll. Uno bloqueado también manda la mitad de su puntaje al Mult (Marea).',
    earth: 'Tierra y toda fusión hecha con Tierra. Valor estable sin desventajas, +2 por cada reroll que se quedan fuera esta ronda (Paciencia).',
    air: 'Aire y toda fusión hecha con Aire. Activan los bonos de set, y una vez por ronda puedes mover uno 1 arriba o abajo, o hasta su cara máxima (Deriva).',
    arcane: 'Sin elemento ni familia. A los dados Arcanos les importa dónde están en tu fila.',
    neutral: 'No está ligado a ningún elemento.',
    mythic: 'Los dados del Firmamento: sin elemento, uno de cada tipo por partida, cada uno el premio de un Custodio.',
    poker: 'Caras del 9 al As. Los dados de póker juntos forman manos de póker, y un Comodín es salvaje. También se venden en Elementa.',
    celestial: 'Dados del cielo del Firmamento: sin elemento, solo se venden más allá de la puerta. Cada uno dobla las reglas a su alrededor.',
  },
}

const byRarity = (a, b) => RARITY_ORDER.indexOf(a.item.rarity) - RARITY_ORDER.indexOf(b.item.rarity)

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

function Detail({ entry, lang, t }) {
  if (!entry) return <p className="text-base text-[var(--text-mute)]">{t('elementa.gallery.pickOne')}</p>
  if (!entry.seen) {
    return (
      <div className="flex flex-col gap-3">
        <div className="pixel-heading text-[10px] text-[var(--text-mute)]">???</div>
        <p className="text-base text-[var(--text-dim)]">{entry.hint ?? t('elementa.gallery.undiscovered')}</p>
      </div>
    )
  }
  const { item, extra, art, sticker } = entry
  const glow = RARITY_GLOW[item.rarity] || RARITY_GLOW.common
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        {art ?? <ItemIcon static size={72} icon={item.icon} sprite={item.sprite} glyph={item.glyph} color={item.color} rarity={item.rarity} />}
        <div className="flex flex-col gap-2">
          <h3 className="pixel-heading text-[10px] leading-relaxed">{item.name}</h3>
          {item.rarity && (
            <span className="el-chip self-start text-[var(--ink)]" style={{ background: glow }}>
              {RARITY_LABEL[lang][item.rarity]}
            </span>
          )}
        </div>
      </div>
      <p className="text-base leading-snug text-[var(--text)]">
        <RichText text={item.description} />
      </p>
      {sticker && (
        <div className="flex items-center gap-2 text-base text-[var(--gold-1)]">
          <StarSticker size={18} />
          {t('elementa.gallery.cataclysmSticker')}
        </div>
      )}
      {extra}
    </div>
  )
}

/** A titled row of tiles (one rarity, one family, or everything). */
function Group({ title, color, note, entries, selectedKey, onSelect }) {
  return (
    <section className="flex flex-col gap-3">
      {title && (
        <div className="flex flex-col gap-1">
          <h3 className="el-label" style={color ? { color } : undefined}>
            {title}
          </h3>
          {note && <p className="text-sm leading-snug text-[var(--text-mute)]">{note}</p>}
        </div>
      )}
      <div className="flex flex-wrap gap-4">
        {entries.map((e) => {
          const selected = selectedKey === e.key
          return (
            <button
              key={e.key}
              type="button"
              onClick={() => {
                playClick()
                onSelect(e.key)
              }}
              className={`relative ${selected ? 'outline outline-2 outline-offset-4 outline-[var(--gold-1)]' : ''}`}
              aria-label={e.seen ? e.item.name : '???'}
            >
              {e.sticker && e.seen && <StarSticker size={18} className="absolute -right-2 -top-2 z-10" />}
              {e.tile ??
                (e.seen ? (
                  <ItemIcon static size={56} icon={e.item.icon} sprite={e.item.sprite} glyph={e.item.glyph} color={e.item.color} rarity={e.item.rarity} />
                ) : (
                  <ItemIcon static size={56} glyph="?" color="#6e6480" />
                ))}
            </button>
          )
        })}
      </div>
    </section>
  )
}

/**
 * The per-file Gallery: every die, relic, consumable, boss, and reaction,
 * discovered or not, grouped by rarity or family, plus loadouts and
 * achievements. `slot` is the save file whose discoveries to show.
 */
export default function GalleryScreen({ slot, onBack, embedded = false }) {
  const { t, lang } = useLanguage()
  const [profile] = useState(() => readProfile(slot))
  // A story scene being replayed from the Endings tab (G Q4a).
  const [replay, setReplay] = useState(null)
  const [tab, setTab] = useState('dice')
  const [sort, setSort] = useState('rarity')
  const [selectedKey, setSelectedKey] = useState(null)
  const { pct, parts } = completion(profile)

  const seen = useMemo(
    () => ({
      dice: new Set(profile.seen.dice),
      relics: new Set(profile.seen.relics),
      consumables: new Set(profile.seen.consumables),
      bosses: new Set(profile.seen.bosses || []),
      reactions: new Set(profile.seen.reactions || []),
    }),
    [profile],
  )
  const classicSeen = CLASSIC_SECRET_IDS.filter((id) => seen.reactions.has(id)).length
  const firmamentSeen = FIRMAMENT_REACTION_IDS.filter((id) => seen.reactions.has(id)).length

  const entries = useMemo(() => {
    if (tab === 'dice') {
      return Object.keys(ELEMENTS).map((id) => {
        const def = ELEMENTS[id]
        const parents = def.parents.map((p) => localize(lang, ELEMENTS[p].name, ELEMENTS_ES, p, 'name')).join(' + ')
        // Dice that must be unlocked (gods, the Primordial die, Mythic dice,
        // Aether before its recipe) stay in an "Unlocks" box until found:
        // no family, no rarity, so the Gallery spoils nothing (v0.7 notes).
        // Since v0.8 a Mythic die or an element fusion (K1, K4) leaves the box
        // once the file knows its recipe.
        const forgedByRecipe = def.tier === 'mythic' || def.cosmic
        const locked =
          !seen.dice.has(id) &&
          (['god', 'primal'].includes(def.tier) ||
            ((forgedByRecipe || def.tier === 'quadra') && !knowsRecipe(profile, id)))
        return {
          key: id,
          seen: seen.dice.has(id),
          locked,
          hint: locked ? t('elementa.gallery.unlockHint') : undefined,
          families: locked ? [] : familiesOf(id),
          // Dice that helped beat Cataclysm wear a gold star (P16).
          sticker: (profile.cataclysmDice || []).includes(id),
          item: { ...dieDescriptor(id, lang), rarity: locked ? undefined : rarityForElement(id) },
          extra: (
            <div className="flex flex-col gap-2">
              <FamilyTags elementId={id} />
              {parents && (
                <div className="text-base text-[var(--gold-1)]">
                  {/* Aether's recipe is secret until Primordial falls (B6). */}
                  {def.cosmic && !knowsRecipe(profile, id)
                    ? t('elementa.gallery.recipeVesper')
                    : def.tier === 'quadra' && !knowsRecipe(profile, id)
                    ? t('elementa.gallery.recipeUnknown')
                    : `${t('elementa.gallery.fusionOf')} ${parents}`}
                </div>
              )}
              {/* The full level of detail (P5 to P9): mechanics and keywords. */}
              <DieDetails elementId={id} />
            </div>
          ),
        }
      })
    }
    if (tab === 'relics') {
      return RELICS.map((r) => ({ key: r.id, seen: seen.relics.has(r.id), families: [r.law ? 'laws' : r.element ?? 'neutral'], item: relicDescriptor(r, lang) }))
    }
    if (tab === 'consumables') {
      return CONSUMABLES.map((c) => ({ key: c.id, seen: seen.consumables.has(c.id), families: [consumableFamily(c)], item: consumableDescriptor(c, lang) }))
    }
    if (tab === 'bosses') {
      return [...BOSS_MODIFIERS, PRIMORDIAL, ...GOD_TRIALS, ...WARDENS].map((raw) => {
        const b = localizeBossModifier(raw, lang)
        const isSeen = seen.bosses.has(b.id)
        // A Warden guards a Mythic die (EXPANSION.md H2).
        const guards = raw.guards ? localize(lang, ELEMENTS[raw.guards].name, ELEMENTS_ES, raw.guards, 'name') : null
        const when = raw.stage
          ? t('elementa.gallery.bossGauntlet').replace('{n}', raw.stage)
          : guards
            ? t('elementa.gallery.bossWarden').replace('{die}', guards)
            : b.tier === 3
            ? t('elementa.gallery.bossFinal')
            : b.tier === 2
              ? t('elementa.gallery.bossTier2')
              : t('elementa.gallery.bossTier1')
        return {
          key: b.id,
          seen: isSeen,
          tile: (
            <span className="el-well flex h-16 w-16 items-center justify-center">
              <BossAvatar id={b.id} size={48} unknown={!isSeen} />
            </span>
          ),
          art: <BossAvatar id={b.id} size={72} />,
          item: { name: b.name, description: b.description },
          extra: <div className="text-base text-[#ff9a9a]">{when}</div>,
          hint: t('elementa.gallery.bossHint'),
        }
      })
    }
    if (tab === 'keepers') {
      return KEEPER_IDS.map((id) => {
        const k = KEEPERS[id]
        const mem = keeperMemory(profile, id)
        const met = mem.visits > 0
        const told = k.lore.slice(0, mem.lore)
        return {
          key: id,
          seen: met,
          tile: (
            <span className="el-well flex h-16 items-center justify-center px-1" style={{ minWidth: 64 }}>
              <span style={met ? undefined : { filter: 'brightness(0) opacity(0.35)' }}>
                <KeeperSprite id={id} size={48} />
              </span>
            </span>
          ),
          art: <KeeperSprite id={id} size={72} />,
          item: { name: k.name[lang], description: k.title[lang] },
          extra: (
            <div className="flex flex-col gap-2">
              <div className="text-base text-[var(--gold-1)]">{t('elementa.keepers.visits').replace('{n}', mem.visits)}</div>
              <div className="el-label">{t('elementa.gallery.keeperLore')}</div>
              {told.length ? (
                <ul className="flex flex-col gap-2 text-base text-[var(--text-dim)]">
                  {told.map((line) => (
                    <li key={line.en}>{line[lang]}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-base text-[var(--text-mute)]">{t('elementa.gallery.keeperNoLore')}</p>
              )}
            </div>
          ),
          hint: t('elementa.gallery.keeperUnmet'),
        }
      })
    }
    return []
  }, [tab, lang, seen, t, profile])

  const groups = useMemo(() => {
    if (!['dice', 'relics', 'consumables'].includes(tab)) return [{ key: 'all', entries }]
    const lockedEntries = entries.filter((e) => e.locked)
    const unlocks = lockedEntries.length
      ? [{ key: 'unlocks', title: t('elementa.gallery.unlocks'), note: t('elementa.gallery.unlocksNote'), entries: lockedEntries }]
      : []
    if (sort === 'name') {
      const named = entries.filter((e) => !e.locked).sort((a, b) => (a.seen ? a.item.name : '~').localeCompare(b.seen ? b.item.name : '~'))
      return [{ key: 'all', entries: named }, ...unlocks]
    }
    if (sort === 'family' && tab === 'consumables') {
      return CONSUMABLE_FAMILIES.map((f) => ({
        key: f.id,
        title: f.name[lang],
        color: f.color,
        note: f.note?.[lang] ?? null,
        entries: entries.filter((e) => e.families.includes(f.id)).sort(byRarity),
      })).filter((g) => g.entries.length > 0)
    }
    if (sort === 'family') {
      const order = tab === 'dice' ? [...PURE_ELEMENT_IDS, ...COSMIC_BASE_IDS, 'arcane', 'poker', 'celestial', 'mythic'] : [...PURE_ELEMENT_IDS, 'neutral', 'laws']
      return order
        .map((f) => ({
          key: f,
          title:
            f === 'arcane'
              ? t('elementa.gallery.arcane')
              : f === 'mythic'
                ? t('elementa.gallery.mythic')
                : f === 'poker'
                  ? t('elementa.gallery.poker')
                  : f === 'laws'
                    ? t('elementa.gallery.laws')
                : f === 'celestial'
                  ? t('elementa.gallery.celestial')
                : f === 'neutral'
                ? t('elementa.gallery.neutral')
                : `${localize(lang, ELEMENTS[f].name, ELEMENTS_ES, f, 'name')} ${t('elementa.gallery.family')}`,
          color: ELEMENTS[f]?.color === '#8a6a3d' ? '#c89a5c' : ELEMENTS[f]?.color,
          note: tab === 'dice' ? FAMILY_TEXT[lang][f] : null,
          entries: entries.filter((e) => e.families.includes(f)).sort(byRarity),
        }))
        .filter((g) => g.entries.length > 0)
        .concat(unlocks)
    }
    return RARITY_ORDER.map((r) => ({
      key: r,
      title: RARITY_LABEL[lang][r],
      color: RARITY_GLOW[r],
      entries: entries.filter((e) => e.item.rarity === r && !e.locked),
    }))
      .filter((g) => g.entries.length > 0)
      .concat(unlocks)
  }, [tab, sort, entries, lang, t])

  const selected = entries.find((e) => e.key === selectedKey) ?? null

  const TABS = [
    { id: 'dice', label: t('elementa.gallery.dice'), count: parts.dice, total: TOTALS.dice },
    { id: 'relics', label: t('elementa.gallery.relics'), count: parts.relics, total: TOTALS.relics },
    { id: 'consumables', label: t('elementa.gallery.consumables'), count: parts.consumables, total: TOTALS.consumables },
    { id: 'bosses', label: t('elementa.gallery.bosses'), count: parts.bosses, total: TOTALS.bosses },
    {
      id: 'keepers',
      label: t('elementa.gallery.keepers'),
      count: KEEPER_IDS.filter((id) => keeperMemory(profile, id).visits > 0).length,
      total: KEEPER_IDS.length,
    },
    { id: 'reactions', label: t('elementa.gallery.reactions'), count: parts.reactions, total: TOTALS.reactions },
    { id: 'loadouts', label: t('elementa.gallery.loadouts'), count: parts.decks, total: TOTALS.decks },
    { id: 'endings', label: t('elementa.gallery.endings'), count: parts.endings, total: null },
    { id: 'achievements', label: t('elementa.achievements.title'), count: parts.achievements, total: TOTALS.achievements },
  ]

  const reactionCard = (raw) => {
    const r = localizeReaction(raw, lang)
    const hidden = raw.secret && !seen.reactions.has(raw.id)
    return (
      <div key={r.id} className={`el-panel flex flex-col gap-3 p-4 ${hidden ? 'el-panel--dark opacity-70' : ''}`} style={hidden ? undefined : { '--edge': r.color }}>
        <div className="flex items-center gap-3">
          {hidden ? (
            <span className="pixel-score text-xs text-[var(--text-mute)]">? + ?</span>
          ) : raw.pair ? (
            raw.pair.map((el, j) => (
              <span key={el} className="flex items-center gap-3">
                {j > 0 && <span className="pixel-score text-[10px] text-[var(--text-mute)]">+</span>}
                {el === '*fusion' ? (
                  <span className="text-base text-[var(--text-dim)]">{t('elementa.gallery.anyFusion')}</span>
                ) : (
                  <PixelIcon name={el} size={21} color={ELEMENTS[el].color} hi="#fff4d6" />
                )}
              </span>
            ))
          ) : r.elements ? (
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
        <div className="pixel-heading text-[10px]" style={{ color: hidden ? 'var(--text-mute)' : r.color }}>
          {hidden ? '???' : r.name}
        </div>
        <div className="text-base leading-snug text-[var(--text)]">{hidden ? t(raw.firmament ? 'elementa.gallery.secretHintFirmament' : 'elementa.gallery.secretHint') : r.description}</div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
      className="flex w-full max-w-5xl flex-col gap-8"
    >
      {!embedded && (
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
      )}

      <div className="flex flex-wrap justify-center gap-3">
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
            {tb.total != null ? (
              <span className="el-key">
                {tb.count}/{tb.total}
              </span>
            ) : tb.count > 0 ? (
              <span className="el-key">{tb.count}</span>
            ) : null}
          </button>
        ))}
      </div>

      {['dice', 'relics', 'consumables'].includes(tab) && (
        <div className="flex items-center justify-center gap-3">
          <span className="el-label">{t('elementa.gallery.sortBy')}</span>
          {['rarity', 'family', 'name'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                playClick()
                setSort(s)
              }}
              className={`el-btn el-btn--sm ${sort === s ? 'el-btn--arcane' : ''}`}
            >
              {t(`elementa.gallery.sort_${s}`)}
            </button>
          ))}
        </div>
      )}

      {tab === 'reactions' ? (
        <div className="flex flex-col gap-6">
          <p className="text-center text-base text-[var(--text-dim)]">{t('elementa.gallery.reactionsIntro')}</p>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">{REACTIONS.filter((r) => !r.secret).map(reactionCard)}</div>
          <h3 className="el-label text-center text-[var(--arcane-hi)]">
            {t('elementa.gallery.secretReactions')} {classicSeen}/{CLASSIC_SECRET_IDS.length}
          </h3>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">{REACTIONS.filter((r) => r.secret && !r.firmament).map(reactionCard)}</div>
          {/* The Firmament's reactions (EXPANSION.md L5), once the file has crossed the door. */}
          {crossedDoor(profile) && (
            <>
              <h3 className="el-label text-center text-[var(--arcane-hi)]">
                {t('elementa.gallery.firmamentReactions')} {firmamentSeen}/{FIRMAMENT_REACTION_IDS.length}
              </h3>
              <p className="text-center text-base text-[var(--text-dim)]">{t('elementa.gallery.firmamentReactionsIntro')}</p>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">{REACTIONS.filter((r) => r.firmament).map(reactionCard)}</div>
            </>
          )}
        </div>
      ) : tab === 'achievements' ? (
        <AchievementsList profile={profile} />
      ) : tab === 'endings' ? (
        <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {!(profile.endings || []).length && (
            <p className="text-base text-[var(--text-mute)] md:col-span-3">{t('elementa.gallery.endingsNone')}</p>
          )}
          {ENDINGS.filter((e) => visibleEndingIds(profile.endings || []).includes(e.id)).map((e) =>
            (profile.endings || []).includes(e.id) ? (
              <EndingCard key={e.id} small color={e.color} title={e.name[lang]} text={e.text[lang]} art={<EndingArt ending={e.id} size={64} />} />
            ) : (
              <EndingCard key={e.id} small color="#6e6480" title="???" text={e.hint?.[lang] ?? t('elementa.gallery.endingHint')} art={<span className="pixel-heading text-3xl text-[var(--text-mute)]">?</span>} />
            ),
          )}
        </div>
        {/* Story scenes already seen on this file can be replayed (G Q4a). */}
        <section className="flex flex-col gap-3">
          <h3 className="el-label text-center">{t('elementa.gallery.story')}</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {SCENE_IDS.filter((id) => (profile.scenes || []).includes(id)).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  playClick()
                  setReplay(id)
                }}
                className="el-btn el-btn--sm"
                style={{ '--edge': SCENES[id].color }}
              >
                <span style={{ color: SCENES[id].color }}>{SCENES[id].pages[0].speaker[lang]}</span>
                <span className="text-[var(--text-mute)]">{SCENES[id].title[lang]}</span>
              </button>
            ))}
            {!(profile.scenes || []).length && <p className="text-base text-[var(--text-mute)]">{t('elementa.gallery.storyNone')}</p>}
          </div>
        </section>
        {replay && <StoryScene id={replay} onDone={() => setReplay(null)} />}
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
                      <ItemIcon key={j} static size={24} icon={item.icon} glyph={item.glyph} color={item.color} rarity={item.rarity} />
                    ) : (
                      <ItemIcon key={j} static size={24} glyph="?" color="#6e6480" />
                    )
                  })}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="pixel-heading text-[10px]">{unlocked ? deck.name : '???'}</span>
                  <CompletionMarks profile={profile} deckId={deck.id} />
                </div>
                <div className="text-base leading-snug text-[var(--text-dim)]">{unlocked ? deck.tagline : ''}</div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
          <div className="el-panel--dark el-panel flex flex-col gap-6 p-5">
            {groups.map((g) => (
              <Group
                key={g.key}
                title={g.title}
                color={g.color}
                note={g.note}
                entries={g.entries}
                selectedKey={selectedKey}
                onSelect={setSelectedKey}
              />
            ))}
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
          {embedded ? t('elementa.runInfo.run') : t('elementa.common.back')}
        </button>
      </div>
    </motion.div>
  )
}
