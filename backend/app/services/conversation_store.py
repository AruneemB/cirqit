import os
from typing import Optional

import redis.asyncio as aioredis

from app.models.copilot import Conversation

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
CONVERSATION_TTL = 3600  # 1 hour


class ConversationStore:
    def __init__(self):
        self._client: Optional[aioredis.Redis] = None

    def _get_client(self) -> aioredis.Redis:
        if self._client is None:
            self._client = aioredis.from_url(REDIS_URL, decode_responses=True)
        return self._client

    async def get(self, conversation_id: str) -> Optional[Conversation]:
        data = await self._get_client().get(f"conv:{conversation_id}")
        if data is None:
            return None
        return Conversation.model_validate_json(data)

    async def save(self, conversation: Conversation) -> None:
        await self._get_client().setex(
            f"conv:{conversation.id}",
            CONVERSATION_TTL,
            conversation.model_dump_json(),
        )

    async def create(self) -> Conversation:
        conversation = Conversation()
        await self.save(conversation)
        return conversation

    async def delete(self, conversation_id: str) -> None:
        await self._get_client().delete(f"conv:{conversation_id}")


conversation_store = ConversationStore()
