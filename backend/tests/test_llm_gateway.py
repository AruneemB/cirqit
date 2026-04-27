import pytest
from unittest.mock import AsyncMock, patch
from app.services.llm_gateway import LLMGateway


@pytest.mark.asyncio
async def test_openrouter_call():
    gateway = LLMGateway()

    with patch.object(gateway, '_call_openrouter', new_callable=AsyncMock, return_value="Test response"):
        result = await gateway.complete(
            messages=[{"role": "user", "content": "Hello"}],
            provider="openrouter",
            model="test-model",
        )

    assert result == "Test response"


@pytest.mark.asyncio
async def test_gemini_call():
    gateway = LLMGateway()

    with patch.object(gateway, '_call_gemini', new_callable=AsyncMock, return_value="Gemini response"):
        result = await gateway.complete(
            messages=[{"role": "user", "content": "Hello"}],
            provider="gemini",
            model="gemini-2.0-flash-exp",
        )

    assert result == "Gemini response"


@pytest.mark.asyncio
async def test_fallback_chain_succeeds_on_second():
    gateway = LLMGateway()
    call_count = 0

    async def fail_first(provider, model, messages, temperature, max_tokens):
        nonlocal call_count
        call_count += 1
        if call_count == 1:
            raise Exception("First provider failed")
        return "fallback response"

    with patch.object(gateway, '_call_provider', side_effect=fail_first):
        result = await gateway.complete(messages=[{"role": "user", "content": "test"}])

    assert result == "fallback response"
    assert call_count == 2


@pytest.mark.asyncio
async def test_all_providers_fail():
    gateway = LLMGateway()

    with patch.object(gateway, '_call_provider', side_effect=Exception("All failed")):
        with pytest.raises(Exception, match="All LLM providers failed"):
            await gateway.complete(messages=[{"role": "user", "content": "test"}])


@pytest.mark.asyncio
async def test_unknown_provider_raises():
    gateway = LLMGateway()

    with pytest.raises(ValueError, match="Unknown provider"):
        await gateway._call_provider("unknown", "model", [], 0.7, 100)  # type: ignore
