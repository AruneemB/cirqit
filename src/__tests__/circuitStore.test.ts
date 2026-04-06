import { describe, it, expect, beforeEach } from 'vitest'
import { useCircuitStore } from '../store/circuitStore'

describe('Circuit Store', () => {
  beforeEach(() => {
    useCircuitStore.getState().clearCircuit()
  })

  it('adds a gate correctly', () => {
    const gate = { type: 'H' as const, qubits: [0], position: { x: 0, y: 0 } }
    useCircuitStore.getState().addGate(gate)
    
    const gates = useCircuitStore.getState().circuit.gates
    expect(gates).toHaveLength(1)
    expect(gates[0].type).toBe('H')
  })

  it('removes a gate correctly', () => {
    useCircuitStore.getState().addGate({ type: 'H' as const, qubits: [0], position: { x: 0, y: 0 } })
    const id = useCircuitStore.getState().circuit.gates[0].id
    useCircuitStore.getState().removeGate(id)
    
    expect(useCircuitStore.getState().circuit.gates).toHaveLength(0)
  })
})
