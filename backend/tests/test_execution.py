import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_bell_state_execution():
    circuit_data = {
        "id": "test-id",
        "name": "Bell State",
        "numQubits": 2,
        "gates": [
            {"id": "g1", "type": "H", "qubits": [0], "position": {"x": 0, "y": 0}},
            {"id": "g2", "type": "CNOT", "qubits": [0, 1], "position": {"x": 100, "y": 0}}
        ],
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z"
    }

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/execute/statevector", json=circuit_data)

    assert response.status_code == 200
    result = response.json()
    assert result["backend"] == "statevector"
    assert len(result["statevector"]) == 4 # 2^2 states

@pytest.mark.asyncio
async def test_all_single_qubit_gates():
    gates = [
        {"id": "h", "type": "H", "qubits": [0], "position": {"x": 0, "y": 0}},
        {"id": "x", "type": "X", "qubits": [0], "position": {"x": 50, "y": 0}},
        {"id": "y", "type": "Y", "qubits": [0], "position": {"x": 100, "y": 0}},
        {"id": "z", "type": "Z", "qubits": [0], "position": {"x": 150, "y": 0}},
        {"id": "s", "type": "S", "qubits": [0], "position": {"x": 200, "y": 0}},
        {"id": "t", "type": "T", "qubits": [0], "position": {"x": 250, "y": 0}},
    ]
    
    circuit_data = {
        "id": "single-qubit-test",
        "name": "Single Qubit Gates",
        "numQubits": 1,
        "gates": gates,
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z"
    }

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/execute/statevector", json=circuit_data)

    assert response.status_code == 200
    assert len(response.json()["statevector"]) == 2

@pytest.mark.asyncio
async def test_parameterized_gates():
    import math
    gates = [
        {"id": "rx", "type": "RX", "qubits": [0], "params": [math.pi], "position": {"x": 0, "y": 0}},
        {"id": "ry", "type": "RY", "qubits": [0], "params": [math.pi/2], "position": {"x": 50, "y": 0}},
        {"id": "rz", "type": "RZ", "qubits": [0], "params": [math.pi/4], "position": {"x": 100, "y": 0}},
    ]
    
    circuit_data = {
        "id": "param-test",
        "name": "Parameterized Gates",
        "numQubits": 1,
        "gates": gates,
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z"
    }

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/execute/statevector", json=circuit_data)

    assert response.status_code == 200

@pytest.mark.asyncio
async def test_two_qubit_gates():
    gates = [
        {"id": "cz", "type": "CZ", "qubits": [0, 1], "position": {"x": 0, "y": 0}},
        {"id": "swap", "type": "SWAP", "qubits": [0, 1], "position": {"x": 50, "y": 0}},
    ]
    
    circuit_data = {
        "id": "two-qubit-test",
        "name": "Two Qubit Gates",
        "numQubits": 2,
        "gates": gates,
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z"
    }

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/execute/statevector", json=circuit_data)

    assert response.status_code == 200

