import React, { useState, useMemo } from 'react'
import { Observable } from '../types/observable'
import {
  observablePresets,
  ObservablePreset,
  PresetCategory,
  CATEGORY_LABELS,
} from '../data/observablePresets'

interface ObservablePresetModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (observable: Observable) => void
  numQubits?: number
}

export const ObservablePresetModal: React.FC<ObservablePresetModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  numQubits,
}) => {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<PresetCategory | 'all'>('all')

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    return observablePresets.filter((p) => {
      const matchesCategory = activeCategory === 'all' || p.category === activeCategory
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      return matchesCategory && matchesQuery
    })
  }, [query, activeCategory])

  const compatible = (preset: ObservablePreset) =>
    numQubits == null || preset.numQubits === numQubits

  if (!isOpen) return null

  const handleSelect = (preset: ObservablePreset) => {
    onSelect(preset.observable)
    onClose()
  }

  const categories: Array<PresetCategory | 'all'> = [
    'all',
    'quantum_chemistry',
    'optimization',
    'condensed_matter',
  ]

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Observable Preset Library"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative z-10 bg-panel border border-violet-soft/20 rounded-xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8 flex-shrink-0">
          <span className="font-heading font-bold text-text-primary">Observable Preset Library</span>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search + filter */}
        <div className="px-6 py-3 border-b border-white/8 flex-shrink-0 space-y-3">
          <input
            type="text"
            placeholder="Search presets…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search presets"
            className="w-full bg-bg/60 border border-white/8 rounded-lg px-4 py-2 text-sm text-text-primary placeholder-text-secondary/50 focus:border-primary/40 outline-none transition-colors"
          />
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                  activeCategory === cat
                    ? 'bg-primary/20 border-primary/50 text-primary'
                    : 'bg-transparent border-white/12 text-text-secondary hover:border-primary/30 hover:text-text-primary'
                }`}
              >
                {cat === 'all' ? 'All' : CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
          {numQubits != null && (
            <p className="text-[10px] text-text-secondary font-mono">
              Circuit has {numQubits} qubit{numQubits !== 1 ? 's' : ''} — incompatible presets are dimmed.
            </p>
          )}
        </div>

        {/* Preset list */}
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-3">
          {filtered.length === 0 ? (
            <p className="text-sm text-text-secondary text-center py-8">No presets match your search.</p>
          ) : (
            filtered.map((preset) => {
              const isCompatible = compatible(preset)
              return (
                <div
                  key={preset.id}
                  className={`rounded-lg border p-4 transition-all ${
                    isCompatible
                      ? 'border-white/8 hover:border-primary/40 bg-bg/50 cursor-pointer'
                      : 'border-white/4 bg-bg/20 opacity-50 cursor-not-allowed'
                  }`}
                  onClick={() => isCompatible && handleSelect(preset)}
                  role={isCompatible ? 'button' : undefined}
                  aria-disabled={!isCompatible}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-heading font-semibold text-sm text-text-primary">
                          {preset.name}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-mono uppercase">
                          {CATEGORY_LABELS[preset.category]}
                        </span>
                        <span className="text-[10px] text-text-secondary font-mono">
                          {preset.numQubits}q · {preset.observable.terms.length} terms
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed">{preset.description}</p>
                      {preset.citation && (
                        <p className="text-[10px] text-text-secondary/60 mt-1 italic">{preset.citation}</p>
                      )}
                    </div>
                    {isCompatible && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleSelect(preset) }}
                        className="flex-shrink-0 px-3 py-1.5 text-xs font-medium bg-primary text-bg rounded-lg hover:bg-primary/80 transition-colors"
                      >
                        Load
                      </button>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
