import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import IconRing from './IconRing.jsx'

function Hero3D() {
  return (
    <div className="relative h-72 w-full sm:h-96">
      <Canvas camera={{ position: [0, 0.5, 4.2], fov: 42 }}>
        <ambientLight intensity={0.9} />
        <directionalLight position={[3, 4, 2]} intensity={1.1} />
        <Suspense fallback={null}>
          <IconRing />
        </Suspense>
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 2 - 0.3}
          maxPolarAngle={Math.PI / 2 + 0.3}
        />
      </Canvas>
    </div>
  )
}

export default Hero3D
