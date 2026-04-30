import { CircuitPatch, PatchOp, AddGateOp, RemoveGateOp, MoveGateOp, SetParamOp, SetObservableOp } from '../types/patch'
import { GateType } from '../types/circuit'

export class PatchError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PatchError'
  }
}

const VALID_GATE_TYPES = new Set<GateType>([
  'H', 'X', 'Y', 'Z', 'S', 'T', 'Sdg', 'Tdg',
  'CNOT', 'CZ', 'SWAP', 'Toffoli',
  'RX', 'RY', 'RZ', 'U', 'U1', 'U2', 'U3',
])

export function validatePatch(patch: CircuitPatch): string[] {
  const errors: string[] = []

  if (!Array.isArray(patch.ops)) {
    errors.push('patch.ops must be an array')
    return errors
  }

  for (let i = 0; i < patch.ops.length; i++) {
    const op = patch.ops[i]
    if (!op || typeof op.op !== 'string') {
      errors.push(`ops[${i}]: missing op type`)
      continue
    }

    switch (op.op) {
      case 'add_gate': {
        const g = op as AddGateOp
        if (!g.type || !VALID_GATE_TYPES.has(g.type)) {
          errors.push(`ops[${i}]: unknown gate type "${g.type}"`)
        }
        if (!Array.isArray(g.qubits) || g.qubits.length === 0) {
          errors.push(`ops[${i}]: qubits must be a non-empty array`)
        }
        break
      }
      case 'remove_gate': {
        const r = op as RemoveGateOp
        if (!r.gate_id || typeof r.gate_id !== 'string') {
          errors.push(`ops[${i}]: gate_id must be a non-empty string`)
        }
        break
      }
      case 'move_gate': {
        const m = op as MoveGateOp
        if (!m.gate_id) errors.push(`ops[${i}]: gate_id required`)
        if (typeof m.to_qubit !== 'number') errors.push(`ops[${i}]: to_qubit must be a number`)
        if (typeof m.to_time_step !== 'number') errors.push(`ops[${i}]: to_time_step must be a number`)
        break
      }
      case 'set_param': {
        const s = op as SetParamOp
        if (!s.gate_id) errors.push(`ops[${i}]: gate_id required`)
        if (!Array.isArray(s.params)) errors.push(`ops[${i}]: params must be an array`)
        break
      }
      case 'set_observable': {
        const o = op as SetObservableOp
        if (!o.observable || !Array.isArray(o.observable.terms)) {
          errors.push(`ops[${i}]: observable.terms must be an array`)
        }
        break
      }
      default:
        errors.push(`ops[${i}]: unknown op "${(op as PatchOp).op}"`)
    }
  }

  return errors
}

export function parsePatch(raw: unknown): CircuitPatch {
  if (!raw || typeof raw !== 'object') {
    throw new PatchError('Response is not a JSON object')
  }
  if (Array.isArray(raw)) {
    throw new PatchError('Patch must be an object, not an array')
  }

  const obj = raw as Record<string, unknown>

  const action = obj.action
  if (action !== 'patch_circuit' && action !== 'error') {
    throw new PatchError(`Invalid patch action: "${action}". Must be "patch_circuit" or "error"`)
  }

  if (!Array.isArray(obj.ops)) {
    throw new PatchError('patch.ops must be an array')
  }

  const confidence = typeof obj.confidence === 'number'
    ? (Number.isFinite(obj.confidence) ? obj.confidence : 1.0)
    : 1.0
  const explanation = typeof obj.explanation === 'string' ? obj.explanation : ''
  const ops = obj.ops as PatchOp[]

  const patch: CircuitPatch = { action, ops, explanation, confidence }

  if (action === 'patch_circuit') {
    const errors = validatePatch(patch)
    if (errors.length > 0) {
      throw new PatchError(`Invalid patch: ${errors.join('; ')}`)
    }
  }

  return patch
}
