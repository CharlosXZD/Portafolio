import PixelIcon from './PixelIcon.jsx'

/** A persistent price tag hanging above a shop item, always visible (no
 * click needed), matching how Balatro always shows a card's price. Dims
 * when the player can't afford it, so affordability reads at a glance. */
export default function PriceTag({ cost, affordable = true }) {
  if (typeof cost !== 'number') return null
  return (
    <div
      className="pixel-score absolute -top-9 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap px-2.5 pb-1.5 pt-1 text-sm"
      style={{
        background: affordable ? 'var(--gold-2)' : 'var(--stone-2)',
        color: affordable ? 'var(--ink)' : 'var(--text-mute)',
        boxShadow: affordable
          ? '0 -3px 0 0 var(--ink), 0 3px 0 0 var(--ink), -3px 0 0 0 var(--ink), 3px 0 0 0 var(--ink), inset 0 3px 0 0 var(--gold-1), inset 0 -3px 0 0 var(--gold-3)'
          : '0 -3px 0 0 var(--ink), 0 3px 0 0 var(--ink), -3px 0 0 0 var(--ink), 3px 0 0 0 var(--ink)',
      }}
    >
      <PixelIcon name="shard" size={14} />
      {cost}
    </div>
  )
}
