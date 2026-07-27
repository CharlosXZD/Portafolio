# Carlos de la Peña — Portfolio

Personal portfolio site for Carlos Alberto de la Peña González, a dual-degree Computer & Electrical Engineering student at the University of Michigan–Dearborn. Built as an Apple-inspired, single-page site with scroll-driven animation and real 3D throughout — not just a static résumé page.

## Features

- **3D hero** — the icons of three real shipped projects (Tiger Price, Tootor, Project Wellness) orbit as actual 3D cards, color-matched to each brand, draggable to inspect.
- **Per-project device mockups** — real screenshots shown in a CSS/Framer Motion phone frame (notch, bezel, mouse-tilt) or browser frame (chrome bar, address pill), with a crossfade carousel for multi-screen projects. The Line-Following Robot project instead loads its **actual CAD model** (STL) in a live 3D viewer.
- **Scroll-driven reveals** via Framer Motion across every section, plus a fade transition between routes.
- **Working contact form** backed by Formspree, with animated success/error states.
- **Data-driven projects** — all project content (tagline, tech, stats, highlights, bullets, feature callouts, security notes) lives in one place: `src/data/projects.js`.
- Fully responsive, including a proper mobile nav (hamburger menu below the `sm` breakpoint).
- Code-split 3D (`Hero3D`, `Robot3D`) — the heavy three.js/drei code only loads when a page actually needs it. The phone/browser mockups are plain CSS, so they don't pull in three.js at all.

## Tech stack

- [React](https://react.dev/) + [Vite](https://vite.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/) (custom `brand-*` color scale, not a default palette)
- [React Router](https://reactrouter.com/) for the `/projects/:slug` detail routes
- [Framer Motion](https://motion.dev/) for scroll reveals and micro-interactions
- [React Three Fiber](https://r3f.docs.pmnd.rs/) + [drei](https://github.com/pmndrs/drei) + [three.js](https://threejs.org/) for all 3D

## Getting started

```bash
npm install
npm run dev       # start the dev server
npm run build     # production build → dist/
npm run preview   # serve the production build locally
npm run lint      # oxlint
```

## Project structure

```
src/
  components/   # Navbar, Footer, Layout, Reveal, ScrollToTop, ContactForm,
                # PhoneMockup/BrowserMockup, and the 3D components
                # (Hero3D, IconRing, Robot3D)
  sections/     # Hero, Stats, About, Projects, Resume, Contact — the
                # sections stacked on the home page
  pages/        # Home, ProjectDetail (/projects/:slug), NotFound
  data/         # projects.js and resume.js — single source of truth for
                # all project/résumé content
public/
  icons/        # real app icons used in the 3D hero ring
  screenshots/  # real in-app screenshots shown in the phone/browser mockups
  models/       # the Line-Following Robot's actual CAD model (STL)
```

## Contact form setup (Formspree)

The Contact section's form posts to [Formspree](https://formspree.io). To wire it up:

1. Sign up at formspree.io and create a new form.
2. Copy the ID from your form's endpoint URL: `https://formspree.io/f/XXXXXXXX`.
3. Locally: copy `.env.example` to `.env.local` and set `VITE_FORMSPREE_ID=XXXXXXXX`.
4. On Vercel: add the same `VITE_FORMSPREE_ID` key/value under Project Settings → Environment Variables, then redeploy.

Without that variable set, the form still renders but shows a friendly error on submit (verified — this is the expected, safe failure mode, not a bug).

## Deploying to Vercel

This is a static Vite SPA — Vercel's Vite preset detects it automatically.

1. Push this repo to GitHub (already at `CharlosXZD/Portafolio`).
2. On [vercel.com](https://vercel.com), **Add New → Project**, import the repo.
3. Framework preset: Vite (auto-detected). Build command `npm run build`, output directory `dist` (both auto-filled).
4. Add the `VITE_FORMSPREE_ID` environment variable (see above) before the first deploy, or add it after and redeploy.
5. Deploy. `vercel.json` already includes the SPA rewrite (`/(.*)` → `/index.html`) so deep links like `/projects/tiger-price` work on a hard refresh, not just client-side navigation.

## License

The source code is MIT-licensed — see [LICENSE](./LICENSE). That grant does **not** extend to the personal content in this repo (résumé, bio, product names/screenshots/branding for Tiger Price, Tootor, and Project Wellness), which remains all rights reserved.

## Notes / known follow-ups

- `public/models/line-following-robot.stl` is ~19.6MB (392k triangles). It renders fine but is by far the heaviest asset on the site — worth decimating/compressing if it causes lag, especially on mobile.
- `OrbitControls` (used only by the robot's CAD viewer) is the single largest JS chunk (~900KB uncompressed) — it's lazy-loaded so it doesn't affect the initial page load, but worth revisiting if it ever needs to shrink further.
