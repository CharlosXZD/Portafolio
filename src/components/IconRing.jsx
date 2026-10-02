import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture, Float, RoundedBox } from '@react-three/drei'
import { NearestFilter } from 'three'

const icons = [
  {
    label: 'Tiger Price',
    color: '#0a0a0a',
    mark: '/icons/tiger-price-mark.png',
  },
  {
    label: 'Tootor',
    color: '#2196f3',
    mark: '/icons/tootor-mark.png',
  },
  {
    label: 'Project Wellness',
    color: '#4f9a83',
    background: '/icons/project-wellness.png',
    mark: '/icons/project-wellness-mark.png',
  },
  {
    label: 'Elementa',
    color: '#1b1636',
    mark: '/icons/elementa-mark.png',
    // Pixel art: sample with nearest-neighbor so it stays crisp, not blurry.
    pixel: true,
  },
]

const radius = 1.35
const cardSize = 1.05
const cardDepth = 0.24
const cardRadius = 0.1

// Alpha-tested cutout plane instead of alpha-blended: this makes the layer behave like
// normal opaque geometry (proper depth test + write), which is what avoids the transparency
// sorting/z-fighting glitches you get from stacking multiple alpha-blended planes close together.
function IconLayer({ url, z, scale, offset = [0, 0], color, renderOrder, pixel = false }) {
  const texture = useTexture(url)
  if (pixel && texture.magFilter !== NearestFilter) {
    texture.magFilter = NearestFilter
    texture.minFilter = NearestFilter
    texture.generateMipmaps = false
    texture.needsUpdate = true
  }
  return (
    <mesh position={[offset[0], offset[1], z]} renderOrder={renderOrder}>
      <planeGeometry args={[scale, scale]} />
      <meshBasicMaterial map={texture} color={color} alphaTest={0.5} transparent={false} />
    </mesh>
  )
}

function IconCard({ icon, angle }) {
  const x = Math.sin(angle) * radius
  const z = Math.cos(angle) * radius
  const frontZ = cardDepth / 2

  return (
    <Float speed={2} rotationIntensity={0.15} floatIntensity={0.7}>
      <group position={[x, 0, z]} rotation={[0, angle, 0]}>
        <RoundedBox args={[cardSize, cardSize, cardDepth]} radius={cardRadius} smoothness={4}>
          <meshStandardMaterial color={icon.color} roughness={0.4} metalness={0.3} />
        </RoundedBox>

        {/* real background artwork for icons that have one (e.g. Project Wellness's bars) */}
        {icon.background && (
          <IconLayer
            url={icon.background}
            z={frontZ + 0.01}
            scale={cardSize * 0.94}
            renderOrder={1}
          />
        )}

        {/* duplicated + offset + tinted copy behind the mark, for a subtle embossed/premium depth cue */}
        <IconLayer
          url={icon.mark}
          z={frontZ + 0.03}
          scale={cardSize * (icon.pixel ? 0.78 : 0.9)}
          offset={[0.025, -0.025]}
          color="black"
          renderOrder={2}
          pixel={icon.pixel}
        />
        <IconLayer url={icon.mark} z={frontZ + 0.05} scale={cardSize * (icon.pixel ? 0.78 : 0.9)} renderOrder={3} pixel={icon.pixel} />
      </group>
    </Float>
  )
}

function IconRing() {
  const group = useRef()

  useFrame((_, delta) => {
    group.current.rotation.y += delta * 0.18
  })

  return (
    <group ref={group}>
      {icons.map((icon, i) => {
        const angle = (i / icons.length) * Math.PI * 2
        return <IconCard key={icon.label} icon={icon} angle={angle} />
      })}
    </group>
  )
}

export default IconRing
