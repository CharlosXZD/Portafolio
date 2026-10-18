import math, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from balance_model import *

def nm(i):
    special = {"led": "LED", "pcb": "PCB", "ic": "IC", "smt": "SMT", "mcu": "MCU", "cu": "Cu", "au": "Au", "sn": "Sn", "si": "Si"}
    return " ".join(special.get(w, w.capitalize()) for w in i.split("_"))

def items(d):
    return ", ".join(f"{v:g} {nm(k)}" for k, v in d.items())

nd = {n[0]: n for n in N}
REW = [1, 1, 3, 3, 4, 5, 3, 3, 5, 5, 6, 5, 5, 5, 5, 9, 5, 5, 6, 5, 0]
EXTRA = {"M12": ["n19"], "M09": ["n13"], "M14": ["n23"], "M15": ["n24"], "M16": ["n26", "n27"], "M17": ["n30"],
         "M18": ["n31"], "M19": ["n37"], "M20": ["n38"], "M21": ["n38"]}
MS = [(a, b, c, d, REW[i], e, f, g) for i, (a, b, c, d, e_old, e, f, g) in enumerate(MS)]
GATES = {m[0]: sorted(set([m[5]] + EXTRA.get(m[0], [])) - {"start"}) for m in MS}

BC = {
 "drill_mk1": {"copper_ingot": 10}, "smelter": {"copper_ingot": 12}, "lab": {"copper_ingot": 25},
 "coal_burner": {"copper_ingot": 10}, "power_pole": {"copper_ingot": 1}, "belt_mk1": {"copper_ingot": 1},
 "assembler": {"copper_ingot": 20}, "foil_press": {"copper_ingot": 12, "copper_wire": 6},
 "splitter / merger / sorter": {"copper_ingot": 4, "copper_wire": 6},
 "drill_mk2": {"copper_ingot": 12, "copper_foil": 10, "copper_wire": 6},
 "belt_mk2": {"copper_ingot": 1, "copper_wire": 2}, "bridge": {"copper_ingot": 4, "copper_wire": 4},
 "oil_pump": {"copper_ingot": 15, "copper_foil": 10}, "pipe": {"copper_ingot": 1},
 "plastics_plant": {"copper_ingot": 20, "copper_foil": 10, "copper_wire": 10},
 "fuel_generator": {"copper_ingot": 25, "copper_foil": 10, "resistor": 8},
 "refinery": {"copper_ingot": 30, "copper_foil": 20, "resistor": 10, "solder": 10},
 "smt_line": {"bare_pcb": 6, "resistor": 12, "capacitor": 8, "solder": 10},
 "assembler_mk2": {"bare_pcb": 4, "resistor": 10, "capacitor": 6, "solder": 8},
 "water_pump": {"copper_ingot": 15, "copper_foil": 10, "resistor": 6},
 "steam_plant": {"power_board": 2, "copper_foil": 30, "solder": 10},
 "crystal_furnace": {"power_board": 2, "copper_ingot": 40, "resistor": 10},
 "cutter": {"bare_pcb": 4, "copper_ingot": 30, "solder": 8},
 "doping_chamber": {"bare_pcb": 4, "power_board": 1, "capacitor": 6},
 "stepper": {"power_board": 4, "sensor_board": 4, "led_panel": 2, "copper_ingot": 40, "solder": 20},
 "tester": {"sensor_board": 2, "bare_pcb": 2, "solder": 6},
 "packager": {"bare_pcb": 4, "power_board": 1, "led": 6},
 "cooling_jacket": {"capacitor": 4, "copper_foil": 20},
 "solar_array": {"silicon": 20, "copper_foil": 10, "bare_pcb": 2}, "battery": {"capacitor": 20, "copper_foil": 20},
 "drill_mk3": {"bare_pcb": 4, "resistor": 10, "copper_ingot": 20, "power_board": 1},
 "belt_mk3": {"copper_ingot": 1, "bare_pcb": 1},
 "final_assembly": {"power_board": 4, "sensor_board": 2, "led_panel": 2, "main_board": 1, "copper_ingot": 60},
}

# ---------- sizing at campaign end
RATE = 8.0
acc, mach = flow("ohmstead_one", RATE)
bym = {}
for (m, rid), v in mach.items():
    bym[m] = bym.get(m, 0) + v
cnt = {m: math.ceil(v - 1e-9) for m, v in bym.items()}
prod_kw = sum(cnt[m] * M[m][2] for m in cnt)
heat_kw = sum(cnt[m] * M[m][4] for m in cnt)
water_cool = heat_kw * 0.3
drills = {"quartz": 0, "copper_ore": 0, "tin_ore": 0, "gold_ore": 0, "carbon": 0}
for k in drills:
    drills[k] = math.ceil(acc[k] / 60 - 1e-9)
labs = 8
extra_kw = sum(drills.values()) * 100 + labs * 60
tot_pump_kw = 6 * 80 + 4 * 40

out = []
w = out.append

w("# Ohmstead: Content (draft numbers)\n")
w("Status: **DRAFT numbers, nothing is implemented.** Every value here is a first pass for paper balancing. Once the game exists this file becomes the regenerated record of what is in the game now (same role as `elementa/CONTENT.md`), and the numbers move into `data/*.js`.")
w("Design rules live in `GDD.md`, the roadmap in `PLAN.md`. Ideas that are not decided do not go in this file.")
w("The model that produced and checked these tables is `tools/balance_model.py` (plus `tools/gen_content.py`). Change a number there, rerun, and the derived tables below (raw costs, machine counts, points feasibility, pacing) update. Do not hand-edit derived tables.\n")

w("## 0. Conventions\n")
w("- Time is in seconds per craft at speed x1. Rates are items per minute (**ipm**). Fluids are units per minute (**u/min**). Power is kW.")
w("- Every recipe has exactly one producing machine, except Resin (see 4.2). No recipe has two outputs, except the Refinery (fuel + resin) and the Cutter's wafer and die cuts.")
w("- Material colors (GDD 11): copper orange, tin pale grey, gold yellow, quartz white, silicon blue-grey, resin amber, PCB green, carbon near-black, oil black-brown, water blue.")
w("- **No shared Stock.** The player has a personal inventory and hand-crafts buildings (section 11). The Dock accepts only what an open mission needs.")

w("## 1. Raw resources\n")
w("| Resource | Kind | Mined by | Where (see GDD 5) | Used for |")
w("|---|---|---|---|---|")
for r in [("Quartz sand","ore","Drill","near start","Silicon, substrate"),
          ("Copper ore","ore","Drill","near start","Ingots, wire, foil"),
          ("Tin ore","ore","Drill","near start","Solder"),
          ("Carbon (coal)","ore","Drill","near start","Silicon smelting, resistors, dopant, plastics, burners"),
          ("Gold ore","ore","Drill","ring 2","Gold wire for LEDs and chip bonding"),
          ("Crude oil","fluid","Oil Pump","ring 2","Resin, fuel"),
          ("Water","fluid","Water Pump","ring 3","Steam power, cooling")]:
    w(f"| {r[0]} | {r[1]} | {r[2]} | {r[3]} | {r[4]} |")
w("\nPatch richness is 50% to 300% of base output. Patches do not deplete in v1 (Open: finite patches would add a late-game pressure, see PLAN).\n")

w("## 2. Logistics\n")
w("| Piece | Value |")
w("|---|---|")
w("| Belt Mk1 | 120 ipm total (2 lanes of 60), 0.5 tiles/s |")
w("| Belt Mk2 | 240 ipm, 1 tile/s |")
w("| Belt Mk3 | 480 ipm, 2 tiles/s (optional tech n35) |")
w("| Pipe | 1200 u/min per segment, 1 tile |")
w("| Power pole | supply area 7x7 tiles, wire reach 8 tiles |")
w("| Splitter / Merger / Sorter | pass belt rate, sorter filters one item per output |")
w("| Storage crate | 40 slots, 100 items per slot |\n")

w("## 3. Machines\n")
w("| Machine | Footprint | Power kW | Speed / output | Heat kW | Unlocked by | Notes |")
w("|---|---|---|---|---|---|---|")
for k, (name, fp, kw, sp, heat, un, note) in M.items():
    w(f"| {name} | {fp} | {kw} | {sp} | {heat or '-'} | {un if un=='start' else nd[un][1]+' ('+un+')'} | {note} |")
w("")
w("Machine rules: input buffer holds 2 crafts of inputs, output buffer holds 2 crafts of outputs. A machine always reports one status: Working, No power, Missing <item>, Output full, or Overheated. Machines with a Heat value need a Cooling Jacket (3.1) to reach 100% speed.\n")

w("### 3.1 Heat and cooling\n")
w("- Heat machines: Crystal Furnace 180, Doping Chamber 100, Stepper 400 kW of heat.")
w("- Without a Cooling Jacket a heat machine runs at **60% speed**. A Cooling Jacket consumes water at `0.3 u/min per kW of heat`: Stepper 120 u/min, Furnace 54, Doping Chamber 30.")
w("- Speed = `0.6 + 0.4 x water satisfaction`. A cooled Stepper also gives +5% yield (see 7.3).")
w("- Unlocked by research Cooling (n28). The Cooling Jacket costs 4 Capacitor + 20 Copper Foil.\n")

w("## 4. Power\n")
w("| Generator | Output kW | Consumes | Unlocked by |")
w("|---|---|---|---|")
for n_, kw, fuel, un in G:
    w(f"| {n_} | {kw or '-'} | {fuel} | {un if un=='start' else nd[un][1]+' ('+un+')'} |")
w("")
w("- Fuel comes from the Refinery: **30 crude -> 12 fuel + 2 resin per 6 s**, so one Refinery at full speed turns 300 crude/min into 120 fuel/min and 20 resin/min.")
w("- Efficiency ladder per fuel unit: Fuel Generator 20 kW/u, Steam Plant 66.7 kW/u. Steam needs water, so it is better but costs plumbing.")
w("- Demand above supply slows every machine proportionally (`satisfaction = supply / demand`), never hard fails.")
w("- Oil is contested: crude goes to resin (plastics) and to fuel (power). The Refinery's resin byproduct partly covers plastics, which is the intended tie between the two.")
w("- Worked example in section 10: the campaign-end base needs about %.1f MW." % ((prod_kw + extra_kw + tot_pump_kw) / 1000))
w("")
w("### 4.2 Resin\n")
w("Two sources on purpose: Plastics Plant (`20 crude + 1 carbon -> 3 resin`, 4 s, resin focused) and the Refinery byproduct (see above). Item recipes below list the Plastics Plant.\n")

w("## 5. Recipes\n")
w("Rate column is the main output per minute for one machine at speed x1.\n")
bymach = {}
for rid, (m, t, i, o) in R.items():
    bymach.setdefault(m, []).append((rid, t, i, o))
order = ["smelter", "foil_press", "assembler", "plastics_plant", "crystal_furnace", "cutter", "doping_chamber", "stepper", "tester", "packager", "smt_line", "final_assembly"]
for m in order:
    w(f"### {M[m][0]}\n")
    w("| Recipe | Inputs | Output | Time s | Rate ipm |")
    w("|---|---|---|---|---|")
    for rid, t, i, o in bymach[m]:
        mainout = list(o.items())[0]
        if m == "stepper":
            rate = f"{60/t:.1f} wafers"
            nameo = f"1 {nm(mainout[0])}"
        elif m == "tester":
            rate = f"{60/t:.0f} dies"
            nameo = f"{mainout[1]:g} {nm(mainout[0])} (yield dependent)"
        else:
            rate = f"{mainout[1]*60/t:.1f}"
            nameo = f"{mainout[1]:g} {nm(mainout[0])}"
        w(f"| {nm(rid)} | {items(i)} | {nameo} | {t} | {rate} |")
    w("")
w("Notes: the Stepper has one recipe per Logic Lab design (Logic, Memory, Microcontroller). Dice cutting returns the die count shown at the design's par gate count (section 7). Tester output shown at YIELD = %.0f%%.\n" % (YIELD * 100))

w("## 6. Product cost (raw per 1 unit)\n")
w(f"At Tester yield {YIELD:.0%}. Fluids in units, ores in items.\n")
cols = ["copper_ore", "tin_ore", "quartz", "carbon", "gold_ore", "crude"]
w("| Product | Copper | Tin | Quartz | Carbon | Gold | Crude u |")
w("|---|---|---|---|---|---|---|")
for it in ["copper_ingot", "copper_wire", "copper_foil", "solder", "resistor", "capacitor", "led", "diode", "bare_pcb",
          "led_panel", "power_board", "sensor_board", "silicon_ingot", "wafer", "logic_ic", "memory_chip", "microcontroller",
          "main_board", "connector", "case", "ohmstead_one"]:
    r = raw_per(it)
    w(f"| {nm(it)} | " + " | ".join(f"{r.get(c,0):.1f}" if r.get(c, 0) else "-" for c in cols) + " |")
w("")

w("## 7. Logic Lab\n")
w("Required to finish the campaign, gentle (4 specs). Gates: NOT, AND, OR, XOR, NAND, Latch, Clock, Input pin, Output pin. Gates cost nothing; only the gate count and depth matter.\n")
w("| Spec | Chip | Task | Tests | Par gates | Par depth | Unlocked by |")
w("|---|---|---|---|---|---|---|")
w("| S1 Blinker | (tutorial, no chip) | Output toggles every clock tick | 8 ticks | 3 | 2 | Logic Lab (n26) |")
w("| S2 Half Adder | Logic IC | SUM = A xor B, CARRY = A and B | 4 rows | 2 | 1 | Logic Lab (n26) |")
w("| S3 Register | Memory Chip | 4-bit register: Q follows D only while WE is high | 24 cases | 8 | 3 | Memory Design (n30) |")
w("| S4 Mini Controller | Microcontroller | 2-bit counter with INC input, carry out | 16 cases | 14 | 5 | Controller Design (n31) |")
w("")
w("### 7.1 Die math\n")
w("- Base dies per etched wafer: Logic IC 6, Memory Chip 4, Microcontroller 2.")
w("- Dies per wafer = `round(base x clamp(par_gates / your_gates, 0.5, 1.5))`. A leaner design than par gives up to +50% dies, a bloated one down to -50%.")
w("- Depth modifies yield: `yield_mod = clamp(1 - 0.04 x (your_depth - par_depth), 0.8, 1.05)`.")
w("- Hints: every spec has a built-in hint button that reveals one gate at a time, no penalty.\n")
w("### 7.2 Dies per wafer table\n")
w("| Chip | at 0.5x | at par | at 1.5x |")
w("|---|---|---|---|")
for c, b in [("Logic IC", 6), ("Memory Chip", 4), ("Microcontroller", 2)]:
    w(f"| {c} | {round(b*0.5)} | {b} | {round(b*1.5)} |")
w("")
w("### 7.3 Yield\n")
w("| Source | Yield |")
w("|---|---|")
w("| Base (Tester unlocked) | 60% |")
w("| Yield I (n29) | +10% |")
w("| Yield II (n32, optional) | +10% |")
w("| Cleanroom (n33, optional) | +5% |")
w("| Fully cooled Stepper | +5% |")
w("| Depth modifier (7.1) | x0.8 to x1.05 |")
w("| Cap | 90% before the depth modifier |")
w("")
w("Required-path yield is 60 + 10 (Yield I) + 5 (cooled) = **75%**, and all cost math in this file uses it. Optional nodes push it to 90%, which cuts the campaign-end stepper count by about a sixth (section 10).\n")

w("## 8. Research (tech tree)\n")
w("Two currencies (GDD 9): **unlock points** buy the node, **lab research** (parts consumed by Labs) must also finish. Both are required to unlock.\n")
w("Labs: each Lab runs one *research unit* at a time. A unit consumes the listed parts and takes the unit time. Several Labs share a node's units. Lab speed x1, 60 kW.\n")
w("| ID | Node | Tier | Pts | Needs | Unlocks | Lab unit (parts) | Units | Unit s | Lab min (4 labs) | Optional |")
w("|---|---|---|---|---|---|---|---|---|---|---|")
for n in N:
    w(f"| {n[0]} | {n[1]} | {n[2]} | {n[3]} | {', '.join(n[4]) or '-'} | {n[5]} | {items(n[6])} | {n[7]} | {n[8]:g} | {n[7]*n[8]/60/4:.1f} | {'yes' if n[9] else ''} |")
w("")
tl = sum(n[7] * n[8] for n in N)
req = sum(n[3] for n in N if not n[9]); opt = sum(n[3] for n in N if n[9])
w(f"- 38 nodes. Points: **{req} required + {opt} optional = {req+opt}** total. Lab time: **{tl/60:.0f} lab-minutes** in total, about {tl/60/6:.0f} min of wall clock with 6 labs, running alongside production.")
w("- Starting unlocks (0 points): Drill Mk1, Belt Mk1, Smelter, Lab, Dock, Power Pole, Coal Burner, Storage Crate, Copper Ingot recipe.")
rt = {}
for n in N:
    for it, c in n[6].items():
        for k, v in raw_per(it, c * n[7]).items():
            rt[k] = rt.get(k, 0) + v
w("- Raw cost of all research: " + ", ".join(f"{k.replace('_',' ')} {v:,.0f}" for k, v in rt.items()) + ".\n")

w("## 9. Missions\n")
w("Delivered to the Dock by belt or by hand drop (the Dock only accepts items an open mission still needs). A mission is **gated**: the Dock will not post it until its research nodes are done. Rewards are unlock points.\n")
w("| ID | Phase | Mission | Item | Count | Reward pts | Gate nodes | Design rate ipm | Window min |")
w("|---|---|---|---|---|---|---|---|---|")
for m in MS:
    w(f"| {m[0]} | {PHASE[m[6]]} | {m[1]} | {nm(m[2])} | {m[3]} | {m[4]} | {', '.join(GATES[m[0]]) or '-'} | {m[7]} | {m[3]/m[7]:.1f} |")
w("")
w("`Window` is the minutes the mission takes **once the line exists**, at the design rate. Design rates are what the factory should reach by that point, not a requirement.\n")
w(f"- Mission points total: **{sum(m[4] for m in MS)}** against {req+opt} tree points, so a finished campaign unlocks nearly everything and the 15 optional points are a real choice mid game.")
w("- M21 Launch Batch is the campaign end. It pays 0 points (the tree is complete). After it: sandbox, plus endless missions that scale their count and pay **Stars** (cosmetic only: machine skins, belt colors).\n")

w("### 9.1 Points feasibility check\n")
w("Points earned before each mission vs the cost of the gate nodes and their prerequisites up to that mission, plus the support nodes the player realistically needs (Logistics I and Drill Mk2 by M07, Belt Mk2 and Fuel Power by M12, Water and Steam, Cooling and Yield I by M16). Margin must never be negative.\n")
def closure(ids, seen=None):
    seen = seen if seen is not None else set()
    for i in ids:
        if i == "start" or i in seen:
            continue
        seen.add(i)
        closure(nd[i][4], seen)
    return seen
BY = {"M07": ["n04", "n07"], "M12": ["n08", "n14"], "M16": ["n22", "n28", "n29"]}
need = set(); earned = 0
w("| Before | Earned | Needed | Margin |")
w("|---|---|---|---|")
minmargin = 99
for m in MS:
    need |= closure(GATES[m[0]] + BY.get(m[0], []))
    c = sum(nd[x][3] for x in need)
    minmargin = min(minmargin, earned - c)
    w(f"| {m[0]} | {earned} | {c} | {earned-c} |")
    earned += m[4]
w(f"\nMinimum margin: **{minmargin}**. M16 (the first chip) is the deliberate wall: the player has to pour points into the whole fab chain at once.\n")

w("## 10. Campaign-end base sizing\n")
w(f"Target: **{RATE:g} Ohmstead One per minute** (the M21 design rate). Production machines needed, rounded up:\n")
w("| Machine | Needed (exact) | Built | Power kW |")
w("|---|---|---|---|")
for m in sorted(cnt, key=lambda x: -cnt[x]):
    w(f"| {M[m][0]} | {bym[m]:.2f} | {cnt[m]} | {cnt[m]*M[m][2]:,} |")
w(f"| **Total production** | | **{sum(cnt.values())}** | **{prod_kw:,}** |")
w(f"\nWith full optional yield (90%) the Steppers drop from {cnt['stepper']} to {math.ceil(bym['stepper']*0.75/0.9-1e-9)}.")
w("")
w("Supporting buildings at that point:\n")
w("| Group | Count | Basis |")
w("|---|---|---|")
w("| Drills Mk2 | " + str(sum(drills.values())) + " | " + ", ".join(f"{k.replace('_',' ')} {math.ceil(acc[k]):d}/min -> {drills[k]}" for k in drills) + " (at 100% richness) |")
crude_res = acc["crude"]
w(f"| Oil pumps | 6 | {crude_res:,.0f} crude/min for resin plus about 525 for fuel, 300 u/min each, fewer on rich patches |")
w(f"| Water pumps | 4 | cooling {water_cool:,.0f} u/min plus steam 2,100 u/min |")
w(f"| Labs | {labs} | 480 kW |")
w(f"| Steam Plants | 7 | 14 MW, 210 fuel u/min (about 1.75 Refineries), 2,100 water u/min |")
w(f"| Total electrical demand | about {(prod_kw+extra_kw+tot_pump_kw)/1000:.1f} MW | production {prod_kw/1000:.1f} + drills and labs {extra_kw/1000:.1f} + pumps {tot_pump_kw/1000:.1f} |")
w(f"| Total heat to cool | {heat_kw/1000:.1f} MW | water {water_cool:,.0f} u/min |")
w("")
w(f"About **{sum(cnt.values())+sum(drills.values())+6+4+labs+7+2} powered buildings** at the end, plus belts and pipes. Belt Mk2 is enough everywhere except the copper and carbon trunks, where Mk3 (optional) or two Mk2 lines are needed.\n")
w("Raw per minute at the end: " + ", ".join(f"{k.replace('_',' ')} {v:,.0f}" for k, v in acc.items()) + ".\n")


CT = {"drill_mk1": 2, "smelter": 3, "lab": 5, "coal_burner": 3, "power_pole": 0.5, "belt_mk1": 0.5, "assembler": 4,
      "foil_press": 3, "splitter / merger / sorter": 2, "drill_mk2": 4, "belt_mk2": 0.5, "bridge": 2, "oil_pump": 5,
      "pipe": 0.5, "plastics_plant": 6, "fuel_generator": 6, "refinery": 10, "smt_line": 10, "assembler_mk2": 8,
      "water_pump": 4, "steam_plant": 10, "crystal_furnace": 12, "cutter": 8, "doping_chamber": 10, "stepper": 20,
      "tester": 6, "packager": 8, "cooling_jacket": 5, "solar_array": 5, "battery": 5, "drill_mk3": 8, "belt_mk3": 0.5,
      "final_assembly": 20}
HAND = {"assembler", "foil_press"}

def carry_in(item, seen=None):
    """Raw and factory-made items that cannot be hand-crafted away (must be taken from belts or crates)."""
    seen = seen if seen is not None else set()
    if item in RAW:
        seen.add(item); return seen
    rid = PRODUCER[item]
    if R[rid][0] in HAND:
        for k in R[rid][2]:
            carry_in(k, seen)
    else:
        seen.add(item)
    return seen

w("## 11. Hand crafting, inventory and build costs\n")
w("Agreed: Factorio style. There is no shared Stock. The player carries a personal inventory and hand-crafts buildings from it (GDD 6.5).\n")
w("### 11.1 Rules\n")
w("| Rule | Value |")
w("|---|---|")
w("| Inventory | 48 slots, stack of 100 items, stack of 50 buildings |")
w("| Taking items | click Take on a Storage Crate, a machine output buffer or the end of a belt; up to a full stack at once |")
w("| Hand mining | 30 ore/min from any ore tile, only while the mine action is held (equals one Drill Mk1). Prevents soft locks |")
w("| Hand crafting | any building, plus any item made by an Assembler or Foil Press, at **speed x0.5 for items** (recipe time x2) and the listed time for buildings |")
w("| Not hand-craftable | items produced by the Smelter, Plastics Plant, Crystal Furnace, Cutter, Doping Chamber, Stepper, Tester, Packager, SMT Line or Final Assembly. Ingots, resin, silicon, boards and chips must come from the factory |")
w("| Craft queue | queue several crafts; missing hand-craftable ingredients are queued automatically |")
w("| Dock | not a source of materials. It accepts only items an open mission still needs, by belt or by hand drop. Surplus stays on the belt (it backs up) |")
w("| Placing | placing a building takes it from the inventory; picking a building up returns it |")
w("| Reach | Open (PLAN): walking avatar with reach, or a free camera with unlimited reach |")
w("")
w("### 11.2 Building costs and craft times\n")
w("Per building, or per 2 tiles for belts and pipes and per pole. **Proposed**, to tune when the prototype exists. The last column lists what must be carried in from the factory (the rest is hand-crafted from it).\n")
w("| Building | Cost | Craft s | Carry in from the factory |")
w("|---|---|---|---|")
for k, v in BC.items():
    ci = set()
    for it in v:
        carry_in(it, ci)
    w(f"| {nm(k) if '/' not in k else k.title()} | {items(v)} | {CT[k]:g} | {', '.join(nm(x) for x in sorted(ci))} |")
w("")
w("Starting inventory (the kit): 3 Drill Mk1, 1 Smelter, 1 Coal Burner, 20 Belt Mk1 (10 crafts), 6 Power Pole, 30 Copper Ingot. The Dock is already placed, with a copper patch and a coal patch in view. The first two missions are the tutorial.\n")

w("### 11.3 Construction load at campaign end\n")
w("Estimated build of the section 10 base: all production and supporting buildings, 21 Cooling Jackets, 60 Splitters/Mergers/Sorters, 60 poles, about 400 Belt Mk1 crafts, 300 Belt Mk2 crafts and 200 pipe crafts (roughly 12 tiles of belt per building).\n")
bl = {m: cnt[m] for m in cnt}
bl.update({"drill_mk2": sum(drills.values()), "oil_pump": 6, "water_pump": 4, "lab": labs, "steam_plant": 7, "refinery": 2,
           "cooling_jacket": cnt["stepper"] + cnt["crystal_furnace"] + cnt["doping_chamber"],
           "splitter / merger / sorter": 60, "power_pole": 60, "belt_mk1": 400, "belt_mk2": 300, "pipe": 200})
craft_s = 0; braw = {}
for k, n_ in bl.items():
    craft_s += CT[k] * n_
    for it, c in BC[k].items():
        for rk, rv in raw_per(it, c * n_).items():
            braw[rk] = braw.get(rk, 0) + rv
w("| Measure | Value |")
w("|---|---|")
w(f"| Buildings crafted | {sum(bl.values())} crafts |")
w(f"| Pure craft time | {craft_s/60:.0f} min ({craft_s/3600:.1f} h) spread over the whole campaign |")
w("| Raw used | " + ", ".join(f"{k.replace('_',' ')} {v:,.0f}" for k, v in braw.items()) + " |")
tot_m = {}
for m in MS:
    for k, v in raw_per(m[2], m[3]).items():
        tot_m[k] = tot_m.get(k, 0) + v
share = sum(braw.values()) / (sum(braw.values()) + sum(tot_m.values()) + sum(rt.values()))
w(f"| Share of all raw used by the campaign | {share:.1%} |")
w("")
w(f"Construction is a modest raw cost ({share:.0%} of everything the campaign consumes) and about {craft_s/3600:.1f} h of pure craft time, but mostly an **attention and flow cost**: the player must run belts of ingots, boards and resin into crates just to keep building, which is the Factorio feeling. If the prototype shows too little pressure, raise building costs before touching mission counts.\n")

w("## 12. Pacing\n")
w("| Phase | Missions | Production window min | Target play time | Notes |")
w("|---|---|---|---|---|")
byp = {}
for m in MS:
    byp[m[6]] = byp.get(m[6], 0) + m[3] / m[7]
targets = {"P0": (10, 15), "P1": (50, 70), "P2": (45, 65), "P3": (80, 120), "P4": (55, 85)}
notes = {"P0": "Tutorial, first belt, first lab", "P1": "Copper, tin, silicon, oil and plastics, small parts",
         "P2": "PCB chain, SMT line, three boards", "P3": "Fab chain, Logic Lab specs, cooling, yield", "P4": "Main board, final assembly, launch batch"}
lo = hi = 0
for p in ["P0", "P1", "P2", "P3", "P4"]:
    ms = [m[0] for m in MS if m[6] == p]
    a, b = targets[p]
    lo += a; hi += b
    w(f"| {PHASE[p]} | {ms[0]} to {ms[-1]} | {byp[p]:.0f} | {a} to {b} | {notes[p]} |")
w(f"| **Total** | 21 | **{sum(byp.values()):.0f}** | **{lo} to {hi} min ({lo/60:.1f} to {hi/60:.1f} h)** | |")
w("")
w("The target range is production windows multiplied by 1.3 to 1.9 for building (including about half an hour of hand crafting, section 11.3), fixing bottlenecks and waiting on research. It lands inside the agreed 4 to 6 hour campaign.\n")
mt = {}
for m in MS:
    for k, v in raw_per(m[2], m[3]).items():
        mt[k] = mt.get(k, 0) + v
w("Raw consumed by all 21 missions: " + ", ".join(f"{k.replace('_',' ')} {v:,.0f}" for k, v in mt.items()) + ".")
w("Research is about " + f"{rt['copper_ore']/(rt['copper_ore']+mt['copper_ore']):.0%}" + " of the copper and " + f"{rt['crude']/(rt['crude']+mt['crude']):.0%}" + " of the crude the campaign uses, so labs are a real load, not an afterthought.\n")

w("## 13. Knobs to tune first in the prototype\n")
w("1. Belt Mk1 speed and Mk2 timing (decides when logistics start to hurt).")
w("2. Smelter and Assembler base time, since they set the T1 pace.")
w("3. Stepper time (30 s) and die counts, the fab bottleneck.")
w("4. Crude per resin (20 u) and the Refinery split, the oil contest.")
w("5. Lab unit counts, so research takes 2 to 5 minutes per node with 4 labs.")
w("6. Mission counts, so each window is 5 to 17 minutes.")
w("7. Starting kit and build costs of the first 10 minutes.\n")

w("## 14. Open numbers\n")
w("- Reach and avatar: a walking player with build reach, or a free camera (Open, see 11.1).")
w("- A late sandbox Logistics Drone that fetches items for you (post-campaign convenience, not in the 38 nodes).")
w("- Finite patches (Open). Infinite is assumed.")
w("- Map size and ring radii (see PLAN open decisions).")
w("- Endless mission formula and Star rewards.")
w("- Whether the Tester wastes bad dies or sends them to a recycler (assumed: wasted).")

open(sys.argv[1] if len(sys.argv) > 1 else "CONTENT.md", "w").write("\n".join(out) + "\n")
print("ok", len("\n".join(out)))
