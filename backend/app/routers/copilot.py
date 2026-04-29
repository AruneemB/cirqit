import json
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException

from app.models.copilot import CopilotRequest, CopilotResponse, Conversation, Message
from app.services.conversation_store import conversation_store
from app.services.llm_gateway import llm_gateway

router = APIRouter(prefix="/api/copilot", tags=["copilot"])

# Section 13 — Copilot system prompt (verbatim)
COPILOT_SYSTEM_PROMPT = (
    "You are Cirqit Copilot. You are an expert quantum ML assistant embedded in a visual\n"
    "quantum circuit IDE. You always have full context of the user's current circuit.\n"
    "Be specific, actionable, and technically precise. Calibrate your language to the\n"
    "sophistication demonstrated by the user's circuit design choices.\n"
    "Never give generic quantum advice when you have specific circuit context available."
)


@router.post("/chat", response_model=CopilotResponse)
async def chat(request: CopilotRequest):
    """Send a message to the Copilot, maintaining conversation history."""
    # Retrieve or create conversation
    conversation: Conversation | None = None
    if request.conversation_id:
        conversation = await conversation_store.get(request.conversation_id)
    if conversation is None:
        conversation = await conversation_store.create()

    # Build system prompt, injecting circuit context when provided
    system_content = COPILOT_SYSTEM_PROMPT
    if request.circuit_context:
        system_content += (
            "\n\nCIRCUIT CONTEXT:\n"
            + json.dumps(request.circuit_context, indent=2)
        )

    # Assemble message list for the LLM
    llm_messages = [{"role": "system", "content": system_content}]
    for msg in conversation.messages:
        if msg.role != "system":
            llm_messages.append({"role": msg.role, "content": msg.content})

    user_message = Message(role="user", content=request.message)
    llm_messages.append({"role": "user", "content": request.message})

    response_text = await llm_gateway.complete(
        messages=llm_messages,
        provider="openrouter",
        model="anthropic/claude-3.5-sonnet",
        temperature=0.7,
        max_tokens=2000,
    )

    assistant_message = Message(role="assistant", content=response_text)

    conversation.messages.extend([user_message, assistant_message])
    conversation.updated_at = datetime.now(timezone.utc).isoformat()
    await conversation_store.save(conversation)

    return CopilotResponse(
        conversation_id=conversation.id,
        message=assistant_message,
        conversation=conversation,
    )


@router.get("/conversation/{conversation_id}", response_model=Conversation)
async def get_conversation(conversation_id: str):
    """Retrieve a stored conversation by ID."""
    conversation = await conversation_store.get(conversation_id)
    if conversation is None:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation


@router.delete("/conversation/{conversation_id}")
async def delete_conversation(conversation_id: str):
    """Remove a conversation from the store."""
    await conversation_store.delete(conversation_id)
    return {"status": "deleted", "conversation_id": conversation_id}
