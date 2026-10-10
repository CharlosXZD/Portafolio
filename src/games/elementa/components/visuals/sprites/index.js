import { miniOf, silhouetteOf, sprite, W } from './spriteKit.js'
import { RECIPES } from './recipes.js'

// The item sprite registry (VISUALS.md V2.5): a recipe becomes a cached bitmap the first
// time it is asked for (about a millisecond), so there is no build queue and nothing to wait for.
const cache = new Map()

export const hasSprite = (id) => Object.prototype.hasOwnProperty.call(RECIPES, id)
export const SPRITE_IDS = () => Object.keys(RECIPES)

/** The finished 32 by 32 bitmap: { w, data (RGBA), sil, fx }. */
export function itemBitmap(id) {
  if (!hasSprite(id)) return null
  if (!cache.has(id)) {
    const S = sprite()
    RECIPES[id](S)
    cache.set(id, S.finish())
  }
  return cache.get(id)
}

export { miniOf, silhouetteOf, W }
