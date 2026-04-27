import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CircuitPatch } from '../types/circuit'

// vi.hoisted ensures these are available when vi.mock factory runs (before module imports)
const mocks = vi.hoisted(() => ({
  addGate: vi.fn(),
  removeGate: vi.fn(),
  updateGate: vi.fn(),
}))

vi.mock('../store/circuitStore', () => ({
  useCircuitStore: {
    getState: () => ({
      circuit: {
        gates: [
          { id: 'existing-1', type: 'H', qubits: [0], params: undefined, position: { x: 100, y: 50 } },
        ],
      },
      addGate: mocks.addGate,
      removeGate: mocks.removeGate,
      updateGate: mocks.updateGate,
    }),
  },
}))

// Import AFTER mocks are registered
const { applyPatch } = await import('../services/circuitPatch')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('applyPatch', () => {
  it('throws for non patch_circuit action', () => {
    const patch: CircuitPatch = { action: 'error', ops: [], explanation: 'fail', confidence: 0 }
    expect(() => applyPatch(patch)).toThrow('Cannot apply patch with action: error')
  })

  it('calls addGate for add_gate op', () => {
    const patch: CircuitPatch = {
      action: 'patch_circuit',
      ops: [{ op: 'add_gate', type: 'X', qubits: [1] }],
      explanation: 'Added X',
      confidence: 0.9,
    }
    applyPatch(patch)
    expect(mocks.addGate).toHaveBeenCalledOnce()
    const call = mocks.addGate.mock.calls[0][0]
    expect(call.type).toBe('X')
    expect(call.qubits).toEqual([1])
    expect(call.position).toBeDefined()
  })

  it('calls removeGate for remove_gate op', () => {
    const patch: CircuitPatch = {
      action: 'patch_circuit',
      ops: [{ op: 'remove_gate', gate_id: 'existing-1' }],
      explanation: 'Removed gate',
      confidence: 1.0,
    }
    applyPatch(patch)
    expect(mocks.removeGate).toHaveBeenCalledWith('existing-1')
  })

  it('calls updateGate for set_param op', () => {
    const patch: CircuitPatch = {
      action: 'patch_circuit',
      ops: [{ op: 'set_param', gate_id: 'existing-1', params: [1.57] }],
      explanation: 'Set theta',
      confidence: 1.0,
    }
    applyPatch(patch)
    expect(mocks.updateGate).toHaveBeenCalledWith('existing-1', { params: [1.57] })
  })

  it('calls updateGate with computed position for move_gate op', () => {
    const patch: CircuitPatch = {
      action: 'patch_circuit',
      ops: [{ op: 'move_gate', gate_id: 'existing-1', to_qubit: 2, to_time_step: 1 }],
      explanation: 'Moved gate',
      confidence: 1.0,
    }
    applyPatch(patch)
    expect(mocks.updateGate).toHaveBeenCalledWith('existing-1', {
      position: { x: 200, y: 210 },
    })
  })

  it('applies multiple ops in order', () => {
    const patch: CircuitPatch = {
      action: 'patch_circuit',
      ops: [
        { op: 'add_gate', type: 'H', qubits: [0] },
        { op: 'add_gate', type: 'CNOT', qubits: [0, 1] },
      ],
      explanation: 'Bell state',
      confidence: 0.95,
    }
    applyPatch(patch)
    expect(mocks.addGate).toHaveBeenCalledTimes(2)
  })
})
