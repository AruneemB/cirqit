import React, { useState } from 'react'
import { useCircuitStore } from '../store/circuitStore'
import { ExportButton } from './ExportButton'
import { TutorialModal } from './TutorialModal'

interface TopBarProps {
  onCommandBarOpen: () => void
}

export const TopBar: React.FC<TopBarProps> = ({ onCommandBarOpen }) => {
  const clearCircuit = useCircuitStore((state) => state.clearCircuit)
  const learningMode = useCircuitStore((state) => state.learningMode)
  const toggleLearningMode = useCircuitStore((state) => state.toggleLearningMode)
  const [tutorialOpen, setTutorialOpen] = useState(false)

  return (
    <>
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
          {/* Learning Mode Toggle */}
          <button
            onClick={toggleLearningMode}
            aria-pressed={learningMode}
            title={learningMode ? 'Disable Learning Mode' : 'Enable Learning Mode'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              learningMode
                ? 'bg-primary/20 border-primary/50 text-primary'
                : 'bg-transparent border-violet-soft/25 text-text-secondary hover:border-primary/30 hover:text-text-primary'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            Learn
          </button>

          {/* Tutorial Button */}
          {learningMode && (
            <button
              onClick={() => setTutorialOpen(true)}
              title="Open tutorials"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-transparent border border-violet-soft/25 text-text-secondary hover:border-primary/30 hover:text-text-primary transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              Tutorials
            </button>
          )}

          <button
            onClick={clearCircuit}
            className="px-4 py-1.5 text-text-secondary hover:text-text-primary text-sm font-medium transition-colors"
          >
            Clear
          </button>
          <ExportButton />
        </div>
      </header>

      <TutorialModal isOpen={learningMode && tutorialOpen} onClose={() => setTutorialOpen(false)} />
    </>
  )
}
