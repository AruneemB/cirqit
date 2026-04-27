import React from 'react'
import { useCircuitStore } from '../store/circuitStore'
import { BlochSphere } from './BlochSphere'
import { AmplitudeChart } from './AmplitudeChart'
import { ProbabilityHistogram } from './ProbabilityHistogram'

export const StateInspector: React.FC = () => {
  const executionResult = useCircuitStore((state) => state.executionResult)
  const circuit = useCircuitStore((state) => state.circuit)

  if (!executionResult?.statevector) {
    return (
      <div data-testid="state-inspector" className="w-96 h-full bg-panel backdrop-blur-xl border-l border-violet-soft/20 p-6 flex items-center justify-center">
        <div className="text-center text-text-secondary">
          <svg
            className="w-16 h-16 mx-auto mb-4 opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
            />
          </svg>
          <p className="text-lg font-heading">No Results Yet</p>
          <p className="text-sm mt-2">Execute a circuit to see the quantum state</p>
        </div>
      </div>
    )
  }

  const { statevector } = executionResult
  const numQubits = circuit.numQubits

  return (
    <div data-testid="state-inspector" className="w-96 h-full bg-panel backdrop-blur-xl border-l border-violet-soft/20 overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-heading font-bold text-text-primary mb-1">
            State Inspector
          </h2>
          <p className="text-sm text-text-secondary">
            {numQubits} qubit{numQubits !== 1 ? 's' : ''} • {statevector.length} basis states
          </p>
        </div>

        {/* Bloch Sphere (only for 1-qubit circuits) */}
        {numQubits === 1 && (
          <div>
            <h3 className="text-sm font-heading font-semibold text-text-secondary mb-3 uppercase tracking-wide">
              Bloch Sphere
            </h3>
            <BlochSphere statevector={statevector} />
          </div>
        )}

        {/* Probability Histogram */}
        <div>
          <h3 className="text-sm font-heading font-semibold text-text-secondary mb-3 uppercase tracking-wide">
            Probabilities
          </h3>
          <ProbabilityHistogram statevector={statevector} />
        </div>

        {/* Amplitude Chart */}
        <div>
          <h3 className="text-sm font-heading font-semibold text-text-secondary mb-3 uppercase tracking-wide">
            Amplitudes
          </h3>
          <AmplitudeChart statevector={statevector} />
        </div>

        {/* Raw Statevector */}
        <div>
          <h3 className="text-sm font-heading font-semibold text-text-secondary mb-3 uppercase tracking-wide">
            Raw Statevector
          </h3>
          <div className="bg-bg/30 rounded-lg p-4 font-mono text-xs max-h-64 overflow-y-auto border border-violet-soft/10">
            {statevector.map((amp, idx) => {
              const basisState = idx.toString(2).padStart(numQubits, '0')
              const real = amp[0].toFixed(4)
              const imag = amp[1].toFixed(4)
              const sign = amp[1] >= 0 ? '+' : '-'
              return (
                <div key={idx} className="text-text-secondary mb-1">
                  |{basisState}⟩: {real} {sign} {Math.abs(parseFloat(imag))}i
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
