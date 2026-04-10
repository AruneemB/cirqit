from fastapi import APIRouter, HTTPException
from app.models.circuit import Circuit
from app.services.circuit_executor import execute_statevector

router = APIRouter(prefix="/api/execute", tags=["execution"])

@router.post("/statevector")
async def run_statevector(circuit: Circuit):
    """Run exact statevector simulation"""
    try:
        return execute_statevector(circuit)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
