import React, { useState, useEffect } from 'react'
import { Tutorial, tutorials } from '../data/learningContent'

interface TutorialModalProps {
  isOpen: boolean
  onClose: () => void
  initialTutorialId?: string
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose, initialTutorialId }) => {
  const [selectedId, setSelectedId] = useState<string | null>(initialTutorialId ?? null)
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    if (isOpen) {
      setSelectedId(initialTutorialId ?? null)
      setStepIndex(0)
    }
  }, [isOpen, initialTutorialId])

  if (!isOpen) return null

  const selected = tutorials.find((t) => t.id === selectedId) ?? null

  const handleSelect = (tutorial: Tutorial) => {
    setSelectedId(tutorial.id)
    setStepIndex(0)
  }

  const handleBack = () => {
    if (stepIndex > 0) {
      setStepIndex((i) => i - 1)
    } else {
      setSelectedId(null)
    }
  }

  const handleNext = () => {
    if (selected && stepIndex < selected.steps.length - 1) {
      setStepIndex((i) => i + 1)
    } else {
      onClose()
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Tutorial"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative z-10 bg-panel border border-violet-soft/20 rounded-xl max-w-lg w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <div className="flex items-center gap-2">
            <span className="text-primary text-lg">✦</span>
            <span className="font-heading font-bold text-text-primary">
              {selected ? selected.title : 'Interactive Tutorials'}
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close tutorial"
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {!selected ? (
            /* Tutorial list */
            <div className="space-y-3">
              <p className="text-sm text-text-secondary mb-4">
                Choose a tutorial to get started. Each walks you through a core Cirqit workflow step by step.
              </p>
              {tutorials.map((tutorial) => (
                <button
                  key={tutorial.id}
                  onClick={() => handleSelect(tutorial)}
                  className="w-full text-left bg-bg/50 hover:bg-bg/80 border border-white/8 hover:border-primary/40 rounded-lg p-4 transition-all group"
                >
                  <div className="font-heading font-semibold text-text-primary group-hover:text-primary transition-colors mb-1">
                    {tutorial.title}
                  </div>
                  <div className="text-sm text-text-secondary">{tutorial.description}</div>
                  <div className="text-[10px] text-text-secondary/60 mt-2 font-mono uppercase">
                    {tutorial.steps.length} steps
                  </div>
                </button>
              ))}
            </div>
          ) : (
            /* Step view */
            <>
              {/* Progress bar */}
              <div className="flex gap-1 mb-6">
                {selected.steps.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      i <= stepIndex ? 'bg-primary' : 'bg-white/10'
                    }`}
                  />
                ))}
              </div>

              <div className="mb-1 text-[10px] text-text-secondary font-mono uppercase tracking-wide">
                Step {stepIndex + 1} of {selected.steps.length}
              </div>
              <h4 className="text-base font-heading font-bold text-text-primary mb-3">
                {selected.steps[stepIndex].title}
              </h4>
              <p className="text-sm text-text-secondary leading-relaxed">
                {selected.steps[stepIndex].description}
              </p>

              {selected.steps[stepIndex].hint && (
                <div className="mt-4 bg-primary/10 border border-primary/20 rounded-lg px-4 py-3">
                  <span className="text-[10px] text-primary uppercase font-mono tracking-wide block mb-1">Hint</span>
                  <p className="text-sm text-text-secondary">{selected.steps[stepIndex].hint}</p>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleBack}
                  className="flex-1 py-2.5 rounded-lg border border-white/12 text-text-secondary hover:text-text-primary hover:border-white/20 transition-all text-sm font-medium"
                >
                  {stepIndex === 0 ? 'All Tutorials' : 'Back'}
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 py-2.5 rounded-lg bg-primary text-bg font-heading font-semibold hover:bg-primary/80 transition-all text-sm"
                >
                  {stepIndex === selected.steps.length - 1 ? 'Finish' : 'Next'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
