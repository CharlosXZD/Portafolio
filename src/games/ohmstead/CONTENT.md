# Ohmstead: Content (draft numbers)

Status: **DRAFT numbers, nothing is implemented.** Every value here is a first pass for paper balancing. Once the game exists this file becomes the regenerated record of what is in the game now (same role as `elementa/CONTENT.md`), and the numbers move into `data/*.js`.
Design rules live in `GDD.md`, the roadmap in `PLAN.md`. Ideas that are not decided do not go in this file.
The model that produced and checked these tables is `tools/balance_model.py` (plus `tools/gen_content.py`). Change a number there, rerun, and the derived tables below (raw costs, machine counts, points feasibility, pacing) update. Do not hand-edit derived tables.

## 0. Conventions

- Time is in seconds per craft at speed x1. Rates are items per minute (**ipm**). Fluids are units per minute (**u/min**). Power is kW.
- Every recipe has exactly one producing machine, except Resin (see 4.2). No recipe has two outputs, except the Refinery (fuel + resin) and the Cutter's wafer and die cuts.
- Material colors (GDD 11): copper orange, tin pale grey, gold yellow, quartz white, silicon blue-grey, resin amber, PCB green, carbon near-black, oil black-brown, water blue.
- **No shared Stock.** The player has a personal inventory and hand-crafts buildings (section 11). The Dock accepts only what an open mission needs.
## 1. Raw resources

| Resource | Kind | Mined by | Where (see GDD 5) | Used for |
|---|---|---|---|---|
| Quartz sand | ore | Drill | near start | Silicon, substrate |
| Copper ore | ore | Drill | near start | Ingots, wire, foil |
| Tin ore | ore | Drill | near start | Solder |
| Carbon (coal) | ore | Drill | near start | Silicon smelting, resistors, dopant, plastics, burners |
| Gold ore | ore | Drill | ring 2 | Gold wire for LEDs and chip bonding |
| Crude oil | fluid | Oil Pump | ring 2 | Resin, fuel |
| Water | fluid | Water Pump | ring 3 | Steam power, cooling |

Patch richness is 50% to 300% of base output. Patches do not deplete in v1 (Open: finite patches would add a late-game pressure, see PLAN).

## 2. Logistics

| Piece | Value |
|---|---|
| Belt Mk1 | 120 ipm total (2 lanes of 60), 0.5 tiles/s |
| Belt Mk2 | 240 ipm, 1 tile/s |
| Belt Mk3 | 480 ipm, 2 tiles/s (optional tech n35) |
| Pipe | 1200 u/min per segment, 1 tile |
| Power pole | supply area 7x7 tiles, wire reach 8 tiles |
| Splitter / Merger / Sorter | pass belt rate, sorter filters one item per output |
| Storage crate | 40 slots, 100 items per slot |

## 3. Machines

| Machine | Footprint | Power kW | Speed / output | Heat kW | Unlocked by | Notes |
|---|---|---|---|---|---|---|
| Drill Mk1 | 2x2 | 50 | 30 ore/min | - | start | Output scales with patch richness 50% to 300% |
| Drill Mk2 | 2x2 | 100 | 60 ore/min | - | Drill Mk2 (n07) |  |
| Drill Mk3 | 3x3 | 200 | 120 ore/min | - | Heavy Mining (n35) |  |
| Oil Pump | 2x2 | 80 | 300 u/min | - | Oil Pumping (n09) | Fluid units per minute, scales with richness |
| Water Pump | 2x2 | 40 | 600 u/min | - | Water and Steam (n22) | Placed on shallow water |
| Smelter | 2x2 | 90 | x1 | - | start |  |
| Assembler | 3x3 | 75 | x1 | - | Assembly (n01) |  |
| Assembler Mk2 | 3x3 | 160 | x2 | - | Assembler Mk2 (n21) |  |
| Foil Press | 2x2 | 60 | x1 | - | Copper Foil (n02) |  |
| Plastics Plant | 3x3 | 120 | x1 | - | Plastics (n10) | Fluid input |
| Refinery | 3x4 | 200 | x1 | - | Fuel Power (n14) | Crude to fuel + resin. 6 s: 30 crude -> 12 fuel + 2 resin |
| SMT Line | 3x5 | 150 | x1 | - | SMT Line (n17) | Pick and place plus reflow |
| Crystal Furnace | 3x3 | 180 | x1 | 180 | Crystal Growth (n23) |  |
| Cutter | 2x3 | 100 | x1 | - | Wafer Processing (n24) | Wafer slicing and die cutting |
| Doping Chamber | 3x3 | 150 | x1 | 100 | Wafer Processing (n24) |  |
| Stepper | 4x4 | 400 | x1 | 400 | Photolithography (n25) | Photolithography. One recipe per Logic Lab design |
| Tester | 2x2 | 90 | x1 | - | Test and Package (n27) | Sorts dies, discards the bad ones |
| Packager | 3x3 | 120 | x1 | - | Test and Package (n27) |  |
| Lab | 3x3 | 60 | x1 | - | start | Consumes belted parts to research |
| Final Assembly | 4x4 | 250 | x1 | - | Final Assembly (n38) |  |
| Dock | 4x4 | 0 | - | - | start | Mission sink. Accepts only items an open mission needs |

Machine rules: input buffer holds 2 crafts of inputs, output buffer holds 2 crafts of outputs. A machine always reports one status: Working, No power, Missing <item>, Output full, or Overheated. Machines with a Heat value need a Cooling Jacket (3.1) to reach 100% speed.

### 3.1 Heat and cooling

- Heat machines: Crystal Furnace 180, Doping Chamber 100, Stepper 400 kW of heat.
- Without a Cooling Jacket a heat machine runs at **60% speed**. A Cooling Jacket consumes water at `0.3 u/min per kW of heat`: Stepper 120 u/min, Furnace 54, Doping Chamber 30.
- Speed = `0.6 + 0.4 x water satisfaction`. A cooled Stepper also gives +5% yield (see 7.3).
- Unlocked by research Cooling (n28). The Cooling Jacket costs 4 Capacitor + 20 Copper Foil.

## 4. Power

| Generator | Output kW | Consumes | Unlocked by |
|---|---|---|---|
| Coal Burner | 300 | 6 carbon/min | start |
| Fuel Generator | 1200 | 60 fuel u/min | Fuel Power (n14) |
| Steam Plant | 2000 | 30 fuel u/min + 300 water u/min | Water and Steam (n22) |
| Solar Array | 60 | none (flat, no night in v1) | Solar and Battery (n34) |
| Battery | - | stores 2 MWh, charges from surplus | Solar and Battery (n34) |

- Fuel comes from the Refinery: **30 crude -> 12 fuel + 2 resin per 6 s**, so one Refinery at full speed turns 300 crude/min into 120 fuel/min and 20 resin/min.
- Efficiency ladder per fuel unit: Fuel Generator 20 kW/u, Steam Plant 66.7 kW/u. Steam needs water, so it is better but costs plumbing.
- Demand above supply slows every machine proportionally (`satisfaction = supply / demand`), never hard fails.
- Oil is contested: crude goes to resin (plastics) and to fuel (power). The Refinery's resin byproduct partly covers plastics, which is the intended tie between the two.
- Worked example in section 10: the campaign-end base needs about 16.2 MW.

### 4.2 Resin

Two sources on purpose: Plastics Plant (`20 crude + 1 carbon -> 3 resin`, 4 s, resin focused) and the Refinery byproduct (see above). Item recipes below list the Plastics Plant.

## 5. Recipes

Rate column is the main output per minute for one machine at speed x1.

### Smelter

| Recipe | Inputs | Output | Time s | Rate ipm |
|---|---|---|---|---|
| Cu Ingot | 1 Copper Ore | 1 Copper Ingot | 3 | 20.0 |
| Sn Ingot | 1 Tin Ore | 1 Tin Ingot | 3 | 20.0 |
| Au Ingot | 2 Gold Ore | 1 Gold Ingot | 6 | 10.0 |
| Silicon | 2 Quartz, 1 Carbon | 1 Silicon | 6 | 10.0 |

### Foil Press

| Recipe | Inputs | Output | Time s | Rate ipm |
|---|---|---|---|---|
| Cu Foil | 1 Copper Ingot | 2 Copper Foil | 2 | 60.0 |

### Assembler

| Recipe | Inputs | Output | Time s | Rate ipm |
|---|---|---|---|---|
| Cu Wire | 1 Copper Ingot | 2 Copper Wire | 1 | 120.0 |
| Au Wire | 1 Gold Ingot | 4 Gold Wire | 2 | 120.0 |
| Solder | 2 Tin Ingot, 1 Copper Ingot | 3 Solder | 3 | 60.0 |
| Resistor | 1 Carbon, 1 Copper Wire | 2 Resistor | 2 | 60.0 |
| Capacitor | 2 Copper Foil, 1 Resin | 2 Capacitor | 3 | 40.0 |
| Diode | 1 Silicon, 1 Copper Wire | 2 Diode | 2 | 60.0 |
| LED | 1 Silicon, 1 Gold Wire, 1 Resin | 2 LED | 3 | 40.0 |
| Connector | 2 Copper Wire, 1 Resin | 1 Connector | 2 | 30.0 |
| Case | 3 Resin | 1 Case | 4 | 15.0 |
| Substrate | 1 Quartz, 1 Resin | 1 Substrate | 3 | 20.0 |
| Bare PCB | 1 Substrate, 1 Copper Foil | 1 Bare PCB | 3 | 20.0 |
| Photoresist | 2 Resin | 3 Photoresist | 4 | 45.0 |
| Dopant | 1 Carbon, 1 Resin | 4 Dopant | 4 | 60.0 |

### Plastics Plant

| Recipe | Inputs | Output | Time s | Rate ipm |
|---|---|---|---|---|
| Resin | 20 Crude, 1 Carbon | 3 Resin | 4 | 45.0 |

### Crystal Furnace

| Recipe | Inputs | Output | Time s | Rate ipm |
|---|---|---|---|---|
| Si Ingot | 6 Silicon | 1 Silicon Ingot | 24 | 2.5 |

### Cutter

| Recipe | Inputs | Output | Time s | Rate ipm |
|---|---|---|---|---|
| Wafer | 1 Silicon Ingot | 4 Wafer | 6 | 40.0 |
| Dice Logic | 1 Etched Logic | 6 Die Logic | 5 | 72.0 |
| Dice Mem | 1 Etched Mem | 4 Die Mem | 5 | 48.0 |
| Dice MCU | 1 Etched MCU | 2 Die MCU | 5 | 24.0 |

### Doping Chamber

| Recipe | Inputs | Output | Time s | Rate ipm |
|---|---|---|---|---|
| Doped | 1 Wafer, 1 Dopant | 1 Doped Wafer | 4 | 15.0 |

### Stepper

| Recipe | Inputs | Output | Time s | Rate ipm |
|---|---|---|---|---|
| Etch Logic | 1 Doped Wafer, 1 Photoresist | 1 Etched Logic | 30 | 2.0 wafers |
| Etch Mem | 1 Doped Wafer, 1 Photoresist | 1 Etched Mem | 30 | 2.0 wafers |
| Etch MCU | 1 Doped Wafer, 1 Photoresist | 1 Etched MCU | 30 | 2.0 wafers |

### Tester

| Recipe | Inputs | Output | Time s | Rate ipm |
|---|---|---|---|---|
| Test Logic | 1 Die Logic | 0.75 Good Die Logic (yield dependent) | 1 | 60 dies |
| Test Mem | 1 Die Mem | 0.75 Good Die Mem (yield dependent) | 1 | 60 dies |
| Test MCU | 1 Die MCU | 0.75 Good Die MCU (yield dependent) | 1 | 60 dies |

### Packager

| Recipe | Inputs | Output | Time s | Rate ipm |
|---|---|---|---|---|
| Pack Logic | 1 Good Die Logic, 1 Gold Wire, 1 Copper Foil | 1 Logic IC | 4 | 15.0 |
| Pack Mem | 1 Good Die Mem, 1 Gold Wire, 1 Copper Foil | 1 Memory Chip | 4 | 15.0 |
| Pack MCU | 1 Good Die MCU, 1 Gold Wire, 1 Copper Foil | 1 Microcontroller | 4 | 15.0 |

### SMT Line

| Recipe | Inputs | Output | Time s | Rate ipm |
|---|---|---|---|---|
| LED Panel | 1 Bare PCB, 4 LED, 2 Resistor, 1 Solder | 1 LED Panel | 6 | 10.0 |
| Power Board | 1 Bare PCB, 2 Diode, 2 Capacitor, 2 Resistor, 2 Solder | 1 Power Board | 8 | 7.5 |
| Sensor Board | 1 Bare PCB, 3 Resistor, 2 Capacitor, 1 LED, 1 Solder | 1 Sensor Board | 7 | 8.6 |
| Main Board | 1 Bare PCB, 2 Microcontroller, 4 Memory Chip, 6 Logic IC, 4 Capacitor, 4 Resistor, 4 Solder | 1 Main Board | 12 | 5.0 |

### Final Assembly

| Recipe | Inputs | Output | Time s | Rate ipm |
|---|---|---|---|---|
| Ohmstead One | 1 Main Board, 1 Power Board, 2 Connector, 1 Case, 1 LED Panel, 1 Sensor Board | 1 Ohmstead One | 15 | 4.0 |

Notes: the Stepper has one recipe per Logic Lab design (Logic, Memory, Microcontroller). Dice cutting returns the die count shown at the design's par gate count (section 7). Tester output shown at YIELD = 75%.

## 6. Product cost (raw per 1 unit)

At Tester yield 75%. Fluids in units, ores in items.

| Product | Copper | Tin | Quartz | Carbon | Gold | Crude u |
|---|---|---|---|---|---|---|
| Copper Ingot | 1.0 | - | - | - | - | - |
| Copper Wire | 0.5 | - | - | - | - | - |
| Copper Foil | 0.5 | - | - | - | - | - |
| Solder | 0.3 | 0.7 | - | - | - | - |
| Resistor | 0.2 | - | - | 0.5 | - | - |
| Capacitor | 0.5 | - | - | 0.2 | - | 3.3 |
| LED | - | - | 1.0 | 0.7 | 0.2 | 3.3 |
| Diode | 0.2 | - | 1.0 | 0.5 | - | - |
| Bare PCB | 0.5 | - | 1.0 | 0.3 | - | 6.7 |
| LED Panel | 1.3 | 0.7 | 5.0 | 4.0 | 1.0 | 20.0 |
| Power Board | 3.2 | 1.3 | 3.0 | 2.7 | - | 13.3 |
| Sensor Board | 2.6 | 0.7 | 2.0 | 2.8 | 0.2 | 16.7 |
| Silicon Ingot | - | - | 12.0 | 6.0 | - | - |
| Wafer | - | - | 3.0 | 1.5 | - | - |
| Logic IC | 0.5 | - | 0.7 | 0.5 | 0.5 | 1.4 |
| Memory Chip | 0.5 | - | 1.0 | 0.7 | 0.5 | 2.0 |
| Microcontroller | 0.5 | - | 2.0 | 1.4 | 0.5 | 4.1 |
| Main Board | 10.8 | 2.7 | 13.0 | 11.2 | 6.0 | 44.4 |
| Connector | 1.0 | - | - | 0.3 | - | 6.7 |
| Case | - | - | - | 1.0 | - | 20.0 |
| Ohmstead One | 19.9 | 5.3 | 23.0 | 22.4 | 7.2 | 127.8 |

## 7. Logic Lab

Required to finish the campaign, gentle (4 specs). Gates: NOT, AND, OR, XOR, NAND, Latch, Clock, Input pin, Output pin. Gates cost nothing; only the gate count and depth matter.

| Spec | Chip | Task | Tests | Par gates | Par depth | Unlocked by |
|---|---|---|---|---|---|---|
| S1 Blinker | (tutorial, no chip) | Output toggles every clock tick | 8 ticks | 3 | 2 | Logic Lab (n26) |
| S2 Half Adder | Logic IC | SUM = A xor B, CARRY = A and B | 4 rows | 2 | 1 | Logic Lab (n26) |
| S3 Register | Memory Chip | 4-bit register: Q follows D only while WE is high | 24 cases | 8 | 3 | Memory Design (n30) |
| S4 Mini Controller | Microcontroller | 2-bit counter with INC input, carry out | 16 cases | 14 | 5 | Controller Design (n31) |

### 7.1 Die math

- Base dies per etched wafer: Logic IC 6, Memory Chip 4, Microcontroller 2.
- Dies per wafer = `round(base x clamp(par_gates / your_gates, 0.5, 1.5))`. A leaner design than par gives up to +50% dies, a bloated one down to -50%.
- Depth modifies yield: `yield_mod = clamp(1 - 0.04 x (your_depth - par_depth), 0.8, 1.05)`.
- Hints: every spec has a built-in hint button that reveals one gate at a time, no penalty.

### 7.2 Dies per wafer table

| Chip | at 0.5x | at par | at 1.5x |
|---|---|---|---|
| Logic IC | 3 | 6 | 9 |
| Memory Chip | 2 | 4 | 6 |
| Microcontroller | 1 | 2 | 3 |

### 7.3 Yield

| Source | Yield |
|---|---|
| Base (Tester unlocked) | 60% |
| Yield I (n29) | +10% |
| Yield II (n32, optional) | +10% |
| Cleanroom (n33, optional) | +5% |
| Fully cooled Stepper | +5% |
| Depth modifier (7.1) | x0.8 to x1.05 |
| Cap | 90% before the depth modifier |

Required-path yield is 60 + 10 (Yield I) + 5 (cooled) = **75%**, and all cost math in this file uses it. Optional nodes push it to 90%, which cuts the campaign-end stepper count by about a sixth (section 10).

## 8. Research (tech tree)

Two currencies (GDD 9): **unlock points** buy the node, **lab research** (parts consumed by Labs) must also finish. Both are required to unlock.

Labs: each Lab runs one *research unit* at a time. A unit consumes the listed parts and takes the unit time. Several Labs share a node's units. Lab speed x1, 60 kW.

| ID | Node | Tier | Pts | Needs | Unlocks | Lab unit (parts) | Units | Unit s | Lab min (4 labs) | Optional |
|---|---|---|---|---|---|---|---|---|---|---|
| n01 | Assembly | 1 | 1 | - | Assembler, Copper Wire recipe | 2 Copper Ingot | 30 | 15 | 1.9 |  |
| n02 | Copper Foil | 1 | 1 | n01 | Foil Press, Copper Foil recipe | 4 Copper Wire | 30 | 15 | 1.9 |  |
| n03 | Tin and Solder | 1 | 1 | n01 | Tin mining, Tin Ingot, Solder | 2 Copper Ingot, 2 Copper Wire | 36 | 15 | 2.2 |  |
| n04 | Logistics I | 1 | 1 | n01 | Splitter, Merger, Sorter | 3 Copper Wire | 30 | 15 | 1.9 |  |
| n05 | Resistors | 1 | 1 | n03 | Resistor recipe | 3 Copper Wire, 1 Carbon | 36 | 18 | 2.7 |  |
| n06 | Silicon Smelting | 1 | 2 | n03 | Silicon recipe (quartz + carbon) | 4 Quartz, 2 Carbon | 30 | 18 | 2.2 |  |
| n07 | Drill Mk2 | 1 | 2 | n02 | Drill Mk2 | 3 Copper Ingot, 2 Copper Foil | 36 | 18 | 2.7 |  |
| n08 | Belt Mk2 | 1 | 2 | n04 | Belt Mk2, Bridge | 2 Copper Ingot, 4 Copper Wire | 45 | 15 | 2.8 |  |
| n09 | Oil Pumping | 1 | 2 | n02 | Oil Pump, Pipes, Tank | 3 Copper Ingot, 3 Copper Foil | 36 | 18 | 2.7 |  |
| n10 | Plastics | 1 | 2 | n09 | Plastics Plant, Resin recipe | 2 Copper Ingot, 2 Carbon | 36 | 18 | 2.7 |  |
| n11 | Capacitors | 1 | 2 | n10 | Capacitor recipe | 3 Copper Foil, 2 Resin | 36 | 18 | 2.7 |  |
| n12 | Gold Mining | 1 | 2 | n06 | Gold mining, Gold Ingot, Gold Wire | 2 Silicon, 3 Copper Wire | 36 | 18 | 2.7 |  |
| n13 | LEDs and Diodes | 1 | 2 | n11, n12 | LED and Diode recipes | 2 Silicon, 1 Resin, 1 Gold Wire | 36 | 22.5 | 3.4 |  |
| n14 | Fuel Power | 2 | 3 | n09, n05 | Refinery, Fuel Generator | 4 Copper Ingot, 2 Resin | 30 | 22.5 | 2.8 |  |
| n15 | Substrate | 2 | 2 | n10, n06 | Fiberglass Substrate recipe | 2 Resin, 3 Quartz | 36 | 18 | 2.7 |  |
| n16 | PCB Lamination | 2 | 2 | n15, n02 | Bare PCB recipe | 2 Substrate, 2 Copper Foil | 36 | 22.5 | 3.4 |  |
| n17 | SMT Line | 2 | 3 | n16, n05, n11 | SMT Line | 1 Bare PCB, 3 Resistor, 1 Capacitor, 1 Solder | 36 | 22.5 | 3.4 |  |
| n18 | LED Panels | 2 | 1 | n17, n13 | LED Panel recipe | 4 LED, 2 Resistor | 30 | 22.5 | 2.8 |  |
| n19 | Power Boards | 2 | 1 | n17, n13 | Power Board recipe | 2 Diode, 2 Capacitor | 30 | 22.5 | 2.8 |  |
| n20 | Sensor Boards | 2 | 1 | n17, n13 | Sensor Board recipe | 3 Resistor, 1 LED, 1 Capacitor | 30 | 22.5 | 2.8 |  |
| n21 | Assembler Mk2 | 2 | 2 | n17 | Assembler Mk2 (x2 speed) | 2 Bare PCB, 2 Solder | 36 | 22.5 | 3.4 | yes |
| n22 | Water and Steam | 3 | 3 | n14, n19 | Water Pump, Steam Plant | 1 Power Board, 4 Copper Foil | 30 | 30 | 3.8 |  |
| n23 | Crystal Growth | 3 | 3 | n17 | Crystal Furnace, Silicon Ingot | 6 Silicon, 4 Resistor | 30 | 30 | 3.8 |  |
| n24 | Wafer Processing | 3 | 2 | n23 | Cutter, Wafer, Dopant, Doping Chamber | 1 Silicon Ingot | 30 | 30 | 3.8 |  |
| n25 | Photolithography | 3 | 4 | n24 | Stepper, Photoresist | 2 Wafer, 2 Resin | 30 | 37.5 | 4.7 |  |
| n26 | Logic Lab | 3 | 3 | n25 | Logic Lab editor, Specs S1 and S2, Logic IC | 2 Doped Wafer, 2 LED | 24 | 37.5 | 3.8 |  |
| n27 | Test and Package | 3 | 3 | n25 | Dice cutting, Tester, Packager | 2 Doped Wafer, 2 Gold Wire | 24 | 37.5 | 3.8 |  |
| n28 | Cooling | 3 | 3 | n22, n25 | Radiators and cooling loops | 4 Capacitor, 4 Copper Foil | 30 | 37.5 | 4.7 |  |
| n29 | Yield I | 3 | 3 | n26, n27 | +10% yield | 2 Good Die Logic | 24 | 37.5 | 3.8 |  |
| n30 | Memory Design | 3 | 2 | n26, n27 | Spec S3, Memory Chip | 2 Logic IC, 4 Resistor | 24 | 37.5 | 3.8 |  |
| n31 | Controller Design | 3 | 3 | n30 | Spec S4, Microcontroller | 2 Logic IC, 1 Memory Chip | 24 | 45 | 4.5 |  |
| n32 | Yield II | 3 | 4 | n29, n28, n30 | +10% yield | 2 Good Die Mem, 2 Capacitor | 24 | 45 | 4.5 | yes |
| n33 | Cleanroom | 3 | 3 | n32, n31 | +5% yield | 1 Microcontroller, 1 Power Board | 18 | 45 | 3.4 | yes |
| n34 | Solar and Battery | 3 | 3 | n22, n23 | Solar Array, Battery | 8 Silicon, 4 Copper Foil | 30 | 30 | 3.8 | yes |
| n35 | Heavy Mining | 3 | 3 | n08, n07, n21, n19 | Drill Mk3, Belt Mk3 | 2 Bare PCB, 1 Power Board | 30 | 30 | 3.8 | yes |
| n36 | Connectors and Cases | 4 | 2 | n31 | Connector and Case recipes | 3 Resin, 4 Copper Wire | 30 | 22.5 | 2.8 |  |
| n37 | Main Board | 4 | 3 | n31, n36 | Main Board recipe | 1 Microcontroller, 1 Memory Chip, 1 Logic IC | 24 | 45 | 4.5 |  |
| n38 | Final Assembly | 4 | 4 | n37, n18, n19, n20 | Final Assembly, Ohmstead One recipe | 1 Main Board, 1 Connector | 18 | 60 | 4.5 |  |

- 38 nodes. Points: **72 required + 15 optional = 87** total. Lab time: **496 lab-minutes** in total, about 83 min of wall clock with 6 labs, running alongside production.
- Starting unlocks (0 points): Drill Mk1, Belt Mk1, Smelter, Lab, Dock, Power Pole, Coal Burner, Storage Crate, Copper Ingot recipe.
- Raw cost of all research: copper ore 2,354, carbon 2,452, quartz 3,442, crude 8,555, gold ore 304, tin ore 224.

## 9. Missions

Delivered to the Dock by belt or by hand drop (the Dock only accepts items an open mission still needs). A mission is **gated**: the Dock will not post it until its research nodes are done. Rewards are unlock points.

| ID | Phase | Mission | Item | Count | Reward pts | Gate nodes | Design rate ipm | Window min |
|---|---|---|---|---|---|---|---|---|
| M01 | Start | First Ingots | Copper Ingot | 40 | 1 | - | 20 | 2.0 |
| M02 | Start | Wire Up | Copper Wire | 120 | 1 | n01 | 40 | 3.0 |
| M03 | Basics | Tin Supply | Tin Ingot | 100 | 3 | n03 | 30 | 3.3 |
| M04 | Basics | Solder | Solder | 150 | 3 | n03 | 30 | 5.0 |
| M05 | Basics | Silicon | Silicon | 150 | 4 | n06 | 20 | 7.5 |
| M06 | Basics | Resin | Resin | 200 | 5 | n10 | 30 | 6.7 |
| M07 | Basics | Resistors | Resistor | 300 | 3 | n05 | 40 | 7.5 |
| M08 | Basics | Capacitors | Capacitor | 200 | 3 | n11 | 30 | 6.7 |
| M09 | Basics | LEDs | LED | 150 | 5 | n13 | 20 | 7.5 |
| M10 | Boards | Bare Boards | Bare PCB | 150 | 5 | n16 | 20 | 7.5 |
| M11 | Boards | Light Show | LED Panel | 80 | 6 | n18 | 10 | 8.0 |
| M12 | Boards | Clean Power | Power Board | 80 | 5 | n19 | 10 | 8.0 |
| M13 | Boards | Sense | Sensor Board | 80 | 5 | n20 | 10 | 8.0 |
| M14 | Silicon Fab | Crystal | Silicon Ingot | 60 | 5 | n23 | 6 | 10.0 |
| M15 | Silicon Fab | Wafers | Wafer | 240 | 5 | n24 | 24 | 10.0 |
| M16 | Silicon Fab | Logic | Logic IC | 200 | 9 | n26, n27 | 15 | 13.3 |
| M17 | Silicon Fab | Memory | Memory Chip | 150 | 5 | n30 | 10 | 15.0 |
| M18 | Silicon Fab | Brains | Microcontroller | 100 | 5 | n31 | 6 | 16.7 |
| M19 | Computing | Main Boards | Main Board | 60 | 6 | n37 | 4 | 15.0 |
| M20 | Computing | First Units | Ohmstead One | 40 | 5 | n38 | 4 | 10.0 |
| M21 | Computing | Launch Batch | Ohmstead One | 120 | 0 | n38 | 8 | 15.0 |

`Window` is the minutes the mission takes **once the line exists**, at the design rate. Design rates are what the factory should reach by that point, not a requirement.

- Mission points total: **89** against 87 tree points, so a finished campaign unlocks nearly everything and the 15 optional points are a real choice mid game.
- M21 Launch Batch is the campaign end. It pays 0 points (the tree is complete). After it: sandbox, plus endless missions that scale their count and pay **Stars** (cosmetic only: machine skins, belt colors).

### 9.1 Points feasibility check

Points earned before each mission vs the cost of the gate nodes and their prerequisites up to that mission, plus the support nodes the player realistically needs (Logistics I and Drill Mk2 by M07, Belt Mk2 and Fuel Power by M12, Water and Steam, Cooling and Yield I by M16). Margin must never be negative.

| Before | Earned | Needed | Margin |
|---|---|---|---|
| M01 | 0 | 0 | 0 |
| M02 | 1 | 1 | 0 |
| M03 | 2 | 2 | 0 |
| M04 | 5 | 2 | 3 |
| M05 | 8 | 4 | 4 |
| M06 | 12 | 9 | 3 |
| M07 | 17 | 13 | 4 |
| M08 | 20 | 15 | 5 |
| M09 | 23 | 19 | 4 |
| M10 | 28 | 23 | 5 |
| M11 | 33 | 27 | 6 |
| M12 | 39 | 33 | 6 |
| M13 | 44 | 34 | 10 |
| M14 | 49 | 37 | 12 |
| M15 | 54 | 39 | 15 |
| M16 | 59 | 58 | 1 |
| M17 | 68 | 60 | 8 |
| M18 | 73 | 63 | 10 |
| M19 | 78 | 68 | 10 |
| M20 | 84 | 72 | 12 |
| M21 | 89 | 72 | 17 |

Minimum margin: **0**. M16 (the first chip) is the deliberate wall: the player has to pour points into the whole fab chain at once.

## 10. Campaign-end base sizing

Target: **8 Ohmstead One per minute** (the M21 design rate). Production machines needed, rounded up:

| Machine | Needed (exact) | Built | Power kW |
|---|---|---|---|
| Smelter | 20.60 | 21 | 1,890 |
| Stepper | 16.00 | 16 | 6,400 |
| Assembler | 12.58 | 13 | 975 |
| Packager | 6.40 | 7 | 840 |
| SMT Line | 4.40 | 5 | 750 |
| Plastics Plant | 3.41 | 4 | 480 |
| Foil Press | 3.20 | 4 | 240 |
| Cutter | 3.47 | 4 | 400 |
| Crystal Furnace | 3.20 | 4 | 720 |
| Tester | 2.13 | 3 | 270 |
| Doping Chamber | 2.13 | 3 | 450 |
| Final Assembly | 2.00 | 2 | 500 |
| **Total production** | | **86** | **13,915** |

With full optional yield (90%) the Steppers drop from 16 to 14.

Supporting buildings at that point:

| Group | Count | Basis |
|---|---|---|
| Drills Mk2 | 12 | quartz 184/min -> 4, copper ore 160/min -> 3, tin ore 43/min -> 1, gold ore 58/min -> 1, carbon 180/min -> 3 (at 100% richness) |
| Oil pumps | 6 | 1,022 crude/min for resin plus about 525 for fuel, 300 u/min each, fewer on rich patches |
| Water pumps | 4 | cooling 2,226 u/min plus steam 2,100 u/min |
| Labs | 8 | 480 kW |
| Steam Plants | 7 | 14 MW, 210 fuel u/min (about 1.75 Refineries), 2,100 water u/min |
| Total electrical demand | about 16.2 MW | production 13.9 + drills and labs 1.7 + pumps 0.6 |
| Total heat to cool | 7.4 MW | water 2,226 u/min |

About **125 powered buildings** at the end, plus belts and pipes. Belt Mk2 is enough everywhere except the copper and carbon trunks, where Mk3 (optional) or two Mk2 lines are needed.

Raw per minute at the end: quartz 184, crude 1,022, carbon 179, copper ore 159, gold ore 58, tin ore 43.

## 11. Hand crafting, inventory and build costs

Agreed: Factorio style. There is no shared Stock. The player carries a personal inventory and hand-crafts buildings from it (GDD 6.5).

### 11.1 Rules

| Rule | Value |
|---|---|
| Inventory | 48 slots, stack of 100 items, stack of 50 buildings |
| Taking items | click Take on a Storage Crate, a machine output buffer or the end of a belt; up to a full stack at once |
| Hand mining | 30 ore/min from any ore tile, only while the mine action is held (equals one Drill Mk1). Prevents soft locks |
| Hand crafting | any building, plus any item made by an Assembler or Foil Press, at **speed x0.5 for items** (recipe time x2) and the listed time for buildings |
| Not hand-craftable | items produced by the Smelter, Plastics Plant, Crystal Furnace, Cutter, Doping Chamber, Stepper, Tester, Packager, SMT Line or Final Assembly. Ingots, resin, silicon, boards and chips must come from the factory |
| Craft queue | queue several crafts; missing hand-craftable ingredients are queued automatically |
| Dock | not a source of materials. It accepts only items an open mission still needs, by belt or by hand drop. Surplus stays on the belt (it backs up) |
| Placing | placing a building takes it from the inventory; picking a building up returns it |
| Reach | Open (PLAN): walking avatar with reach, or a free camera with unlimited reach |

### 11.2 Building costs and craft times

Per building, or per 2 tiles for belts and pipes and per pole. **Proposed**, to tune when the prototype exists. The last column lists what must be carried in from the factory (the rest is hand-crafted from it).

| Building | Cost | Craft s | Carry in from the factory |
|---|---|---|---|
| Drill Mk1 | 10 Copper Ingot | 2 | Copper Ingot |
| Smelter | 12 Copper Ingot | 3 | Copper Ingot |
| Lab | 25 Copper Ingot | 5 | Copper Ingot |
| Coal Burner | 10 Copper Ingot | 3 | Copper Ingot |
| Power Pole | 1 Copper Ingot | 0.5 | Copper Ingot |
| Belt Mk1 | 1 Copper Ingot | 0.5 | Copper Ingot |
| Assembler | 20 Copper Ingot | 4 | Copper Ingot |
| Foil Press | 12 Copper Ingot, 6 Copper Wire | 3 | Copper Ingot |
| Splitter / Merger / Sorter | 4 Copper Ingot, 6 Copper Wire | 2 | Copper Ingot |
| Drill Mk2 | 12 Copper Ingot, 10 Copper Foil, 6 Copper Wire | 4 | Copper Ingot |
| Belt Mk2 | 1 Copper Ingot, 2 Copper Wire | 0.5 | Copper Ingot |
| Bridge | 4 Copper Ingot, 4 Copper Wire | 2 | Copper Ingot |
| Oil Pump | 15 Copper Ingot, 10 Copper Foil | 5 | Copper Ingot |
| Pipe | 1 Copper Ingot | 0.5 | Copper Ingot |
| Plastics Plant | 20 Copper Ingot, 10 Copper Foil, 10 Copper Wire | 6 | Copper Ingot |
| Fuel Generator | 25 Copper Ingot, 10 Copper Foil, 8 Resistor | 6 | Carbon, Copper Ingot |
| Refinery | 30 Copper Ingot, 20 Copper Foil, 10 Resistor, 10 Solder | 10 | Carbon, Copper Ingot, Tin Ingot |
| SMT Line | 6 Bare PCB, 12 Resistor, 8 Capacitor, 10 Solder | 10 | Carbon, Copper Ingot, Quartz, Resin, Tin Ingot |
| Assembler Mk2 | 4 Bare PCB, 10 Resistor, 6 Capacitor, 8 Solder | 8 | Carbon, Copper Ingot, Quartz, Resin, Tin Ingot |
| Water Pump | 15 Copper Ingot, 10 Copper Foil, 6 Resistor | 4 | Carbon, Copper Ingot |
| Steam Plant | 2 Power Board, 30 Copper Foil, 10 Solder | 10 | Copper Ingot, Power Board, Tin Ingot |
| Crystal Furnace | 2 Power Board, 40 Copper Ingot, 10 Resistor | 12 | Carbon, Copper Ingot, Power Board |
| Cutter | 4 Bare PCB, 30 Copper Ingot, 8 Solder | 8 | Copper Ingot, Quartz, Resin, Tin Ingot |
| Doping Chamber | 4 Bare PCB, 1 Power Board, 6 Capacitor | 10 | Copper Ingot, Power Board, Quartz, Resin |
| Stepper | 4 Power Board, 4 Sensor Board, 2 LED Panel, 40 Copper Ingot, 20 Solder | 20 | Copper Ingot, LED Panel, Power Board, Sensor Board, Tin Ingot |
| Tester | 2 Sensor Board, 2 Bare PCB, 6 Solder | 6 | Copper Ingot, Quartz, Resin, Sensor Board, Tin Ingot |
| Packager | 4 Bare PCB, 1 Power Board, 6 LED | 8 | Copper Ingot, Gold Ingot, Power Board, Quartz, Resin, Silicon |
| Cooling Jacket | 4 Capacitor, 20 Copper Foil | 5 | Copper Ingot, Resin |
| Solar Array | 20 Silicon, 10 Copper Foil, 2 Bare PCB | 5 | Copper Ingot, Quartz, Resin, Silicon |
| Battery | 20 Capacitor, 20 Copper Foil | 5 | Copper Ingot, Resin |
| Drill Mk3 | 4 Bare PCB, 10 Resistor, 20 Copper Ingot, 1 Power Board | 8 | Carbon, Copper Ingot, Power Board, Quartz, Resin |
| Belt Mk3 | 1 Copper Ingot, 1 Bare PCB | 0.5 | Copper Ingot, Quartz, Resin |
| Final Assembly | 4 Power Board, 2 Sensor Board, 2 LED Panel, 1 Main Board, 60 Copper Ingot | 20 | Copper Ingot, LED Panel, Main Board, Power Board, Sensor Board |

Starting inventory (the kit): 3 Drill Mk1, 1 Smelter, 1 Coal Burner, 20 Belt Mk1 (10 crafts), 6 Power Pole, 30 Copper Ingot. The Dock is already placed, with a copper patch and a coal patch in view. The first two missions are the tutorial.

### 11.3 Construction load at campaign end

Estimated build of the section 10 base: all production and supporting buildings, 21 Cooling Jackets, 60 Splitters/Mergers/Sorters, 60 poles, about 400 Belt Mk1 crafts, 300 Belt Mk2 crafts and 200 pipe crafts (roughly 12 tiles of belt per building).

| Measure | Value |
|---|---|
| Buildings crafted | 1168 crafts |
| Pure craft time | 28 min (0.5 h) spread over the whole campaign |
| Raw used | quartz 800, crude 4,682, carbon 809, copper ore 5,384, tin ore 557, gold ore 77 |
| Share of all raw used by the campaign | 14.7% |

Construction is a modest raw cost (15% of everything the campaign consumes) and about 0.5 h of pure craft time, but mostly an **attention and flow cost**: the player must run belts of ingots, boards and resin into crates just to keep building, which is the Factorio feeling. If the prototype shows too little pressure, raise building costs before touching mission counts.

## 12. Pacing

| Phase | Missions | Production window min | Target play time | Notes |
|---|---|---|---|---|
| Start | M01 to M02 | 5 | 10 to 15 | Tutorial, first belt, first lab |
| Basics | M03 to M09 | 44 | 50 to 70 | Copper, tin, silicon, oil and plastics, small parts |
| Boards | M10 to M13 | 32 | 45 to 65 | PCB chain, SMT line, three boards |
| Silicon Fab | M14 to M18 | 65 | 80 to 120 | Fab chain, Logic Lab specs, cooling, yield |
| Computing | M19 to M21 | 40 | 55 to 85 | Main board, final assembly, launch batch |
| **Total** | 21 | **186** | **240 to 355 min (4.0 to 5.9 h)** | |

The target range is production windows multiplied by 1.3 to 1.9 for building (including about half an hour of hand crafting, section 11.3), fixing bottlenecks and waiting on research. It lands inside the agreed 4 to 6 hour campaign.

Raw consumed by all 21 missions: copper ore 5,028, tin ore 1,427, quartz 7,783, carbon 6,617, crude 31,596, gold ore 1,882.
Research is about 32% of the copper and 21% of the crude the campaign uses, so labs are a real load, not an afterthought.

## 13. Knobs to tune first in the prototype

1. Belt Mk1 speed and Mk2 timing (decides when logistics start to hurt).
2. Smelter and Assembler base time, since they set the T1 pace.
3. Stepper time (30 s) and die counts, the fab bottleneck.
4. Crude per resin (20 u) and the Refinery split, the oil contest.
5. Lab unit counts, so research takes 2 to 5 minutes per node with 4 labs.
6. Mission counts, so each window is 5 to 17 minutes.
7. Starting kit and build costs of the first 10 minutes.

## 14. Open numbers

- Reach and avatar: a walking player with build reach, or a free camera (Open, see 11.1).
- A late sandbox Logistics Drone that fetches items for you (post-campaign convenience, not in the 38 nodes).
- Finite patches (Open). Infinite is assumed.
- Map size and ring radii (see PLAN open decisions).
- Endless mission formula and Star rewards.
- Whether the Tester wastes bad dies or sends them to a recycler (assumed: wasted).
