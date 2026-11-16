# Audit: Project Wellness

Audited 2026-11-15 from `/Users/charly/Desktop/Projects/Project Wellness /project_wellness` (Flutter, version **2.24.1+49**, 130 Dart files, about 26.5k lines, last commit `d00fb68` 2026-10-01, 48 releases in `CHANGELOG.md`).

## What was run
- `flutter build ios --simulator --debug` succeeded. The binary is x86_64 only (the OCR and health plugins ship no arm64 simulator slice), so it installs on the **iOS 18.6** simulators (Rosetta) and not on iOS 26.
- Ran it on a clean iPhone 16 simulator. First launch shows onboarding; I then seeded the app's SQLite DB with a **fictional** profile ("Alex") and weeks of weigh-ins, food logs and Push/Pull/Legs sessions (`scratchpad/pwseed.py`, not part of the repo). The iPhone 16 Pro simulator holds Carlos's real profile and was not touched or used for any asset.
- Simulator access is now granted for the clean iPhone 16 (target it by UDID `15CF4993-D7B7-4B05-9896-979E522EB63D`, never the 16 Pro). Tool quirk: after a screenshot or swipe the first tap is often dropped, so confirm each navigation.

## Claims on the site vs reality

| Claim | Verdict | Evidence |
|---|---|---|
| Flutter, Dart, SQLite, OCR | True | `pubspec.yaml`: sqflite, `flutter_tesseract_ocr` (Tesseract), mobile_scanner |
| 13 muscle groups ranked | True | `MuscleRegion` enum has 13 values |
| 9 rank tiers per group | True | `MuscleRankTier`: novice, trainee, amateur, competent, advanced, elite, master, grandmaster, legendary (codes E to S style) |
| "Zero cloud, no accounts, fully local" | **Needs nuance** | No accounts, no backend, all data in local SQLite. But the barcode scanner calls **Open Food Facts** (`lib/core/nutrition/barcode_lookup.dart`, sends only the barcode), and exercise tutorials link out to YouTube. Say "no accounts, no servers of its own, your data never leaves the phone; the only network request is the optional barcode lookup" |
| "No accounts. No cloud." shown in the app's own copy | True | onboarding text: "This stays on your device, no accounts, no cloud" (captured) |
| Workout logging with PPL | True | Push Pull Legs, Upper/Lower, Full Body, Bro Split, Pilates, custom splits |
| Exercise library with video demos | True | 190 exercises in `exercise_library.dart`, most with a `videoUrl` (YouTube links) |
| BMR and maintenance estimate | **Understated** | v2.23 learns your real maintenance from your logs and blends it with the formula (up to 90% trust), shows every step, and never goes below a safe minimum |
| Medals and achievements | True | `medal_catalog.dart`, `unlocked_medals` table, streak on home |
| Export/share and full backup | True | CHANGELOG, `lib/core/sharing` |
| Android APK on GitHub releases | Plausible | `apkUrl` points to `CharlosXZD/Project-Wellness` releases; not checked live |
| "In active development", "Solo" | True | version 2.24.1, 48 releases |

## What the app does that the site does not say (features to lead with)
- **Today card**: calories left on a ring, whether you trained, latest weight, each a shortcut (captured).
- **Learns your maintenance** from what you ate and how your weight moved, and explains every step.
- **Body Rank**: per-muscle rank diagram built from real training volume.
- **Calendar** with dots for food, workouts, weigh-ins and optional period days.
- **Cycle tracking** with next period, ovulation and fertile window estimates, learned cycle length.
- **Weigh-ins you can fix**: typo guard ("Is that right?" for 109 vs 209), undo on delete, pick the date.
- **Biometric app lock** (`local_auth`), **Apple Health / Health Connect** sync (`health`), **home-screen widget** (`home_widget`), local reminders.
- **Barcode scan, nutrition-label OCR, personal foods and saved meal combos, supplements.**
- English and Spanish (`app_en.arb`, `app_es.arb`).

## Corrections to make
1. Replace "Zero cloud services" with the honest, still strong statement above.
2. Add the version and release count (v2.24.1, 48 releases) and the 26k-line size if numbers stay.
3. Lead with: privacy, learns your maintenance, Body Rank, scan it don't type it.

## Assets captured (`public/projects/project-wellness/`, 1179x2556)
| File | What it shows |
|---|---|
| `onboarding.png` | Welcome screen: "no accounts, no cloud" in the app's own words |
| `training.png` | Training: weekly strip, weight card with 30 day trend (81.3 kg, -1.7 kg), Push/Pull/Legs entry points. Demo data |
| `nutrition.png` | Nutrition: kcal ring (826 left of 1851, deficit 500), protein/carbs/fat bar, Search, Scan, My snacks, My meals, Previously scanned, Add manually |
| `calendar.png` | Month view with food, workout and weigh-in dots and a Today breakdown |
| `medals.png` | Medals list with bronze tier and progress bars |
| `home.png` | Home with streak, calendar dots, Today ring (826 kcal left), Training and Nutrition cards. Demo data, fictional "Alex" |

Still to capture: a workout in progress (the seed has no saved Push/Pull/Legs templates, so needs one created), Body Rank diagram, Goals and BMR steps, the barcode/label scanner (the camera needs a physical device or a pasted image, so likely skipped).
