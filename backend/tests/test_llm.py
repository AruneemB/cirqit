import json
import pytest
from unittest.mock import AsyncMock, patch
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.routers.llm import is_simple_gate_command


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


def _make_circuit_payload():
    return {
        "id": "test-id",
        "name": "Test",
        "numQubits": 2,
        "gates": [],
        "createdAt": "2026-01-01T00:00:00Z",
        "updatedAt": "2026-01-01T00:00:00Z",
    }


def test_is_simple_gate_command_matches():
    assert is_simple_gate_command("add H gate to qubit 0")
    assert is_simple_gate_command("apply Hadamard")
    assert is_simple_gate_command("put RY on qubit 1")
    assert is_simple_gate_command("place X gate on qubit 2")


def test_is_simple_gate_command_no_match():
    assert not is_simple_gate_command("create a Bell state between qubits 0 and 1")
    assert not is_simple_gate_command("build a hardware-efficient ansatz with 2 layers")
    assert not is_simple_gate_command("what literature covers this circuit?")


@pytest.mark.asyncio
async def test_circuit_build_simple_routes_to_gemini():
    patch_response = json.dumps({
        "action": "patch_circuit",
        "ops": [{"op": "add_gate", "type": "H", "qubits": [0]}],
        "explanation": "Added Hadamard on qubit 0.",
        "confidence": 0.98,
    })
    with patch("app.routers.llm.llm_gateway") as mock_gateway:
        mock_gateway.complete_json = AsyncMock(return_value={
            "action": "patch_circuit",
            "ops": [{"op": "add_gate", "type": "H", "qubits": [0]}],
            "explanation": "Added Hadamard on qubit 0.",
            "confidence": 0.98,
        })
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post(
                "/api/llm/circuit-build",
                json={"text": "add H gate to qubit 0", "circuit": _make_circuit_payload()},
            )

    assert response.status_code == 200
    result = response.json()
    assert result["action"] == "patch_circuit"
    assert result["confidence"] == 0.98
    # Verify Gemini was selected (simple command)
    call_kwargs = mock_gateway.complete_json.call_args
    assert call_kwargs.kwargs["provider"] == "gemini"


@pytest.mark.asyncio
async def test_circuit_build_complex_routes_to_openrouter():
    with patch("app.routers.llm.llm_gateway") as mock_gateway:
        mock_gateway.complete_json = AsyncMock(return_value={
            "action": "patch_circuit",
            "ops": [
                {"op": "add_gate", "type": "H", "qubits": [0]},
                {"op": "add_gate", "type": "CNOT", "qubits": [0, 1]},
            ],
            "explanation": "Created Bell state.",
            "confidence": 0.95,
        })
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post(
                "/api/llm/circuit-build",
                json={"text": "create a Bell state between qubits 0 and 1", "circuit": _make_circuit_payload()},
            )

    assert response.status_code == 200
    result = response.json()
    assert result["action"] == "patch_circuit"
    assert len(result["ops"]) == 2
    call_kwargs = mock_gateway.complete_json.call_args
    assert call_kwargs.kwargs["provider"] == "openrouter"


@pytest.mark.asyncio
async def test_circuit_build_llm_error_returns_error_action():
    with patch("app.routers.llm.llm_gateway") as mock_gateway:
        mock_gateway.complete_json = AsyncMock(side_effect=Exception("Provider unavailable"))
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post(
                "/api/llm/circuit-build",
                json={"text": "add X gate", "circuit": _make_circuit_payload()},
            )

    assert response.status_code == 200
    result = response.json()
    assert result["action"] == "error"
    assert result["confidence"] == 0.0
    assert "Provider unavailable" in result["explanation"]


@pytest.mark.asyncio
async def test_circuit_build_low_confidence_passthrough():
    with patch("app.routers.llm.llm_gateway") as mock_gateway:
        mock_gateway.complete_json = AsyncMock(return_value={
            "action": "patch_circuit",
            "ops": [],
            "explanation": "Ambiguous request.",
            "confidence": 0.4,
        })
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post(
                "/api/llm/circuit-build",
                json={"text": "do something quantum", "circuit": _make_circuit_payload()},
            )

    assert response.status_code == 200
    result = response.json()
    assert result["confidence"] == 0.4


@pytest.mark.asyncio
async def test_narrate_code_returns_annotated_code():
    with patch("app.routers.llm.llm_gateway") as mock_gateway:
        mock_gateway.complete = AsyncMock(
            return_value="# Creates superposition\nqc.h(0)\n# Entangles qubits 0 and 1\nqc.cx(0, 1)"
        )
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post(
                "/api/llm/narrate-code",
                json={"code": "qc.h(0)\nqc.cx(0, 1)", "language": "python"},
            )

    assert response.status_code == 200
    result = response.json()
    assert "annotated_code" in result
    assert "superposition" in result["annotated_code"]


@pytest.mark.asyncio
async def test_narrate_code_with_circuit_intent():
    captured_messages = []

    async def capture_complete(messages, **kwargs):
        captured_messages.extend(messages)
        return "# Bell state circuit\nqc.h(0)"

    with patch("app.routers.llm.llm_gateway") as mock_gateway:
        mock_gateway.complete = capture_complete
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            await client.post(
                "/api/llm/narrate-code",
                json={
                    "code": "qc.h(0)",
                    "language": "python",
                    "circuit_intent": "Bell state preparation",
                },
            )

    user_message = next(m["content"] for m in captured_messages if m["role"] == "user")
    assert "Bell state preparation" in user_message


@pytest.mark.asyncio
async def test_narrate_code_fallback_on_error():
    original_code = "qc.h(0)\nqc.cx(0, 1)"
    with patch("app.routers.llm.llm_gateway") as mock_gateway:
        mock_gateway.complete = AsyncMock(side_effect=Exception("Provider unavailable"))
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post(
                "/api/llm/narrate-code",
                json={"code": original_code, "language": "python"},
            )

    assert response.status_code == 200
    result = response.json()
    assert result["annotated_code"] == original_code


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
