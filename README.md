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
  <img src="https://img.shields.io/badge/Vite-5.0.8-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/TailwindCSS-4.2.2-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" alt="TailwindCSS">
  <img src="https://img.shields.io/badge/Three.js-0.160.0-000000?style=flat-square&logo=three.js&logoColor=white" alt="Three.js">
  <img src="https://img.shields.io/badge/React_Flow-11.11.4-FF4081?style=flat-square" alt="React Flow">
</p>

---

Cirqit is an experimental, visual-first IDE designed for building and simulating hybrid quantum-classical algorithms. By bridging the gap between abstract quantum gates and intuitive visual representations, it aims to make quantum machine learning accessible and observable.

## 🚀 Key Features (In Development)

- **Node-Based Circuit Editor**: Drag-and-drop quantum gate construction powered by React Flow.
- **3D State Visualization**: Real-time Bloch sphere rendering with Three.js to observe qubit state evolution.
- **Hybrid Workflow**: Seamless integration of classical processing with quantum circuit execution.
- **Real-time Feedback**: Instant simulation updates as you modify circuit parameters.
- **Minimalist Aesthetics**: A custom violet-themed design system optimized for complex scientific visualization.

## 🛠 Tech Stack

Cirqit is built on a modern, performance-oriented stack:

- **Framework**: React 18 with Vite for rapid development.
- **Logic & Typing**: TypeScript for robust quantum state management.
- **State Management**: Zustand for high-performance, lightweight reactive state.
- **Graphing Engine**: React Flow for building complex circuit topologies.
- **3D Graphics**: Three.js & React Three Fiber for immersive quantum state visualization.
- **Testing**: Vitest with Happy DOM for fast, reliable unit and integration tests.

> **[Read more about the Architecture](ARCHITECTURE.md)**

## 📐 Roadmap

Cirqit is currently in its early stages. Upcoming milestones include:

- **WASM Integration**: Offloading simulation logic to high-performance Rust-based engines.
- **Web Workers**: Background thread processing for non-blocking UI interactions.
- **Gate Library**: A comprehensive set of standard and parametric quantum gates.
- **Export/Import**: Support for OpenQASM 3.0 and other quantum circuit formats.

## 🚦 Getting Started

Setting up the development environment is straightforward.

1.  **Clone the Repository**: `git clone https://github.com/your-username/cirqit.git`
2.  **Install Dependencies**: `npm install`
3.  **Run Development Server**: `npm run dev`
4.  **Run Tests**: `npm test`

## 📂 Project Structure

```text
├── src/
│   ├── __tests__/      # Component and unit tests
│   ├── tests/          # Test setup and configuration
│   ├── App.tsx         # Main application entry point
│   ├── index.css       # Global styles and Tailwind configuration
│   └── main.tsx        # React DOM mounting
├── public/             # Static assets
├── ARCHITECTURE.md     # Detailed architectural decisions
└── vite.config.ts      # Vite build pipeline configuration
```

---

<p align="center">
  <i>Quantum, made visible.</i>
</p>
