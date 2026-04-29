import { describe, it, expect, beforeEach } from 'vitest'
import { useCircuitStore } from '../store/circuitStore'
import { serializeCircuitContext, validateCircuitContext } from '../utils/contextSerializer'

describe('CircuitContextSerializer', () => {
  beforeEach(() => {
    useCircuitStore.getState().clearCircuit()
    useCircuitStore.setState({ parameters: {}, parameterMappings: [], observable: null })
  })

  it('serializes valid circuit context', () => {
    useCircuitStore.getState().addGate({
      type: 'RX',
      qubits: [0],
      params: [0],
      position: { x: 0, y: 0 },
    })

    useCircuitStore.getState().createParameter('θ_0', 0, true)

    const gateId = useCircuitStore.getState().circuit.gates[0].id
    useCircuitStore.getState().linkGateToParameter(gateId, 0, 'θ_0')

    useCircuitStore.getState().setObservable({
      name: 'H',
      terms: [{ coefficient: 1.0, paulis: ['Z'] }],
    })

    const context = serializeCircuitContext()

    expect(context.circuit.gates).toHaveLength(1)
    expect(context.parameters['θ_0']).toBeDefined()
    expect(context.observable.terms).toHaveLength(1)
    expect(context.parameterMappings).toHaveLength(1)
  })

  it('throws error when observable is missing', () => {
    useCircuitStore.getState().addGate({
      type: 'H',
      qubits: [0],
      position: { x: 0, y: 0 },
    })

    expect(() => serializeCircuitContext()).toThrow('Observable not defined')
  })

  it('validates circuit context', () => {
    const context = serializeCircuitContext()

    const errors = validateCircuitContext(context)
    expect(errors).toContain('Circuit has no gates')
    expect(errors).toContain('No trainable parameters defined')
  })
})
