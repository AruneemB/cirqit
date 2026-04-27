from fastapi import APIRouter
from pydantic import BaseModel
from app.services.llm_gateway import llm_gateway

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
