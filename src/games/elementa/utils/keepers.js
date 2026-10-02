// Keepers remember you (GDD §28). Each save file stores, per keeper, how
// many shop visits you have made and how many lore lines they have told.
// A visit is counted once per shop (keyed by seed + round), so reloading a
// save mid-shop doesn't count twice and shows the same line again.
import { KEEPERS, keeperTier } from '../data/keepers.js'
import { readProfile } from './profile.js'
import { updateProfile } from './saveManager.js'

function emptyMemory() {
  return { visits: 0, lore: 0, visitKey: null, line: null }
}

export function keeperMemory(profile, keeperId) {
  return { ...emptyMemory(), ...(profile?.keepers?.[keeperId] || {}) }
}

// Which line a keeper says on visit number `visits` (1 = first ever).
function chooseLine(keeper, mem, visits, context) {
  if (visits === 1) return { kind: 'intro' }
  const nextLore = keeper.loreAt[mem.lore]
  if (nextLore != null && visits >= nextLore && mem.lore < keeper.lore.length) {
    return { kind: 'lore', index: mem.lore }
  }
  if (context.afterBoss) return { kind: 'afterBoss' }
  if (context.lowLives) return { kind: 'lowLives' }
  const tier = keeperTier(visits)
  return { kind: 'greet', tier, index: visits % keeper.greet[tier].length }
}

export function lineText(keeper, line, lang) {
  if (!line) return ''
  const pick =
    line.kind === 'intro'
      ? keeper.intro
      : line.kind === 'lore'
        ? keeper.lore[line.index]
        : line.kind === 'greet'
          ? keeper.greet[line.tier][line.index]
          : keeper[line.kind]
  return pick?.[lang] ?? pick?.en ?? ''
}

/**
 * Records a visit (once per `visitKey`) and returns what the keeper says,
 * plus the updated memory. Without a save slot the keeper still talks, but
 * as if meeting you for the first time.
 */
export function visitKeeper(slot, keeperId, visitKey, context = {}) {
  const keeper = KEEPERS[keeperId]
  if (!keeper) return null
  if (slot == null) return { keeper, line: { kind: 'intro' }, memory: { ...emptyMemory(), visits: 1 } }
  const before = keeperMemory(readProfile(slot), keeperId)
  if (before.visitKey === visitKey && before.line) return { keeper, line: before.line, memory: before }
  const visits = before.visits + 1
  const line = chooseLine(keeper, before, visits, context)
  const memory = {
    visits,
    lore: before.lore + (line.kind === 'lore' ? 1 : 0),
    visitKey,
    line,
  }
  updateProfile(slot, (p) => ({ ...p, keepers: { ...(p.keepers || {}), [keeperId]: memory } }))
  return { keeper, line, memory }
}
