import pytest
from httpx import AsyncClient, ASGITransport
from unittest.mock import AsyncMock, patch
from app.main import app

_BELL_CIRCUIT = {
    "id": "narration-test",
    "name": "Bell State",
    "numQubits": 2,
    "gates": [
        {"id": "g1", "type": "H", "qubits": [0], "position": {"x": 0, "y": 0}},
        {"id": "g2", "type": "CNOT", "qubits": [0, 1], "position": {"x": 100, "y": 0}},
    ],
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z",
}


@pytest.mark.asyncio
async def test_export_without_narration():
    """Plain export returns raw generated code when include_narration is False."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/export/qiskit",
            json={"circuit": _BELL_CIRCUIT, "include_narration": False},
        )

    assert response.status_code == 200
    data = response.json()
    assert "qc.h(0)" in data["code"]
    assert "qc.cx(0, 1)" in data["code"]


@pytest.mark.asyncio
async def test_export_with_narration_uses_llm():
    """When include_narration=True the LLM annotated response is returned."""
    annotated = "# Puts qubit 0 into superposition\nqc.h(0)\n# Entangles qubits 0 and 1\nqc.cx(0, 1)"
    with patch(
        "app.services.llm_gateway.llm_gateway.complete",
        new_callable=AsyncMock,
        return_value=annotated,
    ):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/api/export/qiskit",
                json={"circuit": _BELL_CIRCUIT, "include_narration": True},
            )

    assert response.status_code == 200
    assert response.json()["code"] == annotated


@pytest.mark.asyncio
async def test_export_narration_fallback_on_llm_failure():
    """Falls back to plain generated code when the LLM call raises."""
    with patch(
        "app.services.llm_gateway.llm_gateway.complete",
        side_effect=Exception("provider unavailable"),
    ):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/api/export/qiskit",
                json={"circuit": _BELL_CIRCUIT, "include_narration": True},
            )

    assert response.status_code == 200
    data = response.json()
    # Falls back to the plain generated code — not an error
    assert "qc.h(0)" in data["code"]
    assert "qc.cx(0, 1)" in data["code"]
