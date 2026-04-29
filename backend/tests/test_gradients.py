import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.models.training import CircuitContext, Parameter, Observable, PauliTerm, ParameterMapping
from app.models.circuit import Circuit, Gate, Position
import math


def _make_circuit(gates: list) -> Circuit:
    return Circuit(
        id="test-circuit",
        name="VQE Test",
        numQubits=1,
        gates=gates,
        createdAt="2024-01-01T00:00:00Z",
        updatedAt="2024-01-01T00:00:00Z",
    )


@pytest.mark.asyncio
async def test_compute_gradients_simple():
    """Gradient computation for RY(θ)|0⟩ measured in Z basis"""
    gate = Gate(
        id="gate-0",
        type="RY",
        qubits=[0],
        params=[0.5],
        position=Position(x=0, y=0),
    )
    circuit = _make_circuit([gate])

    context = CircuitContext(
        circuit=circuit,
        parameters={
            "theta": Parameter(
                name="theta",
                value=0.5,
                isTrainable=True,
                gateIds=[gate.id],
            )
        },
        observable=Observable(
            name="Z",
            terms=[PauliTerm(coefficient=1.0, paulis=["Z"])],
        ),
        parameterMappings=[
            ParameterMapping(gateId=gate.id, paramIndex=0, parameterName="theta")
        ],
    )

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.post(
            "/api/training/gradients", json=context.model_dump()
        )

    assert response.status_code == 200
    result = response.json()

    assert "loss" in result
    assert "gradients" in result
    assert "theta" in result["gradients"]

    # RY(θ)|0⟩ in Z basis: <Z> = cos(θ), gradient = -sin(θ)
    assert abs(result["gradients"]["theta"]) > 0.01


@pytest.mark.asyncio
async def test_non_trainable_parameters_excluded():
    """Non-trainable parameters should not appear in gradients"""
    gate = Gate(
        id="gate-0",
        type="RX",
        qubits=[0],
        params=[1.0],
        position=Position(x=0, y=0),
    )
    circuit = _make_circuit([gate])

    context = CircuitContext(
        circuit=circuit,
        parameters={
            "fixed": Parameter(
                name="fixed",
                value=1.0,
                isTrainable=False,
                gateIds=[gate.id],
            )
        },
        observable=Observable(
            name="Z",
            terms=[PauliTerm(coefficient=1.0, paulis=["Z"])],
        ),
        parameterMappings=[
            ParameterMapping(gateId=gate.id, paramIndex=0, parameterName="fixed")
        ],
    )

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.post(
            "/api/training/gradients", json=context.model_dump()
        )

    assert response.status_code == 200
    result = response.json()
    assert "fixed" not in result["gradients"]


@pytest.mark.asyncio
async def test_multiple_parameters():
    """Gradient computed independently for each trainable parameter"""
    gate0 = Gate(id="gate-0", type="RY", qubits=[0], params=[0.3], position=Position(x=0, y=0))

    circuit = Circuit(
        id="test-circuit",
        name="Multi-param",
        numQubits=2,
        gates=[gate0],
        createdAt="2024-01-01T00:00:00Z",
        updatedAt="2024-01-01T00:00:00Z",
    )

    context = CircuitContext(
        circuit=circuit,
        parameters={
            "theta_0": Parameter(name="theta_0", value=0.3, isTrainable=True, gateIds=[gate0.id]),
        },
        observable=Observable(
            name="ZI",
            terms=[PauliTerm(coefficient=1.0, paulis=["I", "Z"])],
        ),
        parameterMappings=[
            ParameterMapping(gateId=gate0.id, paramIndex=0, parameterName="theta_0"),
        ],
    )

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.post(
            "/api/training/gradients", json=context.model_dump()
        )

    assert response.status_code == 200
    result = response.json()
    assert "theta_0" in result["gradients"]
