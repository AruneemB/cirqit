import { CircuitPatch, PatchOp, Gate, GateType } from '../types/circuit'
import { useCircuitStore } from '../store/circuitStore'

// Wire spacing matches CircuitCanvas constants: firstWireY=50, wireSpacing=80
const FIRST_WIRE_Y = 50
const WIRE_SPACING = 80
const GATE_X_STEP = 100
const GATE_START_X = 100

function computeGatePosition(qubitIndex: number): { x: number; y: number } {
  const store = useCircuitStore.getState()
  const gates = store.circuit.gates

  const gatesOnQubit = gates.filter((g) => g.qubits.includes(qubitIndex))
  const maxX = gatesOnQubit.reduce((acc, g) => Math.max(acc, g.position.x), GATE_START_X - GATE_X_STEP)

  return {
    x: maxX + GATE_X_STEP,
    y: FIRST_WIRE_Y + qubitIndex * WIRE_SPACING,
  }
}

function applyOp(op: PatchOp): void {
  const store = useCircuitStore.getState()

  if (op.op === 'add_gate') {
    const primaryQubit = op.qubits[0] ?? 0
    const position = computeGatePosition(primaryQubit)
    const gate: Omit<Gate, 'id'> = {
      type: op.type as GateType,
      qubits: op.qubits,
      params: op.params,
      position,
    }
    store.addGate(gate)
    return
  }

  if (op.op === 'remove_gate') {
    store.removeGate(op.gate_id)
    return
  }

  if (op.op === 'move_gate') {
    const position = {
      x: GATE_START_X + op.to_time_step * GATE_X_STEP,
      y: FIRST_WIRE_Y + op.to_qubit * WIRE_SPACING,
    }
    store.updateGate(op.gate_id, { position })
    return
  }

  if (op.op === 'set_param') {
    store.updateGate(op.gate_id, { params: op.params })
    return
  }
}

export function applyPatch(patch: CircuitPatch): void {
  if (patch.action !== 'patch_circuit') {
    throw new Error(`Cannot apply patch with action: ${patch.action}`)
  }
  for (const op of patch.ops) {
    applyOp(op as PatchOp)
  }
}
