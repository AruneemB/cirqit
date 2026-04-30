import json
import pytest
from unittest.mock import AsyncMock, patch
from httpx import AsyncClient, ASGITransport

from app.main import app
from app.routers.copilot import _is_simple_command


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _circuit_payload(num_qubits: int = 2, gates: list | None = None):
    return {
        "id": "test-circuit-id",
        "name": "Test",
        "numQubits": num_qubits,
        "gates": gates or [],
        "createdAt": "2026-01-01T00:00:00Z",
        "updatedAt": "2026-01-01T00:00:00Z",
    }


def _patch_response(**kwargs):
    return json.dumps({
        "action": kwargs.get("action", "patch_circuit"),
        "ops": kwargs.get("ops", []),
        "explanation": kwargs.get("explanation", "Done."),
        "confidence": kwargs.get("confidence", 1.0),
    })


# ---------------------------------------------------------------------------
# Unit: simple-command classifier
# ---------------------------------------------------------------------------

def test_is_simple_command_matches():
    assert _is_simple_command("add H gate to qubit 0")
    assert _is_simple_command("apply Hadamard to qubit 1")
    assert _is_simple_command("put RY on qubit 2")
    assert _is_simple_command("remove the CNOT gate")
    assert _is_simple_command("delete X gate")


def test_is_simple_command_no_match():
    assert not _is_simple_command("create a Bell state")
    assert not _is_simple_command("build a GHZ state on 3 qubits")
    assert not _is_simple_command("prepare the VQE ansatz")


# ---------------------------------------------------------------------------
# Integration: POST /api/copilot/circuit-builder
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_circuit_builder_add_gate():
    """LLM response that adds a gate is returned correctly."""
    llm_response = _patch_response(
        ops=[{"op": "add_gate", "type": "H", "qubits": [0]}],
        explanation="Added H on qubit 0.",
        confidence=1.0,
    )

    with patch("app.routers.copilot.llm_gateway") as mock_llm:
        mock_llm.complete_json = AsyncMock(return_value=json.loads(llm_response))

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post(
                "/api/copilot/circuit-builder",
                json={"text": "add H gate to qubit 0", "circuit": _circuit_payload()},
            )

    assert response.status_code == 200
    data = response.json()
    assert data["action"] == "patch_circuit"
    assert len(data["ops"]) == 1
    assert data["ops"][0]["op"] == "add_gate"
    assert data["ops"][0]["type"] == "H"
    assert data["confidence"] == 1.0


@pytest.mark.asyncio
async def test_circuit_builder_remove_gate():
    """Patch that removes a gate by ID is forwarded correctly."""
    gate_id = "gate-uuid-999"
    llm_response = _patch_response(
        ops=[{"op": "remove_gate", "gate_id": gate_id}],
        explanation="Removed gate gate-uuid-999.",
        confidence=1.0,
    )

    circuit = _circuit_payload(gates=[{
        "id": gate_id,
        "type": "H",
        "qubits": [0],
        "params": None,
        "position": {"x": 100, "y": 50},
    }])

    with patch("app.routers.copilot.llm_gateway") as mock_llm:
        mock_llm.complete_json = AsyncMock(return_value=json.loads(llm_response))

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post(
                "/api/copilot/circuit-builder",
                json={"text": "remove the H gate", "circuit": circuit},
            )

    assert response.status_code == 200
    data = response.json()
    assert data["ops"][0]["op"] == "remove_gate"
    assert data["ops"][0]["gate_id"] == gate_id


@pytest.mark.asyncio
async def test_circuit_builder_parameter_update():
    """Patch that updates gate parameters is returned correctly."""
    gate_id = "rx-gate-id"
    llm_response = _patch_response(
        ops=[{"op": "set_param", "gate_id": gate_id, "params": [1.5707963267948966]}],
        explanation="Set RX angle to π/2.",
        confidence=0.95,
    )

    circuit = _circuit_payload(gates=[{
        "id": gate_id,
        "type": "RX",
        "qubits": [0],
        "params": [0.0],
        "position": {"x": 100, "y": 50},
    }])

    with patch("app.routers.copilot.llm_gateway") as mock_llm:
        mock_llm.complete_json = AsyncMock(return_value=json.loads(llm_response))

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post(
                "/api/copilot/circuit-builder",
                json={"text": "set the RX parameter to pi/2", "circuit": circuit},
            )

    assert response.status_code == 200
    data = response.json()
    assert data["ops"][0]["op"] == "set_param"
    assert abs(data["ops"][0]["params"][0] - 1.5707963) < 1e-5


@pytest.mark.asyncio
async def test_circuit_builder_error_action():
    """LLM error action is passed through with explanation."""
    llm_response = _patch_response(
        action="error",
        ops=[],
        explanation="Teleportation requires classical communication.",
        confidence=0.0,
    )

    with patch("app.routers.copilot.llm_gateway") as mock_llm:
        mock_llm.complete_json = AsyncMock(return_value=json.loads(llm_response))

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post(
                "/api/copilot/circuit-builder",
                json={"text": "teleport qubit 0 to qubit 3", "circuit": _circuit_payload()},
            )

    assert response.status_code == 200
    data = response.json()
    assert data["action"] == "error"
    assert len(data["ops"]) == 0
    assert "communication" in data["explanation"].lower()


@pytest.mark.asyncio
async def test_circuit_builder_llm_exception_returns_error():
    """If the LLM gateway raises, the endpoint returns an error action (not 500)."""
    with patch("app.routers.copilot.llm_gateway") as mock_llm:
        mock_llm.complete_json = AsyncMock(side_effect=Exception("provider unavailable"))

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post(
                "/api/copilot/circuit-builder",
                json={"text": "add H gate", "circuit": _circuit_payload()},
            )

    assert response.status_code == 200
    data = response.json()
    assert data["action"] == "error"
    assert data["confidence"] == 0.0


@pytest.mark.asyncio
async def test_circuit_builder_multi_op_bell_state():
    """Multi-op patch (Bell state) is returned intact."""
    ops = [
        {"op": "add_gate", "type": "H", "qubits": [0]},
        {"op": "add_gate", "type": "CNOT", "qubits": [0, 1]},
    ]
    llm_response = _patch_response(ops=ops, explanation="Bell state prepared.", confidence=1.0)

    with patch("app.routers.copilot.llm_gateway") as mock_llm:
        mock_llm.complete_json = AsyncMock(return_value=json.loads(llm_response))

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post(
                "/api/copilot/circuit-builder",
                json={"text": "create a Bell state on qubits 0 and 1", "circuit": _circuit_payload()},
            )

    assert response.status_code == 200
    data = response.json()
    assert data["action"] == "patch_circuit"
    assert len(data["ops"]) == 2
    assert data["ops"][0]["type"] == "H"
    assert data["ops"][1]["type"] == "CNOT"


@pytest.mark.asyncio
async def test_circuit_builder_system_prompt_includes_few_shot():
    """Verify the system prompt sent to the LLM contains few-shot examples."""
    captured_messages: list[dict] = []

    async def capture(**kwargs):
        captured_messages.extend(kwargs.get("messages", []))
        return {"action": "patch_circuit", "ops": [], "explanation": "ok", "confidence": 1.0}

    with patch("app.routers.copilot.llm_gateway") as mock_llm:
        mock_llm.complete_json = AsyncMock(side_effect=capture)

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            await client.post(
                "/api/copilot/circuit-builder",
                json={"text": "add X gate", "circuit": _circuit_payload()},
            )

    system_msgs = [m for m in captured_messages if m["role"] == "system"]
    assert len(system_msgs) == 1
    content = system_msgs[0]["content"]
    assert "Bell state" in content
    assert "GHZ" in content
    assert "FEW-SHOT" in content
