import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion'
import { useLanguage } from '../../i18n/LanguageContext.jsx'
import BrandTile from '../BrandTile.jsx'

/*
 * Apple-style project chapters. A page is a list of "story" entries in the project data;
 * each entry has a `type` that maps to one of the chapter components below, so every
 * project can be told with a different mix of full-bleed images, sticky screens, bento
 * grids and type-only statements. Motion is scroll-linked and drops out under reduced motion.
 */

const settle = { type: 'spring', bounce: 0, duration: 0.8 }

const ElementaTable = lazy(() => import('./ElementaTable.jsx'))


/* A phone with a thin bezel; the image is a real screenshot */
function Phone({ src, alt = '', className = '', style }) {
  return (
    <div
      className={`overflow-hidden rounded-[2.2rem] bg-black p-[5px] shadow-2xl shadow-black/40 ring-1 ring-white/15 ${className}`}
      style={style}
    >
      <img src={src} alt={alt} className="block h-full w-full rounded-[1.9rem] object-cover object-top" />
    </div>
  )
}

function toneClasses(tone, stage) {
  if (tone === 'dark') return { className: 'text-white', style: { background: stage.bg } }
  if (tone === 'soft')
    return { className: 'bg-neutral-50 text-neutral-900 dark:bg-neutral-900 dark:text-white' }
  return { className: 'bg-white text-neutral-900 dark:bg-neutral-950 dark:text-white' }
}

function Eyebrow({ children, color, dark }) {
  return (
    <p
      className="text-eyebrow"
      style={{ color: dark ? 'rgba(255,255,255,0.62)' : color }}
    >
      {children}
    </p>
  )
}

/* ---------- Hero: the title, then the product rising into view ---------- */
function Hero({ project, s }) {
  const { pick, t } = useLanguage()
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -90])
  const scale = useTransform(scrollYProgress, [0, 0.7], [1, reduce ? 1 : 0.95])
  const { stage, brand } = project

  return (
    <section
      ref={ref}
      className="relative overflow-hidden text-white"
      style={{ background: stage.bg }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[70%]"
        style={{
          background: `radial-gradient(60% 80% at 50% 0%, ${brand.color}66, transparent 70%)`,
        }}
      />
      <div className="relative mx-auto max-w-6xl px-6 pt-16 text-center sm:pt-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={settle}
          className="mb-7 flex justify-center"
        >
          <BrandTile project={project} className="size-20 sm:size-24" />
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...settle, delay: 0.03 }}
          className="text-eyebrow text-white/60"
        >
          {pick(s.eyebrow ?? project.role)}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...settle, delay: 0.06 }}
          className="mt-4 text-balance font-semibold"
          style={{
            fontSize: 'clamp(3.25rem, 11vw, 8rem)',
            lineHeight: 0.98,
            letterSpacing: '-0.045em',
          }}
        >
          {s.title ?? project.title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...settle, delay: 0.14 }}
          className="mx-auto mt-6 max-w-2xl text-xl leading-relaxed text-pretty text-white/75 sm:text-2xl"
        >
          {pick(s.tagline)}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...settle, delay: 0.22 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          {project.playUrl && (
            <Link
              to={project.playUrl}
              className="pressable inline-flex items-center rounded-full bg-white px-6 py-3 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-200"
            >
              {t('projectDetail.playNow')}
            </Link>
          )}
          {project.apkUrl && (
            <a
              href={project.apkUrl}
              className="pressable inline-flex items-center rounded-full bg-white px-6 py-3 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-200"
            >
              {t('projectDetail.downloadApk')}
            </a>
          )}
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noreferrer"
              className="pressable inline-flex items-center rounded-full px-6 py-3 text-sm font-medium text-white ring-1 ring-white/30 transition-colors ring-inset hover:bg-white/10"
            >
              {t('projectDetail.viewCode')}
            </a>
          )}
          {s.chip && (
            <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-medium text-white/70 ring-1 ring-white/15">
              {pick(s.chip)}
            </span>
          )}
        </motion.div>
      </div>

      <div className="relative mx-auto mt-14 max-w-6xl px-6 sm:mt-20">
        {s.phones ? (
          <motion.div
            style={{ y, scale, transformOrigin: '50% 0%' }}
            className="flex items-end justify-center gap-3 sm:gap-6"
          >
            {s.phones.map((src, i) => {
              const center = i === Math.floor(s.phones.length / 2)
              return (
                <Phone
                  key={src}
                  src={src}
                  className={`${center ? 'w-[44%] max-w-[22rem]' : 'w-[30%] max-w-[16rem]'} ${
                    center ? '' : 'translate-y-10 sm:translate-y-16'
                  } aspect-[1179/2556] rounded-b-none`}
                />
              )
            })}
          </motion.div>
        ) : (
          <motion.div
            style={{ y, scale, transformOrigin: '50% 0%' }}
            className="overflow-hidden rounded-t-[1.75rem] ring-1 ring-white/10 shadow-[0_-30px_120px_-20px_rgba(0,0,0,0.6)] sm:rounded-t-[2.25rem]"
          >
            <img src={s.image} alt={pick(s.alt ?? project.tagline)} className="block w-full" />
          </motion.div>
        )}
      </div>
    </section>
  )
}

/* ---------- Statement: one big sentence that lights up as you scroll ---------- */
function Word({ word, progress, range, accent, dark }) {
  const opacity = useTransform(progress, range, [0.16, 1])
  const marked = word.startsWith('*') && word.replace(/[^*]/g, '').length >= 1
  const clean = word.replace(/\*/g, '')
  return (
    <motion.span
      style={{ opacity, color: marked ? accent : undefined }}
      className={`mr-[0.28em] inline-block ${dark ? '' : ''}`}
    >
      {clean}
    </motion.span>
  )
}

function Statement({ project, s, tone }) {
  const { pick } = useLanguage()
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.9', 'end 0.55'] })
  const words = pick(s.text).split(' ')
  const t = toneClasses(tone, project.stage)
  const n = words.length
  return (
    <section ref={ref} className={`${t.className}`} style={t.style}>
      <div className="mx-auto max-w-5xl px-6 py-28 sm:py-40">
        {s.eyebrow && (
          <div className="mb-6">
            <Eyebrow color={project.brand.color} dark={tone === 'dark'}>
              {pick(s.eyebrow)}
            </Eyebrow>
          </div>
        )}
        <p
          className="text-balance font-semibold"
          style={{ fontSize: 'clamp(2rem, 5.6vw, 4.5rem)', lineHeight: 1.06, letterSpacing: '-0.035em' }}
        >
          {words.map((w, i) => (
            <Word
              key={i + w}
              word={w}
              progress={scrollYProgress}
              range={reduce ? [0, 0.01] : [i / n, Math.min(1, (i + 1.6) / n)]}
              accent={tone === 'dark' ? `${project.brand.color}` : project.brand.color}
              dark={tone === 'dark'}
            />
          ))}
        </p>
        {s.body && (
          <p
            className={`mt-8 max-w-2xl text-xl leading-relaxed text-pretty ${
              tone === 'dark' ? 'text-white/65' : 'text-neutral-600 dark:text-neutral-400'
            }`}
          >
            {pick(s.body)}
          </p>
        )}
      </div>
    </section>
  )
}

/* ---------- FullBleed: an edge-to-edge image with the words laid over it ---------- */
function FullBleed({ project, s }) {
  const { pick } = useLanguage()
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [reduce ? 1 : 1.14, 1.04, 1])
  return (
    <section
      ref={ref}
      className="relative isolate h-[82vh] min-h-[540px] overflow-hidden bg-black text-white"
    >
      <motion.img
        src={s.image}
        alt={pick(s.headline)}
        style={{ scale, objectPosition: s.position ?? 'center' }}
        className={`absolute inset-0 -z-10 h-full w-full object-cover ${
          s.pixel ? '[image-rendering:pixelated]' : ''
        }`}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/25 to-transparent"
      />
      <div className="mx-auto flex h-full max-w-6xl items-end px-6 pb-14 sm:pb-20">
        <div className={s.narrow ? 'max-w-sm' : 'max-w-xl'}>
          <Eyebrow color={project.brand.color} dark>
            {pick(s.eyebrow)}
          </Eyebrow>
          <h2
            className="mt-3 text-balance font-semibold"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.75rem)', lineHeight: 1.05, letterSpacing: '-0.035em' }}
          >
            {pick(s.headline)}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-pretty text-white/80">{pick(s.body)}</p>
        </div>
      </div>
    </section>
  )
}

/* ---------- StickyStory: the screen stays put while the chapters scroll past ---------- */
function Chapter({ chapter, index, onActive, children, dark }) {
  const { pick } = useLanguage()
  const ref = useRef(null)
  const inView = useInView(ref, { margin: '-45% 0px -45% 0px' })
  useEffect(() => {
    if (inView) onActive(index)
  }, [inView, index, onActive])
  return (
    <div ref={ref} className="flex min-h-[62vh] flex-col justify-center py-10 lg:min-h-[calc(100vh-3.5rem)]">
      <div className="lg:hidden">{children}</div>
      <p className="text-eyebrow mt-6 lg:mt-0" style={{ color: dark ? 'rgba(255,255,255,0.6)' : undefined }}>
        {pick(chapter.eyebrow)}
      </p>
      <h3
        className="mt-3 text-balance font-semibold"
        style={{ fontSize: 'clamp(1.75rem, 3.6vw, 2.75rem)', lineHeight: 1.08, letterSpacing: '-0.03em' }}
      >
        {pick(chapter.headline)}
      </h3>
      <p
        className={`mt-4 text-lg leading-relaxed text-pretty ${
          dark ? 'text-white/70' : 'text-neutral-600 dark:text-neutral-400'
        }`}
      >
        {pick(chapter.body)}
      </p>
    </div>
  )
}

function Frame({ chapter, project, fit }) {
  const { pick } = useLanguage()
  if (fit === 'phone')
    return (
      <div className="flex justify-center">
        <div
          className="relative rounded-[3rem] p-8"
          style={{ background: `radial-gradient(60% 60% at 50% 50%, ${project.brand.color}38, transparent 70%)` }}
        >
          <Phone
            src={chapter.image}
            alt={pick(chapter.headline)}
            className="aspect-[1179/2556] h-[min(70vh,40rem)] w-auto"
          />
        </div>
      </div>
    )
  return (
    <div
      className="overflow-hidden rounded-[1.75rem] ring-1 ring-black/10 shadow-2xl shadow-black/25 dark:ring-white/10"
      style={{ background: project.stage.bg }}
    >
      <img
        src={chapter.image}
        alt={pick(chapter.headline)}
        loading="lazy"
        className={`block w-full ${fit === 'phone' ? 'mx-auto max-h-[70vh] w-auto' : ''} ${
          chapter.pixel ? '[image-rendering:pixelated]' : ''
        }`}
      />
    </div>
  )
}

function StickyStory({ project, s, tone }) {
  const { pick } = useLanguage()
  const [active, setActive] = useState(0)
  const dark = tone === 'dark'
  const t = toneClasses(tone, project.stage)
  return (
    <section className={t.className} style={t.style}>
      <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
        {s.heading && (
          <div className="mb-8 max-w-2xl sm:mb-16">
            <Eyebrow color={project.brand.color} dark={dark}>
              {pick(s.eyebrow)}
            </Eyebrow>
            <h2
              className="mt-3 text-balance font-semibold"
              style={{ fontSize: 'clamp(2rem, 4.6vw, 3.5rem)', lineHeight: 1.06, letterSpacing: '-0.035em' }}
            >
              {pick(s.heading)}
            </h2>
          </div>
        )}
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
          <div className="hidden lg:block">
            <div className="sticky top-14 flex h-[calc(100vh-3.5rem)] items-center">
              <div className="w-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, scale: 0.985 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Frame chapter={s.chapters[active]} project={project} fit={s.fit} />
                </motion.div>
              </AnimatePresence>
              </div>
            </div>
          </div>
          <div>
            {s.chapters.map((c, i) => (
              <Chapter key={i} chapter={c} index={i} onActive={setActive} dark={dark}>
                <Frame chapter={c} project={project} fit={s.fit} />
              </Chapter>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- Bento: tiles of different sizes and kinds ---------- */
function Tile({ tile, project }) {
  const { pick } = useLanguage()
  const base = 'relative overflow-hidden rounded-[1.75rem] ring-1 ring-black/5 dark:ring-white/10'
  const color = project.brand.color

  if (tile.kind === 'stat')
    return (
      <div
        className={`${base} flex flex-col justify-between p-6 text-white sm:p-7 ${tile.span ?? ''}`}
        style={{ background: tile.bg ?? `linear-gradient(160deg, ${color}, ${project.stage.bg})` }}
      >
        <span className="text-eyebrow text-white/70">{pick(tile.eyebrow ?? { en: '', es: '' })}</span>
        <div>
          <p
            className="font-semibold tabular-nums"
            style={{ fontSize: 'clamp(3rem, 7vw, 5rem)', lineHeight: 1, letterSpacing: '-0.045em' }}
          >
            {tile.value}
          </p>
          <p className="mt-2 text-base text-white/80">{pick(tile.label)}</p>
        </div>
      </div>
    )

  if (tile.kind === 'text')
    return (
      <div
        className={`${base} flex flex-col justify-end bg-neutral-100 p-6 sm:p-8 dark:bg-neutral-900 ${tile.span ?? ''}`}
      >
        <Eyebrow color={color}>{pick(tile.eyebrow)}</Eyebrow>
        <h3
          className="mt-3 text-balance font-semibold text-neutral-900 dark:text-white"
          style={{ fontSize: 'clamp(1.5rem, 2.8vw, 2.25rem)', lineHeight: 1.1, letterSpacing: '-0.03em' }}
        >
          {pick(tile.headline)}
        </h3>
        <p className="mt-3 text-base leading-relaxed text-pretty text-neutral-600 dark:text-neutral-400">
          {pick(tile.body)}
        </p>
      </div>
    )

  if (tile.kind === 'phone')
    return (
      <div
        className={`${base} flex items-end justify-center px-6 pt-8 ${tile.span ?? ''}`}
        style={{ background: tile.bg ?? `linear-gradient(170deg, ${color}, ${project.stage.bg})` }}
      >
        <Phone
          src={tile.image}
          alt={pick(tile.caption)}
          className="aspect-[1179/2556] w-[78%] translate-y-6 rounded-b-none"
        />
      </div>
    )

  // image / art tile
  return (
    <figure className={`${base} group ${tile.span ?? ''}`} style={{ background: project.stage.bg }}>
      <img
        src={tile.image}
        alt={pick(tile.caption)}
        loading="lazy"
        className={`h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.03] ${
          tile.contain ? 'object-contain' : 'object-cover'
        } ${tile.pixel ? '[image-rendering:pixelated]' : ''}`}
        style={{ objectPosition: tile.position ?? 'center' }}
      />
      <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-5 pt-12 text-sm font-medium text-white">
        {pick(tile.caption)}
      </figcaption>
    </figure>
  )
}

function Bento({ project, s, tone }) {
  const { pick } = useLanguage()
  const t = toneClasses(tone, project.stage)
  return (
    <section className={t.className} style={t.style}>
      <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
        <div className="max-w-2xl">
          <Eyebrow color={project.brand.color} dark={tone === 'dark'}>
            {pick(s.eyebrow)}
          </Eyebrow>
          <h2
            className="mt-3 text-balance font-semibold"
            style={{ fontSize: 'clamp(2rem, 4.6vw, 3.5rem)', lineHeight: 1.06, letterSpacing: '-0.035em' }}
          >
            {pick(s.heading)}
          </h2>
          {s.body && (
            <p
              className={`mt-4 text-lg leading-relaxed text-pretty ${
                tone === 'dark' ? 'text-white/65' : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              {pick(s.body)}
            </p>
          )}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ ...settle, duration: 0.9 }}
          className="mt-12 grid auto-rows-[minmax(11rem,auto)] grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
        >
          {s.tiles.map((tile, i) => (
            <Tile key={i} tile={tile} project={project} />
          ))}
        </motion.div>
        {s.note && (
          <p
            className={`mt-5 text-xs ${
              tone === 'dark' ? 'text-white/50' : 'text-neutral-500 dark:text-neutral-400'
            }`}
          >
            {pick(s.note)}
          </p>
        )}
      </div>
    </section>
  )
}


/* ---------- Table: a small playable piece of the real product ---------- */
function Table({ project, s, tone }) {
  const { pick } = useLanguage()
  const t = toneClasses(tone, project.stage)
  const dark = tone === 'dark'
  return (
    <section className={t.className} style={t.style}>
      <div className="mx-auto max-w-5xl px-6 py-24 sm:py-32">
        <div className="max-w-2xl">
          <Eyebrow color={project.brand.color} dark={dark}>
            {pick(s.eyebrow)}
          </Eyebrow>
          <h2
            className="mt-3 text-balance font-semibold"
            style={{ fontSize: 'clamp(2rem, 4.6vw, 3.5rem)', lineHeight: 1.06, letterSpacing: '-0.035em' }}
          >
            {pick(s.heading)}
          </h2>
          <p className={`mt-4 text-lg leading-relaxed text-pretty ${dark ? 'text-white/65' : 'text-neutral-600 dark:text-neutral-400'}`}>
            {pick(s.body)}
          </p>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ ...settle, duration: 0.9 }}
          className="mt-12"
        >
          <Suspense fallback={<div className="h-[28rem] rounded-[1.75rem] bg-white/5" />}>
            <ElementaTable />
          </Suspense>
        </motion.div>
        {s.note && (
          <p className={`mt-4 text-xs ${dark ? 'text-white/50' : 'text-neutral-500'}`}>{pick(s.note)}</p>
        )}
      </div>
    </section>
  )
}

/* ---------- Rail: the page scrolls down, the cards travel sideways ---------- */
function Rail({ project, s, tone }) {
  const { pick } = useLanguage()
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const n = s.cards.length
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const x = useTransform(scrollYProgress, [0.04, 0.96], ['0%', `${-(100 * (n - 1)) / n}%`])
  const t = toneClasses(tone, project.stage)
  const dark = tone === 'dark'

  const card = (c, i) => (
    <figure
      key={i}
      className="flex h-full shrink-0 flex-col overflow-hidden rounded-[1.75rem] ring-1 ring-white/10"
      style={{ width: `min(82vw, ${s.cardWidth ?? 34}rem)`, background: project.stage.bg }}
    >
      <div
        className="relative min-h-0 flex-1 overflow-hidden bg-black/30"
        style={c.phone ? { background: `radial-gradient(80% 70% at 50% 100%, ${project.brand.color}55, transparent 75%)` } : undefined}
      >
        {c.phone ? (
          <div className="absolute inset-x-0 top-6 flex justify-center">
            <Phone src={c.image} alt={pick(c.headline)} className="aspect-[1179/2556] w-[min(62%,15rem)]" />
          </div>
        ) : (
        <img
          src={c.image}
          alt={pick(c.headline)}
          loading="lazy"
          className={`absolute inset-0 h-full w-full ${c.contain ? 'object-contain' : 'object-cover'} ${c.pixel ? '[image-rendering:pixelated]' : ''}`}
          style={{ objectPosition: c.position ?? 'center' }}
        />
        )}
      </div>
      <figcaption className="shrink-0 border-t border-white/10 bg-white/[0.04] p-5 text-white sm:p-6">
        <p className="text-eyebrow text-white/55">{pick(c.eyebrow)}</p>
        <h3 className="mt-1.5 text-balance text-xl font-semibold sm:text-2xl" style={{ letterSpacing: '-0.025em', lineHeight: 1.12 }}>
          {pick(c.headline)}
        </h3>
        <p className="mt-2 text-[0.95rem] leading-relaxed text-pretty text-white/70">{pick(c.body)}</p>
      </figcaption>
    </figure>
  )

  if (reduce)
    return (
      <section className={t.className} style={t.style}>
        <div className="mx-auto max-w-6xl px-6 py-24">
          <h2 className="text-balance font-semibold" style={{ fontSize: 'clamp(2rem, 4.6vw, 3.5rem)', letterSpacing: '-0.035em' }}>
            {pick(s.heading)}
          </h2>
          <div className="mt-10 flex snap-x gap-4 overflow-x-auto pb-4">{s.cards.map(card)}</div>
        </div>
      </section>
    )

  return (
    <section ref={ref} className={t.className} style={{ ...t.style, height: `${n * 70 + 40}vh` }}>
      <div className="sticky top-14 flex h-[calc(100vh-3.5rem)] flex-col justify-center overflow-hidden">
        <div className="mx-auto w-full max-w-6xl px-6">
          <Eyebrow color={project.brand.color} dark={dark}>
            {pick(s.eyebrow)}
          </Eyebrow>
          <h2
            className="mt-3 max-w-2xl text-balance font-semibold"
            style={{ fontSize: 'clamp(1.9rem, 4.2vw, 3.25rem)', lineHeight: 1.06, letterSpacing: '-0.035em' }}
          >
            {pick(s.heading)}
          </h2>
        </div>
        <div className="mt-8 h-[66vh] min-h-[26rem] pl-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))]">
          <motion.div style={{ x }} className="flex h-full w-max gap-4 pr-6">
            {s.cards.map(card)}
          </motion.div>
        </div>
      </div>
    </section>
  )
}


/* ---------- Collage: phones drift at different speeds while you scroll ---------- */
function Collage({ project, s, tone }) {
  const { pick } = useLanguage()
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const t = toneClasses(tone, project.stage)
  const dark = tone === 'dark'
  const shifts = [60, -40, 90, -10]
  return (
    <section ref={ref} className={t.className} style={t.style}>
      <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow color={project.brand.color} dark={dark}>
            {pick(s.eyebrow)}
          </Eyebrow>
          <h2
            className="mt-3 text-balance font-semibold"
            style={{ fontSize: 'clamp(2rem, 4.6vw, 3.5rem)', lineHeight: 1.06, letterSpacing: '-0.035em' }}
          >
            {pick(s.heading)}
          </h2>
        </div>
        <div className="mt-16 grid grid-cols-2 gap-x-4 gap-y-14 lg:grid-cols-4 lg:gap-x-8">
          {s.items.map((it, i) => (
            <CollageItem key={i} it={it} i={i} progress={scrollYProgress} shift={reduce ? 0 : shifts[i % shifts.length]} project={project} dark={dark} />
          ))}
        </div>
      </div>
    </section>
  )
}

function CollageItem({ it, i, progress, shift, project, dark }) {
  const { pick } = useLanguage()
  const y = useTransform(progress, [0, 1], [shift, -shift])
  return (
    <motion.div style={{ y }} className={i % 2 ? 'lg:mt-16' : ''}>
      <div
        className="rounded-[2rem] p-4 sm:p-6"
        style={{ background: `radial-gradient(70% 60% at 50% 40%, ${project.brand.color}40, transparent 75%)` }}
      >
        <Phone src={it.image} alt={pick(it.headline)} className="mx-auto aspect-[1179/2556] w-full max-w-[14rem]" />
      </div>
      <p className="text-eyebrow mt-4" style={{ color: dark ? 'rgba(255,255,255,0.6)' : project.brand.color }}>
        {pick(it.eyebrow)}
      </p>
      <h3 className="mt-1.5 text-balance text-lg font-semibold sm:text-xl" style={{ letterSpacing: '-0.02em', lineHeight: 1.15 }}>
        {pick(it.headline)}
      </h3>
      <p className={`mt-2 text-sm leading-relaxed text-pretty ${dark ? 'text-white/65' : 'text-neutral-600 dark:text-neutral-400'}`}>
        {pick(it.body)}
      </p>
    </motion.div>
  )
}


/* ---------- Glance: the at-a-glance card, closing the page ---------- */
const GLANCE_LABELS = {
  en: { title: 'At a glance', stack: 'Stack', different: 'What makes it different', features: 'Features', timeline: 'Timeline' },
  es: { title: 'De un vistazo', stack: 'Tecnologías', different: 'Qué la hace distinta', features: 'Funciones', timeline: 'Cronología' },
}

function Glance({ project, tone }) {
  const { pick, lang } = useLanguage()
  const L = GLANCE_LABELS[lang] ?? GLANCE_LABELS.en
  const g = project.glance
  if (!g) return null
  const t = toneClasses(tone, project.stage)
  return (
    <section className={t.className} style={t.style}>
      <div className="mx-auto max-w-3xl px-6 py-20 sm:py-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ ...settle, duration: 0.8 }}
          className="rounded-3xl bg-neutral-100 p-6 ring-1 ring-neutral-200/70 sm:p-8 dark:bg-neutral-900 dark:ring-neutral-800"
        >
          <div className="flex items-center gap-3">
            <BrandTile project={project} shadow={false} className="size-8" />
            <h2 className="text-eyebrow text-neutral-500 dark:text-neutral-400">{L.title}</h2>
          </div>
          <dl className="mt-5 divide-y divide-neutral-200 dark:divide-neutral-800">
            {[
              [L.stack, project.tech.join(', ')],
              [L.different, pick(g.different)],
              [
                L.features,
                <ul key="f" className="flex flex-wrap gap-2">
                  {pick(g.features).map((f) => (
                    <li
                      key={f}
                      className="rounded-full bg-white px-3 py-1 text-[0.8rem] font-medium text-neutral-800 ring-1 ring-neutral-200 dark:bg-neutral-800 dark:text-neutral-100 dark:ring-neutral-700"
                    >
                      {f}
                    </li>
                  ))}
                </ul>,
              ],
              [L.timeline, pick(project.period)],
            ].map(([label, value]) => (
              <div key={label} className="flex flex-col gap-1 py-4 text-sm first:pt-0 last:pb-0 sm:flex-row sm:gap-6">
                <dt className="shrink-0 text-neutral-500 sm:w-40 dark:text-neutral-400">{label}</dt>
                <dd className="font-medium text-pretty text-neutral-900 dark:text-neutral-100">{value}</dd>
              </div>
            ))}
          </dl>
        </motion.div>
      </div>
    </section>
  )
}

/* ---------- Personal note: a quiet, human interlude ---------- */
function Note({ project, s, tone }) {
  const { pick } = useLanguage()
  const t = toneClasses(tone, project.stage)
  return (
    <section className={t.className} style={t.style}>
      <div className="mx-auto max-w-3xl px-6 py-24 sm:py-32">
        <Eyebrow color={project.brand.color} dark={tone === 'dark'}>
          {pick(s.eyebrow)}
        </Eyebrow>
        <h2
          className="mt-4 text-balance font-semibold"
          style={{ fontSize: 'clamp(1.9rem, 4vw, 3rem)', lineHeight: 1.1, letterSpacing: '-0.03em' }}
        >
          {pick(s.headline)}
        </h2>
        <div
          className={`mt-8 space-y-5 text-lg leading-relaxed text-pretty ${
            tone === 'dark' ? 'text-white/75' : 'text-neutral-700 dark:text-neutral-300'
          }`}
        >
          {pick(s.paragraphs).map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------- Specs: the numbers, kept small and last ---------- */
function Specs({ project, s, tone }) {
  const { pick } = useLanguage()
  const t = toneClasses(tone, project.stage)
  const dark = tone === 'dark'
  return (
    <section className={t.className} style={t.style}>
      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <Eyebrow color={project.brand.color} dark={dark}>
          {pick(s.eyebrow)}
        </Eyebrow>
        <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
          {s.items.map((it) => (
            <div key={it.value + pick(it.label)} className="flex flex-col">
              <dd
                className="order-first text-3xl font-semibold tabular-nums sm:text-4xl"
                style={{ letterSpacing: '-0.03em' }}
              >
                {it.value}
              </dd>
              <dt className={`mt-1 text-sm ${dark ? 'text-white/60' : 'text-neutral-500 dark:text-neutral-400'}`}>
                {pick(it.label)}
              </dt>
            </div>
          ))}
        </dl>
        {s.note && (
          <p className={`mt-8 max-w-3xl text-xs ${dark ? 'text-white/50' : 'text-neutral-500 dark:text-neutral-400'}`}>
            {pick(s.note)}
          </p>
        )}
      </div>
    </section>
  )
}

const chapters = {
  hero: Hero,
  statement: Statement,
  fullbleed: FullBleed,
  sticky: StickyStory,
  bento: Bento,
  table: Table,
  rail: Rail,
  collage: Collage,
  glance: Glance,
  note: Note,
  specs: Specs,
}

function Showcase({ project }) {
  return (
    <div className="overflow-x-clip">
      {project.story.map((s, i) => {
        const Chapter = chapters[s.type]
        return Chapter ? <Chapter key={i} project={project} s={s} tone={s.tone ?? 'light'} /> : null
      })}
    </div>
  )
}

export default Showcase
