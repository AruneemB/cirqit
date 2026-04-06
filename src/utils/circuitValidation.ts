import { Circuit, Gate } from '../types/circuit'

export class CircuitValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CircuitValidationError'
  }
}

export function validateCircuit(circuit: Circuit): void {
  if (circuit.numQubits < 1 || circuit.numQubits > 20) {
    throw new CircuitValidationError('numQubits must be between 1 and 20')
  }

  circuit.gates.forEach((gate, idx) => {
    validateGate(gate, circuit.numQubits, idx)
  })
}

export function validateGate(gate: Gate, numQubits: number, index: number): void {
  // Validate qubit indices
  gate.qubits.forEach(q => {
    if (q < 0 || q >= numQubits) {
      throw new CircuitValidationError(
        `Gate ${index} (${gate.type}): qubit index ${q} out of range [0, ${numQubits - 1}]`
      )
    }
  })

  // Validate gate arity
  const expectedQubits = getExpectedQubitCount(gate.type)
  if (gate.qubits.length !== expectedQubits) {
    throw new CircuitValidationError(
      `Gate ${index} (${gate.type}): expected ${expectedQubits} qubits, got ${gate.qubits.length}`
    )
  }

  // Validate parameters
  const expectedParams = getExpectedParamCount(gate.type)
  const actualParams = gate.params?.length ?? 0
  if (actualParams !== expectedParams) {
    throw new CircuitValidationError(
      `Gate ${index} (${gate.type}): expected ${expectedParams} parameters, got ${actualParams}`
    )
  }
}

function getExpectedQubitCount(type: string): number {
  const singleQubitGates = ['H', 'X', 'Y', 'Z', 'S', 'T', 'Sdg', 'Tdg', 'RX', 'RY', 'RZ', 'U', 'U1', 'U2', 'U3']
  const twoQubitGates = ['CNOT', 'CZ', 'SWAP']
  const threeQubitGates = ['Toffoli']

  if (singleQubitGates.includes(type)) return 1
  if (twoQubitGates.includes(type)) return 2
  if (threeQubitGates.includes(type)) return 3
  throw new CircuitValidationError(`Unknown gate type: ${type}`)
}

function getExpectedParamCount(type: string): number {
  const parameterizedGates: Record<string, number> = {
    'RX': 1, 'RY': 1, 'RZ': 1,
    'U1': 1, 'U2': 2, 'U3': 3, 'U': 3
  }
  return parameterizedGates[type] ?? 0
}
