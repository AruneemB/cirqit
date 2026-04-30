import React, { useState, useRef, useEffect } from 'react'
import { useCircuitStore } from '../store/circuitStore'
import { buildCircuitFromNL } from '../services/api'
import { applyPatch } from '../services/circuitPatch'
import { CircuitPatch } from '../types/circuit'

interface CommandBarProps {
  isOpen: boolean
  onClose: () => void
}

export const CommandBar: React.FC<CommandBarProps> = ({ isOpen, onClose }) => {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [pending, setPending] = useState<CircuitPatch | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const circuit = useCircuitStore((state) => state.circuit)

  useEffect(() => {
    if (isOpen) {
      setText('')
      setPending(null)
      setError(null)
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [isOpen])

  const handleClose = () => {
    setPending(null)
    setError(null)
    setText('')
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || loading) return

    setLoading(true)
    setPending(null)
    setError(null)

    try {
      const patch = await buildCircuitFromNL({ text: text.trim(), circuit })

      if (patch.action === 'error') {
        setError(patch.explanation)
        setLoading(false)
        return
      }

      if (patch.confidence >= 0.7) {
        applyPatch(patch)
        handleClose()
      } else {
        setPending(patch)
        setLoading(false)
      }
    } catch (err) {
      setError((err as Error).message)
      setLoading(false)
    }
  }

  const handleApply = () => {
    if (pending) {
      applyPatch(pending)
      handleClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-32"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={handleClose} />

      {/* Panel */}
      <div className="relative w-full max-w-xl mx-4 bg-panel border border-violet-soft/30 rounded-xl shadow-[0_0_40px_rgba(90,49,244,0.35)] overflow-hidden">
        {/* Input row */}
        <form onSubmit={handleSubmit} className="flex items-center gap-3 px-4 py-3">
          <span className="text-accent text-lg flex-shrink-0">⌘</span>
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={loading}
            placeholder='Try "create a Bell state" or "add RY gate to qubit 2"'
            className="flex-1 bg-transparent text-text-primary placeholder-text-secondary/50 text-sm font-body outline-none disabled:opacity-50"
          />
          {loading ? (
            <span className="text-text-secondary text-xs animate-pulse">thinking…</span>
          ) : (
            text.trim() && (
              <button
                type="submit"
                className="text-xs text-accent border border-accent/40 rounded px-2 py-0.5 hover:bg-accent/10 transition-colors"
              >
                Build
              </button>
            )
          )}
        </form>

        {/* Loading shimmer */}
        {loading && (
          <div className="px-4 pb-3">
            <div className="h-2 bg-violet-soft/20 rounded animate-pulse mb-1.5 w-3/4" />
            <div className="h-2 bg-violet-soft/20 rounded animate-pulse w-1/2" />
          </div>
        )}

        {/* Low-confidence confirmation */}
        {pending && !loading && (
          <div className="border-t border-violet-soft/20 px-4 py-3 space-y-2">
            <p className="text-xs text-text-secondary">
              <span className="text-yellow-400 font-mono">{Math.round(pending.confidence * 100)}% confident</span>
              {' — '}review before applying:
            </p>
            <p className="text-sm text-text-primary">{pending.explanation}</p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleApply}
                className="text-xs bg-accent/20 border border-accent/40 text-accent rounded px-3 py-1 hover:bg-accent/30 transition-colors"
              >
                Apply
              </button>
              <button
                onClick={() => { setPending(null); inputRef.current?.focus() }}
                className="text-xs border border-violet-soft/30 text-text-secondary rounded px-3 py-1 hover:border-violet-soft/60 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="border-t border-violet-soft/20 px-4 py-3">
            <p className="text-xs text-red-400/80">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}
