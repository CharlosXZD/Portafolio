import { useEffect, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../../../i18n/LanguageContext.jsx'
import { useGameSettings } from '../utils/gameSettingsContext.jsx'
import { shopTypeById } from '../data/shops.js'
import { isBossRound } from '../data/bossModifiers.js'
import { MAP_COLS, nextChoices, nodeById } from '../engine/map.js'
import KeeperSprite from './KeeperSprite.jsx'
import BossAvatar from './BossAvatar.jsx'
import PixelSprite from './PixelSprite.jsx'

// Every node reachable from the current one, walking forward.
function reachableFrom(map) {
  const out = new Set([map.currentId])
  const queue = [map.currentId]
  while (queue.length) {
    const node = nodeById(map, queue.shift())
    node?.next.forEach((id) => {
      if (!out.has(id)) {
        out.add(id)
        queue.push(id)
      }
    })
  }
  return out
}

/**
 * The Road (GDD §28), drawn bottom to top like Slay the Spire's map: each
 * row is the shop you visit after that round, lines show where each shop
 * leads. The shops linked from where you stand are the ones you can pick.
 * Boss rounds are marked on the left of the row that follows them.
 */
export default function RoadMap({
  state,
  fromRound,
  toRound: wantedTo,
  onPick,
  width = 220,
  rowHeight = 64,
  nodeSize = 40,
  scrollToCurrent = false,
}) {
  const { t, lang } = useLanguage()
  const { reducedMotion } = useGameSettings()
  const map = state.map
  // Never reserve rows past the last generated layer.
  const toRound = Math.min(wantedTo, map.layers.length)
  const scrollRef = useRef(null)
  const choices = useMemo(() => (onPick ? nextChoices(map).map((n) => n.id) : []), [map, onPick])
  const reachable = useMemo(() => reachableFrom(map), [map])
  const path = new Set(map.path)
  const prophecy = map.prophecy

  const rows = []
  for (let r = toRound; r >= fromRound; r--) if (map.layers[r - 1]) rows.push(r)
  const gutter = 44
  const inner = width - gutter - nodeSize
  const x = (col) => gutter + nodeSize / 2 + (inner * col) / (MAP_COLS - 1)
  const y = (round) => (toRound - round) * rowHeight + rowHeight / 2
  const height = rows.length * rowHeight
  // The crossing between realms: a portal between round 15's row and round 16's.
  const dividerY = rows.includes(15) && rows.includes(16) ? (y(15) + y(16)) / 2 : null

  useEffect(() => {
    if (!scrollToCurrent) return
    scrollRef.current?.querySelector('[data-here]')?.scrollIntoView({ block: 'center' })
  }, [scrollToCurrent])

  const edges = []
  rows.forEach((round) => {
    if (round === toRound) return
    map.layers[round - 1].forEach((node) => {
      node.next.forEach((id) => {
        const to = nodeById(map, id)
        if (!to) return
        const walked = path.has(node.id) && path.has(to.id)
        const live = node.id === map.currentId
        edges.push(
          <line
            key={`${node.id}>${id}`}
            x1={x(node.col)}
            y1={y(round)}
            x2={x(to.col)}
            y2={y(round + 1)}
            stroke={walked ? 'var(--gold-1)' : live ? 'var(--gold-hi)' : '#5a4a70'}
            strokeWidth={walked || live ? 3 : 2}
            strokeDasharray={walked ? undefined : '4 5'}
            opacity={walked || live ? 1 : reachable.has(node.id) ? 0.7 : 0.25}
          />,
        )
      })
    })
  })

  return (
    <div ref={scrollRef} className="relative" style={{ width, height }}>
      <svg className="absolute inset-0" width={width} height={height} aria-hidden="true">
        {edges}
        {dividerY != null && (
          <g>
            <line x1={gutter - 6} y1={dividerY} x2={width} y2={dividerY} stroke="#9a7ee0" strokeWidth={2} strokeDasharray="2 5" opacity={0.8} />
          </g>
        )}
      </svg>
      {dividerY != null && (
        <div
          className="pixel-score pointer-events-none absolute whitespace-nowrap rounded-sm px-2 py-[2px] text-[7px] uppercase tracking-wider text-[#e6d8ff]"
          style={{ top: dividerY - 8, left: width - 46, transform: 'translateX(-50%)', background: '#1a1030', boxShadow: '0 0 0 2px #9a7ee0, 0 0 10px #7a5cff' }}
        >
          {lang === 'es' ? 'Al Firmamento' : 'The Firmament'}
        </div>
      )}
      {rows.map((round) => {
        const boss = isBossRound(round, state.difficulty)
        // The final boss is always Primordial; others only once foretold.
        // Past the door, a Warden shows once Atlas lets you peek (H6).
        const firm = state.realm === 'firmament' && round > 15
        const peeked = firm ? map.peeks?.[round] : null
        const known =
          boss && (peeked ?? (!firm && round % 15 === 0 ? 'primordial' : prophecy?.round === round ? prophecy.boss.id : null))
        return (
          <div
            key={`label-${round}`}
            className="absolute left-0 flex w-10 flex-col items-center"
            style={{ top: y(round) - 16 }}
            title={boss ? t('elementa.map.bossBefore') : undefined}
          >
            {boss ? (
              <span className="flex items-center justify-center bg-[#2a1018]" style={{ boxShadow: '0 0 0 2px #a8323a' }}>
                <BossAvatar id={known || 'unknown'} size={20} unknown={!known} />
              </span>
            ) : null}
            <span className="pixel-score text-[7px] text-[var(--text-mute)]">R{round}</span>
          </div>
        )
      })}
      {rows.flatMap((round) =>
        map.layers[round - 1].map((node) => {
          const type = shopTypeById(node.type)
          const here = node.id === map.currentId
          const isChoice = choices.includes(node.id)
          const picked = map.pendingId === node.id
          const visited = path.has(node.id) && !here
          const dim = !reachable.has(node.id) && !visited
          const label = `${type.name[lang]}: ${type.blurb[lang]}`
          return (
            <motion.button
              key={node.id}
              type="button"
              data-here={here ? '' : undefined}
              disabled={!isChoice}
              onClick={() => isChoice && onPick?.(node.id)}
              title={label}
              aria-label={label}
              aria-pressed={isChoice ? picked : undefined}
              className="el-well absolute flex items-center justify-center disabled:cursor-default"
              style={{
                left: x(node.col) - nodeSize / 2,
                top: y(round) - nodeSize / 2,
                width: nodeSize,
                height: nodeSize,
                opacity: dim ? 0.3 : visited ? 0.55 : 1,
                boxShadow: picked
                  ? `0 0 0 3px var(--gold-1), 0 0 16px ${type.color}`
                  : here
                    ? '0 0 0 3px var(--gold-hi)'
                    : `0 0 0 2px ${type.color}${type.legendary ? ', 0 0 14px #ffd16699' : ''}`,
              }}
              animate={isChoice && !picked && !reducedMotion ? { y: [0, -3, 0] } : { y: 0 }}
              transition={{ duration: 1.4, repeat: isChoice && !picked ? Infinity : 0, ease: 'easeInOut' }}
              whileHover={isChoice ? { scale: 1.1 } : undefined}
            >
              {type.legendary ? (
                <PixelSprite name="crown" color="#ffd166" accent="#e5533d" accent2="#3d8fe5" size={nodeSize - 10} />
              ) : (
                <KeeperSprite id={type.keeper} size={nodeSize - 12} />
              )}
              {here && (
                <span className="pixel-score absolute -top-3 rounded-sm bg-[var(--gold-1)] px-1 text-[6px] text-[var(--ink)]">
                  {t('elementa.map.here')}
                </span>
              )}
            </motion.button>
          )
        }),
      )}
    </div>
  )
}
