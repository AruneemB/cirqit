import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ObservablePresetModal } from '../components/ObservablePresetModal'
import { ObservableBuilder } from '../components/ObservableBuilder'
import {
  observablePresets,
  CATEGORY_LABELS,
} from '../data/observablePresets'
import { Observable } from '../types/observable'

// ── Data integrity ────────────────────────────────────────────────────────

describe('observablePresets data', () => {
  it('every preset has at least one term', () => {
    observablePresets.forEach((p) => {
      expect(p.observable.terms.length).toBeGreaterThan(0)
    })
  })

  it('every term paulis array length matches numQubits', () => {
    observablePresets.forEach((p) => {
      p.observable.terms.forEach((term) => {
        expect(term.paulis).toHaveLength(p.numQubits)
      })
    })
  })

  it('every term paulis contains only valid Pauli characters', () => {
    const valid = new Set(['I', 'X', 'Y', 'Z'])
    observablePresets.forEach((p) => {
      p.observable.terms.forEach((term) => {
        term.paulis.forEach((pauli) => {
          expect(valid.has(pauli)).toBe(true)
        })
      })
    })
  })

  it('contains H₂ equilibrium preset', () => {
    const h2 = observablePresets.find((p) => p.id === 'h2_equilibrium')
    expect(h2).toBeDefined()
    expect(h2!.numQubits).toBe(2)
    expect(h2!.category).toBe('quantum_chemistry')
  })

  it('contains LiH preset', () => {
    const lih = observablePresets.find((p) => p.id === 'lih_simplified')
    expect(lih).toBeDefined()
    expect(lih!.numQubits).toBe(4)
  })

  it('contains MaxCut preset', () => {
    const mc = observablePresets.find((p) => p.id === 'maxcut_3node')
    expect(mc).toBeDefined()
    expect(mc!.category).toBe('optimization')
  })

  it('contains Ising preset', () => {
    const ising = observablePresets.find((p) => p.id === 'ising_2q')
    expect(ising).toBeDefined()
    expect(ising!.category).toBe('condensed_matter')
  })

  it('CATEGORY_LABELS covers all categories used in presets', () => {
    observablePresets.forEach((p) => {
      expect(CATEGORY_LABELS[p.category]).toBeDefined()
    })
  })
})

// ── ObservablePresetModal ─────────────────────────────────────────────────

describe('ObservablePresetModal', () => {
  it('does not render when closed', () => {
    render(<ObservablePresetModal isOpen={false} onClose={vi.fn()} onSelect={vi.fn()} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders preset list when open', () => {
    render(<ObservablePresetModal isOpen onClose={vi.fn()} onSelect={vi.fn()} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByLabelText('Search presets')).toBeInTheDocument()
  })

  it('shows all presets by default', () => {
    render(<ObservablePresetModal isOpen onClose={vi.fn()} onSelect={vi.fn()} />)
    observablePresets.forEach((p) => {
      expect(screen.getByText(p.name)).toBeInTheDocument()
    })
  })

  it('filters by search query', () => {
    render(<ObservablePresetModal isOpen onClose={vi.fn()} onSelect={vi.fn()} />)
    fireEvent.change(screen.getByLabelText('Search presets'), { target: { value: 'H₂' } })
    expect(screen.getByText('H₂ (equilibrium, 0.735 Å)')).toBeInTheDocument()
    expect(screen.queryByText('MaxCut — 3-node complete graph')).not.toBeInTheDocument()
  })

  it('shows empty state when search finds nothing', () => {
    render(<ObservablePresetModal isOpen onClose={vi.fn()} onSelect={vi.fn()} />)
    fireEvent.change(screen.getByLabelText('Search presets'), { target: { value: 'xyznotapreset' } })
    expect(screen.getByText('No presets match your search.')).toBeInTheDocument()
  })

  it('filters by category', () => {
    render(<ObservablePresetModal isOpen onClose={vi.fn()} onSelect={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Optimization' }))
    const optimizationPresets = observablePresets.filter((p) => p.category === 'optimization')
    const otherPresets = observablePresets.filter((p) => p.category !== 'optimization')
    optimizationPresets.forEach((p) => expect(screen.getByText(p.name)).toBeInTheDocument())
    otherPresets.forEach((p) => expect(screen.queryByText(p.name)).not.toBeInTheDocument())
  })

  it('calls onSelect with preset observable when Load is clicked', () => {
    const onSelect = vi.fn()
    render(<ObservablePresetModal isOpen onClose={vi.fn()} onSelect={onSelect} />)
    const h2 = observablePresets.find((p) => p.id === 'h2_equilibrium')!
    const loadButtons = screen.getAllByText('Load')
    fireEvent.click(loadButtons[0])
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ name: h2.observable.name }))
  })

  it('calls onClose after selecting a preset', () => {
    const onClose = vi.fn()
    render(<ObservablePresetModal isOpen onClose={onClose} onSelect={vi.fn()} />)
    fireEvent.click(screen.getAllByText('Load')[0])
    expect(onClose).toHaveBeenCalled()
  })

  it('dims incompatible presets when numQubits is provided', () => {
    render(<ObservablePresetModal isOpen onClose={vi.fn()} onSelect={vi.fn()} numQubits={2} />)
    const incompatible = observablePresets.filter((p) => p.numQubits !== 2)
    incompatible.forEach((p) => {
      const el = screen.getByText(p.name).closest('[aria-disabled="true"]')
      expect(el).toBeInTheDocument()
    })
  })

  it('closes on backdrop click', () => {
    const onClose = vi.fn()
    render(<ObservablePresetModal isOpen onClose={onClose} onSelect={vi.fn()} />)
    fireEvent.click(screen.getByRole('dialog'))
    expect(onClose).toHaveBeenCalled()
  })

  it('closes on close button click', () => {
    const onClose = vi.fn()
    render(<ObservablePresetModal isOpen onClose={onClose} onSelect={vi.fn()} />)
    fireEvent.click(screen.getByLabelText('Close'))
    expect(onClose).toHaveBeenCalled()
  })
})

// ── ObservableBuilder integration ─────────────────────────────────────────

describe('ObservableBuilder preset integration', () => {
  const emptyObservable: Observable = { name: 'H', terms: [] }

  it('renders Load Preset button', () => {
    render(<ObservableBuilder numQubits={2} observable={emptyObservable} onChange={vi.fn()} />)
    expect(screen.getByText('Load Preset')).toBeInTheDocument()
  })

  it('opens preset modal on Load Preset click', () => {
    render(<ObservableBuilder numQubits={2} observable={emptyObservable} onChange={vi.fn()} />)
    fireEvent.click(screen.getByText('Load Preset'))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('calls onChange with selected preset observable', () => {
    const onChange = vi.fn()
    render(<ObservableBuilder numQubits={2} observable={emptyObservable} onChange={onChange} />)
    fireEvent.click(screen.getByText('Load Preset'))
    fireEvent.click(screen.getAllByText('Load')[0])
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ terms: expect.any(Array) })
    )
  })

  it('preserves observable name when loading preset', () => {
    const onChange = vi.fn()
    render(<ObservableBuilder numQubits={2} observable={emptyObservable} onChange={onChange} />)
    fireEvent.click(screen.getByText('Load Preset'))
    fireEvent.click(screen.getAllByText('Load')[0])
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ name: 'H' }))
  })
})
