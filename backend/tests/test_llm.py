import pytest
from unittest.mock import AsyncMock, patch
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_explain_gate():
    with patch("app.routers.llm.llm_gateway") as mock_gateway:
        mock_gateway.complete = AsyncMock(
            return_value="The H gate places a qubit into an equal superposition of |0⟩ and |1⟩."
        )
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post(
                "/api/llm/explain-gate",
                json={"gateType": "H"},
            )

    assert response.status_code == 200
    result = response.json()
    assert "explanation" in result
    assert len(result["explanation"]) > 0


@pytest.mark.asyncio
async def test_explain_gate_with_context():
    with patch("app.routers.llm.llm_gateway") as mock_gateway:
        mock_gateway.complete = AsyncMock(return_value="The CX gate entangles two qubits.")
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post(
                "/api/llm/explain-gate",
                json={"gateType": "CX", "context": "Bell state circuit"},
            )

    assert response.status_code == 200
    assert "explanation" in response.json()


@pytest.mark.asyncio
async def test_explain_gate_fallback_on_error():
    with patch("app.routers.llm.llm_gateway") as mock_gateway:
        mock_gateway.complete = AsyncMock(side_effect=Exception("Provider unavailable"))
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post(
                "/api/llm/explain-gate",
                json={"gateType": "RY"},
            )

    assert response.status_code == 200
    result = response.json()
    assert "RY" in result["explanation"]
    assert result["cached"] is False
