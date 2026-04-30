import logging
import math
from app.models.circuit import Circuit, Gate

logger = logging.getLogger(__name__)

_NARRATION_SYSTEM_PROMPT = (
    "You annotate quantum circuit code with explanatory comments. "
    "Explain physical and quantum-mechanical significance, not syntax. "
    "Insert one comment above each gate operation explaining its role in the circuit. "
    "Return annotated code only — no markdown, no backticks, no preamble."
)


async def narrate_qiskit_code(code: str, circuit: Circuit) -> str:
    """Add LLM-generated inline comments to Qiskit code via DeepSeek Coder."""
    from app.services.llm_gateway import llm_gateway

    summary = f"{circuit.numQubits}-qubit, {len(circuit.gates)}-gate circuit named '{circuit.name}'"
    user_prompt = (
        f"Add inline comments to this {summary} Qiskit code. "
        "Each comment must explain the quantum-mechanical WHY of the operation — "
        "not restate the function call name.\n\n"
        f"CODE:\n{code}\n\n"
        "Return commented code only — no preamble, no backticks."
    )

    try:
        return await llm_gateway.complete(
            messages=[
                {"role": "system", "content": _NARRATION_SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            provider="openrouter",
            model="deepseek/deepseek-coder",
            temperature=0.3,
            max_tokens=2000,
        )
    except Exception:
        logger.warning("Code narration failed — returning plain generated code")
        return code


def generate_qiskit_code(circuit: Circuit) -> str:
    """Generate executable Qiskit Python code from a Circuit IR."""
    lines = [
        "from qiskit import QuantumCircuit",
        "from qiskit_aer import Aer",
        "",
        f"qc = QuantumCircuit({circuit.numQubits})",
        "",
    ]

    for gate in circuit.gates:
        lines.append(_generate_gate_code(gate))

    lines.extend([
        "",
        "# Run statevector simulation",
        "backend = Aer.get_backend('statevector_simulator')",
        "job = backend.run(qc)",
        "result = job.result()",
        "statevector = result.get_statevector()",
        "print(statevector)",
    ])

    return "\n".join(lines)


def _generate_gate_code(gate: Gate) -> str:
    """Generate Qiskit code for a single gate."""
    g_type = gate.type
    qubits = gate.qubits
    params = gate.params or []

    if g_type == "H":
        return f"qc.h({qubits[0]})"
    elif g_type == "X":
        return f"qc.x({qubits[0]})"
    elif g_type == "Y":
        return f"qc.y({qubits[0]})"
    elif g_type == "Z":
        return f"qc.z({qubits[0]})"
    elif g_type == "S":
        return f"qc.s({qubits[0]})"
    elif g_type == "T":
        return f"qc.t({qubits[0]})"
    elif g_type == "Sdg":
        return f"qc.sdg({qubits[0]})"
    elif g_type == "Tdg":
        return f"qc.tdg({qubits[0]})"
    elif g_type == "CNOT":
        return f"qc.cx({qubits[0]}, {qubits[1]})"
    elif g_type == "CZ":
        return f"qc.cz({qubits[0]}, {qubits[1]})"
    elif g_type == "SWAP":
        return f"qc.swap({qubits[0]}, {qubits[1]})"
    elif g_type == "Toffoli":
        return f"qc.ccx({qubits[0]}, {qubits[1]}, {qubits[2]})"
    elif g_type == "RX":
        return f"qc.rx({params[0]}, {qubits[0]})  # {_format_angle(params[0])}"
    elif g_type == "RY":
        return f"qc.ry({params[0]}, {qubits[0]})  # {_format_angle(params[0])}"
    elif g_type == "RZ":
        return f"qc.rz({params[0]}, {qubits[0]})  # {_format_angle(params[0])}"
    else:
        return f"# Unsupported gate: {g_type}"


def _format_angle(radians: float) -> str:
    """Format an angle in terms of π for readability."""
    if radians == 0:
        return "0"

    ratio = radians / math.pi
    # Check common fractions
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
