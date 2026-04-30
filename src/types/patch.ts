import { GateType } from './circuit'
import { Observable } from './observable'

export type AddGateOp = {
  op: 'add_gate'
  type: GateType
  qubits: number[]
  params?: number[]
}

export type RemoveGateOp = {
  op: 'remove_gate'
  gate_id: string
}

export type MoveGateOp = {
  op: 'move_gate'
  gate_id: string
  to_qubit: number
  to_time_step: number
}

export type SetParamOp = {
  op: 'set_param'
  gate_id: string
  params: number[]
}

export type SetObservableOp = {
  op: 'set_observable'
  observable: Observable
}

export type PatchOp = AddGateOp | RemoveGateOp | MoveGateOp | SetParamOp | SetObservableOp

export interface CircuitPatch {
  action: 'patch_circuit' | 'error'
  ops: PatchOp[]
  explanation: string
  confidence: number
}
