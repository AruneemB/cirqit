import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { statevectorToBlochAngles } from '../components/BlochSphere'

// Mock React Three Fiber - happy-dom doesn't support WebGL
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => <div data-testid="canvas">{children}</div>,
  useFrame: vi.fn(),
}))

vi.mock('@react-three/drei', () => ({
  OrbitControls: () => null,
  Sphere: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  Text: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  PerspectiveCamera: () => null,
}))

vi.mock('three', () => ({
  Group: class {},
  Float32Array: globalThis.Float32Array,
}))

describe('BlochSphere', () => {
  it('renders without crashing', async () => {
    const { BlochSphere } = await import('../components/BlochSphere')
    const { container } = render(<BlochSphere statevector={[[1, 0], [0, 0]]} />)
    expect(container).toBeInTheDocument()
  })

  it('renders canvas element', async () => {
    const { BlochSphere } = await import('../components/BlochSphere')
    const { getByTestId } = render(<BlochSphere statevector={[[1, 0], [0, 0]]} />)
    expect(getByTestId('canvas')).toBeInTheDocument()
  })
})

describe('statevectorToBlochAngles', () => {
  it('maps |0⟩ state to north pole (theta=0)', () => {
    const { theta } = statevectorToBlochAngles([[1, 0], [0, 0]])
    expect(theta).toBeCloseTo(0)
  })

  it('maps |1⟩ state to south pole (theta=π)', () => {
    const { theta } = statevectorToBlochAngles([[0, 0], [1, 0]])
    expect(theta).toBeCloseTo(Math.PI)
  })

  it('maps |+⟩ state to equator (theta=π/2)', () => {
    const sqrt2inv = 1 / Math.sqrt(2)
    const { theta } = statevectorToBlochAngles([[sqrt2inv, 0], [sqrt2inv, 0]])
    expect(theta).toBeCloseTo(Math.PI / 2)
  })

  it('maps |+⟩ state phi to 0', () => {
    const sqrt2inv = 1 / Math.sqrt(2)
    const { phi } = statevectorToBlochAngles([[sqrt2inv, 0], [sqrt2inv, 0]])
    expect(phi).toBeCloseTo(0)
  })

  it('maps |i⟩ state correctly (phi=π/2)', () => {
    const sqrt2inv = 1 / Math.sqrt(2)
    // |i⟩ = (1/√2)|0⟩ + (i/√2)|1⟩
    const { theta, phi } = statevectorToBlochAngles([[sqrt2inv, 0], [0, sqrt2inv]])
    expect(theta).toBeCloseTo(Math.PI / 2)
    expect(phi).toBeCloseTo(Math.PI / 2)
  })
})
