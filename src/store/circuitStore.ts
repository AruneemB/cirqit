import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { Circuit, Gate, ExecutionResult } from '../types/circuit'
import { Parameter, ParameterMapping } from '../types/parameter'
import { Observable } from '../types/observable'
import { v4 as uuidv4 } from 'uuid'
import { serializeCircuitContext } from '../utils/contextSerializer'
import { startTrainingJob, createTrainingStream, sendCopilotChat } from '../services/api'

export interface CopilotMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
}

interface CopilotState {
  conversationId: string | null
  messages: CopilotMessage[]
  isStreaming: boolean
  isOpen: boolean
}

interface TrainingState {
  jobId: string | null
  isTraining: boolean
  lossHistory: number[]
  currentIteration: number
  totalIterations: number
}

// Module-level EventSource so it survives re-renders without polluting store state
let _activeStream: EventSource | null = null

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

  // Training state + actions
  training: TrainingState
  startTraining: (config?: { learningRate?: number; maxIterations?: number }) => Promise<void>
  stopTraining: () => void
  updateTrainingProgress: (progress: { current: number; total: number; loss: number }) => void

  // Copilot state + actions
  copilot: CopilotState
  sendCopilotMessage: (content: string) => Promise<void>
  toggleCopilot: () => void
  clearCopilot: () => void
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
        training: {
          jobId: null,
          isTraining: false,
          lossHistory: [],
          currentIteration: 0,
          totalIterations: 0,
        },
        copilot: {
          conversationId: null,
          messages: [],
          isStreaming: false,
          isOpen: false,
        },

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

            const exists = state.parameterMappings.some(
              (m) => m.gateId === gateId && m.paramIndex === paramIndex
            )
            if (exists) return state

            const newMapping: ParameterMapping = { gateId, paramIndex, parameterName }

            const newParameters = {
              ...state.parameters,
              [parameterName]: { ...param, gateIds: [...param.gateIds, gateId] },
            }

            const newGates = state.circuit.gates.map((gate) => {
              if (gate.id !== gateId) return gate
              const params = Array.isArray(gate.params) ? [...gate.params] : []
              while (params.length <= paramIndex) params.push(undefined as unknown as number)
              params[paramIndex] = param.value
              return { ...gate, params }
            })

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

        startTraining: async (config = {}) => {
          const { learningRate = 0.01, maxIterations = 100 } = config
          const context = serializeCircuitContext()

          set((state) => ({
            training: {
              ...state.training,
              isTraining: true,
              lossHistory: [],
              currentIteration: 0,
              totalIterations: maxIterations,
              jobId: null,
            },
          }))

          let jobId: string
          try {
            const response = await startTrainingJob({ context, learningRate, maxIterations })
            jobId = response.jobId
          } catch (err) {
            set((state) => ({
              training: { ...state.training, isTraining: false, jobId: null, totalIterations: 0 },
            }))
            throw err
          }

          set((state) => ({ training: { ...state.training, jobId } }))

          _activeStream?.close()
          _activeStream = createTrainingStream(jobId)

          const onProgress = (e: MessageEvent) => {
            const info = JSON.parse(e.data)
            get().updateTrainingProgress({ current: info.current, total: info.total, loss: info.loss })
          }

          const cleanup = () => {
            _activeStream?.removeEventListener('progress', onProgress)
            _activeStream?.removeEventListener('completed', onCompleted)
            _activeStream?.removeEventListener('failed', onFailed)
            _activeStream?.close()
            _activeStream = null
          }

          const onCompleted = () => {
            set((state) => ({ training: { ...state.training, isTraining: false } }))
            cleanup()
          }

          const onFailed = () => {
            set((state) => ({ training: { ...state.training, isTraining: false } }))
            cleanup()
          }

          _activeStream.addEventListener('progress', onProgress)
          _activeStream.addEventListener('completed', onCompleted)
          _activeStream.addEventListener('failed', onFailed)

          _activeStream.onerror = () => {
            set((state) => ({ training: { ...state.training, isTraining: false } }))
            cleanup()
          }
        },

        stopTraining: () => {
          _activeStream?.close()
          _activeStream = null
          set((state) => ({ training: { ...state.training, isTraining: false } }))
        },

        updateTrainingProgress: (progress) => {
          set((state) => ({
            training: {
              ...state.training,
              currentIteration: progress.current,
              totalIterations: progress.total,
              lossHistory: [...state.training.lossHistory, progress.loss],
            },
          }))
        },

        sendCopilotMessage: async (content) => {
          const userMsg: CopilotMessage = { id: uuidv4(), role: 'user', content }
          const placeholderId = uuidv4()
          const placeholder: CopilotMessage = {
            id: placeholderId,
            role: 'assistant',
            content: '',
            isStreaming: true,
          }

          set((state) => ({
            copilot: {
              ...state.copilot,
              isStreaming: true,
              messages: [...state.copilot.messages, userMsg, placeholder],
            },
          }))

          try {
            const circuit = get().circuit
            const response = await sendCopilotChat({
              message: content,
              conversation_id: get().copilot.conversationId,
              circuit_context: { numQubits: circuit.numQubits, gates: circuit.gates },
            })

            set((state) => ({
              copilot: {
                ...state.copilot,
                conversationId: response.conversation_id,
                isStreaming: false,
                messages: state.copilot.messages.map((m) =>
                  m.id === placeholderId
                    ? { ...m, content: response.message.content, isStreaming: false }
                    : m
                ),
              },
            }))
          } catch {
            set((state) => ({
              copilot: {
                ...state.copilot,
                isStreaming: false,
                messages: state.copilot.messages.map((m) =>
                  m.id === placeholderId
                    ? { ...m, content: 'Sorry, I could not reach the backend. Please try again.', isStreaming: false }
                    : m
                ),
              },
            }))
          }
        },

        toggleCopilot: () => {
          set((state) => ({
            copilot: { ...state.copilot, isOpen: !state.copilot.isOpen },
          }))
        },

        clearCopilot: () => {
          set((state) => ({
            copilot: {
              ...state.copilot,
              conversationId: null,
              messages: [],
              isStreaming: false,
            },
          }))
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
