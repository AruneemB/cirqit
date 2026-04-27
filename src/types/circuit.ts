export type GateType =
  | 'H' | 'X' | 'Y' | 'Z' | 'S' | 'T' | 'Sdg' | 'Tdg'
  | 'CNOT' | 'CZ' | 'SWAP' | 'Toffoli'
  | 'RX' | 'RY' | 'RZ'
  | 'U' | 'U1' | 'U2' | 'U3'

export interface Gate {
  id: string              // UUID
  type: GateType
  qubits: number[]        // Indices of qubits this gate acts on (0-indexed)
  params?: number[]       // For parameterized gates (RX, RY, RZ, U gates)
  position: {             // Position on the canvas (for React Flow)
    x: number
    y: number
  }
}

export interface Circuit {
  id: string              // UUID
  name: string
  numQubits: number
  gates: Gate[]
  createdAt: string       // ISO 8601
  updatedAt: string       // ISO 8601
}

export interface ExecutionResult {
  circuitId: string
  backend: 'statevector' | 'qasm' | 'aer_noise' | 'ibmq' | 'braket'
  statevector?: number[][]  // Complex numbers as [real, imag]
  counts?: Record<string, number>  // Measurement outcomes
  executedAt: string
}

export type PatchOp =
  | { op: 'add_gate'; type: GateType; qubits: number[]; params?: number[] }
  | { op: 'remove_gate'; gate_id: string }
  | { op: 'move_gate'; gate_id: string; to_qubit: number; to_time_step: number }
  | { op: 'set_param'; gate_id: string; params: number[] }

export interface CircuitPatch {
  action: 'patch_circuit' | 'error'
  ops: PatchOp[]
  explanation: string
  confidence: number
}
