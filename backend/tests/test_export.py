import math
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_bell_state_export():
    circuit_data = {
        "id": "export-test",
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
        response = await client.post(
            "/api/export/qiskit", json={"circuit": circuit_data, "include_narration": False}
        )

    assert response.status_code == 200
    result = response.json()
    assert result["language"] == "python"
    assert result["framework"] == "qiskit"
    assert "qc.h(0)" in result["code"]
    assert "qc.cx(0, 1)" in result["code"]
    assert "QuantumCircuit(2)" in result["code"]


@pytest.mark.asyncio
async def test_parameterized_gate_export():
    circuit_data = {
        "id": "param-export-test",
        "name": "RX Gate",
        "numQubits": 1,
        "gates": [
            {
                "id": "g1",
                "type": "RX",
                "qubits": [0],
                "params": [math.pi / 2],
                "position": {"x": 0, "y": 0},
            },
        ],
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z",
    }

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/export/qiskit", json={"circuit": circuit_data, "include_narration": False}
        )

    assert response.status_code == 200
    result = response.json()
    code = result["code"]
    assert "qc.rx(" in code
    assert "π/2" in code
