import math
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.services.pennylane_generator import generate_pennylane_code
from app.models.circuit import Circuit, Gate, Position


def make_circuit(name, num_qubits, gates_data):
    gates = [
        Gate(
            id=g["id"],
            type=g["type"],
            qubits=g["qubits"],
            params=g.get("params"),
            position=Position(x=g.get("x", 0), y=g.get("y", 0)),
        )
        for g in gates_data
    ]
    return Circuit(
        id="test",
        name=name,
        numQubits=num_qubits,
        gates=gates,
        createdAt="2024-01-01T00:00:00Z",
        updatedAt="2024-01-01T00:00:00Z",
    )


def test_bell_state_pennylane_syntax():
    circuit = make_circuit("Bell State", 2, [
        {"id": "g1", "type": "H", "qubits": [0]},
        {"id": "g2", "type": "CNOT", "qubits": [0, 1]},
    ])
    code = generate_pennylane_code(circuit)

    assert "import pennylane as qml" in code
    assert 'qml.device("default.qubit", wires=2)' in code
    assert "@qml.qnode(dev)" in code
    assert "qml.Hadamard(wires=0)" in code
    assert "qml.CNOT(wires=[0, 1])" in code
    assert "qml.state()" in code


def test_parameterized_gates_use_params_array():
    circuit = make_circuit("VQE", 1, [
        {"id": "g1", "type": "RY", "qubits": [0], "params": [math.pi / 2]},
    ])
    code = generate_pennylane_code(circuit)

    assert "def circuit(params):" in code
    assert "qml.RY(params[0], wires=0)" in code
    assert "π/2" in code


def test_multiple_parameterized_gates_index_correctly():
    circuit = make_circuit("Multi-param", 2, [
        {"id": "g1", "type": "RX", "qubits": [0], "params": [math.pi / 4]},
        {"id": "g2", "type": "RZ", "qubits": [1], "params": [math.pi]},
    ])
    code = generate_pennylane_code(circuit)

    assert "qml.RX(params[0], wires=0)" in code
    assert "qml.RZ(params[1], wires=1)" in code


def test_vqe_template_generated_for_parameterized_circuit():
    circuit = make_circuit("VQE", 1, [
        {"id": "g1", "type": "RY", "qubits": [0], "params": [0.5]},
    ])
    code = generate_pennylane_code(circuit)

    assert "def cost_fn(params):" in code
    assert "GradientDescentOptimizer" in code
    assert "step_and_cost" in code
    assert "qml.expval(qml.PauliZ(0))" in code


def test_no_vqe_template_for_non_parameterized_circuit():
    circuit = make_circuit("Bell", 2, [
        {"id": "g1", "type": "H", "qubits": [0]},
        {"id": "g2", "type": "CNOT", "qubits": [0, 1]},
    ])
    code = generate_pennylane_code(circuit)

    assert "cost_fn" not in code
    assert "GradientDescentOptimizer" not in code
    assert "qml.state()" in code


@pytest.mark.asyncio
async def test_pennylane_export_endpoint_bell_state():
    circuit_data = {
        "id": "pl-test",
        "name": "Bell State",
        "numQubits": 2,
        "gates": [
            {"id": "g1", "type": "H", "qubits": [0], "position": {"x": 0, "y": 0}},
            {"id": "g2", "type": "CNOT", "qubits": [0, 1], "position": {"x": 100, "y": 0}},
        ],
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z",
    }

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/export/pennylane", json={"circuit": circuit_data})

    assert response.status_code == 200
    result = response.json()
    assert result["language"] == "python"
    assert result["framework"] == "pennylane"
    assert "qml.Hadamard(wires=0)" in result["code"]
    assert "qml.CNOT(wires=[0, 1])" in result["code"]


@pytest.mark.asyncio
async def test_pennylane_export_endpoint_parameterized():
    circuit_data = {
        "id": "pl-param-test",
        "name": "VQE",
        "numQubits": 1,
        "gates": [
            {
                "id": "g1",
                "type": "RX",
                "qubits": [0],
                "params": [math.pi / 2],
                "position": {"x": 0, "y": 0},
            }
        ],
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z",
    }

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/export/pennylane", json={"circuit": circuit_data})

    assert response.status_code == 200
    code = response.json()["code"]
    assert "qml.RX(params[0], wires=0)" in code
    assert "π/2" in code
    assert "GradientDescentOptimizer" in code
