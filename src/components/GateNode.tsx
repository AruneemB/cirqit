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
    <div className="px-4 py-2 bg-primary text-bg font-mono font-bold rounded-lg border-2 border-primary shadow-lg">
      {gate.type}
    </div>
  )
}
