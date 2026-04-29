import { useCircuitStore } from '../store/circuitStore'
import { CircuitContext } from '../types/training'

export function serializeCircuitContext(): CircuitContext {
  const state = useCircuitStore.getState()

  if (!state.observable && state.circuit.gates.length > 0) {
    throw new Error('Observable not defined. Please specify a Hamiltonian.')
  }

  const parameterizedGates = state.circuit.gates.filter((g) =>
    ['RX', 'RY', 'RZ'].includes(g.type)
  )

  const allLinked = parameterizedGates.every((gate) => {
    const mappings = state.getParametersForGate(gate.id)
    return mappings.length > 0
  })

  if (!allLinked) {
    throw new Error('Some parameterized gates are not linked to trainable parameters.')
  }

  return {
    circuit: state.circuit,
    parameters: state.parameters,
    observable: state.observable ?? { name: '', terms: [] },
    parameterMappings: state.parameterMappings,
  }
}

export function validateCircuitContext(context: CircuitContext): string[] {
  const errors: string[] = []

  if (context.circuit.gates.length === 0) {
    errors.push('Circuit has no gates')
  }

  if (!context.parameters || !Object.values(context.parameters).some((p) => p && p.isTrainable)) {
    errors.push('No trainable parameters defined')
  }

  if (context.observable.terms.length === 0) {
    errors.push('Observable has no terms')
  }

  context.parameterMappings.forEach((mapping) => {
    const gateExists = context.circuit.gates.some((g) => g.id === mapping.gateId)
    if (!gateExists) {
      errors.push(`Parameter mapping references non-existent gate: ${mapping.gateId}`)
    }

    const paramExists = context.parameters[mapping.parameterName]
    if (!paramExists) {
      errors.push(`Parameter mapping references non-existent parameter: ${mapping.parameterName}`)
    }
  })

  return errors
}
