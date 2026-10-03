import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../i18n/LanguageContext.jsx'
import { GameSettingsProvider } from './utils/gameSettingsContext.jsx'
import { MUSIC_THEMES, BUILTIN_THEMES, SCALES, saveMusicOverrides, readMusicOverrides } from './data/musicThemes.js'
import { startMusic, stopMusic, setMusicTheme, refreshMusicVolume, isMusicPlaying } from './utils/sound.js'
import { getMusicVolume, setMusicVolume, getMusicEnabled, setMusicEnabled, getDisplay } from './utils/settings.js'
import PixelBackdrop from './components/PixelBackdrop.jsx'
import './elementa.css'

/**
 * The Jukebox (MUSIC.md has the full guide): every theme in the game with a
 * play button, and a live editor. Edits play at once (the same engine the
 * game uses), can be saved in this browser so the game itself plays them,
 * or copied as code to paste into data/musicThemes.js.
 */

const L = (en, es) => ({ en, es })

const WHERE = {
  menu: L('Main menu, file screens, new run', 'Menú principal, pantallas de archivo, nueva partida'),
  table: L('A normal round (the dice table)', 'Una ronda normal (la mesa de dados)'),
  gameover: L('Game over', 'Fin de la partida'),
  victory: L('Boss reward and victory', 'Recompensa de jefe y victoria'),
  shop_market: L('Market (Tobb)', 'Mercado (Tobb)'),
  shop_alchemist: L('Alchemist (Vessa)', 'Alquimista (Vessa)'),
  shop_vault: L('Relic Vault (the Curator)', 'Bóveda de Reliquias (el Curador)'),
  shop_forge: L('Forge (Brasa)', 'Forja (Brasa)'),
  shop_blackmarket: L('Black Market (Nix)', 'Mercado Negro (Nix)'),
  shop_shrine: L('Shrine (Aeris)', 'Santuario (Aeris)'),
  shop_bazaar: L('Aether Bazaar (every keeper)', 'Bazar del Éter (todos los guardianes)'),
  scene_crossroads: L('Story: the Crossroads', 'Historia: la Encrucijada'),
  scene_firmament: L('Story: the visions and the Firmament', 'Historia: las visiones y el Firmamento'),
  shop_cartography: L("Atlas's Cartography (the Firmament)", 'Cartografía de Atlas (el Firmamento)'),
  shop_clockwork: L("The Horologist's Clockwork (the Firmament)", 'El Mecanismo del Relojero (el Firmamento)'),
  shop_observatory: L("Seren's Observatory (the Firmament)", 'El Observatorio de Seren (el Firmamento)'),
  shop_pantry: L("Mote's Pantry (the Firmament)", 'La Despensa de Mote (el Firmamento)'),
  boss_dawn: L('Warden: The Dawn (rounds 20 to 30)', 'Custodio: El Alba (rondas 20 a 30)'),
  boss_umbra: L('Warden: The Umbra (rounds 20 to 30)', 'Custodio: La Umbra (rondas 20 a 30)'),
  boss_clockwork: L('Warden: The Clockwork (rounds 20 to 30)', 'Custodio: El Mecanismo (rondas 20 a 30)'),
  boss_expanse: L('Warden: The Expanse (rounds 20 to 30)', 'Custodio: La Extensión (rondas 20 a 30)'),
  boss_maelstrom: L('Warden: The Maelstrom (rounds 20 to 30)', 'Custodio: La Vorágine (rondas 20 a 30)'),
  boss_hollow: L('Warden: The Hollow (rounds 20 to 30)', 'Custodio: El Hueco (rondas 20 a 30)'),
}

const TEXT = {
  title: L('Jukebox', 'Rockola'),
  back: L('Back to the game', 'Volver al juego'),
  intro: L(
    'Every song in Elementa is generated from a few lines of notes. Pick one, press play, and change anything on the right: it re-plays as you type.',
    'Cada canción de Elementa se genera con unas pocas líneas de notas. Elige una, dale play y cambia lo que quieras a la derecha: se vuelve a tocar mientras escribes.',
  ),
  screens: L('Screens', 'Pantallas'),
  shops: L('Shops', 'Tiendas'),
  bosses: L('Bosses', 'Jefes'),
  other: L('Other', 'Otros'),
  play: L('Play', 'Tocar'),
  stop: L('Stop', 'Parar'),
  edited: L('edited', 'editada'),
  volume: L('Music volume', 'Volumen de la música'),
  musicOff: L('Music is switched off in Options.', 'La música está apagada en Opciones.'),
  turnOn: L('Turn it on', 'Encenderla'),
  auto: L('Auto-play all (25 s each)', 'Tocar todas (25 s cada una)'),
  editor: L('Editor', 'Editor'),
  pick: L('Pick a song on the left.', 'Elige una canción a la izquierda.'),
  root: L('Root note (MIDI)', 'Nota base (MIDI)'),
  scale: L('Scale', 'Escala'),
  step: L('Seconds per step', 'Segundos por paso'),
  swing: L('Swing (0 to 0.5)', 'Swing (0 a 0.5)'),
  gain: L('Loudness (0 to 1)', 'Volumen (0 a 1)'),
  leadOctave: L('Lead octave shift', 'Octava del lead'),
  lead: L('Lead (the melody)', 'Lead (la melodía)'),
  bass: L('Bass', 'Bajo'),
  perc: L('Percussion', 'Percusión'),
  pad: L('Pad chords (JSON, one chord per bar)', 'Acordes pad (JSON, un acorde por compás)'),
  voices: L('Sounds', 'Sonidos'),
  saveHere: L('Save in this browser', 'Guardar en este navegador'),
  saved: L('Saved: the game plays this version too.', 'Guardada: el juego también toca esta versión.'),
  reset: L('Reset this song', 'Restaurar esta canción'),
  copy: L('Copy as code', 'Copiar como código'),
  copied: L('Copied. Paste it into data/musicThemes.js.', 'Copiado. Pégalo en data/musicThemes.js.'),
  original: L('Hear the original', 'Escuchar la original'),
  resetAll: L('Reset every edit', 'Restaurar todas las ediciones'),
  steps: L('steps', 'pasos'),
  bars: L('bars', 'compases'),
  badToken: L('Not a valid step:', 'Paso no válido:'),
  badPad: L('The pad needs JSON like [[0,2,4],[3,5,7]]', 'El pad necesita JSON como [[0,2,4],[3,5,7]]'),
  guide: L('Quick reference', 'Referencia rápida'),
  guideBody: L(
    'Numbers are scale notes (0 is the root, 7 the octave on a 7-note scale, negatives go lower). A dash holds the last note, a dot is a rest. Percussion letters: k kick, s snare, h hat, t tick, a anvil, b bell, p bubble, z snore. 16 steps make a bar. The full guide is MUSIC.md.',
    'Los números son notas de la escala (0 es la base, 7 la octava en una escala de 7 notas, los negativos van más abajo). Un guion sostiene la última nota, un punto es silencio. Letras de percusión: k bombo, s caja, h hi-hat, t tick, a yunque, b campana, p burbuja, z ronquido. 16 pasos hacen un compás. La guía completa está en MUSIC.md.',
  ),
}

const WAVES = ['sine', 'triangle', 'square', 'sawtooth']
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const noteName = (n) => `${NOTE_NAMES[((n % 12) + 12) % 12]}${Math.floor(n / 12) - 1}`
const PERC_LETTERS = 'kshtabpz'

const prettify = (id) =>
  id
    .replace(/^(boss|shop)_/, '')
    .split('_')
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ')

function whereLabel(id, lang) {
  if (WHERE[id]) return WHERE[id][lang]
  if (id.startsWith('boss_')) return `${lang === 'es' ? 'Jefe' : 'Boss'}: ${prettify(id)}`
  if (id.startsWith('shop_')) return `${lang === 'es' ? 'Tienda' : 'Shop'}: ${prettify(id)}`
  return prettify(id)
}

const stepCount = (text) => (text?.trim() ? text.trim().split(/\s+/).length : 0)

function toForm(theme) {
  return {
    root: String(theme.root),
    scale: theme.scale,
    step: String(theme.step),
    swing: theme.swing != null ? String(theme.swing) : '',
    gain: theme.gain != null ? String(theme.gain) : '',
    leadOctave: theme.leadOctave != null ? String(theme.leadOctave) : '',
    lead: theme.lead ?? '',
    bass: theme.bass ?? '',
    perc: theme.perc ?? '',
    pad: theme.pad ? JSON.stringify(theme.pad) : '',
    vLead: theme.voices?.lead ?? 'sine',
    vBass: theme.voices?.bass ?? 'triangle',
    vPad: theme.voices?.pad ?? 'sine',
  }
}

/** Turns the form back into a theme object, collecting anything wrong. */
function fromForm(form, original, lang) {
  const errors = []
  const theme = { ...original }
  const num = (v, fallback) => (v === '' || Number.isNaN(Number(v)) ? fallback : Number(v))
  theme.root = Math.round(num(form.root, original.root))
  theme.scale = SCALES[form.scale] ? form.scale : original.scale
  theme.step = Math.max(0.03, num(form.step, original.step))
  const optional = (key, value) => {
    if (value === '' || Number.isNaN(Number(value))) delete theme[key]
    else theme[key] = Number(value)
  }
  optional('swing', form.swing)
  optional('gain', form.gain)
  optional('leadOctave', form.leadOctave)
  const check = (label, text, perc) => {
    text
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .forEach((tok, i) => {
        const ok = tok === '.' || tok === '-' || (perc ? tok.length === 1 && PERC_LETTERS.includes(tok) : /^-?\d+$/.test(tok))
        if (!ok) errors.push(`${label} #${i + 1}: ${TEXT.badToken[lang]} "${tok}"`)
      })
  }
  theme.lead = form.lead.trim()
  theme.bass = form.bass.trim()
  check(TEXT.lead[lang], theme.lead, false)
  check(TEXT.bass[lang], theme.bass, false)
  if (form.perc.trim()) {
    theme.perc = form.perc.trim()
    check(TEXT.perc[lang], theme.perc, true)
  } else delete theme.perc
  if (!theme.bass) delete theme.bass
  if (form.pad.trim()) {
    try {
      const pad = JSON.parse(form.pad)
      if (!Array.isArray(pad) || !pad.every((c) => Array.isArray(c) && c.every(Number.isInteger))) throw new Error('shape')
      theme.pad = pad
    } catch {
      errors.push(TEXT.badPad[lang])
    }
  } else delete theme.pad
  theme.voices = { lead: form.vLead, bass: form.vBass, ...(theme.pad ? { pad: form.vPad } : {}) }
  return { theme, errors }
}

/** A theme as the code that goes in data/musicThemes.js. */
function toCode(id, t) {
  const q = (s) => `'${s.replace(/'/g, "\\'")}'`
  const lines = [`  ${id}: {`, `    root: ${t.root},`, `    scale: ${q(t.scale)},`, `    step: ${Math.round(t.step * 1000) / 1000},`]
  if (t.swing != null) lines.push(`    swing: ${t.swing},`)
  if (t.gain != null) lines.push(`    gain: ${t.gain},`)
  if (t.leadOctave != null) lines.push(`    leadOctave: ${t.leadOctave},`)
  if (t.leadGlide != null) lines.push(`    leadGlide: ${t.leadGlide},`)
  lines.push(`    lead: ${q(t.lead)},`)
  if (t.bass) lines.push(`    bass: ${q(t.bass)},`)
  if (t.perc) lines.push(`    perc: ${q(t.perc)},`)
  if (t.pad) lines.push(`    pad: ${JSON.stringify(t.pad)},`)
  const v = t.voices || {}
  lines.push(`    voices: { ${Object.entries(v).map(([k, w]) => `${k}: ${q(w)}`).join(', ')} },`, '  },')
  return lines.join('\n')
}

function Field({ label, children, hint }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="el-label flex items-baseline justify-between gap-2">
        <span>{label}</span>
        {hint && <span className="text-[var(--text-mute)]">{hint}</span>}
      </span>
      {children}
    </label>
  )
}

const inputClass =
  'el-well w-full px-2 py-1.5 text-base text-[var(--text)] outline-none focus:outline-2 focus:outline-[var(--gold-1)]'
const monoClass = `${inputClass} font-mono text-[13px] leading-snug`

function Select({ value, onChange, options }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={inputClass}>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  )
}

function JukeboxInner() {
  const { lang } = useLanguage()
  const tx = (k) => TEXT[k][lang]
  const display = getDisplay()
  const [selected, setSelected] = useState(null)
  const [playing, setPlaying] = useState(null)
  const [form, setForm] = useState(null)
  const [edited, setEdited] = useState(() => new Set(Object.keys(readMusicOverrides())))
  const [volume, setVolume] = useState(getMusicVolume)
  const [enabled, setEnabled] = useState(getMusicEnabled)
  const [auto, setAuto] = useState(false)
  const [notice, setNotice] = useState('')
  const labTick = useRef(0)

  const ids = useMemo(() => Object.keys(BUILTIN_THEMES), [])
  const groups = useMemo(
    () => [
      ['screens', ids.filter((i) => !i.startsWith('shop_') && !i.startsWith('boss_'))],
      ['shops', ids.filter((i) => i.startsWith('shop_'))],
      ['bosses', ids.filter((i) => i.startsWith('boss_'))],
    ],
    [ids],
  )

  // Plays a theme object through the game's own engine, under a throwaway id
  // that alternates so the engine always sees a change and crossfades.
  const playTheme = useCallback((id, theme) => {
    const key = `__lab${labTick.current++ % 2}`
    MUSIC_THEMES[key] = theme
    if (!getMusicEnabled()) return
    setMusicTheme(key)
    startMusic()
    setPlaying(id)
  }, [])

  const select = useCallback((id) => {
    setSelected(id)
    setForm(toForm(MUSIC_THEMES[id]))
    setNotice('')
  }, [])

  const playId = useCallback(
    (id) => {
      select(id)
      playTheme(id, MUSIC_THEMES[id])
    },
    [select, playTheme],
  )

  const stop = useCallback(() => {
    stopMusic()
    setPlaying(null)
    setAuto(false)
  }, [])

  const built = useMemo(
    () => (selected && form ? fromForm(form, BUILTIN_THEMES[selected], lang) : null),
    [selected, form, lang],
  )

  // A change in the editor re-plays the song (a little after you stop typing).
  const firstForm = useRef(null)
  useEffect(() => {
    if (!built || playing !== selected) return
    if (firstForm.current === form) return
    if (built.errors.length) return
    const id = window.setTimeout(() => playTheme(selected, built.theme), 350)
    return () => window.clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form])

  // Auto-play walks through every song.
  useEffect(() => {
    if (!auto) return
    const id = window.setInterval(() => {
      setSelected((cur) => {
        const next = ids[(Math.max(0, ids.indexOf(cur)) + 1) % ids.length]
        setForm(toForm(MUSIC_THEMES[next]))
        playTheme(next, MUSIC_THEMES[next])
        return next
      })
    }, 25000)
    return () => window.clearInterval(id)
  }, [auto, ids, playTheme])

  useEffect(
    () => () => {
      stopMusic()
      delete MUSIC_THEMES.__lab0
      delete MUSIC_THEMES.__lab1
    },
    [],
  )

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }))

  function save() {
    if (!built || built.errors.length) return
    saveMusicOverrides(selected, built.theme)
    setEdited((s) => new Set(s).add(selected))
    setNotice(tx('saved'))
  }

  function resetOne() {
    saveMusicOverrides(selected, null)
    setEdited((s) => {
      const n = new Set(s)
      n.delete(selected)
      return n
    })
    setForm(toForm(MUSIC_THEMES[selected]))
    if (playing === selected) playTheme(selected, MUSIC_THEMES[selected])
    setNotice('')
  }

  function resetAll() {
    ids.forEach((id) => saveMusicOverrides(id, null))
    setEdited(new Set())
    if (selected) setForm(toForm(MUSIC_THEMES[selected]))
    if (playing) playTheme(playing, MUSIC_THEMES[playing])
  }

  async function copyCode() {
    if (!built) return
    try {
      await navigator.clipboard.writeText(toCode(selected, built.theme))
      setNotice(tx('copied'))
    } catch {
      setNotice(toCode(selected, built.theme))
    }
  }

  const bpm = form ? Math.round(60 / (4 * Math.max(0.03, Number(form.step) || 0.1))) : 0

  return (
    <div data-theme="dark" data-font={display.fontStyle} className="elementa-root relative min-h-screen w-full overflow-x-hidden">
      <PixelBackdrop scene="menu" />
      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="el-logo text-2xl">{tx('title')}</h1>
            <p className="max-w-2xl text-base leading-snug text-[var(--text-dim)]">{tx('intro')}</p>
          </div>
          <Link to="/games/elementa" className="el-btn el-btn--sm">
            {tx('back')}
          </Link>
        </header>

        {/* Transport */}
        <section className="el-panel flex flex-wrap items-center gap-5 px-4 py-3">
          <button type="button" onClick={stop} disabled={!playing} className="el-btn el-btn--sm">
            {tx('stop')}
          </button>
          <label className="flex items-center gap-3">
            <span className="el-label">{tx('volume')}</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => {
                const v = Number(e.target.value)
                setVolume(v)
                setMusicVolume(v)
                refreshMusicVolume()
              }}
            />
          </label>
          <label className="flex items-center gap-2 text-base text-[var(--text-dim)]">
            <input type="checkbox" checked={auto} onChange={(e) => (e.target.checked ? (setAuto(true), !isMusicPlaying() && playId(ids[0])) : setAuto(false))} />
            {tx('auto')}
          </label>
          {!enabled && (
            <span className="flex items-center gap-3 text-base text-[var(--gold-2)]">
              {tx('musicOff')}
              <button
                type="button"
                className="el-btn el-btn--sm el-btn--gold"
                onClick={() => {
                  setMusicEnabled(true)
                  setEnabled(true)
                }}
              >
                {tx('turnOn')}
              </button>
            </span>
          )}
          {edited.size > 0 && (
            <button type="button" onClick={resetAll} className="el-btn el-btn--sm el-btn--danger ml-auto">
              {tx('resetAll')} ({edited.size})
            </button>
          )}
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,22rem)_1fr]">
          {/* Song list */}
          <section className="el-panel flex max-h-[70vh] flex-col gap-4 overflow-y-auto p-3 lg:max-h-[75vh]">
            {groups.map(([key, list]) => (
              <div key={key} className="flex flex-col gap-1">
                <h2 className="el-label px-1 pb-1">{tx(key)}</h2>
                {list.map((id) => {
                  const on = playing === id
                  return (
                    <div
                      key={id}
                      className="el-well flex items-center gap-2 px-2 py-1.5"
                      style={selected === id ? { boxShadow: '0 0 0 2px var(--gold-1)' } : undefined}
                    >
                      <button
                        type="button"
                        onClick={() => (on ? stop() : playId(id))}
                        aria-label={`${on ? tx('stop') : tx('play')} ${prettify(id)}`}
                        className={`el-btn el-btn--sm w-16 shrink-0 justify-center ${on ? 'el-btn--gold' : ''}`}
                      >
                        {on ? tx('stop') : tx('play')}
                      </button>
                      <button type="button" onClick={() => select(id)} className="flex min-w-0 flex-1 flex-col text-left leading-tight">
                        <span className="truncate text-base text-[var(--text)]">
                          {WHERE[id] ? WHERE[id][lang] : prettify(id)}
                          {edited.has(id) && <span className="ml-2 text-sm text-[var(--gold-1)]">{tx('edited')}</span>}
                        </span>
                        <span className="truncate text-sm text-[var(--text-mute)]">
                          {id} · {noteName(MUSIC_THEMES[id].root)} {MUSIC_THEMES[id].scale}
                        </span>
                      </button>
                    </div>
                  )
                })}
              </div>
            ))}
          </section>

          {/* Editor */}
          <section className="el-panel flex flex-col gap-4 p-4">
            {!form ? (
              <p className="text-base text-[var(--text-mute)]">{tx('pick')}</p>
            ) : (
              <>
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h2 className="pixel-heading text-sm text-[var(--gold-1)]">{whereLabel(selected, lang)}</h2>
                  <span className="text-sm text-[var(--text-mute)]">
                    {selected} · {bpm} BPM · {noteName(Number(form.root) || 0)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <Field label={tx('root')} hint={noteName(Number(form.root) || 0)}>
                    <input className={inputClass} type="number" value={form.root} onChange={(e) => set('root')(e.target.value)} />
                  </Field>
                  <Field label={tx('scale')}>
                    <Select value={form.scale} onChange={set('scale')} options={Object.keys(SCALES)} />
                  </Field>
                  <Field label={tx('step')} hint={`${bpm} BPM`}>
                    <input className={inputClass} type="number" step="0.005" min="0.03" value={form.step} onChange={(e) => set('step')(e.target.value)} />
                  </Field>
                  <Field label={tx('swing')}>
                    <input className={inputClass} type="number" step="0.05" value={form.swing} onChange={(e) => set('swing')(e.target.value)} />
                  </Field>
                  <Field label={tx('gain')}>
                    <input className={inputClass} type="number" step="0.05" value={form.gain} onChange={(e) => set('gain')(e.target.value)} />
                  </Field>
                  <Field label={tx('leadOctave')}>
                    <input className={inputClass} type="number" step="1" value={form.leadOctave} onChange={(e) => set('leadOctave')(e.target.value)} />
                  </Field>
                </div>

                {[
                  ['lead', 'lead'],
                  ['bass', 'bass'],
                  ['perc', 'perc'],
                ].map(([key, label]) => (
                  <Field
                    key={key}
                    label={tx(label)}
                    hint={`${stepCount(form[key])} ${tx('steps')} · ${Math.round((stepCount(form[key]) / 16) * 10) / 10} ${tx('bars')}`}
                  >
                    <textarea
                      className={monoClass}
                      rows={3}
                      spellCheck={false}
                      value={form[key]}
                      onChange={(e) => set(key)(e.target.value)}
                    />
                  </Field>
                ))}
                <Field label={tx('pad')}>
                  <input className={monoClass} spellCheck={false} value={form.pad} onChange={(e) => set('pad')(e.target.value)} />
                </Field>

                <div className="grid grid-cols-3 gap-3">
                  <Field label={`${tx('voices')}: lead`}>
                    <Select value={form.vLead} onChange={set('vLead')} options={WAVES} />
                  </Field>
                  <Field label={`${tx('voices')}: bass`}>
                    <Select value={form.vBass} onChange={set('vBass')} options={WAVES} />
                  </Field>
                  <Field label={`${tx('voices')}: pad`}>
                    <Select value={form.vPad} onChange={set('vPad')} options={WAVES} />
                  </Field>
                </div>

                {built?.errors.length > 0 && (
                  <ul className="flex flex-col gap-1 text-base text-[var(--bad)]">
                    {built.errors.slice(0, 5).map((e) => (
                      <li key={e}>{e}</li>
                    ))}
                  </ul>
                )}

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    className="el-btn el-btn--sm el-btn--gold"
                    onClick={() => playTheme(selected, built.theme)}
                    disabled={!built || built.errors.length > 0}
                  >
                    {tx('play')}
                  </button>
                  <button type="button" className="el-btn el-btn--sm" onClick={() => playTheme(selected, BUILTIN_THEMES[selected])}>
                    {tx('original')}
                  </button>
                  <button type="button" className="el-btn el-btn--sm el-btn--arcane" onClick={save} disabled={!built || built.errors.length > 0}>
                    {tx('saveHere')}
                  </button>
                  <button type="button" className="el-btn el-btn--sm" onClick={copyCode} disabled={!built}>
                    {tx('copy')}
                  </button>
                  <button type="button" className="el-btn el-btn--sm el-btn--danger" onClick={resetOne}>
                    {tx('reset')}
                  </button>
                </div>
                {notice && <pre className="whitespace-pre-wrap text-sm text-[var(--arcane-hi)]">{notice}</pre>}
              </>
            )}
          </section>
        </div>

        <section className="el-panel--dark el-panel flex flex-col gap-2 p-4">
          <h2 className="el-label">{tx('guide')}</h2>
          <p className="text-base leading-snug text-[var(--text-dim)]">{tx('guideBody')}</p>
        </section>
      </main>
    </div>
  )
}

export default function JukeboxPage() {
  return (
    <GameSettingsProvider>
      <JukeboxInner />
    </GameSettingsProvider>
  )
}
