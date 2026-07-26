# Carlos de la Peña — Portfolio

Personal portfolio site for Carlos Alberto de la Peña González, a dual-degree Computer & Electrical Engineering student at the University of Michigan–Dearborn. Built as an Apple-inspired, single-page site with scroll-driven animation and real 3D throughout — not just a static résumé page.

## Features

- **3D hero** — the icons of three real shipped projects (Tiger Price, Tootor, Project Wellness) orbit as actual 3D cards, color-matched to each brand, draggable to inspect.
- **Per-project 3D**
  - Tiger Price, Tootor, and Project Wellness each get a 3D phone mockup showing the app's screen (currently mock UI, real screenshots pending).
  - The Line-Following Robot project loads its **actual CAD model** (STL) in a live 3D viewer instead of a mockup.
- **Scroll-driven reveals** via Framer Motion across every section.
- **Data-driven projects** — all project content (tagline, tech, stats, highlights, bullets, 3D assets) lives in one place: `src/data/projects.js`.
- Fully responsive, including a proper mobile nav (hamburger menu below the `sm` breakpoint).
- Code-split 3D components (`Hero3D`, `Phone3D`, `Robot3D`) — the heavy three.js/drei code only loads when a page actually needs it.

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
  components/   # Navbar, Footer, Layout, Reveal, and the 3D components
                # (Hero3D, IconRing, Phone3D, Robot3D)
  sections/     # Hero, Stats, About, Projects, Resume, Contact — the
                # sections stacked on the home page
  pages/        # Home, ProjectDetail (/projects/:slug), NotFound
  data/         # projects.js — single source of truth for all project content
public/
  icons/        # real app icons used in the 3D hero ring
  mockups/      # placeholder SVG "screens" shown in the 3D phone mockups
  models/       # the Line-Following Robot's actual CAD model (STL)
```

## Notes / known follow-ups

- The phone mockup screens are **placeholders** — real screenshots of Tiger Price, Tootor, and Project Wellness are pending. Swap the `mockScreen` path per project in `src/data/projects.js` and drop the "Mock screen preview" caption in `ProjectDetail.jsx` once they're in.
- `public/models/line-following-robot.stl` is ~19.6MB (392k triangles). It renders fine but is by far the heaviest asset on the site — worth decimating/compressing if it causes lag, especially on mobile.
- The Formspree-backed contact form isn't wired up yet; the Contact section currently only has direct links (email/LinkedIn/GitHub).
- Deployment target (GitHub Pages vs. Vercel) isn't finalized yet.
