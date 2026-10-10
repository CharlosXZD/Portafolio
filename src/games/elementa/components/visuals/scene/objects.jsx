import { useEffect, useState } from 'react'
import PixelIcon from '../../PixelIcon.jsx'
import { findImageOverride } from '../../../data/visualRegistry.js'
import './scene.css'

// The shop scene's object components (VISUALS.md V4.3): Counter, Shelf, HangTag, Signboard,
// Pouch, Pocket, Plaque, Slate, Lever, BellPull, Board and Drawer. Each is drawn in CSS from the
// shop's materials (materials.js, scene.css) and does nothing but look like an object: the
// shop's logic stays in ShopScreen. Every object has an id (`obj.counter`, `obj.pouch`, ...):
// a file named after it in public/elementa/visuals/ (png, webp or svg) replaces its drawing
// with Carlos's own (the registry rule, ASSETS.md section 8).

/** The id of an object, and the style that puts a hand-drawn file in its place when one exists. */
function useObjOverride(name) {
  const [src, setSrc] = useState(null)
  useEffect(() => {
    let live = true
    findImageOverride(`obj.${name}`).then((s) => live && setSrc(s))
    return () => {
      live = false
    }
  }, [name])
  return src ? { 'data-img': '', style: { backgroundImage: `url(${src})`, backgroundSize: '100% 100%', imageRendering: 'pixelated', boxShadow: 'none' } } : {}
}

/** The counter: a wooden top (the things for sale stand on it) and a front with a brass nameplate. */
export function Counter({ plate, hint, warning, children, ...rest }) {
  const top = useObjOverride('counter')
  return (
    <div className="obj-counter" {...rest}>
      <div className="obj-counter__top" {...top}>
        {warning && <span className="obj-plate obj-plate--warn w-full text-center">{warning}</span>}
        {children}
      </div>
      <div className="obj-counter__front">
        {plate && <span className="obj-plate">{plate}</span>}
        {hint && <span className="obj-plate obj-plate--hint">{hint}</span>}
      </div>
    </div>
  )
}

/** A wall shelf: a row of slots, each resting on its own plank. */
export function Shelf({ plate, warning, children, ...rest }) {
  return (
    <div className="obj-shelf" {...rest}>
      {plate && <span className="obj-plate">{plate}</span>}
      {warning && <span className="obj-plate obj-plate--warn">{warning}</span>}
      <div className="obj-shelf__row">{children}</div>
    </div>
  )
}

/** A price tag on a string: the name, then the price in Shards. Dims when you cannot afford it. */
export function HangTag({ name, cost, affordable = true }) {
  return (
    <div className="obj-tag" data-afford={affordable ? 'yes' : 'no'}>
      {name && <span className="obj-tag__name">{name}</span>}
      {typeof cost === 'number' && (
        <span className="obj-tag__cost">
          <PixelIcon name="shard" size={10} />
          {cost}
        </span>
      )}
    </div>
  )
}

/** The hanging sign: parchment on two ropes, for the keeper's line. */
export function Signboard({ children, foot }) {
  const o = useObjOverride('signboard')
  return (
    <div className="obj-sign" {...o}>
      {children}
      {foot && <div className="obj-sign__foot">{foot}</div>}
    </div>
  )
}

/** Your bag: stitched leather with a brass buckle. Its pockets (empty slots) are `Pocket`s. */
export function Pouch({ children, className = "", ...rest }) {
  const o = useObjOverride('pouch')
  return (
    <aside className={`obj-pouch ${className}`} {...o} {...rest}>
      {children}
    </aside>
  )
}

/** An empty slot: a recess in the leather. */
export function Pocket({ size = 48, ...rest }) {
  return <div className="obj-pocket shrink-0" style={{ width: size, height: size }} {...rest} />
}

/** An engraved plate with a label and a number. */
export function Plaque({ label, children, accent }) {
  return (
    <div className="obj-engraved">
      <span className="el-label">{label}</span>
      <span className="pixel-score text-base" style={{ color: accent ?? 'var(--p2)' }}>
        {children}
      </span>
    </div>
  )
}

/** A dark slate in a brass frame, for things that need a quiet background (the Road). */
export function Slate({ children, ...rest }) {
  return (
    <div className="obj-slate" {...rest}>
      {children}
    </div>
  )
}

/** The lever: a green wooden plaque with a brass lever that swings down when you press it. */
export function Lever({ children, ...rest }) {
  return (
    <button type="button" className="obj-lever" {...rest}>
      <span>{children}</span>
      <span className="obj-lever__arm" aria-hidden="true" />
    </button>
  )
}

/** The bell pull: a violet plaque with a brass bell. */
export function BellPull({ children, ...rest }) {
  return (
    <button type="button" className="obj-bell" {...rest}>
      {children}
    </button>
  )
}

/** A board of pinned things on the wall or the counter (the Forge, the Brew, deals, blessings). */
export function Board({ title, hint, warning, children, ...rest }) {
  const o = useObjOverride('board')
  return (
    <section className="obj-board obj-nails" {...o} {...rest}>
      {title && <span className="obj-plate obj-board__title">{title}</span>}
      {hint && <p className="obj-board__hint">{hint}</p>}
      {warning && <span className="obj-plate obj-plate--warn">{warning}</span>}
      {children}
    </section>
  )
}

/** On a phone the bag and the map are drawers: a tab you press, then the object opens below it. */
export function Drawer({ label, map = false, children, className = '' }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`obj-drawer ${className}`}>
      <button type="button" className="obj-drawer__tab" data-map={map ? '' : undefined} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <span>{label}</span>
        <span aria-hidden="true">{open ? '-' : '+'}</span>
      </button>
      <div className="obj-drawer__body" style={{ display: open ? 'block' : 'none' }}>
        {children}
      </div>
    </div>
  )
}
