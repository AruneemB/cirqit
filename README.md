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
  <img src="https://img.shields.io/badge/Vite-5.0.8-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/Three.js-0.160.0-000000?style=flat-square&logo=three.js&logoColor=white" alt="Three.js">
</p>

---

Cirqit is an experimental, visual-first IDE designed for building and simulating hybrid quantum-classical algorithms. By bridging the gap between abstract quantum gates and intuitive visual representations, it aims to make quantum machine learning accessible and observable.

## 🚀 Key Features (In Development)

- **Node-Based Circuit Editor**: Drag-and-drop quantum gate construction powered by React Flow.
- **Circuit IR & Validation**: Robust TypeScript type definitions and validation for quantum circuit intermediate representations (IR).
- **FastAPI Backend**: A high-performance Python backend leveraging Qiskit for circuit execution and simulation.
- **3D State Visualization**: Real-time Bloch sphere rendering with Three.js to observe qubit state evolution.
- **Hybrid Workflow**: Seamless integration of classical processing with quantum circuit execution.
- **Real-time Feedback**: Instant simulation updates as you modify circuit parameters.
- **Minimalist Aesthetics**: A custom violet-themed design system optimized for complex scientific visualization.

## 🛠 Tech Stack

Cirqit is built on a modern, performance-oriented stack:

### Frontend
- **Framework**: React 18 with Vite for rapid development.
- **Logic & Typing**: TypeScript for robust quantum state management.
- **State Management**: Zustand for high-performance, lightweight reactive state.
- **Graphing Engine**: React Flow for building complex circuit topologies.
- **3D Graphics**: Three.js & React Three Fiber for immersive quantum state visualization.
- **Testing**: Vitest with Happy DOM for fast, reliable unit and integration tests.

### Backend
- **Framework**: FastAPI for a modern, async-first web service.
- **Quantum Engine**: Qiskit 1.3.0 for circuit simulation and execution.
- **Validation**: Pydantic for data validation and serialization.
- **Task Queue**: Celery + Redis for asynchronous simulation tasks.
- **Testing**: pytest with coverage for comprehensive backend testing.

> **[Read more about the Architecture](ARCHITECTURE.md)**

## 📐 Roadmap

Cirqit is currently in its early stages. Upcoming milestones include:

- **LLM Integration**: AI-powered gate explanations and circuit generation.
- **WASM Integration**: Offloading simulation logic to high-performance Rust-based engines.
- **Web Workers**: Background thread processing for non-blocking UI interactions.
- **Gate Library**: A comprehensive set of standard and parametric quantum gates.
- **Export/Import**: Support for OpenQASM 3.0 and other quantum circuit formats.

## 🚦 Getting Started

Setting up the development environment involves configuring both the frontend and backend.

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/cirqit.git
cd cirqit
```

### 2. Frontend Setup
```bash
# Install dependencies
npm install

# Run development server (localhost:5173)
npm run dev

# Run tests
npm test
```

### 3. Backend Setup
```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env

# Run development server (localhost:8000)
make run

# Run tests
make test
```

## 📂 Project Structure

```text
├── backend/            # FastAPI + Qiskit backend service
│   ├── app/            # Application logic
│   └── tests/          # Backend unit and integration tests
├── docs/               # Project documentation and roadmap
├── public/             # Static assets
├── src/                # Frontend React application
│   ├── __tests__/      # Component and unit tests
│   ├── types/          # TypeScript type definitions (Circuit IR)
│   ├── utils/          # Utility functions and validation logic
│   ├── App.tsx         # Main application entry point
│   └── main.tsx        # React DOM mounting
├── ARCHITECTURE.md     # Detailed architectural decisions
├── package.json        # Frontend dependencies and scripts
└── vite.config.ts      # Vite build pipeline configuration
```

---

<p align="center">
  <i>Quantum, made visible.</i>
</p>
