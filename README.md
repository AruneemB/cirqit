<p align="center">
  <img src="favicon.svg" width="120" alt="Cirqit logo">
</p>

<h1 align="center">Cirqit</h1>

<p align="center">
  <strong>A Visual IDE for Hybrid Quantum-Classical Machine Learning.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.2.2-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white" alt="Python">
  <img src="https://img.shields.io/badge/FastAPI-0.115.0-05998B?style=flat-square&logo=fastapi&logoColor=white" alt="FastAPI">
  <img src="https://img.shields.io/badge/Qiskit-1.3.0-6929C4?style=flat-square&logo=qiskit&logoColor=white" alt="Qiskit">
  <img src="https://img.shields.io/badge/PennyLane-latest-00B489?style=flat-square&logo=pennylane&logoColor=white" alt="PennyLane">
  <img src="https://img.shields.io/badge/Vite-5.0.8-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/Three.js-0.160.0-000000?style=flat-square&logo=three.js&logoColor=white" alt="Three.js">
</p>

---

Cirqit is a visual-first IDE for building, simulating, and training hybrid quantum-classical algorithms. It connects a drag-and-drop circuit editor to a Qiskit/PennyLane backend, exposes real-time 3D state visualization, and integrates an LLM copilot for circuit construction and explanation.

## Status Overview

| Area | Status |
|------|--------|
| Circuit editor (drag-drop, gate palette) | ✅ Working |
| Statevector simulation (Qiskit) | ✅ Working |
| 3D Bloch sphere + state charts | ✅ Working |
| VQE training with ADAM optimizer | ✅ Working |
| Real-time SSE training progress | ✅ Working |
| Pauli observable / Hamiltonian editor | ✅ Working |
| Preset observable library (H2, LiH, MaxCut) | ✅ Working |
| Parameter initialization strategies | ✅ Working |
| Qiskit code export (π-notation + LLM narration) | ✅ Working |
| PennyLane code export (VQE-ready QNode) | ✅ Working |
| LLM circuit builder (natural language) | ✅ Working |
| LLM copilot chat (conversation history) | ✅ Working |
| Gate explanations & code annotation | ✅ Working |
| Learning mode (tutorials + tooltips) | ✅ Working |
| Frontend test suite (Vitest, 84+ tests) | ✅ Working |
| Backend test suite (pytest, 10+ suites) | ✅ Working |
| E2E test suite (Playwright VQE workflow) | ✅ Working |
| OpenQASM 3.0 import/export | 🔲 Planned |
| WASM quantum simulator (Rust) | 🔲 Planned |
| Web Worker offloading | 🔲 Planned |
| Noise simulation / IBM Quantum backend | 🔲 Planned |
| Code splitting (lazy-load Three.js) | 🔲 Planned |

---

## What Works Now

### Circuit Editor
The core editing surface is fully functional. Gates are dragged from a categorized palette onto qubit wires, snap to valid positions, and auto-trigger a statevector simulation on every change. 18 gate types are supported:

- **Single-qubit**: H, X, Y, Z, S, T, S†, T†
- **Two-qubit**: CNOT, CZ, SWAP, Toffoli
- **Parameterized**: RX, RY, RZ, U, U1, U2, U3

Parameters can be named, linked across gates, and toggled as trainable — which feeds directly into the VQE training pipeline. Multi-qubit gate shapes are preserved correctly when gates are moved.

### Simulation
The FastAPI backend wraps Qiskit's statevector simulator. Every circuit mutation fires `POST /api/execute/statevector` and returns complex amplitudes for the full state vector. Results drive three live views:

- **Bloch sphere** — Three.js 3D rendering with orbital controls; available for 1-qubit circuits.
- **Probability histogram** — Computational basis state probabilities.
- **Amplitude chart** — Real and imaginary parts per basis state.

### VQE Training
A full variational quantum eigensolver loop is implemented end-to-end:

1. Define a Pauli Hamiltonian in the **Observable Builder** (per-qubit I/X/Y/Z, arbitrary coefficients), or load a preset from the **Preset Observable Library**.
2. Choose a **Parameter Initialization Strategy** (random uniform, random normal, Xavier/Glorot, He/Kaiming, zeros, or identity π/2) with an optional seed for reproducibility.
3. Launch training from the **Training Dashboard** (configure learning rate, max iterations).
4. The backend runs an ADAM optimizer against parameter-shift-rule gradients over a Celery task queue.
5. Progress streams back to the frontend via Server-Sent Events (SSE) — loss curve and current parameter values update in real time.

### Preset Observable Library
The Observable Builder includes a preset library for common quantum chemistry and combinatorial optimization problems. Built-in presets:

- **H2** — Hydrogen molecule Hamiltonian (Bravyi-Kitaev mapped)
- **LiH** — Lithium hydride Hamiltonian
- **MaxCut** — Graph Max-Cut QUBO for combinatorial optimization

Selecting a preset populates the Hamiltonian editor and sizes the circuit to the correct qubit count.

### Parameter Initialization
Before training, a **Parameter Init** modal lets you choose how trainable parameters are seeded. Strategies available on both the frontend (TypeScript) and backend (Python) with consistent results:

| Strategy | Description |
|----------|-------------|
| Random Uniform | Uniform draw from `[−π, π]` |
| Random Normal | Gaussian `μ=0, σ=π/4` |
| Xavier / Glorot | Scaled by `√(6 / (fanIn + fanOut))` |
| He / Kaiming | Scaled by `√(2 / fanIn)` |
| Zeros | All parameters set to 0 |
| Identity | All parameters set to `π/2` |

An optional integer seed makes initialization fully reproducible. Fan-in/out values are validated before application.

### LLM Features
Three LLM-powered capabilities are wired up through an OpenRouter/Gemini multi-provider gateway with automatic fallback:

- **Command Bar** (`Cmd+K`) — Describe a circuit in natural language; the model returns structured patch operations with a confidence score. High-confidence patches apply automatically; others show a preview for manual approval. The LLM provider is configured via environment variables; `parsePatch` is hardened against malformed payloads.
- **Copilot Chat** — Multi-turn conversation assistant that injects the current circuit context into every message. Conversation history is persisted in Redis with a 1-hour TTL. Concurrent sends are guarded to prevent race conditions.
- **Gate Explanations & Code Annotation** — Request a pedagogical explanation for any gate, or annotate exported Qiskit code with quantum-mechanical commentary.

### Code Export
Two export targets are available from the **Code Export** modal via a framework selector dropdown:

- **Qiskit** — `POST /api/export/qiskit` generates clean, executable Python. Angles are formatted symbolically (e.g. `π/4`). An optional LLM narration toggle adds inline quantum-mechanical commentary.
- **PennyLane** — `POST /api/export/pennylane` generates a PennyLane `QNode` with correct ops (`Hadamard`, `PauliX/Y/Z`, `CNOT`, `RX/RY/RZ`, etc.). For parameterized circuits a VQE-ready cost function template using `GradientDescentOptimizer` is included. Narration is not applicable for PennyLane export. Stale responses are prevented from overwriting a newer selection.

### Learning Mode
A **Learning Mode** toggle in the top bar activates an educational overlay:

- **Learning Tooltips** — Hover any gate to see a plain-English explanation and the underlying unitary matrix.
- **Tutorial Modal** — A step-by-step walkthrough covering circuit basics, parameterized gates, and VQE setup. Modal state resets correctly on reopen, and the modal closes automatically when learning mode is disabled.

Pre-loaded content in `src/data/learningContent.ts` covers all 18 gate types and the core VQE workflow.

---

## What Remains

### OpenQASM 3.0 Import/Export
The roadmap includes round-trip circuit serialization to OpenQASM 3.0. Currently only Qiskit Python and PennyLane code are generated; there is no parser for importing circuits from text.

### WASM Simulator
A Rust-based quantum simulator compiled to WASM is planned for performance-critical operations, removing the Python round-trip for lightweight simulations. The ARCHITECTURE.md documents this as a future consideration once the Qiskit baseline is stable.

### Web Workers
Simulation and gradient computation currently block the main thread on the frontend side. Moving these to Web Workers is planned to keep the UI responsive during heavy computation.

### Noise Simulation & Additional Backends
Only the Qiskit statevector backend is active. Planned extensions include Qiskit Aer noise models, QASM simulation, and remote backends (IBM Quantum, AWS Braket). Note: `qiskit-aer` is currently excluded from `requirements.txt` due to a Windows C++ compiler dependency; it can be added on Linux/macOS.

### Code Splitting
The Three.js bundle is loaded eagerly. Lazy-loading it until the 3D panel is opened is a planned optimization to reduce initial load time.

---

## Tech Stack

### Frontend
- **React 18** + **Vite 5** — framework and build tooling
- **TypeScript 5** (strict mode) — type safety throughout
- **Zustand 4** — circuit and training state management
- **React Flow 11** — circuit graph editor
- **Three.js 0.160 / React Three Fiber 8** — Bloch sphere 3D rendering
- **Recharts 3** — loss curve and amplitude charts
- **Tailwind CSS 3** — styling
- **Vitest 1 / Testing Library / Playwright** — unit, integration, and E2E tests

### Backend
- **FastAPI 0.115 / Uvicorn** — async web framework
- **Qiskit 1.3** — circuit simulation and statevector execution
- **PennyLane** — alternative export target with GradientDescentOptimizer support
- **Celery 5 / Redis 5** — async training task queue
- **Pydantic 2** — request/response validation
- **sse-starlette** — Server-Sent Events for streaming training progress
- **OpenAI SDK / google-generativeai** — LLM provider clients
- **pytest / pytest-asyncio** — backend test suite

> **[Architecture decisions and rationale → ARCHITECTURE.md](ARCHITECTURE.md)**

---

## Getting Started

### 1. Clone
```bash
git clone https://github.com/your-username/cirqit.git
cd cirqit
```

### 2. Frontend
```bash
npm install
npm run dev        # localhost:5173
npm test           # Vitest unit + integration tests
npx playwright test  # E2E tests (requires backend running)
```

### 3. Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env   # add LLM provider keys
make run               # localhost:8000
make test              # pytest suite
```

Redis must be running for training jobs and copilot conversation history. A `docker-compose.yml` is included for local Redis.

### 4. Environment Variables
| Variable | Required | Purpose |
|----------|----------|---------|
| `OPENROUTER_API_KEY` | For LLM features | OpenRouter provider access |
| `GEMINI_API_KEY` | For LLM fallback | Google Gemini access |
| `REDIS_URL` | For training + copilot | Celery broker and conversation store |
| `SIMPLE_COMMAND_PROVIDER` | For circuit builder | LLM provider override (env-based) |

---

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── routers/        # execute, export, training, llm, copilot
│   │   ├── services/       # circuit_executor, gradient_engine, optimizers,
│   │   │                   #   llm_gateway, pennylane_generator, param_init
│   │   ├── models/         # Pydantic request/response models
│   │   └── tasks/          # Celery training task
│   └── tests/              # pytest suites (incl. pennylane export, param init)
├── e2e/
│   └── vqe-training.spec.ts  # Playwright E2E for full VQE workflow
├── src/
│   ├── components/         # React components (editor, visualization, training,
│   │                       #   LLM, CodeExportModal, ObservablePresetModal,
│   │                       #   ParameterInitModal, LearningTooltip, TutorialModal)
│   ├── data/               # learningContent.ts, observablePresets.ts
│   ├── store/              # Zustand circuit + training store (incl. learning mode)
│   ├── types/              # circuit, parameter, observable, training type definitions
│   ├── services/           # API client, circuit patch service
│   ├── utils/              # validation, context serialization, parameterInitialization
│   └── __tests__/          # Vitest test files (incl. paramInit, observablePresets,
│                           #   learningMode)
├── ARCHITECTURE.md
├── docker-compose.yml
├── package.json
└── vite.config.ts
```

---

<p align="center">
  <i>Quantum, made visible.</i>
</p>
