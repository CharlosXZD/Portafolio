# Elementa on Steam (for later)

Notes for releasing Elementa on Steam. **Not for building yet.** Carlos (2026-10-08): "I don't care about money, but I would love for people to play the game." A free release is fine. This file collects what we know so the work is ready when the game is. Written from memory by Claude; **check every fee, rule and requirement against the current Steamworks documentation before acting**, because they change.

## 1. When

After **Alpha v1.0** (the true ending, the balance pass, Carlos's own art) and the visual overhaul (`VISUALS.md`). The visual work also produces the screenshots and the trailer the store page needs.

## 2. The plan in order

1. **Finish the game and a polish pass** (v1.0). Fix the rough edges testers report.
2. **Check the name.** Search Steam, itch.io and trademark databases for "Elementa" before committing to it; pick another name early if it is taken.
3. **Wrap the web build as a desktop app.** Electron (most common for web games on Steam) or Tauri (smaller). Offline, the same code, saves in the app's data folder. Keep the website version too.
4. **Steamworks integration.** The `steamworks.js` package gives achievements and Steam Cloud saves. Elementa already has about 50 achievements, so mapping them is mostly naming and icons. Cloud saves would sync the three save files.
5. **Set up the Steam partner account.** Steam asks for identity and tax and bank details to publish, even for a free game, as far as we know. Allow time for verification. Pay the **Steam Direct fee** (about $100 per game at the time of writing; verify the current amount and how it is refunded).
6. **Make the store page.** Needed: short and long descriptions (English and Spanish), a capsule image set in several sizes, screenshots, a trailer, system requirements, tags, an age rating questionnaire, a privacy policy link, a support contact. Put it up as **"Coming soon" as early as possible** (months before launch) to collect wishlists, because discoverability is the hard part on a crowded store.
7. **Trailer.** Make it with Remotion (`remotion-dev/skills`): rendered video from code, in line with the "code art only" rule.
8. **Playtest on Steam.** Steam Playtest lets testers join without a link and give feedback; use it for the beta before release.
9. **Release free.** Optionally mark it as Early Access for the beta period.

## 3. Things to prepare and watch for

- **Privacy.** The Arbiter reads details of the player's device (with permission) and, with a second permission, asks Open-Meteo for the weather at rounded coordinates. Steam requires a privacy policy when data is collected; write one that says exactly what is read, what is sent (rounded coordinates to Open-Meteo, only after a yes) and that nothing is stored or sold. Keep the "no cookies, nothing sent without a yes" promise in the store text too.
- **Intellectual property.** The game credits The Binding of Isaac as an inspiration and is "Balatro-like" as a genre; keep copying clear of both. Avatar was removed as a loadout for trademark reasons. Check fonts, any sounds and every name (the gods Gaea, Ognen, Varuna, Zephyr, the Mythic names) for trademark problems. Music is generated in code, so it is ours.
- **Input.** Mouse and keyboard work now. **Steam Deck** "Verified" needs controller-friendly navigation and readable text at small size; plan a controller pass if Carlos wants the badge (not required to release).
- **Languages.** English and Spanish are already complete; more can follow.
- **Saves and backups.** The web version keeps saves in the browser; the desktop version must keep the same save format and a backup export so testers can move files between the website and Steam.
- **The feedback button.** On Steam, point feedback at the Steam community discussions and the contact form (the website's `/#contact` form does not need to open inside the app).
- **Updates.** Steam handles patches automatically; keep the in-game patch notes screen as the player-facing log.
- **Performance.** Test the visual overhaul's 3D and cinematics on a low-end laptop and the Steam Deck.

## 4. Alternatives and extras

- **itch.io** is free, instant and a good soft launch; a web build or a desktop zip. No review process or fee.
- **Press and community:** a Discord, a short devlog, a few streamer keys once there is a trailer.
- **Mobile:** the game is already phone friendly in the browser; a store release is a separate project.

## 5. Open questions for Carlos

- Free forever, or free with a later paid supporter pack?
- Early Access during the beta, or only a full release?
- Steam Deck Verified or not?
- Which name will we use on the store?
