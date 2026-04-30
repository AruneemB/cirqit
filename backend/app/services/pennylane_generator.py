import math
from app.models.circuit import Circuit, Gate


def generate_pennylane_code(circuit: Circuit) -> str:
    """Generate executable PennyLane Python code from a Circuit IR."""
    param_gates = [g for g in circuit.gates if g.type in ("RX", "RY", "RZ") and g.params]
    has_params = bool(param_gates)

    lines = [
        "import pennylane as qml",
        "import numpy as np",
        "",
        f'dev = qml.device("default.qubit", wires={circuit.numQubits})',
        "",
        "@qml.qnode(dev)",
    ]

    if has_params:
        lines.append("def circuit(params):")
    else:
        lines.append("def circuit():")

    param_idx = 0
    for gate in circuit.gates:
        gate_line, param_idx = _generate_gate_code(gate, param_idx)
        lines.append(f"    {gate_line}")

    if has_params:
        lines.append("    return qml.expval(qml.PauliZ(0))")
    else:
        lines.append("    return qml.state()")

    lines.append("")

    if has_params:
        initial_params = [g.params[0] for g in param_gates]
        lines.extend([
            "# VQE cost function",
            "def cost_fn(params):",
            "    return circuit(params)",
            "",
            f"params = np.array({initial_params})",
            "opt = qml.GradientDescentOptimizer(stepsize=0.4)",
            "",
            "# Training loop",
            "for step in range(100):",
            "    params, prev_cost = opt.step_and_cost(cost_fn, params)",
            "    if step % 10 == 0:",
            '        print(f"Step {step}: cost = {prev_cost:.6f}, params = {params}")',
            "",
            "print(f'Final energy: {circuit(params):.6f}')",
        ])
    else:
        lines.extend([
            "result = circuit()",
            "print(result)",
        ])

    return "\n".join(lines)


def _generate_gate_code(gate: Gate, param_idx: int) -> tuple[str, int]:
    """Return (pennylane_code_line, updated_param_idx) for a single gate."""
    g_type = gate.type
    qubits = gate.qubits
    params = gate.params or []

    if g_type == "H":
        return f"qml.Hadamard(wires={qubits[0]})", param_idx
    elif g_type == "X":
        return f"qml.PauliX(wires={qubits[0]})", param_idx
    elif g_type == "Y":
        return f"qml.PauliY(wires={qubits[0]})", param_idx
    elif g_type == "Z":
        return f"qml.PauliZ(wires={qubits[0]})", param_idx
    elif g_type == "S":
        return f"qml.S(wires={qubits[0]})", param_idx
    elif g_type == "T":
        return f"qml.T(wires={qubits[0]})", param_idx
    elif g_type == "Sdg":
        return f"qml.adjoint(qml.S)(wires={qubits[0]})", param_idx
    elif g_type == "Tdg":
        return f"qml.adjoint(qml.T)(wires={qubits[0]})", param_idx
    elif g_type == "CNOT":
        return f"qml.CNOT(wires=[{qubits[0]}, {qubits[1]}])", param_idx
    elif g_type == "CZ":
        return f"qml.CZ(wires=[{qubits[0]}, {qubits[1]}])", param_idx
    elif g_type == "SWAP":
        return f"qml.SWAP(wires=[{qubits[0]}, {qubits[1]}])", param_idx
    elif g_type == "Toffoli":
        return f"qml.Toffoli(wires=[{qubits[0]}, {qubits[1]}, {qubits[2]}])", param_idx
    elif g_type in ("RX", "RY", "RZ"):
        op = f"qml.R{g_type[1]}"
        angle_comment = _format_angle(params[0]) if params else "0"
        code = f"{op}(params[{param_idx}], wires={qubits[0]})  # {angle_comment}"
        return code, param_idx + 1
    else:
        return f"# Unsupported gate: {g_type}", param_idx


def _format_angle(radians: float) -> str:
    """Format an angle in terms of π for readability."""
    if radians == 0:
        return "0"

    ratio = radians / math.pi
    for denom in [1, 2, 3, 4, 6, 8]:
        numer = round(ratio * denom)
        if abs(numer / denom - ratio) < 1e-9:
            if denom == 1:
                if numer == 1:
                    return "π"
                elif numer == -1:
                    return "-π"
                return f"{numer}π"
            if numer == 1:
                return f"π/{denom}"
            if numer == -1:
                return f"-π/{denom}"
            return f"{numer}π/{denom}"

    return f"{radians:.4f} rad"
