// Die *size* is orthogonal to element (see GDD.md §4).
export const DICE_TIERS = [
  { id: 'd3', sides: 3, label: 'D3', upgradeCost: null, sellValue: 2 },
  { id: 'd5', sides: 5, label: 'D5', upgradeCost: 4, sellValue: 3 },
  { id: 'd6', sides: 6, label: 'D6', upgradeCost: 6, sellValue: 3 },
  { id: 'd10', sides: 10, label: 'D10', upgradeCost: 12, sellValue: 6 },
  { id: 'd20', sides: 20, label: 'D20', upgradeCost: 20, sellValue: 10 },
  // Past d20 (EXPANSION.md H5, M2): any die grows this far in the Firmament,
  // in steps of 10. Growing costs the new size.
  { id: 'd30', sides: 30, label: 'D30', upgradeCost: 30, sellValue: 15, bigOnly: true },
  { id: 'd40', sides: 40, label: 'D40', upgradeCost: 40, sellValue: 20, bigOnly: true },
  { id: 'd50', sides: 50, label: 'D50', upgradeCost: 50, sellValue: 25, bigOnly: true },
  { id: 'd60', sides: 60, label: 'D60', upgradeCost: 60, sellValue: 30, bigOnly: true },
  { id: 'd70', sides: 70, label: 'D70', upgradeCost: 70, sellValue: 35, bigOnly: true },
  { id: 'd80', sides: 80, label: 'D80', upgradeCost: 80, sellValue: 40, bigOnly: true },
  { id: 'd90', sides: 90, label: 'D90', upgradeCost: 90, sellValue: 45, bigOnly: true },
  { id: 'd100', sides: 100, label: 'D100', upgradeCost: 100, sellValue: 50, bigOnly: true },
]

/** The next size up; `big` lets a die grow past d20 (H5). */
export function nextTier(tierId, big = false) {
  const idx = DICE_TIERS.findIndex((t) => t.id === tierId)
  if (idx === -1 || idx === DICE_TIERS.length - 1) return null
  const next = DICE_TIERS[idx + 1]
  return next.bigOnly && !big ? null : next
}

/** A die past d20 (H5): drawn as a d20 with its size printed on it. */
export const isBigTier = (tierId) => Boolean(tierById(tierId)?.bigOnly)

export function prevTier(tierId) {
  const idx = DICE_TIERS.findIndex((t) => t.id === tierId)
  if (idx <= 0) return null
  return DICE_TIERS[idx - 1]
}

export function tierById(tierId) {
  return DICE_TIERS.find((t) => t.id === tierId)
}

// Selling always pays out less than buying (see GDD.md §6).
// Fusion dice sell for a premium since they cost more to acquire.
export function sellValueForDie(die, isFusion) {
  const tier = tierById(die.tierId)
  const base = tier?.sellValue ?? 1
  return isFusion ? Math.round(base * 1.5) : base
}
