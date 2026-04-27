import { useState, useEffect } from 'react'
import { GatePalette } from './components/GatePalette'
import { CircuitCanvasWrapper } from './components/CircuitCanvas'
import { StateInspector } from './components/StateInspector'
import { ExportButton } from './components/ExportButton'
import { CommandBar } from './components/CommandBar'

function App() {
  const [commandBarOpen, setCommandBarOpen] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandBarOpen(true)
      }
      if (e.key === 'Escape') {
        setCommandBarOpen(false)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  return (
    <div className="h-screen flex flex-col bg-bg overflow-hidden">
      <header className="h-14 flex-shrink-0 bg-panel border-b border-violet-soft/20 flex items-center px-6 gap-4 z-10">
        <span className="font-heading font-bold text-text-primary text-lg tracking-tight">
          Cirqit
        </span>
        <span className="text-text-secondary text-xs font-body">
          Quantum, made visible.
        </span>
        <button
          onClick={() => setCommandBarOpen(true)}
          className="text-xs text-text-secondary border border-violet-soft/25 rounded px-2.5 py-1 hover:border-accent/50 hover:text-accent transition-colors font-mono"
          title="Open command bar (⌘K)"
        >
          ⌘K
        </button>
        <div className="ml-auto">
          <ExportButton />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <GatePalette />
        <CircuitCanvasWrapper />
        <StateInspector />
      </div>

      <CommandBar isOpen={commandBarOpen} onClose={() => setCommandBarOpen(false)} />
    </div>
  )
}

export default App
