import ErrorBoundary from './components/ErrorBoundary.jsx'
import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
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
import { useLanguage } from '../../i18n/LanguageContext.jsx'
import { startMusic, setMusicTheme } from './utils/sound.js'
import { themeForState } from './data/musicThemes.js'
import { writeRun, clearRun } from './utils/saveManager.js'
import {
  readProfile,
  markSeen,
  markDeckBeaten,
  markDifficultyBeaten,
  markWin,
  markCataclysmDice,
  learnRecipe,
  knowsRecipe,
  markEnding,
  unlockAchievements,
  updateStats,
  allFilesComplete,
  markWardens,
  setMoteFed,
  markScenes,
} from './utils/profile.js'
import {
  seenInState,
  achievementsFromState,
  achievementsFromCast,
  achievementsFromVictory,
  achievementsFromProfile,
} from './utils/progress.js'
import { SECRET_REACTION_IDS } from './data/reactions.js'
import { listFiles } from './utils/saveManager.js'
import FileHub from './components/FileHub.jsx'
import BossReward from './components/BossReward.jsx'
import RunInfo from './components/RunInfo.jsx'
import Toasts from './components/Toasts.jsx'
import Crossroads from './components/Crossroads.jsx'
import StoryScene from './components/StoryScene.jsx'
import { sceneById } from './data/story.js'
import { GOD_TRIALS } from './data/bossModifiers.js'
import { LATEST_VERSION } from './data/patchNotes.js'
import { GOD_IDS, MYTHIC_DIE_IDS } from './data/elements.js'
import './elementa.css'

// Phases where a run is actually in progress and worth persisting. Meta
// phases and terminal phases (gameover/victory, handled separately below)
// are excluded.
const AUTOSAVE_PHASES = new Set(['rolling', 'missed', 'shop', 'bossReward', 'crossroads'])
/**
 * The story scene this moment calls for (EXPANSION.md G Q4a, H7), in the
 * order they should play, or null. Each plays once per file (`seen`).
 * The visions and the recipes scene play inside the ending (EndingCards).
 */
function sceneFor(state, seen) {
  const ids = []
  const live = state.phase === 'rolling'
  // Round 15: the Primordial speaks, then lends its die and the gods step up.
  if (live && state.round === 15 && state.realm !== 'firmament' && !state.endless && state.path) {
    ids.push(`final_${state.path}`)
    if (state.gauntlet) ids.push('loan', `trial_${GOD_TRIALS[state.gauntlet.stage].id}`)
  }
  if (live && state.bossModifier?.tier === 4) ids.push(`warden_${state.bossModifier.id}`)
  if (state.phase === 'crossroads') ids.push('crossroads')
  // The Arbiter, on the third offense of fishing with the Eye (P5).
  if (live && state.arbiterScene) ids.push('arbiter')
  // Pip on crossing the door (K6), then the follower's arrival.
  if (state.realm === 'firmament' && ['bossReward', 'shop'].includes(state.phase)) ids.push('crossing')
  if (state.phase === 'shop' && state.shop?.firstFirmament) ids.push(`follower_${state.path ?? 'neutral'}`)
  // Vesper's first meeting, in a Forge past the door (K5).
  if (state.phase === 'shop' && state.realm === 'firmament' && ['forge', 'astral'].includes(state.shop?.type)) ids.push('vesper_first')
  if (state.phase === 'shop' && state.shop?.type === 'pantry' && (state.moteFed || 0) >= 40) ids.push('mote_first')
  if (state.recipes?.includes('entropy') && ['shop', 'bossReward', 'victory', 'rolling'].includes(state.phase)) ids.push('entropy')
  return ids.find((id) => sceneById(id) && !seen.includes(id)) ?? null
}

// Escape only opens the pause menu while an actual run is live: the meta
// screens already have their own nav (Back/Options buttons), and there's
// nothing to pause on gameover/victory.
const PAUSABLE_PHASES = new Set(['rolling', 'missed', 'shop', 'bossReward'])

function ElementaGameInner() {
  const [state, dispatch] = useReducer(gameReducer, undefined, initialState)
  const [paused, setPaused] = useState(false)
  const [tutorialActive, setTutorialActive] = useState(false)
  // false, or which Run Info tab to open ('run' or 'map').
  const [showRunInfo, setShowRunInfo] = useState(false)
  // A consumable used mid-round that is waiting for its target die.
  const [armedConsumable, setArmedConsumable] = useState(null)
  const [toasts, setToasts] = useState([])
  const slot = state.activeSlot
  // Story scenes this file has already seen (H7), read once per file.
  const [seenScenes, setSeenScenes] = useState([])
  useEffect(() => {
    setSeenScenes(slot == null ? [] : readProfile(slot).scenes || [])
  }, [slot])
  const story = slot == null ? null : sceneFor(state, seenScenes)
  const storyRef = useRef(null)
  storyRef.current = story
  const finishScene = useCallback(
    (id) => {
      markScenes(slot, [id])
      setSeenScenes((list) => (list.includes(id) ? list : [...list, id]))
    },
    [slot],
  )

  const notify = useCallback((items) => {
    if (items.length === 0) return
    setToasts((t) => [...t, ...items.map((item) => ({ ...item, key: `${item.kind}-${item.id}-${Date.now()}` }))])
  }, [])

  // Unlock achievements for this file, toasting any that are new.
  const award = useCallback(
    (ids) => {
      if (slot == null || ids.length === 0) return
      notify(unlockAchievements(slot, ids).map((id) => ({ kind: 'achievement', id })))
    },
    [slot, notify],
  )
  const { crtEffect, display } = useGameSettings()
  const { t } = useLanguage()

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

  // Element effects (and any other CSS loop) pause while the tab is hidden.
  const [tabHidden, setTabHidden] = useState(() => typeof document !== 'undefined' && document.hidden)
  useEffect(() => {
    const onChange = () => setTabHidden(document.hidden)
    document.addEventListener('visibilitychange', onChange)
    return () => document.removeEventListener('visibilitychange', onChange)
  }, [])

  // Each screen, shop type and boss has its own theme (data/musicThemes.js);
  // a story scene brings its own cue.
  const musicTheme = story ? sceneById(story).music : themeForState(state)
  useEffect(() => {
    setMusicTheme(musicTheme)
  }, [musicTheme])

  // Escape toggles a pause overlay (Options / back to main menu) while a
  // run is live, mirroring the in-shop Options panel for the phases that
  // don't already have one on screen.
  useEffect(() => {
    function handleKeyDown(e) {
      // A story scene takes Escape for itself (Skip).
      if (e.key !== 'Escape' || e.defaultPrevented || storyRef.current) return
      setPaused((p) => (p ? false : PAUSABLE_PHASES.has(state.phase)))
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [state.phase])

  // Leaving an active run (abandoned, missed out of lives, won) should
  // never leave a stale pause overlay sitting on top of the next screen.
  useEffect(() => {
    if (!PAUSABLE_PHASES.has(state.phase)) setPaused(false)
    setArmedConsumable(null)
  }, [state.phase])

  // While a run is live: keep the file's run snapshot fresh (autosave),
  // add everything visible to the Gallery, and check state-based
  // achievements. All writes are no-ops when nothing changed.
  useEffect(() => {
    if (slot == null || !AUTOSAVE_PHASES.has(state.phase)) return
    writeRun(slot, state)
    const seen = seenInState(state)
    Object.entries(seen).forEach(([kind, ids]) => markSeen(slot, kind, ids))
    award([...achievementsFromState(state), ...achievementsFromProfile(readProfile(slot))])
  }, [state, slot, award])

  // The Firmament's progress lives in the run and is mirrored to the file
  // (EXPANSION.md H2, H5, H6): Wardens beaten, their Mythic dice, Entropy's
  // recipe, and how much Mote has eaten.
  useEffect(() => {
    if (slot == null || !(AUTOSAVE_PHASES.has(state.phase) || state.phase === 'victory')) return
    markWardens(slot, state.wardens || [])
    // Recipes learned during the run (a Warden's Mythic die, Entropy, an
    // element fusion Vesper teaches, K1, K4) go to the file with a toast.
    notify(
      (state.recipes || [])
        .filter((id) => !['aether', ...GOD_IDS].includes(id) && learnRecipe(slot, id))
        .map((id) => ({ kind: MYTHIC_DIE_IDS.includes(id) ? 'mythic' : 'recipe', id })),
    )
    setMoteFed(slot, state.moteFed || 0)
  }, [state.phase, state.wardens, state.recipes, state.moteFed, slot, notify])

  // Each new cast result: discover secret reactions, record bests, and
  // check cast achievements.
  const lastResultRef = useRef(null)
  useEffect(() => {
    const r = state.lastResult
    if (!r || r === lastResultRef.current || slot == null) return
    lastResultRef.current = r
    const secrets = (r.reactions || []).filter((x) => SECRET_REACTION_IDS.includes(x.id)).map((x) => x.id)
    notify(markSeen(slot, 'reactions', secrets).map((id) => ({ kind: 'reaction', id })))
    updateStats(slot, (st) => ({
      ...st,
      bestCast: Math.max(st.bestCast || 0, r.roundScore),
      bestRound: Math.max(st.bestRound || 0, state.round),
    }))
    award([...achievementsFromCast(state, r), ...achievementsFromProfile(readProfile(slot))])
  }, [state, slot, notify, award])

  // A run ends: a loss clears the file's run; a win records the win,
  // unlocks the next loadout and difficulty, and clears the run too
  // (choosing Endless re-saves it on the next state change).
  // How a win ends (B2): which ending card, and whether the gods' visions
  // come first (the first Neutral win on a file teaches their recipes).
  const [endingView, setEndingView] = useState(null)
  useEffect(() => {
    if (state.phase !== 'victory') {
      setEndingView(null)
      return
    }
    // Read the file now, before the run-end effect below learns the recipes.
    const ending = state.ending || 'neutral'
    const known = readProfile(slot)
    const visions = ending === 'neutral' && !GOD_IDS.every((id) => knowsRecipe(known, id))
    setEndingView((view) => view ?? { ending, visions })
  }, [state.phase, state.ending, slot])

  // Records a win on the file: loadout, difficulty, stake, stickers, the
  // Aether recipe, the ending and its completion mark. Shared by the end of a
  // run and the Crossroads (EXPANSION.md H1), where the round-15 win counts
  // even if the run goes on through the door.
  const recordWin = useCallback(
    (ending) => {
      const before = readProfile(slot)
      markDeckBeaten(slot, state.deckId)
      markDifficultyBeaten(slot, state.difficulty?.id)
      markWin(slot, state.deckId, state.difficulty?.id)
      // A Cataclysm win stamps every die in the final pool (P16).
      if (state.difficulty?.id === 'cataclysm') markCataclysmDice(slot, state.dice.map((d) => d.elementId))
      // Beating Primordial hands over the Aether recipe (EXPANSION.md B6).
      if (learnRecipe(slot, 'aether')) notify([{ kind: 'recipe', id: 'aether' }])
      // A Neutral win shows the gods' visions and teaches their recipes,
      // opening the Split and Primordial paths (B2). Every win records its
      // ending, for the file and as a completion mark on the loadout.
      if (ending === 'neutral') notify(GOD_IDS.filter((id) => learnRecipe(slot, id)).map((id) => ({ kind: 'recipe', id })))
      if (markEnding(slot, ending, state.deckId)) notify([{ kind: 'ending', id: ending }])
      // A Firmament ending may have opened a sigil die (P3).
      notify((readProfile(slot).sigils || []).filter((id) => !(before.sigils || []).includes(id)).map((id) => ({ kind: 'sigil', id })))
      award([...achievementsFromVictory(state, before), ...achievementsFromProfile(readProfile(slot))])
    },
    [slot, state, notify, award],
  )

  // The Crossroads (H1): the Elementa ending is reached now, whether the
  // player rests or walks through the door.
  const crossedRef = useRef(null)
  useEffect(() => {
    if (slot == null || state.phase !== 'crossroads') return
    const key = `${state.seed}-${state.path}`
    if (crossedRef.current === key) return
    crossedRef.current = key
    recordWin(state.path || 'neutral')
  }, [state.phase, state.seed, state.path, slot, recordWin])

  const endedRef = useRef(null)
  useEffect(() => {
    if (slot == null || (state.phase !== 'gameover' && state.phase !== 'victory')) {
      endedRef.current = null
      return
    }
    if (endedRef.current === state.phase) return
    endedRef.current = state.phase
    clearRun(slot)
    if (state.phase === 'gameover') {
      // A run that fell in the Firmament had already won Elementa (H1).
      const won = state.realm === 'firmament' ? 1 : 0
      updateStats(slot, (st) => ({ ...st, runs: st.runs + 1, wins: st.wins + won }))
      return
    }
    // Past the door, the round-15 win was recorded at the Crossroads; this
    // records the Firmament ending (H1). recordWin is safe to repeat.
    recordWin(state.ending || 'neutral')
    updateStats(slot, (st) => ({ ...st, runs: st.runs + 1, wins: st.wins + 1 }))
    // Trinity: all three files at 100% unlocks it on every file.
    if (allFilesComplete()) {
      listFiles().forEach((_, i) => {
        const fresh = unlockAchievements(i, ['trinity'])
        if (i === slot) notify(fresh.map((id) => ({ kind: 'achievement', id })))
      })
    }
  }, [state, slot, award, notify, recordWin])

  const scene =
    state.phase === 'shop' || state.phase === 'bossReward'
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
      data-font={display.fontStyle}
      data-hidden={tabHidden ? '' : undefined}
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

        {state.phase === 'hub' && <FileHub slot={slot} dispatch={dispatch} />}

        {state.phase === 'bossReward' && <BossReward state={state} dispatch={dispatch} />}

        {state.phase === 'title' && <TitleScreen slot={slot} dispatch={dispatch} />}

        {state.phase === 'runPreview' && <RunPreview state={state} dispatch={dispatch} />}

        {(state.phase === 'rolling' || state.phase === 'missed') && (
          <div className="grid w-full flex-1 grid-cols-1 gap-5 lg:grid-cols-[280px_1fr] lg:gap-8">
            <RoundHUD state={state} dispatch={dispatch} armedConsumable={armedConsumable} onArm={setArmedConsumable} />
            {/* Stays mounted through a miss, so the table freezes on the
                final cast under the missed overlay below. */}
            <DiceTray
              key={state.roundSeq}
              state={state}
              dispatch={dispatch}
              availableRerolls={selectors.availableRerolls(state)}
              paused={paused || tutorialActive || showRunInfo || state.phase === 'missed' || Boolean(story)}
              armedConsumable={armedConsumable}
              onArmedDone={() => setArmedConsumable(null)}
            />
          </div>
        )}

        {state.phase === 'shop' && <ShopScreen state={state} dispatch={dispatch} />}

        {state.phase === 'crossroads' && <Crossroads state={state} dispatch={dispatch} />}

        {state.phase === 'gameover' && <GameOverScreen state={state} dispatch={dispatch} />}

        {/* Waits one frame for the ending view, so the cards start right. */}
        {state.phase === 'victory' && endingView && (
          <GameOverScreen
            state={state}
            dispatch={dispatch}
            victory
            ending={endingView?.ending}
            visions={endingView?.visions}
            onScene={(id) => {
              finishScene(id)
              // The recipes scene ends with "Remembering" (Q4a).
              if (id === 'recipes') award(['remembering'])
            }}
          />
        )}
      </main>

      {/* Round 15's arena leans with the path (B1): red toward the
          Primordial, blue-white toward the Split, untouched for Neutral. */}
      {inRun && state.round === 15 && (state.path === 'primordial' || state.path === 'split') && (
        <div
          className="pointer-events-none fixed inset-0 z-[1]"
          style={{
            background: `radial-gradient(ellipse at center, transparent 35%, ${
              state.path === 'primordial' ? 'rgba(255, 58, 74, 0.28)' : 'rgba(191, 228, 255, 0.24)'
            } 100%)`,
          }}
        />
      )}

      {/* A miss: centered over a dimmed, grayed-out table (EXPANSION.md E10). */}
      {state.phase === 'missed' && !paused && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-[#07050c]/75 px-4"
          style={{ backdropFilter: 'grayscale(0.6)' }}
        >
          <RoundResult state={state} dispatch={dispatch} />
        </div>
      )}
      {/* Game over gets the same dimmed backdrop behind its summary. */}
      {state.phase === 'gameover' && (
        <div className="pointer-events-none fixed inset-0 z-[5] bg-[#07050c]/75" style={{ backdropFilter: 'grayscale(0.6)' }} />
      )}

      {/* A visible way into the pause menu: Escape alone was undiscoverable. */}
      {inRun && !paused && (
        <div className="fixed right-4 top-4 z-30 flex gap-3">
          {state.map && (
            <button type="button" onClick={() => setShowRunInfo('map')} className="el-btn el-btn--sm">
              {t('elementa.map.button')}
            </button>
          )}
          <button type="button" onClick={() => setShowRunInfo('run')} className="el-btn el-btn--sm">
            {t('elementa.runInfo.button')}
          </button>
          <button type="button" onClick={() => setPaused(true)} className="el-btn el-btn--sm" aria-label="Pause">
            <PixelIcon name="pause" size={10} />
            <span className="el-key">Esc</span>
          </button>
        </div>
      )}

      <span className="pointer-events-none fixed bottom-2 right-3 z-10 text-[10px] text-[var(--text-mute)]">
        v{LATEST_VERSION} alpha
      </span>

      {paused && inRun && <PauseMenu slot={slot} dispatch={dispatch} onResume={() => setPaused(false)} />}

      {inRun && <Tutorial state={state} paused={paused || showRunInfo || Boolean(story)} onActiveChange={setTutorialActive} />}

      {story && <StoryScene key={story} id={story} onDone={() => finishScene(story)} />}

      {showRunInfo && inRun && <RunInfo state={state} initialTab={showRunInfo} onClose={() => setShowRunInfo(false)} />}

      <Toasts items={toasts} onDone={(key) => setToasts((t) => t.filter((x) => x.key !== key))} />

      {crtEffect && <CrtScanlines />}
    </div>
  )
}

export default function ElementaGame() {
  return (
    <GameSettingsProvider>
      <ErrorBoundary>
        <ElementaGameInner />
      </ErrorBoundary>
    </GameSettingsProvider>
  )
}
