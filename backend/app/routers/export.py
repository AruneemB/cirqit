from fastapi import APIRouter, HTTPException
from app.models.circuit import Circuit
from app.services.code_generator import generate_qiskit_code

router = APIRouter(prefix="/api/export", tags=["export"])


@router.post("/qiskit")
async def export_qiskit(circuit: Circuit):
    """Export circuit as executable Qiskit Python code."""
    try:
        code = generate_qiskit_code(circuit)
        return {"code": code, "language": "python", "framework": "qiskit"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
