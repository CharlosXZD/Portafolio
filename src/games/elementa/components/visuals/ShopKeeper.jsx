import { useEffect, useRef, useState } from 'react'
import { useVisualEnv } from './VisualEnv.jsx'
import KeeperRig from './rigs/KeeperRig.jsx'
import { onRoom } from './room/roomBus.js'

/**
 * The shop's keeper portrait as a rig (VISUALS.md V3.4): it replaces the flat
 * KeeperSprite in the shop header. It idles (breathes, blinks), talks while
 * their line is on screen, and reacts to what the shop emits on the room bus:
 * a nod when you pick something, a hop when you buy or the shop restocks, a
 * grumble (a shake) when you cannot afford it, a nod when you sell, a nod and
 * a glance away when you leave. Lines still come from data/keepers.js; this
 * only moves the mouth for about as long as the line takes to read.
 * On the low-end tier only the blink stays; under Reduced motion nothing moves.
 */
export default function ShopKeeper({ id, size = 72, lineLength = 60, crop }) {
  const { reduced, quality } = useVisualEnv()
  const [talking, setTalking] = useState(false)
  const [look, setLook] = useState('center')
  const [beat, setBeat] = useState({ type: null, key: 0 })
  const timers = useRef([])

  const talk = (ms) => {
    setTalking(true)
    timers.current.push(setTimeout(() => setTalking(false), ms))
  }

  // The welcome: the keeper greets you as the line arrives.
  useEffect(() => {
    if (reduced) return
    setBeat((b) => ({ type: 'nod', key: b.key + 1 }))
    talk(Math.min(3200, 400 + lineLength * 38))
    const list = timers.current
    return () => list.forEach(clearTimeout)
    // One welcome per keeper and visit; the line length only sets how long the mouth moves.
  }, [id, reduced])

  useEffect(
    () =>
      onRoom((name) => {
        if (reduced) return
        const play = (type, ms = 0) => {
          setBeat((b) => ({ type, key: b.key + 1 }))
          if (ms) talk(ms)
        }
        if (name === 'pick') {
          setLook('left')
          play('nod')
          timers.current.push(setTimeout(() => setLook('center'), 1400))
        } else if (name === 'buy') play('hop', 900)
        else if (name === 'broke') play('shake')
        else if (name === 'sell') play('nod', 500)
        else if (name === 'restock') play('hop', 600)
        else if (name === 'leave') {
          setLook('right')
          play('nod')
        }
      }),
    [reduced],
  )

  return <KeeperRig id={id} size={size} crop={crop} talking={talking} look={look} react={beat.type} reactKey={beat.key} blinkOnly={quality === 'low'} />
}
