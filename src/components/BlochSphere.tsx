import React, { useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sphere, Text, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'

interface BlochSphereProps {
  statevector: number[][] // [[real, imag], [real, imag]]
}

function statevectorToBlochAngles(statevector: number[][]): { theta: number; phi: number } {
  const [alphaRe, alphaIm] = statevector[0]
  const [betaRe, betaIm] = statevector[1]

  const alphaMag = Math.sqrt(alphaRe ** 2 + alphaIm ** 2)
  const theta = 2 * Math.acos(Math.min(1, alphaMag))
  const phi = Math.atan2(betaIm, betaRe) - Math.atan2(alphaIm, alphaRe)

  return { theta, phi }
}

const StateVector: React.FC<{ theta: number; phi: number }> = ({ theta, phi }) => {
  const meshRef = useRef<THREE.Group>(null)

  const x = Math.sin(theta) * Math.cos(phi)
  const z = Math.sin(theta) * Math.sin(phi)
  const y = Math.cos(theta)

  return (
    <group ref={meshRef}>
      <line>
        <bufferGeometry attach="geometry">
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([0, 0, 0, x, y, z])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial attach="material" color="#00D9FF" linewidth={3} />
      </line>
      <Sphere args={[0.05]} position={[x, y, z]}>
        <meshStandardMaterial color="#00D9FF" emissive="#00D9FF" emissiveIntensity={2} />
      </Sphere>
    </group>
  )
}

export const BlochSphere: React.FC<BlochSphereProps> = ({ statevector }) => {
  const { theta, phi } = statevectorToBlochAngles(statevector)

  return (
    <div className="w-full h-64 bg-surface/20 rounded-xl overflow-hidden">
      <Canvas>
        <PerspectiveCamera makeDefault position={[3, 2, 3]} />
        <OrbitControls enableZoom={false} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />

        {/* Wireframe sphere */}
        <Sphere args={[1, 32, 32]}>
          <meshStandardMaterial color="#A78BFA" transparent opacity={0.15} wireframe />
        </Sphere>

        <axesHelper args={[1.5]} />

        <StateVector theta={theta} phi={phi} />

        <Text position={[1.7, 0, 0]} fontSize={0.2} color="#9CA3AF">X</Text>
        <Text position={[0, 1.7, 0]} fontSize={0.2} color="#9CA3AF">|0⟩</Text>
        <Text position={[0, -1.7, 0]} fontSize={0.2} color="#9CA3AF">|1⟩</Text>
      </Canvas>
    </div>
  )
}

export { statevectorToBlochAngles }
