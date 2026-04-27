import React, { useState, useRef } from 'react'
import { Gate } from '../types/circuit'
import { explainGate, ExplanationResponse } from '../services/api'

interface GateNodeProps {
  data: {
    gate: Gate
  }
}

export const GateNode: React.FC<GateNodeProps> = ({ data }) => {
  const { gate } = data
  const [explanation, setExplanation] = useState<ExplanationResponse | null>(null)
  const [showTooltip, setShowTooltip] = useState(false)
  const [loading, setLoading] = useState(false)
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleMouseEnter = () => {
    setShowTooltip(true)
    if (!explanation) {
      hoverTimer.current = setTimeout(async () => {
        setLoading(true)
        try {
          const result = await explainGate(gate.type)
          setExplanation(result)
        } catch (error) {
          console.error('Failed to fetch explanation:', error)
        } finally {
          setLoading(false)
        }
      }, 300)
    }
  }

  const handleMouseLeave = () => {
    setShowTooltip(false)
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current)
      hoverTimer.current = null
    }
  }

  return (
    <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <div className="px-4 py-2 bg-glass border-2 border-accent/60 text-text-primary font-mono font-bold rounded-lg shadow-[0_0_12px_rgba(180,142,255,0.3)] backdrop-blur-sm">
        {gate.type}
      </div>

      {showTooltip && (
        <div
          className="absolute z-50 mt-2 p-3 bg-panel backdrop-blur-xl border border-accent/50 rounded-lg shadow-xl max-w-xs text-sm text-text-primary"
          style={{ top: '100%', left: '0', minWidth: '220px' }}
        >
          {loading && !explanation ? (
            <div className="space-y-2 animate-pulse">
              <div className="h-2.5 bg-accent/20 rounded w-full" />
              <div className="h-2.5 bg-accent/20 rounded w-5/6" />
              <div className="h-2.5 bg-accent/20 rounded w-4/6" />
            </div>
          ) : explanation ? (
            <>
              <p className="leading-relaxed">{explanation.explanation}</p>
              {explanation.cached && (
                <p className="text-xs text-text-secondary mt-2">⚡ Cached response</p>
              )}
            </>
          ) : null}
        </div>
      )}
    </div>
  )
}
