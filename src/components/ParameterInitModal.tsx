import React, { useState } from 'react'
import { InitStrategy, STRATEGY_LABELS, initializeParameters } from '../utils/parameterInitialization'

interface ParameterInitModalProps {
  parameterNames: string[]
  onApply: (values: Record<string, number>) => void
  onClose: () => void
}

export const ParameterInitModal: React.FC<ParameterInitModalProps> = ({
  parameterNames,
  onApply,
  onClose,
}) => {
  const [strategy, setStrategy] = useState<InitStrategy>('random_uniform')
  const [useSeed, setUseSeed] = useState(false)
  const [seedInput, setSeedInput] = useState('42')

  const parsedSeed = Number(seedInput)
  const hasValidSeed = Number.isInteger(parsedSeed) && parsedSeed >= 0

  const handleApply = () => {
    const values = initializeParameters(parameterNames, {
      strategy,
      seed: useSeed ? parsedSeed : undefined,
      fanIn: parameterNames.length,
      fanOut: parameterNames.length,
    })
    onApply(values)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-surface border border-white/8 rounded-xl p-6 w-full max-w-sm shadow-xl">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-heading font-semibold text-text-primary">
            Initialize Parameters
          </h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-text-secondary uppercase font-mono">Strategy</label>
            <select
              value={strategy}
              onChange={(e) => setStrategy(e.target.value as InitStrategy)}
              className="bg-bg/50 border border-white/8 rounded px-3 py-2 text-sm text-text-primary focus:border-primary/50 outline-none"
            >
              {(Object.keys(STRATEGY_LABELS) as InitStrategy[]).map((s) => (
                <option key={s} value={s}>
                  {STRATEGY_LABELS[s]}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="use-seed"
              type="checkbox"
              checked={useSeed}
              onChange={(e) => setUseSeed(e.target.checked)}
              className="accent-primary"
            />
            <label htmlFor="use-seed" className="text-sm text-text-secondary cursor-pointer">
              Use fixed seed (reproducible)
            </label>
          </div>

          {useSeed && (
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-text-secondary uppercase font-mono">Seed</label>
              <input
                type="number"
                value={seedInput}
                onChange={(e) => setSeedInput(e.target.value)}
                className={`bg-bg/50 border rounded px-3 py-2 text-sm text-text-primary focus:border-primary/50 outline-none ${
                  hasValidSeed ? 'border-white/8' : 'border-error/60'
                }`}
              />
              {!hasValidSeed && (
                <span className="text-[10px] text-error font-mono">Must be a non-negative integer</span>
              )}
            </div>
          )}

          <div className="text-xs text-text-secondary bg-bg/40 rounded-lg px-3 py-2 border border-white/8 font-mono">
            {parameterNames.length === 0
              ? 'No trainable parameters defined'
              : `Will initialize: ${parameterNames.join(', ')}`}
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-white/8 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={parameterNames.length === 0 || (useSeed && !hasValidSeed)}
            className="flex-1 py-2 rounded-lg bg-primary text-bg text-sm font-heading font-semibold hover:bg-primary/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}
