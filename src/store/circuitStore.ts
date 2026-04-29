import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { Circuit, Gate, ExecutionResult } from '../types/circuit'
import { Parameter, ParameterMapping } from '../types/parameter'
import { Observable } from '../types/observable'
import { v4 as uuidv4 } from 'uuid'

interface CircuitState {
  circuit: Circuit
  executionResult: ExecutionResult | null
  parameters: Record<string, Parameter>
  parameterMappings: ParameterMapping[]
  observable: Observable | null

  // Actions
  setNumQubits: (num: number) => void
  addGate: (gate: Omit<Gate, 'id'>) => void
  removeGate: (id: string) => void
  updateGate: (id: string, updates: Partial<Gate>) => void
  clearCircuit: () => void
  setExecutionResult: (result: ExecutionResult) => void
  clearExecution: () => void

  // Parameter actions
  createParameter: (name: string, initialValue: number, isTrainable: boolean) => void
  updateParameter: (name: string, newValue: number) => void
  linkGateToParameter: (gateId: string, paramIndex: number, parameterName: string) => void
  unlinkGateFromParameter: (gateId: string, paramIndex: number) => void
  getParametersForGate: (gateId: string) => ParameterMapping[]

  // Observable actions
  setObservable: (observable: Observable) => void
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
      (set, get) => ({
        circuit: DEFAULT_CIRCUIT,
        executionResult: null,
        parameters: {},
        parameterMappings: [],
        observable: null,

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

        createParameter: (name, initialValue, isTrainable) => {
          set((state) => ({
            parameters: {
              ...state.parameters,
              [name]: { name, value: initialValue, isTrainable, gateIds: [] },
            },
          }))
        },

        updateParameter: (name, newValue) => {
          set((state) => {
            const param = state.parameters[name]
            if (!param) return state

            const newParameters = {
              ...state.parameters,
              [name]: { ...param, value: newValue },
            }

            const affectedMappings = state.parameterMappings.filter(
              (m) => m.parameterName === name
            )

            const newGates = state.circuit.gates.map((gate) => {
              const mapping = affectedMappings.find((m) => m.gateId === gate.id)
              if (!mapping) return gate
              const newParams = [...(gate.params || [])]
              newParams[mapping.paramIndex] = newValue
              return { ...gate, params: newParams }
            })

            return {
              parameters: newParameters,
              circuit: { ...state.circuit, gates: newGates, updatedAt: new Date().toISOString() },
            }
          })
        },

        linkGateToParameter: (gateId, paramIndex, parameterName) => {
          set((state) => {
            const param = state.parameters[parameterName]
            if (!param) return state

            const newMapping: ParameterMapping = { gateId, paramIndex, parameterName }

            const newParameters = {
              ...state.parameters,
              [parameterName]: { ...param, gateIds: [...param.gateIds, gateId] },
            }

            const newGates = state.circuit.gates.map((gate) =>
              gate.id === gateId
                ? {
                    ...gate,
                    params: gate.params?.map((p, i) => (i === paramIndex ? param.value : p)) || [param.value],
                  }
                : gate
            )

            return {
              parameters: newParameters,
              parameterMappings: [...state.parameterMappings, newMapping],
              circuit: { ...state.circuit, gates: newGates },
            }
          })
        },

        unlinkGateFromParameter: (gateId, paramIndex) => {
          set((state) => {
            const mapping = state.parameterMappings.find(
              (m) => m.gateId === gateId && m.paramIndex === paramIndex
            )
            if (!mapping) return state

            const newMappings = state.parameterMappings.filter(
              (m) => !(m.gateId === gateId && m.paramIndex === paramIndex)
            )

            const param = state.parameters[mapping.parameterName]
            const newParameters = {
              ...state.parameters,
              [mapping.parameterName]: {
                ...param,
                gateIds: param.gateIds.filter((id) => id !== gateId),
              },
            }

            return { parameterMappings: newMappings, parameters: newParameters }
          })
        },

        getParametersForGate: (gateId) => {
          return get().parameterMappings.filter((m) => m.gateId === gateId)
        },

        setObservable: (observable) => {
          set({ observable })
        },
      }),
      { name: 'CircuitStore' }
    )
  )
)

// Expose store in development so Playwright E2E tests can seed circuit state
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  ;(window as any).__cirqitStore = useCircuitStore
}
