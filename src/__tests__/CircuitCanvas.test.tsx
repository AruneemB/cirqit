import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, act } from '@testing-library/react'
import { CircuitCanvasWrapper } from '../components/CircuitCanvas'
import { executeStatevector } from '../services/api'
import { useCircuitStore } from '../store/circuitStore'

// Mock the API
vi.mock('../services/api', () => ({
  executeStatevector: vi.fn(),
}))

describe('CircuitCanvas', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useCircuitStore.getState().clearCircuit()
  })

  it('renders without crashing', () => {
    // Suppress React Flow ResizeObserver warning in test environment
    const originalResizeObserver = window.ResizeObserver
    window.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    }

    const { container } = render(<CircuitCanvasWrapper />)
    expect(container).toBeInTheDocument()

    window.ResizeObserver = originalResizeObserver
  })

  it('triggers execution when gates change', async () => {
    vi.useFakeTimers()
    const mockResult = {
      circuitId: 'test-id',
      backend: 'statevector',
      executedAt: new Date().toISOString(),
      statevector: [[1, 0], [0, 0]],
    }
    ;(executeStatevector as any).mockResolvedValue(mockResult)

    const { getByText } = render(<CircuitCanvasWrapper />)

    // Add a gate to trigger useEffect
    act(() => {
      useCircuitStore.getState().addGate({
        type: 'H',
        qubits: [0],
        position: { x: 100, y: 100 },
      })
    })

    // Fast-forward debounce timeout
    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(executeStatevector).toHaveBeenCalled()
    
    // Wait for promise resolution
    await act(async () => {
      await Promise.resolve()
    })

    expect(useCircuitStore.getState().executionResult).toEqual(mockResult)
    
    // Check if status is rendered
    expect(getByText(/Simulation Ready/)).toBeInTheDocument()

    vi.useRealTimers()
  })
})
