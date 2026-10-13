import { spriteDuplicates } from '../components/visuals/sprites/spriteCheck.js'
import { SPRITE_IDS } from '../components/visuals/sprites/index.js'
const r = spriteDuplicates(SPRITE_IDS())
console.log('across', r.across.length, 'within', r.within.length)
for (const p of r.within) console.log(p.a, p.b, p.color.toFixed(2))
