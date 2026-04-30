import json
import logging
import os
import re
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

from app.models.copilot import CopilotRequest, CopilotResponse, Conversation, Message
from app.models.circuit import Circuit, CircuitPatchResponse
from app.services.conversation_store import conversation_store
from app.services.llm_gateway import llm_gateway

logger = logging.getLogger(__name__)

DEFAULT_PROVIDER = os.getenv("COPILOT_PROVIDER", "openrouter")
DEFAULT_MODEL = os.getenv("COPILOT_MODEL", "anthropic/claude-3.5-sonnet")
MAX_CONTEXT_CHARS = 8000

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
        ctx_json = json.dumps(request.circuit_context, separators=(',', ':'))
        if len(ctx_json) > MAX_CONTEXT_CHARS:
            ctx_json = ctx_json[:MAX_CONTEXT_CHARS] + "...(truncated)"
        system_content += "\n\nCIRCUIT CONTEXT:\n" + ctx_json

    # Assemble message list for the LLM
    llm_messages = [{"role": "system", "content": system_content}]
    for msg in conversation.messages:
        if msg.role != "system":
            llm_messages.append({"role": msg.role, "content": msg.content})

    user_message = Message(role="user", content=request.message)
    llm_messages.append({"role": "user", "content": request.message})

    try:
        response_text = await llm_gateway.complete(
            messages=llm_messages,
            provider=DEFAULT_PROVIDER,
            model=DEFAULT_MODEL,
            temperature=0.7,
            max_tokens=2000,
        )
    except Exception as exc:
        logger.exception("LLM gateway error: %s", exc)
        raise HTTPException(status_code=502, detail="LLM provider unavailable. Please try again.")

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
    existing = await conversation_store.get(conversation_id)
    if existing is None:
        raise HTTPException(status_code=404, detail="Conversation not found")
    await conversation_store.delete(conversation_id)
    return {"status": "deleted", "conversation_id": conversation_id}


class CircuitBuilderRequest(BaseModel):
    text: str
    circuit: Circuit


CIRCUIT_BUILDER_SYSTEM_PROMPT = """\
You are Cirqit's natural language circuit builder. Convert the user's description \
into a circuit patch JSON object. Reply ONLY with valid JSON — no markdown, no preamble.

Supported gate types: H, X, Y, Z, S, T, Sdg, Tdg, CNOT, CZ, SWAP, Toffoli, RX, RY, RZ, U, U1, U2, U3

Required response shape:
{
  "action": "patch_circuit",
  "ops": [...],
  "explanation": "one sentence",
  "confidence": 0.95
}

If the request cannot be fulfilled use action "error" with empty ops and explain why.
Set confidence to 1.0 when certain, 0.5-0.7 when ambiguous, <0.5 when very uncertain.

--- FEW-SHOT EXAMPLES ---

USER: create a Bell state on qubits 0 and 1
ASSISTANT:
{
  "action": "patch_circuit",
  "ops": [
    {"op": "add_gate", "type": "H", "qubits": [0]},
    {"op": "add_gate", "type": "CNOT", "qubits": [0, 1]}
  ],
  "explanation": "Added H on q0 then CNOT(0,1) to produce a Bell state |Φ+⟩.",
  "confidence": 1.0
}

USER: add an RY gate with angle pi/4 to qubit 2
ASSISTANT:
{
  "action": "patch_circuit",
  "ops": [
    {"op": "add_gate", "type": "RY", "qubits": [2], "params": [0.7853981633974483]}
  ],
  "explanation": "Added RY(π/4) on qubit 2.",
  "confidence": 1.0
}

USER: remove the gate with id abc-123
ASSISTANT:
{
  "action": "patch_circuit",
  "ops": [
    {"op": "remove_gate", "gate_id": "abc-123"}
  ],
  "explanation": "Removed gate abc-123.",
  "confidence": 1.0
}

USER: set the parameter of gate abc-123 to pi/2
ASSISTANT:
{
  "action": "patch_circuit",
  "ops": [
    {"op": "set_param", "gate_id": "abc-123", "params": [1.5707963267948966]}
  ],
  "explanation": "Updated gate abc-123 parameter to π/2.",
  "confidence": 0.9
}

USER: build a GHZ state on 3 qubits
ASSISTANT:
{
  "action": "patch_circuit",
  "ops": [
    {"op": "add_gate", "type": "H", "qubits": [0]},
    {"op": "add_gate", "type": "CNOT", "qubits": [0, 1]},
    {"op": "add_gate", "type": "CNOT", "qubits": [1, 2]}
  ],
  "explanation": "Added H on q0 and two CNOTs to prepare the 3-qubit GHZ state.",
  "confidence": 1.0
}

USER: teleport qubit
ASSISTANT:
{
  "action": "error",
  "ops": [],
  "explanation": "Quantum teleportation requires classical communication which cannot be expressed as a gate-only circuit patch. Please build the circuit manually.",
  "confidence": 0.0
}
--- END EXAMPLES ---
"""

SIMPLE_PATTERNS = [
    r"add .* gate",
    r"apply .*",
    r"put .* on qubit",
    r"place .* on",
    r"insert .*gate",
    r"remove .* gate",
    r"delete .* gate",
]


def _is_simple_command(text: str) -> bool:
    return any(re.search(p, text.lower()) for p in SIMPLE_PATTERNS)


@router.post("/circuit-builder", response_model=CircuitPatchResponse)
async def circuit_builder(request: CircuitBuilderRequest):
    """Convert natural language to a circuit patch using few-shot prompted LLM (spec §12)."""
    circuit_summary = {
        "numQubits": request.circuit.numQubits,
        "gateCount": len(request.circuit.gates),
        "gates": [
            {"id": g.id, "type": g.type, "qubits": g.qubits, "params": g.params}
            for g in request.circuit.gates
        ],
    }
    system = CIRCUIT_BUILDER_SYSTEM_PROMPT + "\n\nCURRENT CIRCUIT:\n" + json.dumps(circuit_summary, separators=(",", ":"))

    messages = [
        {"role": "system", "content": system},
        {"role": "user", "content": request.text},
    ]

    use_simple = _is_simple_command(request.text)
    simple_provider = os.getenv("COPILOT_SIMPLE_PROVIDER", DEFAULT_PROVIDER)
    simple_model = os.getenv("COPILOT_SIMPLE_MODEL", DEFAULT_MODEL)
    provider = simple_provider if use_simple else DEFAULT_PROVIDER
    model = simple_model if use_simple else DEFAULT_MODEL

    try:
        result = await llm_gateway.complete_json(
            messages=messages,
            provider=provider,
            model=model,
            temperature=0.2,
            max_tokens=800,
        )
        return CircuitPatchResponse(
            action=result.get("action", "error"),
            ops=result.get("ops", []),
            explanation=result.get("explanation", ""),
            confidence=float(result.get("confidence", 0.0)),
        )
    except Exception as exc:
        logger.exception("Circuit builder LLM error: %s", exc)
        return CircuitPatchResponse(
            action="error",
            ops=[],
            explanation="Could not interpret the request. Please try rephrasing it.",
            confidence=0.0,
        )
