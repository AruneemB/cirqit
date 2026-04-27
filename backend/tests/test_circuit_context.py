from app.services.circuit_context import serialize_circuit_context


def _make_circuit(num_qubits=3, gates=None):
    return {
        "id": "test-id",
        "name": "Test",
        "numQubits": num_qubits,
        "gates": gates or [],
        "createdAt": "2026-01-01T00:00:00Z",
        "updatedAt": "2026-01-01T00:00:00Z",
    }


def test_empty_circuit_structure():
    ctx = serialize_circuit_context(_make_circuit())
    assert ctx["qubit_count"] == 3
    assert ctx["depth"] == 0
    assert ctx["mode"] == "static"
    assert ctx["gate_summary"] == []
    assert ctx["parameter_count"] == 0
    assert ctx["observable_type"] is None
    assert ctx["backend"] == "statevector"
    assert ctx["entanglement_pairs"] == []


def test_gate_summary_populated():
    gates = [
        {"id": "g1", "type": "H", "qubits": [0], "params": None, "position": {"x": 100, "y": 50}},
        {"id": "g2", "type": "RY", "qubits": [1], "params": [1.57], "position": {"x": 200, "y": 130}},
    ]
    ctx = serialize_circuit_context(_make_circuit(gates=gates))
    assert ctx["depth"] == 2
    assert ctx["gate_summary"][0]["type"] == "H"
    assert ctx["gate_summary"][0]["param_value"] is None
    assert ctx["gate_summary"][1]["type"] == "RY"
    assert ctx["gate_summary"][1]["param_value"] == 1.57


def test_parameter_count():
    gates = [
        {"id": "g1", "type": "RX", "qubits": [0], "params": [0.5], "position": {"x": 100, "y": 50}},
        {"id": "g2", "type": "H", "qubits": [1], "params": None, "position": {"x": 100, "y": 130}},
        {"id": "g3", "type": "RZ", "qubits": [2], "params": [1.0], "position": {"x": 100, "y": 210}},
    ]
    ctx = serialize_circuit_context(_make_circuit(num_qubits=3, gates=gates))
    assert ctx["parameter_count"] == 2


def test_training_defaults_when_not_provided():
    ctx = serialize_circuit_context(_make_circuit())
    assert ctx["training"]["iteration"] == 0
    assert ctx["training"]["loss"] is None
    assert ctx["training"]["optimizer"] is None


def test_training_overridden_when_provided():
    training = {"iteration": 42, "loss": 0.234, "loss_delta": -0.01, "gradient_variance": 0.003, "optimizer": "ADAM"}
    ctx = serialize_circuit_context(_make_circuit(), training=training)
    assert ctx["training"]["iteration"] == 42
    assert ctx["training"]["loss"] == 0.234
    assert ctx["training"]["optimizer"] == "ADAM"
