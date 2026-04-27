import re
import json
from fastapi import APIRouter
from pydantic import BaseModel
from app.services.llm_gateway import llm_gateway
from app.services.circuit_context import serialize_circuit_context
from app.models.circuit import CircuitBuildRequest, CircuitPatchResponse

router = APIRouter(prefix="/api/llm", tags=["llm"])

GATE_EXPLANATION_SYSTEM_PROMPT = """You are a quantum computing educator explaining quantum gates to students.

When asked about a quantum gate:
1. Provide a concise 2-3 sentence explanation
2. Describe the mathematical operation (e.g., matrix, effect on Bloch sphere)
3. Give a practical example use case
4. Keep it beginner-friendly but technically accurate

Format your response in plain text, no markdown."""


class ExplanationRequest(BaseModel):
    gateType: str
    context: str = ""


class ExplanationResponse(BaseModel):
    explanation: str
    cached: bool = False


CIRCUIT_BUILD_SYSTEM_PROMPT = """You are Cirqit's natural language circuit builder. Convert the user's description into a circuit patch JSON object.

CIRCUIT CONTEXT:
{circuit_context}

Supported gate types: H, X, Y, Z, S, T, Sdg, Tdg, CNOT, CZ, SWAP, Toffoli, RX, RY, RZ, U, U1, U2, U3

Respond ONLY with valid JSON in this exact format:
{{
  "action": "patch_circuit",
  "ops": [
    {{"op": "add_gate", "type": "H", "qubits": [0]}},
    {{"op": "add_gate", "type": "CNOT", "qubits": [0, 1]}},
    {{"op": "add_gate", "type": "RY", "qubits": [2], "params": [0.5]}},
    {{"op": "remove_gate", "gate_id": "uuid-here"}},
    {{"op": "set_param", "gate_id": "uuid-here", "params": [1.57]}}
  ],
  "explanation": "Brief plain-English description of what was done.",
  "confidence": 0.95
}}

Set confidence to 1.0 when certain, 0.5–0.7 when ambiguous, below 0.5 when very uncertain.
If the request cannot be fulfilled, return action "error", empty ops, and explain why in explanation.
No markdown. No backticks. No preamble."""

SIMPLE_PATTERNS = [
    r"add .* gate",
    r"apply .*",
    r"put .* on qubit",
    r"place .* on",
    r"insert .*gate",
    r"remove .* gate",
    r"delete .* gate",
]


def is_simple_gate_command(text: str) -> bool:
    return any(re.search(p, text.lower()) for p in SIMPLE_PATTERNS)


@router.post("/circuit-build", response_model=CircuitPatchResponse)
async def circuit_build(request: CircuitBuildRequest):
    """Convert natural language to a circuit patch (spec §8.1)."""
    circuit_context = serialize_circuit_context(request.circuit.model_dump())
    system = CIRCUIT_BUILD_SYSTEM_PROMPT.format(
        circuit_context=json.dumps(circuit_context, indent=2)
    )
    messages = [
        {"role": "system", "content": system},
        {"role": "user", "content": request.text},
    ]

    use_simple = is_simple_gate_command(request.text)
    provider = "gemini" if use_simple else "openrouter"
    model = "gemini-2.0-flash-exp" if use_simple else "anthropic/claude-3.5-sonnet"

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
    except Exception as e:
        return CircuitPatchResponse(
            action="error",
            ops=[],
            explanation=f"Could not interpret the request: {str(e)}",
            confidence=0.0,
        )


@router.post("/explain-gate", response_model=ExplanationResponse)
async def explain_gate(request: ExplanationRequest):
    """Get AI-generated explanation of a quantum gate."""
    user_message = f"Explain the {request.gateType} gate in quantum computing."
    if request.context:
        user_message += f"\n\nContext: {request.context}"

    messages = [
        {"role": "system", "content": GATE_EXPLANATION_SYSTEM_PROMPT},
        {"role": "user", "content": user_message},
    ]

    try:
        explanation = await llm_gateway.complete(
            messages=messages,
            provider="gemini",
            model="gemini-2.0-flash-exp",
            temperature=0.3,
            max_tokens=300,
        )
        return ExplanationResponse(explanation=explanation, cached=True)
    except Exception as e:
        return ExplanationResponse(
            explanation=f"The {request.gateType} gate is a quantum operation. (Unable to fetch detailed explanation: {str(e)})",
            cached=False,
        )
