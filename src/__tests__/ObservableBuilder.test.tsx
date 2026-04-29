import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ObservableBuilder } from '../components/ObservableBuilder'
import { Observable } from '../types/observable'

describe('ObservableBuilder', () => {
  const mockObservable: Observable = {
    name: 'H',
    terms: [],
  }

  it('renders empty state', () => {
    const onChange = vi.fn()
    render(<ObservableBuilder numQubits={2} observable={mockObservable} onChange={onChange} />)

    expect(screen.getByText('Observable (Hamiltonian)')).toBeInTheDocument()
    expect(screen.getByText('No terms yet. Add terms below.')).toBeInTheDocument()
  })

  it('adds a new term', () => {
    const onChange = vi.fn()
    render(<ObservableBuilder numQubits={2} observable={mockObservable} onChange={onChange} />)

    fireEvent.click(screen.getByRole('button', { name: 'Add Term' }))

    expect(onChange).toHaveBeenCalledWith({
      name: 'H',
      terms: [{ coefficient: 1.0, paulis: ['I', 'I'] }],
    })
  })

  it('displays existing terms', () => {
    const observable: Observable = {
      name: 'H',
      terms: [
        { coefficient: 1.5, paulis: ['Z', 'Z'] },
        { coefficient: -0.5, paulis: ['X', 'X'] },
      ],
    }

    render(<ObservableBuilder numQubits={2} observable={observable} onChange={vi.fn()} />)

    expect(screen.getAllByText(/Z0 ⊗ Z1/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/X0 ⊗ X1/).length).toBeGreaterThan(0)
  })
})
