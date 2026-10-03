// Die *size* is orthogonal to element (see GDD.md §4).
export const DICE_TIERS = [
  { id: 'd3', sides: 3, label: 'D3', upgradeCost: null, sellValue: 2 },
  { id: 'd5', sides: 5, label: 'D5', upgradeCost: 4, sellValue: 3 },
  { id: 'd6', sides: 6, label: 'D6', upgradeCost: 6, sellValue: 3 },
  { id: 'd10', sides: 10, label: 'D10', upgradeCost: 12, sellValue: 6 },
  { id: 'd20', sides: 20, label: 'D20', upgradeCost: 20, sellValue: 10 },
]

export function nextTier(tierId) {
  const idx = DICE_TIERS.findIndex((t) => t.id === tierId)
  if (idx === -1 || idx === DICE_TIERS.length - 1) return null
  return DICE_TIERS[idx + 1]
}

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
