import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { Circuit, Gate, ExecutionResult } from '../types/circuit'
import { v4 as uuidv4 } from 'uuid'

interface CircuitState {
  circuit: Circuit
  executionResult: ExecutionResult | null
  
  // Actions
  setNumQubits: (num: number) => void
  addGate: (gate: Omit<Gate, 'id'>) => void
  removeGate: (id: string) => void
  updateGate: (id: string, updates: Partial<Gate>) => void
  clearCircuit: () => void
  setExecutionResult: (result: ExecutionResult) => void
  clearExecution: () => void
}

const DEFAULT_CIRCUIT: Circuit = {
  id: uuidv4(),
  name: 'New Circuit',
  numQubits: 3,
  gates: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

export const useCircuitStore = create<CircuitState>()(
  devtools(
    persist(
      (set) => ({
        circuit: DEFAULT_CIRCUIT,
        executionResult: null,

        setNumQubits: (num) =>
          set((state) => ({
            circuit: { ...state.circuit, numQubits: num, updatedAt: new Date().toISOString() },
          })),

        addGate: (gateData) =>
          set((state) => ({
            circuit: {
              ...state.circuit,
              gates: [...state.circuit.gates, { ...gateData, id: uuidv4() }],
              updatedAt: new Date().toISOString(),
            },
          })),

        removeGate: (id) =>
          set((state) => ({
            circuit: {
              ...state.circuit,
              gates: state.circuit.gates.filter((g) => g.id !== id),
              updatedAt: new Date().toISOString(),
            },
          })),

        updateGate: (id, updates) =>
          set((state) => ({
            circuit: {
              ...state.circuit,
              gates: state.circuit.gates.map((g) => (g.id === id ? { ...g, ...updates } : g)),
              updatedAt: new Date().toISOString(),
            },
          })),

        clearCircuit: () =>
          set({
            circuit: { ...DEFAULT_CIRCUIT, id: uuidv4() },
            executionResult: null,
          }),

        setExecutionResult: (result) => set({ executionResult: result }),
        clearExecution: () => set({ executionResult: null }),
      }),
      { name: 'CircuitStore' }
    )
  )
)

// Expose store in development so Playwright E2E tests can seed circuit state
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  ;(window as any).__cirqitStore = useCircuitStore
}
