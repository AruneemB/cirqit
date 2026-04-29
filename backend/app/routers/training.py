from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict
from app.models.training import CircuitContext
from app.services.gradient_engine import compute_expectation_value, compute_gradients_parameter_shift

router = APIRouter(prefix="/api/training", tags=["training"])


class GradientResponse(BaseModel):
    loss: float
    gradients: Dict[str, float]


@router.post("/gradients", response_model=GradientResponse)
async def compute_gradients(context: CircuitContext):
    """Compute loss and gradients using parameter-shift rule"""
    loss = compute_expectation_value(context)
    gradients = compute_gradients_parameter_shift(context)
    return GradientResponse(loss=loss, gradients=gradients)
