import pytest
from app.models.circuit import Circuit, Gate, Position

def test_valid_circuit_model():
    circuit = Circuit(
        id="123",
        name="Test",
        numQubits=2,
        gates=[
            Gate(id="g1", type="H", qubits=[0], position=Position(x=0, y=0))
        ],
        createdAt="2024-01-01T00:00:00Z",
        updatedAt="2024-01-01T00:00:00Z"
    )
    assert circuit.numQubits == 2

def test_invalid_qubit_index():
    with pytest.raises(ValueError):
        Circuit(
            id="123",
            name="Test",
            numQubits=2,
            gates=[
                Gate(id="g1", type="H", qubits=[5], position=Position(x=0, y=0))
            ],
            createdAt="2024-01-01T00:00:00Z",
            updatedAt="2024-01-01T00:00:00Z"
        )
