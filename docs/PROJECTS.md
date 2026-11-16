# Projects: what they do, and what is true

Single source of truth for the portfolio copy. Lead with what each project does well. Numbers support the story and never carry it. Every fact below was checked against the code or by running the project on 2026-11-15 (details in `docs/audit/`). Anything not verified is marked.

Rules for writing about these:
- Say what it does, then why that is good. Numbers come last, in small type.
- Never claim what was not built. When something is mocked or unfinished, say so plainly; it reads as confidence.
- Elementa is an alpha and its counts change with every release. Date-stamp or version-stamp them (see Elementa).

---

## 1. Ohmstead
**One line:** An isometric factory builder about making electronics, from raw ore to a working desktop computer.

**Status:** In development. Engine and art built, the in-game logic editor is not. Not deployed. Not a playable alpha yet.

### What it does well
- **A factory that behaves like a factory.** Drills feed belts, belts feed smelters, smelters feed assemblers. Items move through a fixed-step simulation (20 ticks a second) that is fully deterministic, so a factory runs the same way every time and can be tested like software.
- **Power, fluids and heat are real constraints.** Power networks with poles and burners slow machines when supply falls short. Pipes, pumps and a refinery carry fluids. The chip-making chain has heat, cooling and exact test yields.
- **It teaches you the technology as you play.** A 57-node tech tree and 39 missions walk you from ore to a computer, with four branching forks.
- **A logic lab for building circuits.** The gate evaluator and six circuit specs are built and tested; the editor to play them is the next milestone.
- **Art drawn entirely in code.** 38 machine sprites are procedural, with a built-in Art Lab to inspect each machine at three zoom levels, four rotations and every status.

### Numbers (support)
57 research nodes, 39 missions, 73 recipes, 20 Hz simulation, about 13.7k lines of engine, render and art code, 16 test files passing.

### Not built yet (do not claim)
The Logic Lab editor UI, the Plastics Plant, SMT Line and Integrator as placeable machines, tanks and underground pipe, the campaign ending and tutorial polish.

### Assets (`public/projects/ohmstead/`)
`factory-close.png` (hero), `factory-wide.png`, `game-ui.png`, `art-lab.png`, `tech-tree.png`.

---

## 2. Elementa
**One line:** A roguelite where elemental dice react with their neighbors.

**Status:** Playable alpha in the browser, at `/games/elementa`. Version v0.9.17 at the time of writing. **It changes often: the content counts below are accurate for v0.9.17 and will grow. Show them as "as of v0.9.17" or pull them from the game's data.**

### What it does well
- **Order is the puzzle.** Dice sit in a row and neighbors react, so where you place a die changes the score. It is spatial, not just luck.
- **It explains every point.** The scoring ledger itemizes Base and Mult live ("Resonance x3 +18 Base"), so a huge number is never a mystery.
- **Fusion and forging.** Pairs and trios of elemental dice become new dice that inherit from both parents. Builds feel authored.
- **Bosses that change the rules,** with counters you can plan for. The Greater Eye shows the next roll of every die you did not hold; the Primordial and others rewrite how a round works.
- **A branching run, not a corridor.** A road map between rounds with shops run by recurring characters (a peddler, a forge, a cartographer), three story paths and a campaign across four realms.
- **Story told in pixel art.** Scenes for every boss and path, skippable, with replays in the Gallery.
- **A tutor with a personality.** Pip teaches the rules in play and can be skipped.
- **A character that reads the room, with consent.** An Arbiter can use your browser's time, language and window size to write lines about you, only after an explicit yes or no, and nothing is stored or sent.
- **Everything is made in code.** No image or audio files in the game: art, music and effects are generated, in English and Spanish.

### Numbers (as of v0.9.17, support only)
89 dice, 62 relics, 53 consumables, 54 reactions, 32 bosses, 12 shopkeepers, 15 starting loadouts, 4 difficulties, 72 achievements (50 hidden), 45 rounds across four realms, 17 endings, 34 patch notes. Endings in particular are still being written: confirm the in-game Gallery before printing a number.

### Honest notes
- Several late-run screens in the asset set come from the project's own test saves (constructed states), so on-screen scores show what the engine can reach, not a typical run.

### Assets (`public/projects/elementa/`)
`title.png`, `shop.png`, `run-recap.png`, `boss-table.png`, `boss-intro.png`, `realm3-table.png`, `gallery.png`, `map-atlas.png`.

---

## 3. Project Wellness
**One line:** A private fitness app. Workouts, food and body progress, all on your phone.

**Status:** In active development. v2.24.1 after 48 releases, Flutter for iOS and Android, English and Spanish. Android builds are published as GitHub releases (link not re-checked live).

### What it does well
- **Your data never leaves the phone.** No server of its own, nothing saved elsewhere, and the "account" is just a profile that gathers your own information: no email, no password. Zero cloud.
- **It learns your real maintenance calories.** From what you ate and how your weight moved, it blends a learned estimate with the formula, shows every step and never drops below a safe minimum.
- **Body Rank.** Each of 13 muscle groups earns a rank (9 tiers) from your actual training volume, shown on a body diagram.
- **Scan it, don't type it.** Barcode scanning and nutrition-label OCR turn packaged food into a log entry. Personal foods, saved meals and supplements fill the gaps.
- **A day at a glance.** The Today card shows calories left on a ring, whether you trained and your latest weight, each a shortcut.
- **Training without friction.** Push/Pull/Legs, Upper/Lower, Full Body, Bro Split, Pilates or your own split, with a 190-exercise library and video demos.
- **Weigh-ins you can trust.** A typo guard asks "Is that right?" when 109 becomes 209, with undo and date picking.
- **A calendar that shows your life,** with food, workouts, weigh-ins and optional cycle tracking (next period, ovulation and fertile window, learned cycle length).
- **Built like a real app.** Biometric lock, Apple Health and Health Connect sync, a home-screen widget, reminders, full export and backup.
- **Medals and streaks** that reward consistency.

### Numbers (support)
13 muscle groups, 9 rank tiers, 190 exercises, 130 Dart files, about 26.5k lines, 48 releases.

### Honest note (footnote, not headline)
The only network call is the optional barcode lookup, which sends just the barcode to Open Food Facts, and exercise videos open YouTube. Neither touches your own data.

### Assets (`public/projects/project-wellness/`, demo data with a fictional "Alex")
`onboarding.png`, `home.png`, `training.png`, `nutrition.png`, `calendar.png`, `medals.png`. Not yet captured: a workout in progress, the Body Rank diagram, Goals and BMR.

---

## 4. Tiger Price
**One line:** A complete marketplace for Mexico City: storefront, vendors, warehouse, couriers and admin, in one codebase.

**Status:** Pre-launch, production ready. Never launched.

### What it does well
- **Five apps in one.** A customer storefront, a vendor app (Owner, Manager and Staff with different permissions), a warehouse picking app, a courier delivery app and an admin console.
- **Mexican tax invoices built in.** CFDI invoicing with stamping through Facturapi and the SAT catalog shipped with the app.
- **Delivery you can follow.** Couriers have a map view and live tracking points per order.
- **Rules the client cannot bend.** Order cancellation windows (24 hours by default, set per store) are validated on the server, so they cannot be bypassed from the browser.
- **Returns, tickets and a support thread** inside the order.
- **Payments through Stripe,** so card data stays with Stripe.
- **It documents itself.** In-app manuals for every role, searchable, plus an error catalogue with codes.
- **Disciplined to ship.** 12 changelog releases, a versioning policy and a test suite.

### Numbers (support)
5 role apps, about 25 Firestore collections behind 418 lines of security rules, 12 releases, latest 0.7.1 (2026-08-10).

### Honest notes
- The storefront runs with a test catalog of 11 products with placeholder images.
- Built by one person.

### Assets (`public/projects/tiger-price/`)
`storefront-home.png`, `storefront-explore.png` (placeholder product images, use small), `about.png`. Role apps need a login, so screens for them are still to capture (existing `public/screenshots/tiger-price-*.png` remain).

---

## 5. Tootor
**One line:** A tutoring marketplace app: find a tutor, see their availability, book a class.

**Status:** A working prototype with the capabilities to launch. The payment step is mocked.

### What it does well
- **Find the right tutor.** Browse by subject (Math, Chemistry, English), search, and favorite tutors.
- **Real availability.** Tutors publish calendar slots; students see an availability calendar and pick a time.
- **A clear booking flow.** Choose a topic, add a note about what you need, and confirm a booking sheet with date, time, subject and price.
- **Two sides to the app.** A student app and a tutor app (availability, classes, earnings) on one Flutter codebase for iOS and Android.
- **Built on Firebase.** Accounts with email verification, Firestore bookings, push notifications.
- **Reward loop.** A medal tier that grows as a student completes classes.

### Honest notes
- **The payment step is mocked** (the app labels it "Mockup Stripe"). Nothing real is charged.
- Capable of launch: the account, discovery, availability and booking pieces work end to end against a live backend; payments are the piece to wire.
- Co-founded and built from January 2025 (the repository's history starts 2025-06-22).

### Numbers (support)
73 Dart files, about 22k lines, 10 commits in the current repository.

### Assets (`public/projects/tootor/`, Spanish UI)
`welcome.png`, `explore.png`, `availability.png`, `booking-sheet.png`, `mock-payment.png` (evidence the payment is mocked; do not present as a real payment). Other tutors on the live app are real people: never use screens showing them.

---

## 6. Line-Following Robot
**One line:** A CAD-designed robot chassis with Arduino-driven autonomous navigation.

**Status:** Fall 2025 team project (ENGR 100, UM-Dearborn). Not audited in this pass; claims come from Carlos's own CV and the existing site data. Verify before any rewrite.

### What it does well
- Designed the chassis in 3D CAD, tuned for structure and weight.
- Wrote the line-detection and navigation logic from scratch on Arduino.
- Covered the full hardware loop: CAD, assembly and firmware.
- Ranked best in the lab section (per Carlos; unverified here).

### Assets
Existing 3D model at `public/models/line-following-robot.stl` (an interactive 3D viewer already exists on the site).
