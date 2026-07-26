import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { RoundedBox, Image } from '@react-three/drei'
import { Suspense } from 'react'

function PhoneModel({ screen }) {
  const group = useRef()

  useFrame((state) => {
    group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.4
    group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.05
  })

  return (
    <group ref={group}>
      <RoundedBox args={[1.62, 3.3, 0.16]} radius={0.06} smoothness={4}>
        <meshStandardMaterial color="#0d0e12" roughness={0.35} metalness={0.4} />
      </RoundedBox>
      <Image url={screen} position={[0, 0, 0.09]} scale={[1.42, 3.0]} radius={0.14} />
    </group>
  )
}

function Phone3D({ screen }) {
  return (
    <div className="h-80 w-full sm:h-[26rem]">
      <Canvas camera={{ position: [0, 0, 4.6], fov: 40 }}>
        <ambientLight intensity={0.9} />
        <directionalLight position={[3, 4, 3]} intensity={1.1} />
        <directionalLight position={[-3, -2, 2]} intensity={0.4} />
        <Suspense fallback={null}>
          <PhoneModel screen={screen} />
        </Suspense>
      </Canvas>
    </div>
  )
}

export default Phone3D
