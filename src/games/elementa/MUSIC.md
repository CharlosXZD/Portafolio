# Elementa music guide

Every song in Elementa is generated in the browser from a few lines of text. There are no audio files. This guide lists every song, shows how to listen to them, and explains how to change them.

## 1. Listen to them (the Jukebox)

- In the game: **Options, Audio, "Open the Jukebox"** (it opens in a new tab, so a run in progress is untouched).
- Or go straight to `/games/elementa/jukebox` (for example `http://localhost:5173/games/elementa/jukebox` while the dev server runs).
- Press **Play** next to any song. **Auto-play all** walks through every song, 25 seconds each. The volume slider and the music on/off switch are the same ones as in Options.

## 2. Change them (the editor)

Click a song, then change anything on the right. **It re-plays by itself a moment after you stop typing**, so you hear each edit. If something is wrong (a typo in a note) the editor says what and which step, and keeps playing the last good version.

| Button | What it does |
|---|---|
| **Play** | Plays your version from the start |
| **Hear the original** | Plays the built-in version, to compare |
| **Save in this browser** | Stores your version in this browser. **The game itself then plays it** (the song gets an "edited" tag in the list) |
| **Copy as code** | Copies the song as a block of code, ready to paste into `src/games/elementa/data/musicThemes.js` so the change is permanent and goes into the repository |
| **Reset this song** | Throws away your saved version of this song |
| **Reset every edit** | Throws away all saved versions |

Saved edits live only in your browser (they are in your backup files too, because they are an `elementa-` key). To make a change permanent for everyone, use **Copy as code** and paste it over the song's block in `musicThemes.js`, then reset the saved edit so the file is the only source.

## 3. Every song

Where each plays, its key, scale, tempo and length (a bar is 16 steps). "pad" means a soft chord layer, "drums" a percussion line.

| Song id | Where it plays | Key and scale | BPM | Bars | Extras |
|---|---|---|---|---|---|
| `menu` | Main menu, file screens, new run | G2 pentMinor | 100 | 2 | - |
| `table` | A normal round (the dice table) | G2 minor | 133 | 4 | drums |
| `gameover` | Game over | A2 minor | 60 | 2 | - |
| `victory` | Boss reward and victory | C3 major | 125 | 2 | pad, drums |
| `scene_crossroads` | Story scene: the Crossroads | A2 lydian | 83 | 2 | pad, drums |
| `scene_firmament` | Story scenes: the visions, Entropy | A3 pentMajor | 100 | 2 | pad, drums |
| `shop_market` | Market shop (Tobb) | C3 major | 115 | 4 | drums |
| `shop_alchemist` | Alchemist (Vessa) | D3 wholeTone | 125 | 2 | drums |
| `shop_vault` | Relic Vault (the Curator) | A2 harmonicMinor | 75 | 4 | pad, drums |
| `shop_forge` | Forge (Brasa) | E2 phrygian | 136 | 2 | drums |
| `shop_blackmarket` | Black Market (Nix) | D3 dorian | 100 | 2 | swing, drums |
| `shop_shrine` | Shrine (Aeris) | F3 pentMajor | 68 | 2 | pad, drums |
| `shop_bazaar` | Aether Bazaar (every keeper) | C3 lydian | 125 | 2 | pad, drums |
| `shop_vesper` | A Forge past the door (Vesper and Brasa), and Vesper's first meeting | E3 lydian | 107 | 2 | pad, drums |
| `shop_cartography` | Atlas's Cartography (the Firmament) | D3 major | 115 | 2 | drums |
| `shop_clockwork` | The Horologist's Clockwork (the Firmament) | G3 dorian | 125 | 2 | drums |
| `shop_observatory` | Seren's Observatory (the Firmament) | D4 lydian | 75 | 2 | pad |
| `shop_pantry` | Mote's Pantry (the Firmament) | F2 pentMinor | 107 | 2 | drums |
| `boss_calm_winds` | Boss: Calm Winds | D3 lydian | 75 | 2 | drums |
| `boss_grounded` | Boss: Grounded | E2 minor | 94 | 2 | drums |
| `boss_iron_grip` | Boss: Iron Grip | C3 harmonicMinor | 115 | 2 | drums |
| `boss_drought` | Boss: Drought | D3 phrygian | 100 | 2 | drums |
| `boss_tax_collector` | Boss: Tax Collector | A2 minor | 107 | 2 | drums |
| `boss_scatter` | Boss: Scatter | C3 wholeTone | 150 | 2 | drums |
| `boss_ermal` | Boss: Ermal the Unbothered | C3 major | 63 | 2 | drums |
| `boss_null_zone` | Boss: Null Zone | F#2 phrygian | 83 | 2 | pad |
| `boss_gravity_well` | Boss: Gravity Well | A2 minor | 100 | 2 | drums |
| `boss_the_pillar` | Boss: The Pillar | G2 minor | 75 | 2 | pad |
| `boss_frostbite` | Boss: Frostbite | C#3 pentMinor | 125 | 2 | drums |
| `boss_eclipse` | Boss: Eclipse | D2 minor | 75 | 2 | drums |
| `boss_silence` | Boss: Silence | A2 pentMinor | 60 | 2 | drums |
| `boss_primordial` | Final boss: Primordial | A2 harmonicMinor | 150 | 2 | drums |
| `boss_gaea` | Gauntlet stage 1: Gaea | E2 dorian | 94 | 1 | drums |
| `boss_ognen` | Gauntlet stage 2: Ognen | E3 phrygian | 167 | 1 | drums |
| `boss_varuna` | Gauntlet stage 3: Varuna | C3 lydian | 125 | 1 | drums |
| `boss_zephyr` | Gauntlet stage 4: Zephyr | C4 wholeTone | 150 | 1 | drums |
| `boss_dawn` | Warden: The Dawn (the Firmament) | E3 lydian | 136 | 2 | pad, drums |
| `boss_umbra` | Warden: The Umbra (the Firmament) | D2 phrygian | 88 | 2 | drums |
| `boss_clockwork` | Warden: The Clockwork (the Firmament) | D3 dorian | 150 | 2 | drums |
| `boss_expanse` | Warden: The Expanse (the Firmament) | A2 pentMajor | 107 | 2 | pad, drums |
| `boss_maelstrom` | Warden: The Maelstrom (the Firmament) | B2 harmonicMinor | 176 | 2 | drums |
| `boss_hollow` | Warden: The Hollow (the Firmament) | G2 wholeTone | 75 | 2 | drums |
| `boss_axiom` | Rewriter: The Axiom (realm 3) | C3 major | 125 | 2 | drums |
| `boss_zero` | Rewriter: Zero (realm 3) | C2 minor | 68 | 2 | none |
| `boss_infinity` | Rewriter: Infinity (realm 3) | D3 lydian | 165 | 2 | hats |
| `boss_observer` | Rewriter: The Observer (realm 3) | A2 dorian | 94 | 2 | sparse |
| `boss_floating` | Rewriter: Floating Point (realm 3) | E3 harmonicMinor | 150 | 2 | drums |
| `boss_deadlock` | Rewriter: Deadlock (realm 3) | E2 phrygian | 75 | 2 | kick |
| `scene_realm3` | Realm 3: the door and the scenes | A#2 wholeTone | 62 | 3 | pad |

The game picks a song for every screen with `themeForState` at the bottom of `data/musicThemes.js`. Names follow a pattern: `shop_<shop type>` for shops, `boss_<boss id>` for bosses (the Wardens too), `scene_<name>` for story scenes. A story scene picks its song in `data/story.js` (its `music`), often an existing theme; while it is open it replaces the screen's song. A song that does not exist falls back to the menu theme.

## 4. How a song is written

A song is one entry in `MUSIC_THEMES` (`src/games/elementa/data/musicThemes.js`):

```js
shop_forge: {
  root: 40,            // the lowest note, as a MIDI number (40 is E2)
  scale: 'phrygian',   // which notes the numbers below mean
  step: 0.11,          // seconds per step: smaller is faster
  lead: '. . . . 4 . 5 . 4 . 3 . 1 - - . . . . . 4 . 5 . 7 . 5 . 4 - - .',
  bass: '0 0 . 0 . 0 1 . 0 0 . 0 . 0 -1 .',
  perc: 'k . a . k . a . k k a . k . a a',
  voices: { lead: 'square', bass: 'sawtooth' },
}
```

### Timing

- Every pattern is a row of **steps** separated by spaces. **16 steps make one bar.** A pattern repeats when it ends.
- `step` is the length of one step in seconds. Tempo in BPM is `60 / (4 x step)`: a step of 0.15 is 100 BPM, 0.11 is about 136, 0.2 is 75.
- The lead, bass and percussion loop **independently**, so a 16-step bass under a 32-step melody just repeats twice. That is how a short groove can sit under a long tune.

### Notes (lead and bass)

| Write | Meaning |
|---|---|
| a number, like `4` | a note: that scale degree (0 is the root, 1 the next note of the scale, and so on) |
| `7` on a 7-note scale | the root again, one octave up (a 5-note scale reaches the octave at 5) |
| a negative number, like `-1` | below the root |
| `-` | hold the previous note (it lasts longer) |
| `.` | a rest (silence) |

The **lead** plays two octaves above `root` (shift it with `leadOctave`, which can be negative). The **bass** plays at `root`. A **pad** (optional) is a list of chords, one per bar, played softly one octave up: `pad: [[0, 2, 4], [3, 5, 7]]` plays the chord of degrees 0, 2, 4 in bar one and 3, 5, 7 in bar two.

### Percussion

Letters instead of numbers, in `perc`:

| Letter | Sound |
|---|---|
| `k` | kick |
| `s` | snare |
| `h` | hi-hat |
| `t` | tick (a small click) |
| `a` | anvil (used in the Forge) |
| `b` | bell |
| `p` | bubble (used in the Alchemist) |
| `z` | snore (used for Ermal) |

### Sounds (voices)

`voices` picks a wave for each part: `sine` (soft and round), `triangle` (warm), `square` (bright and 8-bit), `sawtooth` (buzzy, good for bass and danger). Add `pad: 'sine'` if the song has a pad.

### Extra knobs (all optional)

| Key | What it does |
|---|---|
| `swing` | delays every second step by this fraction of a step, for a shuffle feel (the Black Market uses 0.3) |
| `gain` | the song's loudness, 0 to 1 (quiet songs like Eclipse and Silence use less than 1) |
| `leadOctave` | shifts the melody up or down whole octaves |
| `leadGlide` | slides each lead note by this many semitones as it plays (used by Gravity Well) |

### Scales

The numbers in a pattern mean different notes depending on the `scale`. Semitones above the root:

| Scale | Semitones | Notes |
|---|---|---|
| `major` | 0 2 4 5 7 9 11 | 7 |
| `minor` | 0 2 3 5 7 8 10 | 7 |
| `harmonicMinor` | 0 2 3 5 7 8 11 | 7 |
| `dorian` | 0 2 3 5 7 9 10 | 7 |
| `phrygian` | 0 1 3 5 7 8 10 | 7 |
| `lydian` | 0 2 4 6 7 9 11 | 7 |
| `pentMinor` | 0 3 5 7 10 | 5 |
| `pentMajor` | 0 2 4 7 9 | 5 |
| `wholeTone` | 0 2 4 6 8 10 | 6 |

How they feel: `major` and `lydian` are bright, `pentMajor` is calm and open, `minor` and `dorian` are serious, `harmonicMinor` is dramatic, `phrygian` is dark and tense, `pentMinor` is simple and moody, `wholeTone` is dreamy and strange (no clear home note).

### Root notes

`root` is a MIDI note number. Useful ones: 36 is C2, 38 is D2, 40 is E2, 43 is G2, 45 is A2, 48 is C3, 50 is D3, 53 is F3, 60 is middle C. Add 12 for an octave up. The editor shows the note name next to the number.

## 5. A first tune in two minutes

1. Open the Jukebox and click **Main menu** (a short, simple song).
2. In **Lead**, replace everything with `0 2 4 7 4 2 0 .` and listen: a rising and falling arpeggio.
3. Try `0 . 2 . 4 . 7 -` for a slower feel, or set **Seconds per step** to `0.09` to speed it up.
4. Change **Scale** to `phrygian` for a dark version of the same notes, or `lydian` for a shining one.
5. In **Bass** write `0 - - - - - - - 3 - - - - - - -` for two long notes.
6. In **Percussion** write `k . h . s . h .` for a basic beat.
7. When you like it, press **Save in this browser** and play the game to hear it in place, or **Copy as code** to keep it in the repository.

## 6. Add a brand new song

1. Add a block to `MUSIC_THEMES` with a new id (use the pattern `shop_<type>` or `boss_<id>` if it is for a shop or a boss, and the game plays it by itself).
2. For a screen the game does not name yet, return your id from `themeForState`.
3. Open the Jukebox: new songs appear in the list automatically (under Screens, Shops or Bosses by their id).

## 7. Tips

- **Keep it small.** Two bars loop for a long time, so a simple tune that you can hum beats a busy one that tires the ear.
- **Match the room.** Fast with drums for tension (bosses), slow with a pad for calm (the Shrine), a swing for something shady (the Black Market).
- **Mind the volume.** Square and sawtooth waves are loud; set `gain` below 1 if a song fights the dice sounds.
- **Silence is a note.** The Silence boss is a single bell and rests. Rests make the other notes matter.
- **Same mood, different key.** To make a variation of a song, change only `root` (up or down) and `scale`.
