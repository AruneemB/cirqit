from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.models.circuit import Circuit
from app.services.code_generator import generate_qiskit_code, narrate_qiskit_code
from app.services.pennylane_generator import generate_pennylane_code

router = APIRouter(prefix="/api/export", tags=["export"])


class QiskitExportRequest(BaseModel):
    circuit: Circuit
    include_narration: bool = False


class PennyLaneExportRequest(BaseModel):
    circuit: Circuit


@router.post("/qiskit")
async def export_qiskit(request: QiskitExportRequest):
    """Export circuit as executable Qiskit Python code, optionally with LLM narration."""
    try:
        code = generate_qiskit_code(request.circuit)
        if request.include_narration:
            code = await narrate_qiskit_code(code, request.circuit)
        return {"code": code, "language": "python", "framework": "qiskit"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/pennylane")
async def export_pennylane(request: PennyLaneExportRequest):
    """Export circuit as executable PennyLane Python code with VQE template for parameterized circuits."""
    try:
        code = generate_pennylane_code(request.circuit)
        return {"code": code, "language": "python", "framework": "pennylane"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
