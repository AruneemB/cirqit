import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TrainingDashboard } from '../components/TrainingDashboard'
import { useCircuitStore } from '../store/circuitStore'

vi.mock('../store/circuitStore')

const mockStartTraining = vi.fn()
const mockStopTraining = vi.fn()
const mockUpdateParameter = vi.fn()

const baseTraining = {
  jobId: null,
  isTraining: false,
  lossHistory: [],
  currentIteration: 0,
  totalIterations: 0,
}

function mockStore(overrides: Partial<ReturnType<typeof useCircuitStore>> = {}) {
  vi.mocked(useCircuitStore).mockReturnValue({
    circuit: { id: '1', name: 'Test', numQubits: 1, gates: [], createdAt: '', updatedAt: '' },
    parameters: {},
    parameterMappings: [],
    observable: null,
    executionResult: null,
    training: baseTraining,
    startTraining: mockStartTraining,
    stopTraining: mockStopTraining,
    updateParameter: mockUpdateParameter,
    setNumQubits: vi.fn(),
    addGate: vi.fn(),
    removeGate: vi.fn(),
    updateGate: vi.fn(),
    clearCircuit: vi.fn(),
    setExecutionResult: vi.fn(),
    clearExecution: vi.fn(),
    createParameter: vi.fn(),
    linkGateToParameter: vi.fn(),
    unlinkGateFromParameter: vi.fn(),
    getParametersForGate: vi.fn(),
    setObservable: vi.fn(),
    updateTrainingProgress: vi.fn(),
    ...overrides,
  } as any)
}

describe('TrainingDashboard', () => {
  beforeEach(() => {
    mockStartTraining.mockReset()
    mockStopTraining.mockReset()
    mockStore()
  })

  it('renders the dashboard heading', () => {
    render(<TrainingDashboard />)
    expect(screen.getByText('VQE Trainer')).toBeInTheDocument()
    expect(screen.getByText('Variational Quantum Eigensolver')).toBeInTheDocument()
  })

  it('shows Initialize Optimization button when not training', () => {
    render(<TrainingDashboard />)
    expect(screen.getByRole('button', { name: 'Initialize Optimization' })).toBeInTheDocument()
  })

  it('calls startTraining when button is clicked', () => {
    render(<TrainingDashboard />)
    fireEvent.click(screen.getByRole('button', { name: 'Initialize Optimization' }))
    expect(mockStartTraining).toHaveBeenCalledOnce()
  })

  it('shows Stop Training button while training is active', () => {
    mockStore({ training: { ...baseTraining, isTraining: true } })
    render(<TrainingDashboard />)
    expect(screen.getByRole('button', { name: 'Stop Training' })).toBeInTheDocument()
  })

  it('calls stopTraining when Stop button is clicked', () => {
    mockStore({ training: { ...baseTraining, isTraining: true } })
    render(<TrainingDashboard />)
    fireEvent.click(screen.getByRole('button', { name: 'Stop Training' }))
    expect(mockStopTraining).toHaveBeenCalledOnce()
  })

  it('displays --- as current loss when history is empty', () => {
    render(<TrainingDashboard />)
    expect(screen.getByText('---')).toBeInTheDocument()
  })

  it('displays last loss value from history', () => {
    mockStore({ training: { ...baseTraining, lossHistory: [0.8, 0.5, 0.312345] } })
    render(<TrainingDashboard />)
    expect(screen.getByText('0.312345')).toBeInTheDocument()
  })

  it('disables config inputs during training', () => {
    mockStore({ training: { ...baseTraining, isTraining: true } })
    render(<TrainingDashboard />)
    const inputs = screen.getAllByRole('spinbutton')
    inputs.forEach((input) => expect(input).toBeDisabled())
  })

  it('renders parameter sliders for each parameter', () => {
    mockStore({
      parameters: {
        'θ_0': { name: 'θ_0', value: 0.5, isTrainable: true, gateIds: [] },
        'θ_1': { name: 'θ_1', value: 1.0, isTrainable: true, gateIds: [] },
      },
    })
    render(<TrainingDashboard />)
    expect(screen.getByText('Θ_0')).toBeInTheDocument()
    expect(screen.getByText('Θ_1')).toBeInTheDocument()
  })
})
