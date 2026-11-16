# Audit: Tiger Price (code reviewed, storefront run signed-out)

Audited 2026-11-15 from `/Users/charly/Desktop/Projects/TigerPrice/Tiger/marketplace-tiger` (the only git commit in that repo is "Initial commit" 2025-09-24, so there is no history to date the work; the CHANGELOG starts 2026-07-27 at 0.1.0 and the latest entry is 0.7.1, 2026-08-10).

## Not run yet, and why
The project's `.env` points the app at the **live Firebase project and Stripe keys**. Starting the dev server would read the real backend, and anything past browsing signed-out (cart, checkout, admin, vendor, warehouse, courier views) needs a real account. I did not run it. See "Open questions".

## Claims on the site vs the code

| Claim | Verdict | Evidence |
|---|---|---|
| React, Vite, Firebase, Stripe | True | `package.json`: React 19, Vite 7, Firebase 12, Stripe; also TypeScript, Leaflet, jsPDF, Chart.js, Vitest |
| "A dairy & grocery delivery marketplace for Mexico City" | Partly | README says "Mexico marketplace ... delivered within the city"; the dairy/grocery framing is not in the repo, confirm it |
| Cancellation window enforced server-side | True | `functions/src/support/requestOrderCancellation.ts` re-checks the window (default 24 h, per-store setting) and mirrors `src/config/cancelationPolicy.ts` |
| Firestore rules scope data to its owner | Plausible | `firestore.rules` is 418 lines over ~25 collections (users, orders, sales, invoices, tickets, deliveryTracking ...); needs a rules read-through before we say it in those words |
| Stripe handles card data, not the app | Plausible | `@stripe/react-stripe-js` client, Stripe functions in `functions/src/stripe`; confirm no card data reaches Firestore |
| Inventory and admin behind a separate role | True | role areas `src/pages/{admin,client,courier,vendor,warehouse}`, plus `storeMembers` and `customRoles` |
| "Production storefront", "real money moves through it" | **Unverified** | CHANGELOG calls 0.1.0 "a baseline snapshot of the pre-launch platform", and one entry is marked "Pendiente de deploy". README says Stripe test mode is fine for local dev. Need the user to confirm whether it took real payments |
| 4 core modules, 2 integrations | **Understated** | Real surface: 5 role apps, CFDI invoicing (Facturapi stamping), returns, support tickets, courier delivery tracking with maps, timed offers, promo codes, stock alerts, in-app manuals |

## What the code shows that the site does not say (features to lead with)
- **Five different apps in one codebase**: customer storefront, vendor (Dueño, Gerente, Staff with different permissions), warehouse picking, courier delivery, admin.
- **Mexican tax invoices (CFDI)**: invoicing flow with Facturapi stamping (`functions/src/cfdi/stampInvoice.ts`) and the SAT catalog shipped in `public/sat-catalog.json`.
- **Delivery tracking**: couriers have a map view and live tracking points (`deliveryTracking/{orderId}/points`).
- **Returns and cancellations** with server-validated windows, tickets and a support message thread.
- **Internal manuals** per role, searchable, inside the app (`/manual`), plus an error catalogue with codes (`TP-AUTH-01`, `TP-PED-09` ...).
- 12 CHANGELOG releases, a VERSIONING.md, and 6 Vitest files.

## Open questions for Carlos
1. Did Tiger Price go live and take real orders? If yes, since when, and is it still running? The site and CV say "production" and "real money".
2. May I run it? Options: (a) browse signed-out against the live backend (read only, no orders), (b) you sign in yourself in the browser pane and I only capture screens, (c) point it at a Firebase emulator or a staging project if one exists, (d) reuse the existing screenshots.
3. The "dairy and grocery" description: where does it come from?

## Assets
Not captured. Existing site screenshots (`public/screenshots/tiger-price-*.png`) are still the only ones.


## Answers from Carlos (2026-11-15) and what running it showed
- **Tiger Price never went live.** The site and CV must not say "production" or "real money". Say "pre-launch" / "built to production standards, not launched". Needs correcting in `src/data/projects.js` and the CV.
- Ran it with `npm run dev` (`tiger-dev` in `.claude/launch.json`, served over https on 5190 with the repo's local mkcert cert). Signed out only, no orders, no sign-in.
- Storefront works: home banner ("lacteos de la region, entrega en CDMX y Estado de Mexico", free shipping from $500), Explorar with filters, search, sort, categories, and 11 products at $72 to $98 with **placeholder 400x400 images**, so the data is a test catalog. Its own About page says "marketplace mexicano especializado en productos lacteos, fundado en 2026", so it is dairy, not "dairy and grocery".
- Vendor, warehouse, courier and admin apps and `/manual` need a login and redirect home when signed out, so they were not captured. Captures of those need either seeded test accounts against the emulator or reuse of the existing `public/screenshots/tiger-price-*.png`.

## Assets captured (`public/projects/tiger-price/`, 2880x1800)
`storefront-home.png`, `storefront-explore.png` (placeholder product images, usable only small or as UI texture), `about.png`.
