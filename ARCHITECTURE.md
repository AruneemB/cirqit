# Cirqit Frontend Architecture

## Technology Stack Overview

### Core Framework
- **React 18.2.0**: Component-based UI framework with concurrent features, enabling smooth interactions during quantum circuit simulations
- **TypeScript 5.2.2**: Type-safe development with strict mode enabled, critical for managing complex quantum state representations
- **Vite 5.0.8**: Lightning-fast dev server with HMR and optimized production builds using Rollup

### Styling & Design System
- **Tailwind CSS 4.2.2**: Utility-first CSS framework using CSS custom properties for runtime theming
- **@tailwindcss/postcss**: PostCSS integration for Vite build pipeline
- **Custom Theme**: Violet-based color palette (#2A1B4A backgrounds, #5A31F4 primary) reflecting quantum computing aesthetics

### State Management
- **Zustand 4.5.0**: Lightweight state management (~1kb) with simplified API compared to Redux
  - Chosen for: Minimal boilerplate, excellent TypeScript support, no Provider wrappers needed
  - Use cases: Circuit graph state, parameter values, simulation results, UI mode tracking

### Circuit Visualization
- **React Flow 11.11.4**: Node-based graph editor for quantum circuit construction
  - Provides: Drag-and-drop nodes, edge routing, zoom/pan, minimap, custom node types
  - Integrates with: Zustand for state persistence, custom rendering for quantum gates
  - Performance: Virtual rendering for circuits with 100+ gates

### 3D Visualization
- **Three.js 0.160.0**: WebGL rendering engine for Bloch sphere and quantum state visualization
- **@react-three/fiber 8.15.0**: React reconciler for Three.js, enabling declarative 3D scene composition
- **@react-three/drei 9.96.0**: Helper components for common 3D patterns (OrbitControls, Text3D, Environment)
  - Use cases: Bloch sphere rotation, quantum state evolution animation, parameter space exploration

### Testing Infrastructure
- **Vitest 1.2.0**: Vite-native test runner with instant HMR and ESM support
- **@testing-library/react 14.1.2**: User-centric component testing encouraging accessible markup
- **@testing-library/jest-dom 6.2.0**: Custom matchers for DOM assertions
- **happy-dom 13.3.0**: Fast DOM implementation (2-3x faster than jsdom)
- **@vitest/ui 1.2.0**: Browser-based test runner UI

## Architecture Rationale

### Why React Flow?
Alternative circuit editors (Cytoscape.js, D3.js force layouts) require custom edge routing and node positioning logic. React Flow provides production-ready graph editing out of the box, letting us focus on quantum-specific features.

### Why Zustand over Redux?
Quantum circuit state is hierarchical (circuit → layers → gates → parameters) but doesn't require Redux's action/reducer ceremony. Zustand's direct state updates and selector system provide better ergonomics for rapid prototyping while maintaining scalability.

### Why Three.js?
WebGL is essential for smooth 60fps animations of Bloch sphere rotations during quantum gate operations. Three.js's mature ecosystem and React Three Fiber's declarative API enable sophisticated visualizations without low-level WebGL programming.

### Why Vitest?
Vite's dev server enables sub-100ms HMR. Vitest extends this performance to tests, providing instant feedback during TDD workflows. Native ESM support eliminates Jest's transform overhead.

## Build Output
- **Dev server**: localhost:5173 with instant HMR
- **Production build**: Optimized bundles in `dist/` (~150kb gzipped core, ~500kb with Three.js)
- **Type checking**: Composite projects with incremental compilation

## Future Considerations
- **Code splitting**: Lazy load Three.js bundle until 3D visualization panel is opened
- **Web Workers**: Offload quantum circuit simulation to background threads
- **WASM**: Potential integration with Rust-based quantum simulator for performance-critical operations
