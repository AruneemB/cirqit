import React, { useEffect, useState } from 'react'
import { Observable, PauliTerm, PauliString } from '../types/observable'

interface ObservableBuilderProps {
  numQubits: number
  observable: Observable
  onChange: (observable: Observable) => void
}

export const ObservableBuilder: React.FC<ObservableBuilderProps> = ({
  numQubits,
  observable,
  onChange,
}) => {
  const [newTerm, setNewTerm] = useState<PauliTerm>({
    coefficient: 1.0,
    paulis: Array(numQubits).fill('I'),
  })

  useEffect(() => {
    setNewTerm((prev) => ({
      coefficient: prev.coefficient,
      paulis: Array(numQubits).fill('I'),
    }))
  }, [numQubits])

  const addTerm = () => {
    onChange({
      ...observable,
      terms: [...observable.terms, { ...newTerm }],
    })
    setNewTerm({
      coefficient: 1.0,
      paulis: Array(numQubits).fill('I'),
    })
  }

  const removeTerm = (index: number) => {
    onChange({
      ...observable,
      terms: observable.terms.filter((_, i) => i !== index),
    })
  }

  const updateTermCoefficient = (index: number, coeff: number) => {
    const newTerms = [...observable.terms]
    newTerms[index] = { ...newTerms[index], coefficient: coeff }
    onChange({ ...observable, terms: newTerms })
  }

  const formatTerm = (term: PauliTerm): string => {
    const pauliStr = term.paulis
      .map((p, i) => (p === 'I' ? '' : `${p}${i}`))
      .filter((s) => s)
      .join(' ⊗ ')
    return pauliStr || 'I'
  }

  return (
    <div className="bg-surface/40 backdrop-blur-xl border border-white/8 rounded-lg p-4">
      <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">
        Observable (Hamiltonian)
      </h3>

      {/* Existing terms */}
      <div className="space-y-2 mb-4">
        {observable.terms.length === 0 ? (
          <div className="text-text-secondary text-sm">No terms yet. Add terms below.</div>
        ) : (
          observable.terms.map((term, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 bg-bg/50 rounded-lg p-3 border border-white/8"
            >
              <input
                type="number"
                step="0.1"
                value={term.coefficient}
                onChange={(e) => {
                  const v = parseFloat(e.target.value)
                  updateTermCoefficient(idx, Number.isNaN(v) ? 0 : v)
                }}
                className="w-20 px-2 py-1 bg-surface border border-white/8 rounded text-text-primary text-sm"
              />
              <span className="text-text-secondary">×</span>
              <div className="flex-1 font-mono text-sm text-text-primary">
                {formatTerm(term)}
              </div>
              <button
                onClick={() => removeTerm(idx)}
                className="text-error hover:text-error/80 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add new term */}
      <div className="border-t border-white/8 pt-4">
        <div className="text-sm font-semibold text-text-secondary mb-2">Add Term</div>

        <div className="flex items-center gap-3 mb-3">
          <input
            type="number"
            step="0.1"
            value={newTerm.coefficient}
            onChange={(e) => {
              const v = parseFloat(e.target.value)
              setNewTerm({ ...newTerm, coefficient: Number.isNaN(v) ? 0 : v })
            }}
            className="w-20 px-2 py-1 bg-surface border border-white/8 rounded text-text-primary text-sm"
            placeholder="Coeff"
          />
          <span className="text-text-secondary">×</span>

          <div className="flex gap-1">
            {newTerm.paulis.map((pauli, qIdx) => (
              <select
                key={qIdx}
                value={pauli}
                onChange={(e) => {
                  const newPaulis = [...newTerm.paulis]
                  newPaulis[qIdx] = e.target.value as PauliString
                  setNewTerm({ ...newTerm, paulis: newPaulis })
                }}
                className="px-2 py-1 bg-surface border border-white/8 rounded text-text-primary text-sm font-mono"
              >
                <option value="I">I{qIdx}</option>
                <option value="X">X{qIdx}</option>
                <option value="Y">Y{qIdx}</option>
                <option value="Z">Z{qIdx}</option>
              </select>
            ))}
          </div>
        </div>

        <button
          onClick={addTerm}
          className="w-full px-4 py-2 bg-primary text-bg font-heading font-semibold rounded-lg hover:bg-primary/80 transition-colors"
        >
          Add Term
        </button>
      </div>

      {/* Preview */}
      <div className="mt-4 pt-4 border-t border-white/8">
        <div className="text-xs text-text-secondary mb-1">Observable Expression:</div>
        <div className="font-mono text-sm text-primary">
          {observable.terms.length === 0
            ? '0'
            : observable.terms
                .map((t) => `${t.coefficient >= 0 ? '+' : ''}${t.coefficient} ${formatTerm(t)}`)
                .join(' ')}
        </div>
      </div>
    </div>
  )
}
