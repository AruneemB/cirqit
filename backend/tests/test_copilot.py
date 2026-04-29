import pytest
from httpx import AsyncClient, ASGITransport
from unittest.mock import AsyncMock, patch

from app.main import app
from app.models.copilot import Conversation, Message


def _make_conversation(*pairs: tuple[str, str]) -> Conversation:
    """Build a Conversation with alternating user/assistant message pairs."""
    conv = Conversation()
    for user_text, assistant_text in pairs:
        conv.messages.append(Message(role="user", content=user_text))
        conv.messages.append(Message(role="assistant", content=assistant_text))
    return conv


@pytest.mark.asyncio
async def test_chat_creates_new_conversation():
    """A new conversation is created when no conversation_id is provided."""
    mock_conv = Conversation()

    with (
        patch("app.routers.copilot.conversation_store") as mock_store,
        patch("app.routers.copilot.llm_gateway") as mock_llm,
    ):
        mock_store.get = AsyncMock(return_value=None)
        mock_store.create = AsyncMock(return_value=mock_conv)
        mock_store.save = AsyncMock()
        mock_llm.complete = AsyncMock(return_value="The Hadamard gate creates superposition.")

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post(
                "/api/copilot/chat",
                json={"message": "What is the Hadamard gate?"},
            )

    assert response.status_code == 200
    data = response.json()
    assert data["conversation_id"] == mock_conv.id
    assert data["message"]["role"] == "assistant"
    assert data["message"]["content"] == "The Hadamard gate creates superposition."


@pytest.mark.asyncio
async def test_chat_resumes_existing_conversation():
    """Messages are appended to an existing conversation retrieved by ID."""
    existing = _make_conversation(("Hello", "Hi there!"))

    with (
        patch("app.routers.copilot.conversation_store") as mock_store,
        patch("app.routers.copilot.llm_gateway") as mock_llm,
    ):
        mock_store.get = AsyncMock(return_value=existing)
        mock_store.save = AsyncMock()
        mock_llm.complete = AsyncMock(return_value="RX rotates around the X axis.")

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post(
                "/api/copilot/chat",
                json={"conversation_id": existing.id, "message": "What does RX do?"},
            )

    assert response.status_code == 200
    data = response.json()
    assert data["conversation_id"] == existing.id
    # 2 prior + new user + new assistant = 4
    assert len(data["conversation"]["messages"]) == 4


@pytest.mark.asyncio
async def test_chat_includes_system_prompt():
    """The Cirqit Copilot system prompt is always sent as the first message."""
    mock_conv = Conversation()
    captured: list[dict] = []

    async def capture(messages, **kwargs):
        captured.extend(messages)
        return "Answer."

    with (
        patch("app.routers.copilot.conversation_store") as mock_store,
        patch("app.routers.copilot.llm_gateway") as mock_llm,
    ):
        mock_store.get = AsyncMock(return_value=None)
        mock_store.create = AsyncMock(return_value=mock_conv)
        mock_store.save = AsyncMock()
        mock_llm.complete = AsyncMock(side_effect=capture)

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            await client.post("/api/copilot/chat", json={"message": "Help me"})

    system_msgs = [m for m in captured if m["role"] == "system"]
    assert len(system_msgs) == 1
    assert "Cirqit Copilot" in system_msgs[0]["content"]


@pytest.mark.asyncio
async def test_chat_injects_circuit_context():
    """Circuit context is appended to the system prompt when provided."""
    mock_conv = Conversation()
    captured: list[dict] = []

    async def capture(messages, **kwargs):
        captured.extend(messages)
        return "Context-aware response."

    circuit_ctx = {"numQubits": 2, "gates": [{"type": "H", "qubits": [0]}]}

    with (
        patch("app.routers.copilot.conversation_store") as mock_store,
        patch("app.routers.copilot.llm_gateway") as mock_llm,
    ):
        mock_store.get = AsyncMock(return_value=None)
        mock_store.create = AsyncMock(return_value=mock_conv)
        mock_store.save = AsyncMock()
        mock_llm.complete = AsyncMock(side_effect=capture)

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            await client.post(
                "/api/copilot/chat",
                json={"message": "Analyse my circuit", "circuit_context": circuit_ctx},
            )

    system_msgs = [m for m in captured if m["role"] == "system"]
    assert "CIRCUIT CONTEXT" in system_msgs[0]["content"]
    assert "numQubits" in system_msgs[0]["content"]


@pytest.mark.asyncio
async def test_get_conversation_returns_stored():
    """GET /conversation/{id} returns the stored conversation."""
    stored = _make_conversation(("Hello", "Hi"))

    with patch("app.routers.copilot.conversation_store") as mock_store:
        mock_store.get = AsyncMock(return_value=stored)

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.get(f"/api/copilot/conversation/{stored.id}")

    assert response.status_code == 200
    assert response.json()["id"] == stored.id
    assert len(response.json()["messages"]) == 2


@pytest.mark.asyncio
async def test_get_conversation_not_found():
    """GET /conversation/{id} returns 404 when no conversation exists."""
    with patch("app.routers.copilot.conversation_store") as mock_store:
        mock_store.get = AsyncMock(return_value=None)

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.get("/api/copilot/conversation/does-not-exist")

    assert response.status_code == 404


@pytest.mark.asyncio
async def test_delete_conversation():
    """DELETE /conversation/{id} delegates to the store and returns confirmation."""
    with patch("app.routers.copilot.conversation_store") as mock_store:
        mock_store.delete = AsyncMock()

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.delete("/api/copilot/conversation/some-id")

    assert response.status_code == 200
    assert response.json()["status"] == "deleted"
    mock_store.delete.assert_awaited_once_with("some-id")
