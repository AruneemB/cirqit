export interface LearningEntry {
  title: string
  body: string
  formula?: string
  example?: string
}

export const gateExplanations: Record<string, LearningEntry> = {
  H: {
    title: 'Hadamard Gate (H)',
    body: 'The Hadamard gate creates an equal superposition of |0⟩ and |1⟩. It is the quantum equivalent of a fair coin flip — the qubit is neither 0 nor 1 until measured.',
    formula: 'H|0⟩ = (|0⟩ + |1⟩)/√2',
    example: 'Apply H to qubit 0, then measure — you will get 0 or 1 with 50% probability each.',
  },
  X: {
    title: 'Pauli-X Gate (NOT)',
    body: 'The X gate flips a qubit from |0⟩ to |1⟩ and vice versa. It is the quantum analogue of a classical NOT gate.',
    formula: 'X|0⟩ = |1⟩,  X|1⟩ = |0⟩',
    example: 'Start with |0⟩, apply X, measure — you will always get 1.',
  },
  Y: {
    title: 'Pauli-Y Gate',
    body: 'The Y gate rotates the Bloch sphere by π radians around the Y-axis. It combines a bit flip and a phase flip.',
    formula: 'Y|0⟩ = i|1⟩,  Y|1⟩ = -i|0⟩',
  },
  Z: {
    title: 'Pauli-Z Gate (Phase Flip)',
    body: 'The Z gate leaves |0⟩ unchanged but flips the phase of |1⟩. It has no effect on measurement in the computational basis — only interference patterns change.',
    formula: 'Z|0⟩ = |0⟩,  Z|1⟩ = -|1⟩',
  },
  CNOT: {
    title: 'CNOT Gate (Controlled-NOT)',
    body: 'The CNOT gate flips the target qubit only when the control qubit is |1⟩. It is the workhorse of entanglement — combine it with H to create Bell states.',
    formula: 'CNOT|11⟩ = |10⟩,  CNOT|10⟩ = |11⟩',
    example: 'H on qubit 0, then CNOT(0→1) creates the Bell state (|00⟩+|11⟩)/√2.',
  },
  CZ: {
    title: 'Controlled-Z Gate (CZ)',
    body: 'The CZ gate applies a phase flip to the target qubit when the control qubit is |1⟩. Symmetric — either qubit can be the "control".',
    formula: 'CZ|11⟩ = -|11⟩',
  },
  RX: {
    title: 'RX Gate (X-Rotation)',
    body: 'RX(θ) rotates the qubit state around the X-axis of the Bloch sphere by angle θ. The parameter θ is trainable in variational circuits.',
    formula: 'RX(θ) = exp(-iθX/2)',
    example: 'RX(π) is equivalent to the X gate. RX(π/2) creates a balanced superposition.',
  },
  RY: {
    title: 'RY Gate (Y-Rotation)',
    body: 'RY(θ) rotates around the Y-axis. It maps real amplitudes, making it a common choice in variational ansätze for VQE.',
    formula: 'RY(θ) = exp(-iθY/2)',
    example: 'RY(π/2)|0⟩ = (|0⟩+|1⟩)/√2 — same as H but without complex phases.',
  },
  RZ: {
    title: 'RZ Gate (Z-Rotation)',
    body: 'RZ(φ) applies a phase rotation. It is a pure phase gate — no amplitude change, only relative phase between |0⟩ and |1⟩.',
    formula: 'RZ(φ) = diag(e^{-iφ/2}, e^{iφ/2})',
  },
  S: {
    title: 'S Gate (Phase Gate)',
    body: 'The S gate applies a π/2 phase shift to |1⟩. It is the square root of Z.',
    formula: 'S|1⟩ = i|1⟩',
  },
  T: {
    title: 'T Gate (π/8 Gate)',
    body: 'The T gate applies a π/4 phase shift. Together with H and CNOT, T gates form a universal gate set for quantum computation.',
    formula: 'T|1⟩ = e^{iπ/4}|1⟩',
  },
  SWAP: {
    title: 'SWAP Gate',
    body: 'The SWAP gate exchanges the states of two qubits. Useful for routing in constrained qubit topologies.',
    formula: 'SWAP|ab⟩ = |ba⟩',
  },
  TOFFOLI: {
    title: 'Toffoli Gate (CCX)',
    body: 'The Toffoli gate flips the target qubit only when both control qubits are |1⟩. It is a universal classical reversible gate embedded in quantum computing.',
    formula: 'CCX|111⟩ = |110⟩',
  },
}

export const circuitExplanations: Record<string, LearningEntry> = {
  bell_state: {
    title: 'Bell State',
    body: 'The Bell state is the simplest maximally entangled two-qubit state. Measuring one qubit instantly determines the other — regardless of distance. This is the foundation of quantum teleportation and superdense coding.',
    formula: '|Φ+⟩ = (|00⟩ + |11⟩)/√2',
    example: 'Build it: H on q0, then CNOT(q0→q1).',
  },
  ghz: {
    title: 'GHZ State',
    body: 'The Greenberger-Horne-Zeilinger (GHZ) state is a maximally entangled N-qubit state. All qubits are correlated: measuring any one collapses the rest. Used in quantum error correction and multi-party cryptography.',
    formula: '|GHZ⟩ = (|000…0⟩ + |111…1⟩)/√2',
    example: 'Build it: H on q0, then CNOT(q0→q1), CNOT(q0→q2), …',
  },
  qft: {
    title: 'Quantum Fourier Transform (QFT)',
    body: 'The QFT is the quantum analogue of the discrete Fourier transform. It is exponentially faster than the classical FFT for certain inputs and is the engine behind Shor\'s factoring algorithm.',
    formula: 'QFT|j⟩ = (1/√N) Σ_k e^{2πijk/N} |k⟩',
    example: 'For 2 qubits: H on q0, controlled-R(π/2) from q0→q1, H on q1, SWAP.',
  },
}

export const qmlConcepts: Record<string, LearningEntry> = {
  vqe: {
    title: 'Variational Quantum Eigensolver (VQE)',
    body: 'VQE is a hybrid quantum-classical algorithm that estimates the ground-state energy of a molecule. A parameterized quantum circuit (ansatz) is optimized classically until ⟨ψ(θ)|H|ψ(θ)⟩ is minimized.',
    formula: 'E(θ) = ⟨ψ(θ)|H|ψ(θ)⟩ ≥ E₀',
    example: 'Try: 2-qubit RY ansatz + CNOT layer, observable = Z⊗Z, optimize with ADAM.',
  },
  parameter_shift: {
    title: 'Parameter-Shift Rule',
    body: 'The parameter-shift rule computes exact gradients of quantum circuits on real hardware — no finite differences needed. Shift the parameter by ±π/2, evaluate the circuit twice, subtract.',
    formula: '∂⟨H⟩/∂θ = (⟨H⟩(θ+π/2) − ⟨H⟩(θ−π/2)) / 2',
  },
  adam: {
    title: 'ADAM Optimizer',
    body: 'Adaptive Moment Estimation (ADAM) is a gradient-based optimizer that adapts the learning rate per parameter using first and second moment estimates. It is the most popular optimizer for VQE and QML.',
    formula: 'θ_{t+1} = θ_t − α m̂_t / (√v̂_t + ε)',
  },
  observable: {
    title: 'Observable (Hamiltonian)',
    body: 'An observable is a Hermitian operator whose expectation value we minimize. In quantum chemistry, it represents the molecular Hamiltonian. It is written as a weighted sum of Pauli strings.',
    formula: 'H = Σ_i c_i P_i,  P_i ∈ {I,X,Y,Z}⊗n',
    example: 'H₂ at equilibrium: H = 0.5 Z⊗I − 0.5 I⊗Z + 0.25 X⊗X + 0.25 Y⊗Y',
  },
  ansatz: {
    title: 'Ansatz (Parameterized Circuit)',
    body: 'An ansatz is a variational quantum circuit template with trainable rotation angles. The expressibility of the ansatz determines what states it can reach. More layers = more expressive but harder to optimize.',
    example: 'Hardware-efficient ansatz: alternating RY layers and CNOT entangling layers.',
  },
  barren_plateau: {
    title: 'Barren Plateaus',
    body: 'A barren plateau is a flat region in the loss landscape where gradients vanish exponentially with qubit count. Deep or randomly initialized circuits often fall into barren plateaus. Use structured initialization to avoid them.',
  },
}

export interface TutorialStep {
  title: string
  description: string
  hint?: string
}

export interface Tutorial {
  id: string
  title: string
  description: string
  steps: TutorialStep[]
}

export const tutorials: Tutorial[] = [
  {
    id: 'first_circuit',
    title: 'Building Your First Circuit',
    description: 'Learn to build a Bell state — the simplest entangled circuit.',
    steps: [
      {
        title: 'Set the qubit count',
        description: 'Use the qubit selector at the top of the canvas to set the circuit to 2 qubits.',
        hint: 'Look for the "Qubits" control in the top-left of the canvas area.',
      },
      {
        title: 'Add a Hadamard gate',
        description: 'Drag the H gate from the Gate Palette onto qubit 0 (the top wire).',
        hint: 'The H gate is under "Single-Qubit Gates" in the palette.',
      },
      {
        title: 'Add a CNOT gate',
        description: 'Drag the CNOT gate onto the canvas. Set qubit 0 as control and qubit 1 as target.',
        hint: 'CNOT is under "Two-Qubit Gates". The dot is the control; the ⊕ is the target.',
      },
      {
        title: 'Run the circuit',
        description: 'Click "Run" in the top bar. Check the Probability Histogram — you should see equal probability for |00⟩ and |11⟩.',
        hint: 'This equal probability between |00⟩ and |11⟩ is the signature of entanglement.',
      },
    ],
  },
  {
    id: 'vqe_training',
    title: 'Training a VQE Circuit',
    description: 'Build a variational ansatz and minimize an observable with ADAM.',
    steps: [
      {
        title: 'Build the ansatz',
        description: 'Add an RY gate on qubit 0 and an RY gate on qubit 1. These will be your trainable parameters.',
      },
      {
        title: 'Create trainable parameters',
        description: 'Open the Training Dashboard. Create two parameters θ_0 and θ_1 with initial value 0.',
        hint: 'Click "New Parameter" and check "Trainable".',
      },
      {
        title: 'Link parameters to gates',
        description: 'In the circuit canvas, click each RY gate and link it to the corresponding parameter.',
      },
      {
        title: 'Define the observable',
        description: 'Open the Observable Builder. Add a Z⊗Z term with coefficient 1.0.',
        hint: 'Select Z for qubit 0 and Z for qubit 1, then click "Add Term".',
      },
      {
        title: 'Start training',
        description: 'Click "Initialize Optimization" in the Training Dashboard. Watch the loss curve decrease.',
        hint: 'The ADAM optimizer will shift parameters toward the minimum energy state.',
      },
    ],
  },
  {
    id: 'using_copilot',
    title: 'Using the Copilot',
    description: 'Let the AI assistant build and explain circuits for you.',
    steps: [
      {
        title: 'Open the Copilot',
        description: 'Click the Copilot button in the top bar to open the assistant sidebar.',
      },
      {
        title: 'Ask a question',
        description: 'Type "What is a Bell state?" and press Enter. The copilot will explain and offer to build it.',
      },
      {
        title: 'Use the command bar',
        description: 'Press ⌘K (or Ctrl+K) to open the natural language command bar. Type "Add a Hadamard gate on qubit 0" and press Enter.',
        hint: 'The command bar uses an LLM to translate plain English into circuit operations.',
      },
      {
        title: 'Export with narration',
        description: 'Click "Export" and check "Add AI Narration". The generated Qiskit code will include explanatory comments for each gate.',
      },
    ],
  },
]
