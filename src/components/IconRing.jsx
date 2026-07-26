import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Image, Float, RoundedBox } from '@react-three/drei'

const icons = [
  { src: '/icons/tiger-price.png', label: 'Tiger Price', color: '#0a0a0a' },
  { src: '/icons/tootor.png', label: 'Tootor', color: '#2196f3' },
  {
    src: '/icons/project-wellness-mark.png',
    label: 'Project Wellness',
    color: '#4f9a83',
  },
]

const radius = 1.35
const cardSize = 1.05
const cardDepth = 0.24
const cardRadius = 0.1

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
        {/* duplicated + offset + tinted copy behind the mark, for a subtle embossed/premium depth cue */}
        <Image
          url={icon.src}
          position={[0.025, -0.025, frontZ + 0.005]}
          scale={cardSize * 0.96}
          radius={cardRadius}
          color="black"
          transparent
        />
        <Image
          url={icon.src}
          position={[0, 0, frontZ + 0.012]}
          scale={cardSize * 0.96}
          radius={cardRadius}
          transparent
        />
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
