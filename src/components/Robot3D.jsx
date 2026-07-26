import { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import * as THREE from 'three'

function RobotModel({ url }) {
  const rawGeometry = useLoader(STLLoader, url)
  const group = useRef()

  const { geometry, scale } = useMemo(() => {
    const geo = rawGeometry.clone()
    geo.computeBoundingBox()
    const box = geo.boundingBox
    const center = new THREE.Vector3()
    box.getCenter(center)
    geo.translate(-center.x, -center.y, -center.z)
    const size = new THREE.Vector3()
    box.getSize(size)
    const maxDim = Math.max(size.x, size.y, size.z) || 1
    return { geometry: geo, scale: 2.4 / maxDim }
  }, [rawGeometry])

  useFrame((_, delta) => {
    group.current.rotation.z += delta * 0.2
  })

  return (
    <group ref={group} scale={scale} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh geometry={geometry}>
        {geometry.hasColors ? (
          <meshStandardMaterial vertexColors roughness={0.5} metalness={0.25} />
        ) : (
          <meshStandardMaterial color="#c4c4c8" roughness={0.5} metalness={0.3} />
        )}
      </mesh>
    </group>
  )
}

function Robot3D({ url }) {
  return (
    <div className="h-80 w-full sm:h-[26rem]">
      <Canvas camera={{ position: [2.6, 2, 3.6], fov: 42 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[3, 4, 3]} intensity={1.2} />
        <directionalLight position={[-3, 2, -2]} intensity={0.4} />
        <Suspense
          fallback={
            <mesh>
              <boxGeometry args={[0.01, 0.01, 0.01]} />
            </mesh>
          }
        >
          <RobotModel url={url} />
        </Suspense>
        <OrbitControls enableZoom enablePan={false} />
      </Canvas>
    </div>
  )
}

export default Robot3D
