from app.models.training import CircuitContext
from app.services.circuit_executor import circuit_to_qiskit
from qiskit.quantum_info import Statevector, Pauli
import numpy as np
from typing import Dict, List


def compute_expectation_value(context: CircuitContext) -> float:
    """Compute <ψ|H|ψ> for current parameters"""
    qc = circuit_to_qiskit(context.circuit)
    statevector = Statevector.from_instruction(qc)

    total = 0.0
    for term in context.observable.terms:
        pauli_op = _build_pauli_operator(term.paulis)
        expectation = statevector.expectation_value(pauli_op).real
        total += term.coefficient * expectation

    return float(total)


def compute_gradients_parameter_shift(context: CircuitContext) -> Dict[str, float]:
    """
    Compute gradients using the parameter-shift rule:
    ∂<H>/∂θ = (<H>(θ + π/2) - <H>(θ - π/2)) / 2
    """
    gradients = {}
    shift = np.pi / 2

    for param_name, param in context.parameters.items():
        if not param.isTrainable:
            continue

        original_value = param.value

        _update_parameter_value(context, param_name, original_value + shift)
        loss_plus = compute_expectation_value(context)

        _update_parameter_value(context, param_name, original_value - shift)
        loss_minus = compute_expectation_value(context)

        gradients[param_name] = (loss_plus - loss_minus) / 2.0

        _update_parameter_value(context, param_name, original_value)

    return gradients


def _update_parameter_value(context: CircuitContext, param_name: str, new_value: float):
    """Update parameter value in-place in the context"""
    context.parameters[param_name].value = new_value

    for mapping in context.parameterMappings:
        if mapping.parameterName == param_name:
            for gate in context.circuit.gates:
                if gate.id == mapping.gateId:
                    if gate.params is None:
                        gate.params = []
                    while len(gate.params) <= mapping.paramIndex:
                        gate.params.append(0.0)
                    gate.params[mapping.paramIndex] = new_value


def _build_pauli_operator(paulis: List[str]) -> Pauli:
    """Build Pauli operator from string list (rightmost = qubit 0)"""
    pauli_str = ''.join(reversed(paulis))
    return Pauli(pauli_str)
