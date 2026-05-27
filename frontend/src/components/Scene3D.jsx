import React, { Suspense, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'

// Error boundary to catch Three.js crashes gracefully
class Scene3DErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch(error) {
    console.warn('3D scene failed:', error)
  }
  render() {
    if (this.state.hasError) return null
    return this.props.children
  }
}

function AnimatedSphere() {
  const meshRef = useRef()
  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color="#6366f1" wireframe />
    </mesh>
  )
}

export default function Scene3D({ height = '100vh' }) {
  return (
    <Scene3DErrorBoundary>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height, zIndex: 0 }}>
        <Suspense fallback={null}>
          <Canvas camera={{ position: [0, 0, 5] }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <Stars radius={100} depth={50} count={3000} factor={4} fade />
            <AnimatedSphere />
            <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
          </Canvas>
        </Suspense>
      </div>
    </Scene3DErrorBoundary>
  )
}