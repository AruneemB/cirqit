import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StateInspector } from '../components/StateInspector'
import { useCircuitStore } from '../store/circuitStore'

// Mock recharts
vi.mock('recharts', () => ({
  BarChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Bar: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  Legend: () => <div />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

// Mock React Three Fiber
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

describe('StateInspector', () => {
  beforeEach(() => {
    useCircuitStore.getState().clearCircuit()
    useCircuitStore.getState().clearExecution()
  })

  it('shows empty state when no results', () => {
    render(<StateInspector />)
    expect(screen.getByText('No Results Yet')).toBeInTheDocument()
  })

  it('displays results after execution', () => {
    useCircuitStore.setState({
      circuit: {
        id: '123',
        name: 'Test',
        numQubits: 1,
        gates: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      executionResult: {
        circuitId: '123',
        backend: 'statevector',
        statevector: [[1, 0], [0, 0]],
        executedAt: new Date().toISOString(),
      },
    })

    render(<StateInspector />)
    expect(screen.getByText('State Inspector')).toBeInTheDocument()
    expect(screen.getByText(/1 qubit/)).toBeInTheDocument()
  })

  it('shows Bloch sphere only for 1-qubit circuits', () => {
    useCircuitStore.setState({
      circuit: {
        id: '123',
        name: 'Test',
        numQubits: 1,
        gates: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      executionResult: {
        circuitId: '123',
        backend: 'statevector',
        statevector: [[1, 0], [0, 0]],
        executedAt: new Date().toISOString(),
      },
    })

    render(<StateInspector />)
    expect(screen.getByText('Bloch Sphere')).toBeInTheDocument()
  })
})
