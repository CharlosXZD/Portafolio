"""Ohmstead balance model. Single source of truth for the CONTENT.md draft numbers."""
import math, json

YIELD = 0.75  # required-path yield (60 base + 10 Yield I + 5 cooled stepper)

RAW = {"quartz", "copper_ore", "tin_ore", "gold_ore", "carbon", "crude", "water"}

# id: (machine, seconds, inputs, outputs)
R = {
 "cu_ingot":  ("smelter", 3, {"copper_ore": 1}, {"copper_ingot": 1}),
 "sn_ingot":  ("smelter", 3, {"tin_ore": 1}, {"tin_ingot": 1}),
 "au_ingot":  ("smelter", 6, {"gold_ore": 2}, {"gold_ingot": 1}),
 "silicon":   ("smelter", 6, {"quartz": 2, "carbon": 1}, {"silicon": 1}),
 "cu_foil":   ("foil_press", 2, {"copper_ingot": 1}, {"copper_foil": 2}),
 "cu_wire":   ("assembler", 1, {"copper_ingot": 1}, {"copper_wire": 2}),
 "au_wire":   ("assembler", 2, {"gold_ingot": 1}, {"gold_wire": 4}),
 "solder":    ("assembler", 3, {"tin_ingot": 2, "copper_ingot": 1}, {"solder": 3}),
 "resistor":  ("assembler", 2, {"carbon": 1, "copper_wire": 1}, {"resistor": 2}),
 "capacitor": ("assembler", 3, {"copper_foil": 2, "resin": 1}, {"capacitor": 2}),
 "diode":     ("assembler", 2, {"silicon": 1, "copper_wire": 1}, {"diode": 2}),
 "led":       ("assembler", 3, {"silicon": 1, "gold_wire": 1, "resin": 1}, {"led": 2}),
 "connector": ("assembler", 2, {"copper_wire": 2, "resin": 1}, {"connector": 1}),
 "case":      ("assembler", 4, {"resin": 3}, {"case": 1}),
 "substrate": ("assembler", 3, {"quartz": 1, "resin": 1}, {"substrate": 1}),
 "bare_pcb":  ("assembler", 3, {"substrate": 1, "copper_foil": 1}, {"bare_pcb": 1}),
 "photoresist": ("assembler", 4, {"resin": 2}, {"photoresist": 3}),
 "dopant":    ("assembler", 4, {"carbon": 1, "resin": 1}, {"dopant": 4}),
 "resin":     ("plastics_plant", 4, {"crude": 20, "carbon": 1}, {"resin": 3}),
 "si_ingot":  ("crystal_furnace", 24, {"silicon": 6}, {"silicon_ingot": 1}),
 "wafer":     ("cutter", 6, {"silicon_ingot": 1}, {"wafer": 4}),
 "doped":     ("doping_chamber", 4, {"wafer": 1, "dopant": 1}, {"doped_wafer": 1}),
 "etch_logic": ("stepper", 30, {"doped_wafer": 1, "photoresist": 1}, {"etched_logic": 1}),
 "etch_mem":   ("stepper", 30, {"doped_wafer": 1, "photoresist": 1}, {"etched_mem": 1}),
 "etch_mcu":   ("stepper", 30, {"doped_wafer": 1, "photoresist": 1}, {"etched_mcu": 1}),
 "dice_logic": ("cutter", 5, {"etched_logic": 1}, {"die_logic": 6}),
 "dice_mem":   ("cutter", 5, {"etched_mem": 1}, {"die_mem": 4}),
 "dice_mcu":   ("cutter", 5, {"etched_mcu": 1}, {"die_mcu": 2}),
 "test_logic": ("tester", 1, {"die_logic": 1}, {"good_die_logic": YIELD}),
 "test_mem":   ("tester", 1, {"die_mem": 1}, {"good_die_mem": YIELD}),
 "test_mcu":   ("tester", 1, {"die_mcu": 1}, {"good_die_mcu": YIELD}),
 "pack_logic": ("packager", 4, {"good_die_logic": 1, "gold_wire": 1, "copper_foil": 1}, {"logic_ic": 1}),
 "pack_mem":   ("packager", 4, {"good_die_mem": 1, "gold_wire": 1, "copper_foil": 1}, {"memory_chip": 1}),
 "pack_mcu":   ("packager", 4, {"good_die_mcu": 1, "gold_wire": 1, "copper_foil": 1}, {"microcontroller": 1}),
 "led_panel": ("smt_line", 6, {"bare_pcb": 1, "led": 4, "resistor": 2, "solder": 1}, {"led_panel": 1}),
 "power_board": ("smt_line", 8, {"bare_pcb": 1, "diode": 2, "capacitor": 2, "resistor": 2, "solder": 2}, {"power_board": 1}),
 "sensor_board": ("smt_line", 7, {"bare_pcb": 1, "resistor": 3, "capacitor": 2, "led": 1, "solder": 1}, {"sensor_board": 1}),
 "main_board": ("smt_line", 12, {"bare_pcb": 1, "microcontroller": 2, "memory_chip": 4, "logic_ic": 6, "capacitor": 4, "resistor": 4, "solder": 4}, {"main_board": 1}),
 "ohmstead_one": ("final_assembly", 15, {"main_board": 1, "power_board": 1, "connector": 2, "case": 1, "led_panel": 1, "sensor_board": 1}, {"ohmstead_one": 1}),
}

PRODUCER = {}
for rid, (m, t, i, o) in R.items():
    for k in o:
        PRODUCER[k] = rid  # last wins; resin only from plastics_plant here

def flow(item, rate, acc=None, mach=None):
    """items/min -> raw/min and machines needed (fractional), recursive."""
    acc = acc if acc is not None else {}
    mach = mach if mach is not None else {}
    if item in RAW:
        acc[item] = acc.get(item, 0) + rate
        return acc, mach
    rid = PRODUCER[item]
    m, t, ins, outs = R[rid]
    per_cycle = outs[item]
    cycles_per_min = rate / per_cycle
    mach[(m, rid)] = mach.get((m, rid), 0) + cycles_per_min * t / 60.0
    for k, v in ins.items():
        flow(k, v * cycles_per_min, acc, mach)
    return acc, mach

def raw_per(item, n=1):
    acc, _ = flow(item, n)
    return acc

if __name__ == "__main__":
    for it in ["led_panel", "power_board", "sensor_board", "logic_ic", "memory_chip", "microcontroller", "main_board", "ohmstead_one"]:
        print(it, {k: round(v, 2) for k, v in raw_per(it).items()})


# ---------------------------------------------------------------- machines
# id: (name, footprint, kW, speed, heat_kW, unlock_node, notes)
M = {
 "drill_mk1": ("Drill Mk1", "2x2", 50, "30 ore/min", 0, "start", "Output scales with patch richness 50% to 300%"),
 "drill_mk2": ("Drill Mk2", "2x2", 100, "60 ore/min", 0, "n07", ""),
 "drill_mk3": ("Drill Mk3", "3x3", 200, "120 ore/min", 0, "n35", ""),
 "oil_pump": ("Oil Pump", "2x2", 80, "300 u/min", 0, "n09", "Fluid units per minute, scales with richness"),
 "water_pump": ("Water Pump", "2x2", 40, "600 u/min", 0, "n22", "Placed on shallow water"),
 "smelter": ("Smelter", "2x2", 90, "x1", 0, "start", ""),
 "assembler": ("Assembler", "3x3", 75, "x1", 0, "n01", ""),
 "assembler_mk2": ("Assembler Mk2", "3x3", 160, "x2", 0, "n21", ""),
 "foil_press": ("Foil Press", "2x2", 60, "x1", 0, "n02", ""),
 "plastics_plant": ("Plastics Plant", "3x3", 120, "x1", 0, "n10", "Fluid input"),
 "refinery": ("Refinery", "3x4", 200, "x1", 0, "n14", "Crude to fuel + resin. 6 s: 30 crude -> 12 fuel + 2 resin"),
 "smt_line": ("SMT Line", "3x5", 150, "x1", 0, "n17", "Pick and place plus reflow"),
 "crystal_furnace": ("Crystal Furnace", "3x3", 180, "x1", 180, "n23", ""),
 "cutter": ("Cutter", "2x3", 100, "x1", 0, "n24", "Wafer slicing and die cutting"),
 "doping_chamber": ("Doping Chamber", "3x3", 150, "x1", 100, "n24", ""),
 "stepper": ("Stepper", "4x4", 400, "x1", 400, "n25", "Photolithography. One recipe per Logic Lab design"),
 "tester": ("Tester", "2x2", 90, "x1", 0, "n27", "Sorts dies, discards the bad ones"),
 "packager": ("Packager", "3x3", 120, "x1", 0, "n27", ""),
 "lab": ("Lab", "3x3", 60, "x1", 0, "start", "Consumes belted parts to research"),
 "final_assembly": ("Final Assembly", "4x4", 250, "x1", 0, "n38", ""),
 "dock": ("Dock", "4x4", 0, "-", 0, "start", "Mission sink. Accepts only items an open mission needs"),
}

# generators: id: (name, kW out, fuel text, unlock)
G = [
 ("Coal Burner", 300, "6 carbon/min", "start"),
 ("Fuel Generator", 1200, "60 fuel u/min", "n14"),
 ("Steam Plant", 2000, "30 fuel u/min + 300 water u/min", "n22"),
 ("Solar Array", 60, "none (flat, no night in v1)", "n34"),
 ("Battery", 0, "stores 2 MWh, charges from surplus", "n34"),
]

# ---------------------------------------------------------------- research
# id: (name, tier, pts, deps, unlocks, lab_inputs, units, unit_s, optional)
N = [
 ("n01","Assembly",1,1,[],"Assembler, Copper Wire recipe",{"copper_ingot":2},10,10,False),
 ("n02","Copper Foil",1,1,["n01"],"Foil Press, Copper Foil recipe",{"copper_wire":4},10,10,False),
 ("n03","Tin and Solder",1,1,["n01"],"Tin mining, Tin Ingot, Solder",{"copper_ingot":2,"copper_wire":2},12,10,False),
 ("n04","Logistics I",1,1,["n01"],"Splitter, Merger, Sorter",{"copper_wire":3},10,10,False),
 ("n05","Resistors",1,1,["n03"],"Resistor recipe",{"copper_wire":3,"carbon":1},12,12,False),
 ("n06","Silicon Smelting",1,2,["n03"],"Silicon recipe (quartz + carbon)",{"quartz":4,"carbon":2},10,12,False),
 ("n07","Drill Mk2",1,2,["n02"],"Drill Mk2",{"copper_ingot":3,"copper_foil":2},12,12,False),
 ("n08","Belt Mk2",1,2,["n04"],"Belt Mk2, Bridge",{"copper_ingot":2,"copper_wire":4},15,10,False),
 ("n09","Oil Pumping",1,2,["n02"],"Oil Pump, Pipes, Tank",{"copper_ingot":3,"copper_foil":3},12,12,False),
 ("n10","Plastics",1,2,["n09"],"Plastics Plant, Resin recipe",{"copper_ingot":2,"carbon":2},12,12,False),
 ("n11","Capacitors",1,2,["n10"],"Capacitor recipe",{"copper_foil":3,"resin":2},12,12,False),
 ("n12","Gold Mining",1,2,["n06"],"Gold mining, Gold Ingot, Gold Wire",{"silicon":2,"copper_wire":3},12,12,False),
 ("n13","LEDs and Diodes",1,2,["n11","n12"],"LED and Diode recipes",{"silicon":2,"resin":1,"gold_wire":1},12,15,False),
 ("n14","Fuel Power",2,3,["n09","n05"],"Refinery, Fuel Generator",{"copper_ingot":4,"resin":2},10,15,False),
 ("n15","Substrate",2,2,["n10","n06"],"Fiberglass Substrate recipe",{"resin":2,"quartz":3},12,12,False),
 ("n16","PCB Lamination",2,2,["n15","n02"],"Bare PCB recipe",{"substrate":2,"copper_foil":2},12,15,False),
 ("n17","SMT Line",2,3,["n16","n05","n11"],"SMT Line",{"bare_pcb":1,"resistor":3,"capacitor":1,"solder":1},12,15,False),
 ("n18","LED Panels",2,1,["n17","n13"],"LED Panel recipe",{"led":4,"resistor":2},10,15,False),
 ("n19","Power Boards",2,1,["n17","n13"],"Power Board recipe",{"diode":2,"capacitor":2},10,15,False),
 ("n20","Sensor Boards",2,1,["n17","n13"],"Sensor Board recipe",{"resistor":3,"led":1,"capacitor":1},10,15,False),
 ("n21","Assembler Mk2",2,2,["n17"],"Assembler Mk2 (x2 speed)",{"bare_pcb":2,"solder":2},12,15,True),
 ("n22","Water and Steam",3,3,["n14","n19"],"Water Pump, Steam Plant",{"power_board":1,"copper_foil":4},10,20,False),
 ("n23","Crystal Growth",3,3,["n17"],"Crystal Furnace, Silicon Ingot",{"silicon":6,"resistor":4},10,20,False),
 ("n24","Wafer Processing",3,2,["n23"],"Cutter, Wafer, Dopant, Doping Chamber",{"silicon_ingot":1},10,20,False),
 ("n25","Photolithography",3,4,["n24"],"Stepper, Photoresist",{"wafer":2,"resin":2},10,25,False),
 ("n26","Logic Lab",3,3,["n25"],"Logic Lab editor, Specs S1 and S2, Logic IC",{"doped_wafer":2,"led":2},8,25,False),
 ("n27","Test and Package",3,3,["n25"],"Dice cutting, Tester, Packager",{"doped_wafer":2,"gold_wire":2},8,25,False),
 ("n28","Cooling",3,3,["n22","n25"],"Radiators and cooling loops",{"capacitor":4,"copper_foil":4},10,25,False),
 ("n29","Yield I",3,3,["n26","n27"],"+10% yield",{"good_die_logic":2},8,25,False),
 ("n30","Memory Design",3,2,["n26","n27"],"Spec S3, Memory Chip",{"logic_ic":2,"resistor":4},8,25,False),
 ("n31","Controller Design",3,3,["n30"],"Spec S4, Microcontroller",{"logic_ic":2,"memory_chip":1},8,30,False),
 ("n32","Yield II",3,4,["n29","n28","n30"],"+10% yield",{"good_die_mem":2,"capacitor":2},8,30,True),
 ("n33","Cleanroom",3,3,["n32","n31"],"+5% yield",{"microcontroller":1,"power_board":1},6,30,True),
 ("n34","Solar and Battery",3,3,["n22","n23"],"Solar Array, Battery",{"silicon":8,"copper_foil":4},10,20,True),
 ("n35","Heavy Mining",3,3,["n08","n07","n21","n19"],"Drill Mk3, Belt Mk3",{"bare_pcb":2,"power_board":1},10,20,True),
 ("n36","Connectors and Cases",4,2,["n31"],"Connector and Case recipes",{"resin":3,"copper_wire":4},10,15,False),
 ("n37","Main Board",4,3,["n31","n36"],"Main Board recipe",{"microcontroller":1,"memory_chip":1,"logic_ic":1},8,30,False),
 ("n38","Final Assembly",4,4,["n37","n18","n19","n20"],"Final Assembly, Ohmstead One recipe",{"main_board":1,"connector":1},6,40,False),
]

# ---------------------------------------------------------------- missions
# id, name, item, count, points, gate node, phase, design rate (items/min)
MS = [
 ("M01","First Ingots","copper_ingot",40,1,"start","P0",20),
 ("M02","Wire Up","copper_wire",120,1,"n01","P0",40),
 ("M03","Tin Supply","tin_ingot",100,1,"n03","P1",30),
 ("M04","Solder","solder",150,2,"n03","P1",30),
 ("M05","Silicon","silicon",150,2,"n06","P1",20),
 ("M06","Resin","resin",200,2,"n10","P1",30),
 ("M07","Resistors","resistor",300,2,"n05","P1",40),
 ("M08","Capacitors","capacitor",200,2,"n11","P1",30),
 ("M09","LEDs","led",150,2,"n13","P1",20),
 ("M10","Bare Boards","bare_pcb",150,3,"n16","P2",20),
 ("M11","Light Show","led_panel",80,3,"n18","P2",10),
 ("M12","Clean Power","power_board",80,5,"n19","P2",10),
 ("M13","Sense","sensor_board",80,3,"n20","P2",10),
 ("M14","Crystal","silicon_ingot",60,3,"n23","P3",6),
 ("M15","Wafers","wafer",240,3,"n24","P3",24),
 ("M16","Logic","logic_ic",200,6,"n26","P3",15),
 ("M17","Memory","memory_chip",150,6,"n30","P3",10),
 ("M18","Brains","microcontroller",100,7,"n31","P3",6),
 ("M19","Main Boards","main_board",60,7,"n37","P4",4),
 ("M20","First Units","ohmstead_one",40,9,"n38","P4",4),
 ("M21","Launch Batch","ohmstead_one",120,11,"n38","P4",8),
]
PHASE = {"P0":"Start","P1":"Basics","P2":"Boards","P3":"Silicon Fab","P4":"Computing"}

# research scale: more units and longer units so research is a real factory load
N = [(a,b,c,d,e,f,g,int(round(h*3)),i*1.5,j) for (a,b,c,d,e,f,g,h,i,j) in N]
