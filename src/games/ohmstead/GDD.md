# Ohmstead: Game Design Document

Name: **Ohmstead** (chosen 2026-10-18). Status: **draft v0.1, concept locked, details open.** Nothing is built yet.
Rule for this file: it holds settled design. Loose ideas go in `IDEAS.md`, the build plan lives in `PLAN.md`.

## 1. Pitch

An isometric factory game about building electronics. You start with a drill on a patch of quartz and end with a factory that mass-produces a working computer. Along the way you handle the real chain: mining, refining silicon, wafers, chips, PCBs, assembly, power and heat. In the late game you stop only moving items and start designing: a small logic-gate editor lets you build the circuit that a chip runs, and the factory then produces it.

It is the opposite of Elementa: persistent, spatial, slow-burn, no randomness-driven runs, no score targets. One factory, one save, one long build.

Why it exists in the portfolio: it shows the ECE background in a way most projects cannot. Anyone who plays it sees someone who understands how electronics are made.

## 2. Pillars

1. **Real electronics, simplified honestly.** Every machine and recipe maps to a real step of electronics manufacturing. Simplified, never invented.
2. **Throughput is the puzzle.** Belts, ratios, bottlenecks and layout are the game. No combat, no enemies.
3. **Readable at a glance.** Isometric art made in code, clear silhouettes, color-coded materials, a visible flow rate on everything.
4. **Design, not just logistics.** The Logic Lab (section 8) is the signature feature: the player's own circuit becomes the product.
5. **Finishable, then a sandbox.** Same shape as Factorio and Satisfactory: a campaign with a defined end (delivering the computer, our rocket launch) in roughly 4 to 6 hours, after which the game does not stop. The factory keeps running and the player keeps building with everything unlocked.
6. **Factorio is the north star.** When a design question comes up, ask what Factorio does. Its lessons that apply here: two-lane belts, a tight readable item flow, research paid in produced goods, mining that you scale up rather than micromanage, a late-game that is about optimization and elegance, and a factory that is a visible monument to your decisions.

## 3. Platform and tech (recommendation, see PLAN.md for the reasoning)

- Lives in the Portafolio repo at `src/games/ohmstead/`, routed at `/games/ohmstead`, like Elementa.
- **Simulation** is pure JS in `engine/`, no React, no DOM, fixed tick (20 ticks per second), deterministic, testable with Node scripts (same method as the Elementa reducer).
- **Renderer** is PixiJS (WebGL, batched sprites) drawing an isometric projection. React only owns menus, HUD panels, the tech tree and the Logic Lab UI.
- **Art** is code art only: sprites generated procedurally from SVG/canvas at load time. No generative image models.

## 4. Core loop

1. Place drills on resource nodes.
2. Move raw items with belts to machines.
3. Machines turn inputs into outputs by recipe, needing power.
4. Deliver products to the **Dock** (the sink). Delivered items count as research points and fulfil orders.
5. Research unlocks new machines, recipes and a bigger map area.
6. Hit a bottleneck, redesign the layout, repeat, until the final product is delivered.

## 5. World

- A large but bounded isometric grid map (size TBD, target around 512 x 512 tiles), fully procedural from a player-chosen seed (same RNG approach as `elementa/engine/rng.js`). It generates in chunks as the player expands, so it feels like Factorio's infinite map while staying balanceable and performant.
- The seed guarantees a fair start: every required resource appears within a set distance of the start, with richer patches farther out.
- Starting area is small and expands in rings as missions and research are completed (keeps early game focused, gives a progression feel without fog-of-war complexity).
- No enemies and no combat, ever. Peaceful.
- Terrain is flat for v1. Height levels are out of scope.
- Resource nodes: **Quartz sand, Copper ore, Tin ore, Gold ore, Carbon (coal), Crude oil.** Fluids in the base game: **crude oil and water.**

## 6. Building blocks

### 6.1 Logistics
| Item | Role |
|---|---|
| Belt (3 tiers) | Moves items, tier sets speed |
| Splitter, Merger, Sorter | Branch, combine, filter by item |
| Bridge | Crosses another belt |
| Storage crate | Buffer, also a pass-through for loops |
| Pipe, Pump | Fluids (oil, later water for cooling) |

Items on belts are real positions along a belt segment, not grid hops, so spacing, compression and backing up behave like Factorio.

### 6.2 Machines (each has: footprint, power draw, input ports, output ports, recipe)
Drill, Smelter, Refiner, Furnace (crystal growth), Cutter (wafer slicing), Fab Line modules (see 7), Assembler, SMT Line (pick and place plus reflow), Plastics Plant, Foil Press, Tester (quality gate), Dock.

Machines run one recipe at a time, with an input buffer and an output buffer. No hidden magic: if a machine is idle, the UI says exactly why (no power, missing input X, output full).

### 6.3 Power
- Energy production is part of the puzzle, not a free utility. Generators: Coal burner, Oil refinery chain feeding a Fuel generator (crude oil -> refinery -> fuel and plastics byproduct, so oil demand for energy competes with oil demand for plastic), Steam turbine (water + fuel/coal), Solar array (later), Battery. Fuel logistics and water supply are real layout problems.
- Power is a single connected network per power pole group in v1 (wires built from poles, with a draw radius). Satisfaction is a percentage: when demand exceeds supply, all machines slow down proportionally, never hard-fail.
- Power display uses real units (W, kW) with simple, rounded values.

### 6.5 The player, inventory and hand crafting (Factorio style, agreed 2026-10-18)
- The player has a personal inventory (48 slots) and builds by hand-crafting buildings from items they carry. There is no shared Stock.
- Items reach the inventory by taking them from Storage Crates, machine output buffers or belt ends. Ore can be hand-mined at a slow rate so the game can never soft lock.
- Hand crafting covers all buildings and anything made by an Assembler or Foil Press. Anything from a Smelter, Plastics Plant or the fab machines (ingots, resin, silicon, boards, chips) must be made by the factory and carried in. This is what keeps early belts honest and forces ingot and board belts into crates.
- The Dock is not a materials source: it accepts only items an open mission still needs, by belt or hand drop.
- Whether the player is a walking avatar with reach or a free camera is open (PLAN section 4b). Exact numbers: `CONTENT.md` section 11.

### 6.4 Heat (mid game)
Fab modules and CPUs produce heat. Cooling is a fluid loop (pump plus radiator) that raises the machine's speed ceiling. Optional pressure, not a fail state, in v1.

## 7. Production chains (the real content)

Tier names are the tech tiers.

**T1: Basics** (Quartz, Copper, Tin, Carbon)
- Copper ore -> Copper ingot -> Copper wire, Copper foil
- Tin ore -> Tin ingot; Tin + Copper -> Solder
- Quartz sand -> Silicon (carbon smelt) -> Silicon ingot
- Crude oil -> Plastic resin; Quartz + Resin -> Fiberglass board (PCB substrate)
- Parts: Resistor, Capacitor, LED, Diode (simple recipes, no wafer needed)

**T2: Boards**
- Substrate + Copper foil -> Bare PCB
- Bare PCB + parts + Solder -> PCB assembly (SMT Line)
- Products: Power supply board, Sensor board, LED panel

**T3: Silicon fab**
- Silicon ingot -> Wafer (Cutter) -> Doped wafer -> Etched wafer (photoresist, light, chemicals) -> Dies (Cutter) -> Packaged chip (Assembler plus gold bond wire)
- Chips: Transistor array, Memory chip, Microcontroller (needs a Logic Lab design from T3 onward)
- Yield: etched wafers have a yield percent (Tester machine sorts good dies from bad). Yield improves with research and cooling. This is the core optimization lever of the tier.

**T4: Computing**
- Single board computer = Microcontroller + Memory + Power board + Connector + Case
- Final product: **The Ohmstead One**, a working single-board computer. Delivering N of them to the Dock completes the campaign.

Exact recipe numbers (inputs, time, power) live in `data/recipes.js` once built, and are mirrored in `CONTENT.md`.

## 8. The Logic Lab (signature feature)

- A grid editor with AND, OR, NOT, XOR, NAND, latch, clock, input pins and output pins.
- Each chip type has a **spec** (a truth table or small behavior test, for example a half adder, a 4-bit counter, a LED blinker). The player builds a circuit that passes every test case.
- Passing the spec unlocks that chip's recipe. The **gate count** and **depth** of your design affect the product: fewer gates means a smaller die, so more dies per wafer (efficiency), deeper logic lowers max clock (speed rating).
- Simulation is a simple synchronous gate evaluator (pure JS, in `engine/logic/`, unit-testable).
- Scope guard: 4 hand-authored specs (Blinker, Half Adder, Register, Mini Controller), required to finish the campaign, with built-in hints. No arbitrary HDL, no free-form scoring. Exact numbers are in `CONTENT.md` section 7.

## 9. Progression and tech tree

Two systems that feed each other (Carlos's design, 2026-10-18):

**Missions (the main objective).**
- The **Dock** posts missions: "deliver N of item X". Completing a mission is how the campaign advances.
- Each mission grants **unlock points**, which are spent in the tech tree to unlock machines, recipes, belt tiers and map rings.
- Missions are chained and escalate through the 4 tiers, ending with delivering the computer.

**Research (learning components).**
- **Labs** are machines that consume parts delivered by belt, like Factorio's science packs. The parts consumed are real components from the chain (for example resistors, LEDs, PCBs).
- Research does not spend unlock points. It **investigates** a component, machine or process so the player is allowed to use or request it.
- Some missions are gated: you must first research a part before the Dock will ask for it. The player cannot just belt something to the Dock without having studied it.
- Result: the factory has two demands that compete for the same production, "ship for the mission" and "feed the labs", which is the Factorio feeling.

Roughly 30 to 40 tree nodes in 4 tiers. Open numbers (point costs, lab consumption per node) live in `data/research.js` once built.

**End:** deliver the final batch of Ohmstead One computers. Credits scene, then the sandbox continues with everything unlocked and optional endless missions.

## 10. UI and controls

- Pan, zoom, rotate-in-90-degrees camera.
- Inventory and craft queue panel, ghost placement from the inventory, drag to place belts, rotate with R, copy-paste a region (blueprints in v1.0, not before).
- Select a machine: panel shows recipe, rates in items per minute, power draw, current state and bottleneck reason.
- **Stats overlay:** per-item production and consumption per minute, graph of the last few minutes.
- Heatmap overlays for power coverage, belt saturation and idle machines.
- Keyboard first, with hotkeys for every build tool.

## 11. Art direction

- Isometric tiles, cool dark neutral palette for the ground, **each material owns a color** everywhere (same rule as elements in Elementa): copper orange, silicon blue-grey, gold yellow, tin pale grey, resin amber, PCB green, quartz white.
- Machines are chunky, readable, with animated parts (spinning drill head, glowing furnace, blinking LEDs) drawn in code.
- Soft light and a slight bloom on powered machines; unpowered machines are visibly dark.
- Sound: procedural (WebAudio), a low hum that scales with factory activity, per-machine tick sounds. Reuse the Elementa sound engine approach.
- Music: procedural, Minecraft style. Sparse and atmospheric, several different pieces that play at irregular times with long silences between them, never a constant loop. Reuse the Elementa Jukebox editor approach for authoring songs.
- No generative visual art. Hand-made later where Carlos wants, code art in the meantime.

## 12. Save system

- Single save slot per profile at first, JSON in localStorage plus export and import file (reuse the Elementa backup approach).
- The sim is deterministic from seed plus build log, so saves are the world state snapshot, not a replay.

## 13. Out of scope for v1.0

Multiplayer, enemies or hazards, vehicles and trains, terrain height, mod support, mobile touch layout, a story with characters. (Trains and blueprints are the first candidates for post-1.0.)

## 14. Open questions

See `PLAN.md` section "Open decisions". Anything unresolved is listed there, not here, so this file stays settled.
