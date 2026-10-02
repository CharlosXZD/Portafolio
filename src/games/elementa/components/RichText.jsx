import { ELEMENTS, TIERS } from '../data/elements.js'
import { ELEMENTS_ES } from '../data/i18n.js'
import { mix } from '../utils/color.js'

// One text renderer for every description (EXPANSION.md P15): the shop
// inspector, the inventory, the table popovers, the Gallery. Numbers and
// units are gold (`+2`, `x1.5`, `50%`), element names take their element's
// color, Base and Mult take the score boxes' blue and red, and Shards are
// gold. The text arrives already localized, so both languages' words are
// matched here.
const SCORE_COLORS = { base: '#8fb8ff', mult: '#ff9a8a' }

// Element names (en + es) -> a color light enough to read on the dark panel.
const NAME_COLORS = new Map()
Object.values(ELEMENTS).forEach((def) => {
  if (def.tier === TIERS.ARCANE || def.tier === TIERS.GOD || def.tier === TIERS.PRIMAL) return
  const light = mix(def.color, '#ffffff', 0.45)
  NAME_COLORS.set(def.name, light)
  const es = ELEMENTS_ES[def.id]?.name
  if (es) NAME_COLORS.set(es, light)
})

const esc = (w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const NUMBER = String.raw`[+-]?x?\d+(?:\.\d+)?(?:x|%)?`
const SPLIT_RE = new RegExp(
  String.raw`((?<![\p{L}\d])(?:${NUMBER}|${[...NAME_COLORS.keys()].map(esc).join('|')}|Shards?|Fragmentos?|Multiplier|Multiplicador|Mult|Base)(?![\p{L}\d]))`,
  'gu',
)

function classify(part) {
  if (/^[+-]?x?\d/.test(part)) return { color: 'var(--gold-1)' }
  if (/^(Shards?|Fragmentos?)$/.test(part)) return { color: 'var(--gold-1)' }
  if (/^Base$/.test(part)) return { color: SCORE_COLORS.base }
  if (/^Mult/.test(part)) return { color: SCORE_COLORS.mult }
  if (NAME_COLORS.has(part)) return { color: NAME_COLORS.get(part) }
  return null
}

export default function RichText({ text }) {
  if (!text) return null
  return text.split(SPLIT_RE).map((part, i) => {
    // Odd indices are the captured tokens.
    if (i % 2 === 0) return part
    const style = classify(part)
    return style ? (
      <span key={i} style={style}>
        {part}
      </span>
    ) : (
      part
    )
  })
}

