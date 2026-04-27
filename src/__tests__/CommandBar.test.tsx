import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { CommandBar } from '../components/CommandBar'

const mocks = vi.hoisted(() => ({
  applyPatch: vi.fn(),
  buildCircuit: vi.fn(),
}))

vi.mock('../store/circuitStore', () => ({
  useCircuitStore: (selector: (s: object) => unknown) =>
    selector({
      circuit: { id: 'test', name: 'Test', numQubits: 2, gates: [], createdAt: '', updatedAt: '' },
    }),
}))

vi.mock('../services/api', () => ({
  buildCircuit: mocks.buildCircuit,
}))

vi.mock('../services/circuitPatch', () => ({
  applyPatch: mocks.applyPatch,
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('CommandBar', () => {
  it('renders nothing when closed', () => {
    const { container } = render(<CommandBar isOpen={false} onClose={vi.fn()} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders input when open', () => {
    render(<CommandBar isOpen={true} onClose={vi.fn()} />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('calls onClose when backdrop clicked', () => {
    const onClose = vi.fn()
    render(<CommandBar isOpen={true} onClose={onClose} />)
    // The inner backdrop div (bg-black/60) triggers close on click
    const backdrop = document.querySelector('.bg-black\\/60') as HTMLElement
    if (backdrop) fireEvent.click(backdrop)
    expect(onClose).toHaveBeenCalled()
  })

  it('applies patch and closes when confidence >= 0.7', async () => {
    const onClose = vi.fn()
    mocks.buildCircuit.mockResolvedValue({
      action: 'patch_circuit',
      ops: [{ op: 'add_gate', type: 'H', qubits: [0] }],
      explanation: 'Added H gate.',
      confidence: 0.95,
    })
    render(<CommandBar isOpen={true} onClose={onClose} />)

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'add H gate' } })
    fireEvent.submit(screen.getByRole('textbox').closest('form')!)

    await waitFor(() => expect(mocks.applyPatch).toHaveBeenCalled())
    expect(onClose).toHaveBeenCalled()
  })

  it('shows confirmation card when confidence < 0.7', async () => {
    mocks.buildCircuit.mockResolvedValue({
      action: 'patch_circuit',
      ops: [],
      explanation: 'Ambiguous request — did you mean X?',
      confidence: 0.5,
    })
    render(<CommandBar isOpen={true} onClose={vi.fn()} />)

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'do quantum thing' } })
    fireEvent.submit(screen.getByRole('textbox').closest('form')!)

    await waitFor(() => expect(screen.getByText(/50% confident/i)).toBeInTheDocument())
    expect(screen.getByText('Ambiguous request — did you mean X?')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /apply/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('applies patch when Apply clicked from confirmation', async () => {
    const onClose = vi.fn()
    mocks.buildCircuit.mockResolvedValue({
      action: 'patch_circuit',
      ops: [{ op: 'add_gate', type: 'X', qubits: [0] }],
      explanation: 'Added X.',
      confidence: 0.6,
    })
    render(<CommandBar isOpen={true} onClose={onClose} />)

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'something' } })
    fireEvent.submit(screen.getByRole('textbox').closest('form')!)

    await waitFor(() => screen.getByRole('button', { name: /apply/i }))
    fireEvent.click(screen.getByRole('button', { name: /apply/i }))

    expect(mocks.applyPatch).toHaveBeenCalled()
    expect(onClose).toHaveBeenCalled()
  })

  it('shows error message when action is error', async () => {
    mocks.buildCircuit.mockResolvedValue({
      action: 'error',
      ops: [],
      explanation: 'Could not parse the circuit command.',
      confidence: 0.0,
    })
    render(<CommandBar isOpen={true} onClose={vi.fn()} />)

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'gibberish request' } })
    fireEvent.submit(screen.getByRole('textbox').closest('form')!)

    await waitFor(() =>
      expect(screen.getByText('Could not parse the circuit command.')).toBeInTheDocument()
    )
    expect(mocks.applyPatch).not.toHaveBeenCalled()
  })
})
