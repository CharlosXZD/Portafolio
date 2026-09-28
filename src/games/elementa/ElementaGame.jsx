import { useEffect, useReducer, useState } from 'react'
import { gameReducer, initialState, selectors } from './engine/gameReducer.js'
import RoundHUD from './components/RoundHUD.jsx'
import DiceTray from './components/DiceTray.jsx'
import RoundResult from './components/RoundResult.jsx'
import ShopScreen from './components/ShopScreen.jsx'
import GameOverScreen from './components/GameOverScreen.jsx'
import TitleScreen from './components/TitleScreen.jsx'
import MainMenu from './components/MainMenu.jsx'
import SaveSlots from './components/SaveSlots.jsx'
import CreditsScreen from './components/CreditsScreen.jsx'
import RunPreview from './components/RunPreview.jsx'
import PauseMenu from './components/PauseMenu.jsx'
import { ChromaticFilterDefs, CrtScanlines } from './components/CrtOverlay.jsx'
import PixelBackdrop from './components/PixelBackdrop.jsx'
import PixelIcon from './components/PixelIcon.jsx'
import Tutorial from './components/Tutorial.jsx'
import { GameSettingsProvider, useGameSettings } from './utils/gameSettingsContext.jsx'
import { startMusic } from './utils/sound.js'
import { writeSave, deleteSave } from './utils/saveManager.js'
import { markSeen, markDeckBeaten, markDifficultyBeaten } from './utils/profile.js'
import GalleryScreen from './components/GalleryScreen.jsx'
import './elementa.css'

// Phases where a run is actually in progress and worth persisting. Meta
// phases and terminal phases (gameover/victory, handled separately below)
// are excluded.
const AUTOSAVE_PHASES = new Set(['rolling', 'missed', 'shop'])
// Escape only opens the pause menu while an actual run is live: the meta
// screens already have their own nav (Back/Options buttons), and there's
// nothing to pause on gameover/victory.
const PAUSABLE_PHASES = new Set(['rolling', 'missed', 'shop'])

function ElementaGameInner() {
  const [state, dispatch] = useReducer(gameReducer, undefined, initialState)
  const [paused, setPaused] = useState(false)
  const [tutorialActive, setTutorialActive] = useState(false)
  const { crtEffect } = useGameSettings()

  // Music can't actually play until a user gesture unlocks the shared
  // AudioContext (browser autoplay policy); startMusic() itself is a no-op
  // until that happens, so it's safe to just try it on both mount and the
  // first pointer/key interaction, and let sound.js sort out whether the
  // context is actually running yet.
  useEffect(() => {
    startMusic()
    function unlock() {
      startMusic()
    }
    window.addEventListener('pointerdown', unlock, { once: true })
    window.addEventListener('keydown', unlock, { once: true })
    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
    }
  }, [])

  // Escape toggles a pause overlay (Options / back to main menu) while a
  // run is live, mirroring the in-shop Options panel for the phases that
  // don't already have one on screen.
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key !== 'Escape') return
      setPaused((p) => (p ? false : PAUSABLE_PHASES.has(state.phase)))
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [state.phase])

  // Leaving an active run (abandoned, missed out of lives, won) should
  // never leave a stale pause overlay sitting on top of the next screen.
  useEffect(() => {
    if (!PAUSABLE_PHASES.has(state.phase)) setPaused(false)
  }, [state.phase])

  // Keep the active slot's save fresh while a run is in progress, so
  // "how far into the game" is always resumable from the save-slot screen.
  useEffect(() => {
    if (state.activeSlot != null && AUTOSAVE_PHASES.has(state.phase)) {
      writeSave(state.activeSlot, state)
    }
  }, [state])

  // Everything the player lays eyes on during a run (their own dice and
  // items, every shop offer, every forgeable fusion) is added to the
  // Gallery. markSeen only writes when an id is actually new.
  useEffect(() => {
    if (!AUTOSAVE_PHASES.has(state.phase)) return
    const dice = state.dice.map((d) => d.elementId)
    const relics = state.relics.map((r) => r.id)
    const consumables = state.consumables.map((c) => c.id)
    if (state.shop) {
      dice.push(...state.shop.buyableElements)
      dice.push(...selectors.forgeableRecipes(state).filter((r) => r.canForge).map((r) => r.fusionElementId))
      state.shop.itemOffers.forEach((o) => (o.kind === 'relic' ? relics : consumables).push(o.id))
    }
    markSeen('dice', dice)
    markSeen('relics', relics)
    markSeen('consumables', consumables)
  }, [state])

  // Winning a run beats its loadout, which unlocks the next one.
  useEffect(() => {
    if (state.phase !== 'victory') return
    markDeckBeaten(state.deckId)
    markDifficultyBeaten(state.difficulty?.id)
  }, [state.phase, state.deckId, state.difficulty])

  // A run that has actually ended can't be resumed, so free up its slot
  // for a new run rather than leaving a dead save behind.
  useEffect(() => {
    if (state.activeSlot != null && (state.phase === 'gameover' || state.phase === 'victory')) {
      deleteSave(state.activeSlot)
    }
  }, [state.phase, state.activeSlot])

  const scene =
    state.phase === 'shop'
      ? 'shop'
      : state.phase === 'rolling' || state.phase === 'missed'
        ? state.bossModifier
          ? 'boss'
          : 'table'
        : 'menu'
  // The in-run screens lay themselves out edge to edge (sidebar + table,
  // or the shop's three columns); menus stay a centered column.
  const inRun = PAUSABLE_PHASES.has(state.phase)

  return (
    <div
      data-theme="dark"
      className="elementa-root relative min-h-screen w-full overflow-x-hidden"
      style={crtEffect ? { filter: 'url(#elementa-chromatic)' } : undefined}
    >
      <ChromaticFilterDefs />
      <PixelBackdrop scene={scene} />

      <main
        className={`relative z-10 flex min-h-screen w-full flex-col ${
          inRun ? 'px-4 py-4 md:px-6' : 'items-center justify-center px-4 py-10'
        }`}
      >
        {state.phase === 'menu' && <MainMenu dispatch={dispatch} />}

        {state.phase === 'slots' && <SaveSlots dispatch={dispatch} />}

        {state.phase === 'credits' && <CreditsScreen dispatch={dispatch} />}

        {state.phase === 'gallery' && <GalleryScreen onBack={() => dispatch({ type: 'BACK_TO_MENU' })} />}

        {state.phase === 'title' && <TitleScreen dispatch={dispatch} />}

        {state.phase === 'runPreview' && <RunPreview state={state} dispatch={dispatch} />}

        {(state.phase === 'rolling' || state.phase === 'missed') && (
          <div className="grid w-full flex-1 grid-cols-1 gap-5 lg:grid-cols-[280px_1fr] lg:gap-8">
            <RoundHUD state={state} />
            {state.phase === 'rolling' ? (
              <DiceTray
                state={state}
                dispatch={dispatch}
                availableRerolls={selectors.availableRerolls(state)}
                paused={paused || tutorialActive}
              />
            ) : (
              <div className="flex items-center justify-center">
                <RoundResult state={state} dispatch={dispatch} />
              </div>
            )}
          </div>
        )}

        {state.phase === 'shop' && <ShopScreen state={state} dispatch={dispatch} />}

        {state.phase === 'gameover' && <GameOverScreen state={state} dispatch={dispatch} />}

        {state.phase === 'victory' && <GameOverScreen state={state} dispatch={dispatch} victory />}
      </main>

      {/* A visible way into the pause menu: Escape alone was undiscoverable. */}
      {inRun && !paused && (
        <div className="fixed right-4 top-4 z-30">
          <button type="button" onClick={() => setPaused(true)} className="el-btn el-btn--sm" aria-label="Pause">
            <PixelIcon name="pause" size={10} />
            <span className="el-key">Esc</span>
          </button>
        </div>
      )}

      <span className="pointer-events-none fixed bottom-2 right-3 z-10 text-[10px] text-[var(--text-mute)]">
        v0.3 alpha
      </span>

      {paused && inRun && <PauseMenu dispatch={dispatch} onResume={() => setPaused(false)} />}

      {inRun && <Tutorial state={state} paused={paused} onActiveChange={setTutorialActive} />}

      {crtEffect && <CrtScanlines />}
    </div>
  )
}

export default function ElementaGame() {
  return (
    <GameSettingsProvider>
      <ElementaGameInner />
    </GameSettingsProvider>
  )
}
