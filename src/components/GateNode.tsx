import React from 'react'
import { Gate } from '../types/circuit'

interface GateNodeProps {
  data: {
    gate: Gate
  }
}

export const GateNode: React.FC<GateNodeProps> = ({ data }) => {
  const { gate } = data

  return (
    <div className="px-4 py-2 bg-glass border-2 border-accent/60 text-text-primary font-mono font-bold rounded-lg shadow-[0_0_12px_rgba(180,142,255,0.3)] backdrop-blur-sm">
      {gate.type}
    </div>
  )
}
