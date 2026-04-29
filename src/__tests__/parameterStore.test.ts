import { describe, it, expect, beforeEach } from 'vitest'
import { useCircuitStore } from '../store/circuitStore'

describe('Parameter Store', () => {
  beforeEach(() => {
    useCircuitStore.getState().clearCircuit()
    useCircuitStore.setState({ parameters: {}, parameterMappings: [] })
  })

  it('creates a trainable parameter', () => {
    useCircuitStore.getState().createParameter('θ_0', Math.PI / 2, true)

    const param = useCircuitStore.getState().parameters['θ_0']
    expect(param.name).toBe('θ_0')
    expect(param.value).toBe(Math.PI / 2)
    expect(param.isTrainable).toBe(true)
  })

  it('updates parameter value', () => {
    useCircuitStore.getState().createParameter('θ_0', 0, true)
    useCircuitStore.getState().updateParameter('θ_0', Math.PI)

    const param = useCircuitStore.getState().parameters['θ_0']
    expect(param.value).toBe(Math.PI)
  })

  it('links gate to parameter', () => {
    useCircuitStore.getState().createParameter('θ_0', Math.PI / 2, true)
    useCircuitStore.getState().addGate({
      type: 'RX',
      qubits: [0],
      params: [0],
      position: { x: 0, y: 0 },
    })

    const gateId = useCircuitStore.getState().circuit.gates[0].id
    useCircuitStore.getState().linkGateToParameter(gateId, 0, 'θ_0')

    const mappings = useCircuitStore.getState().getParametersForGate(gateId)
    expect(mappings).toHaveLength(1)
    expect(mappings[0].parameterName).toBe('θ_0')

    const gate = useCircuitStore.getState().circuit.gates[0]
    expect(gate.params?.[0]).toBe(Math.PI / 2)
  })

  it('updates all linked gates when parameter changes', () => {
    useCircuitStore.getState().createParameter('θ_shared', 0, true)

    useCircuitStore.getState().addGate({
      type: 'RX',
      qubits: [0],
      params: [0],
      position: { x: 0, y: 0 },
    })
    useCircuitStore.getState().addGate({
      type: 'RX',
      qubits: [1],
      params: [0],
      position: { x: 100, y: 100 },
    })

    const gates = useCircuitStore.getState().circuit.gates
    useCircuitStore.getState().linkGateToParameter(gates[0].id, 0, 'θ_shared')
    useCircuitStore.getState().linkGateToParameter(gates[1].id, 0, 'θ_shared')

    useCircuitStore.getState().updateParameter('θ_shared', Math.PI / 2)

    const updatedGates = useCircuitStore.getState().circuit.gates
    expect(updatedGates[0].params?.[0]).toBe(Math.PI / 2)
    expect(updatedGates[1].params?.[0]).toBe(Math.PI / 2)
  })
})
