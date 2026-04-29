from pydantic import BaseModel
from typing import List, Dict, Literal
from app.models.circuit import Circuit


class Parameter(BaseModel):
    name: str
    value: float
    isTrainable: bool
    gateIds: List[str]


class PauliTerm(BaseModel):
    coefficient: float
    paulis: List[Literal['I', 'X', 'Y', 'Z']]


class Observable(BaseModel):
    name: str
    terms: List[PauliTerm]


class ParameterMapping(BaseModel):
    gateId: str
    paramIndex: int
    parameterName: str


class CircuitContext(BaseModel):
    circuit: Circuit
    parameters: Dict[str, Parameter]
    observable: Observable
    parameterMappings: List[ParameterMapping]
