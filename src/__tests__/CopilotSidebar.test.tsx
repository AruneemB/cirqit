import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { CopilotSidebar } from '../components/CopilotSidebar'
import { useCircuitStore } from '../store/circuitStore'

vi.mock('../store/circuitStore')

// jsdom does not implement scrollIntoView or focus
Element.prototype.scrollIntoView = vi.fn()
HTMLElement.prototype.focus = vi.fn()

const mockSendCopilotMessage = vi.fn()
const mockToggleCopilot = vi.fn()
const mockClearCopilot = vi.fn()

const baseCopilot = {
  conversationId: null,
  messages: [],
  isStreaming: false,
  isOpen: false,
}

function mockStore(copilotOverrides: Partial<typeof baseCopilot> = {}) {
  vi.mocked(useCircuitStore).mockReturnValue({
    circuit: { id: '1', name: 'Test', numQubits: 1, gates: [], createdAt: '', updatedAt: '' },
    parameters: {},
    parameterMappings: [],
    observable: null,
    executionResult: null,
    training: { jobId: null, isTraining: false, lossHistory: [], currentIteration: 0, totalIterations: 0 },
    copilot: { ...baseCopilot, ...copilotOverrides },
    sendCopilotMessage: mockSendCopilotMessage,
    toggleCopilot: mockToggleCopilot,
    clearCopilot: mockClearCopilot,
    setNumQubits: vi.fn(),
    addGate: vi.fn(),
    removeGate: vi.fn(),
    updateGate: vi.fn(),
    clearCircuit: vi.fn(),
    setExecutionResult: vi.fn(),
    clearExecution: vi.fn(),
    createParameter: vi.fn(),
    updateParameter: vi.fn(),
    linkGateToParameter: vi.fn(),
    unlinkGateFromParameter: vi.fn(),
    getParametersForGate: vi.fn(),
    setObservable: vi.fn(),
    startTraining: vi.fn(),
    stopTraining: vi.fn(),
    updateTrainingProgress: vi.fn(),
  } as any)
}

describe('CopilotSidebar', () => {
  beforeEach(() => {
    mockSendCopilotMessage.mockReset()
    mockToggleCopilot.mockReset()
    mockClearCopilot.mockReset()
    mockStore()
  })

  it('renders toggle button when closed', () => {
    render(<CopilotSidebar />)
    expect(screen.getByRole('button', { name: 'Toggle Copilot' })).toBeInTheDocument()
    expect(screen.queryByTestId('copilot-panel')).not.toBeInTheDocument()
  })

  it('calls toggleCopilot when toggle button is clicked', () => {
    render(<CopilotSidebar />)
    fireEvent.click(screen.getByRole('button', { name: 'Toggle Copilot' }))
    expect(mockToggleCopilot).toHaveBeenCalledOnce()
  })

  it('renders panel with empty state when open and no messages', () => {
    mockStore({ isOpen: true })
    render(<CopilotSidebar />)
    expect(screen.getByTestId('copilot-panel')).toBeInTheDocument()
    expect(screen.getByText(/Ask me about your circuit/)).toBeInTheDocument()
  })

  it('renders message history when open with messages', () => {
    mockStore({
      isOpen: true,
      messages: [
        { id: '1', role: 'user', content: 'What is RY gate?' },
        { id: '2', role: 'assistant', content: 'RY is a rotation gate around the Y-axis.' },
      ],
    })
    render(<CopilotSidebar />)
    expect(screen.getByText('What is RY gate?')).toBeInTheDocument()
    expect(screen.getByText('RY is a rotation gate around the Y-axis.')).toBeInTheDocument()
  })

  it('shows streaming indicator when assistant message is streaming', () => {
    mockStore({
      isOpen: true,
      isStreaming: true,
      messages: [
        { id: '1', role: 'user', content: 'Hello' },
        { id: '2', role: 'assistant', content: '', isStreaming: true },
      ],
    })
    render(<CopilotSidebar />)
    expect(screen.getByTestId('streaming-indicator')).toBeInTheDocument()
  })

  it('submits message when form is submitted', async () => {
    mockSendCopilotMessage.mockResolvedValue(undefined)
    mockStore({ isOpen: true })
    render(<CopilotSidebar />)

    const textarea = screen.getByPlaceholderText(/Ask about your circuit/)
    fireEvent.change(textarea, { target: { value: 'Explain VQE' } })
    fireEvent.submit(textarea.closest('form')!)

    await waitFor(() => {
      expect(mockSendCopilotMessage).toHaveBeenCalledWith('Explain VQE')
    })
  })

  it('submits message on Enter key without Shift', async () => {
    mockSendCopilotMessage.mockResolvedValue(undefined)
    mockStore({ isOpen: true })
    render(<CopilotSidebar />)

    const textarea = screen.getByPlaceholderText(/Ask about your circuit/)
    fireEvent.change(textarea, { target: { value: 'Hello' } })
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false })

    await waitFor(() => {
      expect(mockSendCopilotMessage).toHaveBeenCalledWith('Hello')
    })
  })

  it('does not submit on Shift+Enter', () => {
    mockStore({ isOpen: true })
    render(<CopilotSidebar />)

    const textarea = screen.getByPlaceholderText(/Ask about your circuit/)
    fireEvent.change(textarea, { target: { value: 'Hello' } })
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true })

    expect(mockSendCopilotMessage).not.toHaveBeenCalled()
  })

  it('disables input while streaming', () => {
    mockStore({ isOpen: true, isStreaming: true })
    render(<CopilotSidebar />)
    expect(screen.getByPlaceholderText(/Ask about your circuit/)).toBeDisabled()
  })

  it('shows Close Copilot button in panel', () => {
    mockStore({ isOpen: true })
    render(<CopilotSidebar />)
    expect(screen.getByRole('button', { name: 'Close Copilot' })).toBeInTheDocument()
  })

  it('calls toggleCopilot when close button is clicked', () => {
    mockStore({ isOpen: true })
    render(<CopilotSidebar />)
    fireEvent.click(screen.getByRole('button', { name: 'Close Copilot' }))
    expect(mockToggleCopilot).toHaveBeenCalledOnce()
  })

  it('shows clear button only when there are messages', () => {
    mockStore({ isOpen: true, messages: [] })
    const { rerender } = render(<CopilotSidebar />)
    expect(screen.queryByRole('button', { name: 'Clear conversation' })).not.toBeInTheDocument()

    mockStore({
      isOpen: true,
      messages: [{ id: '1', role: 'user', content: 'Hi' }],
    })
    rerender(<CopilotSidebar />)
    expect(screen.getByRole('button', { name: 'Clear conversation' })).toBeInTheDocument()
  })

  it('calls clearCopilot when clear button is clicked', () => {
    mockStore({
      isOpen: true,
      messages: [{ id: '1', role: 'user', content: 'Hi' }],
    })
    render(<CopilotSidebar />)
    fireEvent.click(screen.getByRole('button', { name: 'Clear conversation' }))
    expect(mockClearCopilot).toHaveBeenCalledOnce()
  })

  it('renders inline code with markdown formatting', () => {
    mockStore({
      isOpen: true,
      messages: [{ id: '1', role: 'assistant', content: 'Use `RY(theta)` for rotation.' }],
    })
    render(<CopilotSidebar />)
    expect(screen.getByText('RY(theta)')).toBeInTheDocument()
  })

  it('renders bold text with markdown formatting', () => {
    mockStore({
      isOpen: true,
      messages: [{ id: '1', role: 'assistant', content: '**VQE** is powerful.' }],
    })
    render(<CopilotSidebar />)
    expect(screen.getByText('VQE')).toBeInTheDocument()
  })
})
