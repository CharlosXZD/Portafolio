import { useCallback, useEffect, useRef, useState } from 'react'
import { useVisualEnv } from '../VisualEnv.jsx'
import Visual from '../Visual.jsx'
import { AmbientLayer, BackLayer, CounterLayer, LightLayer, Lanterns, Motes, ROOM_H, ROOM_W, ShelfLayer, SleepingFox } from './marketArt.jsx'

const L = (en, es) => ({ en, es })

// The "feel test" shelf (VISUALS.md V1 item 4). Names and prices are mock
// values for the test, not game rules. Three items are cached 3D renders and
// two are the shipping code sprites, so the room shows both side by side.
const SLOTS = [
  { key: 'coin', id: 'spike.relic.lucky_coin', name: L('Lucky Coin', 'Moneda de la Suerte'), kind: L('Relic', 'Reliquia'), price: 4, blurb: L('A coin that always lands on your side.', 'Una moneda que siempre cae de tu lado.') },
  { key: 'heart', id: 'spike.relic.ember_heart', name: L('Ember Heart', 'Corazón de Brasa'), kind: L('Relic', 'Reliquia'), price: 9, blurb: L('Still warm. Do not ask whose.', 'Aún tibio. No preguntes de quién.') },
  { key: 'flask', id: 'spike.consumable.tide_flask', name: L('Tide Flask', 'Frasco de Marea'), kind: L('Consumable', 'Consumible'), price: 6, blurb: L('A small tide, corked.', 'Una pequeña marea, con corcho.') },
  { key: 'die', id: 'spike.die.fire_d20', name: L('Fire d20', 'd20 de Fuego'), kind: L('Die', 'Dado'), price: 12, blurb: L('Twenty sides, all of them hot.', 'Veinte caras, todas calientes.') },
  { key: 'map', id: 'spike.consumable.old_map', name: L('Old Map', 'Mapa Viejo'), kind: L('Consumable', 'Consumible'), price: 5, blurb: L('Marked with a route nobody finished.', 'Marcado con una ruta que nadie terminó.') },
]
const SLOT_LEFT = (i) => 98 + i * 28
const SLOT_TOP = 80 // items are 24 art pixels tall and rest on the shelf at y 104
const COUNTER_SPOTS = [240, 250, 260]
const COUNTER_TOP = 88

const LINES = {
  greet: [L('Take your time, Caster.', 'Tómate tu tiempo, Lanzador.'), L('Everything is for sale. Except the backpack.', 'Todo está a la venta. Menos la mochila.')],
  pick: (name) => L(`Good eye. The ${name.en} is a fine one.`, `Buen ojo. ${name.es} es una belleza.`),
  thanks: [L('Pleasure doing business!', '¡Un placer hacer negocios!'), L('No refunds. Joking. Mostly.', 'Sin reembolsos. Es broma. Casi.')],
  broke: L('Not enough Shards. The shelf will wait.', 'Faltan Fragmentos. El estante esperará.'),
  restock: L('Fresh stock, fresh from somewhere.', 'Mercancía fresca, recién traída de algún lado.'),
}

const T = {
  buy: L('Buy', 'Comprar'),
  putBack: L('Put back', 'Devolver'),
  restock: L('Restock', 'Reabastecer'),
  shards: L('Shards', 'Fragmentos'),
  pickHint: L('Pick something from the shelf.', 'Elige algo del estante.'),
  sold: L('Sold', 'Vendido'),
  notForSale: L('NOT FOR SALE', 'NO SE VENDE'),
  roomLabel: L('Tobb’s Market, a feel test', 'El Mercado de Tobb, una prueba de ambiente'),
}

// Whole-number scale when there is room (crisp), a fitted fraction on phones.
function useRoomScale(ref) {
  const [scale, setScale] = useState(1)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => {
      const w = el.clientWidth
      setScale(w >= ROOM_W * 2 ? Math.floor(w / ROOM_W) : Math.max(0.5, w / ROOM_W))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref])
  return scale
}

/**
 * The Market as a lived-in room (VISUALS.md V1 item 4): a layered backdrop with
 * depth (wall, window with a living dusk sky, light shafts, lanterns), props
 * on shelves, drifting dust, a sleeping fox in the sun, Tobb behind his
 * counter, and a shelf of items that behave like objects. Hover rocks an item;
 * picking lifts it and Tobb glances over and answers; buying sends it to the
 * counter, rings the bell, leaves a clean gap where it sat and makes Tobb nod.
 * The shop is mock data: nothing here touches a run. `onEvent` receives sound
 * hook names ('hover', 'pick', 'buy', 'bell', 'restock') for V4 to wire up.
 */
export default function MarketRoom() {
  const { lang, reduced, quality, onEvent } = useVisualEnv()
  const wrapRef = useRef(null)
  const scale = useRoomScale(wrapRef)
  const [shards, setShards] = useState(20)
  const [state, setState] = useState(() => Object.fromEntries(SLOTS.map((s) => [s.key, 'shelf'])))
  const [order, setOrder] = useState([]) // purchase order, for counter spots
  const [selected, setSelected] = useState(null)
  const [look, setLook] = useState('center')
  const [react, setReact] = useState({ type: null, key: 0 })
  const [say, setSay] = useState({ id: 0, full: '' })
  const [shown, setShown] = useState(0)
  const [bell, setBell] = useState(0)
  const [pop, setPop] = useState({ key: 0, text: '' })
  const [puffs, setPuffs] = useState({})
  const timers = useRef([])
  const emit = useCallback((name, data) => onEvent?.(name, data), [onEvent])

  const later = useCallback((fn, ms) => {
    const id = setTimeout(fn, ms)
    timers.current.push(id)
  }, [])
  useEffect(() => {
    const list = timers.current
    return () => list.forEach(clearTimeout)
  }, [])

  const speak = useCallback(
    (line) => setSay((s) => ({ id: s.id + 1, full: line[lang] })),
    [lang],
  )

  // Type the line in; Tobb's mouth moves only while it types.
  useEffect(() => {
    if (!say.full) return
    if (reduced) {
      setShown(say.full.length)
      return
    }
    setShown(0)
    const id = setInterval(() => {
      setShown((n) => {
        if (n >= say.full.length) {
          clearInterval(id)
          return n
        }
        return n + 1
      })
    }, 34)
    return () => clearInterval(id)
  }, [say.id, say.full, reduced])

  // Hide the bubble a while after the line finishes.
  const typing = say.full && shown < say.full.length
  useEffect(() => {
    if (!say.full || typing) return
    const id = setTimeout(() => setSay({ id: say.id, full: '' }), 3600)
    return () => clearTimeout(id)
  }, [typing, say.full, say.id])

  // Greet once when the room appears.
  useEffect(() => {
    const id = setTimeout(() => speak(LINES.greet[0]), 600)
    return () => clearTimeout(id)
  }, [speak])

  const nod = () => setReact((r) => ({ type: 'nod', key: r.key + 1 }))

  function pick(slot, i) {
    if (state[slot.key] !== 'shelf') return
    setState((s) => ({ ...Object.fromEntries(Object.entries(s).map(([k, v]) => [k, v === 'selected' ? 'shelf' : v])), [slot.key]: 'selected' }))
    setSelected(slot.key)
    setLook(i < 2 ? 'left' : 'right')
    nod()
    speak(LINES.pick(slot.name))
    emit('pick', slot.id)
  }

  function putBack() {
    if (!selected) return
    setState((s) => ({ ...s, [selected]: 'shelf' }))
    setSelected(null)
    setLook('center')
  }

  function buy() {
    const slot = SLOTS.find((s) => s.key === selected)
    if (!slot) return
    if (shards < slot.price) {
      speak(LINES.broke)
      emit('broke', slot.id)
      return
    }
    setState((s) => ({ ...s, [slot.key]: 'flying' }))
    setShards((n) => n - slot.price)
    setSelected(null)
    setLook('center')
    emit('buy', slot.id)
    later(
      () => {
        setState((s) => ({ ...s, [slot.key]: 'sold' }))
        setOrder((o) => [...o, slot.key])
        setPuffs((p) => ({ ...p, [slot.key]: (p[slot.key] ?? 0) + 1 }))
        setBell((b) => b + 1)
        setPop((p) => ({ key: p.key + 1, text: `-${slot.price}` }))
        nod()
        speak(LINES.thanks[order.length % LINES.thanks.length])
        emit('bell', slot.id)
      },
      reduced ? 0 : 440,
    )
  }

  function restock() {
    setState(Object.fromEntries(SLOTS.map((s) => [s.key, 'shelf'])))
    setOrder([])
    setSelected(null)
    setShards(20)
    setPuffs({})
    setLook('center')
    speak(LINES.restock)
    emit('restock')
  }

  const sel = SLOTS.find((s) => s.key === selected)
  const shownLine = say.full.slice(0, shown)

  return (
    <div className="v-room-wrap" ref={wrapRef} data-reduced={reduced ? '' : undefined} data-calm={quality === 'low' ? '' : undefined}>
      <div className="v-room-holder" style={{ width: ROOM_W * scale, height: ROOM_H * scale }}>
        <div
          className="v-room"
          role="group"
          aria-label={T.roomLabel[lang]}
          style={{ width: ROOM_W, height: ROOM_H, transform: `scale(${scale})`, '--bubble-fs': `${Math.max(8, Math.ceil(11 / scale))}px` }}
        >
          <BackLayer />
          <AmbientLayer />
          <SleepingFox />
          <LightLayer />
          <Lanterns />
          {/* The vignette sits under the shelf, so items, Tobb and the counter stay at full color. */}
          <div className="v-grade" aria-hidden="true" />
          <ShelfLayer slotLefts={SLOTS.map((_, i) => SLOT_LEFT(i))} />

          {/* The clean patch left where a bought item sat, and the dust it kicked up. */}
          {SLOTS.map((slot, i) =>
            state[slot.key] === 'sold' ? (
              <span key={`gap-${slot.key}`} className="v-gap" style={{ left: SLOT_LEFT(i) + 1, top: 100 }} aria-hidden="true">
                {puffs[slot.key] > 0 && !reduced && (
                  <span key={puffs[slot.key]} className="v-puff">
                    <i /><i /><i /><i />
                  </span>
                )}
              </span>
            ) : null,
          )}

          {/* The shelf of items. */}
          {SLOTS.map((slot, i) => {
            const st = state[slot.key]
            const left = SLOT_LEFT(i)
            if (st === 'sold') return null
            const spot = order.indexOf(slot.key)
            const flying = st === 'flying'
            const fx = COUNTER_SPOTS[Math.min(order.length, 2)] - left
            const fy = COUNTER_TOP - SLOT_TOP
            return (
              <button
                key={slot.key}
                type="button"
                className="v-slot"
                data-state={st}
                data-spot={spot}
                onClick={() => (st === 'selected' ? putBack() : pick(slot, i))}
                onPointerEnter={() => emit('hover', slot.id)}
                aria-label={`${slot.name[lang]}, ${slot.price} ${T.shards[lang]}`}
                aria-pressed={st === 'selected'}
                disabled={flying}
                style={{ left, top: SLOT_TOP, '--fx': `${fx}px`, '--fy': `${fy}px` }}
              >
                <span className="v-slot__shadow" />
                <span className="v-slot__item">
                  <Visual id={slot.id} scale={1} native={24} />
                </span>
              </button>
            )
          })}

          {/* Items that have been paid for wait on the counter. */}
          {order.map((key, n) => {
            const slot = SLOTS.find((s) => s.key === key)
            return (
              <span key={`bought-${key}`} className="v-bought" style={{ left: COUNTER_SPOTS[Math.min(n, 2)], top: COUNTER_TOP }} aria-hidden="true">
                <Visual id={slot.id} scale={1} native={24} />
              </span>
            )
          })}

          {/* Price tags hang under the shelf. */}
          {SLOTS.map((slot, i) =>
            state[slot.key] === 'sold' ? null : (
              <span key={`tag-${slot.key}`} className="v-tag" data-lifted={state[slot.key] === 'selected' ? '' : undefined} style={{ left: SLOT_LEFT(i) + 4, top: 111 }} aria-hidden="true">
                <b />
                {slot.price}
              </span>
            ),
          )}

          {/* Tobb behind the counter. */}
          <div className="v-keeper" style={{ left: 286, top: 84 }}>
            <Visual id="rig.keeper.tobb" scale={2} native={14} talking={Boolean(typing)} look={look} react={react.type} reactKey={react.key} />
          </div>
          <CounterLayer />
          <span className="v-bell" key={`bell-${bell}`} data-ring={bell > 0 && !reduced ? '' : undefined} aria-hidden="true">
            <i />
          </span>
          <span className="v-sign" aria-hidden="true">{T.notForSale[lang]}</span>
          {pop.text && (
            <span key={pop.key} className="v-pop" aria-hidden="true">
              {pop.text}
            </span>
          )}
          {quality !== 'low' && <Motes />}

          {shownLine && (
            <div className="v-bubble-box" aria-hidden="true">
              {shownLine}
              {typing ? <span className="v-caret" /> : null}
            </div>
          )}
        </div>
      </div>

      <span className="sr-only" aria-live="polite">
        {say.full && !typing ? say.full : ''}
      </span>

      <div className="v-room-bar">
        <div className="v-room-bar__info">
          {sel ? (
            <>
              <strong>{sel.name[lang]}</strong> <em>{sel.kind[lang]}</em> <span>{sel.blurb[lang]}</span>
            </>
          ) : (
            <span>{T.pickHint[lang]}</span>
          )}
        </div>
        <div className="v-room-bar__actions">
          <span className="v-room-bar__shards">
            {T.shards[lang]}: <b>{shards}</b>
          </span>
          <button type="button" className="el-btn el-btn--sm el-btn--gold" onClick={buy} disabled={!sel}>
            {T.buy[lang]}{sel ? ` · ${sel.price}` : ''}
          </button>
          <button type="button" className="el-btn el-btn--sm" onClick={putBack} disabled={!sel}>
            {T.putBack[lang]}
          </button>
          <button type="button" className="el-btn el-btn--sm" onClick={restock}>
            {T.restock[lang]}
          </button>
        </div>
      </div>
    </div>
  )
}
