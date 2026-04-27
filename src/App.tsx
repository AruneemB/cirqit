import { useState, useEffect } from 'react'
import { GatePalette } from './components/GatePalette'
import { CircuitCanvasWrapper } from './components/CircuitCanvas'
import { StateInspector } from './components/StateInspector'
import { TopBar } from './components/TopBar'
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
      <TopBar onCommandBarOpen={() => setCommandBarOpen(true)} />

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
