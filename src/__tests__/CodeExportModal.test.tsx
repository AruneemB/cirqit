import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CodeExportModal } from '../components/CodeExportModal'
import { useCircuitStore } from '../store/circuitStore'

vi.mock('../services/api', () => ({
  exportQiskitCode: vi.fn(),
}))

// react-syntax-highlighter renders pre/code elements that aren't needed in unit tests
vi.mock('react-syntax-highlighter', () => ({
  Prism: ({ children }: { children: string }) => <pre>{children}</pre>,
}))
vi.mock('react-syntax-highlighter/dist/esm/styles/prism', () => ({
  vscDarkPlus: {},
}))

import * as api from '../services/api'

describe('CodeExportModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useCircuitStore.getState().clearCircuit()
  })

  it('does not render when closed', () => {
    render(<CodeExportModal isOpen={false} onClose={() => {}} />)
    expect(screen.queryByText('Export Qiskit Code')).not.toBeInTheDocument()
  })

  it('fetches and displays code when opened', async () => {
    vi.mocked(api.exportQiskitCode).mockResolvedValue({
      code: 'qc = QuantumCircuit(2)\nqc.h(0)',
      language: 'python',
      framework: 'qiskit',
    })

    render(<CodeExportModal isOpen={true} onClose={() => {}} />)

    await waitFor(() => {
      expect(screen.getByText(/qc = QuantumCircuit/)).toBeInTheDocument()
    })
  })

  it('shows copy button after code loads', async () => {
    vi.mocked(api.exportQiskitCode).mockResolvedValue({
      code: 'test code',
      language: 'python',
      framework: 'qiskit',
    })

    render(<CodeExportModal isOpen={true} onClose={() => {}} />)

    await waitFor(() => {
      expect(screen.getByText('Copy')).toBeInTheDocument()
    })
  })

  it('close button calls onClose', async () => {
    vi.mocked(api.exportQiskitCode).mockResolvedValue({
      code: 'test code',
      language: 'python',
      framework: 'qiskit',
    })

    const onClose = vi.fn()
    render(<CodeExportModal isOpen={true} onClose={onClose} />)

    fireEvent.click(screen.getByLabelText('Close'))
    expect(onClose).toHaveBeenCalledOnce()
  })
})
