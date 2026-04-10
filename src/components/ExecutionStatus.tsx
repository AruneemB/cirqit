import React from 'react'
import { useCircuitStore } from '../store/circuitStore'

export const ExecutionStatus: React.FC = () => {
  const result = useCircuitStore((state) => state.executionResult)

  return (
    <div className="absolute bottom-4 left-4 bg-surface/80 backdrop-blur-sm border border-white/8 px-4 py-2 rounded-full text-xs text-text-secondary flex items-center gap-2 z-50">
      <div className={`w-2 h-2 rounded-full ${result ? 'bg-success' : 'bg-warning animate-pulse'}`} />
      {result ? `Simulation Ready: ${new Date(result.executedAt).toLocaleTimeString()}` : 'Simulation in progress...'}
    </div>
  )
}
