import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GatePalette } from '../components/GatePalette'

describe('GatePalette', () => {
  it('renders all gate categories', () => {
    render(<GatePalette />)
    expect(screen.getByText('Single-Qubit')).toBeInTheDocument()
    expect(screen.getByText('Parameterized')).toBeInTheDocument()
    expect(screen.getByText('Two-Qubit')).toBeInTheDocument()
  })

  it('renders Hadamard gate', () => {
    render(<GatePalette />)
    // The label "H" appears twice (label and type), so let's check for the button by title
    const hGate = screen.getByTitle('Hadamard gate')
    expect(hGate).toBeInTheDocument()
    expect(hGate).toHaveTextContent('H')
  })

  it('renders all 12 gates', () => {
    render(<GatePalette />)
    const gateButtons = screen.getAllByRole('generic').filter(
      (el) => el.getAttribute('draggable') === 'true'
    )
    expect(gateButtons).toHaveLength(12)
  })

  it('makes gates draggable', () => {
    render(<GatePalette />)
    const hGate = screen.getByTitle('Hadamard gate')
    expect(hGate).toHaveAttribute('draggable', 'true')
  })
})
