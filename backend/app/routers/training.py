from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict
from app.models.training import CircuitContext
from app.services.gradient_engine import compute_expectation_value, compute_gradients_parameter_shift
from app.tasks.training_tasks import train_circuit
from app.celery_app import celery_app
from celery.result import AsyncResult
from sse_starlette.sse import EventSourceResponse
import asyncio
import json

router = APIRouter(prefix="/api/training", tags=["training"])


class GradientResponse(BaseModel):
    loss: float
    gradients: Dict[str, float]


class TrainingRequest(BaseModel):
    context: CircuitContext
    learningRate: float = 0.01
    maxIterations: int = 100
    convergenceThreshold: float = 1e-6


class TrainingJobResponse(BaseModel):
    jobId: str
    status: str


@router.post("/gradients", response_model=GradientResponse)
async def compute_gradients(context: CircuitContext):
    """Compute loss and gradients using parameter-shift rule"""
    loss = compute_expectation_value(context)
    gradients = compute_gradients_parameter_shift(context)
    return GradientResponse(loss=loss, gradients=gradients)


@router.post("/start", response_model=TrainingJobResponse)
async def start_training(request: TrainingRequest):
    """Start async training job"""
    task = train_circuit.delay(
        context_dict=request.context.model_dump(),
        learning_rate=request.learningRate,
        max_iterations=request.maxIterations,
        convergence_threshold=request.convergenceThreshold
    )
    return TrainingJobResponse(jobId=task.id, status='pending')


@router.get("/status/{job_id}")
async def get_training_status(job_id: str):
    """Get training job status"""
    task_result = AsyncResult(job_id, app=celery_app)

    if task_result.state == 'PENDING':
        return {'status': 'pending', 'current': 0, 'total': 1}
    elif task_result.state == 'PROGRESS':
        return {'status': 'running', **task_result.info}
    elif task_result.state == 'SUCCESS':
        return {'status': 'completed', 'result': task_result.result}
    else:
        return {'status': 'failed', 'error': str(task_result.info)}


@router.get("/stream/{job_id}")
async def stream_training_progress(job_id: str):
    """Stream training progress via SSE"""

    async def event_generator():
        task_result = AsyncResult(job_id, app=celery_app)
        last_iteration = -1

        while True:
            if task_result.state == 'PROGRESS':
                info = task_result.info
                if info['current'] > last_iteration:
                    yield {
                        "event": "progress",
                        "data": json.dumps(info)
                    }
                    last_iteration = info['current']

            elif task_result.state == 'SUCCESS':
                yield {
                    "event": "completed",
                    "data": json.dumps(task_result.result)
                }
                break

            elif task_result.state == 'FAILURE':
                yield {
                    "event": "failed",
                    "data": json.dumps({"error": str(task_result.info)})
                }
                break

            await asyncio.sleep(0.1)

    return EventSourceResponse(event_generator())
