from pydantic import BaseModel, Field, field_validator, model_validator
from typing import List, Optional, Literal, Union

GateType = Literal[
    'H', 'X', 'Y', 'Z', 'S', 'T', 'Sdg', 'Tdg',
    'CNOT', 'CZ', 'SWAP', 'Toffoli',
    'RX', 'RY', 'RZ', 'U', 'U1', 'U2', 'U3'
]

class Position(BaseModel):
    x: float
    y: float

class Gate(BaseModel):
    id: str
    type: GateType
    qubits: List[int]
    params: Optional[List[float]] = None
    position: Position

class Circuit(BaseModel):
    id: str
    name: str
    numQubits: int = Field(..., ge=1, le=20)
    gates: List[Gate]
    createdAt: str
    updatedAt: str

    @model_validator(mode='after')
    def validate_gate_qubits(self) -> 'Circuit':
        num_qubits = self.numQubits
        for i, gate in enumerate(self.gates):
            for q in gate.qubits:
                if q < 0 or q >= num_qubits:
                    raise ValueError(f"Gate {i} ({gate.type}): Qubit index {q} out of range [0, {num_qubits-1}]")
        return self


class AddGateOp(BaseModel):
    op: Literal["add_gate"]
    type: GateType
    qubits: List[int]
    params: Optional[List[float]] = None


class RemoveGateOp(BaseModel):
    op: Literal["remove_gate"]
    gate_id: str


class MoveGateOp(BaseModel):
    op: Literal["move_gate"]
    gate_id: str
    to_qubit: int
    to_time_step: int


class SetParamOp(BaseModel):
    op: Literal["set_param"]
    gate_id: str
    params: List[float]


PatchOp = Union[AddGateOp, RemoveGateOp, MoveGateOp, SetParamOp]


class CircuitBuildRequest(BaseModel):
    text: str
    circuit: Circuit


class CircuitPatchResponse(BaseModel):
    action: Literal["patch_circuit", "error"]
    ops: List[dict] = []
    explanation: str
    confidence: float
