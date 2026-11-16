import DieSprite from '../games/elementa/components/DieSprite.jsx'

// The robot has no app logo, so its tile gets a drawn line-following track instead
function RobotGlyph() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full p-[8%]" aria-hidden="true">
      <path
        d="M0 74 C 24 74, 28 36, 50 40 S 80 72, 100 30"
        fill="none"
        stroke="white"
        strokeWidth="6"
        strokeLinecap="round"
        opacity="0.9"
      />
      <g transform="translate(50 40) rotate(-10)">
        <rect x="-22" y="-19" width="10" height="13" rx="3" fill="#3a1d00" />
        <rect x="12" y="-19" width="10" height="13" rx="3" fill="#3a1d00" />
        <rect x="-22" y="6" width="10" height="13" rx="3" fill="#3a1d00" />
        <rect x="12" y="6" width="10" height="13" rx="3" fill="#3a1d00" />
        <rect x="-16" y="-14" width="32" height="28" rx="7" fill="white" />
        <circle cx="0" cy="0" r="4" fill="#ca6a04" />
      </g>
    </svg>
  )
}

// Elementa has no logo file: its tile is one of the game's own pixel dice.
function ElementaGlyph() {
  return (
    <div className="relative h-full w-full p-[16%]">
      <div className="relative h-full w-full">
        <DieSprite
          tier="d20"
          size="100%"
          top="#9a7cf0"
          bottom="#6a4fd6"
          rim="#d6c8ff"
          shade="#2f2168"
          facet="#5a41c0"
        />
      </div>
    </div>
  )
}

// Ohmstead has no logo yet: its tile is an isometric block on a belt
function OhmsteadGlyph() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full p-[14%]" aria-hidden="true">
      <g transform="translate(50 50) scale(1.12) translate(-50 -52)">
        <path d="M50 14 L86 34 L50 54 L14 34 Z" fill="#ffd9a0" />
        <path d="M14 34 L50 54 L50 90 L14 70 Z" fill="#e9962f" />
        <path d="M86 34 L50 54 L50 90 L86 70 Z" fill="#b8651a" />
        <path d="M50 24 L72 34 L50 44 L28 34 Z" fill="#3a1d00" />
        <path d="M50 27 L66 34 L50 41 L34 34 Z" fill="#5a3210" />
        <circle cx="50" cy="34" r="5.6" fill="#5be3ff" opacity="0.28" />
        <circle cx="50" cy="34" r="3.4" fill="#7ff0ff" />
        <path d="M20 44 L44 56 L44 60 L20 48 Z" fill="#7a3f0b" />
        <path d="M20 52 L44 64 L44 68 L20 56 Z" fill="#7a3f0b" />
      </g>
    </svg>
  )
}

// A project's logo as an app-icon tile, in its own brand color
function BrandTile({ project, className = '', shadow = true }) {
  const { color, tile, mark, background, glyph } = project.brand

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-[22%] ring-1 ring-black/5 ${className}`}
      style={{
        backgroundColor: tile ?? color,
        boxShadow: shadow ? `0 24px 48px -16px ${color}80` : undefined,
      }}
    >
      {background && (
        <img src={background} alt="" className="absolute inset-0 h-full w-full object-cover" />
      )}
      {mark ? (
        <img
          src={mark}
          alt={`${project.title} logo`}
          className="relative h-full w-full object-contain p-[14%] drop-shadow-sm"
        />
      ) : glyph === 'elementa' ? (
        <ElementaGlyph />
      ) : glyph === 'ohmstead' ? (
        <OhmsteadGlyph />
      ) : (
        <RobotGlyph />
      )}
    </div>
  )
}

export default BrandTile
