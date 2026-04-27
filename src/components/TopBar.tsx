import React from 'react'
import { useCircuitStore } from '../store/circuitStore'
import { ExportButton } from './ExportButton'

interface TopBarProps {
  onCommandBarOpen: () => void
}

export const TopBar: React.FC<TopBarProps> = ({ onCommandBarOpen }) => {
  const clearCircuit = useCircuitStore((state) => state.clearCircuit)

  return (
    <header className="h-14 flex-shrink-0 bg-panel border-b border-violet-soft/20 flex items-center px-6 gap-4 z-10">
      <span className="font-heading font-bold text-text-primary text-lg tracking-tight">
        Cirqit
      </span>
      <span className="text-text-secondary text-xs font-body">
        Quantum, made visible.
      </span>
      <button
        onClick={onCommandBarOpen}
        className="text-xs text-text-secondary border border-violet-soft/25 rounded px-2.5 py-1 hover:border-accent/50 hover:text-accent transition-colors font-mono"
        title="Open command bar (⌘K)"
      >
        ⌘K
      </button>
      <div className="ml-auto flex items-center gap-3">
        <button
          onClick={clearCircuit}
          className="px-4 py-1.5 text-text-secondary hover:text-text-primary text-sm font-medium transition-colors"
        >
          Clear
        </button>
        <ExportButton />
      </div>
    </header>
  )
}
