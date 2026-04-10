from qiskit import QuantumCircuit
from qiskit_aer import Aer
from app.models.circuit import Circuit, Gate
import numpy as np

def circuit_to_qiskit(circuit: Circuit) -> QuantumCircuit:
    """Convert Circuit IR to Qiskit QuantumCircuit"""
    qc = QuantumCircuit(circuit.numQubits)

    for gate in circuit.gates:
        _apply_gate(qc, gate)

    return qc

def _apply_gate(qc: QuantumCircuit, gate: Gate):
    """Apply a single gate to the Qiskit circuit"""
    g_type = gate.type
    qubits = gate.qubits
    params = gate.params or []

    if g_type == 'H': qc.h(qubits[0])
    elif g_type == 'X': qc.x(qubits[0])
    elif g_type == 'Y': qc.y(qubits[0])
    elif g_type == 'Z': qc.z(qubits[0])
    elif g_type == 'S': qc.s(qubits[0])
    elif g_type == 'T': qc.t(qubits[0])
    elif g_type == 'CNOT': qc.cx(qubits[0], qubits[1])
    elif g_type == 'CZ': qc.cz(qubits[0], qubits[1])
    elif g_type == 'SWAP': qc.swap(qubits[0], qubits[1])
    elif g_type == 'RX': qc.rx(params[0], qubits[0])
    elif g_type == 'RY': qc.ry(params[0], qubits[0])
    elif g_type == 'RZ': qc.rz(params[0], qubits[0])

def execute_statevector(circuit: Circuit):
    """Run statevector simulation and return amplitudes/probabilities"""
    qc = circuit_to_qiskit(circuit)

    # Use Aer's statevector simulator
    backend = Aer.get_backend('statevector_simulator')
    job = backend.run(qc)
    result = job.result()

    statevector = result.get_statevector().data

    # Convert to list of [real, imag] pairs for JSON serialization
    amplitudes = [[float(c.real), float(c.imag)] for c in statevector]

    return {
        "circuitId": circuit.id,
        "backend": "statevector",
        "statevector": amplitudes,
        "executedAt": circuit.updatedAt
    }
