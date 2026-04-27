import { GatePalette } from './components/GatePalette'
import { CircuitCanvasWrapper } from './components/CircuitCanvas'
import { StateInspector } from './components/StateInspector'
import { ExportButton } from './components/ExportButton'

function App() {
  return (
    <div className="h-screen flex flex-col bg-bg overflow-hidden">
      <header className="h-14 flex-shrink-0 bg-panel border-b border-violet-soft/20 flex items-center px-6 gap-4 z-10">
        <span className="font-heading font-bold text-text-primary text-lg tracking-tight">
          Cirqit
        </span>
        <span className="text-text-secondary text-xs font-body">
          Quantum, made visible.
        </span>
        <div className="ml-auto">
          <ExportButton />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <GatePalette />
        <CircuitCanvasWrapper />
        <StateInspector />
      </div>
    </div>
  )
}

export default App
