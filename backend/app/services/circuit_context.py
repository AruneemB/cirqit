from typing import Optional


def serialize_circuit_context(circuit: dict, training: Optional[dict] = None) -> dict:
    """Converts live circuit state into compact JSON for LLM prompt injection (spec §4.4)."""
    gates = circuit.get("gates", [])

    gate_summary = []
    for gate in gates:
        params = gate.get("params") or []
        gate_summary.append({
            "type": gate.get("type"),
            "qubits": gate.get("qubits", []),
            "param_value": params[0] if params else None,
            "gradient_magnitude": None,
        })

    return {
        "qubit_count": circuit.get("numQubits", 0),
        "depth": len(gates),
        "mode": circuit.get("mode", "static"),
        "gate_summary": gate_summary,
        "parameter_count": sum(1 for g in gates if g.get("params")),
        "observable_type": (circuit.get("observable") or {}).get("type"),
        "training": training or {
            "iteration": 0,
            "loss": None,
            "loss_delta": None,
            "gradient_variance": None,
            "optimizer": None,
        },
        "backend": circuit.get("backend", "statevector"),
        "entanglement_pairs": [],
    }
