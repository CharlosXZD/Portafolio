import { tierById } from '../data/diceTiers.js'

// A die for a test save: the shape the reducer's own dice have.
export const makeDieForTest = (elementId, tierId, k) => ({
  id: `test-${elementId}-${k}`,
  elementId,
  tierId,
  sides: tierById(tierId).sides,
  edition: null,
  held: false,
  locked: false,
  lockedVia: null,
  value: 1,
  total: 1,
  explosions: 0,
  rollId: 0,
  runes: [],
  ...(elementId.startsWith('sigil_') ? { symbol: 'sun', spirals: 0 } : {}),
})
export { makeDieForTest as default }
