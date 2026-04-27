import os
import re
import json
from typing import List, Dict, Optional, Literal

from openai import AsyncOpenAI
import google.generativeai as genai

openrouter_client = AsyncOpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY", ""),
)

genai.configure(api_key=os.getenv("GEMINI_API_KEY", ""))

ModelProvider = Literal["openrouter", "gemini"]


class LLMGateway:
    """Unified interface for multiple LLM providers with fallback."""

    def __init__(self):
        self.fallback_chain = [
            ("openrouter", "anthropic/claude-3.5-sonnet"),
            ("gemini", "gemini-2.0-flash-exp"),
        ]

    async def complete(
        self,
        messages: List[Dict[str, str]],
        provider: Optional[ModelProvider] = None,
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2000,
    ) -> str:
        if provider and model:
            return await self._call_provider(provider, model, messages, temperature, max_tokens)

        for fallback_provider, fallback_model in self.fallback_chain:
            try:
                return await self._call_provider(
                    fallback_provider, fallback_model, messages, temperature, max_tokens
                )
            except Exception as e:
                print(f"Fallback failed for {fallback_provider}/{fallback_model}: {e}")
                continue

        raise Exception("All LLM providers failed")

    async def _call_provider(
        self,
        provider: ModelProvider,
        model: str,
        messages: List[Dict[str, str]],
        temperature: float,
        max_tokens: int,
    ) -> str:
        if provider == "openrouter":
            return await self._call_openrouter(model, messages, temperature, max_tokens)
        elif provider == "gemini":
            return await self._call_gemini(model, messages, temperature, max_tokens)
        else:
            raise ValueError(f"Unknown provider: {provider}")

    async def _call_openrouter(
        self, model: str, messages: List[Dict[str, str]], temperature: float, max_tokens: int
    ) -> str:
        response = await openrouter_client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        return response.choices[0].message.content

    async def complete_json(
        self,
        messages: List[Dict[str, str]],
        provider: Optional[ModelProvider] = None,
        model: Optional[str] = None,
        temperature: float = 0.3,
        max_tokens: int = 1000,
        max_retries: int = 2,
    ) -> dict:
        """Call an LLM and parse the response as JSON, retrying on parse failure."""
        current_messages = list(messages)
        last_raw = ""
        for attempt in range(max_retries + 1):
            last_raw = await self.complete(current_messages, provider, model, temperature, max_tokens)
            cleaned = re.sub(r"^```(?:json)?\s*", "", last_raw.strip(), flags=re.MULTILINE)
            cleaned = re.sub(r"\s*```\s*$", "", cleaned.strip(), flags=re.MULTILINE)
            try:
                return json.loads(cleaned.strip())
            except json.JSONDecodeError:
                if attempt == max_retries:
                    raise ValueError(f"LLM did not return valid JSON after {max_retries + 1} attempts. Last response: {last_raw[:200]}")
                current_messages = current_messages + [
                    {"role": "assistant", "content": last_raw},
                    {"role": "user", "content": "Your response was not valid JSON. Reply with only valid JSON — no markdown, no explanation, no code fences."},
                ]
        raise ValueError("JSON parsing failed")

    async def _call_gemini(
        self, model: str, messages: List[Dict[str, str]], temperature: float, max_tokens: int
    ) -> str:
        gemini_model = genai.GenerativeModel(model)
        prompt = "\n".join([f"{m['role']}: {m['content']}" for m in messages])
        response = await gemini_model.generate_content_async(
            prompt,
            generation_config={
                "temperature": temperature,
                "max_output_tokens": max_tokens,
            },
        )
        return response.text


llm_gateway = LLMGateway()
