import { describe, it, expect } from 'vitest'
import { validateCircuit, CircuitValidationError } from '../utils/circuitValidation'
import { Circuit } from '../types/circuit'

describe('Circuit Validation', () => {
  it('accepts valid circuit', () => {
    const circuit: Circuit = {
      id: '123',
      name: 'Bell State',
      numQubits: 2,
      gates: [
        { id: 'g1', type: 'H', qubits: [0], position: { x: 0, y: 0 } },
        { id: 'g2', type: 'CNOT', qubits: [0, 1], position: { x: 100, y: 0 } }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    expect(() => validateCircuit(circuit)).not.toThrow()
  })

  it('rejects out-of-range qubit index', () => {
    const circuit: Circuit = {
      id: '123',
      name: 'Invalid',
      numQubits: 2,
      gates: [{ id: 'g1', type: 'H', qubits: [5], position: { x: 0, y: 0 } }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    expect(() => validateCircuit(circuit)).toThrow(CircuitValidationError)
  })

  it('rejects incorrect gate arity', () => {
    const circuit: Circuit = {
      id: '123',
      name: 'Invalid',
      numQubits: 2,
      gates: [{ id: 'g1', type: 'CNOT', qubits: [0], position: { x: 0, y: 0 } }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    expect(() => validateCircuit(circuit)).toThrow('expected 2 qubits, got 1')
  })

  it('rejects missing parameters for RX gate', () => {
    const circuit: Circuit = {
      id: '123',
      name: 'Invalid',
      numQubits: 1,
      gates: [{ id: 'g1', type: 'RX', qubits: [0], position: { x: 0, y: 0 } }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    expect(() => validateCircuit(circuit)).toThrow('expected 1 parameters, got 0')
  })

  it('accepts parameterized gate with correct params', () => {
    const circuit: Circuit = {
      id: '123',
      name: 'Valid',
      numQubits: 1,
      gates: [{ id: 'g1', type: 'RX', qubits: [0], params: [Math.PI / 2], position: { x: 0, y: 0 } }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    expect(() => validateCircuit(circuit)).not.toThrow()
  })

  it('rejects invalid numQubits', () => {
    const circuit: Circuit = {
      id: '123',
      name: 'Invalid',
      numQubits: 0,
      gates: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    expect(() => validateCircuit(circuit)).toThrow('numQubits must be between 1 and 20')
  })

  it('rejects unknown gate type', () => {
    const circuit: Circuit = {
      id: '123',
      name: 'Invalid',
      numQubits: 1,
      gates: [{ id: 'g1', type: 'UNKNOWN' as any, qubits: [0], position: { x: 0, y: 0 } }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    expect(() => validateCircuit(circuit)).toThrow('Unknown gate type: UNKNOWN')
  })
})
