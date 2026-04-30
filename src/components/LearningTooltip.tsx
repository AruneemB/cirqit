import React, { useState } from 'react'
import { LearningEntry } from '../data/learningContent'

interface LearningTooltipProps {
  entry: LearningEntry
  children?: React.ReactNode
}

export const LearningTooltip: React.FC<LearningTooltipProps> = ({ entry, children }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <span className="inline-flex items-center gap-1">
        {children}
        <button
          onClick={() => setIsOpen(true)}
          aria-label={`Learn about ${entry.title}`}
          className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary/20 text-primary text-[10px] font-bold hover:bg-primary/40 transition-colors cursor-pointer flex-shrink-0"
        >
          i
        </button>
      </span>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={entry.title}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative z-10 bg-panel border border-violet-soft/20 rounded-xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-base font-heading font-bold text-text-primary">{entry.title}</h3>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close"
                className="text-text-secondary hover:text-text-primary transition-colors ml-4 flex-shrink-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-sm text-text-secondary leading-relaxed mb-3">{entry.body}</p>

            {entry.formula && (
              <div className="bg-bg/60 border border-white/8 rounded-lg px-4 py-2 mb-3">
                <span className="text-xs text-text-secondary uppercase font-mono tracking-wide block mb-1">Formula</span>
                <code className="text-sm text-primary font-mono">{entry.formula}</code>
              </div>
            )}

            {entry.example && (
              <div className="bg-bg/60 border border-white/8 rounded-lg px-4 py-2">
                <span className="text-xs text-text-secondary uppercase font-mono tracking-wide block mb-1">Example</span>
                <p className="text-sm text-text-secondary">{entry.example}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
